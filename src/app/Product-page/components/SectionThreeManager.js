'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { Text } = Typography;

export default function SectionThreeManager() {
  const [sectionThreeEntries, setSectionThreeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [sectionForm] = Form.useForm();
  const [sectionFilters, setSectionFilters] = useState({ title: null, description: null });
  const [sectionSearchText, setSectionSearchText] = useState('');
  const [sectionSearchedColumn, setSectionSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionSearchInput = useRef(null);

  useEffect(() => {
    fetchSectionThree();
  }, []);

  const fetchSectionThree = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/section-three');
      const data = await response.json();
      if (data.success) {
        setSectionThreeEntries(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching section three entries:', error);
      message.error('Failed to fetch section three entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editSection && editSection._id) formData.append('_id', editSection._id);
      formData.append('title', values.title);
      formData.append('description', values.description);

      let imageValue = values.imageUrl || null;
      if (values.image && values.image.length > 0) {
        if (values.image[0].originFileObj) {
          formData.append('image', values.image[0].originFileObj);
        } else if (values.image[0].url) {
          imageValue = values.image[0].url;
        }
      }

      if (!imageValue && !formData.has('image') && !editSection) {
        throw new Error('Image is required for new Section Three entry');
      }

      if (imageValue) {
        formData.append('imageUrl', imageValue);
      }

      const response = await fetch('/api/product-page/section-three', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editSection ? 'Section Three updated successfully!' : 'Section Three added successfully!');
        setSectionModalOpen(false);
        setEditSection(null);
        sectionForm.resetFields();
        fetchSectionThree();
      } else {
        message.error(result.message || 'Error adding section three entry');
      }
    } catch (error) {
      console.error('Error adding section three entry:', error);
      message.error(error.message || 'Error adding section three entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      const response = await fetch(`/api/product-page/section-three?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Section Three deleted successfully!');
        fetchSectionThree();
      } else {
        message.error(result.message || 'Error deleting section three entry');
      }
    } catch (error) {
      console.error('Error deleting section three entry:', error);
      message.error('Error deleting section three entry');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={sectionSearchInput}
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
          setTimeout(() => sectionSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: sectionFilters[dataIndex] || null,
    render: text =>
      sectionSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[sectionSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSectionSearchText(selectedKeys[0]);
    setSectionSearchedColumn(dataIndex);
    setSectionFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSectionSearchText('');
    setSectionSearchedColumn('');
    setSectionFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllSectionFilters = () => {
    setSectionFilters({ title: null, description: null });
    setSectionSearchText('');
    setSectionSearchedColumn('');
  };

  const sectionColumns = [
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
      width: 300,
      ...getColumnSearchProps('description'),
      render: text => <Text>{text}</Text>,
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
            alt="Section Three Image"
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
                setEditSection(record);
                sectionForm.setFieldsValue({
                  title: record.title,
                  description: record.description,
                  image: record.image ? [{ url: record.image, uid: record.image, name: 'image' }] : [],
                  imageUrl: record.image || null,
                });
                setSectionModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this section three entry?"
            onConfirm={() => handleDeleteSection(record._id)}
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Section Three</h2>
        <Space>
          <Button onClick={resetAllSectionFilters} type="default">
            Reset Filters
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditSection(null);
              sectionForm.resetFields();
              setSectionModalOpen(true);
            }}
          >
            Add New Section Three
          </Button>
        </Space>
      </div>

      <Table
        columns={sectionColumns}
        dataSource={sectionThreeEntries}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      <Modal
        title={editSection ? 'Edit Section Three' : 'Add New Section Three'}
        open={sectionModalOpen}
        onCancel={() => {
          setSectionModalOpen(false);
          setEditSection(null);
          sectionForm.resetFields();
        }}
        footer={null}
        width={600}
        className="top-5"
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleSectionSubmit}
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

          <Form.Item
            name="image"
            label={<Text strong>Image</Text>}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: !editSection, message: 'Please upload an image' }]}
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

          {sectionForm.getFieldValue('image') &&
            sectionForm.getFieldValue('image').length > 0 &&
            sectionForm.getFieldValue('image')[0].url && (
              <Form.Item label={<Text strong>Current Image</Text>}>
                <Image
                  src={sectionForm.getFieldValue('image')[0].url}
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
                ? editSection
                  ? 'Updating...'
                  : 'Adding...'
                : editSection
                ? 'Update Section Three'
                : 'Add Section Three'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}