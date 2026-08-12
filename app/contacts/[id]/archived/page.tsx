import {redirect, notFound} from 'next/navigation';
import {getSession} from '@/lib/session';
import {sql} from '@/lib/db';
import BottomNav from '@/app/components/BottomNav';
import ArchivedList, {type Expense} from '@/app/components/ArchivedList';
import Link from 'next/link';

export default async function ArchivedPage({params} : {params : Promise<{id:string}>}){
    const session = await getSession();
    if (!session){
        redirect('/login');
    }
    
    const {id} = await params;
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
    `

    const contact = contactRows[0] as {id : number; email:string; name:string | null} | undefined;
    if (!contact) {
        notFound();
    }

    const expenses = await sql`
        SELECT id, name, amount, payer_id, borrower_id, created_at, settled_at, status
        FROM expenses
        WHERE status = 'archived'
        AND ((borrower_id = ${session.userId} AND payer_id = ${contactId})
        OR (borrower_id = ${contactId} AND payer_id = ${session.userId}))
        ORDER BY settled_at DESC
    ` as unknown as Expense[];

    return(
    <div className='min-h-screen flex flex-col pb-24 bg-bg text-text'>
        <div className='sticky top-0 z-10 bg-bg/95 backdrop-blur-sm flex items-center gap-3 px-5 py-4 border-b border-border'>
            <Link href={`/contacts/${contactId}`} aria-label="Back" className="text-text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </Link>

            <div className='font-bold text-lg'>
                Archived with {contact.name || contact.email}
            </div>
        </div>
        <ArchivedList expenses={expenses} currentUserId={session.userId} />
        <BottomNav />
    </div>
    )
}

