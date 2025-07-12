import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await dbConnect();
  const { status } = await req.json();
  const updated = await Order.findByIdAndUpdate(params.id, { status }, { new: true });
  return NextResponse.json({ success: true, order: updated });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  await Order.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
