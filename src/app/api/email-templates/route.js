// src/app/api/email-templates/route.js
import dbConnect from '@/lib/db';
import EmailTemplate from '@/models/EmailTemplate';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  const templates = await EmailTemplate.find();
  return NextResponse.json({ success: true, templates });
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const newTemplate = await EmailTemplate.create({
    type: body.type,
    subject: body.subject,
    body: body.body
  });
  return NextResponse.json({ success: true, template: newTemplate });
}
