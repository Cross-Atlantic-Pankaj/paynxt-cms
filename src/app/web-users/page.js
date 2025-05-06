'use client';
import { useEffect, useState } from 'react';
import { Table, Spin, Pagination } from 'antd';
import 'antd/dist/reset.css';

const columns = [
  { title: 'Firstname', dataIndex: 'Firstname', key: 'Firstname' },
  { title: 'Lastname', dataIndex: 'Lastname', key: 'Lastname' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
  { title: 'Country', dataIndex: 'country', key: 'country' },
  { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleString() },
];

export default function WebUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/web-users?page=${page}&limit=10`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Web Users</h1>
      <Spin spinning={loading} tip="Loading users...">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          pagination={false}
        />
        <div className="flex justify-end mt-4">
          <Pagination
            current={page}
            pageSize={10}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      </Spin>
    </div>
  );
} 