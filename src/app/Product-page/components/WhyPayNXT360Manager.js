'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Typography, Space, Card, Divider, Checkbox, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import slugify from '@/lib/slugify';

const { Text } = Typography;

export default function WhyPayNXT360Manager() {
  const [whyPayNXT360Entries, setWhyPayNXT360Entries] = useState([]);
  const [bannerOptions, setBannerOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [whyPayModalOpen, setWhyPayModalOpen] = useState(false);
  const [editWhyPay, setEditWhyPay] = useState(null);
  const [whyPayForm] = Form.useForm();
  const [whyPayFilters, setWhyPayFilters] = useState({ heading: null });
  const [whyPaySearchText, setWhyPaySearchText] = useState('');
  const [whyPaySearchedColumn, setWhyPaySearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const whyPaySearchInput = useRef(null);
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false);


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/product-page/top-banner');
        const data = await res.json();
        if (data.success) {
          setBannerOptions(data.data);
        } else {
          message.error('Failed to fetch banners');
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        message.error('Error fetching banners');
      }
    };
    fetchBanners();
    fetchWhyPayNXT360();
  }, []);

  const findPageTitleFromSlug = (slug) => {
    const matched = bannerOptions.find(b => slugify(b.pageTitle, { lower: true, strict: true }) === slug);
    return matched ? matched.pageTitle : null;
  };

  const fetchWhyPayNXT360 = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/why-pay-nxt360');
      const data = await response.json();
      console.log('WhyPayNXT360 data:', data);
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
    console.log('Submitting:', { isGlobal: values.isGlobal, pageTitle: values.pageTitle });
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      if (editWhyPay?._id) formData.append('_id', editWhyPay._id);

      formData.append('heading', values.heading);
      formData.append('isGlobal', values.isGlobal ? 'true' : 'false');
      if (!values.isGlobal && values.pageTitle) {
        formData.append('pageTitle', values.pageTitle);
      }

      const subSections = {
        subSection1: values.subSection1 || {},
        subSection2: values.subSection2 || {},
        subSection3: values.subSection3 || {},
        subSection4: values.subSection4 || {},
      };

      // validate
      for (let i = 1; i <= 4; i++) {
        const s = subSections[`subSection${i}`];
        if (!s.title || !s.description) throw new Error(`Title & description required for Sub Section ${i}`);
      }

      // handle images
      for (let i = 1; i <= 4; i++) {
        const key = `subSection${i}`;
        const s = subSections[key];
        let imageValue = null;

        if (s.image) {
          if (s.image.file) {
            formData.append(`${key}.image`, s.image.file.originFileObj);
          } else if (Array.isArray(s.image) && s.image.length > 0) {
            if (s.image[0].url) {
              imageValue = s.image[0].url;
            } else if (s.image[0].originFileObj) {
              formData.append(`${key}.image`, s.image[0].originFileObj);
            }
          }
        }

        if (!imageValue && !formData.has(`${key}.image`) && !editWhyPay) {
          throw new Error(`Image is required for ${key}`);
        }

        s.image = imageValue;
        formData.append(key, JSON.stringify({
          title: s.title,
          description: s.description,
          image: imageValue
        }));
      }

      const res = await fetch('/api/product-page/why-pay-nxt360', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        message.success(editWhyPay ? 'Updated successfully!' : 'Added successfully!');
        whyPayForm.resetFields();
        setEditWhyPay(null);
        setWhyPayModalOpen(false);
        fetchWhyPayNXT360();
      } else {
        message.error(result.message || 'Error occurred');
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Error occurred');
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
      title: 'Page',
      dataIndex: 'slug',
      key: 'slug',
      width: 120,
      render: (slug) =>
        slug ? (
          <Text>{slug}</Text>
        ) : (
          <Text type="secondary">🌐 Global</Text>
        ),
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

                const isGlobal = !record.slug;
                whyPayForm.setFieldsValue({
                  heading: record.heading,
                  isGlobal,
                  pageTitle: isGlobal ? null : findPageTitleFromSlug(record.slug),
                  subSection1: {
                    title: record.subSection1.title,
                    description: record.subSection1.description,
                    image: record.subSection1.image ? [{ url: record.subSection1.image, uid: record.subSection1.image }] : [],
                  },
                  subSection2: {
                    title: record.subSection2.title,
                    description: record.subSection2.description,
                    image: record.subSection2.image ? [{ url: record.subSection2.image, uid: record.subSection2.image }] : [],
                  },
                  subSection3: {
                    title: record.subSection3.title,
                    description: record.subSection3.description,
                    image: record.subSection3.image ? [{ url: record.subSection3.image, uid: record.subSection3.image }] : [],
                  },
                  subSection4: {
                    title: record.subSection4.title,
                    description: record.subSection4.description,
                    image: record.subSection4.image ? [{ url: record.subSection4.image, uid: record.subSection4.image }] : [],
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
      <div
        className="flex justify-between items-center p-3 rounded-md bg-[#f8f9fa] hover:bg-[#e9ecef] cursor-pointer border mb-2 transition"
        onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Why Pay NXT360</h2>
          <span
            className="transition-transform duration-300"
            style={{ transform: isSectionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        {!isSectionCollapsed && (
          <Space>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                resetAllWhyPayFilters();
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
                setEditWhyPay(null);
                whyPayForm.resetFields();
                setWhyPayModalOpen(true);
              }}
            >
              Add New Why Pay NXT360
            </Button>
          </Space>
        )}
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isSectionCollapsed ? 'max-h-0' : 'max-h-[2000px]'}`}
      >
        <div className="p-2">
          <Table
            columns={whyPayColumns}
            dataSource={whyPayNXT360Entries}
            rowKey="_id"
            loading={loading}
            bordered
            pagination={{ pageSize: 5 }}
            className="bg-white rounded-lg shadow-sm"
          />
        </div>
      </div>

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
            name="isGlobal"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  whyPayForm.setFieldValue('pageTitle', null);
                }
              }}
            >
              Global (show on all pages)
            </Checkbox>
          </Form.Item>

          <Form.Item
            shouldUpdate={(prev, curr) => prev.isGlobal !== curr.isGlobal}
          >
            {({ getFieldValue, setFieldsValue }) => {
              const isGlobal = getFieldValue('isGlobal');
              return (
                <Form.Item
                  name="pageTitle"
                  label={<Text strong className="text-lg">Select Page Title</Text>}
                  rules={[
                    { required: !isGlobal, message: 'Please select a page title' }
                  ]}
                >
                  <Select
                    disabled={isGlobal}
                    placeholder="Select a page title"
                    options={bannerOptions.map(b => ({
                      label: b.pageTitle,
                      value: b.pageTitle
                    }))}
                    showSearch
                    onChange={(value) => {
                      // optional: if needed
                    }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="heading"
            label={<Text strong className="text-lg">Heading</Text>}
            rules={[{ required: true, message: 'Please enter the heading' }]}
          >
            <Input placeholder="Enter heading" size="large" className="rounded-md" />
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
                    <Input placeholder="Enter title" size="large" className="rounded-md" />
                  </Form.Item>

                  <Form.Item
                    name={['subSection' + i, 'description']}
                    label={<Text strong className="text-base">Description</Text>}
                    rules={[{ required: true, message: 'Please enter the description' }]}
                  >
                    <Input.TextArea placeholder="Enter description" rows={5} className="rounded-md" />
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