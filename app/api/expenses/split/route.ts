import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';

type SplitShare = {
    contactId: number;
    amount: string;
};

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const name: string = body.name;
    const shares: SplitShare[] = body.shares;

    if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!Array.isArray(shares) || shares.length < 2) {
        return NextResponse.json({ error: 'A split needs at least 2 contacts' }, { status: 400 });
    }

    for (const share of shares) {
        const amountNum = Number(share.amount);
        if (!share.contactId || !Number.isFinite(amountNum) || amountNum <= 0) {
            return NextResponse.json({ error: 'Each share needs a valid contact and a positive amount' }, { status: 400 });
        }
    }

    const contactIds = shares.map((s) => s.contactId);
    
    // get this current user contacts 
    const validContacts = await sql`
        SELECT contact_id FROM contacts
        WHERE user_id = ${session.userId} AND contact_id = ANY(${contactIds})
    `;

    // make sure that the contact is the same one from the database
    if (validContacts.length !== new Set(contactIds).size) {
        return NextResponse.json({ error: 'One or more contacts are invalid' }, { status: 400 });
    }

    // get new split id
    const [{ nextval: splitId }] = await sql`SELECT nextval('split_id_seq') AS nextval`;
    const participantCount = shares.length + 1; // + the payer
    const labeledName = `${name.trim()} (split ${participantCount} ways)`;

    const insertedIds: number[] = [];
    for (const share of shares) {
        const [row] = await sql`
            INSERT INTO expenses (payer_id, borrower_id, name, amount, split_id)
            VALUES (${session.userId}, ${share.contactId}, ${labeledName}, ${share.amount}, ${splitId})
            RETURNING id
        `;
        insertedIds.push(row.id);
    }

  // One activity row for the whole split, pointed at the first expense
  // created (satisfies expense_id NOT NULL). split_id marks it so
  // describeActivity knows not to name a single borrower.
    await sql`
        INSERT INTO activity (expense_id, actor_id, action, split_id)
        VALUES (${insertedIds[0]}, ${session.userId}, 'created', ${splitId})
    `;

    return NextResponse.json({ splitId, expenseIds: insertedIds }, { status: 201 });
}