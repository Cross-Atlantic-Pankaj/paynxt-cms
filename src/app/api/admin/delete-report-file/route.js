// /api/admin/delete-report-file
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ success: false, message: 'Missing report ID' }, { status: 400 });
    }

    await Repcontent.findByIdAndUpdate(reportId, { fileUrl: '' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
