import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SectionThree from '@/models/Pages/SectionThree';
import slugify from '@/lib/slugify'; // for slug generation
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const pageTitle = formData.get('pageTitle');
    const isGlobal = formData.get('isGlobal') === 'true' || formData.get('isGlobal') === true; // careful: string
    const _id = formData.get('_id');

    console.log('FormData:', { title, description, pageTitle, isGlobal, _id });

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    // ✅ Generate slug: if isGlobal, slug=null else slugify(pageTitle)
    let slug = null;
    if (!isGlobal) {
      if (!pageTitle) throw new Error('Page title is required when not global');
      slug = slugify(pageTitle);
    }

    // Handle image
    let imageUrl = formData.get('imageUrl');
    const imageFile = formData.get('image');
    if (imageFile) {
      const pinataForm = new FormData();
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      pinataForm.append('file', fileBuffer, imageFile.name || `section-three-${Date.now()}`);

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
    }

    if (!imageUrl && !_id) {
      throw new Error('Image is required for new entry');
    }

    let sectionThree;
    if (_id) {
      sectionThree = await SectionThree.findByIdAndUpdate(
        _id,
        {
          title: title.trim(),
          description: description.trim(),
          image: imageUrl || undefined,
          slug
        },
        { new: true }
      );
      if (!sectionThree) throw new Error('Section Three entry not found');
    } else {
      sectionThree = new SectionThree({
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        slug
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

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slugParam = searchParams.get('slug');

    let data;
    if (slugParam) {
      // frontend: get entries for that slug or global ones (slug=null)
      data = await SectionThree.find({
        $or: [
          { slug: slugParam },
          { slug: null }
        ]
      }).sort({ slug: -1, createdAt: -1 });
    } else {
      // admin view: show all
      data = await SectionThree.find().sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data });
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
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }
    const deleted = await SectionThree.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Section Three entry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Section Three DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
