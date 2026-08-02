import {sql} from '@/lib/db';
import bcrypt from 'bcryptjs';
import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function POST(req: NextRequest){
    const {email, password} = await req.json();

    if (!email || !password){
        return NextResponse.json({error: 'Email and password required'}, {status : 400});
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        const rows = await sql`
            INSERT INTO users (email, password)
            VALUES (${email}, ${hashed})
            RETURNING id
        `;
        const userId = rows[0].id;
        await sql`
            INSERT INTO profile (user_id) VALUES (${userId})
        `;

        (await cookies()).set('session_user_id', String(userId), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({id: userId});
    } catch (err : any){
        if (err.code === '23505') {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }
        console.error(err);
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
    }

}