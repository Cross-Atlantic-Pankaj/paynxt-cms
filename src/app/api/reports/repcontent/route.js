import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // report_id is required
    if (!body.report_id) {
      return Response.json({ error: 'report_id is required' }, { status: 400 });
    }

    const newReport = new Repcontent(body);
    await newReport.save();

    return Response.json(newReport, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to add report' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    // Try to populate, but fallback to basic find if populate fails
    let reports;
    try {
      reports = await Repcontent.find().populate('tileTemplateId').sort({ createdAt: 1 });
    } catch (populateError) {
      console.log('Populate failed, using basic find:', populateError.message);
      reports = await Repcontent.find().sort({ createdAt: 1 });
    }
    return Response.json(reports);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to get reports' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const result = await Repcontent.deleteMany({});
    return Response.json({ message: 'All reports deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Delete all error:', err);
    return Response.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const data = await req.json();

    // You should have either report_id or _id to find the document
    if (!data.report_id && !data._id) {
      return Response.json({ error: 'Missing report_id or _id' }, { status: 400 });
    }

    const filter = data._id ? { _id: data._id } : { report_id: data.report_id };

    // remove _id from update data if present (Mongo doesn't allow _id change)
    if (data._id) delete data._id;

    const result = await Repcontent.updateOne(filter, { $set: data }, { upsert: false });

    return Response.json({ message: 'Updated successfully', matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('PUT error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
