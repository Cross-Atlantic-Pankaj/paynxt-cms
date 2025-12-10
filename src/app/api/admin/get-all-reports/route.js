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

    return NextResponse.json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
