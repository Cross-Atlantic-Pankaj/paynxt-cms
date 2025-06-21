import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import relart from '@/models/blog-page/relarticles';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    let platformSection;

    const updateData = {
      title: body.title,
      description: body.description,
      clickText: body.clickText,
      subcategory: body.subcategory,
      slug: body.slug,
      date: body.date ? new Date(body.date) : undefined
    };

    if (body._id) {
      platformSection = await relart.findById(body._id);
      if (platformSection) {
        platformSection.set(updateData);
        await platformSection.save(); // ✅ triggers pre-save hook
      }
    } else {
      platformSection = new relart(updateData);
      await platformSection.save(); // ✅ triggers pre-save hook
    }


    return NextResponse.json({
      success: true,
      message: body._id
        ? 'Platform section updated successfully'
        : 'Platform section created successfully',
      data: platformSection
    }, { status: body._id ? 200 : 201 });

  } catch (error) {
    console.error('PlatformSection API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const platformSections = await relart.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: platformSections
    });
  } catch (error) {
    console.error('PlatformSection GET Error:', error);
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
        message: 'PlatformSection ID is required'
      }, { status: 400 });
    }
    await relart.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Platform section deleted successfully'
    });
  } catch (error) {
    console.error('PlatformSection DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
