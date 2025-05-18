import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductCategory from '@/models/Category/ProductCategory';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let category;
    if (body._id) {
      category = await ProductCategory.findByIdAndUpdate(
        body._id,
        { productCategoryName: body.productCategoryName, generalComment: body.generalComment },
        { new: true }
      );
    } else {
      category = new ProductCategory({
        productCategoryName: body.productCategoryName,
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
    const categories = await ProductCategory.find().sort({ createdAt: -1 });
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
    await ProductCategory.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product category deleted successfully' });
  } catch (error) {
    console.error('Product Category DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}