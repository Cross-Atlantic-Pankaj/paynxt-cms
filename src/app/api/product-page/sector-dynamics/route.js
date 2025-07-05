import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SectorDynamics from '@/models/Pages/SectorDynamics';
import slugify from '@/lib/slugify';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.text) throw new Error('Text is required');

    const isGlobal = body.isGlobal === true;  // make sure it's boolean
    const pageTitle = body.pageTitle || null;
    const slug = isGlobal ? null : slugify(pageTitle || '', { lower: true, strict: true });

    let sectorDynamics;
    if (body._id) {
      sectorDynamics = await SectorDynamics.findByIdAndUpdate(
        body._id,
        {
          text: body.text.trim(),
          isGlobal,
          pageTitle,
          slug
        },
        { new: true }
      );
    } else {
      sectorDynamics = new SectorDynamics({
        text: body.text.trim(),
        isGlobal,
        pageTitle,
        slug
      });
      await sectorDynamics.save();
    }

    return NextResponse.json({
      success: true,
      message: body._id ? 'Sector dynamics updated successfully' : 'Sector dynamics created successfully',
      data: sectorDynamics,
    }, { status: body._id ? 200 : 201 });
  } catch (error) {
    console.error('Sector Dynamics API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const sectorDynamics = await SectorDynamics.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: sectorDynamics,
    });
  } catch (error) {
    console.error('Sector Dynamics GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Sector Dynamics ID is required' }, { status: 400 });
    }
    await SectorDynamics.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Sector dynamics deleted successfully' });
  } catch (error) {
    console.error('Sector Dynamics DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}