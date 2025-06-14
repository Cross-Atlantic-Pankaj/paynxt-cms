import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BlogSlider from '@/models/blog-page/blogslider';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    let slider;
    if (body._id) {
      slider = await BlogSlider.findByIdAndUpdate(
        body._id,
        {
          typeText: body.typeText,
          title: body.title,
          shortDescription: body.shortDescription,
          url: body.url,
          order: body.order || 0
        },
        { new: true }
      );
    } else {
      slider = new BlogSlider({
        typeText: body.typeText,
        title: body.title,
        shortDescription: body.shortDescription,
        url: body.url,
        order: body.order || 0
      });
      await slider.save();
    }
    return NextResponse.json({
      success: true,
      message: body._id ? 'BlogSlider item updated successfully' : 'Slider item created successfully',
      data: slider
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Slider API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const sliders = await BlogSlider.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: sliders
    });
  } catch (error) {
    console.error('Slider GET Error:', error);
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
        message: 'Slider ID is required'
      }, { status: 400 });
    }
    await BlogSlider.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Slider item deleted successfully'
    });
  } catch (error) {
    console.error('Slider DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
} 