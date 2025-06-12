'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function SliderManager() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [editSlider, setEditSlider] = useState(null);
  const [sliderForm] = Form.useForm();
  const [sliderFilters, setSliderFilters] = useState({ typeText: null, title: null, shortDescription: null, url: null });
  const [sliderSearchText, setSliderSearchText] = useState('');
  const [sliderSearchedColumn, setSliderSearchedColumn] = useState('');
  const sliderSearchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/view-point/slider');
      const data = await response.json();
      if (data.success) {
        setSliders(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching sliders:', error);
      message.error('Failed to fetch sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editSlider && editSlider._id) values._id = editSlider._id;
      else delete values._id;
      const response = await fetch('/api/view-point/slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editSlider ? 'Slider item updated successfully!' : 'Slider item added successfully!');
        setSliderModalOpen(false);
        setEditSlider(null);
        sliderForm.resetFields();
        fetchSliders();
      } else {
        message.error(result.message || 'Error adding slider item');
      }
    } catch (error) {
      console.error('Error adding slider item:', error);
      message.error('Error adding slider item');
    }
  };

  const handleDeleteSlider = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/view-point/slider?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Slider item deleted successfully!');
        fetchSliders();
      } else {
        message.error(result.message || 'Error deleting slider item');
      }
    } catch (error) {
      console.error('Error deleting slider item:', error);
      message.error('Error deleting slider item');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={sliderSearchInput}
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
          setTimeout(() => sliderSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: sliderFilters[dataIndex] || null,
    render: text =>
      sliderSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[sliderSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSliderSearchText(selectedKeys[0]);
    setSliderSearchedColumn(dataIndex);
    setSliderFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSliderSearchText('');
    setSliderSearchedColumn('');
    setSliderFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllSliderFilters = () => {
    setSliderFilters({ typeText: null, title: null, shortDescription: null, url: null });
    setSliderSearchText('');
    setSliderSearchedColumn('');
  };

  const sliderColumns = [
    {
      title: 'Type Text',
      dataIndex: 'typeText',
      key: 'typeText',
      ...getColumnSearchProps('typeText'),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Description',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      render: (text) => text || '-',
      ...getColumnSearchProps('shortDescription'),
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
                setEditSlider(record);
                sliderForm.setFieldsValue(record);
                setSliderModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this slider item?"
            onConfirm={() => handleDeleteSlider(record._id)}
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
        <h2 className="text-2xl font-semibold">Slider Items</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllSliderFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditSlider(null);
                sliderForm.resetFields();
                setSliderModalOpen(true);
              }}
            >
              Add Slider Item
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={sliderColumns}
        dataSource={sliders}
        rowKey="_id"
        loading={loading}
      />

      {canEdit && (
        <Modal
          title={editSlider ? "Edit Slider Item" : "Add Slider Item"}
          open={sliderModalOpen}
          onCancel={() => {
            setSliderModalOpen(false);
            setEditSlider(null);
            sliderForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={sliderForm}
            layout="vertical"
            onFinish={handleSliderSubmit}
          >
            <Form.Item
              name="typeText"
              label="Type Text"
              rules={[{ required: true, message: 'Please enter type text' }]}
            >
              <Input placeholder="Enter type text" />
            </Form.Item>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="shortDescription"
              label="Short Description"
            >
              <Input placeholder="Enter short description" />
            </Form.Item>
            <Form.Item
              name="url"
              label="URL"
              rules={[{ required: true, message: 'Please enter URL' }]}
            >
              <Input placeholder="Enter URL" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editSlider ? "Update" : "Add"} Slider Item
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}