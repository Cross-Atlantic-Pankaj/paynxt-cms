'use client';

import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, message, Spin, Button } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function AssignedReportsCMS() {
    const [assignedReports, setAssignedReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedReports = async () => {
            try {
                const res = await fetch('/api/assigned-reports/all');
                const data = await res.json();
                if (data.success) {
                    setAssignedReports(data.data);
                } else {
                    message.error('Failed to load assigned reports');
                }
            } catch (err) {
                console.error(err);
                message.error('Something went wrong while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedReports();
    }, []);

    const handleDownloadCSV = () => {
        if (!assignedReports.length) return;

        const headers = ['Report Title', 'Assigned To', 'Date', 'Source'];
        const rows = assignedReports.map(report => [
            report.report?.report_title?.split(' - ')[0] || '',
            report.user || '',
            dayjs(report.createdAt).format('DD MMM YYYY'),
            report.source || 'cms',
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${value}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'assigned_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: 'Report Title',
            dataIndex: ['report', 'report_title'],
            key: 'report_title',
            render: (text) => {
                if (!text) return '';
                const [titleBeforeDash] = text.split(' - ');
                return titleBeforeDash;
            },
        },
        {
            title: 'Assigned To',
            dataIndex: 'user',
            key: 'user',
            render: (text) => (
                <Tag color="blue">{text}</Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('DD MMM YYYY'),
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (text) => <Tag color="orange">{text}</Tag>,
        },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <Title level={3}>Assigned Reports</Title>
            <Button
                type="primary"
                onClick={handleDownloadCSV}
                style={{ marginBottom: '1rem' }}
            >
                Download CSV
            </Button>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={assignedReports}
                    pagination={{ pageSize: 15 }}
                    bordered
                />
            )}
        </div>
    );
}
