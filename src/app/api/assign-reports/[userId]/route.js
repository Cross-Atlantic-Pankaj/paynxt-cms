import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AssignedReport from '@/models/AssignedReport';

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const docs = await AssignedReport.find({ userId }).sort({ createdAt: -1 });
    // return only reportIds; frontend can join with your reports list
    return NextResponse.json({ success: true, reportIds: docs.map(d => d.reportId) });
  } catch (err) {
    console.error('assign-reports GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
