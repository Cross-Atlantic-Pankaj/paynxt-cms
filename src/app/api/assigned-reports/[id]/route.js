// /app/api/assigned-reports/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AssignedReport from '@/models/AssignedReport';
import mongoose from 'mongoose';

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        const deleted = await AssignedReport.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Assigned report not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Assigned report deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/assigned-reports/[id] error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
