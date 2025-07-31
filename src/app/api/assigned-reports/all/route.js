import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AssignedReport from '@/models/AssignedReport';
import Repcontent from '@/models/reports/repcontent';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();

        const assignments = await AssignedReport.find({}).lean();

        const reportIds = assignments.map(a => new mongoose.Types.ObjectId(a.reportId));
        const userIdsSet = new Set();
        assignments.forEach(a => {
            if (a.userId) userIdsSet.add(a.userId.toString());
            if (a.assignedBy) userIdsSet.add(a.assignedBy.toString());
        });
        const userIds = Array.from(userIdsSet).map(id => new mongoose.Types.ObjectId(id));

        const [reports, users] = await Promise.all([
            Repcontent.find({ _id: { $in: reportIds } }).lean(),
            User.find({ _id: { $in: userIds } }).lean(),
        ]);

        const reportMap = new Map(reports.map(r => [r._id.toString(), r]));
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const result = assignments.map((a) => ({
            user: (() => {
                const u = userMap.get(a.userId?.toString());
                return u ? `${u.Firstname} ${u.Lastname} (${u.email})` : null;
            })(),
            report: reportMap.get(a.reportId?.toString()) || null,
            assignedBy: (() => {
                const admin = userMap.get(a.assignedBy?.toString());
                return admin ? `${admin.Firstname} ${admin.Lastname} (${admin.email})` : 'N/A';
            })(),
            source: a.source || 'cms',
            createdAt: a.createdAt,
            _id: a._id,
        })).filter(r => r.user && r.report);

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('/api/assigned-reports/all error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
