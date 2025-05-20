import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import KeyStatistics from '@/models/Pages/KeyStatistics';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { title, description, _id } = body;

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    let keyStatistics;
    if (_id) {
      keyStatistics = await KeyStatistics.findByIdAndUpdate(
        _id,
        {
          title: title.trim(),
          description: description.trim(),
        },
        { new: true }
      );
      if (!keyStatistics) {
        throw new Error('Key Statistics entry not found');
      }
    } else {
      keyStatistics = new KeyStatistics({
        title: title.trim(),
        description: description.trim(),
      });
      await keyStatistics.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Key Statistics updated successfully' : 'Key Statistics created successfully',
      data: keyStatistics,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('Key Statistics API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const keyStatistics = await KeyStatistics.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: keyStatistics,
    });
  } catch (error) {
    console.error('Key Statistics GET Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
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
        message: 'Key Statistics ID is required',
      }, { status: 400 });
    }
    const keyStatistics = await KeyStatistics.findByIdAndDelete(id);
    if (!keyStatistics) {
      return NextResponse.json({
        success: false,
        message: 'Key Statistics entry not found',
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Key Statistics deleted successfully',
    });
  } catch (error) {
    console.error('Key Statistics DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}