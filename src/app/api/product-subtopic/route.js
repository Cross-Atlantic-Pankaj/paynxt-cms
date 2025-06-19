import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductSubTopic from '@/models/Topic/ProductSubTopic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let subTopic;
    if (body._id) {
      subTopic = await ProductSubTopic.findByIdAndUpdate(
        body._id,
        {
          subProductName: body.subProductName,
          productTopicId: body.productTopicId,
          generalComment: body.generalComment,
        },
        { new: true }
      ).populate('productTopicId');
    } else {
      subTopic = new ProductSubTopic({
        subProductName: body.subProductName,
        productTopicId: body.productTopicId,
        generalComment: body.generalComment,
      });
      await subTopic.save();
      await subTopic.populate('productTopicId');
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Product subtopic updated successfully' : 'Product subtopic created successfully',
      data: subTopic,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Product Subtopic API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const subCategories = await ProductSubTopic.find()
      .populate('productTopicId')
      .sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    console.error('Product Subtopic GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Product Subtopic ID is required' }, { status: 400 });
    }
    await ProductSubTopic.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product subtopic deleted successfully' });
  } catch (error) {
    console.error('Product Subtopic DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}