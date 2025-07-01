import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import repType from '@/models/repmaster/reptype';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let category;
    if (body._id) {
      category = await repType.findByIdAndUpdate(
        body._id,
        { repTypeName: body.repTypeName, generalComment: body.generalComment },
        { new: true }
      );
    } else {
      category = new repType({
        repTypeName: body.repTypeName,
        generalComment: body.generalComment,
      });
      await category.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Product category updated successfully' : 'Product category created successfully',
      data: category,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Product Category API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const categories = await repType.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Product Category GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Product Category ID is required' }, { status: 400 });
    }
    await repType.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product category deleted successfully' });
  } catch (error) {
    console.error('Product Category DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}