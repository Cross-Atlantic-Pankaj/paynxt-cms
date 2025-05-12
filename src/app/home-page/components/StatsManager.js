'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export default function StatsManager() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [editStat, setEditStat] = useState(null);
  const [statForm] = Form.useForm();
  const [statFilters, setStatFilters] = useState({ title: null, statText: null, description: null });
  const [statSearchText, setStatSearchText] = useState('');
  const [statSearchedColumn, setStatSearchedColumn] = useState('');
  const searchInput = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-page/stats');
      const data = await response.json();
      if (data.success) {
        const statsArray = data.data && data.data.length > 0 && Array.isArray(data.data[0].stats) 
          ? data.data[0].stats 
          : [];
        setStats(statsArray);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleStatSubmit = async (values) => {
    try {
      const newStat = { ...values };
      if (editStat && editStat._id) newStat._id = editStat._id;

      const response = await fetch('/api/home-page/stats');
      const data = await response.json();
      if (!data.success) {
        message.error('Failed to fetch existing stats');
        return;
      }

      let statsArray = data.data && data.data.length > 0 && Array.isArray(data.data[0].stats) 
        ? data.data[0].stats 
        : [];

      if (editStat && editStat._id) {
        statsArray = statsArray.map(stat => 
          stat._id === editStat._id ? { ...stat, ...newStat } : stat
        );
      } else {
        statsArray.push(newStat);
      }

      const updateResponse = await fetch('/api/home-page/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: statsArray }),
      });
      const result = await updateResponse.json();

      if (result.success) {
        message.success(editStat ? 'Stat updated successfully!' : 'Stat added successfully!');
        setStatModalOpen(false);
        setEditStat(null);
        statForm.resetFields();
        fetchStats();
      } else {
        message.error(result.message || 'Error updating stat');
      }
    } catch (error) {
      console.error('Error updating stat:', error);
      message.error('Error updating stat');
    }
  };

  const handleDeleteStat = async (id) => {
    try {
      const response = await fetch(`/api/home-page/stats?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Stat deleted successfully!');
        fetchStats();
      } else {
        message.error(result.message || 'Error deleting stat');
      }
    } catch (error) {
      console.error('Error deleting stat:', error);
      message.error('Error deleting stat');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
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
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: statFilters[dataIndex] || null,
    render: text =>
      statSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[statSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setStatSearchText(selectedKeys[0]);
    setStatSearchedColumn(dataIndex);
    setStatFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setStatSearchText('');
    setStatSearchedColumn('');
    setStatFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllStatFilters = () => {
    setStatFilters({ title: null, statText: null, description: null });
    setStatSearchText('');
    setStatSearchedColumn('');
  };

  const statColumns = [
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditStat(record);
                statForm.setFieldsValue(record);
                setStatModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this stat?"
            onConfirm={() => handleDeleteStat(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Stats</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllStatFilters}>Reset Filters</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditStat(null);
              statForm.resetFields();
              setStatModalOpen(true);
            }}
          >
            Add Stat
          </Button>
        </div>
      </div>
      <Table
        columns={statColumns}
        dataSource={stats}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editStat ? "Edit Stat" : "Add Stat"}
        open={statModalOpen}
        onCancel={() => {
          setStatModalOpen(false);
          setEditStat(null);
          statForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={statForm}
          layout="vertical"
          onFinish={handleStatSubmit}
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
            <Input placeholder="Enter description" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editStat ? "Update" : "Add"} Stat
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}