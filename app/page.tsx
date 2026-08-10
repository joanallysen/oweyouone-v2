import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import AddContactButton from '@/app/components/AddContactButton';
import ContactList, { type Contact } from '@/app/components/ContactList';
import BottomNav from '@/app/components/BottomNav';

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const contacts = await sql`
    SELECT
      u.id,
      u.email,
      p.name,
      COALESCE(SUM(e.amount) FILTER (WHERE e.borrower_id = ${session.userId} AND e.payer_id = u.id), 0) AS i_owe,
      COALESCE(SUM(e.amount) FILTER (WHERE e.borrower_id = u.id AND e.payer_id = ${session.userId}), 0) AS they_owe,
      COALESCE(SUM(e.amount) FILTER (WHERE e.borrower_id = ${session.userId} AND e.payer_id = u.id), 0)
        - COALESCE(SUM(e.amount) FILTER (WHERE e.borrower_id = u.id AND e.payer_id = ${session.userId}), 0) AS net
    FROM contacts c
    JOIN users u ON u.id = c.contact_id
    LEFT JOIN profile p ON p.user_id = u.id
    LEFT JOIN expenses e ON (e.borrower_id = ${session.userId} AND e.payer_id = u.id) OR (e.borrower_id = u.id AND e.payer_id = ${session.userId})
    WHERE c.user_id = ${session.userId}
    GROUP BY u.id, u.email, p.name
    ORDER BY u.email
  ` as unknown as Contact[];

  const totalIOwe = contacts.reduce((sum, c) => sum + Number(c.i_owe), 0);
  const totalTheyOwe = contacts.reduce((sum, c) => sum + Number(c.they_owe), 0);
  const totalNet = totalTheyOwe - totalIOwe;

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-[#0B0B0E] text-[#EDEDEF]">
      {/* top bar */}
      <div className="ticky top-0 z-10 bg-[#0B0B0E]/95 backdrop-blur-sm flex justify-between items-center px-5 py-4 border-b border-[#232328]">
        <div className="font-bold text-lg">
          OweYouOne <span className="text-xs text-[#8B8B93] font-normal">v.2</span>
        </div>
        <div className="flex items-center gap-4">
          <AddContactButton />
        </div>
      </div>

      {/* summary */}
      <div className="px-5 py-6">
        <h1 className="text-2xl font-semibold m-0">
          {totalNet >= 0 ? (
            <>In total, you are owed <span className="text-[#4ADE80]">${totalNet.toFixed(2)}</span></>
          ) : (
            <>In total, you owe <span className="text-[#F87171]">${Math.abs(totalNet).toFixed(2)}</span></>
          )}
        </h1>
        <div className="flex flex-col gap-1 mt-3 text-sm text-[#8B8B93]">
          <span>— You are owed <span className="text-[#4ADE80]">${totalTheyOwe.toFixed(2)}</span></span>
          <span>— You owe <span className="text-[#F87171]">${totalIOwe.toFixed(2)}</span></span>
        </div>
      </div>

      <ContactList contacts={contacts} />

      <BottomNav />
    </div>
  );
}                                     