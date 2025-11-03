import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.formData();

    let files = data.getAll('files');
    let reportIds = data.getAll('reportIds');

    if (!files.length || !reportIds.length) {
      // fallback to single upload
      const singleFile = data.get('file');
      const singleReportId = data.get('reportId');
      if (!singleFile || !singleReportId) {
        return NextResponse.json({ success: false, message: 'Missing file(s) or reportId(s)' }, { status: 400 });
      }
      files = [singleFile];
      reportIds = [singleReportId];
    }
    const CMS_DOMAIN = process.env.CMS_DOMAIN || 'https://paynxt-cms.vercel.app';
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reportId = reportIds[i];

      // Find the existing report
      const report = await Repcontent.findById(reportId);
      if (!report) continue;

      // If there is an old file, delete it
      if (report.fileUrl) {
        const oldFilePath = path.join(process.cwd(), 'public', report.fileUrl.replace(`${CMS_DOMAIN}`, ''));
        if (fs.existsSync(oldFilePath)) {
          await unlink(oldFilePath).catch(() => { }); // Ignore errors
        }
      }

      // Save the new file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop();
      const fileName = `report-${reportId}-${Date.now()}.${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

      await writeFile(filePath, buffer);

      const fileUrl = `${CMS_DOMAIN}/uploads/${fileName}`;

      // Update DB with new file URL
      report.fileUrl = fileUrl;
      await report.save();

      uploadedUrls.push({ reportId, fileUrl });
    }

    return NextResponse.json({ success: true, uploaded: uploadedUrls });
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
