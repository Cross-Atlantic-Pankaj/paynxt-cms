import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminUser from '@/models/AdminUser';

export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    const user = await AdminUser.findByIdAndUpdate(id, { isAdminPanelUser: true }, { new: true });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve Admin Panel User error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 