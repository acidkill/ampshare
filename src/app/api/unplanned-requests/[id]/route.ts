import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { UnplannedRequest } from '@/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status, respondedAt, responderUserId } = await request.json();
    const db = await getDb();

    const result = await db.run(
      "UPDATE unplanned_requests SET status = ?, respondedAt = ?, responderUserId = ? WHERE id = ?",
      status,
      respondedAt,
      responderUserId,
      id
    );

    if (result.changes && result.changes > 0) {
      const updatedRequest = await db.get<UnplannedRequest>("SELECT * FROM unplanned_requests WHERE id = ?", id);
      return NextResponse.json(updatedRequest);
    } else {
      return NextResponse.json({ message: 'Request not found or no changes made' }, { status: 404 });
    }
  } catch (error) {
    console.error('PUT unplanned request API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
