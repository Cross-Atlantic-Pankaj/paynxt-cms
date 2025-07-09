import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Del from '@/models/reports/repdel';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req) {
    try {
        await connectDB();

        const formData = await req.formData();

        const title = formData.get('title');
        const _id = formData.get('_id');
        const sections = JSON.parse(formData.get('sections') || '[]');

        console.log('Received FormData entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        if (!Array.isArray(sections) || sections.length === 0) {
            throw new Error('At least one section is required');
        }

        console.log('Parsed sections:', sections);

        const updatedSections = [];
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            let imageUrl = section.image;
            let chartUrl = section.chart;

            console.log(`Section ${i} - Initial image:`, imageUrl);
            console.log(`Section ${i} - Initial chart:`, chartUrl);

            // get files
            const imageFile = formData.get(`sections[${i}].image`);
            const chartFile = formData.get(`sections[${i}].chart`);

            console.log(`Section ${i} - Image file present:`, !!imageFile);
            console.log(`Section ${i} - Chart file present:`, !!chartFile);

            // upload image if new file uploaded
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
                    throw new Error(`Pinata image upload failed: ${pinataResult.error || 'Unknown error'}`);
                }
                imageUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
                console.log(`Section ${i} - Uploaded new imageUrl:`, imageUrl);
            }

            // upload chart if new file uploaded
            if (chartFile) {
                const pinataForm = new FormData();
                const fileBuffer = Buffer.from(await chartFile.arrayBuffer());
                pinataForm.append('file', fileBuffer, chartFile.name || `strength-chart-${Date.now()}`);

                const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.PINATA_JWT}`,
                    },
                    body: pinataForm,
                });
                const pinataResult = await pinataResponse.json();
                if (!pinataResponse.ok) {
                    throw new Error(`Pinata chart upload failed: ${pinataResult.error || 'Unknown error'}`);
                }
                chartUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
                console.log(`Section ${i} - Uploaded new chartUrl:`, chartUrl);
            }

            // validations
            if (!imageUrl) {
                throw new Error(`Image for section ${i} is required`);
            }
            if (!chartUrl) {
                throw new Error(`Chart for section ${i} is required`);
            }

            // add to updatedSections
            updatedSections.push({
                image: imageUrl,
                chart: chartUrl,
                imageTitle: section.imageTitle,
                description: section.description,
            });
        }

        let ourStrength;
        if (_id) {
            ourStrength = await Del.findByIdAndUpdate(
                _id,
                {
                    title,
                    sections: updatedSections,
                },
                { new: true }
            );
        } else {
            ourStrength = new Del({
                title,
                sections: updatedSections,
            });
            await ourStrength.save();
        }

        return NextResponse.json({
            success: true,
            message: _id ? 'Strength updated successfully' : 'Strength created successfully',
            data: ourStrength,
        }, { status: _id ? 200 : 201 });
    } catch (error) {
        console.error('Strength API Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error',
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const ourStrengths = await Del.find().sort({ createdAt: -1 });
        return NextResponse.json({
            success: true,
            data: ourStrengths,
        });
    } catch (error) {
        console.error('Strength GET Error:', error);
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
                message: 'Strength ID is required',
            }, { status: 400 });
        }
        await Del.findByIdAndDelete(id);
        return NextResponse.json({
            success: true,
            message: 'Strength deleted successfully',
        });
    } catch (error) {
        console.error('Strength DELETE Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error',
        }, { status: 500 });
    }
}