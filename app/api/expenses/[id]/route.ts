import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { id } = await params;
  const expenseId = Number(id);
  const { status } = await req.json();

  if (!['active', 'archived'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // authorize: session user must be payer or borrower on this expense
  const rows = await sql`
    UPDATE expenses
    SET status = ${status}, settled_at = ${status === 'archived' ? new Date().toISOString() : null}
    WHERE id = ${expenseId}
      AND (payer_id = ${session.userId} OR borrower_id = ${session.userId})
    RETURNING id, payer_id, borrower_id
  `;
  
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
  }

  const expense = rows[0];
  const receiverId = expense.payer_id === session.userId ? expense.borrower_id : expense.payer_id;

  await sql`
    INSERT INTO activity(expense_id, actor_id, receiver_id, action)
    VALUES (${expense.id}, ${session.userId}, ${receiverId}, ${status === 'archived' ? 'archived': 'unarchived'})
  `

  return NextResponse.json({ success: true });
}