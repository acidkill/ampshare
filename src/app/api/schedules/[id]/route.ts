import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ScheduledAppliance } from '@/types';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { applianceType, startTime, endTime, dayOfWeek, apartmentId, userId, description } = await request.json();
    const db = await getDb();

    const result = await db.run(
      "UPDATE schedules SET applianceType = ?, startTime = ?, endTime = ?, dayOfWeek = ?, apartmentId = ?, userId = ?, description = ? WHERE id = ?",
      applianceType,
      startTime,
      endTime,
      dayOfWeek,
      apartmentId,
      userId,
      description,
      id
    );

    if (result.changes && result.changes > 0) {
      const updatedSchedule = await db.get<ScheduledAppliance>("SELECT * FROM schedules WHERE id = ?", id);
      return NextResponse.json(updatedSchedule);
    } else {
      return NextResponse.json({ message: 'Schedule not found or no changes made' }, { status: 404 });
    }
  } catch (error) {
    console.error('PUT schedule API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();

    const result = await db.run("DELETE FROM schedules WHERE id = ?", id);

    if (result.changes && result.changes > 0) {
      return NextResponse.json({ message: 'Schedule deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('DELETE schedule API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
