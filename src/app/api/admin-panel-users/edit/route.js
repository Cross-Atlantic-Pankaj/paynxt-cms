import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminUser from '@/models/AdminUser';

export async function POST(req) {
  try {
    await connectDB();
    const { id, role, isAdminPanelUser } = await req.json();
    const update = {};
    if (role) update.role = role;
    if (typeof isAdminPanelUser === 'boolean') update.isAdminPanelUser = isAdminPanelUser;
    const user = await AdminUser.findByIdAndUpdate(id, update, { new: true });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Edit Admin Panel User error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 