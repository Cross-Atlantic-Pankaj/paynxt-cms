import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blogs from '@/models/View-point/Blogs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const mainTitle = formData.get('mainTitle');
    const _id = formData.get('_id');
    const blogs = JSON.parse(formData.get('blogs') || '[]');

    console.log('Received FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    if (!Array.isArray(blogs) || blogs.length === 0) {
      throw new Error('At least one blog is required');
    }

    console.log('Parsed blogs:', blogs);

    const updatedBlogs = [];
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      let imageIconurl = blog.imageIconurl;

      console.log(`Blog ${i} - Initial imageIconurl value:`, imageIconurl); 

      const imageFile = formData.get(`blogs[${i}].imageIconurl`);
      console.log(`Blog ${i} - Image file present:`, !!imageFile);

      if (imageFile) {
        const pinataForm = new FormData();
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        pinataForm.append('file', fileBuffer, imageFile.name || `blog-image-${Date.now()}`);

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

        imageIconurl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
        console.log(`Blog ${i} - Uploaded to Pinata, new imageIconurl:`, imageIconurl);
      }

      if (!imageIconurl) {
        throw new Error(`Image for blog ${i} is required`);
      }

      updatedBlogs.push({
        imageIconurl,
        category: blog.category,
        blogName: blog.blogName,
        description: blog.description,
      });
    }

    let blogsEntry;
    if (_id) {
      blogsEntry = await Blogs.findByIdAndUpdate(
        _id,
        { mainTitle, blogs: updatedBlogs },
        { new: true }
      );
    } else {
      blogsEntry = new Blogs({
        mainTitle,
        blogs: updatedBlogs,
      });
      await blogsEntry.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Blogs updated successfully' : 'Blogs created successfully',
      data: blogsEntry,
    }, { status: _id ? 200 : 201 });

  } catch (error) {
    console.error('Blogs API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const blogsEntries = await Blogs.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: blogsEntries,
    });
  } catch (error) {
    console.error('Blogs GET Error:', error);
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
        message: 'Blog ID is required',
      }, { status: 400 });
    }

    await Blogs.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Blogs DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
