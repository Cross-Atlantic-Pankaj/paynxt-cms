import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const BlogCsvUploadModal = ({ open, onClose, onUploaded }) => {
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

        const res = await fetch('/api/blog-page/blog-content/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.status === 200 && data.success) {
          const messageText = `Successfully processed ${data.processedCount} of ${data.totalRows} blogs.${
            data.errors.length > 0 ? ` ${data.errors.length} error(s) occurred.` : ''
          }`;
          
          console.log('Upload successful, showing message:', messageText);
          
          // Show success message
          message.success({
            content: messageText,
            duration: 15,
            key: 'upload-success',
            style: {
              marginTop: '50px',
              zIndex: 9999,
              maxWidth: '600px'
            }
          });
          
          // Show browser alert for success
          alert(`✅ SUCCESS: ${messageText}`);
          
          if (data.errors.length > 0) {
            // Show errors in a more prominent way
            const errorText = data.errors.join('\n');
            message.error({
              content: `Upload completed with ${data.errors.length} error(s):\n\n${errorText}`,
              duration: 15,
              key: 'upload-errors',
              style: {
                marginTop: '50px',
                zIndex: 9999,
                maxWidth: '600px',
                whiteSpace: 'pre-line'
              }
            });
            
            // Show browser alert for partial success with errors
            alert(`⚠️ PARTIAL SUCCESS: Upload completed with ${data.errors.length} error(s):\n\n${errorText}`);
            
            // Also log to console for debugging
            console.error('Upload errors:', data.errors);
          }
          
          // Call onSuccess for upload component
          onSuccess('ok');
          
          // Close modal and refresh after a delay
          setTimeout(() => {
            onClose();
            onUploaded && onUploaded();
          }, 1000);
        } else {
          // Show detailed error information
          let errorMessage = 'Upload failed';
          if (data.error) {
            errorMessage = data.error;
          } else if (data.errors && data.errors.length > 0) {
            errorMessage = `Upload failed with ${data.errors.length} error(s):\n\n${data.errors.join('\n')}`;
          }
          
          message.error({
            content: errorMessage,
            duration: 15,
            key: 'upload-failed',
            style: {
              marginTop: '50px',
              zIndex: 9999,
              maxWidth: '600px',
              whiteSpace: 'pre-line'
            }
          });
          
          // Show browser alert for failure
          alert(`❌ FAILED: ${errorMessage}`);
          
          onError(data.error || 'Upload failed');
        }
      } catch (err) {
        console.error('Upload error:', err);
        const errorMsg = 'Something went wrong during upload.';
        message.error(errorMsg);
        
        // Show browser alert for unexpected errors
        alert(`💥 ERROR: ${errorMsg}\n\nDetails: ${err.message || 'Unknown error'}`);
        
        onError(err);
      } finally {
        setUploading(false);
      }
    },
  };

  return (
    <Modal
      open={open}
      title="Upload Blogs CSV / Excel"
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

export default BlogCsvUploadModal;
