import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductSubCategory from '@/models/Category/ProductSubCategory';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let subCategory;
    if (body._id) {
      subCategory = await ProductSubCategory.findByIdAndUpdate(
        body._id,
        {
          subProductName: body.subProductName,
          productCategoryId: body.productCategoryId,
          generalComment: body.generalComment,
        },
        { new: true }
      ).populate('productCategoryId');
    } else {
      subCategory = new ProductSubCategory({
        subProductName: body.subProductName,
        productCategoryId: body.productCategoryId,
        generalComment: body.generalComment,
      });
      await subCategory.save();
      await subCategory.populate('productCategoryId');
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Product subcategory updated successfully' : 'Product subcategory created successfully',
      data: subCategory,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Product Subcategory API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const subCategories = await ProductSubCategory.find()
      .populate('productCategoryId')
      .sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    console.error('Product Subcategory GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Product Subcategory ID is required' }, { status: 400 });
    }
    await ProductSubCategory.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product subcategory deleted successfully' });
  } catch (error) {
    console.error('Product Subcategory DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}