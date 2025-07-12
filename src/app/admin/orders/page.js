'use client';
import { useEffect, useState } from 'react';
import { Table, Spin, Pagination, message, Button, Modal, Form, Input, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchOrders(); }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setTotal(data.total || data.orders.length);
      } else {
        message.error('Failed to load orders');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({ status: order.status });
    setModalVisible(true);
  };

  const downloadCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
    const rows = orders.map(order => [
      order._id,
      `${order.billingDetails.firstName} ${order.billingDetails.lastName}`,
      order.billingDetails.email,
      order.totalPrice?.toFixed(2),
      order.status,
      moment(order.createdAt).format('YYYY-MM-DD HH:mm')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await fetch(`/api/orders/${editingOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: values.status })
      });
      message.success('Order updated');
      setModalVisible(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    message.success('Order deleted');
    fetchOrders();
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      ellipsis: true
    },
    {
      title: 'Customer',
      render: (_, order) => `${order.billingDetails.firstName} ${order.billingDetails.lastName}`
    },
    { title: 'Email', dataIndex: ['billingDetails', 'email'] },
    { title: 'Total', dataIndex: 'totalPrice', render: val => `$${val?.toFixed(2)}` },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Date', dataIndex: 'createdAt', render: date => moment(date).format('YYYY-MM-DD HH:mm') },
    {
      title: 'Actions',
      render: (_, order) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(order)} />
          <Popconfirm title="Delete this order?" onConfirm={() => handleDelete(order._id)}>
            <Button danger icon={<DeleteOutlined />} className="ml-2" />
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      <Spin spinning={loading}>
        <div className="flex justify-between mb-4">
          <Button onClick={downloadCSV} icon={<PlusOutlined />} type="primary">
            Download CSV
          </Button>
        </div>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={orders}
          pagination={false}
          expandable={{
            expandedRowRender: (order) => (
              <ul className="ml-4 list-disc">
                {order.items.map((item, idx) => (
                  <li key={idx}>{item.title} - ${item.price}</li>
                ))}
              </ul>
            )
          }}
        />
        <div className="flex justify-end mt-4">
          <Pagination
            current={page}
            pageSize={10}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      </Spin>

      <Modal
        title="Edit Order Status"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Input placeholder="e.g., success, pending, canceled" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
