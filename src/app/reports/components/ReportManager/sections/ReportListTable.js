'use client';
import React from 'react';
import { Table, Button, Popconfirm, Tag } from 'antd';

// columns config
const getColumns = (onEdit, onDelete, getColumnSearchProps) => [
    {
        title: 'Title',
        dataIndex: 'report_title',
        key: 'report_title',
        sorter: (a, b) => a.report_title.localeCompare(b.report_title),
        ...getColumnSearchProps('report_title'),
    },
    {
        title: 'Type',
        dataIndex: 'report_type',
        key: 'report_type',
    },
    {
        title: 'Format',
        dataIndex: 'report_format',
        key: 'report_format',
    },
    {
        title: 'Publisher',
        dataIndex: 'report_publisher',
        key: 'report_publisher',
    },
    {
        title: 'Publish Date',
        dataIndex: 'report_publish_date',
        key: 'report_publish_date',
        render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        sorter: (a, b) => new Date(a.report_publish_date) - new Date(b.report_publish_date),
    },
    {
        title: 'Featured',
        dataIndex: 'Featured_Report_Status',
        key: 'Featured_Report_Status',
        render: (val) => val === 1 ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
    {
        title: 'Visible To',
        dataIndex: 'report_visible',
        key: 'report_visible',
        render: (val) => {
            switch (val) {
                case 0: return <Tag>All Users</Tag>;
                case 1: return <Tag color="blue">Paid Users</Tag>;
                case 2: return <Tag color="red">Not Visible</Tag>;
                case 3: return <Tag color="gold">Free Users Only</Tag>;
                default: return '-';
            }
        }
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <>
                <Button type="link" onClick={() => onEdit(record)}>Edit</Button>
                <Popconfirm
                    title="Are you sure you want to delete?"
                    onConfirm={() => onDelete(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="link" danger>Delete</Button>
                </Popconfirm>
            </>
        )
    }
];

export default function ReportListTable({ data, onEdit, onDelete, getColumnSearchProps }) {

    const sortedData = [...data].sort((a, b) => {
        if (!a.report_publish_date) return 1;
        if (!b.report_publish_date) return -1;
        return new Date(b.report_publish_date) - new Date(a.report_publish_date); // newest first
    });
    return (
        <Table
            rowKey="_id" // or report_id if unique
            columns={getColumns(onEdit, onDelete, getColumnSearchProps)}
            dataSource={sortedData}
            expandable={{
                expandedRowRender: (record) => (
                    <div style={{ paddingLeft: 24 }}>
                        <p><b>Summary:</b> {record.report_summary || '-'}</p>
                        <p><b>Scope:</b> {record.report_scope || '-'}</p>
                        <p><b>Reasons to Buy:</b> {record.reasons_to_buy || '-'}</p>
                        <p><b>Table of Contents:</b> {record.Table_of_Contents || '-'}</p>
                        <p><b>List of Tables:</b> {record.list_of_tables || '-'}</p>
                        <p><b>List of Figures:</b> {record.List_of_figures || '-'}</p>
                        <p><b>Region:</b> {record.Report_Geography_Region || '-'}</p>
                        <p><b>Country:</b> {record.Report_Geography_Country || '-'}</p>
                        <p><b>Category:</b> {record.Product_category || '-'}</p>
                        <p><b>Sub-Category:</b> {record.Product_sub_Category || '-'}</p>
                        <p><b>Companies Mentioned:</b> {record.Companies_mentioned || '-'}</p>
                        <p><b>Pages:</b> {record.report_pages || '-'}</p>
                        <p><b>Single User Price:</b> {record.single_user_dollar_price ? `$${record.single_user_dollar_price}` : '-'}</p>
                        <p><b>Small Team Price:</b> {record.Small_Team_dollar_price ? `$${record.Small_Team_dollar_price}` : '-'}</p>
                        <p><b>Enterprise Price:</b> {record.Enterprise_dollar_price ? `$${record.Enterprise_dollar_price}` : '-'}</p>
                        <p><b>Meta Title:</b> {record.Meta_Title || '-'}</p>
                        <p><b>Meta Description:</b> {record.Meta_Description || '-'}</p>
                        <p><b>Meta Keywords:</b> {record.Meta_Keyword || '-'}</p>
                        <p><b>Home Page:</b> {record.Home_Page || '-'}</p>
                        <p><b>SEO URL:</b> {record.seo_url || '-'}</p>
                        <p><b>File Name:</b> {record.report_file_name || '-'}</p>
                        <p><b>Sample Page Report Name:</b> {record.Sample_Page_report_name || '-'}</p>
                        <p><b>Key Stats A1:</b> {record.key_stats_a1 ?? '-'}</p>
                        <p><b>Key Stats A2:</b> {record.key_stats_a2 || '-'}</p>
                        <p><b>Key Stats B1:</b> {record.key_stats_b1 ?? '-'}</p>
                        <p><b>Key Stats B2:</b> {record.key_stats_b2 || '-'}</p>
                        <p><b>Key Stats C1:</b> {record.key_stats_c1 ?? '-'}</p>
                        <p><b>Key Stats C2:</b> {record.key_stats_c2 || '-'}</p>
                        <p><b>Key Stats D1:</b> {record.key_stats_d1 ?? '-'}</p>
                        <p><b>Key Stats D2:</b> {record.key_stats_d2 || '-'}</p>

                        <p><b>RD Section 1:</b> {record.RD_Section1 || '-'}</p>
                        <p><b>RD Section 2:</b> {record.RD_Section2 || '-'}</p>
                        <p><b>RD Section 3:</b> {record.RD_Section3 || '-'}</p>
                        <p><b>RD Text Section 1:</b> {record.RD_Text_Section1 || '-'}</p>
                        <p><b>RD Text Section 2:</b> {record.RD_Text_Section2 || '-'}</p>
                        <p><b>RD Text Section 3:</b> {record.RD_Text_Section3 || '-'}</p>

                        <p><b>FAQs:</b> {record.FAQs || '-'}</p>

                    </div>
                )
            }}
            pagination={{ pageSize: 10 }}
        />
    );
}
