'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Tile from '../../../../components/Tile';

export default function EditTileTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        backgroundColor: '#007bff',
        previewBackgroundColor: '#f8f9fa',
        iconName: 'LineChart',
        iconColor: '#ffffff',
        iconSize: 32,
        useTileBgEverywhere: false
    });

    const [jsxCode, setJsxCode] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchTemplate();
        }
    }, [params.id]);

    useEffect(() => {
        // Auto-generate JSX code when form data changes
        const generatedJsx = `<Tile bg="${formData.backgroundColor}" icon="${formData.iconName}" color="${formData.iconColor}" size={${formData.iconSize}} />`;
        setJsxCode(generatedJsx);
    }, [formData.backgroundColor, formData.iconName, formData.iconColor, formData.iconSize]);

    const fetchTemplate = async () => {
        try {
            const response = await fetch(`/api/tile-templates/${params.id}`);
            if (response.ok) {
                const template = await response.json();
                setFormData({
                    name: template.name || '',
                    type: template.type || '',
                    backgroundColor: template.backgroundColor || '#007bff',
                    previewBackgroundColor: template.previewBackgroundColor || '#f8f9fa',
                    iconName: template.iconName || 'LineChart',
                    iconColor: template.iconColor || '#ffffff',
                    iconSize: template.iconSize || 32,
                    useTileBgEverywhere: template.useTileBgEverywhere || false
                });
                setJsxCode(template.jsxCode || '');
            } else {
                alert('Template not found');
                router.push('/tile-templates');
            }
        } catch (error) {
            console.error('Error fetching template:', error);
            alert('Failed to fetch template');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/tile-templates/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    jsxCode
                }),
            });

            if (response.ok) {
                router.push('/tile-templates');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update template');
            }
        } catch (error) {
            console.error('Error updating template:', error);
            alert('Failed to update template');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Tile Template</h1>
                            <p className="text-gray-600">Modify the existing tile template configuration</p>
                        </div>
                        <button
                            onClick={() => router.push('/tile-templates')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            ← Back to Templates
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter template name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template Type *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Status Indicator, Chart, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Colors & Styling</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tile Background Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.backgroundColor}
                                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.backgroundColor}
                                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Background color of the actual tile</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preview Background Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.previewBackgroundColor}
                                        onChange={(e) => handleInputChange('previewBackgroundColor', e.target.value)}
                                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                        disabled={formData.useTileBgEverywhere}
                                    />
                                    <input
                                        type="text"
                                        value={formData.previewBackgroundColor}
                                        onChange={(e) => handleInputChange('previewBackgroundColor', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                        disabled={formData.useTileBgEverywhere}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Background color in template list</p>
                                
                                {/* Checkbox for using tile background everywhere */}
                                <div className="mt-3 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="useTileBgEverywhere"
                                        checked={formData.useTileBgEverywhere}
                                        onChange={(e) => handleInputChange('useTileBgEverywhere', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label htmlFor="useTileBgEverywhere" className="ml-2 text-sm text-gray-700">
                                        Use tile background color everywhere
                                    </label>
                                </div>
                                {formData.useTileBgEverywhere && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Preview background will use the tile's background color
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Icon Settings */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Icon Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.iconName}
                                    onChange={(e) => handleInputChange('iconName', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="LineChart"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Icon names from lucide-react (e.g., LineChart, BarChart, TrendingUp, Table, Users, Settings, Home, Star, Heart, AlertCircle)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.iconColor}
                                        onChange={(e) => handleInputChange('iconColor', e.target.value)}
                                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.iconColor}
                                        onChange={(e) => handleInputChange('iconColor', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon Size: {formData.iconSize}px
                                </label>
                                <input
                                    type="range"
                                    min="16"
                                    max="96"
                                    value={formData.iconSize}
                                    onChange={(e) => handleInputChange('iconSize', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>16px</span>
                                    <span>96px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
                        <div className="flex justify-center">
                            <div 
                                className={`rounded-lg border-2 border-dashed border-gray-300 ${
                                    formData.useTileBgEverywhere ? 'p-0' : 'p-8'
                                }`}
                                style={{ 
                                    backgroundColor: formData.useTileBgEverywhere 
                                        ? formData.backgroundColor 
                                        : formData.previewBackgroundColor 
                                }}
                            >
                                <Tile
                                    bg={formData.backgroundColor}
                                    icon={formData.iconName}
                                    color={formData.iconColor}
                                    size={formData.iconSize}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Generated JSX */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated JSX Code</h2>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            {jsxCode}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            This JSX code will be automatically updated and stored with your template
                        </p>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => router.push('/tile-templates')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Template'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}



