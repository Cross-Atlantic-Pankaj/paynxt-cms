'use client';
import { useEffect, useState } from 'react';
import { Table, Button, Spin, Pagination, message, Select, Switch } from 'antd';
import Cookies from 'js-cookie';
import 'antd/dist/reset.css';

const roleOptions = [
  { label: 'Superadmin', value: 'superadmin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];

export default function AdminPanelUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const [editState, setEditState] = useState({});
  const role = Cookies.get('admin_role');
  const myEmail = Cookies.get('admin_email');
  const isSuperadmin = role === 'superadmin';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin-panel-users?page=${page}&limit=10`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, refresh]);

  const handleEditChange = (id, field, value) => {
    setEditState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (user) => {
    const changes = editState[user._id];
    if (!changes) return;
    const res = await fetch(`/api/admin-panel-users/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user._id, ...changes })
    });
    if (res.ok) {
      message.success('User updated!');
      setEditState(prev => ({ ...prev, [user._id]: undefined }));
      setRefresh(r => !r);
    } else {
      message.error('Failed to update user');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role',
      render: (val, record) =>
        isSuperadmin && record.email !== myEmail ? (
          <Select
            value={editState[record._id]?.role ?? val}
            options={roleOptions}
            style={{ width: 120 }}
            onChange={v => handleEditChange(record._id, 'role', v)}
          />
        ) : (
          val
        )
    },
    { title: 'Approved', dataIndex: 'isAdminPanelUser', key: 'isAdminPanelUser',
      render: (val, record) =>
        isSuperadmin && record.email !== myEmail ? (
          <Switch
            checked={editState[record._id]?.isAdminPanelUser ?? val}
            checkedChildren="Yes"
            unCheckedChildren="No"
            onChange={v => handleEditChange(record._id, 'isAdminPanelUser', v)}
          />
        ) : (
          val ? 'Yes' : 'No'
        )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        isSuperadmin && record.email !== myEmail && editState[record._id] ? (
          <Button type="primary" size="small" onClick={() => handleSave(record)}>
            Save
          </Button>
        ) : null
    }
  ];

  // Pending requests at the top
  const pending = users.filter(u => !u.isAdminPanelUser);
  const approved = users.filter(u => u.isAdminPanelUser);
  const data = [...pending, ...approved];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Panel Users</h1>
      <Spin spinning={loading} tip="Loading users...">
        <Table
          columns={columns}
          dataSource={data}
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