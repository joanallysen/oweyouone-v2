import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import AddExpenseForm from '@/app/components/AddExpenseForm';

export default async function AddExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const contactId = Number(id);
  if (!contactId || isNaN(contactId)) {
    notFound();
  }

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

  return (
    <AddExpenseForm
      contactId={contactId}
      contactName={contact.name || contact.email}
    />
  );
}