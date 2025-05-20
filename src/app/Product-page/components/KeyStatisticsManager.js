'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { Text } = Typography;

export default function KeyStatisticsManager() {
  const [keyStatistics, setKeyStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [editStats, setEditStats] = useState(null);
  const [statsForm] = Form.useForm();
  const [statsFilters, setStatsFilters] = useState({ title: null, description: null });
  const [statsSearchText, setStatsSearchText] = useState('');
  const [statsSearchedColumn, setStatsSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statsSearchInput = useRef(null);

  useEffect(() => {
    fetchKeyStatistics();
  }, []);

  const fetchKeyStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/key-statistics');
      const data = await response.json();
      if (data.success) {
        setKeyStatistics(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching key statistics:', error);
      message.error('Failed to fetch key statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleStatsSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description,
      };
      if (editStats && editStats._id) {
        payload._id = editStats._id;
      }

      const response = await fetch('/api/product-page/key-statistics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        message.success(editStats ? 'Key Statistics updated successfully!' : 'Key Statistics added successfully!');
        setStatsModalOpen(false);
        setEditStats(null);
        statsForm.resetFields();
        fetchKeyStatistics();
      } else {
        message.error(result.message || 'Error adding key statistics');
      }
    } catch (error) {
      console.error('Error adding key statistics:', error);
      message.error(error.message || 'Error adding key statistics');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStats = async (id) => {
    try {
      const response = await fetch(`/api/product-page/key-statistics?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Key Statistics deleted successfully!');
        fetchKeyStatistics();
      } else {
        message.error(result.message || 'Error deleting key statistics');
      }
    } catch (error) {
      console.error('Error deleting key statistics:', error);
      message.error('Error deleting key statistics');
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
    setStatsFilters({ title: null, description: null });
    setStatsSearchText('');
    setStatsSearchedColumn('');
  };

  const statsColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ...getColumnSearchProps('title'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      ...getColumnSearchProps('description'),
      render: text => <Text>{text}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditStats(record);
                statsForm.setFieldsValue({
                  title: record.title,
                  description: record.description,
                });
                setStatsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this key statistics entry?"
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
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Key Statistics</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllStatsFilters}>
            Reset Filters
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditStats(null);
              statsForm.resetFields();
              setStatsModalOpen(true);
            }}
          >
            Add New Key Statistics
          </Button>
        </div>
      </div>

      <Table
        columns={statsColumns}
        dataSource={Array.isArray(keyStatistics) ? keyStatistics : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editStats ? 'Edit Key Statistics' : 'Add New Key Statistics'}
        open={statsModalOpen}
        onCancel={() => {
          setStatsModalOpen(false);
          setEditStats(null);
          statsForm.resetFields();
        }}
        footer={null}
        width={600}
        className="top-5"
      >
        <Form
          form={statsForm}
          layout="vertical"
          onFinish={handleStatsSubmit}
          className="py-4"
        >
          <Form.Item
            name="title"
            label={<Text strong>Title</Text>}
            rules={[{ required: true, message: 'Please enter the title' }]}
          >
            <Input placeholder="Enter title" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>Description</Text>}
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <Input.TextArea placeholder="Enter description" rows={4} />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              block
              size="large"
              className="rounded-lg"
            >
              {isSubmitting
                ? editStats
                  ? 'Updating...'
                  : 'Adding...'
                : editStats
                ? 'Update Key Statistics'
                : 'Add Key Statistics'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}