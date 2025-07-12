'use client';
import { useEffect, useState, useRef } from 'react';
import { Table, Spin, Pagination, Button } from 'antd';
import 'antd/dist/reset.css';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export default function WebUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});

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

  // Helper to download CSV
  const downloadCSV = (data) => {
    if (!data.length) return;

    // Only keep desired fields
    const fieldsToExport = ['Firstname', 'Lastname', 'email', 'phoneNumber', 'country'];

    const csvRows = [];
    csvRows.push(fieldsToExport.join(',')); // header

    data.forEach(row => {
      const values = fieldsToExport.map(field => {
        const val = row[field];
        const escaped = ('' + (val !== undefined ? val : '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'web_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getColumnSearchProps = (dataIndex) => ({
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

  const columns = [
    { title: 'Firstname', dataIndex: 'Firstname', key: 'Firstname', ...getColumnSearchProps('Firstname') },
    { title: 'Lastname', dataIndex: 'Lastname', key: 'Lastname', ...getColumnSearchProps('Lastname') },
    { title: 'Email', dataIndex: 'email', key: 'email', ...getColumnSearchProps('email') },
    { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber', ...getColumnSearchProps('phoneNumber') },
    { title: 'Country', dataIndex: 'country', key: 'country', ...getColumnSearchProps('country') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Web Users</h1>
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          >
            Refresh
          </button>
          <button
            onClick={() => downloadCSV(users)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold"
          >
            Download CSV
          </button>
        </div>
      </div>
      <Spin spinning={loading} tip="Loading users...">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          pagination={false}
          filters={filters}
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
