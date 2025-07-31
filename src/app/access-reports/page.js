'use client';
import { useEffect, useState } from 'react';
import { Table, Button, Select, message, Input } from 'antd';

const { Option } = Select;

export default function AssignReportsPage() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedReportIds, setSelectedReportIds] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);

    useEffect(() => {
        // Fetch users, reports, subcategories
        fetchUsers();
        fetchReports();
        fetchSubCategories();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/web-users');
            const data = await res.json();

            // Ensure `data` is an array
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data?.users && Array.isArray(data.users)) {
                setUsers(data.users); // In case your API returns { users: [...] }
            } else {
                setUsers([]); // fallback to empty array
                console.warn('Unexpected users response:', data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setUsers([]);
        }
    };

    const fetchReports = async () => {
        const res = await fetch('/api/reports/repcontent'); // Replace with actual API
        const data = await res.json();
        setReports(data);
        setFilteredReports(data);
    };

    const fetchSubCategories = async () => {
        try {
            const res = await fetch('/api/product-subcategory');
            const result = await res.json();
            console.log('Subcategories Response:', result);

            if (result?.success && Array.isArray(result.data)) {
                setSubCategories(result.data); // ✅ Fix is here
            } else {
                setSubCategories([]);
                console.warn('Unexpected subCategories format');
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            setSubCategories([]);
        }
    };

    const handleAssign = async () => {
        if (!selectedUserIds.length || !selectedReportIds.length) {
            message.warning('Please select both users and reports.');
            return;
        }

        try {
            const res = await fetch('/api/assign-reports', {
                method: 'POST',
                body: JSON.stringify({
                    userIds: selectedUserIds,
                    reportIds: selectedReportIds,
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await res.json();
            if (result.success) {
                message.success('Reports assigned successfully');
                setSelectedReportIds([]);
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            message.error('Failed to assign reports');
        }
    };

    const columns = [
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

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assign Reports to Users</h2>

            <div className="mb-4">
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    showSearch
                    autoClearSearchValue={false}
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
            </div>

            <div className="mb-4 flex gap-4">
                <Select
                    allowClear
                    showSearch
                    placeholder="Filter by Product Sub-Category"
                    autoClearSearchValue={false}
                    onChange={(value) => {
                        setFilteredReports(
                            value ? reports.filter((r) => r.Product_sub_Category === value) : reports
                        );
                    }}
                    filterOption={(input, option) =>
                        (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
                    }
                >
                    {subCategories.map((sub) => (
                        <Option key={sub._id} value={sub.subProductName}>
                            {sub.subProductName}
                        </Option>
                    ))}
                </Select>
            </div>

            <div className="mb-4">
                <Input.Search
                    placeholder="Search report titles"
                    allowClear
                    onSearch={(value) => {
                        const filtered = reports.filter((r) =>
                            r.report_title?.toLowerCase().includes(value.toLowerCase())
                        );
                        setFilteredReports(filtered);
                    }}
                    onChange={(e) => {
                        if (!e.target.value) {
                            setFilteredReports(reports); // Reset on clear
                        }
                    }}
                />
            </div>

            <Table
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedReportIds,
                    onChange: setSelectedReportIds,
                }}
                rowKey="_id"
                columns={columns}
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
        </div>
    );
}
