import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import KeyStatistics from '@/models/Pages/KeyStatistics';
import slugify from '@/lib/slugify';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // console.log('Received body:', body);

    const { title, description, _id, isGlobal, slug: customSlug } = body;

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    // ✅ generate slug unless marked global
    let slug = null;
    if (!isGlobal) {
      const cleanSlug = customSlug?.trim();
      slug = cleanSlug ? slugify(cleanSlug) : slugify(body.pageTitle || '');
    }

    let keyStatistics;
    if (_id) {
      keyStatistics = await KeyStatistics.findByIdAndUpdate(
        _id,
        { title: title.trim(), description: description.trim(), slug },
        { new: true }
      );
      if (!keyStatistics) throw new Error('Key Statistics entry not found');
    } else {
      keyStatistics = new KeyStatistics({
        title: title.trim(),
        description: description.trim(),
        slug
      });
      await keyStatistics.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Key Statistics updated successfully' : 'Key Statistics created successfully',
      data: keyStatistics
    }, { status: _id ? 200 : 201 });

  } catch (error) {
    console.error('Key Statistics API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slugParam = searchParams.get('slug');

    let data;
    if (slugParam) {
      // frontend: try specific slug first, fallback to global
      data = await KeyStatistics.find({
        $or: [
          { slug: slugParam },
          { slug: null }
        ]
      }).sort({ slug: -1, createdAt: -1 });
    } else {
      // admin CMS: list all
      data = await KeyStatistics.find().sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Key Statistics GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Key Statistics ID is required' }, { status: 400 });
    }
    const deleted = await KeyStatistics.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Key Statistics entry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Key Statistics deleted successfully' });
  } catch (error) {
    console.error('Key Statistics DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
