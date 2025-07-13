'use client';
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Upload, Typography } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function PartnerLogoManager() {
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]); // for Upload
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null); // store the record being edited
    const [editFileList, setEditFileList] = useState([]);     // for edit image upload


    useEffect(() => {
        fetchLogos();
    }, []);

    const fetchLogos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/home-page/partner-logos');
            const data = await res.json();
            if (data.success) setLogos(data.data);
            else message.error(data.message || 'Failed to load logos');
        } catch (err) {
            console.error(err);
            message.error('Error fetching logos');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            if (fileList.length === 0) {
                return message.warning('Please upload an image');
            }

            const formData = new FormData();
            formData.append('altText', values.altText || '');
            formData.append('image', fileList[0].originFileObj); // image file

            const res = await fetch('/api/home-page/partner-logos', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                message.success('Logo added successfully');
                setAddModalVisible(false);
                form.resetFields();
                setFileList([]);
                fetchLogos();
            } else {
                message.error(data.message || 'Failed to add logo');
            }
        } catch (err) {
            console.error(err);
            message.error('Failed to add logo');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/home-page/partner-logos?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                message.success('Logo deleted');
                fetchLogos();
            } else {
                message.error(data.message || 'Failed to delete logo');
            }
        } catch (err) {
            console.error(err);
            message.error('Error deleting logo');
        }
    };

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (url) => (
                <img src={url} alt="" style={{ width: 60, height: 60, objectFit: 'contain' }} />
            ),
        },
        {
            title: 'Alt Text',
            dataIndex: 'altText',
            key: 'altText',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button
                        size="small"
                        style={{ marginRight: 8 }}
                        onClick={() => {
                            setIsEditing(true);
                            setEditingRecord(record);
                            form.setFieldsValue({ altText: record.altText });
                            setEditFileList([]); // clear edit upload
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this logo?"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button danger size="small">Delete</Button>
                    </Popconfirm>
                </>
            ),
        }
    ];

    return (
        <div className="p-6 bg-white rounded shadow">
            <Title level={3}>Partner Logo Manager</Title>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)} style={{ marginBottom: 16 }}>
                Add New Logo
            </Button>

            <Table
                dataSource={logos}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title="Add Partner Logo"
                open={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false);
                    form.resetFields();
                    setFileList([]);
                }}
                onOk={handleAdd}
                okText="Add"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="altText"
                        label="Alt Text"
                    >
                        <Input placeholder="Alt text for accessibility" />
                    </Form.Item>

                    <Form.Item label="Upload Logo">
                        <Upload
                            accept="image/*"
                            beforeUpload={() => false} // prevents auto upload
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            maxCount={1}
                            listType="picture-card"
                        >
                            {fileList.length >= 1 ? null : (
                                <div>
                                    <UploadOutlined /> Upload
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Edit Partner Logo"
                open={isEditing}
                onCancel={() => {
                    setIsEditing(false);
                    setEditingRecord(null);
                    form.resetFields();
                    setEditFileList([]);
                }}
                onOk={async () => {
                    try {
                        const values = await form.validateFields();

                        const formData = new FormData();
                        formData.append('_id', editingRecord._id);
                        formData.append('altText', values.altText || '');

                        if (editFileList.length > 0) {
                            formData.append('image', editFileList[0].originFileObj);
                        }

                        const res = await fetch('/api/home-page/partner-logos', {
                            method: 'PUT',
                            body: formData,
                        });
                        const data = await res.json();

                        if (data.success) {
                            message.success('Logo updated successfully');
                            setIsEditing(false);
                            setEditingRecord(null);
                            form.resetFields();
                            setEditFileList([]);
                            fetchLogos();
                        } else {
                            message.error(data.message || 'Failed to update logo');
                        }
                    } catch (err) {
                        console.error(err);
                        message.error('Update failed');
                    }
                }}
                okText="Update"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="altText"
                        label="Alt Text"
                    >
                        <Input placeholder="Alt text" />
                    </Form.Item>

                    <Form.Item label="Change Logo (optional)">
                        <Upload
                            accept="image/*"
                            beforeUpload={() => false}
                            fileList={editFileList}
                            onChange={({ fileList }) => setEditFileList(fileList)}
                            maxCount={1}
                            listType="picture-card"
                        >
                            {editFileList.length >= 1 ? null : (
                                <div>
                                    <UploadOutlined /> Upload
                                </div>
                            )}
                        </Upload>
                        {editingRecord?.imageUrl && editFileList.length === 0 && (
                            <img
                                src={editingRecord.imageUrl}
                                alt="Current"
                                style={{ width: '60px', marginTop: '8px', objectFit: 'contain' }}
                            />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
