import { NextResponse } from 'next/server';
import { saveQuizSubmission } from '@/lib/storage';
import { calculateArchetype } from '@/lib/quizData';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, answers } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    // Compute personality archetype
    const archetype = calculateArchetype(answers || {});
    const queueNumInt = Math.floor(3843 + Math.random() * 20);
    const queueNumber = `#${String(queueNumInt).padStart(4, '0')}`;
    const passId = `HBL-VIP-${Math.floor(1000 + Math.random() * 9000)}`;

    const submission = await saveQuizSubmission({
      name,
      email,
      phone,
      answers: answers || {},
      archetype,
      queueNumber,
      passId
    });

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'VIP Founding Pass created successfully!'
    });
  } catch (error) {
    console.error('API /api/quiz error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while saving quiz response.' },
      { status: 500 }
    );
  }
}
