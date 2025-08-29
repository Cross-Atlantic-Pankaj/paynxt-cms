import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, message, List, Result } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const ReportCsvUploadModal = ({ open, onClose, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setSuccessMessage('');
      setErrorList([]);
      setErrorModalOpen(false);
    }
  }, [open]);

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
          const msg = `Successfully processed ${data.processedCount} of ${data.totalRows} reports.${data.errors.length > 0 ? ` ${data.errors.length} error(s) occurred.` : ''
            }`;

          // ✅ Show success inside modal
          setSuccessMessage(msg);

          if (data.errors.length > 0) {
            setErrorList(data.errors);
            setErrorModalOpen(true);
          }

          onSuccess('ok');
          onUploaded && onUploaded();
        } else {
          message.error(
            data.error ||
            `Upload failed: ${data.errors?.join('; ') || 'Unknown error'}`
          );
          setErrorList(data.errors || []);
          setErrorModalOpen(true);
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
    <>
      <Modal
        open={open}
        title="Upload Reports CSV / Excel"
        onCancel={() => {
          setSuccessMessage('');
          setErrorList([]);
          setErrorModalOpen(false);
          onClose();
        }}
        footer={null}
        destroyOnClose
      >
        {/* ✅ Show success view if upload was successful */}
        {successMessage ? (
          <Result
            status="success"
            title="Upload Successful!"
            subTitle={successMessage}
            extra={[
              <Button type="primary" onClick={onClose} key="close">
                Close
              </Button>,
            ]}
          />
        ) : (
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
        )}
      </Modal>

      {/* 🔹 Error Details Modal */}
      <Modal
        open={errorModalOpen}
        title="Upload Errors"
        footer={null}
        onCancel={() => setErrorModalOpen(false)}
      >
        {errorList.length > 0 ? (
          <List
            size="small"
            bordered
            dataSource={errorList}
            renderItem={(err, idx) => (
              <List.Item>{`${idx + 1}. ${err}`}</List.Item>
            )}
          />
        ) : (
          <p>No error details available.</p>
        )}
      </Modal>
    </>
  );
};

export default ReportCsvUploadModal;
