import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WhyPayNXT360 from '@/models/Pages/WhyPayNXT360';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const heading = formData.get('heading');
    const _id = formData.get('_id');
    const subSections = {
      subSection1: JSON.parse(formData.get('subSection1') || '{}'),
      subSection2: JSON.parse(formData.get('subSection2') || '{}'),
      subSection3: JSON.parse(formData.get('subSection3') || '{}'),
      subSection4: JSON.parse(formData.get('subSection4') || '{}'),
    };

    console.log('Received FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    if (!heading) {
      throw new Error('Heading is required');
    }
    for (let i = 1; i <= 4; i++) {
      const subSection = subSections[`subSection${i}`];
      if (!subSection.title || !subSection.description) {
        throw new Error(`Title and description are required for subSection${i}`);
      }
    }

    for (let i = 1; i <= 4; i++) {
      const subSectionKey = `subSection${i}`;
      const subSection = subSections[subSectionKey];
      let imageUrl = subSection.image;

      console.log(`${subSectionKey} - Initial image value:`, imageUrl);

      const imageFile = formData.get(`${subSectionKey}.image`);
      console.log(`${subSectionKey} - Image file present:`, !!imageFile);

      if (imageFile) {
        const pinataForm = new FormData();
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        pinataForm.append('file', fileBuffer, imageFile.name || `why-pay-nxt360-subsection${i}-image-${Date.now()}`);

        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
          body: pinataForm,
        });

        const pinataResult = await pinataResponse.json();
        if (!pinataResponse.ok) {
          throw new Error(`Pinata upload failed for ${subSectionKey}: ${pinataResult.error || 'Unknown error'}`);
        }

        imageUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
        console.log(`${subSectionKey} - Uploaded to Pinata, new imageUrl:`, imageUrl);
      }

      if (!imageUrl && !_id) {
        throw new Error(`Image is required for ${subSectionKey}`);
      }

      subSections[subSectionKey].image = imageUrl;
    }

    let whyPayNXT360;
    if (_id) {
      whyPayNXT360 = await WhyPayNXT360.findByIdAndUpdate(
        _id,
        {
          heading: heading.trim(),
          subSection1: {
            title: subSections.subSection1.title.trim(),
            description: subSections.subSection1.description.trim(),
            image: subSections.subSection1.image || undefined,
          },
          subSection2: {
            title: subSections.subSection2.title.trim(),
            description: subSections.subSection2.description.trim(),
            image: subSections.subSection2.image || undefined,
          },
          subSection3: {
            title: subSections.subSection3.title.trim(),
            description: subSections.subSection3.description.trim(),
            image: subSections.subSection3.image || undefined,
          },
          subSection4: {
            title: subSections.subSection4.title.trim(),
            description: subSections.subSection4.description.trim(),
            image: subSections.subSection4.image || undefined,
          },
        },
        { new: true }
      );
      if (!whyPayNXT360) {
        throw new Error('WhyPayNXT360 entry not found');
      }
    } else {
      whyPayNXT360 = new WhyPayNXT360({
        heading: heading.trim(),
        subSection1: {
          title: subSections.subSection1.title.trim(),
          description: subSections.subSection1.description.trim(),
          image: subSections.subSection1.image,
        },
        subSection2: {
          title: subSections.subSection2.title.trim(),
          description: subSections.subSection2.description.trim(),
          image: subSections.subSection2.image,
        },
        subSection3: {
          title: subSections.subSection3.title.trim(),
          description: subSections.subSection3.description.trim(),
          image: subSections.subSection3.image,
        },
        subSection4: {
          title: subSections.subSection4.title.trim(),
          description: subSections.subSection4.description.trim(),
          image: subSections.subSection4.image,
        },
      });
      await whyPayNXT360.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'WhyPayNXT360 updated successfully' : 'WhyPayNXT360 created successfully',
      data: whyPayNXT360,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('WhyPayNXT360 API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const whyPayNXT360Entries = await WhyPayNXT360.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: whyPayNXT360Entries,
    });
  } catch (error) {
    console.error('WhyPayNXT360 GET Error:', error);
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
        message: 'WhyPayNXT360 ID is required',
      }, { status: 400 });
    }
    const whyPayNXT360 = await WhyPayNXT360.findByIdAndDelete(id);
    if (!whyPayNXT360) {
      return NextResponse.json({
        success: false,
        message: 'WhyPayNXT360 entry not found',
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'WhyPayNXT360 deleted successfully',
    });
  } catch (error) {
    console.error('WhyPayNXT360 DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}