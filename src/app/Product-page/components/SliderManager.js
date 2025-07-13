'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Tag, Checkbox, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function SliderManager() {
  const [bannerOptions, setBannerOptions] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [editSlider, setEditSlider] = useState(null);
  const [sliderForm] = Form.useForm();
  const [sliderFilters, setSliderFilters] = useState({ typeText: null, title: null, shortDescription: null, url: null });
  const [sliderSearchText, setSliderSearchText] = useState('');
  const [sliderSearchedColumn, setSliderSearchedColumn] = useState('');
  const sliderSearchInput = useRef(null);
  const [isSliderSectionCollapsed, setIsSliderSectionCollapsed] = useState(false);


  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchSliders();
    fetch('/api/product-page/top-banner')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBannerOptions(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(err => console.error('Failed to load banners:', err));
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/slider');
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
      // attach existing ID if editing
      if (editSlider && editSlider._id) {
        values._id = editSlider._id;
      } else {
        delete values._id;
      }

      // explicitly pass isGlobal (ensure it's boolean) and pageTitle (string or null)
      const payload = {
        ...values,
        isGlobal: values.isGlobal || false,
        pageTitle: values.pageTitle || null,
      };

      const response = await fetch('/api/product-page/slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      const response = await fetch(`/api/product-page/slider?id=${id}`, {
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
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ...getColumnSearchProps('slug'),  // if you want search
      render: (slug) => slug ? <Tag color="blue">{slug}</Tag> : <Tag color="default">Global</Tag>
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

  const sortedSliders = [...sliders].sort((a, b) => {
    const slugA = a.slug?.toLowerCase() || '';
    const slugB = b.slug?.toLowerCase() || '';
    if (slugA < slugB) return -1;
    if (slugA > slugB) return 1;
    // optional: secondary sort by title
    return (a.title || '').localeCompare(b.title || '');
  });

  return (
    <div>
      <div
        className="flex justify-between items-center p-3 rounded-md bg-[#f8f9fa] hover:bg-[#e9ecef] cursor-pointer border mb-2 transition"
        onClick={() => setIsSliderSectionCollapsed(!isSliderSectionCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Slider Items</h2>
          <span
            className="transition-transform duration-300"
            style={{ transform: isSliderSectionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        {!isSliderSectionCollapsed && (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={(e) => { e.stopPropagation(); resetAllSliderFilters(); }}
            >
              Reset Filters
            </Button>
            {canEdit && (
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditSlider(null);
                  sliderForm.resetFields();
                  setSliderModalOpen(true);
                }}
              >
                Add Slider Item
              </Button>
            )}
          </div>
        )}
      </div>
      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isSliderSectionCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}
      >
        <div className="p-2">
          <Table
            columns={sliderColumns}
            dataSource={sortedSliders}
            rowKey="_id"
            loading={loading}
            pagination={false}
            size="middle"
          />
        </div>
      </div>

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
            <Form.Item name="isGlobal" valuePropName="checked">
              <Checkbox>Use as Global (show on all pages)</Checkbox>
            </Form.Item>
            <Form.Item name="pageTitle" label="Page Title">
              <Select
                allowClear
                placeholder="Select page title from banners"
                disabled={sliderForm.getFieldValue('isGlobal')}
              >
                {bannerOptions.map(banner => (
                  <Select.Option key={banner._id} value={banner.pageTitle}>
                    {banner.pageTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="slug"
              label="Slug (optional)"
              tooltip="Leave empty for global slider, or enter page slug to show only on that page"
            >
              <Input placeholder="e.g., b2c-payment-intelligence" />
            </Form.Item>

            <Form.Item
              name="shortDescription"
              label="Short Description"
            >
              <Input.TextArea placeholder="Enter short description" rows={5} />
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