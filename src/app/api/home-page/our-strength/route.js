import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import OurStrength from '@/models/home-page/OurStrength';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get('title');
    const _id = formData.get('_id');
    const sections = JSON.parse(formData.get('sections') || '[]');

    // Processing FormData entries

    if (!Array.isArray(sections) || sections.length === 0) {
      throw new Error('At least one section is required');
    }

    // Processing sections data

    const updatedSections = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      let imageUrl = section.image;

      // Processing section image

      const imageFile = formData.get(`sections[${i}].image`);
      // Checking for image file

      if (imageFile) {
        const pinataForm = new FormData();
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        pinataForm.append('file', fileBuffer, imageFile.name || `strength-image-${Date.now()}`);

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
        throw new Error(`Image for section ${i} is required`);
      }

      updatedSections.push({
        image: imageUrl,
        imageTitle: section.imageTitle,
        description: section.description,
      });
    }

    let ourStrength;
    if (_id) {
      ourStrength = await OurStrength.findByIdAndUpdate(
        _id,
        {
          title,
          sections: updatedSections,
        },
        { new: true }
      );
    } else {
      ourStrength = new OurStrength({
        title,
        sections: updatedSections,
      });
      await ourStrength.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'OurStrength updated successfully' : 'OurStrength created successfully',
      data: ourStrength,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('OurStrength API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const ourStrengths = await OurStrength.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: ourStrengths,
    });
  } catch (error) {
    console.error('OurStrength GET Error:', error);
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
        message: 'OurStrength ID is required',
      }, { status: 400 });
    }
    await OurStrength.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'OurStrength deleted successfully',
    });
  } catch (error) {
    console.error('OurStrength DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}