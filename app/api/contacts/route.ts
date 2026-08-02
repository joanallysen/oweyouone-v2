import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // prevent adding yourself
    const meRows = await sql`SELECT email FROM users WHERE id = ${session.userId}`;
    if (meRows[0]?.email === email) {
        return NextResponse.json({ error: "You can't add yourself" }, { status: 400 });
    }

    const targetRows = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (targetRows.length === 0) {
        return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });
    }

    const rows = await sql`
        INSERT INTO contacts (user_id, contact_id)
        SELECT ${session.userId}, id FROM users WHERE email = ${email}
        UNION ALL
        SELECT id, ${session.userId} FROM users WHERE email = ${email}
        ON CONFLICT DO NOTHING
        RETURNING *
    `;

    return NextResponse.json({ added: rows.length > 0 });
}