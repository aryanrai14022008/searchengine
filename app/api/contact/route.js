import { NextResponse } from 'next/server';
import { saveContactSubmission } from '@/lib/storage';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const submission = await saveContactSubmission({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message
    });

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Thank you for reaching out! Our team will contact you shortly.'
    });
  } catch (error) {
    console.error('API /api/contact error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while saving contact message.' },
      { status: 500 }
    );
  }
}
