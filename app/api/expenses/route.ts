import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { contactId, name, amount, direction } = await req.json();

  if (!contactId || !name || !name.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  if (!['i_owe', 'they_owe'].includes(direction)) {
    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
  }

  // authorize: contactId must actually be a contact of this user
  const contactRows = await sql`
    SELECT 1 FROM contacts WHERE user_id = ${session.userId} AND contact_id = ${contactId}
  `;
  if (contactRows.length === 0) {
    return NextResponse.json({ error: 'Not a valid contact' }, { status: 403 });
  }

  const payerId = direction === 'i_owe' ? contactId : session.userId;
  const borrowerId = direction === 'i_owe' ? session.userId : contactId;

  const [newExpense] = await sql`
    INSERT INTO expenses (payer_id, borrower_id, name, amount)
    VALUES (${payerId}, ${borrowerId}, ${name.trim()}, ${parsedAmount})
    RETURNING id
  `;

  await sql`
    INSERT INTO activity (expense_id, actor_id, receiver_id, action)
    VALUES (${newExpense.id}, ${session.userId}, ${contactId},'created')  
  `

  return NextResponse.json({ success: true });
}