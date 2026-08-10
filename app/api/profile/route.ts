import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const rows = await sql`
        SELECT p.name, p.bio, u.email
        FROM profile p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ${session.userId}
    `;

    return NextResponse.json(rows[0] || null);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { name, bio } = await req.json();
    if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await sql`
        UPDATE profile SET name = ${name.trim()}, bio = ${bio?.trim() || null}
        WHERE user_id = ${session.userId}
    `;

    return NextResponse.json({ success: true });
}