import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('humbl_admin_token');

  if (token && token.value) {
    return NextResponse.json({ authenticated: true, user: { email: process.env.ADMIN_EMAIL || process.env.ADMINEMAIL || 'admin@humblbar.com' } });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
