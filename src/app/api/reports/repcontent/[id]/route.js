import connectDB from '@/lib/db';
import Repcontent from '@/models/reports/repcontent';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    const updated = await Repcontent.findByIdAndUpdate(params.id, body, { new: true });
    if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const id = params.id;
    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 });
    }

    const result = await Repcontent.deleteOne({ _id: id });

    return Response.json({ message: 'Deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}