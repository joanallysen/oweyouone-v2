import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import AddContactButton from '@/app/components/AddContactButton';

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
  `;

  const totalIOwe = contacts.reduce((sum, c) => sum + Number(c.i_owe), 0);
  const totalTheyOwe = contacts.reduce((sum, c) => sum + Number(c.they_owe), 0);
  const totalNet = totalTheyOwe - totalIOwe;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* top bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div className="font-bold text-lg">OweYouOne</div>
        <input
          type="text"
          placeholder="Search user"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
        />
      </div>

      {/* summary */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-semibold m-0">
          {totalNet >= 0
            ? `In total, you are owed $${totalNet.toFixed(2)}`
            : `In total, you owe $${Math.abs(totalNet).toFixed(2)}`}
        </h1>
        <div className="flex gap-6 mt-2 text-sm text-gray-500">
          <span>You are borrowing ${totalIOwe.toFixed(2)}</span>
          <span>You are owed ${totalTheyOwe.toFixed(2)}</span>
        </div>
      </div>

      {/* contact list */}
      <div className="flex flex-col px-6 gap-1">
        {contacts.length === 0 && <p className="text-gray-400">No contacts yet. Add one to get started.</p>}

        {contacts.map((c) => {
          const net = Number(c.net);
          return (
            <div
              key={c.id}
              className="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-base">
                  {(c.name || c.email)[0].toUpperCase()}
                </div>
                <span>{c.name || c.email}</span>
              </div>

              <div className="flex gap-4 text-sm">
                <span className="text-red-600">You owe: ${Number(c.i_owe).toFixed(2)}</span>
                <span className="text-green-600">They owe: ${Number(c.they_owe).toFixed(2)}</span>
                <span className="font-semibold">
                  Net: {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <AddContactButton />
    </div>
  );
}