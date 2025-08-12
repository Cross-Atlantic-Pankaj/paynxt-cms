'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Checkbox, Select, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';
import TiptapEditor from '@/components/TiptapEditor';

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
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);
  const isGlobal = Form.useWatch('isGlobal', form);

  useEffect(() => {
    fetch('/api/navbar')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const structuredOptions = data.data
            .map(section => ({
              section: section.section,
              links: Array.isArray(section.links) ? section.links : []
            }))
            .filter(sectionData => sectionData.links.length > 0); // ✅ remove empty sections
          setBannerOptions(structuredOptions);
        }
      })
      .catch(err => console.error('Failed to load navbar data:', err));
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

      if (values.pageTitle && typeof values.pageTitle === 'string') {
        const parsed = JSON.parse(values.pageTitle);
        values.pageTitle = parsed.title;
        values.slug = parsed.url; // pass this to API
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
      width: 250,
      render: (_, record) =>
        record.isGlobal ? (
          <Text type="secondary">🌐 Global</Text>
        ) : (
          <Text>{record.pageTitle || record.slug || 'Global'}</Text>
        ),
    },
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
                    form.setFieldsValue({
                      ...record,
                      pageTitle: record.isGlobal ? null : JSON.stringify({ title: record.pageTitle, url: record.slug })
                    });
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
      <div
        className="flex justify-between items-center p-3 rounded-md bg-[#f8f9fa] hover:bg-[#e9ecef] cursor-pointer border mb-2 transition"
        onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Sector Dynamics</h2>
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
          <div className="flex gap-2">
            <Button size="small" onClick={(e) => { e.stopPropagation(); resetAllFilters(); }}>
              Reset Filters
            </Button>
            {canEdit && (
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditRecord(null);
                  form.resetFields();
                  setModalOpen(true);
                }}
              >
                Add Sector Dynamics
              </Button>
            )}
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isSectionCollapsed ? 'max-h-0' : 'max-h-[2000px]'}`}
      >
        <div className="p-2">
          <Table
            columns={columns}
            dataSource={Array.isArray(sectorDynamics) ? sectorDynamics : []}
            rowKey="_id"
            loading={loading}
            pagination={false}
          />
        </div>
      </div>

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
          width="90vw"
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

            <Form.Item name="pageTitle" label="Page Title">
              <Select
                allowClear
                placeholder="Select page title from navbar"
              >
                {bannerOptions.map((sectionData, sectionIdx) => (
                  <Select.OptGroup
                    key={`section-${sectionIdx}`}
                    label={sectionData.section}
                  >
                    {sectionData.links.map((link, linkIdx) => (
                      <Select.Option
                        key={`link-${sectionIdx}-${linkIdx}`}
                        value={JSON.stringify({ title: link.title, url: link.url })} // Or change to `${sectionData.section}|${link.title}` if you need both
                      >
                        {link.title}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="text"
              label="Text"
              rules={[{ required: true, message: 'Please enter text' }]}
            >
              {/* <Input.TextArea placeholder="Enter sector dynamics text" rows={20} /> */}
              <TiptapEditor />
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