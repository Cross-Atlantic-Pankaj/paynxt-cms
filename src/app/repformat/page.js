'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function RepFormatManager() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [topicForm] = Form.useForm();
  const [topicFilters, setTopicFilters] = useState({ repFormatName: null });
  const [topicSearchText, setTopicSearchText] = useState('');
  const [topicSearchedColumn, setTopicSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/repformat');
      const data = await response.json();
      if (data.success) {
        setTopics(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching product topics:', error);
      message.error('Failed to fetch product topics');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editTopic && editTopic._id) values._id = editTopic._id;
      else delete values._id;

      const response = await fetch('/api/repformat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editTopic ? 'Product topic updated successfully!' : 'Product topic added successfully!');
        setTopicModalOpen(false);
        setEditTopic(null);
        topicForm.resetFields();
        fetchTopics();
      } else {
        message.error(result.message || 'Error updating product topic');
      }
    } catch (error) {
      console.error('Error updating product topic:', error);
      message.error('Error updating product topic');
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/repformat?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Product topic deleted successfully!');
        fetchTopics();
      } else {
        message.error(result.message || 'Error deleting product topic');
      }
    } catch (error) {
      console.error('Error deleting product topic:', error);
      message.error('Error deleting product topic');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: topicFilters[dataIndex] || null,
    render: (text) =>
      topicSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[topicSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setTopicSearchText(selectedKeys[0]);
    setTopicSearchedColumn(dataIndex);
    setTopicFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setTopicSearchText('');
    setTopicSearchedColumn('');
    setTopicFilters((prev) => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllTopicFilters = () => {
    setTopicFilters({ repFormatName: null });
    setTopicSearchText('');
    setTopicSearchedColumn('');
  };

  const topicColumns = [
    {
      title: 'Report Format',
      dataIndex: 'repFormatName',
      key: 'repFormatName',
      ...getColumnSearchProps('repFormatName'),
    },
    {
      title: 'General Comment',
      dataIndex: 'generalComment',
      key: 'generalComment',
      render: (text) => text || '-',
    },
    ...(canEdit
      ? [
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
                      setEditTopic(record);
                      topicForm.setFieldsValue(record);
                      setTopicModalOpen(true);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this product topic?"
                  onConfirm={() => handleDeleteTopic(record._id)}
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
        ]
      : []),
  ];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Report Format</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllTopicFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTopic(null);
                topicForm.resetFields();
                setTopicModalOpen(true);
              }}
            >
              Add Format
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={topicColumns}
        dataSource={Array.isArray(topics) ? topics : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      {canEdit && (
        <Modal
          title={editTopic ? 'Edit Format' : 'Add Format'}
          open={topicModalOpen}
          onCancel={() => {
            setTopicModalOpen(false);
            setEditTopic(null);
            topicForm.resetFields();
          }}
          footer={null}
        >
          <Form form={topicForm} layout="vertical" onFinish={handleTopicSubmit}>
            <Form.Item
              name="repFormatName"
              label="Report Format"
              rules={[{ required: true, message: 'Please enter format' }]}
            >
              <Input placeholder="Enter Format" />
            </Form.Item>
            <Form.Item name="generalComment" label="General Comment">
              <Input.TextArea placeholder="Enter general comment" rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editTopic ? 'Update' : 'Add'} Format
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}