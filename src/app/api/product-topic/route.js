import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductTopic from '@/models/Topic/ProductTopic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let topic;
    if (body._id) {
      topic = await ProductTopic.findByIdAndUpdate(
        body._id,
        { productTopicName: body.productTopicName, generalComment: body.generalComment },
        { new: true }
      );
    } else {
      topic = new ProductTopic({
        productTopicName: body.productTopicName,
        generalComment: body.generalComment,
      });
      await topic.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Product topic updated successfully' : 'Product topic created successfully',
      data: topic,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Product Topic API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const categories = await ProductTopic.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Product Topic GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Product Topic ID is required' }, { status: 400 });
    }
    await ProductTopic.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product topic deleted successfully' });
  } catch (error) {
    console.error('Product Topic DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}