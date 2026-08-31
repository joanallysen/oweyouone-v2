import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';
import BottomNav from '@/app/components/BottomNav';
import SplitContactPicker from '@/app/components/SplitContactPicker';

export type SplitContact = {
  id: number;
  name: string;
};

export default async function SplitPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const contactRows = await sql`
    SELECT u.id, u.email, p.name
    FROM contacts c
    JOIN users u ON u.id = c.contact_id
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE c.user_id = ${session.userId}
    ORDER BY p.name
  `;

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

      <div className="px-5 pt-6 pb-2">
          <h1 className="text-2xl font-semibold m-0">Split</h1>
      </div>
      <div className="px-5 pb-6">
        <h1 className="text-muted text-xs m-0">Select the contacts you want to split with</h1>
      </div>

      <SplitContactPicker contacts={contacts} />

      <BottomNav />
    </div>
  );
}