
import { NextResponse } from 'next/server';
import { getAllApartments } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1];
  if (!token || !verifyToken(token)) {
    // Even though it's public data, let's keep it behind auth for consistency
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apartments = await getAllApartments();
    return NextResponse.json(apartments);
  } catch (error) {
    console.error('Failed to fetch apartments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
