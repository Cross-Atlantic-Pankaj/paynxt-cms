import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TopBanner from '@/models/home-page/TopBanner';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const bannerHeading = formData.get('bannerHeading');
    const _id = formData.get('_id');
    const tagsField = formData.get('tags');  // could be JSON, or CSV string

    // Parse tags
    let tags = [];
    try {
      tags = JSON.parse(tagsField);
      if (!Array.isArray(tags)) tags = [];
    } catch (e) {
      tags = typeof tagsField === 'string'
        ? tagsField.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
    }

    // Processing FormData fields

    // Handle image upload
    let imageUrl = formData.get('existingImage');  // optional hidden input on client
    const imageFile = formData.get('image');       // actual uploaded file

    if (imageFile && typeof imageFile === 'object') {
      const pinataForm = new FormData();
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      pinataForm.append('file', fileBuffer, imageFile.name || `top-banner-${Date.now()}`);

      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataForm,
      });

      const pinataResult = await pinataResponse.json();
      if (!pinataResponse.ok) {
        throw new Error(`Pinata upload failed: ${pinataResult.error || 'Unknown error'}`);
      }
      imageUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
      // Image uploaded successfully
    }

    if (!imageUrl) {
      throw new Error('Image is required');
    }

    let topBanner;
    if (_id) {
      topBanner = await TopBanner.findByIdAndUpdate(
        _id,
        { bannerHeading, tags, image: imageUrl },
        { new: true }
      );
    } else {
      topBanner = new TopBanner({ bannerHeading, tags, image: imageUrl });
      await topBanner.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Top banner updated successfully' : 'Top banner created successfully',
      data: topBanner
    }, { status: _id ? 200 : 201 });

  } catch (error) {
    console.error('Top Banner POST API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const topBanners = await TopBanner.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: topBanners
    });
  } catch (error) {
    console.error('Top Banner GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Top Banner ID is required' }, { status: 400 });
    }
    await TopBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Top banner deleted successfully' });
  } catch (error) {
    console.error('Top Banner DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}