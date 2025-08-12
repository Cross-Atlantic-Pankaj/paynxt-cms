'use client';
import { useEffect, useState, useRef } from 'react';
import { Table, Spin, Pagination, Popconfirm, Button, Tooltip, Space, Modal, Form, Input, message, Checkbox } from 'antd';
import 'antd/dist/reset.css';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';

export default function WebUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/web-users?page=${page}&limit=10`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue(editingUser);
    }
  }, [editingUser, form]);

  // add this effect
  useEffect(() => {
    if (isEditModalVisible && editingUser) {
      form.setFieldsValue(editingUser);
    }
  }, [isEditModalVisible, editingUser, form]);

  // keep your onCancel reset if you like


  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    setFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const handleRefresh = () => {
    setFilters({});
    setSearchText('');
    setSearchedColumn('');
  };

  // Helper to download CSV
  const downloadCSV = (data) => {
    if (!data.length) return;

    // Only keep desired fields
    const fieldsToExport = ['Firstname', 'Lastname', 'email', 'phoneNumber', 'country'];

    const csvRows = [];
    csvRows.push(fieldsToExport.join(',')); // header

    data.forEach(row => {
      const values = fieldsToExport.map(field => {
        const val = row[field];
        const escaped = ('' + (val !== undefined ? val : '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'web_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch(selectedKeys, confirm, dataIndex);
          }}
          style={{ marginBottom: 8, display: 'block', width: 188 }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => { handleReset(clearFilters, dataIndex); setSelectedKeys(['']); }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterDropdownProps: {
      onOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
    filteredValue: filters[dataIndex] || null,
  });

  const handleEditSubmit = async (values) => {
    try {
      await fetch(`/api/web-users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      message.success('User updated');
      setIsEditModalVisible(false);
      fetchUsers(); // Reload the table
    } catch (err) {
      console.error(err);
      message.error('Failed to update user');
    }
  };


  const handleDelete = async (userId) => {
    // if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/web-users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete user');

      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const columns = [
    { title: 'Firstname', dataIndex: 'Firstname', key: 'Firstname', ...getColumnSearchProps('Firstname') },
    { title: 'Lastname', dataIndex: 'Lastname', key: 'Lastname', ...getColumnSearchProps('Lastname') },
    { title: 'Email', dataIndex: 'email', key: 'email', ...getColumnSearchProps('email') },
    { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber', ...getColumnSearchProps('phoneNumber') },
    { title: 'Country', dataIndex: 'country', key: 'country', ...getColumnSearchProps('country') },

    { title: 'Job Title', dataIndex: 'jobTitle', key: 'jobTitle', ...getColumnSearchProps('jobTitle') },
    { title: 'Company', dataIndex: 'companyName', key: 'companyName', ...getColumnSearchProps('companyName') },

    {
      title: 'Newsletter',
      dataIndex: 'newsletter',
      key: 'newsletter',
      render: val => (val ? 'Yes' : 'No')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              shape="square"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingUser(record);
                setIsEditModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                shape="square"
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    }

  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Web Users</h1>
        <div className="flex justify-end gap-4 mb-6">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            type="default"
            size="middle"
          >
            Refresh
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadCSV(users)}
            type="primary"
            size="middle"
          >
            Download CSV
          </Button>
        </div>
      </div>
      <Spin spinning={loading} tip="Loading users...">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          pagination={false}
          filters={filters}
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
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEditSubmit}
          layout="vertical"
        >
          <Form.Item name="Firstname" label="First Name">
            <Input />
          </Form.Item>
          <Form.Item name="Lastname" label="Last Name">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Input />
          </Form.Item>

          {/* New fields from model */}
          <Form.Item name="jobTitle" label="Job Title">
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label="Company Name">
            <Input />
          </Form.Item>

          <Form.Item name="newsletter" label="Subscribed to Newsletter" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>

      </Modal>
    </div>
  );
}
