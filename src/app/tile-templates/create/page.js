'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tile from '../../../components/Tile';

export default function CreateTileTemplatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        // Auto-generate JSX code when form data changes
        const generatedJsx = `<Tile bg="${formData.backgroundColor}" icon="${formData.iconName}" color="${formData.iconColor}" size={${formData.iconSize}} />`;
        setJsxCode(generatedJsx);
    }, [formData.backgroundColor, formData.iconName, formData.iconColor, formData.iconSize]);

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
            const response = await fetch('/api/tile-templates', {
                method: 'POST',
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
                alert(error.error || 'Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Failed to create template');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-lg font-semibold text-gray-900">Create Tile Template</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Template Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                    placeholder="Enter template name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Template Type *</label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                    placeholder="e.g., Status Indicator, Chart, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colors & Styling */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Colors & Styling</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Tile Background Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                        placeholder="#007bff"
                                    />
                                </div>
                                <small className="text-xs text-gray-500 mt-1 block">Background color of the actual tile component</small>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Preview Background Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={formData.previewBackgroundColor}
                                        onChange={(e) => setFormData({ ...formData, previewBackgroundColor: e.target.value })}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                        disabled={formData.useTileBgEverywhere}
                                    />
                                    <input
                                        type="text"
                                        value={formData.previewBackgroundColor}
                                        onChange={(e) => setFormData({ ...formData, previewBackgroundColor: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                        placeholder="#f8f9fa"
                                        disabled={formData.useTileBgEverywhere}
                                    />
                                </div>
                                <small className="text-xs text-gray-500 mt-1 block">Background color in template list</small>
                            </div>
                        </div>
                        
                        {/* Checkbox for using tile background everywhere */}
                        <div className="mt-6 flex items-center">
                            <input
                                type="checkbox"
                                id="useTileBgEverywhere"
                                checked={formData.useTileBgEverywhere}
                                onChange={(e) => setFormData({ ...formData, useTileBgEverywhere: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="useTileBgEverywhere" className="ml-2 text-xs text-gray-700">
                                Use tile background color everywhere
                            </label>
                        </div>
                        {formData.useTileBgEverywhere && (
                            <p className="text-xs text-blue-600 mt-1">
                                Preview background will use the tile's background color
                            </p>
                        )}
                    </div>

                    {/* Icon Settings */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Icon Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Icon Name</label>
                                <input
                                    type="text"
                                    value={formData.iconName}
                                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                    placeholder="LineChart"
                                />
                                <small className="text-xs text-gray-500 mt-1 block">
                                    Icon names from lucide-react (e.g., LineChart, BarChart, TrendingUp, Table, Users, Settings, Home, Star, Heart, AlertCircle)
                                </small>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Icon Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={formData.iconColor}
                                        onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.iconColor}
                                        onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Icon Size</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="16"
                                        max="96"
                                        value={formData.iconSize}
                                        onChange={(e) => setFormData({ ...formData, iconSize: parseInt(e.target.value) })}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-600 min-w-[3rem]">{formData.iconSize}px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Live Preview</h2>
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
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Generated JSX Code</h2>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                            {jsxCode}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            This JSX code will be automatically generated and stored with your template
                        </p>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => router.push('/tile-templates')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Template'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}



