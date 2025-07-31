'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Table, Select, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Card, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

const { Text } = Typography;

export default function FeatReportManager() {
  const [blogsEntries, setBlogsEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blogsModalOpen, setBlogsModalOpen] = useState(false);
  const [editBlogs, setEditBlogs] = useState(null);
  const [blogsForm] = Form.useForm();
  const [blogsFilters, setBlogsFilters] = useState({ mainTitle: null });
  const [blogsSearchText, setBlogsSearchText] = useState('');
  const [blogsSearchedColumn, setBlogsSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const blogsSearchInput = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const allCategoryOptions = useMemo(() => {
    const categories = new Set();
    blogsEntries.forEach(item => {
      item.blogs.forEach(blog => {
        if (blog.category) categories.add(blog.category);
      });
    });
    return Array.from(categories);
  }, [blogsEntries]);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor', 'blogger'].includes(userRole);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-page/FeatReport');
      const data = await response.json();
      if (data.success) {
        setBlogsEntries(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      message.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogsSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editBlogs && editBlogs._id) formData.append('_id', editBlogs._id);
      formData.append('mainTitle', values.mainTitle);

      const blogs = values.blogs || [];
      if (blogs.length === 0) {
        throw new Error('At least one blog is required');
      }

      const blogsToSend = blogs.map((blog, index) => {
        let imageValue = null;

        if (blog.imageIconurl) {
          if (blog.imageIconurl.file) {
            formData.append(`blogs[${index}].imageIconurl`, blog.imageIconurl.file.originFileObj);
          } else if (Array.isArray(blog.imageIconurl) && blog.imageIconurl.length > 0) {
            if (blog.imageIconurl[0].url) {
              imageValue = blog.imageIconurl[0].url;
            } else if (blog.imageIconurl[0].originFileObj) {
              formData.append(`blogs[${index}].imageIconurl`, blog.imageIconurl[0].originFileObj);
            }
          }
        }

        if (!imageValue && !formData.has(`blogs[${index}].imageIconurl`)) {
          throw new Error(`Image for blog ${index} is required`);
        }

        return {
          imageIconurl: imageValue,
          category: blog.category,
          blogName: blog.blogName,
          description: blog.description,
        };
      });

      formData.append('blogs', JSON.stringify(blogsToSend));

      const response = await fetch('/api/blog-page/FeatReport', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editBlogs ? 'Blogs updated successfully!' : 'Blogs added successfully!');
        setBlogsModalOpen(false);
        setEditBlogs(null);
        blogsForm.resetFields();
        fetchBlogs();
      } else {
        message.error(result.message || 'Error adding blogs');
      }
    } catch (error) {
      console.error('Error adding blogs:', error);
      message.error(error.message || 'Error adding blogs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlogs = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/blog-page/FeatReport?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Report deleted successfully!');
        fetchBlogs();
      } else {
        message.error(result.message || 'Error deleting report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      message.error('Error deleting report');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={blogsSearchInput}
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
          setTimeout(() => blogsSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: blogsFilters[dataIndex] || null,
    render: text =>
      blogsSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[blogsSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setBlogsSearchText(selectedKeys[0]);
    setBlogsSearchedColumn(dataIndex);
    setBlogsFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setBlogsSearchText('');
    setBlogsSearchedColumn('');
    setBlogsFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllBlogsFilters = () => {
    setBlogsFilters({ mainTitle: null });
    setBlogsSearchText('');
    setBlogsSearchedColumn('');
  };

  const blogsColumns = [
    {
      title: 'Main Title',
      dataIndex: 'mainTitle',
      key: 'mainTitle',
      width: 200,
      ...getColumnSearchProps('mainTitle'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Reports',
      dataIndex: 'blogs',
      key: 'blogs',
      width: 400,
      render: (blogs) => {
        const filteredBlogs = selectedCategory
          ? blogs.filter(blog => blog.category === selectedCategory)
          : blogs;

        return (
          <div>
            {filteredBlogs && filteredBlogs.length > 0 ? (
              <Space direction="vertical" size="middle" className="w-full">
                {filteredBlogs.map((blog, index) => (
                  <Card
                    key={index}
                    size="small"
                    className="w-full bg-gray-50"
                    title={`Report ${index + 1}`}
                  >
                    <Space direction="vertical" className="w-full">
                      <div>
                        <Text strong>Image: </Text>
                        <Image
                          src={blog.imageIconurl}
                          alt={blog.blogName}
                          width={60}
                          height={60}
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <Text strong>Category: </Text>
                        <Text>{blog.category || 'N/A'}</Text>
                      </div>
                      <div>
                        <Text strong>Report Name: </Text>
                        <Text>{blog.blogName}</Text>
                      </div>
                      <div>
                        <Text strong>Description: </Text>
                        <Text>{blog.description || 'N/A'}</Text>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No reports in this category</Text>
            )}
          </div>
        );
      },
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
                  setEditBlogs(record);
                  const formBlogs = record.blogs.map(blog => ({
                    imageIconurl: blog.imageIconurl ? [{ url: blog.imageIconurl, uid: blog.imageIconurl, name: 'image' }] : [],
                    category: blog.category || '',
                    blogName: blog.blogName,
                    description: blog.description,
                  }));
                  blogsForm.setFieldsValue({
                    mainTitle: record.mainTitle,
                    blogs: formBlogs,
                  });
                  setBlogsModalOpen(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this report entry?"
              onConfirm={() => handleDeleteBlogs(record._id)}
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
    <div className='mt-10'>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Featured Reports</h2>
        <Space>
          <Button onClick={resetAllBlogsFilters} type="default">
            Reset Filters
          </Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditBlogs(null);
                blogsForm.resetFields();
                setBlogsModalOpen(true);
              }}
            >
              Add New Reports
            </Button>
          )}
        </Space>
      </div>

      <Select
        allowClear
        placeholder="Filter by Category"
        style={{ width: 200, marginBottom: 16 }}
        onChange={value => setSelectedCategory(value)}
      >
        {allCategoryOptions.map(category => (
          <Select.Option key={category} value={category}>
            {category}
          </Select.Option>
        ))}
      </Select>

      <Table
        columns={blogsColumns}
        dataSource={blogsEntries}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      {canEdit && (
        <Modal
          title={editBlogs ? 'Edit Reports' : 'Add New Reports'}
          open={blogsModalOpen}
          onCancel={() => {
            setBlogsModalOpen(false);
            setEditBlogs(null);
            blogsForm.resetFields();
          }}
          footer={null}
          width={800}
          className="top-5"
        >
          <Form
            form={blogsForm}
            layout="vertical"
            onFinish={handleBlogsSubmit}
            className="py-4"
          >
            <Form.Item
              name="mainTitle"
              label={<Text strong>Main Title</Text>}
              rules={[{ required: true, message: 'Please enter the main title' }]}
            >
              <Input placeholder="Enter main title" size="large" />
            </Form.Item>

            <Form.List name="reports">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      title={`Report ${name + 1}`}
                      extra={
                        <Tooltip title="Remove this report">
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-500 text-lg cursor-pointer"
                          />
                        </Tooltip>
                      }
                      className="mb-4 rounded-lg shadow-md"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'imageIconurl']}
                        label={<Text strong>Image Icon</Text>}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: 'Please upload an image' }]}
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
                      {blogsForm.getFieldValue(['blogs', name, 'imageIconurl']) &&
                        blogsForm.getFieldValue(['blogs', name, 'imageIconurl']).length > 0 &&
                        blogsForm.getFieldValue(['blogs', name, 'imageIconurl'])[0].url && (
                          <Form.Item label={<Text strong>Current Image</Text>}>
                            <Image
                              src={blogsForm.getFieldValue(['blogs', name, 'imageIconurl'])[0].url}
                              alt="Current"
                              width={120}
                              height={120}
                              className="object-cover rounded"
                            />
                          </Form.Item>
                        )}
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                        label={<Text strong>Category</Text>}
                      >
                        <Input.TextArea placeholder="Enter Category" rows={3} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'blogName']}
                        label={<Text strong>Report Name</Text>}
                        rules={[{ required: true, message: 'Please enter report name' }]}
                      >
                        <Input placeholder="Enter report name" size="large" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label={<Text strong>Description</Text>}
                      >
                        <Input.TextArea placeholder="Enter description" rows={3} />
                      </Form.Item>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      className="rounded-lg h-10"
                    >
                      Add New Report
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>


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
                  ? editBlogs
                    ? 'Updating...'
                    : 'Adding...'
                  : editBlogs
                    ? 'Update Reports'
                    : 'Add Reports'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}