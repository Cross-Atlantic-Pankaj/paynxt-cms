import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const userId = params.id;

    await User.findByIdAndUpdate(userId, body);
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}