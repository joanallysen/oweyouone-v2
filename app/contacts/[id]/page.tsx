import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import BottomNav from '@/app/components/BottomNav';
import ExpenseList, { type Expense } from '@/app/components/ExpenseList';
import Link from 'next/link';

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const contactId = Number(id);
  if (!contactId || isNaN(contactId)) {
    notFound();
  }

  // authorize: must be an actual contact of this user
  const contactRows = await sql`
    SELECT u.id, u.email, p.name
    FROM contacts c
    JOIN users u ON u.id = c.contact_id
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE c.user_id = ${session.userId} AND c.contact_id = ${contactId}
  `;
  const contact = contactRows[0] as { id: number; email: string; name: string | null } | undefined;
  if (!contact) {
    notFound();
  }

  const totals = await sql`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE borrower_id = ${session.userId} AND payer_id = ${contactId} AND status = 'active'), 0) AS i_owe,
      COALESCE(SUM(amount) FILTER (WHERE borrower_id = ${contactId} AND payer_id = ${session.userId} AND status = 'active'), 0) AS they_owe
    FROM expenses
    WHERE (borrower_id = ${session.userId} AND payer_id = ${contactId})
       OR (borrower_id = ${contactId} AND payer_id = ${session.userId})
  `;
  const iOwe = Number(totals[0]?.i_owe ?? 0);
  const theyOwe = Number(totals[0]?.they_owe ?? 0);
  const net = theyOwe - iOwe;

  // slightly different method compared to homepage

  const expenses = await sql`
    SELECT id, name, amount, payer_id, borrower_id, created_at, status
    FROM expenses
    WHERE status = 'active'
      AND ((borrower_id = ${session.userId} AND payer_id = ${contactId})
        OR (borrower_id = ${contactId} AND payer_id = ${session.userId}))
    ORDER BY created_at DESC
  ` as unknown as Expense[];

  const contactName = contact.name || contact.email;

  return (
      <div className="min-h-screen flex flex-col pb-24 bg-bg text-text">
        <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm flex items-center gap-3 px-5 py-4 border-b border-border">
          <Link href="/" aria-label="Back" className="text-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="font-bold text-lg">
            OweYouOne <span className="text-xs text-sec font-normal">v.2</span>
          </div>
        </div>

        <div className="px-5 py-6">
          <h1 className="text-2xl font-semibold m-0">
            {net >= 0 ? (
              <>You are owed <span className="text-owed">${net.toFixed(2)}</span> from <span>{contactName}</span></>
            ) : (
              <>You owe <span className="text-owe">${Math.abs(net).toFixed(2)}</span> for <span>{contactName}</span></>
            )}
          </h1>
          <div className="flex flex-col gap-1 mt-3 text-sm text-sec">
            <span>— You are owed <span className="text-owed">${theyOwe.toFixed(2)}</span></span>
            <span>— {contactName} owe you <span className="text-owe">${iOwe.toFixed(2)}</span></span>
          </div>
        </div>


        <ExpenseList expenses={expenses} currentUserId={session.userId} contactId={contactId} />

        <Link
          href={`/contacts/${contactId}/add`}
          className="fixed bottom-24 right-5 z-20 bg-accent-bg text-accent rounded-full px-5 py-3 text-sm shadow-lg"
        >
          + Add Expense
        </Link>



        <BottomNav />
      </div>
  );
}