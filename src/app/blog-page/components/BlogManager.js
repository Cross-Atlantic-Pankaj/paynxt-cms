'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Cookies from 'js-cookie';
import TiptapEditor from '@/components/TiptapEditor';


export default function BlogManager() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editBlog, setEditBlog] = useState(null);
    const [blogForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const userRole = Cookies.get('admin_role');
    const canEdit = ['superadmin', 'editor'].includes(userRole);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/blog-page/blog-content');
            const data = await response.json();
            if (data.success) {
                setBlogs(data.data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            message.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleBlogSubmit = async (values) => {
        console.log("FORM SUBMIT CALLED:", values);
        if (!canEdit) return message.error('Permission denied');
        try {
            const body = editBlog ? { ...values, _id: editBlog._id } : values;
            const response = await fetch('/api/blog-page/blog-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            console.log("API Response:", result);
            if (result.success) {
                message.success(editBlog ? 'Blog updated' : 'Blog added');
                setModalOpen(false);
                setEditBlog(null);
                blogForm.resetFields();
                fetchBlogs();
            } else {
                message.error(result.message || 'Error submitting blog');
            }
        } catch (error) {
            console.error('Error submitting blog:', error);
            message.error('Error submitting blog');
        }
    };


    const handleDeleteBlog = async (id) => {
        if (!canEdit) return message.error('Permission denied');
        try {
            const response = await fetch(`/api/blog-page/blog-content?id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                message.success('Blog deleted');
                fetchBlogs();
            } else {
                message.error(result.message || 'Error deleting blog');
            }
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Error deleting blog');
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
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                >
                    Search
                </Button>
                <Button
                    size="small"
                    style={{ width: 90 }}
                    onClick={() => handleReset(clearFilters)}
                >
                    Reset
                </Button>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
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
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ...getColumnSearchProps('title'),
        },
        {
            title: 'Summary',
            dataIndex: 'summary',
            key: 'summary',
            ...getColumnSearchProps('summary'),
        },
        {
            title: 'Article Part 1',
            dataIndex: 'articlePart1',
            key: 'articlePart1',
            render: (html) => (
                <div
                    dangerouslySetInnerHTML={{ __html: html }}
                    style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}
                />
            ),
        },
        {
            title: 'Article Part 2',
            dataIndex: 'articlePart2',
            key: 'articlePart2',
            render: (html) => (
                <div
                    dangerouslySetInnerHTML={{ __html: html }}
                    style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}
                />
            ),
        },
        {
            title: 'Ad Title',
            dataIndex: ['advertisement', 'title'],
            key: 'adTitle',
            render: (text) => text || '-',
        },
        {
            title: 'Ad Description',
            dataIndex: ['advertisement', 'description'],
            key: 'adDescription',
            render: (text) => <div style={{ whiteSpace: 'pre-wrap' }}>{text || '-'}</div>,
        },
        {
            title: 'Ad URL',
            dataIndex: ['advertisement', 'url'],
            key: 'adUrl',
            render: (text) => text ? <a href={text} target="_blank" rel="noreferrer">{text}</a> : '-',
        },
        ...(canEdit ? [{
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditBlog(record);
                                blogForm.setFieldsValue(record);
                                setModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this blog?"
                        onConfirm={() => handleDeleteBlog(record._id)}
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


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Blogs</h2>
                {canEdit && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditBlog(null);
                        blogForm.resetFields();
                        setModalOpen(true);
                    }}>
                        Add Blog
                    </Button>
                )}
            </div>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={blogs}
                loading={loading}
                pagination={{ pageSize: 5 }}
            />
            {canEdit && (
                <Modal
                    title={editBlog ? 'Edit Blog' : 'Add Blog'}
                    open={modalOpen}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditBlog(null);
                        blogForm.resetFields();
                    }}
                    footer={null}
                >
                    <Form
                        form={blogForm}
                        layout="vertical"
                        onFinish={handleBlogSubmit}
                        onFinishFailed={(errorInfo) => {
                            console.error('Form validation failed:', errorInfo);
                            message.error('Please fill in all required fields.');
                        }}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: "'title' is required" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="summary"
                            label="Summary"
                            rules={[{ required: true, message: "'summary' is required" }]}
                        >
                            <Input.TextArea rows={2} />
                        </Form.Item>

                        <Form.Item
                            name="articlePart1"
                            label="Article Part 1"
                            rules={[{ required: true, message: "'articlePart1' is required" }]}
                        >
                            <TiptapEditor />
                        </Form.Item>

                        <Form.Item
                            name="articlePart2"
                            label="Article Part 2"
                            rules={[{ required: true, message: "'articlePart2' is required" }]}
                        >
                            <TiptapEditor />
                        </Form.Item>

                        <Form.Item
                            name={['advertisement', 'title']}
                            label="Ad Title"
                            rules={[{ required: false }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name={['advertisement', 'description']}
                            label="Ad Description"
                            rules={[{ required: false }]}
                        >
                            <Input.TextArea rows={2} />
                        </Form.Item>

                        <Form.Item
                            name={['advertisement', 'url']}
                            label="Ad URL"
                            rules={[{ required: false }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                {editBlog ? 'Update' : 'Add'} Blog
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}

        </div>
    );
}
