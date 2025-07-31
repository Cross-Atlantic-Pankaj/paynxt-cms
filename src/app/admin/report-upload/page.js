'use client';

import { useEffect, useState } from 'react';
import { Table, Upload, Button, message, Input } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

export default function ReportUploadPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchReports('');
  }, []);

  const fetchReports = async (query = '') => {
    try {
      const res = await fetch(`/api/admin/get-all-reports?search=${query}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        message.error('Failed to load reports');
      }
    } catch (error) {
      message.error('Server error while loading reports');
    }
  };

  const handleUpload = async (reportId, file) => {
    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('file', file);

    setLoading(true);
    const res = await fetch('/api/admin/upload-report', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      message.success('File uploaded');
      setReports(prev =>
        prev.map(r => (r._id === reportId ? { ...r, fileUrl: result.fileUrl } : r))
      );
    } else {
      message.error('Upload failed');
    }

    return false; // prevent default upload
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchReports(value);
  };

  const columns = [
    {
      title: 'Report Title',
      dataIndex: 'report_title',
      render: (title) => title?.split(' - ')[0] || title,
    },
    {
      title: 'Uploaded File',
      render: (_, record) =>
        record.fileUrl ? (
          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        ) : (
          'No file uploaded'
        ),
    },
    {
      title: 'Upload / Replace File',
      render: (_, record) => (
        <Upload
          beforeUpload={(file) => handleUpload(record._id, file)}
          showUploadList={false}
          accept=".pdf,.xlsx"
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            {record.fileUrl ? 'Replace File' : 'Upload File'}
          </Button>
        </Upload>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Upload Reports</h2>
      <Search
        placeholder="Search report title"
        enterButton={<SearchOutlined />}
        allowClear
        onSearch={handleSearch}
        style={{ marginBottom: 16, width: 400 }}
      />
      <Table
        dataSource={reports}
        columns={columns}
        rowKey="_id"
        pagination={{
          ...pagination,
          total: reports.length,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />
    </div>
  );
}
