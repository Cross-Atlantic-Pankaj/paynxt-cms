'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Typography, Space, Checkbox, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { Text } = Typography;

export default function KeyStatisticsManager() {
  const [bannerOptions, setBannerOptions] = useState([]);
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
  const isGlobal = Form.useWatch('isGlobal', statsForm);
  const [isStatsSectionCollapsed, setIsStatsSectionCollapsed] = useState(false);


  useEffect(() => {
    fetchKeyStatistics();
    const fetchBanners = async () => {
      const res = await fetch('/api/product-page/top-banner');
      const json = await res.json();
      if (json.success) setBannerOptions(json.data); // adjust based on GET shape
    };
    fetchBanners();
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
    // console.log('Submitting values:', values);
    try {
      setIsSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description,
        pageTitle: values.pageTitle || null,
        isGlobal: values.isGlobal || false,
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
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ...getColumnSearchProps('slug'),  // if you want search
      render: (slug) => slug ? <Tag color="blue">{slug}</Tag> : <Tag color="default">Global</Tag>
    },
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
                  pageTitle: record.pageTitle || null,
                  isGlobal: record.slug == null,  // if slug is null → it's global
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

  const sortedKeyStatistics = [...keyStatistics].sort((a, b) => {
    const slugA = a.slug?.toLowerCase() || '';
    const slugB = b.slug?.toLowerCase() || '';
    if (slugA < slugB) return -1;
    if (slugA > slugB) return 1;
    return (a.title || '').localeCompare(b.title || '');
  });

  return (
    <div className="mb-6 mt-6">
      <div
        className="flex justify-between items-center p-3 rounded-md bg-[#f8f9fa] hover:bg-[#e9ecef] cursor-pointer border mb-2 transition"
        onClick={() => setIsStatsSectionCollapsed(!isStatsSectionCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Key Statistics</h2>
          <span
            className="transition-transform duration-300"
            style={{ transform: isStatsSectionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        {!isStatsSectionCollapsed && (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                resetAllStatsFilters();
              }}
            >
              Reset Filters
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setEditStats(null);
                statsForm.resetFields();
                setStatsModalOpen(true);
              }}
            >
              Add New Key Statistics
            </Button>
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isStatsSectionCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}
      >
        <div className="p-2">
          <Table
            columns={statsColumns}
            dataSource={sortedKeyStatistics}
            rowKey="_id"
            loading={loading}
            pagination={false}
            size="middle"
          />
        </div>
      </div>

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
          <Form.Item name="isGlobal" valuePropName="checked" initialValue={false}>
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  statsForm.setFieldsValue({ pageTitle: null });
                }
              }}
            >
              Mark as global (show on all pages)
            </Checkbox>
          </Form.Item>

          <Form.Item
            label="Page Title"
            name="pageTitle"
            dependencies={['isGlobal']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('isGlobal')) {
                    return Promise.resolve(); // no need to select
                  }
                  if (!value) {
                    return Promise.reject(new Error('Please select a page title'));
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Select
              showSearch
              placeholder="Select a page title from banners"
              allowClear
              disabled={isGlobal}
            >
              <Select.Option value={null}>🌐 Global (no specific page)</Select.Option>
              {bannerOptions.map(banner => (
                <Select.Option key={banner._id} value={banner.pageTitle}>
                  {banner.pageTitle}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

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
            <Input.TextArea placeholder="Enter description" rows={5} />
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