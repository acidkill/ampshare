import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ScheduledAppliance } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const schedules = await db.all<ScheduledAppliance[]>("SELECT * FROM schedules");
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('GET schedules API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { applianceType, startTime, endTime, dayOfWeek, apartmentId, userId, description } = await request.json();
    const db = await getDb();
    const id = uuidv4();

    await db.run(
      "INSERT INTO schedules (id, applianceType, startTime, endTime, dayOfWeek, apartmentId, userId, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      id,
      applianceType,
      startTime,
      endTime,
      dayOfWeek,
      apartmentId,
      userId,
      description
    );

    const newSchedule = await db.get<ScheduledAppliance>("SELECT * FROM schedules WHERE id = ?", id);
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error('POST schedule API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
