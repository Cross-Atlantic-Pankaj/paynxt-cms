import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, role, isAdminPanelUser } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await AdminUser.create({
      name,
      email,
      password: hashedPassword,
      role,
      isAdminPanelUser: !!isAdminPanelUser
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add Admin Panel User error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 