import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ResearchInsight from '@/models/home-page/ResearchInsightSchema';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const sectionType = formData.get('sectionType');
    const title = formData.get('title');
    const date = formData.get('date');
    const url = formData.get('url');   // ✅ NEW: get url from form data
    const _id = formData.get('_id');

    // Processing FormData entries

    if (!['Featured Research', 'Insights'].includes(sectionType)) {
      throw new Error('Invalid section type');
    }

    let parsedDate;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        throw new Error('Invalid date format');
      }
    }

    let imageUrl = formData.get('imageUrl'); 
    const imageFile = formData.get('imageurl');

    // Processing image data 

    if (imageFile) {
      const pinataForm = new FormData();
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      pinataForm.append('file', fileBuffer, imageFile.name || `research-insight-image-${Date.now()}`);

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

    if ((!imageUrl || !url) && !_id) {
      throw new Error('Image and URL are required for new Research Insight entry');
    }

    let researchInsight;
    if (_id) {
      researchInsight = await ResearchInsight.findByIdAndUpdate(
        _id,
        {
          sectionType,
          content: {
            imageurl: imageUrl || undefined,
            title,
            date: parsedDate || undefined,
            url: url || undefined,     // ✅ NEW: add url
          },
          updatedAt: Date.now(),
        },
        { new: true }
      );
    } else {
      researchInsight = new ResearchInsight({
        sectionType,
        content: {
          imageurl: imageUrl,
          title,
          date: parsedDate || undefined,
          url                // ✅ NEW: add url
        },
      });
      await researchInsight.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Research Insight updated successfully' : 'Research Insight created successfully',
      data: researchInsight,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('Research Insight API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const researchInsights = await ResearchInsight.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: researchInsights,
    });
  } catch (error) {
    console.error('Research Insight GET Error:', error);
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
        message: 'Research Insight ID is required',
      }, { status: 400 });
    }
    await ResearchInsight.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Research Insight deleted successfully',
    });
  } catch (error) {
    console.error('Research Insight DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
