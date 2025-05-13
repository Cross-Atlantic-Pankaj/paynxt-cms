'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

const { Text } = Typography;

export default function TechnologyPlatformManager() {
  const [technologyPlatforms, setTechnologyPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [editTechPlatform, setEditTechPlatform] = useState(null);
  const [techForm] = Form.useForm();
  const [techFilters, setTechFilters] = useState({ title: null });
  const [techSearchText, setTechSearchText] = useState('');
  const [techSearchedColumn, setTechSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const techSearchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchTechnologyPlatforms();
  }, []);

  const fetchTechnologyPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-page/technology-platform');
      const data = await response.json();
      if (data.success) {
        setTechnologyPlatforms(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching technology platforms:', error);
      message.error('Failed to fetch technology platforms');
    } finally {
      setLoading(false);
    }
  };

  const handleTechSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editTechPlatform && editTechPlatform._id) formData.append('_id', editTechPlatform._id);
      formData.append('title', values.title);
      
      let imageValue = values.imageUrl || null;
      if (values.image && values.image.length > 0) {
        if (values.image[0].originFileObj) {
          formData.append('image', values.image[0].originFileObj);
        } else if (values.image[0].url) {
          imageValue = values.image[0].url;
        }
      }

      if (!imageValue && !formData.has('image') && !editTechPlatform) {
        throw new Error('Image is required for new Technology Platform');
      }

      if (imageValue) {
        formData.append('imageUrl', imageValue);
      }

      const response = await fetch('/api/home-page/technology-platform', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editTechPlatform ? 'Technology Platform updated successfully!' : 'Technology Platform added successfully!');
        setTechModalOpen(false);
        setEditTechPlatform(null);
        techForm.resetFields();
        fetchTechnologyPlatforms();
      } else {
        message.error(result.message || 'Error adding technology platform');
      }
    } catch (error) {
      console.error('Error adding technology platform:', error);
      message.error(error.message || 'Error adding technology platform');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTechPlatform = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/home-page/technology-platform?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Technology Platform deleted successfully!');
        fetchTechnologyPlatforms();
      } else {
        message.error(result.message || 'Error deleting technology platform');
      }
    } catch (error) {
      console.error('Error deleting technology platform:', error);
      message.error('Error deleting technology platform');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={techSearchInput}
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
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterDropdownProps: {
      onOpenChange: visible => {
        if (visible) {
          setTimeout(() => techSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: techFilters[dataIndex] || null,
    render: text =>
      techSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[techSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setTechSearchText(selectedKeys[0]);
    setTechSearchedColumn(dataIndex);
    setTechFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setTechSearchText('');
    setTechSearchedColumn('');
    setTechFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllTechFilters = () => {
    setTechFilters({ title: null });
    setTechSearchText('');
    setTechSearchedColumn('');
  };

  const techColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ...getColumnSearchProps('title'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 150,
      render: image => (
        image ? (
          <Image
            src={image}
            alt="Technology Platform Image"
            width={60}
            height={60}
            className="object-cover rounded"
          />
        ) : (
          <Text type="secondary">No image</Text>
        )
      ),
    },
    ...(canEdit ? [{
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
                setEditTechPlatform(record);
                techForm.setFieldsValue({
                  title: record.title,
                  image: record.image ? [{ url: record.image, uid: record.image, name: 'image' }] : [],
                  imageUrl: record.image || null,
                });
                setTechModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this technology platform?"
            onConfirm={() => handleDeleteTechPlatform(record._id)}
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

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Technology Platforms</h2>
        <Space>
          <Button onClick={resetAllTechFilters} type="default">
            Reset Filters
          </Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTechPlatform(null);
                techForm.resetFields();
                setTechModalOpen(true);
              }}
            >
              Add New Technology Platform
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={techColumns}
        dataSource={technologyPlatforms}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      {canEdit && (
        <Modal
          title={editTechPlatform ? 'Edit Technology Platform' : 'Add New Technology Platform'}
          open={techModalOpen}
          onCancel={() => {
            setTechModalOpen(false);
            setEditTechPlatform(null);
            techForm.resetFields();
          }}
          footer={null}
          width={600}
          className="top-5"
        >
          <Form
            form={techForm}
            layout="vertical"
            onFinish={handleTechSubmit}
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
              name="image"
              label={<Text strong>Image</Text>}
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: !editTechPlatform, message: 'Please upload an image' }]}
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

            {techForm.getFieldValue('image') &&
              techForm.getFieldValue('image').length > 0 &&
              techForm.getFieldValue('image')[0].url && (
                <Form.Item label={<Text strong>Current Image</Text>}>
                  <Image
                    src={techForm.getFieldValue('image')[0].url}
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
                  ? editTechPlatform
                    ? 'Updating...'
                    : 'Adding...'
                  : editTechPlatform
                  ? 'Update Technology Platform'
                  : 'Add Technology Platform'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}