'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // null | template object
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch templates
  const fetchTemplates = async () => {
    setLoading(true);
    const res = await fetch('/api/email-templates');
    const data = await res.json();
    setTemplates(data.templates);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  // Open modal to add/edit
  const openModal = (template = null) => {
    setEditing(template);
    if (template) {
      form.setFieldsValue(template);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        // Update
        await fetch(`/api/email-templates/${editing._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Template updated');
      } else {
        // Create
        await fetch('/api/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Template created');
      }
      setModalVisible(false);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      message.error('Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/email-templates/${id}`, { method: 'DELETE' });
    message.success('Template deleted');
    fetchTemplates();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Email Templates</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Add Template</Button>
      <Table
        rowKey="_id"
        columns={[
          { title: 'Type', dataIndex: 'type' },
          { title: 'Subject', dataIndex: 'subject' },
          { title: 'Body', dataIndex: 'body' },
          {
            title: 'Actions',
            render: (_, record) => (
              <>
                <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
                  <Button danger icon={<DeleteOutlined />} className="ml-2" />
                </Popconfirm>
              </>
            )
          }
        ]}
        dataSource={templates}
        loading={loading}
        className="mt-4"
      />

      <Modal
        title={editing ? 'Edit Template' : 'Add Template'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText="Save"
        width="90vw"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Input placeholder="e.g., order_success" />
          </Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="Body" rules={[{ required: true }]}>
            <Input.TextArea rows={6} placeholder="HTML content with {{firstName}} etc." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
