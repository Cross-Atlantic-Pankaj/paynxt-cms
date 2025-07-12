import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { cookies } from 'next/headers';

export async function POST(req) {
  const cookieStore = cookies();
  const role = cookieStore.get('admin_role')?.value;
  if (role !== 'superadmin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await AdminUser.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await AdminUser.create({
      name,
      email,
      password: hashedPassword,
      isAdminPanelUser: false,
      role: 'blogger'
    });

    return NextResponse.json(
      { message: 'Access request submitted. Await admin approval.' },
      { status: 200 } 
    );

  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
