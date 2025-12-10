import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

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
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reportId = reportIds[i];

      // Find the existing report
      const report = await Repcontent.findById(reportId);
      if (!report) continue;

      // If there is an old file in S3, delete it
      if (report.fileUrl) {
        // Check if it's an S3 URL or old local URL
        if (report.fileUrl.includes('.amazonaws.com/')) {
          await deleteFromS3(report.fileUrl).catch((err) => {
            console.error('Error deleting old S3 file:', err);
          });
        }
      }

      // Prepare file for S3 upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop();
      const fileName = `report-${reportId}-${Date.now()}.${ext}`;
      
      // Determine content type based on file extension
      const contentType = ext === 'pdf' ? 'application/pdf' : 
                         ext === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                         'application/octet-stream';

      // Upload to S3
      const fileUrl = await uploadToS3(buffer, fileName, contentType);

      // Update DB with S3 URL
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
