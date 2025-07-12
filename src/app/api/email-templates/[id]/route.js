// src/app/api/email-templates/[id]/route.js
import dbConnect from '@/lib/db';
import EmailTemplate from '@/models/EmailTemplate';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const updated = await EmailTemplate.findByIdAndUpdate(
    params.id,
    { type: body.type, subject: body.subject, body: body.body },
    { new: true }
  );
  return NextResponse.json({ success: true, template: updated });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  await EmailTemplate.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
