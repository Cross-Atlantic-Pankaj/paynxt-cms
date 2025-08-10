import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TileTemplate from '@/models/TileTemplate';

export async function GET() {
    try {
        await connectDB();
        const templates = await TileTemplate.find().sort({ createdAt: -1 });
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching tile templates:', error);
        return NextResponse.json({ error: 'Failed to fetch tile templates' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const template = new TileTemplate(body);
        await template.save();
        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Error creating tile template:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Template name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create tile template' }, { status: 500 });
    }
}