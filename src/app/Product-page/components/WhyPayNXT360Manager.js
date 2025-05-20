'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Typography, Space, Card, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { Text } = Typography;

export default function WhyPayNXT360Manager() {
  const [whyPayNXT360Entries, setWhyPayNXT360Entries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [whyPayModalOpen, setWhyPayModalOpen] = useState(false);
  const [editWhyPay, setEditWhyPay] = useState(null);
  const [whyPayForm] = Form.useForm();
  const [whyPayFilters, setWhyPayFilters] = useState({ heading: null });
  const [whyPaySearchText, setWhyPaySearchText] = useState('');
  const [whyPaySearchedColumn, setWhyPaySearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const whyPaySearchInput = useRef(null);

  useEffect(() => {
    fetchWhyPayNXT360();
  }, []);

  const fetchWhyPayNXT360 = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/why-pay-nxt360');
      const data = await response.json();
      if (data.success) {
        setWhyPayNXT360Entries(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching WhyPayNXT360 entries:', error);
      message.error('Failed to fetch WhyPayNXT360 entries');
    } finally {
      setLoading(false);
    }
  };

  const handleWhyPaySubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editWhyPay && editWhyPay._id) formData.append('_id', editWhyPay._id);
      formData.append('heading', values.heading);

      const subSections = {
        subSection1: values.subSection1 || {},
        subSection2: values.subSection2 || {},
        subSection3: values.subSection3 || {},
        subSection4: values.subSection4 || {},
      };

      for (let i = 1; i <= 4; i++) {
        const subSectionKey = `subSection${i}`;
        const subSection = subSections[subSectionKey];
        if (!subSection.title || !subSection.description) {
          throw new Error(`Title and description are required for ${subSectionKey}`);
        }
      }

      for (let i = 1; i <= 4; i++) {
        const subSectionKey = `subSection${i}`;
        const subSection = subSections[subSectionKey];
        let imageValue = null;

        if (subSection.image) {
          if (subSection.image.file) {
            formData.append(`${subSectionKey}.image`, subSection.image.file.originFileObj);
          } else if (Array.isArray(subSection.image) && subSection.image.length > 0) {
            if (subSection.image[0].url) {
              imageValue = subSection.image[0].url;
            } else if (subSection.image[0].originFileObj) {
              formData.append(`${subSectionKey}.image`, subSection.image[0].originFileObj);
            }
          }
        }

        if (!imageValue && !formData.has(`${subSectionKey}.image`) && !editWhyPay) {
          throw new Error(`Image is required for ${subSectionKey}`);
        }

        subSections[subSectionKey].image = imageValue;
        formData.append(subSectionKey, JSON.stringify(subSections[subSectionKey]));
      }

      const response = await fetch('/api/product-page/why-pay-nxt360', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editWhyPay ? 'WhyPayNXT360 updated successfully!' : 'WhyPayNXT360 added successfully!');
        setWhyPayModalOpen(false);
        setEditWhyPay(null);
        whyPayForm.resetFields();
        fetchWhyPayNXT360();
      } else {
        message.error(result.message || 'Error adding WhyPayNXT360 entry');
      }
    } catch (error) {
      console.error('Error adding WhyPayNXT360 entry:', error);
      message.error(error.message || 'Error adding WhyPayNXT360 entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWhyPay = async (id) => {
    try {
      const response = await fetch(`/api/product-page/why-pay-nxt360?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('WhyPayNXT360 deleted successfully!');
        fetchWhyPayNXT360();
      } else {
        message.error(result.message || 'Error deleting WhyPayNXT360 entry');
      }
    } catch (error) {
      console.error('Error deleting WhyPayNXT360 entry:', error);
      message.error('Error deleting WhyPayNXT360 entry');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={whyPaySearchInput}
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
          setTimeout(() => whyPaySearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: whyPayFilters[dataIndex] || null,
    render: text =>
      whyPaySearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[whyPaySearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setWhyPaySearchText(selectedKeys[0]);
    setWhyPaySearchedColumn(dataIndex);
    setWhyPayFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setWhyPaySearchText('');
    setWhyPaySearchedColumn('');
    setWhyPayFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllWhyPayFilters = () => {
    setWhyPayFilters({ heading: null });
    setWhyPaySearchText('');
    setWhyPaySearchedColumn('');
  };

  const whyPayColumns = [
    {
      title: 'Heading',
      dataIndex: 'heading',
      key: 'heading',
      width: 200,
      ...getColumnSearchProps('heading'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Sub Sections',
      dataIndex: 'subSections',
      key: 'subSections',
      width: 600,
      render: (_, record) => (
        <div>
          <Space direction="vertical" size="middle" className="w-full">
            {[1, 2, 3, 4].map(i => {
              const subSection = record[`subSection${i}`];
              return (
                <Card
                  key={i}
                  size="small"
                  className="w-full bg-gray-50"
                  title={`Sub Section ${i}`}
                >
                  <Space direction="vertical" className="w-full">
                    <div>
                      <Text strong>Title: </Text>
                      <Text>{subSection.title}</Text>
                    </div>
                    <div>
                      <Text strong>Description: </Text>
                      <Text>{subSection.description}</Text>
                    </div>
                    <div>
                      <Text strong>Image: </Text>
                      {subSection.image ? (
                        <Image
                          src={subSection.image}
                          alt={subSection.title}
                          width={60}
                          height={60}
                          className="object-cover rounded"
                        />
                      ) : (
                        <Text type="secondary">No image</Text>
                      )}
                    </div>
                  </Space>
                </Card>
              );
            })}
          </Space>
        </div>
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
                setEditWhyPay(record);
                whyPayForm.setFieldsValue({
                  heading: record.heading,
                  subSection1: {
                    title: record.subSection1.title,
                    description: record.subSection1.description,
                    image: record.subSection1.image ? [{ url: record.subSection1.image, uid: record.subSection1.image, name: 'image' }] : [],
                  },
                  subSection2: {
                    title: record.subSection2.title,
                    description: record.subSection2.description,
                    image: record.subSection2.image ? [{ url: record.subSection2.image, uid: record.subSection2.image, name: 'image' }] : [],
                  },
                  subSection3: {
                    title: record.subSection3.title,
                    description: record.subSection3.description,
                    image: record.subSection3.image ? [{ url: record.subSection3.image, uid: record.subSection3.image, name: 'image' }] : [],
                  },
                  subSection4: {
                    title: record.subSection4.title,
                    description: record.subSection4.description,
                    image: record.subSection4.image ? [{ url: record.subSection4.image, uid: record.subSection4.image, name: 'image' }] : [],
                  },
                });
                setWhyPayModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this WhyPayNXT360 entry?"
            onConfirm={() => handleDeleteWhyPay(record._id)}
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
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Why Pay NXT360</h2>
        <Space>
          <Button onClick={resetAllWhyPayFilters} type="default">
            Reset Filters
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditWhyPay(null);
              whyPayForm.resetFields();
              setWhyPayModalOpen(true);
            }}
          >
            Add New Why Pay NXT360
          </Button>
        </Space>
      </div>

      <Table
        columns={whyPayColumns}
        dataSource={whyPayNXT360Entries}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      <Modal
        title={editWhyPay ? 'Edit Why Pay NXT360' : 'Add New Why Pay NXT360'}
        open={whyPayModalOpen}
        onCancel={() => {
          setWhyPayModalOpen(false);
          setEditWhyPay(null);
          whyPayForm.resetFields();
        }}
        footer={null}
        width={800}
        className="top-5"
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '24px' }}
      >
        <Form
          form={whyPayForm}
          layout="vertical"
          onFinish={handleWhyPaySubmit}
          className="py-4"
        >
          <Form.Item
            name="heading"
            label={<Text strong className="text-lg">Heading</Text>}
            rules={[{ required: true, message: 'Please enter the heading' }]}
          >
            <Input
              placeholder="Enter heading"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Divider className="my-6" />

          {[1, 2, 3, 4].map(i => (
            <React.Fragment key={i}>
              <Card
                title={<span className="text-lg font-semibold">Sub Section {i}</span>}
                className="my-6 rounded-lg shadow-md border border-gray-200"
                bodyStyle={{ padding: '24px' }}
              >
                <div className="space-y-4">
                  <Form.Item
                    name={['subSection' + i, 'title']}
                    label={<Text strong className="text-base">Title</Text>}
                    rules={[{ required: true, message: 'Please enter the title' }]}
                  >
                    <Input
                      placeholder="Enter title"
                      size="large"
                      className="rounded-md"
                    />
                  </Form.Item>

                  <Form.Item
                    name={['subSection' + i, 'description']}
                    label={<Text strong className="text-base">Description</Text>}
                    rules={[{ required: true, message: 'Please enter the description' }]}
                  >
                    <Input.TextArea
                      placeholder="Enter description"
                      rows={3}
                      className="rounded-md"
                    />
                  </Form.Item>

                  <Form.Item
                    name={['subSection' + i, 'image']}
                    label={<Text strong className="text-base">Image</Text>}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: !editWhyPay, message: 'Please upload an image' }]}
                  >
                    <Upload
                      beforeUpload={() => false}
                      listType="picture-card"
                      maxCount={1}
                      className="w-full"
                    >
                      <div className="flex flex-col items-center">
                        <UploadOutlined className="text-2xl text-blue-500" />
                        <div className="mt-2 text-gray-600">Upload Image</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  {whyPayForm.getFieldValue(['subSection' + i, 'image']) &&
                    whyPayForm.getFieldValue(['subSection' + i, 'image']).length > 0 &&
                    whyPayForm.getFieldValue(['subSection' + i, 'image'])[0].url && (
                      <Form.Item label={<Text strong className="text-base">Current Image</Text>}>
                        <Image
                          src={whyPayForm.getFieldValue(['subSection' + i, 'image'])[0].url}
                          alt="Current"
                          width={120}
                          height={120}
                          className="object-cover rounded"
                        />
                      </Form.Item>
                    )}
                </div>
              </Card>
              {i < 4 && <Divider className="my-6" />}
            </React.Fragment>
          ))}

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              block
              size="large"
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting
                ? editWhyPay
                  ? 'Updating...'
                  : 'Adding...'
                : editWhyPay
                ? 'Update Why Pay NXT360'
                : 'Add Why Pay NXT360'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}