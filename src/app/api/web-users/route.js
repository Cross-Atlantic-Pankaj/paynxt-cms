import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error('Web Users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
