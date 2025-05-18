'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function ProductSubCategoryManager() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [editSubCategory, setEditSubCategory] = useState(null);
  const [subCategoryForm] = Form.useForm();
  const [subCategoryFilters, setSubCategoryFilters] = useState({ subProductName: null });
  const [subCategorySearchText, setSubCategorySearchText] = useState('');
  const [subCategorySearchedColumn, setSubCategorySearchedColumn] = useState('');
  const searchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-subcategory');
      const data = await response.json();
      if (data.success) {
        setSubCategories(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching product subcategories:', error);
      message.error('Failed to fetch product subcategories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/product-category');
      const data = await response.json();
      if (data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
      message.error('Failed to fetch product categories');
    }
  };

  const handleSubCategorySubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editSubCategory && editSubCategory._id) values._id = editSubCategory._id;
      else delete values._id;

      const response = await fetch('/api/product-subcategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editSubCategory ? 'Product subcategory updated successfully!' : 'Product subcategory added successfully!');
        setSubCategoryModalOpen(false);
        setEditSubCategory(null);
        subCategoryForm.resetFields();
        fetchSubCategories();
      } else {
        message.error(result.message || 'Error updating product subcategory');
      }
    } catch (error) {
      console.error('Error updating product subcategory:', error);
      message.error('Error updating product subcategory');
    }
  };

  const handleDeleteSubCategory = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/product-subcategory?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Product subcategory deleted successfully!');
        fetchSubCategories();
      } else {
        message.error(result.message || 'Error deleting product subcategory');
      }
    } catch (error) {
      console.error('Error deleting product subcategory:', error);
      message.error('Error deleting product subcategory');
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
    filteredValue: subCategoryFilters[dataIndex] || null,
    render: (text) =>
      subCategorySearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[subCategorySearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSubCategorySearchText(selectedKeys[0]);
    setSubCategorySearchedColumn(dataIndex);
    setSubCategoryFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSubCategorySearchText('');
    setSubCategorySearchedColumn('');
    setSubCategoryFilters((prev) => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllSubCategoryFilters = () => {
    setSubCategoryFilters({ subProductName: null });
    setSubCategorySearchText('');
    setSubCategorySearchedColumn('');
  };

  const subCategoryColumns = [
    {
      title: 'Subcategory Name',
      dataIndex: 'subProductName',
      key: 'subProductName',
      ...getColumnSearchProps('subProductName'),
    },
    {
      title: 'Category',
      dataIndex: ['productCategoryId', 'productCategoryName'],
      key: 'productCategoryName',
      render: (text) => text || '-',
    },
    {
      title: 'General Comment',
      dataIndex: 'generalComment',
      key: 'generalComment',
      render: (text) => text || '-',
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
                      setEditSubCategory(record);
                      subCategoryForm.setFieldsValue({
                        subProductName: record.subProductName,
                        productCategoryId: record.productCategoryId._id,
                        generalComment: record.generalComment,
                      });
                      setSubCategoryModalOpen(true);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this product subcategory?"
                  onConfirm={() => handleDeleteSubCategory(record._id)}
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
        <h2 className="text-2xl font-semibold">Product Subcategories</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllSubCategoryFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditSubCategory(null);
                subCategoryForm.resetFields();
                setSubCategoryModalOpen(true);
              }}
            >
              Add Subcategory
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={subCategoryColumns}
        dataSource={Array.isArray(subCategories) ? subCategories : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      {canEdit && (
        <Modal
          title={editSubCategory ? 'Edit Subcategory' : 'Add Subcategory'}
          open={subCategoryModalOpen}
          onCancel={() => {
            setSubCategoryModalOpen(false);
            setEditSubCategory(null);
            subCategoryForm.resetFields();
          }}
          footer={null}
        >
          <Form form={subCategoryForm} layout="vertical" onFinish={handleSubCategorySubmit}>
            <Form.Item
              name="subProductName"
              label="Subcategory Name"
              rules={[{ required: true, message: 'Please enter subcategory name' }]}
            >
              <Input placeholder="Enter subcategory name" />
            </Form.Item>
            <Form.Item
              name="productCategoryId"
              label="Product Category"
              rules={[{ required: true, message: 'Please select a product category' }]}
            >
              <Select placeholder="Select a product category">
                {categories.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.productCategoryName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="generalComment" label="General Comment">
              <Input.TextArea placeholder="Enter general comment" rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editSubCategory ? 'Update' : 'Add'} Subcategory
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}