import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const ReportCsvUploadModal = ({ open, onClose, onUploaded }) => {
  const [uploading, setUploading] = useState(false);

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

        const data = await res.json();
        if (res.status === 200 && data.success) {
          const messageText = `Successfully processed ${data.processedCount} of ${data.totalRows} reports.${
            data.errors.length > 0 ? ` ${data.errors.length} error(s) occurred. Click for details.` : ''
          }`;
          message.success({
            content: messageText,
            duration: 5,
            onClick: data.errors.length > 0 ? () => message.info(data.errors.join('\n'), 10) : undefined,
          });
          onSuccess('ok');
          onUploaded && onUploaded();
          onClose();
        } else {
          message.error(data.error || `Upload failed: ${data.errors?.join('; ') || 'Unknown error'}`);
          onError(data.error || 'Upload failed');
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
        <Button icon={<UploadOutlined />} loading={uploading} type="primary" block>
          {uploading ? 'Uploading...' : 'Click to Upload CSV / Excel'}
        </Button>
      </Upload>
    </Modal>
  );
};

export default ReportCsvUploadModal;