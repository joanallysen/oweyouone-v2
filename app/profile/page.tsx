import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import ProfileForm from '@/app/components/ProfileForm';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const rows = await sql`
        SELECT p.name, u.email
        FROM profile p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ${session.userId}
    `;

    const profile = rows[0];

    return (
        <div className="p-6 pb-20">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-gray-500 text-sm">{profile?.email}</p>
        <ProfileForm initialName={profile?.name || ''} />
        </div>
    );
}