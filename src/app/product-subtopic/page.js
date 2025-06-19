'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function ProductSubTopicManager() {
  const [subTopics, setSubTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subTopicModalOpen, setSubTopicModalOpen] = useState(false);
  const [editSubTopic, setEditSubTopic] = useState(null);
  const [subTopicForm] = Form.useForm();
  const [subTopicFilters, setSubTopicFilters] = useState({ subProductName: null });
  const [subTopicSearchText, setSubTopicSearchText] = useState('');
  const [subTopicSearchedColumn, setSubTopicSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchSubTopics();
    fetchTopics();
  }, []);

  const fetchSubTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-subtopic');
      const data = await response.json();
      if (data.success) {
        setSubTopics(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching product subtopics:', error);
      message.error('Failed to fetch product subtopics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/product-topic');
      const data = await response.json();
      if (data.success) {
        setTopics(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching product topics:', error);
      message.error('Failed to fetch product topics');
    }
  };

  const handleSubTopicSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editSubTopic && editSubTopic._id) values._id = editSubTopic._id;
      else delete values._id;

      const response = await fetch('/api/product-subtopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editSubTopic ? 'Product subtopic updated successfully!' : 'Product subtopic added successfully!');
        setSubTopicModalOpen(false);
        setEditSubTopic(null);
        subTopicForm.resetFields();
        fetchSubTopics();
      } else {
        message.error(result.message || 'Error updating product subtopic');
      }
    } catch (error) {
      console.error('Error updating product subtopic:', error);
      message.error('Error updating product subtopic');
    }
  };

  const handleDeleteSubTopic = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/product-subtopic?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Product subtopic deleted successfully!');
        fetchSubTopics();
      } else {
        message.error(result.message || 'Error deleting product subtopic');
      }
    } catch (error) {
      console.error('Error deleting product subtopic:', error);
      message.error('Error deleting product subtopic');
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
    filteredValue: subTopicFilters[dataIndex] || null,
    render: (text) =>
      subTopicSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[subTopicSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSubTopicSearchText(selectedKeys[0]);
    setSubTopicSearchedColumn(dataIndex);
    setSubTopicFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSubTopicSearchText('');
    setSubTopicSearchedColumn('');
    setSubTopicFilters((prev) => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllSubTopicFilters = () => {
    setSubTopicFilters({ subProductName: null });
    setSubTopicSearchText('');
    setSubTopicSearchedColumn('');
  };

  const subTopicColumns = [
    {
      title: 'Subtopic Name',
      dataIndex: 'subProductName',
      key: 'subProductName',
      ...getColumnSearchProps('subProductName'),
    },
    {
      title: 'Topic',
      dataIndex: ['productTopicId', 'productTopicName'],
      key: 'productTopicName',
      render: (text) => text || '-',
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
                      setEditSubTopic(record);
                      subTopicForm.setFieldsValue({
                        subProductName: record.subProductName,
                        productTopicId: record.productTopicId._id,
                        generalComment: record.generalComment,
                      });
                      setSubTopicModalOpen(true);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this product subtopic?"
                  onConfirm={() => handleDeleteSubTopic(record._id)}
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Product Subtopics</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllSubTopicFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditSubTopic(null);
                subTopicForm.resetFields();
                setSubTopicModalOpen(true);
              }}
            >
              Add Subtopic
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={subTopicColumns}
        dataSource={Array.isArray(subTopics) ? subTopics : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      {canEdit && (
        <Modal
          title={editSubTopic ? 'Edit Subtopic' : 'Add Subtopic'}
          open={subTopicModalOpen}
          onCancel={() => {
            setSubTopicModalOpen(false);
            setEditSubTopic(null);
            subTopicForm.resetFields();
          }}
          footer={null}
        >
          <Form form={subTopicForm} layout="vertical" onFinish={handleSubTopicSubmit}>
            <Form.Item
              name="subProductName"
              label="Subtopic Name"
              rules={[{ required: true, message: 'Please enter subtopic name' }]}
            >
              <Input placeholder="Enter subtopic name" />
            </Form.Item>
            <Form.Item
              name="productTopicId"
              label="Product Topic"
              rules={[{ required: true, message: 'Please select a product topic' }]}
            >
              <Select placeholder="Select a product topic">
                {topics.map((topic) => (
                  <Select.Option key={topic._id} value={topic._id}>
                    {topic.productTopicName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="generalComment" label="General Comment">
              <Input.TextArea placeholder="Enter general comment" rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editSubTopic ? 'Update' : 'Add'} SubTopic
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}