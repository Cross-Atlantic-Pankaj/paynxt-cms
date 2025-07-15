import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/blog-page/blogcontent';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const _id = formData.get('_id');
    const slug = formData.get('slug');
    const title = formData.get('title');
    const summary = formData.get('summary');
    const articlePart1 = formData.get('articlePart1');
    const articlePart2 = formData.get('articlePart2');
    const category = JSON.parse(formData.get('category') || '[]');
    const subcategory = JSON.parse(formData.get('subcategory') || '[]');
    const topic = JSON.parse(formData.get('topic') || '[]');
    const subtopic = JSON.parse(formData.get('subtopic') || '[]');
    const date = formData.get('date') ? new Date(formData.get('date')) : new Date();
    const advertisement = JSON.parse(formData.get('advertisement') || '{}');

    let imageIconurl = formData.get('imageIconurl');

    const imageFile = formData.get('imageFile');  // key in form should be imageFile

    console.log('_id:', _id, 'imageFile:', imageFile, 'imageIconurl:', imageIconurl);


    if (imageFile && typeof imageFile === 'object') {
      try {
        const pinataForm = new FormData();
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        pinataForm.append('file', fileBuffer, imageFile.name || `blog-image-${Date.now()}`);

        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
          body: pinataForm,
        });
        const pinataResult = await pinataResponse.json();

        console.log('Pinata response:', pinataResult);

        if (!pinataResponse.ok) {
          throw new Error(`Pinata upload failed: ${pinataResult.error || 'Unknown error'}`);
        }

        imageIconurl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
      } catch (uploadError) {
        console.error('Pinata upload failed:', uploadError);
        throw new Error('Image upload failed');
      }
    }

    if (!_id) {
      // creating new blog → must have uploaded image
      if (!imageFile || typeof imageFile !== 'object') {
        throw new Error('Image is required');
      }
    } else {
      // editing existing → must have either new uploaded image or existing url
      if (!imageFile && (!imageIconurl || imageIconurl === 'null')) {
        throw new Error('Image is required');
      }
    }


    let blog;

    if (_id) {
      // Update existing
      blog = await Blog.findByIdAndUpdate(
        _id,
        {
          title,
          slug,
          summary,
          articlePart1,
          articlePart2,
          category,
          subcategory,
          topic,
          subtopic,
          date,
          imageIconurl,
          advertisement,
        },
        { new: true }
      );
    } else {
      // Create new
      blog = new Blog({
        title,
        slug,
        summary,
        articlePart1,
        articlePart2,
        category,
        subcategory,
        topic,
        subtopic,
        date,
        imageIconurl,
        advertisement,
      });
      await blog.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Blog updated successfully' : 'Blog created successfully',
      data: blog,
    }, { status: _id ? 200 : 201 });

  } catch (error) {
    console.error('Blog POST Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error('Blog GET Error:', error);
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
      return NextResponse.json({ success: false, message: 'Blog ID is required' }, { status: 400 });
    }
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Blog DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
