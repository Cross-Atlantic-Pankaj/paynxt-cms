'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Spin, Empty } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Tile from './Tile';

const { Search } = Input;

export default function TileTemplateSelector({ value, onChange, className = '' }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(value || null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        setSelectedTemplate(value);
    }, [value]);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/tile-templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            } else {
                message.error('Failed to fetch tile templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            message.error('Failed to fetch tile templates');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template._id);
        if (onChange) {
            onChange(template._id);
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className={`${className}`}>
                <div className="text-center py-8">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-500">Loading tile templates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Search */}
            <div className="mb-4">
                <Search
                    placeholder="Search tile templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    prefix={<SearchOutlined />}
                />
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <Empty
                    description={searchTerm ? `No templates found for "${searchTerm}"` : 'No tile templates available'}
                    className="py-8"
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {filteredTemplates.map((template) => (
                        <Card
                            key={template._id}
                            hoverable
                            className={`relative transition-all duration-200 cursor-pointer ${
                                selectedTemplate === template._id
                                    ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                    : 'hover:shadow-md'
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                            bodyStyle={{ padding: '12px' }}
                        >
                            {/* Selection Indicator */}
                            {selectedTemplate === template._id && (
                                <div className="absolute top-2 right-2 z-10">
                                    <CheckCircleOutlined className="text-blue-500 text-lg bg-white rounded-full" />
                                </div>
                            )}

                            {/* Template Preview */}
                            <div className="text-center">
                                <div
                                    className="flex justify-center items-center mb-3 rounded-lg p-4"
                                    style={{
                                        backgroundColor: template.useTileBgEverywhere
                                            ? template.backgroundColor
                                            : (template.previewBackgroundColor || '#f8f9fa'),
                                        minHeight: '80px'
                                    }}
                                >
                                    <Tile
                                        bg={template.backgroundColor}
                                        icon={template.iconName}
                                        color={template.iconColor}
                                        size={template.iconSize}
                                    />
                                </div>

                                {/* Template Info */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                                        {template.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">
                                        {template.type}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Selected Template Info */}
            {selectedTemplate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm text-blue-700">
                        <CheckCircleOutlined className="mr-2" />
                        <span>
                            Selected: {templates.find(t => t._id === selectedTemplate)?.name || 'Template'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
