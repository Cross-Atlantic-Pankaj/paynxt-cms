'use client';

import { useEffect, useState } from 'react';
import { Table, Upload, Button, message, Input, Card, Tag, Badge, Space, Popconfirm } from 'antd';
import { UploadOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';

const { Search } = Input;

export default function ReportUploadPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Controlled upload file list: array of { uid, name (trimmed), originalName, file (File) }
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [matchedFiles, setMatchedFiles] = useState([]); // { reportId, fileName (trimmed), file }
  const [unmatchedFiles, setUnmatchedFiles] = useState([]); // { fileName (trimmed), originalName }

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
    } catch (err) {
      console.error(err);
      message.error('Server error while loading reports');
    }
  };

  /** ---------------------- Controlled Upload list ---------------------- **/
  const trimName = (fullName) => {
    return fullName.length > 20 ? fullName.slice(0, 17) + '...' : fullName;
  };

  const handleBeforeUpload = (file) => {
    // keep original File object intact under `file`
    const uid = file.uid || `${Date.now()}-${Math.random()}`;
    const originalName = file.name;
    const trimmed = trimName(originalName);

    // create an entry suitable for Antd Upload's controlled fileList
    const entry = {
      uid,
      name: trimmed,         // what Upload will show
      originalName,          // full filename for matching & tooltip
      file,                  // keep real File for upload
    };

    setSelectedFiles((prev) => [...prev, entry]);
    return false; // prevent Upload's default upload behavior
  };

  const handleRemoveSelected = (file) => {
    // file here will be the entry from our controlled `selectedFiles`
    setSelectedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  /** ---------------------- Batch matching & upload ---------------------- **/
  const prepareFileMatching = () => {
    const titleMap = {};
    reports.forEach(r => {
      const rawTitle = r.report_title || '';
      const cleanTitle = rawTitle
        .split('-')[0]                    // Take part before '-'
        .replace(/\.[^/.]+$/, '')         // Remove extension if any (safety)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')      // Remove special chars
        .replace(/\s+/g, ' ');            // Normalize spaces
      if (cleanTitle) {
        titleMap[cleanTitle] = r._id;
      }
    });

    const matched = [];
    const unmatched = [];

    selectedFiles.forEach(entry => {
      const originalName = entry.originalName;
      const fileNameNoExt = originalName.replace(/\.[^/.]+$/, ''); // Remove .pdf, .xlsx
      const cleanFileName = fileNameNoExt
        .split('-')[0]
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')      // Remove special chars
        .replace(/\s+/g, ' ');

      if (cleanFileName && titleMap[cleanFileName]) {
        matched.push({
          reportId: titleMap[cleanFileName],
          fileName: entry.name,
          file: entry.file,
          originalName: entry.originalName, // for debugging
        });
      } else {
        unmatched.push({
          fileName: entry.name,
          originalName: entry.originalName,
        });
      }
    });

    setMatchedFiles(matched);
    setUnmatchedFiles(unmatched);

    // Optional: Show debug info
    if (unmatched.length > 0) {
      console.log('Unmatched files:', unmatched.map(f => f.originalName));
      console.log('Available titles:', Object.keys(titleMap));
    }
  };

  const handleBatchUpload = async () => {
    if (matchedFiles.length === 0) {
      return message.warning('No matched files to upload');
    }

    setLoading(true);

    try {
      for (let i = 0; i < matchedFiles.length; i += 50) {
        const batch = matchedFiles.slice(i, i + 50);
        for (const { reportId, file } of batch) {
          const formData = new FormData();
          formData.append('reportId', reportId);
          formData.append('file', file);
          // optionally you can check response and handle errors
          await fetch('/api/admin/upload-report', { method: 'POST', body: formData });
        }
      }

      message.success('All batches uploaded');
      // reset selections
      setSelectedFiles([]);
      setMatchedFiles([]);
      setUnmatchedFiles([]);
      fetchReports('');
    } catch (err) {
      console.error(err);
      message.error('Batch upload failed');
    } finally {
      setLoading(false);
    }
  };

  /** ---------------------- Individual Actions ---------------------- **/
  const handleSingleUpload = async (reportId, file) => {
    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload-report', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        message.success('File replaced');
        fetchReports('');
      } else {
        message.error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      message.error('Upload failed (server error)');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleDelete = async (reportId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/delete-report-file?reportId=${reportId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        message.success('File deleted');
        fetchReports('');
      } else {
        message.error(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      message.error('Delete failed (server error)');
    } finally {
      setLoading(false);
    }
  };

  /** ---------------------- Table Columns ---------------------- **/
  const columns = [
    {
      title: 'Report Title',
      dataIndex: 'report_title',
      render: (title) => (title ? title.split('-')[0] : title),
      width: 300,
    },
    {
      title: 'Uploaded File',
      width: 200,
      render: (_, record) =>
        record.fileUrl ? (
          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
        ) : (
          <Tag color="red">No file</Tag>
        ),
    },
    {
      title: 'Replace',
      width: 150,
      render: (_, record) => (
        <Upload
          beforeUpload={(file) => handleSingleUpload(record._id, file)}
          showUploadList={false}
          accept=".pdf,.xlsx"
        >
          <Button icon={<UploadOutlined />} size="small">Replace</Button>
        </Upload>
      ),
    },
    {
      title: 'Delete',
      width: 150,
      render: (_, record) =>
        record.fileUrl && (
          <Popconfirm
            title="Delete this file?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* ----------- Batch Upload Card ----------- */}
      <Card
        title="Batch Report Upload"
        style={{ marginBottom: 24 }}
        extra={
          <Badge count={selectedFiles.length}>
            <Upload
              multiple
              beforeUpload={handleBeforeUpload}
              accept=".pdf,.xlsx"
              fileList={selectedFiles}                 // controlled list
              onRemove={handleRemoveSelected}
              showUploadList={{
                showRemoveIcon: true,
                // render trimmed name and full original name as title
                itemRender: (originNode, file) => (
                  <span title={file.originalName || file.name} style={{ display: 'inline-block', maxWidth: 220 }}>
                    {file.name}
                  </span>
                ),
              }}
            >
              <Button icon={<UploadOutlined />}>Select Files</Button>
            </Upload>
          </Badge>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="default" onClick={prepareFileMatching} disabled={selectedFiles.length === 0}>
            Match Files
          </Button>

          {matchedFiles.length > 0 && (
            <Table
              rowKey="fileName"
              columns={[
                { title: 'File Name', dataIndex: 'fileName' },
                { title: 'Status', render: () => <Tag color="green">Matched</Tag> }
              ]}
              dataSource={matchedFiles}
              pagination={false}
              style={{ marginTop: 16 }}
              size="small"
              tableLayout="fixed"
              scroll={{ x: 'max-content' }}
            />
          )}

          {unmatchedFiles.length > 0 && (
            <Table
              rowKey="originalName"
              columns={[
                { title: 'File Name (display)', dataIndex: 'fileName' },
                { title: 'Full Name', dataIndex: 'originalName', render: (t) => <span style={{ fontSize: 12 }}>{t}</span> },
                { title: 'Status', render: () => <Tag color="red">Unmatched</Tag> }
              ]}
              dataSource={unmatchedFiles}
              pagination={false}
              style={{ marginTop: 16 }}
              size="small"
              tableLayout="fixed"
              scroll={{ x: 'max-content' }}
            />
          )}

          <Button
            type="primary"
            onClick={handleBatchUpload}
            loading={loading}
            disabled={matchedFiles.length === 0}
          >
            Upload in Batches of 50
          </Button>
        </Space>
      </Card>

      {/* ----------- Individual Report Management ----------- */}
      <Card title="Manage Individual Reports">
        <Search
          placeholder="Search report title"
          enterButton={<SearchOutlined />}
          allowClear
          onSearch={(value) => fetchReports(value)}
          style={{ marginBottom: 16, width: 400 }}
        />
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          tableLayout="fixed"
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
