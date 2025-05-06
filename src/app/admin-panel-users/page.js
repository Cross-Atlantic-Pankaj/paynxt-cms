'use client';
import { useEffect, useState, useRef } from 'react';
import { Table, Button, Spin, Pagination, message, Select, Switch, Popconfirm, Modal, Form, Input, Checkbox } from 'antd';
import Cookies from 'js-cookie';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import Highlighter from 'react-highlight-words';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [editRow, setEditRow] = useState(null);
  const [editState, setEditState] = useState({});
  const role = Cookies.get('admin_role');
  const myEmail = Cookies.get('admin_email');
  const isSuperadmin = role === 'superadmin';
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addUserData, setAddUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    isAdminPanelUser: true
  });
  const [addUserErrors, setAddUserErrors] = useState({});
  const [form] = Form.useForm();

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

  const handleEdit = (record) => {
    setEditRow(record._id);
    setEditState({
      role: record.role,
      isAdminPanelUser: record.isAdminPanelUser
    });
  };

  const handleCancel = () => {
    setEditRow(null);
    setEditState({});
  };

  const handleEditChange = (field, value) => {
    setEditState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (user) => {
    const res = await fetch(`/api/admin-panel-users/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user._id, ...editState })
    });
    if (res.ok) {
      message.success('User updated!');
      setEditRow(null);
      setEditState({});
      setRefresh(r => !r);
    } else {
      message.error('Failed to update user');
    }
  };

  const handleDelete = async (user) => {
    const res = await fetch(`/api/admin-panel-users/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user._id })
    });
    if (res.ok) {
      message.success('User deleted!');
      setRefresh(r => !r);
    } else {
      message.error('Failed to delete user');
    }
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch(selectedKeys, confirm, dataIndex);
          }}
          style={{ marginBottom: 8, display: 'block', width: 188 }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => { handleReset(clearFilters, dataIndex); setSelectedKeys(['']); }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterDropdownProps: {
      onOpenChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
    filteredValue: filters[dataIndex] || null,
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setFilters(prev => ({ ...prev, [dataIndex]: selectedKeys }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    setFilters(prev => ({ ...prev, [dataIndex]: null }));
  };

  const handleRefresh = () => {
    setFilters({});
    setSearchText('');
    setSearchedColumn('');
  };

  const handleAddUserInput = (field, value) => {
    setAddUserData(prev => ({ ...prev, [field]: value }));
    setAddUserErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateAddUser = () => {
    const errors = {};
    if (!addUserData.name.trim()) errors.name = 'Please enter name';
    if (!addUserData.email.trim()) errors.email = 'Please enter email';
    if (!addUserData.password.trim()) errors.password = 'Please enter password';
    if (!addUserData.role) errors.role = 'Please select role';
    return errors;
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAddUser();
    if (Object.keys(errors).length > 0) {
      setAddUserErrors(errors);
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin-panel-users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addUserData)
      });
      if (res.ok) {
        toast.success('User added!');
        setAddModalOpen(false);
        setAddUserData({ name: '', email: '', password: '', role: '', isAdminPanelUser: true });
        setAddUserErrors({});
        setRefresh(r => !r);
      } else {
        const data = await res.json();
        setAddUserErrors({ email: data.error || 'Failed to add user' });
        toast.error(data.error || 'Failed to add user');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', ...getColumnSearchProps('name') },
    { title: 'Email', dataIndex: 'email', key: 'email', ...getColumnSearchProps('email') },
    { title: 'Role', dataIndex: 'role', key: 'role', ...getColumnSearchProps('role'),
      render: (val, record) =>
        isSuperadmin && record.email !== myEmail && editRow === record._id ? (
          <Select
            value={editState.role}
            options={roleOptions}
            style={{ width: 120 }}
            onChange={v => handleEditChange('role', v)}
          />
        ) : (
          val
        )
    },
    { title: 'Approved', dataIndex: 'isAdminPanelUser', key: 'isAdminPanelUser', ...getColumnSearchProps('isAdminPanelUser'),
      render: (val, record) =>
        isSuperadmin && record.email !== myEmail && editRow === record._id ? (
          <Switch
            checked={editState.isAdminPanelUser}
            checkedChildren="Yes"
            unCheckedChildren="No"
            onChange={v => handleEditChange('isAdminPanelUser', v)}
          />
        ) : (
          val ? 'Yes' : 'No'
        )
    },
    ...(isSuperadmin ? [{
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (record.email === myEmail) return null;
        if (editRow === record._id) {
          return (
            <span>
              <Button icon={<SaveOutlined />} size="small" type="primary" onClick={() => handleSave(record)} style={{ marginRight: 8 }} />
              <Button icon={<CloseOutlined />} size="small" onClick={handleCancel} style={{ marginRight: 8 }} />
              <Popconfirm title="Are you sure to delete this user?" onConfirm={() => handleDelete(record)} okText="Yes" cancelText="No">
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            </span>
          );
        }
        return (
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
        );
      }
    }] : [])
  ];

  const pending = users.filter(u => !u.isAdminPanelUser);
  const approved = users.filter(u => u.isAdminPanelUser);
  const data = [...pending, ...approved];

  return (
    <div>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Panel Users</h1>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold">Refresh</button>
          {isSuperadmin && (
            <button onClick={() => setAddModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold">+ Add User</button>
          )}
        </div>
      </div>
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
      <Modal
        title="Add Admin User"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); setAddUserErrors({}); }}
        footer={null}
        destroyOnClose
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Name<span className="text-red-500">*</span></label>
            <input type="text" className={`w-full border rounded px-3 py-2 ${addUserErrors.name ? 'border-red-500' : 'border-gray-300'}`} value={addUserData.name} onChange={e => handleAddUserInput('name', e.target.value)} placeholder="Name" />
            {addUserErrors.name && <div className="text-red-500 text-sm mt-1">{addUserErrors.name}</div>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Email<span className="text-red-500">*</span></label>
            <input type="email" className={`w-full border rounded px-3 py-2 ${addUserErrors.email ? 'border-red-500' : 'border-gray-300'}`} value={addUserData.email} onChange={e => handleAddUserInput('email', e.target.value)} placeholder="Email" />
            {addUserErrors.email && <div className="text-red-500 text-sm mt-1">{addUserErrors.email}</div>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Password<span className="text-red-500">*</span></label>
            <input type="password" className={`w-full border rounded px-3 py-2 ${addUserErrors.password ? 'border-red-500' : 'border-gray-300'}`} value={addUserData.password} onChange={e => handleAddUserInput('password', e.target.value)} placeholder="Password" />
            {addUserErrors.password && <div className="text-red-500 text-sm mt-1">{addUserErrors.password}</div>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Role<span className="text-red-500">*</span></label>
            <select className={`w-full border rounded px-3 py-2 ${addUserErrors.role ? 'border-red-500' : 'border-gray-300'}`} value={addUserData.role} onChange={e => handleAddUserInput('role', e.target.value)}>
              <option value="">Select role</option>
              <option value="superadmin">Superadmin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            {addUserErrors.role && <div className="text-red-500 text-sm mt-1">{addUserErrors.role}</div>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isAdminPanelUser" checked={addUserData.isAdminPanelUser} onChange={e => handleAddUserInput('isAdminPanelUser', e.target.checked)} />
            <label htmlFor="isAdminPanelUser">Admin Panel Access</label>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50" disabled={addLoading}>{addLoading ? 'Adding...' : 'Add User'}</button>
        </form>
      </Modal>
    </div>
  );
} 