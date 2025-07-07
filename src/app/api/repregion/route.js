import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RepRegion from '@/models/repmaster/repregion';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.repRegionName || !body.repCountryId) {
      return NextResponse.json({ success: false, message: 'repRegionName and repCountryId are required' }, { status: 400 });
    }

    let region;
    if (body._id) {
      // Update existing
      region = await RepRegion.findByIdAndUpdate(
        body._id,
        {
          repRegionName: body.repRegionName,
          repCountryId: body.repCountryId,
          generalComment: body.generalComment,
        },
        { new: true }
      ).populate('repCountryId');
    } else {
      // Create new
      region = new RepRegion({
        repRegionName: body.repRegionName,
        repCountryId: body.repCountryId,
        generalComment: body.generalComment,
      });
      await region.save();
      await region.populate('repCountryId');
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Region updated successfully' : 'Region created successfully',
      data: region,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('RepRegion POST Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const regions = await RepRegion.find().populate('repCountryId').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: regions });
  } catch (error) {
    console.error('RepRegion GET Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const url = req.nextUrl || new URL(req.url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await RepRegion.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Region deleted successfully' });
  } catch (error) {
    console.error('RepRegion DELETE Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
