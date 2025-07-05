import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Slider from '@/models/Pages/ProdSlider';
import slugify from '@/lib/slugify';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let slug = null;
    if (!body.isGlobal) {
      const cleanSlug = body.slug?.trim();
      if (cleanSlug) {
        slug = slugify(cleanSlug);
      } else if (body.pageTitle) {
        slug = slugify(body.pageTitle);         // ✅ use pageTitle from banner
      } else if (body.title) {
        slug = slugify(body.title);
      }
    }
    // else: isGlobal is true → keep slug as null

    let slider;
    if (body._id) {
      slider = await Slider.findByIdAndUpdate(
        body._id,
        {
          typeText: body.typeText,
          title: body.title,
          pageTitle: body.pageTitle || null,          // ✅ store chosen banner title
          slug,
          shortDescription: body.shortDescription,
          url: body.url,
          order: body.order || 0
        },
        { new: true }
      );
    } else {
      slider = new Slider({
        typeText: body.typeText,
        title: body.title,
        pageTitle: body.pageTitle || null,          // ✅ store chosen banner title
        slug,
        shortDescription: body.shortDescription,
        url: body.url,
        order: body.order || 0
      });
      await slider.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Slider item updated successfully' : 'Slider item created successfully',
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

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slugParam = searchParams.get('slug');

    let data;
    if (slugParam) {
      // Frontend: get sliders for this slug, or fallback to global
      data = await Slider.find({
        $or: [
          { slug: slugParam },
          { slug: null }
        ]
      }).sort({ slug: -1, order: 1, createdAt: -1 }); // prefer specific slug over global
    } else {
      // Admin CMS: get all sliders
      data = await Slider.find().sort({ order: 1, createdAt: -1 });
    }

    return NextResponse.json({ success: true, data });
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
    await Slider.findByIdAndDelete(id);
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
