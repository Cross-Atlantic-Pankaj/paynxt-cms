import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/blog-page/blogcontent';
import TileTemplate from '@/models/TileTemplate';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const _id = formData.get('_id');
    const slug = formData.get('slug');
    const title = formData.get('title');
    const summary = formData.get('summary');
    const articlePart1 = formData.get('articlePart1');
    const articlePart2 = formData.get('articlePart2');
    const category = JSON.parse(formData.get('category') || '[]');
    const subcategory = JSON.parse(formData.get('subcategory') || '[]');
    const topic = JSON.parse(formData.get('topic') || '[]');
    const subtopic = JSON.parse(formData.get('subtopic') || '[]');
    const date = formData.get('date') ? new Date(formData.get('date')) : new Date();
    const advertisement = JSON.parse(formData.get('advertisement') || '{}');
    const is_featured = formData.get('is_featured') === 'true';
    const tileTemplateId = formData.get('tileTemplateId');

    // Processing blog data

    // Validate tileTemplateId
    if (!tileTemplateId) {
      return NextResponse.json(
        { success: false, message: 'Tile template is required' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(tileTemplateId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid tile template ID' },
        { status: 400 }
      );
    }

    // Verify tileTemplateId exists
    const tileTemplate = await TileTemplate.findById(tileTemplateId);
    if (!tileTemplate) {
      return NextResponse.json(
        { success: false, message: 'Tile template not found' },
        { status: 404 }
      );
    }

    let blog;

    if (_id) {
      // Update existing
      blog = await Blog.findByIdAndUpdate(
        _id,
        {
          title,
          slug,
          summary,
          articlePart1,
          articlePart2,
          category,
          subcategory,
          topic,
          subtopic,
          date,
          tileTemplateId,
          advertisement,
          is_featured,
        },
        { new: true }
      ).populate('tileTemplateId');
      if (!blog) {
        return NextResponse.json(
          { success: false, message: 'Blog not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new
      blog = new Blog({
        title,
        slug,
        summary,
        articlePart1,
        articlePart2,
        category,
        subcategory,
        topic,
        subtopic,
        date,
        tileTemplateId,
        advertisement,
        is_featured,
      });
      await blog.save();
      await blog.populate('tileTemplateId');
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Blog updated successfully' : 'Blog created successfully',
      data: blog,
    }, { status: _id ? 200 : 201 });
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
    const blogs = await Blog.find().populate('tileTemplateId').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: blogs });
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
