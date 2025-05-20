import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SectionThree from '@/models/Pages/SectionThree';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const _id = formData.get('_id');

    console.log('Received FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    let imageUrl = formData.get('imageUrl');
    const imageFile = formData.get('image');

    console.log('Initial imageUrl value:', imageUrl); 
    console.log('Image file present:', !!imageFile); 

    if (imageFile) {
      const pinataForm = new FormData();
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      pinataForm.append('file', fileBuffer, imageFile.name || `section-three-image-${Date.now()}`);

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
      console.log('Uploaded to Pinata, new imageUrl:', imageUrl); // Debug log
    }

    if (!imageUrl && !_id) {
      throw new Error('Image is required for new Section Three entry');
    }

    let sectionThree;
    if (_id) {
      sectionThree = await SectionThree.findByIdAndUpdate(
        _id,
        {
          title: title.trim(),
          description: description.trim(),
          image: imageUrl || undefined,
        },
        { new: true }
      );
      if (!sectionThree) {
        throw new Error('Section Three entry not found');
      }
    } else {
      sectionThree = new SectionThree({
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
      });
      await sectionThree.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Section Three updated successfully' : 'Section Three created successfully',
      data: sectionThree,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('Section Three API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const sectionThreeEntries = await SectionThree.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: sectionThreeEntries,
    });
  } catch (error) {
    console.error('Section Three GET Error:', error);
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
        message: 'Section Three ID is required',
      }, { status: 400 });
    }
    const sectionThree = await SectionThree.findByIdAndDelete(id);
    if (!sectionThree) {
      return NextResponse.json({
        success: false,
        message: 'Section Three entry not found',
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Section Three deleted successfully',
    });
  } catch (error) {
    console.error('Section Three DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}