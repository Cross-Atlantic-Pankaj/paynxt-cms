import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/blog-page/blogcontent';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let blog;
    if (body._id) {
      blog = await Blog.findByIdAndUpdate(
        body._id,
        {
          title: body.title,
          summary: body.summary,
          articlePart1: body.articlePart1,
          articlePart2: body.articlePart2,
          advertisement: {
            title: body.advertisement?.title,
            description: body.advertisement?.description,
            url: body.advertisement?.url,
          },
        },
        { new: true }
      );
    } else {
      blog = new Blog({
        title: body.title,
        summary: body.summary,
        articlePart1: body.articlePart1,
        articlePart2: body.articlePart2,
        advertisement: {
          title: body.advertisement?.title,
          description: body.advertisement?.description,
          url: body.advertisement?.url,
        },
      });
      await blog.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Blog updated successfully' : 'Blog created successfully',
      data: blog,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Blog POST Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error('Blog GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Blog ID is required' }, { status: 400 });
    }

    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Blog DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
