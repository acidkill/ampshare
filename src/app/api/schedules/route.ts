
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllScheduleEntries, getScheduleEntriesByApartment, createScheduleEntry, deleteScheduleEntry } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { ScheduleEntry } from '@/types';

// GET /api/schedules - Fetches schedule entries
// Optional query param: `apartmentId` to filter by apartment
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get('apartmentId');

  try {
    let schedules: ScheduleEntry[];
    if (apartmentId) {
      schedules = await getScheduleEntriesByApartment(apartmentId);
    } else {
      schedules = await getAllScheduleEntries();
    }
    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch schedule entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/schedules - Creates a new schedule entry
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const decodedToken = token ? verifyToken(token) : null;
  if (!decodedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body: Omit<ScheduleEntry, 'id' | 'userId' | 'apartmentId'> = await request.json();

    // Ensure that the user is creating an entry for their own apartment
    const userApartmentId = decodedToken.apartmentId;

    const newEntryData: Omit<ScheduleEntry, 'id'> = {
      ...body,
      userId: decodedToken.id,
      apartmentId: userApartmentId,
    };

    const newEntry = await createScheduleEntry(newEntryData);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create schedule entry:', error);
    // Provide specific error messages for validation failures if applicable
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/schedules - Deletes a schedule entry
// Requires `id` in the request body
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const decodedToken = token ? verifyToken(token) : null;
  if (!decodedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Schedule entry ID is required' }, { status: 400 });
    }

    // Optional: Add ownership check to ensure user can only delete their own entries
    // const entryToDelete = await getScheduleEntryById(id);
    // if (!entryToDelete || entryToDelete.userId !== decodedToken.id) {
    //   if (decodedToken.role !== 'admin') { // Admins can delete any
    //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    //   }
    // }

    const success = await deleteScheduleEntry(id);
    if (success) {
      return new NextResponse(null, { status: 204 }); // No Content
    } else {
      return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to delete schedule entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
