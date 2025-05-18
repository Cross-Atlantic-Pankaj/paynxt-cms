'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

export default function ProductCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryForm] = Form.useForm();
  const [categoryFilters, setCategoryFilters] = useState({ productCategoryName: null });
  const [categorySearchText, setCategorySearchText] = useState('');
  const [categorySearchedColumn, setCategorySearchedColumn] = useState('');
  const searchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-category');
      const data = await response.json();
      if (data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
      message.error('Failed to fetch product categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      if (editCategory && editCategory._id) values._id = editCategory._id;
      else delete values._id;

      const response = await fetch('/api/product-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success(editCategory ? 'Product category updated successfully!' : 'Product category added successfully!');
        setCategoryModalOpen(false);
        setEditCategory(null);
        categoryForm.resetFields();
        fetchCategories();
      } else {
        message.error(result.message || 'Error updating product category');
      }
    } catch (error) {
      console.error('Error updating product category:', error);
      message.error('Error updating product category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/product-category?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Product category deleted successfully!');
        fetchCategories();
      } else {
        message.error(result.message || 'Error deleting product category');
      }
    } catch (error) {
      console.error('Error deleting product category:', error);
      message.error('Error deleting product category');
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
    filteredValue: categoryFilters[dataIndex] || null,
    render: (text) =>
      categorySearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[categorySearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setCategorySearchText(selectedKeys[0]);
    setCategorySearchedColumn(dataIndex);
    setCategoryFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setCategorySearchText('');
    setCategorySearchedColumn('');
    setCategoryFilters((prev) => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllCategoryFilters = () => {
    setCategoryFilters({ productCategoryName: null });
    setCategorySearchText('');
    setCategorySearchedColumn('');
  };

  const categoryColumns = [
    {
      title: 'Category Name',
      dataIndex: 'productCategoryName',
      key: 'productCategoryName',
      ...getColumnSearchProps('productCategoryName'),
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
                      setEditCategory(record);
                      categoryForm.setFieldsValue(record);
                      setCategoryModalOpen(true);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this product category?"
                  onConfirm={() => handleDeleteCategory(record._id)}
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Product Categories</h2>
        <div className="flex gap-2">
          <Button onClick={resetAllCategoryFilters}>Reset Filters</Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditCategory(null);
                categoryForm.resetFields();
                setCategoryModalOpen(true);
              }}
            >
              Add Category
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={categoryColumns}
        dataSource={Array.isArray(categories) ? categories : []}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      {canEdit && (
        <Modal
          title={editCategory ? 'Edit Category' : 'Add Category'}
          open={categoryModalOpen}
          onCancel={() => {
            setCategoryModalOpen(false);
            setEditCategory(null);
            categoryForm.resetFields();
          }}
          footer={null}
        >
          <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit}>
            <Form.Item
              name="productCategoryName"
              label="Category Name"
              rules={[{ required: true, message: 'Please enter category name' }]}
            >
              <Input placeholder="Enter category name" />
            </Form.Item>
            <Form.Item name="generalComment" label="General Comment">
              <Input.TextArea placeholder="Enter general comment" rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editCategory ? 'Update' : 'Add'} Category
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}