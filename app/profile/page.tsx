import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import BottomNav from '@/app/components/BottomNav';
import LogoutButton from '@/app/components/LogoutButton';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const profileRows = await sql`
    SELECT p.name, p.bio, u.email
    FROM profile p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ${session.userId}
  `;
  const profile = profileRows[0] as { name: string; email: string; bio:string | null } | undefined; 

  const totals = await sql`
    SELECT
      COALESCE(SUM(e.amount) FILTER (WHERE e.borrower_id = ${session.userId}), 0) AS i_owe,
      COALESCE(SUM(e.amount) FILTER (WHERE e.payer_id = ${session.userId}), 0) AS they_owe
    FROM expenses e
    WHERE e.borrower_id = ${session.userId} OR e.payer_id = ${session.userId}
  `;
  const iOwe = Number(totals[0]?.i_owe ?? 0);
  const theyOwe = Number(totals[0]?.they_owe ?? 0);
  const net = theyOwe - iOwe;

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-[#0B0B0E] text-[#EDEDEF]">
      <div className="sticky top-0 z-10 bg-[#0B0B0E]/95 backdrop-blur-sm px-5 py-4 border-b border-[#232328]">
        <div className="font-bold text-lg">
          OweYouOne <span className="text-xs text-[#8B8B93] font-normal">v.2</span>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 py-8">
        <div className="w-24 h-24 rounded-full bg-[#232328] flex items-center justify-center text-2xl">
          {(profile?.name || profile?.email || profile?.bio ||'?')[0].toUpperCase()}
        </div>
        <h1 className="text-xl font-bold mt-4">{profile?.name}</h1>
        <p className="text-m text-[#8B8B93] mt-1">{profile?.email}</p>
        {profile?.bio && (
          <p className="text-sm text-[#8B8B93] mt-3 text-center px-6">{profile.bio}</p>
        )}
      </div>

      <div className="px-5">
        <h2 className="text-sm text-[#8B8B93] mb-2">Balances</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#16161A] border border-[#232328] rounded-lg p-3">
            <p className="text-xs text-[#8B8B93] mb-1">I owe</p>
            <p className="text-[#F87171] font-semibold">${iOwe.toFixed(2)}</p>
          </div>
          <div className="bg-[#16161A] border border-[#232328] rounded-lg p-3">
            <p className="text-xs text-[#8B8B93] mb-1">They owe</p>
            <p className="text-[#4ADE80] font-semibold">${theyOwe.toFixed(2)}</p>
          </div>
          <div className="bg-[#16161A] border border-[#232328] rounded-lg p-3">
            <p className="text-xs text-[#8B8B93] mb-1">Net</p>
            <p className={`font-semibold ${net >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
              {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8">
        <h2 className="text-sm text-[#8B8B93] mb-2">Account</h2>
        <Link
          href="/profile/edit"
          className="flex items-center justify-between bg-[#16161A] border border-[#232328] rounded-lg px-4 py-3 text-sm"
        >
          <span>Personal Information</span>
          <span className="text-[#5C5C63]">›</span>
        </Link>
      </div>

      <div className="px-5 mt-6">
        <LogoutButton />
      </div>

      <BottomNav />
    </div>
  );
}