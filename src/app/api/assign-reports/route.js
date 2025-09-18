import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AssignedReport from '@/models/AssignedReport';

export async function POST(req) {
  try {
    await connectDB();
    const { userIds, reportIds, assignedBy } = await req.json();

    if (!Array.isArray(userIds) || !userIds.length || !Array.isArray(reportIds) || !reportIds.length) {
      return NextResponse.json({ success: false, message: 'userIds and reportIds are required arrays' }, { status: 400 });
    }

    // bulk upsert to avoid duplicates
    const ops = [];
    for (const userId of userIds) {
      for (const reportId of reportIds) {
        const stringReportId = String(reportId);
        // Processing report assignment
        ops.push({
          updateOne: {
            filter: { userId, reportId: stringReportId },
            update: {
              $setOnInsert: {
                userId,
                reportId: stringReportId,
                assignedBy: assignedBy || null,
                source: 'cms'
              }
            },
            upsert: true,
          }
        });
      }
    }

    const result = await AssignedReport.bulkWrite(ops, { ordered: false });

    return NextResponse.json({
      success: true,
      message: 'Assignments processed',
      stats: {
        upserted: result.upsertedCount ?? 0,
        matched: result.matchedCount ?? 0,
        modified: result.modifiedCount ?? 0,
      }
    });
  } catch (err) {
    console.error('assign-reports POST error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
