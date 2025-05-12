import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Stats from '@/models/home-page/Stats';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    let stats;
    if (body._id) {
      stats = await Stats.findByIdAndUpdate(
        body._id,
        {
          title: body.title,
          statText: body.statText,
          description: body.description,
        },
        { new: true }
      );
    } else {
      stats = new Stats({
        title: body.title,
        statText: body.statText,
        description: body.description,
      });
      await stats.save();
    }
    return NextResponse.json({
      success: true,
      message: body._id ? 'Stats item updated successfully' : 'Stats item created successfully',
      data: stats
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const stats = await Stats.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats GET Error:', error);
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
      return NextResponse.json({
        success: false,
        message: 'Stats ID is required'
      }, { status: 400 });
    }
    await Stats.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Stats item deleted successfully'
    });
  } catch (error) {
    console.error('Stats DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}