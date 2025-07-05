import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TopBanner from '@/models/Pages/ProdTopBanner';
import slugify from '@/lib/slugify';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // ✅ use admin-provided slug if present, else generate from pageTitle
    // const slug = slugify(body.slug || body.pageTitle || '');
    let slug = null;
    if (body.isGlobal) {
      // explicitly set global banner
      slug = null;
    } else {
      const cleanSlug = body.slug?.trim();
      slug = cleanSlug ? slugify(cleanSlug) : slugify(body.pageTitle || '');
    }

    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === 'string'
        ? body.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

    let topBanner;
    if (body._id) {
      topBanner = await TopBanner.findByIdAndUpdate(
        body._id,
        {
          pageTitle: body.pageTitle,
          slug,
          bannerTitle: body.bannerTitle,
          bannerDescription: body.bannerDescription,
          tags,
        },
        { new: true, runValidators: true }
      );
    } else {
      topBanner = new TopBanner({
        pageTitle: body.pageTitle,
        slug,
        bannerTitle: body.bannerTitle,
        bannerDescription: body.bannerDescription,
        tags,
      });
      await topBanner.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Top banner updated successfully' : 'Top banner created successfully',
      data: topBanner,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Top Banner API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
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
      // frontend page wants specific banner or global fallback
      data = await TopBanner.findOne({
        $or: [
          { slug: slugParam },
          { slug: null }
        ]
      }).sort({ slug: -1 }); // prefer specific over global
      if (!data) {
        return NextResponse.json({ success: false, message: 'No banner found' }, { status: 404 });
      }
    } else {
      // admin CMS wants list of all banners
      data = await TopBanner.find().sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Top Banner GET Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
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
    await TopBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Top banner deleted successfully' });
  } catch (error) {
    console.error('Top Banner DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}