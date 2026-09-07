import {sql} from '@/lib/db';
import bcrypt from 'bcryptjs';
import {NextRequest, NextResponse} from 'next/server';
import {createSession} from '@/lib/session'

export async function POST(req: NextRequest) {
    const {email, password} = await req.json();

    const rows = await sql`
        SELECT id, email, password
        FROM users
        WHERE email = ${email}
    `;

    if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({ id: user.id });
}