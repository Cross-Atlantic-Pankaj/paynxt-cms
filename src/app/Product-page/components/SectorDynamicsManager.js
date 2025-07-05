'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Checkbox, Select, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

const { Text } = Typography;

export default function SectorDynamicsManager() {
  const [sectorDynamics, setSectorDynamics] = useState([]);
  const [bannerOptions, setBannerOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filters, setFilters] = useState({ text: null });
  const searchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);
  const isGlobal = Form.useWatch('isGlobal', form);

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
    fetchSectorDynamics();
  }, []);

  const fetchSectorDynamics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-page/sector-dynamics');
      const data = await response.json();
      if (data.success) {
        setSectorDynamics(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching sector dynamics:', error);
      message.error('Failed to fetch sector dynamics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editRecord && editRecord._id) values._id = editRecord._id;
      else delete values._id;

      // Make sure isGlobal is boolean
      values.isGlobal = !!values.isGlobal;
      if (values.isGlobal) {
        values.pageTitle = null; // if global, clear pageTitle
      }

      const response = await fetch('/api/product-page/sector-dynamics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editRecord ? 'Sector dynamics updated successfully!' : 'Sector dynamics added successfully!');
        setModalOpen(false);
        setEditRecord(null);
        form.resetFields();
        fetchSectorDynamics();
      } else {
        message.error(result.message || 'Error updating sector dynamics');
      }
    } catch (error) {
      console.error('Error updating sector dynamics:', error);
      message.error('Error updating sector dynamics');
    }
  };


  const handleDelete = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/product-page/sector-dynamics?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Sector dynamics deleted successfully!');
        fetchSectorDynamics();
      } else {
        message.error(result.message || 'Error deleting sector dynamics');
      }
    } catch (error) {
      console.error('Error deleting sector dynamics:', error);
      message.error('Error deleting sector dynamics');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
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
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: filters[dataIndex] || null,
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    setFilters((prev) => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllFilters = () => {
    setFilters({ text: null });
    setSearchText('');
    setSearchedColumn('');
  };

  const columns = [
    {
      title: 'Page',
      dataIndex: 'isGlobal',
      key: 'isGlobal',
      render: (_, record) =>
        record.isGlobal ? (
          <Text type="secondary">🌐 Global</Text>
        ) : (
          <Text>{record.pageTitle || record.slug || 'Global'}</Text>
        ),
    },
    // {
    //   title: 'Slug',
    //   dataIndex: 'slug',
    //   key: 'slug',
    //   render: slug => <Text type="secondary">{slug}</Text>,
    // },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      ...getColumnSearchProps('text'),
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
                    setEditRecord(record);
                    form.setFieldsValue(record);
                    setModalOpen(true);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this sector dynamics?"
                onConfirm={() => handleDelete(record._id)}
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
    <div className="my-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sector Dynamics</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditRecord(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Add Sector Dynamics
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={Array.isArray(sectorDynamics) ? sectorDynamics : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      {canEdit && (
        <Modal
          title={editRecord ? 'Edit Sector Dynamics' : 'Add Sector Dynamics'}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditRecord(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="isGlobal" valuePropName="checked" initialValue={false}>
              <Checkbox onChange={(e) => {
                const checked = e.target.checked;
                form.setFieldValue('pageTitle', null);  // reset if global
              }}>
                Global (show on all pages)
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="pageTitle"
              label="Select Page Title"
              rules={[
                { required: !form.getFieldValue('isGlobal'), message: 'Please select page title' }
              ]}
            >
              <Select
                disabled={isGlobal}
                placeholder="Select page title"
                options={bannerOptions.map(b => ({ label: b.pageTitle, value: b.pageTitle }))}
                showSearch
              />
            </Form.Item>


            <Form.Item
              name="text"
              label="Text"
              rules={[{ required: true, message: 'Please enter text' }]}
            >
              <Input placeholder="Enter sector dynamics text" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editRecord ? 'Update' : 'Add'} Sector Dynamics
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}