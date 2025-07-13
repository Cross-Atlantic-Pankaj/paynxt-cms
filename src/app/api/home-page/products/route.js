import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Products from '@/models/home-page/Products';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const mainTitle = formData.get('mainTitle');
    const _id = formData.get('_id');
    const products = JSON.parse(formData.get('products') || '[]');

    console.log('Received FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('At least one product is required');
    }

    console.log('Parsed products:', products);

    const updatedProducts = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      let imageIconurl = product.imageIconurl;

      console.log(`Product ${i} - Initial imageIconurl value:`, imageIconurl);

      const imageFile = formData.get(`products[${i}].imageIconurl`);
      console.log(`Product ${i} - Image file present:`, !!imageFile);

      if (imageFile) {
        const pinataForm = new FormData();
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        pinataForm.append('file', fileBuffer, imageFile.name || `product-image-${Date.now()}`);

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
        console.log(`Product ${i} - Uploaded to Pinata, new imageIconurl:`, imageIconurl);
      }

      if (!imageIconurl) {
        throw new Error(`Image for product ${i} is required`);
      }

      updatedProducts.push({
        imageIconurl,
        productName: product.productName,
        description: product.description,
        url: product.url,  // ✅ add url
      });
    }

    let productsEntry;
    if (_id) {
      productsEntry = await Products.findByIdAndUpdate(
        _id,
        {
          mainTitle,
          products: updatedProducts,
        },
        { new: true }
      );
    } else {
      productsEntry = new Products({
        mainTitle,
        products: updatedProducts,
      });
      await productsEntry.save();
    }

    return NextResponse.json({
      success: true,
      message: _id ? 'Products updated successfully' : 'Products created successfully',
      data: productsEntry,
    }, { status: _id ? 200 : 201 });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const productsEntries = await Products.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: productsEntries,
    });
  } catch (error) {
    console.error('Products GET Error:', error);
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
        message: 'Products ID is required',
      }, { status: 400 });
    }
    await Products.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Products deleted successfully',
    });
  } catch (error) {
    console.error('Products DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error',
    }, { status: 500 });
  }
}