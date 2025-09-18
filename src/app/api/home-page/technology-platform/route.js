import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TechnologyPlatform from '@/models/home-page/TechnologyPlatform';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get('title');
    const _id = formData.get('_id');
    // Processing FormData entries

    let imageUrl = formData.get('imageUrl'); 
    const imageFile = formData.get('image');

    // Processing image data 

    if (imageFile) {
      const pinataForm = new FormData();
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      pinataForm.append('file', fileBuffer, imageFile.name || `tech-platform-image-${Date.now()}`);

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

    if (!imageUrl && !_id) {
      throw new Error('Image is required for new Technology Platform entry');
    }

    let technologyPlatform;
    if (_id) {
      technologyPlatform = await TechnologyPlatform.findByIdAndUpdate(
        _id,
        {
          title,
          image: imageUrl || undefined,
        },
        { new: true }
      );
    } else {
      technologyPlatform = new TechnologyPlatform({
        title,
        image: imageUrl,
      });
      await technologyPlatform.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Technology Platform updated successfully' : 'Technology Platform created successfully',
      data: technologyPlatform,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('Technology Platform API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const technologyPlatforms = await TechnologyPlatform.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: technologyPlatforms,
    });
  } catch (error) {
    console.error('Technology Platform GET Error:', error);
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
      return NextResponse.json({
        success: false,
        message: 'Technology Platform ID is required',
      }, { status: 400 });
    }
    await TechnologyPlatform.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Technology Platform deleted successfully',
    });
  } catch (error) {
    console.error('Technology Platform DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}