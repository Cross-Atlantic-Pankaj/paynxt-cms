// /api/admin/delete-report-file
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';
import { deleteFromS3 } from '@/lib/s3';

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ success: false, message: 'Missing report ID' }, { status: 400 });
    }

    // Find the report to get the fileUrl
    const report = await Repcontent.findById(reportId);
    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    // Delete from S3 if fileUrl exists and is an S3 URL
    if (report.fileUrl && report.fileUrl.includes('.amazonaws.com/')) {
      await deleteFromS3(report.fileUrl).catch((err) => {
        console.error('Error deleting file from S3:', err);
        // Continue with database update even if S3 delete fails
      });
    }

    // Clear the fileUrl in the database
    await Repcontent.findByIdAndUpdate(reportId, { fileUrl: '' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete report file error:', error);
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
