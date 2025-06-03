import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { UnplannedRequest } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const requests = await db.all<UnplannedRequest[]>("SELECT * FROM unplanned_requests");
    // Convert forcePasswordChange from 0/1 to boolean if needed for User type, though not directly used here
    return NextResponse.json(requests);
  } catch (error) {
    console.error('GET unplanned requests API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { requesterUserId, requesterApartmentId, targetApartmentId, applianceType, dayOfWeek, startTime, endTime, reason, status, requestedAt } = await request.json();
    const db = await getDb();
    const id = uuidv4();

    await db.run(
      "INSERT INTO unplanned_requests (id, requesterUserId, requesterApartmentId, targetApartmentId, applianceType, dayOfWeek, startTime, endTime, reason, status, requestedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      id,
      requesterUserId,
      requesterApartmentId,
      targetApartmentId,
      applianceType,
      dayOfWeek,
      startTime,
      endTime,
      reason,
      status,
      requestedAt
    );

    const newRequest = await db.get<UnplannedRequest>("SELECT * FROM unplanned_requests WHERE id = ?", id);
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('POST unplanned request API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
