'use client';
import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Modal, Form, Space, message, Popconfirm, Typography, Checkbox, Select } from 'antd';
import axios from 'axios';

const { Title } = Typography;

export default function NavbarCMS() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form] = Form.useForm();

  const [isLinkModalVisible, setLinkModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState({ sectionId: null, index: null });
  const [linkForm] = Form.useForm();

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, []);

  async function fetchSections() {
    setLoading(true);
    try {
      const res = await axios.get('/api/navbar');
      setSections(res.data.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load sections');
    }
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      const res = await axios.get('/api/product-category');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load categories');
    }
  }

  async function handleSectionSubmit(values) {
    try {
      if (editingSection) {
        await axios.put('/api/navbar', {
          sectionId: editingSection._id,
          newSectionName: values.section,
          newSectionUrl: values.sectionUrl
        });
        message.success('Section updated');
      } else {
        await axios.post('/api/navbar', {
          section: values.section,
          sectionUrl: values.sectionUrl || ''
        });
        message.success('Section added');
      }
      setSectionModalVisible(false);
      form.resetFields();
      fetchSections();
    } catch (err) {
      console.error(err);
      message.error('Operation failed');
    }
  }

  async function deleteSection(sectionId) {
    try {
      await axios.delete('/api/navbar', { data: { sectionId } });
      message.success('Section deleted');
      fetchSections();
    } catch {
      message.error('Failed to delete');
    }
  }

  async function addLink(sectionId, link) {
    try {
      await axios.put('/api/navbar', {
        sectionId,
        addLink: { ...link, enabled: true }
      });
      message.success('Link added');
      fetchSections();
    } catch {
      message.error('Failed to add link');
    }
  }

  async function deleteLink(sectionId, index) {
    try {
      await axios.put('/api/navbar', { sectionId, deleteLink: index });
      message.success('Link deleted');
      fetchSections();
    } catch {
      message.error('Failed to delete link');
    }
  }

  async function updateLink() {
    try {
      const values = await linkForm.validateFields();
      await axios.put('/api/navbar', {
        sectionId: editingLink.sectionId,
        updateLink: { index: editingLink.index, ...values }
      });
      message.success('Link updated');
      setLinkModalVisible(false);
      fetchSections();
    } catch {
      message.error('Failed to update link');
    }
  }

  async function toggleEnabled(sectionId, index, enabled) {
    try {
      await axios.put('/api/navbar', {
        sectionId,
        updateLink: { index, enabled }
      });
      fetchSections();
    } catch {
      message.error('Failed to update status');
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={3}>Navbar CMS</Title>
      <Button type="primary" onClick={() => {
        setEditingSection(null);
        form.resetFields();
        setSectionModalVisible(true);
      }}>
        Add Section
      </Button>

      <Table
        loading={loading}
        dataSource={sections}
        rowKey="_id"
        pagination={false}
        expandable={{
          expandedRowRender: section => (
            <>
              <Table
                size="small"
                dataSource={section.links.map((link, idx) => ({ ...link, key: idx }))}
                pagination={false}
                columns={[
                  { title: 'Title', dataIndex: 'title' },
                  { title: 'URL', dataIndex: 'url' },
                  { title: 'ClickText', dataIndex: 'clickText' },
                  { 
                    title: 'Category', 
                    render: (_, link) => link.category ? link.category.productCategoryName : 'None'
                  },
                  {
                    title: 'Enabled',
                    render: (_, link, index) => (
                      <Checkbox
                        checked={link.enabled}
                        onChange={e => toggleEnabled(section._id, index, e.target.checked)}
                      />
                    )
                  },
                  {
                    title: 'Actions',
                    render: (_, link, index) => (
                      <Space>
                        <Button size="small" onClick={() => {
                          setEditingLink({ sectionId: section._id, index });
                          linkForm.setFieldsValue({ ...link, category: link.category?._id || null });
                          setLinkModalVisible(true);
                        }}>Edit</Button>
                        <Popconfirm title="Delete link?" onConfirm={() => deleteLink(section._id, index)}>
                          <Button danger size="small">Delete</Button>
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
              />

              <Form layout="inline" onFinish={values => addLink(section._id, values)} style={{ marginTop: 8 }}>
                <Form.Item name="title" rules={[{ required: true }]}>
                  <Input placeholder="Title" />
                </Form.Item>
                <Form.Item name="url" rules={[{ required: true }]}>
                  <Input placeholder="URL" />
                </Form.Item>
                <Form.Item name="clickText">
                  <Input placeholder="ClickText" />
                </Form.Item>
                <Form.Item name="category">
                  <Select placeholder="Select Category" allowClear>
                    {categories.map(cat => (
                      <Select.Option key={cat._id} value={cat._id}>
                        {cat.productCategoryName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Add Link</Button>
                </Form.Item>
              </Form>
            </>
          )
        }}
        columns={[
          { title: 'Section', dataIndex: 'section' },
          { title: 'Section URL', dataIndex: 'sectionUrl' },
          {
            title: 'Actions',
            render: (_, section) => (
              <Space>
                <Button size="small" onClick={() => {
                  setEditingSection(section);
                  form.setFieldsValue({
                    section: section.section,
                    sectionUrl: section.sectionUrl
                  });
                  setSectionModalVisible(true);
                }}>Edit</Button>
                <Popconfirm title="Delete section?" onConfirm={() => deleteSection(section._id)}>
                  <Button danger size="small">Delete</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        open={isSectionModalVisible}
        onCancel={() => { setSectionModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSectionSubmit}>
          <Form.Item name="section" label="Section Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sectionUrl" label="Section URL">
            <Input placeholder="/payments etc." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Link"
        open={isLinkModalVisible}
        onCancel={() => setLinkModalVisible(false)}
        onOk={() => linkForm.submit()}
      >
        <Form form={linkForm} onFinish={updateLink}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="clickText" label="ClickText">
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select placeholder="Select Category" allowClear>
              {categories.map(cat => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.productCategoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}