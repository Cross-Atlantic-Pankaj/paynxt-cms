import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    await connectDB();

    const data = await req.formData();
    const file = data.get('file');
    const reportId = data.get('reportId');

    if (!file || !reportId) {
      return NextResponse.json({ success: false, message: 'Missing file or report ID' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop();
    const fileName = `report-${reportId}-${Date.now()}.${ext}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    await writeFile(filePath, buffer);

    // const fileUrl = `/uploads/${fileName}`;
    const CMS_DOMAIN = process.env.CMS_DOMAIN || 'https://pay-nxt-cms-self.vercel.app';
    const fileUrl = `${CMS_DOMAIN}/uploads/${fileName}`;


    // Save to DB
    await Repcontent.findByIdAndUpdate(reportId, { fileUrl });

    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
