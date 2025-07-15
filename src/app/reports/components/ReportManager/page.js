'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Popconfirm, Input, Tag } from 'antd';
import ReportCsvUploadModal from './sections/ReportCsvUploadModal';
import ReportEditModal from './sections/ReportEditModal'; // make sure to import this
import ReportListTable from './sections/ReportListTable';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import * as XLSX from 'xlsx';

export default function ReportManager() {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editInitialData, setEditInitialData] = useState(null);
    const [reportList, setReportList] = useState([]);
    const [reverseOrder, setReverseOrder] = useState(false);
    const [bannerSearchText, setBannerSearchText] = useState('');
    const [bannerSearchedColumn, setBannerSearchedColumn] = useState('');
    const [bannerFilters, setBannerFilters] = useState({});
    const searchInput = useRef(null);


    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports/repcontent');
            const data = await res.json();
            setReportList(data); // assuming your API returns array of reports
        } catch (err) {
            console.error('Failed to fetch reports:', err);
            message.error('Failed to load reports');
        }
    };

    useEffect(() => {
        fetchReports(); // fetch on mount
    }, []);

    const displayedData = reverseOrder ? [...reportList].reverse() : reportList;

    const openAddModal = () => {
        setEditInitialData(null);
        setEditModalOpen(true);
    };

    const openEditModal = (report) => {
        setEditInitialData(report);
        setEditModalOpen(true);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setBannerSearchText(selectedKeys[0]);
        setBannerSearchedColumn(dataIndex);
        setBannerFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys }));
    };

    const handleReset = (clearFilters, dataIndex) => {
        clearFilters();
        setBannerSearchText('');
        setBannerFilters((prev) => ({ ...prev, [dataIndex]: [] }));
    };

    const getColumnSearchProps = (dataIndex, isTagColumn = false) => ({
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
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            if (isTagColumn) {
                return record[dataIndex]?.some((tag) =>
                    tag.toLowerCase().includes(value.toLowerCase())
                ) || false;
            }
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
        },
        filterDropdownProps: {
            onOpenChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        filteredValue: bannerFilters[dataIndex] || null,
        render: (text) => {
            if (isTagColumn) {
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Array.isArray(text) && text.length > 0 ? (
                            text.map((tag) => (
                                <Tag key={tag} color="blue">
                                    {bannerSearchedColumn === dataIndex ? (
                                        <Highlighter
                                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                                            searchWords={[bannerSearchText]}
                                            autoEscape
                                            textToHighlight={tag}
                                        />
                                    ) : (
                                        tag
                                    )}
                                </Tag>
                            ))
                        ) : (
                            <span>-</span>
                        )}
                    </div>
                );
            }
            return bannerSearchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[bannerSearchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            );
        },
    });

    const handleDownload = () => {
        if (!reportList || reportList.length === 0) {
            message.warning('No reports to download');
            return;
        }

        // Define the exact field order
        const fields = [
            'report_id',
            'report_title',
            'report_summary',
            'report_scope',
            'reasons_to_buy',
            'Table_of_Contents',
            'list_of_tables',
            'List_of_figures',
            'Report_Geography_Region',
            'Report_Geography_Country',
            'Product_category',
            'Product_sub_Category',
            'report_type',
            'report_format',
            'report_publisher',
            'report_pages',
            'Companies_mentioned',
            'single_user_dollar_price',
            'Small_Team_dollar_price',
            'Enterprise_dollar_price',
            'Featured_Report_Status',
            'report_visible',
            'Home_Page',
            'report_file_name',
            'report_publish_date',
            'Sample_Page_report_name',
            'Meta_Description',
            'Meta_Title',
            'Meta_Keyword',
            'seo_url',
            'key_stats_a1',
            'key_stats_a2',
            'key_stats_b1',
            'key_stats_b2',
            'key_stats_c1',
            'key_stats_c2',
            'key_stats_d1',
            'key_stats_d2',
            'RD_Section1',
            'RD_Section2',
            'RD_Section3',
            'RD_Text_Section1',
            'RD_Text_Section2',
            'RD_Text_Section3',
            'FAQs'
        ];

        // Prepare data: ensure all objects have all fields (even if null)
        const dataToExport = reportList.map(item => {
            const newItem = {};
            fields.forEach(f => {
                newItem[f] = item[f] !== undefined ? item[f] : '';
            });
            return newItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: fields });
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4">
            <div className="mb-4 mt-4">
                <Space>
                    <Button type="primary" onClick={() => setUploadModalOpen(true)}>
                        Upload Reports CSV / Excel
                    </Button>
                    <Button type="primary" onClick={openAddModal}>
                        Add New Report
                    </Button>
                    <Button onClick={() => setReverseOrder(prev => !prev)}>
                        {reverseOrder ? 'Show Normal Order' : 'Show Reverse Order'}
                    </Button>
                    <Button onClick={handleDownload}>
                        Download Excel/CSV
                    </Button>
                </Space>
            </div>

            <ReportCsvUploadModal
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUploaded={async () => {
                    try {
                        // call your upload API here, replace this with actual upload logic if needed
                        const res = await fetch('/api/reports/repcontent/upload', {
                            method: 'POST',
                            // normally you'd use FormData here
                        });
                        const data = await res.json();

                        if (res.ok) {
                            if (data.errors && data.errors.length > 0) {
                                message.warning(`Uploaded with ${data.errors.length} warnings`);
                                // Show full errors in modal
                                Modal.warning({
                                    title: 'Upload completed with some issues',
                                    content: (
                                        <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                            {data.errors.map((err, idx) => <p key={idx}>{err}</p>)}
                                        </div>
                                    ),
                                    width: 600
                                });
                            } else {
                                message.success(`Upload successful! Processed ${data.processedCount} / ${data.totalRows}`);
                            }
                            fetchReports();
                        } else {
                            message.error(data.error || 'Upload failed');
                        }
                    } catch (err) {
                        console.error(err);
                        message.error('Upload failed');
                    }
                }}
            />

            <ReportEditModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                initialData={editInitialData}
                onSave={async (data) => {
                    try {
                        let res;
                        if (editInitialData) {
                            // Edit existing → PUT
                            res = await fetch('/api/reports/repcontent', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                        } else {
                            // Add new → POST
                            res = await fetch('/api/reports/repcontent', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                        }

                        if (res.ok) {
                            message.success(editInitialData ? 'Report updated successfully' : 'Report added successfully');
                            fetchReports(); // refresh list
                        } else {
                            const err = await res.json();
                            message.error(err.error || 'Save failed');
                        }
                    } catch (err) {
                        console.error(err);
                        message.error('Something went wrong');
                    }
                }}
            />


            <div className="mt-6">
                <ReportListTable
                    data={displayedData}
                    onEdit={openEditModal}
                    onDelete={async (record) => {
                        try {
                            const res = await fetch(`/api/reports/repcontent/${record._id}`, {
                                method: 'DELETE'
                            });
                            if (res.ok) {
                                message.success('Deleted successfully');
                                fetchReports();
                            } else {
                                const err = await res.json();
                                message.error(err.error || 'Failed to delete');
                            }
                        } catch (err) {
                            console.error(err);
                            message.error('Something went wrong');
                        }
                    }}
                    getColumnSearchProps={getColumnSearchProps}
                />
            </div>

            <Popconfirm
                title="Are you sure you want to delete all reports?"
                onConfirm={async () => {
                    try {
                        const res = await fetch('/api/reports/repcontent', { method: 'DELETE' });
                        const data = await res.json();
                        if (res.ok) {
                            message.success(`Deleted ${data.deletedCount} reports`);
                            fetchReports();
                        } else {
                            message.error(data.error || 'Delete failed');
                        }
                    } catch (err) {
                        console.error(err);
                        message.error('Something went wrong');
                    }
                }}
                okText="Yes, delete all"
                cancelText="Cancel"
            >
                <Button danger>Delete All Reports</Button>
            </Popconfirm>

        </div>
    );
}
