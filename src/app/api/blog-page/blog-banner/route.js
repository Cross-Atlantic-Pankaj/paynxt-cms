import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BlogBanner from '@/models/blog-page/blogbanner';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === 'string'
        ? body.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

    let blogBanner;
    if (body._id) {
      blogBanner = await BlogBanner.findByIdAndUpdate(
        body._id,
        {
          bannerTitle: body.bannerTitle,
          bannerDescription: body.bannerDescription,
          tags,
        },
        { new: true }
      );
    } else {
      blogBanner = new BlogBanner({
        bannerTitle: body.bannerTitle,
        bannerDescription: body.bannerDescription,
        tags,
      });
      await blogBanner.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Top banner updated successfully' : 'Top banner created successfully',
      data: blogBanner,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Top Banner API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const topBanners = await BlogBanner.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: topBanners,
    });
  } catch (error) {
    console.error('Top Banner GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Top Banner ID is required' }, { status: 400 });
    }
    await BlogBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Top banner deleted successfully' });
  } catch (error) {
    console.error('Top Banner DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}