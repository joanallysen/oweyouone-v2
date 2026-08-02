import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    (await cookies()).delete('session_user_id');
    return NextResponse.redirect(new URL('/login', req.url));
}