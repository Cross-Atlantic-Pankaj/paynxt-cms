import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WhyPayNXT360 from '@/models/Pages/WhyPayNXT360';
import FormData from 'form-data';
import fetch from 'node-fetch';
import slugify from '@/lib/slugify';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const heading = formData.get('heading');
    const _id = formData.get('_id');

    // new fields:
    const isGlobal = formData.get('isGlobal') === 'true';
    const pageTitle = formData.get('pageTitle');
    const slug = isGlobal ? null : slugify(pageTitle || '', { lower: true, strict: true });
    // console.log({ isGlobal, pageTitle, slug });

    const subSections = {
      subSection1: JSON.parse(formData.get('subSection1') || '{}'),
      subSection2: JSON.parse(formData.get('subSection2') || '{}'),
      subSection3: JSON.parse(formData.get('subSection3') || '{}'),
      subSection4: JSON.parse(formData.get('subSection4') || '{}'),
    };

    if (!heading) {
      throw new Error('Heading is required');
    }

    for (let i = 1; i <= 4; i++) {
      const subSection = subSections[`subSection${i}`];
      if (!subSection.title || !subSection.description) {
        throw new Error(`Title and description are required for subSection${i}`);
      }
    }

    // handle images:
    for (let i = 1; i <= 4; i++) {
      const key = `subSection${i}`;
      let imageUrl = subSections[key].image;
      const imageFile = formData.get(`${key}.image`);

      if (imageFile) {
        const pinataForm = new FormData();
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        pinataForm.append('file', buffer, imageFile.name || `why-pay-nxt360-${key}-${Date.now()}`);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`
          },
          body: pinataForm
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to upload image for ${key}: ${result.error || 'Unknown error'}`);
        }

        imageUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      }

      if (!imageUrl && !_id) {
        throw new Error(`Image is required for ${key}`);
      }

      subSections[key].image = imageUrl;
    }

    let doc;
    if (_id) {
      doc = await WhyPayNXT360.findByIdAndUpdate(
        _id,
        {
          heading: heading.trim(),
          slug,
          pageTitle,
          subSection1: {
            title: subSections.subSection1.title.trim(),
            description: subSections.subSection1.description.trim(),
            image: subSections.subSection1.image
          },
          subSection2: {
            title: subSections.subSection2.title.trim(),
            description: subSections.subSection2.description.trim(),
            image: subSections.subSection2.image
          },
          subSection3: {
            title: subSections.subSection3.title.trim(),
            description: subSections.subSection3.description.trim(),
            image: subSections.subSection3.image
          },
          subSection4: {
            title: subSections.subSection4.title.trim(),
            description: subSections.subSection4.description.trim(),
            image: subSections.subSection4.image
          }
        },
        { new: true }
      );
      if (!doc) throw new Error('Entry not found');
    } else {
      doc = new WhyPayNXT360({
        heading: heading.trim(),
        slug,
        pageTitle,
        subSection1: {
          title: subSections.subSection1.title.trim(),
          description: subSections.subSection1.description.trim(),
          image: subSections.subSection1.image
        },
        subSection2: {
          title: subSections.subSection2.title.trim(),
          description: subSections.subSection2.description.trim(),
          image: subSections.subSection2.image
        },
        subSection3: {
          title: subSections.subSection3.title.trim(),
          description: subSections.subSection3.description.trim(),
          image: subSections.subSection3.image
        },
        subSection4: {
          title: subSections.subSection4.title.trim(),
          description: subSections.subSection4.description.trim(),
          image: subSections.subSection4.image
        }
      });
      await doc.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Updated successfully' : 'Created successfully',
      data: doc
    }, { status: _id ? 200 : 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const entries = await WhyPayNXT360.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const deleted = await WhyPayNXT360.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
