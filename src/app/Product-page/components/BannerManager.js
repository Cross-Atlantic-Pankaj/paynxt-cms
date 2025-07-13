'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Tag, Select, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function BannerManager() {
  const [topBanners, setTopBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [bannerForm] = Form.useForm();
  const [bannerFilters, setBannerFilters] = useState({ pageTitle: null, bannerTitle: null, bannerDescription: null, tags: null, slug: null });
  const [bannerSearchText, setBannerSearchText] = useState('');
  const [bannerSearchedColumn, setBannerSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [isBannerSectionCollapsed, setIsBannerSectionCollapsed] = useState(false);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchTopBanners();
  }, []);

  const fetchTopBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/top-banner');
      const data = await response.json();
      if (data.success) {
        setTopBanners(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching top banners:', error);
      message.error('Failed to fetch top banners');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      values.tags = values.tags || [];
      if (editBanner && editBanner._id) values._id = editBanner._id;
      else delete values._id;

      // console.log('handleBannerSubmit values:', values);

      const response = await fetch('/api/product-page/top-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editBanner ? 'Top banner updated successfully!' : 'Top banner added successfully!');
        setBannerModalOpen(false);
        setEditBanner(null);
        bannerForm.resetFields();
        fetchTopBanners();
      } else {
        message.error(result.message || 'Error updating top banner');
      }
    } catch (error) {
      console.error('Error updating top banner:', error);
      message.error('Error updating top banner');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/product-page/top-banner?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Top banner deleted successfully!');
        fetchTopBanners();
      } else {
        message.error(result.message || 'Error deleting top banner');
      }
    } catch (error) {
      console.error('Error deleting top banner:', error);
      message.error('Error deleting top banner');
    }
  };

  const getColumnSearchProps = (dataIndex, isTagColumn = false) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      if (isTagColumn) {
        return record[dataIndex]?.some((tag) =>
          tag.toLowerCase().includes(value.toLowerCase())
        ) || false;
      }
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: bannerFilters[dataIndex] || null,
    render: (text) => {
      if (isTagColumn) {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Array.isArray(text) && text.length > 0 ? (
              text.map((tag) => (
                <Tag key={tag} color="blue">
                  {bannerSearchedColumn === dataIndex ? (
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                      searchWords={[bannerSearchText]}
                      autoEscape
                      textToHighlight={tag}
                    />
                  ) : (
                    tag
                  )}
                </Tag>
              ))
            ) : (
              <span>-</span>
            )}
          </div>
        );
      }
      return bannerSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[bannerSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    },
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setBannerSearchText(selectedKeys[0]);
    setBannerSearchedColumn(dataIndex);
    setBannerFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setBannerSearchText('');
    setBannerSearchedColumn('');
    setBannerFilters((prev) => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllBannerFilters = () => {
    setBannerFilters({ pageTitle: null, bannerTitle: null, bannerDescription: null, tags: null, slug: null });
    setBannerSearchText('');
    setBannerSearchedColumn('');
  };

  const bannerColumns = [
    {
      title: 'Page Title',
      dataIndex: 'pageTitle',
      key: 'pageTitle',
      ...getColumnSearchProps('pageTitle'),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ...getColumnSearchProps('slug'),  // if you want search on slug too
      render: (slug) => slug ? <Tag color="blue">{slug}</Tag> : <Tag color="default">Global</Tag>
    },
    {
      title: 'Banner Title',
      dataIndex: 'bannerTitle',
      key: 'bannerTitle',
      ...getColumnSearchProps('bannerTitle'),
    },
    {
      title: 'Banner Description',
      dataIndex: 'bannerDescription',
      key: 'bannerDescription',
      ...getColumnSearchProps('bannerDescription'),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      ...getColumnSearchProps('tags', true),
    },
    ...(canEdit
      ? [
        {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <div className="flex gap-2">
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditBanner(record);
                    bannerForm.setFieldsValue(record);
                    setBannerModalOpen(true);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this top banner?"
                onConfirm={() => handleDeleteBanner(record._id)}
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
      ]
      : []),
  ];

  return (
    <div className="mb-6">
      <div
        className="flex justify-between items-center p-3 rounded-md bg-[#f8f9fa] hover:bg-[#e9ecef] cursor-pointer border mb-2 transition"
        onClick={() => setIsBannerSectionCollapsed(!isBannerSectionCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Top Banners</h2>
          <span className="transition-transform duration-300"
            style={{ transform: isBannerSectionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        {!isBannerSectionCollapsed && (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={(e) => { e.stopPropagation(); resetAllBannerFilters(); }}
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
                  setEditBanner(null);
                  bannerForm.resetFields();
                  setBannerModalOpen(true);
                }}
              >
                Add Banner
              </Button>
            )}
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isBannerSectionCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}
      >
        <div className="p-2">
          <Table
            columns={bannerColumns}
            dataSource={Array.isArray(topBanners) ? topBanners : []}
            rowKey="_id"
            loading={loading}
            pagination={false}
            size="middle"
          />
        </div>
      </div>

      {canEdit && (
        <Modal
          title={editBanner ? 'Edit Banner' : 'Add Banner'}
          open={bannerModalOpen}
          onCancel={() => {
            setBannerModalOpen(false);
            setEditBanner(null);
            bannerForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={bannerForm}
            layout="vertical"
            onFinish={handleBannerSubmit}
          >
            <Form.Item
              name="pageTitle"
              label="Page Title"
              rules={[{ required: true, message: 'Please enter page title' }]}
            >
              <Input placeholder="Enter page title" />
            </Form.Item>
            <Form.Item name="isGlobal" label="Make Global Banner" valuePropName="checked">
              <Checkbox>Use as global banner (show on all pages without specific slug)</Checkbox>
            </Form.Item>

            <Form.Item
              name="slug"
              label="Slug"
              tooltip="Optional. Leave empty to auto-generate from Page Title"
            >
              <Input placeholder="Auto-generated from title if left empty" />
            </Form.Item>
            <Form.Item
              name="bannerTitle"
              label="Banner Title"
              rules={[{ required: true, message: 'Please enter banner title' }]}
            >
              <Input placeholder="Enter banner title" />
            </Form.Item>
            <Form.Item
              name="bannerDescription"
              label="Banner Description"
              rules={[{ required: true, message: 'Please enter banner description' }]}
            >
              <Input.TextArea placeholder="Enter banner description" rows={5} />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Enter tags and press Enter"
                dropdownRender={() => null}
                tokenSeparators={[',', ' ']}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editBanner ? 'Update' : 'Add'} Banner
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}