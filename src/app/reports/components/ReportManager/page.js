'use client';
import React, { useState, useEffect } from 'react';
import { Button, Space, message, Popconfirm } from 'antd';
import ReportCsvUploadModal from './sections/ReportCsvUploadModal';
import ReportEditModal from './sections/ReportEditModal'; // make sure to import this
import ReportListTable from './sections/ReportListTable';

export default function ReportManager() {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editInitialData, setEditInitialData] = useState(null);
    const [reportList, setReportList] = useState([]);
    const [reverseOrder, setReverseOrder] = useState(false);


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

    return (
        <div className="p-4">
            <div className="mb-4">
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

                </Space>
            </div>

            <ReportCsvUploadModal
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUploaded={() => {
                    console.log('File uploaded, refresh list');
                    fetchReports();
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
