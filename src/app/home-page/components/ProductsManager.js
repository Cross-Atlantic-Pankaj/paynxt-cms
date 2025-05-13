'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Upload, Image, Card, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';

const { Text } = Typography;

export default function ProductsManager() {
  const [productsEntries, setProductsEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [editProducts, setEditProducts] = useState(null);
  const [productsForm] = Form.useForm();
  const [productsFilters, setProductsFilters] = useState({ mainTitle: null });
  const [productsSearchText, setProductsSearchText] = useState('');
  const [productsSearchedColumn, setProductsSearchedColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const productsSearchInput = useRef(null);

  const userRole = Cookies.get('admin_role');
  const canEdit = ['superadmin', 'editor'].includes(userRole);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-page/products');
      const data = await response.json();
      if (data.success) {
        setProductsEntries(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductsSubmit = async (values) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (editProducts && editProducts._id) formData.append('_id', editProducts._id);
      formData.append('mainTitle', values.mainTitle);

      const products = values.products || [];
      if (products.length === 0) {
        throw new Error('At least one product is required');
      }

      const productsToSend = products.map((product, index) => {
        let imageValue = null;

        if (product.imageIconurl) {
          if (product.imageIconurl.file) {
            formData.append(`products[${index}].imageIconurl`, product.imageIconurl.file.originFileObj);
          } else if (Array.isArray(product.imageIconurl) && product.imageIconurl.length > 0) {
            if (product.imageIconurl[0].url) {
              imageValue = product.imageIconurl[0].url;
            } else if (product.imageIconurl[0].originFileObj) {
              formData.append(`products[${index}].imageIconurl`, product.imageIconurl[0].originFileObj);
            }
          }
        }

        if (!imageValue && !formData.has(`products[${index}].imageIconurl`)) {
          throw new Error(`Image for product ${index} is required`);
        }

        return {
          imageIconurl: imageValue,
          productName: product.productName,
          description: product.description,
        };
      });

      formData.append('products', JSON.stringify(productsToSend));

      const response = await fetch('/api/home-page/products', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success(editProducts ? 'Products updated successfully!' : 'Products added successfully!');
        setProductsModalOpen(false);
        setEditProducts(null);
        productsForm.resetFields();
        fetchProducts();
      } else {
        message.error(result.message || 'Error adding products');
      }
    } catch (error) {
      console.error('Error adding products:', error);
      message.error(error.message || 'Error adding products');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProducts = async (id) => {
    if (!canEdit) {
      message.error('You do not have permission to perform this action');
      return;
    }
    try {
      const response = await fetch(`/api/home-page/products?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('Products deleted successfully!');
        fetchProducts();
      } else {
        message.error(result.message || 'Error deleting products');
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      message.error('Error deleting products');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={productsSearchInput}
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
          setTimeout(() => productsSearchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: productsFilters[dataIndex] || null,
    render: text =>
      productsSearchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[productsSearchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setProductsSearchText(selectedKeys[0]);
    setProductsSearchedColumn(dataIndex);
    setProductsFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setProductsSearchText('');
    setProductsSearchedColumn('');
    setProductsFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const resetAllProductsFilters = () => {
    setProductsFilters({ mainTitle: null });
    setProductsSearchText('');
    setProductsSearchedColumn('');
  };

  const productsColumns = [
    {
      title: 'Main Title',
      dataIndex: 'mainTitle',
      key: 'mainTitle',
      width: 200,
      ...getColumnSearchProps('mainTitle'),
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
      width: 400,
      render: (products) => (
        <div>
          {products && products.length > 0 ? (
            <Space direction="vertical" size="middle" className="w-full">
              {products.map((product, index) => (
                <Card
                  key={index}
                  size="small"
                  className="w-full bg-gray-50"
                  title={`Product ${index + 1}`}
                >
                  <Space direction="vertical" className="w-full">
                    <div>
                      <Text strong>Image: </Text>
                      <Image
                        src={product.imageIconurl}
                        alt={product.productName}
                        width={60}
                        height={60}
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <Text strong>Product Name: </Text>
                      <Text>{product.productName}</Text>
                    </div>
                    <div>
                      <Text strong>Description: </Text>
                      <Text>{product.description || 'N/A'}</Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No products available</Text>
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
                setEditProducts(record);
                const formProducts = record.products.map(product => ({
                  imageIconurl: product.imageIconurl ? [{ url: product.imageIconurl, uid: product.imageIconurl, name: 'image' }] : [],
                  productName: product.productName,
                  description: product.description,
                }));
                productsForm.setFieldsValue({
                  mainTitle: record.mainTitle,
                  products: formProducts,
                });
                setProductsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this products entry?"
            onConfirm={() => handleDeleteProducts(record._id)}
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
    <div className='mt-10'>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
        <Space>
          <Button onClick={resetAllProductsFilters} type="default">
            Reset Filters
          </Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditProducts(null);
                productsForm.resetFields();
                setProductsModalOpen(true);
              }}
            >
              Add New Products
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={productsColumns}
        dataSource={productsEntries}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        className="bg-white rounded-lg shadow-sm"
      />

      {canEdit && (
        <Modal
          title={editProducts ? 'Edit Products' : 'Add New Products'}
          open={productsModalOpen}
          onCancel={() => {
            setProductsModalOpen(false);
            setEditProducts(null);
            productsForm.resetFields();
          }}
          footer={null}
          width={800}
          className="top-5"
        >
          <Form
            form={productsForm}
            layout="vertical"
            onFinish={handleProductsSubmit}
            className="py-4"
          >
            <Form.Item
              name="mainTitle"
              label={<Text strong>Main Title</Text>}
              rules={[{ required: true, message: 'Please enter the main title' }]}
            >
              <Input placeholder="Enter main title" size="large" />
            </Form.Item>

            <Form.List name="products">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      title={`Product ${name + 1}`}
                      extra={
                        <Tooltip title="Remove this product">
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
                        name={[name, 'imageIconurl']}
                        label={<Text strong>Image Icon</Text>}
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
                      {productsForm.getFieldValue(['products', name, 'imageIconurl']) &&
                        productsForm.getFieldValue(['products', name, 'imageIconurl']).length > 0 &&
                        productsForm.getFieldValue(['products', name, 'imageIconurl'])[0].url && (
                          <Form.Item label={<Text strong>Current Image</Text>}>
                            <Image
                              src={productsForm.getFieldValue(['products', name, 'imageIconurl'])[0].url}
                              alt="Current"
                              width={120}
                              height={120}
                              className="object-cover rounded"
                            />
                          </Form.Item>
                        )}
                      <Form.Item
                        {...restField}
                        name={[name, 'productName']}
                        label={<Text strong>Product Name</Text>}
                        rules={[{ required: true, message: 'Please enter product name' }]}
                      >
                        <Input placeholder="Enter product name" size="large" />
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
                      Add New Product
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
                  ? editProducts
                    ? 'Updating...'
                    : 'Adding...'
                  : editProducts
                  ? 'Update Products'
                  : 'Add Products'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}