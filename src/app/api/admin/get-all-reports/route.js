// route.js for /api/admin/get-all-reports
import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query = search
      ? { report_title: { $regex: search, $options: 'i' } }
      : {};

    const reports = await Repcontent.find(query).lean();

    // Normalize fileUrl to relative paths for frontend compatibility
    const normalizedReports = reports.map(report => {
      if (report.fileUrl) {
        // Convert absolute URLs to relative paths
        // Handles: localhost:3004/uploads/... or https://domain.com/uploads/... -> /uploads/...
        if (report.fileUrl.startsWith('http://') || report.fileUrl.startsWith('https://') || report.fileUrl.startsWith('localhost:')) {
          const urlMatch = report.fileUrl.match(/\/uploads\/.+$/);
          if (urlMatch) {
            report.fileUrl = urlMatch[0]; // Extract /uploads/... part
          }
        }
        // Ensure it starts with / if it's a relative path
        if (!report.fileUrl.startsWith('/') && report.fileUrl.startsWith('uploads/')) {
          report.fileUrl = '/' + report.fileUrl;
        }
      }
      return report;
    });

    return NextResponse.json({ success: true, data: normalizedReports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
