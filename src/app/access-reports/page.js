'use client';
import { useEffect, useState } from 'react';
import { Table, Button, Select, message, Input, Tag, Typography, Spin, Alert } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

export default function AccessReportsPage() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);

    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedReportIds, setSelectedReportIds] = useState([]);

    const [assignedReports, setAssignedReports] = useState([]);
    const [loadingAssigned, setLoadingAssigned] = useState(true);
    const [searchUser, setSearchUser] = useState('');
    const [successBanner, setSuccessBanner] = useState(null);


    // Fetch initial data
    useEffect(() => {
        fetchUsers();
        fetchReports();
        fetchSubCategories();
        fetchAssignedReports();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/web-users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data?.users && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setUsers([]);
        }
    };

    const fetchReports = async () => {
        const res = await fetch('/api/reports/repcontent');
        const data = await res.json();
        setReports(data);
        setFilteredReports(data);
    };

    const fetchSubCategories = async () => {
        try {
            const res = await fetch('/api/product-subcategory');
            const result = await res.json();
            if (result?.success && Array.isArray(result.data)) {
                setSubCategories(result.data);
            } else {
                setSubCategories([]);
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            setSubCategories([]);
        }
    };

    const fetchAssignedReports = async () => {
        setLoadingAssigned(true);
        try {
            const res = await fetch('/api/assigned-reports/all');
            const data = await res.json();
            if (data.success) {
                setAssignedReports(data.data);
            } else {
                message.error('Failed to load assigned reports');
            }
        } catch (err) {
            console.error(err);
            message.error('Something went wrong while fetching data');
        } finally {
            setLoadingAssigned(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedUserIds.length || !selectedReportIds.length) {
            message.warning('⚠️ Please select both users and reports.');
            return;
        }

        try {
            const res = await fetch('/api/assign-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userIds: selectedUserIds,
                    reportIds: selectedReportIds,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                const msg = result.message || 'Reports assigned successfully!';
                message.success(msg); // ✅ toast
                setSuccessBanner(msg); // ✅ top banner text
                setSelectedReportIds([]);
                fetchAssignedReports();
            } else {
                message.error(result.message || '❌ Failed to assign reports.');
            }
        } catch (err) {
            message.error('🚨 Something went wrong while assigning reports.');
        }
    };


    // Table columns for assigning
    const assignColumns = [
        {
            title: 'Title',
            dataIndex: 'report_title',
            render: (title) => title?.split(' - ')[0],
        },
        {
            title: 'Published Date',
            dataIndex: 'report_publish_date',
            render: (date) => {
                const d = new Date(date);
                return !isNaN(d) ? d.toLocaleDateString('en-GB') : 'N/A';
            },
        },
        {
            title: 'Product Sub-Category',
            dataIndex: 'Product_sub_Category',
        },
        {
            title: 'Report Type',
            dataIndex: 'report_type',
        },
    ];

    // Table columns for assigned reports
    const assignedColumns = [
        {
            title: 'Report Title',
            dataIndex: ['report', 'report_title'],
            render: (text) => text?.split(' - ')[0] || '',
        },
        {
            title: 'Assigned To',
            dataIndex: 'user',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            render: (text) => dayjs(text).format('DD MMM YYYY'),
        },
        {
            title: 'Source',
            dataIndex: 'source',
            render: (text) => <Tag color="orange">{text || 'cms'}</Tag>,
        },
    ];

    // Filter assigned reports by user search
    const filteredAssignedReports = assignedReports.filter(r =>
        r.user?.toLowerCase().includes(searchUser.toLowerCase())
    );

    return (
        <div className="p-6">
            {successBanner && (
                <Alert
                    message={successBanner}
                    type="success"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                    onClose={() => setSuccessBanner(null)}
                />
            )}
            <Title level={3}>Assign Reports to Users</Title>

            {/* Select Users */}
            <Select
                mode="multiple"
                allowClear
                style={{ width: '100%', marginBottom: 16 }}
                showSearch
                placeholder="Select Users"
                onChange={setSelectedUserIds}
                filterOption={(input, option) => {
                    const user = users.find((u) => u._id === option?.value);
                    const label = `${user?.Firstname ?? ''} ${user?.Lastname ?? ''} (${user?.email ?? ''})`;
                    return label.toLowerCase().includes(input.toLowerCase());
                }}
            >
                {users.map((user) => (
                    <Option key={user._id} value={user._id}>
                        {user.Firstname} {user.Lastname} ({user.email})
                    </Option>
                ))}
            </Select>

            {/* Filter by Subcategory */}
            <Select
                allowClear
                showSearch
                placeholder="Filter by Product Sub-Category"
                style={{ width: '100%', marginBottom: 16 }}
                onChange={(value) => {
                    setFilteredReports(
                        value ? reports.filter((r) => r.Product_sub_Category === value) : reports
                    );
                }}
            >
                {subCategories.map((sub) => (
                    <Option key={sub._id} value={sub.subProductName}>
                        {sub.subProductName}
                    </Option>
                ))}
            </Select>

            {/* Search Reports */}
            <Input.Search
                placeholder="Search report titles"
                allowClear
                style={{ marginBottom: 16 }}
                onSearch={(value) => {
                    setFilteredReports(
                        reports.filter((r) =>
                            r.report_title?.toLowerCase().includes(value.toLowerCase())
                        )
                    );
                }}
            />

            {/* Assign Reports Table */}
            <Table
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedReportIds,
                    onChange: setSelectedReportIds,
                }}
                rowKey="_id"
                columns={assignColumns}
                dataSource={filteredReports}
                pagination={{ pageSize: 10 }}
            />

            <Button
                type="primary"
                onClick={handleAssign}
                className="mt-4"
                disabled={!selectedUserIds.length || !selectedReportIds.length}
            >
                Make Selection Available
            </Button>

            {/* Assigned Reports Section */}
            <Title level={3} style={{ marginTop: 40 }}>Assigned Reports</Title>
            <Input.Search
                placeholder="Search by user"
                allowClear
                style={{ marginBottom: 16 }}
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
            />
            {loadingAssigned ? (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    rowKey="_id"
                    columns={assignedColumns}
                    dataSource={filteredAssignedReports}
                    pagination={{ pageSize: 15 }}
                    bordered
                />
            )}
        </div>
    );
}
