'use client';
import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const ReportCsvUploadModal = ({ open, onClose, onUploaded }) => {
  const [uploading, setUploading] = useState(false);

  // AntD Upload props
  const props = {
    name: 'file',
    accept: '.csv,.xls,.xlsx',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/reports/repcontent/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          message.success('CSV uploaded and processed successfully!');
          onSuccess('ok'); // notify Upload component
          onUploaded && onUploaded(); // callback to refresh list if needed
          onClose(); // close modal
        } else {
          const data = await res.json();
          message.error(data.error || 'Upload failed');
          onError(data.error);
        }
      } catch (err) {
        console.error('Upload error:', err);
        message.error('Something went wrong during upload.');
        onError(err);
      } finally {
        setUploading(false);
      }
    },
  };

  return (
    <Modal
      open={open}
      title="Upload Reports CSV / Excel"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Upload {...props} showUploadList={false}>
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          type="primary"
          block
        >
          {uploading ? 'Uploading...' : 'Click to Upload CSV / Excel'}
        </Button>
      </Upload>
    </Modal>
  );
};

export default ReportCsvUploadModal;
