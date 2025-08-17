'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function StatsManager() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [editStats, setEditStats] = useState(null);
  const [statsForm] = Form.useForm();
  const [statsFilters, setStatsFilters] = useState({ title: null, statText: null, description: null });
  const [statsSearchText, setStatsSearchText] = useState('');
  const [statsSearchedColumn, setStatsSearchedColumn] = useState('');
  const statsSearchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-page/stats');
      const data = await response.json();
      if (data.success) {
        setStats(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleStatsSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editStats && editStats._id) values._id = editStats._id;
      else delete values._id;
      const response = await fetch('/api/home-page/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editStats ? 'Stats item updated successfully!' : 'Stats item added successfully!');
        setStatsModalOpen(false);
        setEditStats(null);
        statsForm.resetFields();
        fetchStats();
      } else {
        message.error(result.message || 'Error adding stats item');
      }
    } catch (error) {
      console.error('Error adding stats item:', error);
      message.error('Error adding stats item');
    }
  };

  const handleDeleteStats = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/home-page/stats?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Stats item deleted successfully!');
        fetchStats();
      } else {
        message.error(result.message || 'Error deleting stats item');
      }
    } catch (error) {
      console.error('Error deleting stats item:', error);
      message.error('Error deleting stats item');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={statsSearchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
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
          onClick={() => handleReset(clearFilters, dataIndex)}
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
          setTimeout(() => statsSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: statsFilters[dataIndex] || null,
    render: text =>
      statsSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[statsSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setStatsSearchText(selectedKeys[0]);
    setStatsSearchedColumn(dataIndex);
    setStatsFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setStatsSearchText('');
    setStatsSearchedColumn('');
    setStatsFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllStatsFilters = () => {
    setStatsFilters({ title: null, statText: null, description: null });
    setStatsSearchText('');
    setStatsSearchedColumn('');
  };

  const statsColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Stat Text',
      dataIndex: 'statText',
      key: 'statText',
      ...getColumnSearchProps('statText'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
      ...getColumnSearchProps('description'),
    },
    ...(canEdit ? [{
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditStats(record);
                statsForm.setFieldsValue(record);
                setStatsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this stats item?"
            onConfirm={() => handleDeleteStats(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    }] : []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Stats Items</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllStatsFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditStats(null);
                statsForm.resetFields();
                setStatsModalOpen(true);
              }}
            >
              Add Stats Item
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={statsColumns}
        dataSource={stats}
        rowKey="_id"
        loading={loading}
      />

      {canEdit && (
        <Modal
          title={editStats ? "Edit Stats Item" : "Add Stats Item"}
          open={statsModalOpen}
          onCancel={() => {
            setStatsModalOpen(false);
            setEditStats(null);
            statsForm.resetFields();
          }}
          footer={null}
          width="90vw"
        >
          <Form
            form={statsForm}
            layout="vertical"
            onFinish={handleStatsSubmit}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="statText"
              label="Stat Text"
              rules={[{ required: true, message: 'Please enter stat text' }]}
            >
              <Input placeholder="Enter stat text" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea placeholder="Enter description" rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editStats ? "Update" : "Add"} Stats Item
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}