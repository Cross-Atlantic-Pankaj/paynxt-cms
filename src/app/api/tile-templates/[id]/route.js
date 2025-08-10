import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TileTemplate from '@/models/TileTemplate';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const template = await TileTemplate.findById(params.id);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json(template);
    } catch (error) {
        console.error('Error fetching tile template:', error);
        return NextResponse.json({ error: 'Failed to fetch tile template' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const body = await request.json();
        const template = await TileTemplate.findByIdAndUpdate(params.id, body, { new: true });
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json(template);
    } catch (error) {
        console.error('Error updating tile template:', error);
        return NextResponse.json({ error: 'Failed to update tile template' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const template = await TileTemplate.findByIdAndDelete(params.id);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting tile template:', error);
        return NextResponse.json({ error: 'Failed to delete tile template' }, { status: 500 });
    }
}