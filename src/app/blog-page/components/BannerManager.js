'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Tag, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function BannerManager() {
  const [topBanners, setTopBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [bannerForm] = Form.useForm();
  const [bannerFilters, setBannerFilters] = useState({ bannerTitle: null, bannerDescription: null, tags: null });
  const [bannerSearchText, setBannerSearchText] = useState('');
  const [bannerSearchedColumn, setBannerSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor', 'blogger'].includes(userRole);

  useEffect(() => {
    fetchTopBanners();
  }, []);

  const fetchTopBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-page/top-banner');
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

      const response = await fetch('/api/blog-page/top-banner', {
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
      const response = await fetch(`/api/blog-page/top-banner?id=${id}`, {
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
    setBannerFilters({ bannerTitle: null, bannerDescription: null, tags: null });
    setBannerSearchText('');
    setBannerSearchedColumn('');
  };

  const bannerColumns = [
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Top Banners</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllBannerFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditBanner(null);
                bannerForm.resetFields();
                setBannerModalOpen(true);
              }}
            >
              Add Banner
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={bannerColumns}
        dataSource={Array.isArray(topBanners) ? topBanners : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

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
          width="90vw"
        >
          <Form
            form={bannerForm}
            layout="vertical"
            onFinish={handleBannerSubmit}
          >
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
              <Input.TextArea placeholder="Enter banner description" rows={6} />
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