'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Card, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

const { Text } = Typography;

export default function OurStrengthManager() {
  const [ourStrengths, setOurStrengths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ourStrengthModalOpen, setOurStrengthModalOpen] = useState(false);
  const [editOurStrength, setEditOurStrength] = useState(null);
  const [ourStrengthForm] = Form.useForm();
  const [ourStrengthFilters, setOurStrengthFilters] = useState({ title: null });
  const [ourStrengthSearchText, setOurStrengthSearchText] = useState('');
  const [ourStrengthSearchedColumn, setOurStrengthSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ourStrengthSearchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchOurStrengths();
  }, []);

  const fetchOurStrengths = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/repstrength');
      const data = await response.json();
      if (data.success) {
        setOurStrengths(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching our strengths:', error);
      message.error('Failed to fetch our strengths');
    } finally {
      setLoading(false);
    }
  };

  const handleOurStrengthSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editOurStrength && editOurStrength._id) formData.append('_id', editOurStrength._id);
      formData.append('title', values.title);

      const sections = values.sections || [];
      if (sections.length === 0) {
        throw new Error('At least one section is required');
      }

      const sectionsToSend = sections.map((section, index) => {
        let imageValue = null;

        if (section.image) {
          if (section.image.file) {
            formData.append(`sections[${index}].image`, section.image.file.originFileObj);
          } else if (Array.isArray(section.image) && section.image.length > 0) {
            if (section.image[0].url) {
              imageValue = section.image[0].url;
            } else if (section.image[0].originFileObj) {
              formData.append(`sections[${index}].image`, section.image[0].originFileObj);
            }
          }
        }

        if (!imageValue && !formData.has(`sections[${index}].image`)) {
          throw new Error(`Image for section ${index} is required`);
        }

        return {
          image: imageValue,
          imageTitle: section.imageTitle,
          description: section.description
        };
      });

      formData.append('sections', JSON.stringify(sectionsToSend));

      const response = await fetch('/api/reports/repstrength', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editOurStrength ? 'OurStrength updated successfully!' : 'OurStrength added successfully!');
        setOurStrengthModalOpen(false);
        setEditOurStrength(null);
        ourStrengthForm.resetFields();
        fetchOurStrengths();
      } else {
        message.error(result.message || 'Error adding our strength');
      }
    } catch (error) {
      console.error('Error adding our strength:', error);
      message.error(error.message || 'Error adding our strength');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOurStrength = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/reports/repstrength?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('OurStrength deleted successfully!');
        fetchOurStrengths();
      } else {
        message.error(result.message || 'Error deleting our strength');
      }
    } catch (error) {
      console.error('Error deleting our strength:', error);
      message.error('Error deleting our strength');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={ourStrengthSearchInput}
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
          setTimeout(() => ourStrengthSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: ourStrengthFilters[dataIndex] || null,
    render: text =>
      ourStrengthSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[ourStrengthSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setOurStrengthSearchText(selectedKeys[0]);
    setOurStrengthSearchedColumn(dataIndex);
    setOurStrengthFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setOurStrengthSearchText('');
    setOurStrengthSearchedColumn('');
    setOurStrengthFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllOurStrengthFilters = () => {
    setOurStrengthFilters({ title: null });
    setOurStrengthSearchText('');
    setOurStrengthSearchedColumn('');
  };

  const ourStrengthColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ...getColumnSearchProps('title'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Sections',
      dataIndex: 'sections',
      key: 'sections',
      width: 400,
      render: (sections) => (
        <div>
          {sections && sections.length > 0 ? (
            <Space direction="vertical" size="middle" className="w-full">
              {sections.map((section, index) => (
                <Card
                  key={index}
                  size="small"
                  className="w-full bg-gray-50"
                  title={`Section ${index + 1}`}
                >
                  <Space direction="vertical" className="w-full">
                    <div>
                      <Text strong>Image: </Text>
                      <Image
                        src={section.image}
                        alt={section.imageTitle}
                        width={60}
                        height={60}
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <Text strong>Image Title: </Text>
                      <Text>{section.imageTitle}</Text>
                    </div>
                    <div>
                      <Text strong>Description: </Text>
                      <Text>{section.description || 'N/A'}</Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No sections available</Text>
          )}
        </div>
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
                setEditOurStrength(record);
                const formSections = record.sections.map(section => ({
                  image: section.image ? [{ url: section.image, uid: section.image, name: 'image' }] : [],
                  imageTitle: section.imageTitle,
                  description: section.description,
                }));
                ourStrengthForm.setFieldsValue({
                  title: record.title,
                  sections: formSections,
                });
                setOurStrengthModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this strength?"
            onConfirm={() => handleDeleteOurStrength(record._id)}
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Our Strengths</h2>
        <Space>
          <Button onClick={resetAllOurStrengthFilters} type="default">
            Reset Filters
          </Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditOurStrength(null);
                ourStrengthForm.resetFields();
                setOurStrengthModalOpen(true);
              }}
            >
              Add New Strength
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={ourStrengthColumns}
        dataSource={ourStrengths}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      {canEdit && (
        <Modal
          title={editOurStrength ? 'Edit Strength' : 'Add New Strength'}
          open={ourStrengthModalOpen}
          onCancel={() => {
            setOurStrengthModalOpen(false);
            setEditOurStrength(null);
            ourStrengthForm.resetFields();
          }}
          footer={null}
          width={800}
          className="top-5"
        >
          <Form
            form={ourStrengthForm}
            layout="vertical"
            onFinish={handleOurStrengthSubmit}
            className="py-4"
          >
            <Form.Item
              name="title"
              label={<Text strong>Title</Text>}
              rules={[{ required: true, message: 'Please enter the title' }]}
            >
              <Input placeholder="Enter title" size="large" />
            </Form.Item>

            <Form.List name="sections">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      title={`Section ${name + 1}`}
                      extra={
                        <Tooltip title="Remove this section">
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
                        name={[name, 'image']}
                        label={<Text strong>Image</Text>}
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
                      {ourStrengthForm.getFieldValue(['sections', name, 'image']) &&
                        ourStrengthForm.getFieldValue(['sections', name, 'image']).length > 0 &&
                        ourStrengthForm.getFieldValue(['sections', name, 'image'])[0].url && (
                          <Form.Item label={<Text strong>Current Image</Text>}>
                            <Image
                              src={ourStrengthForm.getFieldValue(['sections', name, 'image'])[0].url}
                              alt="Current"
                              width={120}
                              height={120}
                              className="object-cover rounded"
                            />
                          </Form.Item>
                        )}
                      <Form.Item
                        {...restField}
                        name={[name, 'imageTitle']}
                        label={<Text strong>Image Title</Text>}
                        rules={[{ required: true, message: 'Please enter image title' }]}
                      >
                        <Input placeholder="Enter image title" size="large" />
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
                      Add New Section
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
                  ? editOurStrength
                    ? 'Updating...'
                    : 'Adding...'
                  : editOurStrength
                  ? 'Update Strength'
                  : 'Add Strength'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}