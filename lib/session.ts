import {SignJWT, jwtVerify} from 'jose';
import { cookies } from 'next/headers';

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function createSession(userId: number){
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // a year

    const token = await new SignJWT ({userId})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(encodedKey);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    })
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;

    try {
        const {payload} = await jwtVerify(token, encodedKey);
        return {userId: payload.userId as number};
    } catch {
        return null; // if signature is invalid or tampered
    }
}

export async function deleteSession(){
    const cookieStore = await cookies();
    cookieStore.delete('session');
}