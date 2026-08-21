'use client';

import { Key } from 'lucide-react';
import { formatDateLabel, dateKey } from '@/app/lib/dates';
import {useState, useMemo} from 'react';


export type Expense = {
    id: number;
    name: string;
    amount: string;
    payer_id: number;
    borrower_id: number;
    created_at: string;
    settled_at: string | null;
    status: string;
};

export default function ArchivedList({expenses, currentUserId,} : {expenses: Expense[]; currentUserId: number;}){
    const [undoing, setUndoing] = useState<number | null>(null);

    const groups = useMemo (() => {
        const map = new Map<string, Expense[]>();
        for (const e of expenses){
            const key = dateKey(e.settled_at || e.created_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(e);
        }
        return Array.from(map.entries());
    }, [expenses]);

    async function handleUndo(expenseId: number){
        setUndoing(expenseId);
        const res = await fetch(`/api/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: 'active'}),
        })
        setUndoing(null)
        if (res.ok) {
            window.location.reload();
        }
    }

    return(
    <div className='flex flex-col px-5 pt-4'>
        {groups.length === 0 && (
            <p className='text-muted text-sm py-6'>Nothing archived yet.</p>
        )}

        {groups.map(([key, items]) => (
            <div key={key} className='mb-5'>
                <p className="text-xs text-sec mb-2">{formatDateLabel(items[0].settled_at || items[0].created_at)}</p>
                <div className='flex flex-col gap-3'>
                    {items.map((e) => {
                        const iOwe = e.borrower_id === currentUserId;
                        return (
                            <div key={e.id} className='flex items-center justify-between opacity-70'>
                                <div className='flex items-center gap-3'>
                                    <span className={iOwe ? 'text-owe': 'text-owed'}> 
                                        {iOwe ? '↗' : '↙'}
                                    </span>

                                    <div>
                                    <p className='text-sm font-medium'>{e.name}</p>
                                    <p className={`text-xs ${iOwe ? 'text-owe' : 'text-owed'}`}>
                                        {iOwe ? `You borrowed $${Number(e.amount).toFixed(2)}` : `You lent $${Number(e.amount).toFixed(2)}`}
                                    </p>
                                    </div>  
                                </div>
                                <button
                                    onClick={() => handleUndo(e.id)}
                                    disabled={undoing === e.id}
                                    className="text-xs text-sec border border-border rounded-full px-3 py-1.5 disabled:opacity-40"
                                >
                                    {undoing === e.id ? '...' : 'Undo'}
                                </button>
                            </div>
                            
                        )
                    })}
                </div>
            </div>
        ))}
    </div>
)
}


