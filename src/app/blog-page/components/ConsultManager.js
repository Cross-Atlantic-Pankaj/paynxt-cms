'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function ConsultManager() {
  const [platformSections, setPlatformSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [platformSectionModalOpen, setPlatformSectionModalOpen] = useState(false);
  const [editPlatformSection, setEditPlatformSection] = useState(null);
  const [platformSectionForm] = Form.useForm();
  const [platformSectionFilters, setPlatformSectionFilters] = useState({ title: null, description: null, clickText: null, url: null });
  const [platformSectionSearchText, setPlatformSectionSearchText] = useState('');
  const [platformSectionSearchedColumn, setPlatformSectionSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const platformSectionSearchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchPlatformSections();
  }, []);

  const fetchPlatformSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-page/consult');
      const data = await response.json();
      if (data.success) {
        setPlatformSections(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching platform sections:', error);
      message.error('Failed to fetch platform sections');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSectionSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editPlatformSection && editPlatformSection._id) values._id = editPlatformSection._id;
      else delete values._id;
      const response = await fetch('/api/blog-page/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editPlatformSection ? 'Platform section updated successfully!' : 'Platform section added successfully!');
        setPlatformSectionModalOpen(false);
        setEditPlatformSection(null);
        platformSectionForm.resetFields();
        fetchPlatformSections();
      } else {
        message.error(result.message || 'Error adding platform section');
      }
    } catch (error) {
      console.error('Error adding platform section:', error);
      message.error('Error adding platform section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlatformSection = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/blog-page/consult?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Platform section deleted successfully!');
        fetchPlatformSections();
      } else {
        message.error(result.message || 'Error deleting platform section');
      }
    } catch (error) {
      console.error('Error deleting platform section:', error);
      message.error('Error deleting platform section');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={platformSectionSearchInput}
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
          setTimeout(() => platformSectionSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: platformSectionFilters[dataIndex] || null,
    render: text =>
      platformSectionSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[platformSectionSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setPlatformSectionSearchText(selectedKeys[0]);
    setPlatformSectionSearchedColumn(dataIndex);
    setPlatformSectionFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setPlatformSectionSearchText('');
    setPlatformSectionSearchedColumn('');
    setPlatformSectionFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllPlatformSectionFilters = () => {
    setPlatformSectionFilters({ title: null, description: null, clickText: null, url: null });
    setPlatformSectionSearchText('');
    setPlatformSectionSearchedColumn('');
  };

  const platformSectionColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
      ...getColumnSearchProps('description'),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ...getColumnSearchProps('url'),
    },
    ...(canEdit ? [{
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditPlatformSection(record);
                platformSectionForm.setFieldsValue(record);
                setPlatformSectionModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this consult section?"
            onConfirm={() => handleDeletePlatformSection(record._id)}
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Consult Sections</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllPlatformSectionFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditPlatformSection(null);
                platformSectionForm.resetFields();
                setPlatformSectionModalOpen(true);
              }}
            >
              Add Consult Sections
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={platformSectionColumns}
        dataSource={platformSections}
        rowKey="_id"
        loading={loading}
      />

      {canEdit && (
        <Modal
          title={editPlatformSection ? "Edit Consult Section" : "Add Consult Section"}
          open={platformSectionModalOpen}
          onCancel={() => {
            setPlatformSectionModalOpen(false);
            setEditPlatformSection(null);
            platformSectionForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={platformSectionForm}
            layout="vertical"
            onFinish={handlePlatformSectionSubmit}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
            >
              <Input placeholder="Enter description" />
            </Form.Item>
            <Form.Item
              name="clickText"
              label="Click Text"
            >
              <Input placeholder="Enter click text" />
            </Form.Item>
            <Form.Item
              name="url"
              label="URL"
              rules={[{ required: true, message: 'Please enter URL' }]}
            >
              <Input placeholder="Enter URL" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? editPlatformSection
                    ? 'Updating...'
                    : 'Adding...'
                  : editPlatformSection
                  ? 'Update Consult Section'
                  : 'Add Consult Section'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}