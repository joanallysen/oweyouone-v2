import {sql} from '@/lib/db';
import {getSession} from '@/lib/session';
import {redirect} from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import ActivityRow from '@/app/components/ActivityRow';
import { formatDateLabel, dateKey } from '@/app/lib/dates';

export default async function ActivityPage(){
    const session = await getSession();
    if (!session){
        redirect('/login');
    }

    const activityRows = await sql`
        SELECT 
            a.id, a.action, a.created_at, a.actor_id,
            e.id as expense_id,
            e.name as expense_name,
            e.amount, e.payer_id, e.borrower_id,
            actor.name as actor_name,
            payer.name as payer_name,
            borrower.name as borrower_name
        FROM activity a
        JOIN expenses e ON e.id = a.expense_id
        JOIN profile actor ON actor.user_id = a.actor_id
        JOIN profile borrower ON borrower.user_id = e.borrower_id
        JOIN profile payer ON payer.user_id = e.payer_id
        WHERE e.payer_id = ${session.userId} OR e.borrower_id = ${session.userId}
        ORDER BY a.created_at DESC
    `

    const groups = new Map<string, typeof activityRows>();
    for (const row of activityRows) {
    const key = dateKey(row.created_at);
    if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
    }

    return (
        <div className="min-h-screen flex flex-col pb-24 bg-bg text-text">
            <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className="font-bold text-lg">
                OweYouOne <span className="text-xs text-sec font-normal">v.2</span>
                </div>
            </div>

            <div className="px-5 py-6">
                <h1 className="text-2xl font-semibold m-0">Activity</h1>
            </div>

            <div className="px-5 flex flex-col gap-6">
                {[...groups.entries()].map(([key, items]) => (
                <section key={key}>
                    <h2 className="text-sec text-xs mb-2">{formatDateLabel(items[0].created_at)}</h2>
                    <div className="flex flex-col gap-2">
                    {items.map((item) => (
                        <ActivityRow key={item.id} sessionUserId={session.userId} item={item} />
                    ))}
                    </div>
                </section>
                ))}
                {activityRows.length === 0 && (
                <p className="text-sec text-sm text-center py-12">No activity yet.</p>
                )}
            </div>

            <BottomNav />
        </div>
    )
}