import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uri = process.env.MONGODB_URI || process.env.MONGODBURI;
  
  if (!uri) {
    return NextResponse.json({
      status: 'error',
      message: 'MONGODB_URI environment variable is NOT set on Vercel.',
      hint: 'Add MONGODB_URI in Vercel Project Settings -> Environment Variables and redeploy.'
    });
  }

  if (uri.includes('<db_username>')) {
    return NextResponse.json({
      status: 'error',
      message: 'MONGODB_URI still contains placeholder <db_username>.',
      hint: 'Replace <db_username> with your MongoDB user in Vercel environment variables.'
    });
  }

  // Mask URI for safe display
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db('humblbar');
    const count = await db.collection('quiz_responses').countDocuments();
    const sample = await db.collection('quiz_responses').find({}).limit(3).toArray();
    await client.close();

    return NextResponse.json({
      status: 'success',
      message: 'Connected to MongoDB Atlas successfully from Vercel!',
      totalQuizResponsesInCloud: count,
      sampleDocs: sample.map(s => ({ name: s.name, email: s.email, archetype: s.archetype?.title })),
      uriUsed: maskedUri
    });
  } catch (error) {
    return NextResponse.json({
      status: 'connection_failed',
      errorName: error.name,
      errorMessage: error.message,
      hint: error.message.includes('whitelist') || error.message.includes('timed out') || error.message.includes('buffering timed out')
        ? 'MongoDB Atlas Network Access is blocking Vercel! In MongoDB Atlas -> Network Access -> Add IP -> Select 0.0.0.0/0 (Allow access from anywhere).'
        : 'Check your database password and credentials in Vercel environment variables.',
      uriUsed: maskedUri
    }, { status: 500 });
  }
}
