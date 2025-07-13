import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PartnerLogo from '@/models/home-page/PartnerLogo';
import FormData from 'form-data';
import fetch from 'node-fetch';

// GET all partner logos
export async function GET() {
    try {
        await connectDB();
        const logos = await PartnerLogo.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: logos });
    } catch (error) {
        console.error('PartnerLogo GET error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST create new partner logo
// route.js
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const altText = formData.get('altText') || '';

    const imageFile = formData.get('image');  // uploaded file

    if (!imageFile || typeof imageFile !== 'object') {
      return NextResponse.json({ success: false, message: 'Image file is required' }, { status: 400 });
    }

    // Upload to Pinata
    const pinataForm = new FormData();
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
    pinataForm.append('file', fileBuffer, imageFile.name || `partner-logo-${Date.now()}`);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      body: pinataForm,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Pinata upload failed: ${data.error || 'Unknown error'}`);
    }

    const imageUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;

    // ✅ Now create in DB
    const newLogo = new PartnerLogo({ imageUrl, altText });
    await newLogo.save();

    return NextResponse.json({ success: true, message: 'Partner logo created', data: newLogo }, { status: 201 });
  } catch (error) {
    console.error('PartnerLogo POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE logo by id (pass ?id=xxxx)
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Logo ID is required' }, { status: 400 });
        }

        await PartnerLogo.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Partner logo deleted' });
    } catch (error) {
        console.error('PartnerLogo DELETE error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const id = formData.get('_id'); // logo _id from MongoDB
    const altText = formData.get('altText') || '';
    const imageFile = formData.get('image'); // may be empty if user doesn't want to change

    if (!id) {
      return NextResponse.json({ success: false, message: 'Logo ID (_id) is required' }, { status: 400 });
    }

    let updateData = { altText };

    if (imageFile && typeof imageFile === 'object') {
      // upload new image to Pinata
      const pinataForm = new FormData();
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      pinataForm.append('file', fileBuffer, imageFile.name || `partner-logo-${Date.now()}`);

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
        body: pinataForm,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Pinata upload failed: ${data.error || 'Unknown error'}`);
      }

      updateData.imageUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    }

    const updatedLogo = await PartnerLogo.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLogo) {
      return NextResponse.json({ success: false, message: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Logo updated successfully', data: updatedLogo });
  } catch (error) {
    console.error('PartnerLogo PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
