import { redirect } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';
import BottomNav from '@/app/components/BottomNav';
import SplitAmountForm from '@/app/components/SplitAmountForm';

export type SplitContact = {
  id: number;
  name: string;
};

export default async function SplitAmountPage({
  searchParams,
}: {
  searchParams: Promise<{ contacts?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { contacts: contactsParam } = await searchParams;
  const contactIds = (contactsParam ?? '')
    .split(',')
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));

  if (contactIds.length < 2) {
    redirect('/split');
  }

  const contactRows = await sql`
    SELECT u.id, u.email, p.name
    FROM contacts c
    JOIN users u ON u.id = c.contact_id
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE c.user_id = ${session.userId} AND c.contact_id = ANY(${contactIds})
  `;

  const invalid = contactRows.length !== new Set(contactIds).size;

  const contacts: SplitContact[] = contactRows.map((c: any) => ({
    id: c.id,
    name: c.name || c.email,
  }));

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-bg text-text">
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="font-bold text-lg">
          OweYouOne <span className="text-xs text-sec font-normal">v.2</span>
        </div>
      </div>

      {invalid ? (
        <div className="px-5 py-6">
          <p className="text-sm text-danger-bg mb-3">
            One or more selected contacts are no longer available. Please pick again.
          </p>
          <Link href="/split" className="text-sm font-medium text-text underline">
            Back to contact selection
          </Link>
        </div>
      ) : (
        <>
          <div className="px-5 py-6">
            <h1 className="text-base font-semibold m-0">Split with</h1>
          </div>
          <SplitAmountForm contacts={contacts} />
        </>
      )}

      <BottomNav />
    </div>
  );
}