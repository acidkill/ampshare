
import { NextResponse } from 'next/server';
import { getAllApartments, createApartment } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1];
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apartments = await getAllApartments();

    // Auto-seed mock data for development if it's empty
    if (apartments.length === 0 && process.env.NODE_ENV !== 'production') {
      const mockApt1 = await createApartment({ id: 'apt_1', name: 'Apartment 1A' });
      const mockApt2 = await createApartment({ id: 'apt_2', name: 'Apartment 2B' });
      return NextResponse.json([mockApt1, mockApt2]);
    }

    return NextResponse.json(apartments);
  } catch (error) {
    console.error('Failed to fetch apartments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
