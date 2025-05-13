'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Typography, Space, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import moment from 'moment'; 

const { Text } = Typography;
const { Option } = Select;

export default function ResearchInsightManager() {
  const [researchInsights, setResearchInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [editResearchInsight, setEditResearchInsight] = useState(null);
  const [researchForm] = Form.useForm();
  const [researchFilters, setResearchFilters] = useState({ sectionType: null, title: null, date: null });
  const [researchSearchText, setResearchSearchText] = useState('');
  const [researchSearchedColumn, setResearchSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const researchSearchInput = useRef(null);

  useEffect(() => {
    fetchResearchInsights();
  }, []);

  const fetchResearchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-page/research-insight');
      const data = await response.json();
      if (data.success) {
        setResearchInsights(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching research insights:', error);
      message.error('Failed to fetch research insights');
    } finally {
      setLoading(false);
    }
  };

  const handleResearchSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editResearchInsight && editResearchInsight._id) formData.append('_id', editResearchInsight._id);
      formData.append('sectionType', values.sectionType);
      formData.append('title', values.title);

      if (values.date) {
        formData.append('date', values.date.toISOString()); 
      }

      let imageValue = values.imageUrl || null;
      if (values.imageurl && values.imageurl.length > 0) {
        if (values.imageurl[0].originFileObj) {
          formData.append('imageurl', values.imageurl[0].originFileObj);
        } else if (values.imageurl[0].url) {
          imageValue = values.imageurl[0].url;
        }
      }

      if (!imageValue && !formData.has('imageurl') && !editResearchInsight) {
        throw new Error('Image is required for new Research Insight');
      }

      if (imageValue) {
        formData.append('imageUrl', imageValue);
      }

      const response = await fetch('/api/home-page/research-insight', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editResearchInsight ? 'Research Insight updated successfully!' : 'Research Insight added successfully!');
        setResearchModalOpen(false);
        setEditResearchInsight(null);
        researchForm.resetFields();
        fetchResearchInsights();
      } else {
        message.error(result.message || 'Error adding research insight');
      }
    } catch (error) {
      console.error('Error adding research insight:', error);
      message.error(error.message || 'Error adding research insight');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResearchInsight = async (id) => {
    try {
      const response = await fetch(`/api/home-page/research-insight?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Research Insight deleted successfully!');
        fetchResearchInsights();
      } else {
        message.error(result.message || 'Error deleting research insight');
      }
    } catch (error) {
      console.error('Error deleting research insight:', error);
      message.error('Error deleting research insight');
    }
  };

  const getColumnSearchProps = (dataIndex, nested = false) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={researchSearchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-2 block w-full"
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          className="w-[90px] mr-2"
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters, dataIndex)}
          size="small"
          className="w-[90px]"
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined className={filtered ? 'text-blue-500' : ''} />,
    onFilter: (value, record) => {
      const fieldValue = nested ? record.content[dataIndex] : record[dataIndex];
      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
    filterDropdownProps: {
      onOpenChange: visible => {
        if (visible) {
          setTimeout(() => researchSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: researchFilters[dataIndex] || null,
    render: text =>
      researchSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[researchSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setResearchSearchText(selectedKeys[0]);
    setResearchSearchedColumn(dataIndex);
    setResearchFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setResearchSearchText('');
    setResearchSearchedColumn('');
    setResearchFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllResearchFilters = () => {
    setResearchFilters({ sectionType: null, title: null, date: null });
    setResearchSearchText('');
    setResearchSearchedColumn('');
  };

  const researchColumns = [
    {
      title: 'Section Type',
      dataIndex: 'sectionType',
      key: 'sectionType',
      width: 150,
      ...getColumnSearchProps('sectionType'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Title',
      dataIndex: ['content', 'title'],
      key: 'title',
      width: 200,
      ...getColumnSearchProps('title', true),
      render: text => <Text>{text}</Text>,
    },
    {
      title: 'Image',
      dataIndex: ['content', 'imageurl'],
      key: 'imageurl',
      width: 150,
      render: imageurl => (
        imageurl ? (
          <Image
            src={imageurl}
            alt="Research Insight Image"
            width={60}
            height={60}
            className="object-cover rounded"
          />
        ) : (
          <Text type="secondary">No image</Text>
        )
      ),
    },
    {
      title: 'Date',
      dataIndex: ['content', 'date'],
      key: 'date',
      width: 150,
      ...getColumnSearchProps('date', true),
      render: date => (
        <Text>
          {date ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) : 'N/A'}
        </Text>
      ),
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
                setEditResearchInsight(record);
                researchForm.setFieldsValue({
                  sectionType: record.sectionType,
                  title: record.content.title,
                  date: record.content.date ? moment(record.content.date) : null, // Convert date to moment object for DatePicker
                  imageurl: record.content.imageurl ? [{ url: record.content.imageurl, uid: record.content.imageurl, name: 'image' }] : [],
                  imageUrl: record.content.imageurl || null,
                });
                setResearchModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this research insight?"
            onConfirm={() => handleDeleteResearchInsight(record._id)}
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

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Research Insights</h2>
        <Space>
          <Button onClick={resetAllResearchFilters} type="default">
            Reset Filters
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditResearchInsight(null);
              researchForm.resetFields();
              setResearchModalOpen(true);
            }}
          >
            Add New Research Insight
          </Button>
        </Space>
      </div>

      <Table
        columns={researchColumns}
        dataSource={researchInsights}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      <Modal
        title={editResearchInsight ? 'Edit Research Insight' : 'Add New Research Insight'}
        open={researchModalOpen}
        onCancel={() => {
          setResearchModalOpen(false);
          setEditResearchInsight(null);
          researchForm.resetFields();
        }}
        footer={null}
        width={600}
        className="top-5"
      >
        <Form
          form={researchForm}
          layout="vertical"
          onFinish={handleResearchSubmit}
          className="py-4"
        >
          <Form.Item
            name="sectionType"
            label={<Text strong>Section Type</Text>}
            rules={[{ required: true, message: 'Please select a section type' }]}
          >
            <Select placeholder="Select section type" size="large">
              <Option value="Featured Research">Featured Research</Option>
              <Option value="Insights">Insights</Option>
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
            name="date"
            label={<Text strong>Date</Text>}
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="Select date"
            />
          </Form.Item>

          <Form.Item
            name="imageurl"
            label={<Text strong>Image</Text>}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: !editResearchInsight, message: 'Please upload an image' }]}
          >
            <Upload
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              className="w-full"
            >
              <div className="flex flex-col items-center">
                <UploadOutlined className="text-2xl text-blue-500" />
                <div className="mt-2">Upload Image</div>
              </div>
            </Upload>
          </Form.Item>

          {researchForm.getFieldValue('imageurl') &&
            researchForm.getFieldValue('imageurl').length > 0 &&
            researchForm.getFieldValue('imageurl')[0].url && (
              <Form.Item label={<Text strong>Current Image</Text>}>
                <Image
                  src={researchForm.getFieldValue('imageurl')[0].url}
                  alt="Current"
                  width={120}
                  height={120}
                  className="object-cover rounded"
                />
              </Form.Item>
            )}

          <Form.Item name="imageUrl" hidden>
            <Input type="hidden" />
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
                ? editResearchInsight
                  ? 'Updating...'
                  : 'Adding...'
                : editResearchInsight
                ? 'Update Research Insight'
                : 'Add Research Insight'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}