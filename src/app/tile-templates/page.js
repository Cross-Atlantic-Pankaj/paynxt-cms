'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Table, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import Tile from '../../components/Tile';

const { Search } = Input;

export default function TileTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, templateId: null, templateName: '' });
    const router = useRouter();
    
    const itemsPerPage = 10;

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/tile-templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            message.error('Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/tile-templates/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setTemplates(templates.filter(t => t._id !== id));
                message.success('Template deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            message.error('Failed to delete template');
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
    const paginatedTemplates = filteredTemplates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        {
            title: 'Template Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <span className="text-xs font-medium">{name}</span>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <span className="text-xs">{type}</span>
        },
        {
            title: 'Preview',
            key: 'preview',
            render: (_, template) => (
                <div 
                    className="flex justify-center"
                    style={{ 
                        backgroundColor: template.useTileBgEverywhere 
                            ? template.backgroundColor 
                            : (template.previewBackgroundColor || '#f8f9fa') 
                    }}
                >
                    <Tile
                        bg={template.backgroundColor}
                        icon={template.iconName}
                        color={template.iconColor}
                        size={template.iconSize}
                    />
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, template) => (
                <Space size="small">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => router.push(`/tile-templates/edit/${template._id}`)}
                        size="small"
                        className="text-xs"
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Template"
                        description={`Are you sure you want to delete "${template.name}"? This action cannot be undone.`}
                        onConfirm={() => handleDelete(template._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small"
                            className="text-xs"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <div className="mb-6">
                <h1 className="text-lg font-bold mb-2">Tile Templates</h1>
                <p className="text-xs text-gray-600">Manage and create reusable tile templates for your dashboard</p>
            </div>

            {/* Stats Card */}
            <Card className="mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{templates.length}</div>
                    <div className="text-xs text-gray-600">Total Tile Templates</div>
                </div>
            </Card>

            {/* Search and Create Button */}
            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <Search
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                            size="small"
                        />
                    </div>
                    {/* <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => router.push('/tile-templates/create')}
                        size="large"
                    >
                        Create New Template
                    </Button> */}
                </div>
            </Card>

            {/* Templates Table */}
            {filteredTemplates.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            {searchTerm ? `No templates match "${searchTerm}"` : 'No templates yet'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Create your first tile template to get started'}
                        </p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <Table
                        columns={columns}
                        dataSource={paginatedTemplates}
                        rowKey="_id"
                        pagination={{
                            current: currentPage,
                            pageSize: itemsPerPage,
                            total: filteredTemplates.length,
                            onChange: setCurrentPage,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            size: "small"
                        }}
                        loading={loading}
                        size="small"
                    />
                </Card>
            )}
        </div>
    );
}



