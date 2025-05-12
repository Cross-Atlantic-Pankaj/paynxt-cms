import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Stats from '@/models/home-page/Stats';

export async function GET() {
  try {
    await connectDB();
    const statsDoc = await Stats.findOne(); 
    return NextResponse.json({
      success: true,
      data: statsDoc ? [statsDoc] : []
    });
  } catch (error) {
    console.error('Stats GET Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!Array.isArray(body.stats)) {
      return NextResponse.json({
        success: false,
        message: 'Stats array is required'
      }, { status: 400 });
    }
    let statsDoc = await Stats.findOne();

    if (statsDoc) {
      statsDoc.stats = body.stats;
      await statsDoc.save();
    } else {
      statsDoc = new Stats({ stats: body.stats });
      await statsDoc.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Stats updated successfully',
      data: statsDoc
    }, { status: 200 });
  } catch (error) {
    console.error('Stats POST Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Stat ID is required' }, { status: 400 });
    }

    const statsDoc = await Stats.findOne();
    if (!statsDoc) {
      return NextResponse.json({ success: false, message: 'Stats document not found' }, { status: 404 });
    }

    statsDoc.stats = statsDoc.stats.filter(stat => stat._id.toString() !== id);
    await statsDoc.save();

    return NextResponse.json({ success: true, message: 'Stat deleted successfully' });
  } catch (error) {
    console.error('Stats DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}