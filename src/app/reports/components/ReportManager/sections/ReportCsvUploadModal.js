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
          
          console.log('Upload successful, showing message:', messageText);
          
          // Configure message to ensure it's visible
          message.config({
            top: 50,
            duration: 10,
            maxCount: 5,
            rtl: false,
            prefixCls: 'ant-message',
          });
          
          // Try multiple ways to show the message
          setTimeout(() => {
            message.success({
              content: messageText,
              duration: 10,
              key: 'upload-success',
              style: {
                marginTop: '50px',
                zIndex: 9999,
              }
            });
            console.log('Message.success called');
            
            // Backup alert to confirm functionality
            alert('Upload Successful: ' + messageText);
          }, 100);
          
          if (data.errors.length > 0) {
            message.info(data.errors.join('\n'), 10);
          }
          
          // Call onSuccess for upload component
          onSuccess('ok');
          
          // Close modal and refresh after a delay
          setTimeout(() => {
            onClose();
            onUploaded && onUploaded();
          }, 1000);
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