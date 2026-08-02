import { cookies } from 'next/headers';

export async function getSession() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) return null;

    return { userId: Number(userId) };
}