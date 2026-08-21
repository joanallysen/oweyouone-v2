'use client';

import { useState, useMemo, useRef } from 'react';
import { Archive } from 'lucide-react';
import Link from 'next/link';
import { formatDateLabel, dateKey } from '@/app/lib/dates';

export type Expense = {
  id: number;
  name: string;
  amount: string;
  payer_id: number;
  borrower_id: number;
  created_at: string;
  status: string;
};

export default function ExpenseList({
  expenses,
  currentUserId,
  contactId,
}: {
  expenses: Expense[];
  currentUserId: number;
  contactId: number;
}) {
  const [query, setQuery] = useState('');
  const [showIOwe, setShowIOwe] = useState(true);
  const [showTheyOwe, setShowTheyOwe] = useState(true);
  const [archiving, setArchiving] = useState<number | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesQuery = e.name.toLowerCase().includes(query.trim().toLowerCase());
      const iOwe = e.borrower_id === currentUserId;
      const matchesDirection = (iOwe && showIOwe) || (!iOwe && showTheyOwe);
      return matchesQuery && matchesDirection;
    });
  }, [expenses, query, showIOwe, showTheyOwe, currentUserId]);

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const key = dateKey(e.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()); // already ordered since `expenses` arrives sorted DESC
  }, [filtered]);

  async function handleArchive(expenseId: number) {
    setArchiving(expenseId);
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' }),
    });
    setArchiving(null);
    if (res.ok) {
      window.location.reload();
    }
  }

  function handleDateJump(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.value; // yyyy-mm-dd
    const el = groupRefs.current[picked];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="flex flex-col">
      <div className="px-5 flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search expenses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-border-strong"
          />
        </div>
        <label className="shrink-0 text-sec cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input type="date" onChange={handleDateJump} className="sr-only" />
        </label>
      </div>



      <div className="px-5 flex gap-2 mb-4">
        <button
          onClick={() => setShowIOwe(!showIOwe)}
          className={`text-xs px-3 py-1.5 rounded-full border ${
            showIOwe ? 'bg-border border-border-strong text-text' : 'bg-transparent border-border text-muted'
          }`}
        >
          I owe {showIOwe && '✕'}
        </button>
        <button
          onClick={() => setShowTheyOwe(!showTheyOwe)}
          className={`text-xs px-3 py-1.5 rounded-full border ${
            showTheyOwe ? 'bg-border border-border-strong text-text' : 'bg-transparent border-border text-muted'
          }`}
        >
          They owe {showTheyOwe && '✕'}
        </button>
      </div>

      <div className="px-5 py-3 mb-3">
        <Link href={`/contacts/${contactId}/archived`} className="text-sm text-muted text-center">
          <div className='flex gap-4'>
            <Archive />
            <p>Archived</p>
          </div>
        </Link>
      </div>
      <div className="flex flex-col px-5">
        {groups.length === 0 && <p className="text-muted text-sm py-6">No expenses found.</p>}

        {groups.map(([key, items]) => (
          <div key={key} ref={(el) => { groupRefs.current[key] = el; }} className="mb-5">
            <p className="text-xs text-sec mb-2">{formatDateLabel(items[0].created_at)}</p>
            <div className="flex flex-col gap-3">
              {items.map((e) => {
                const iOwe = e.borrower_id === currentUserId;
                return (
                  <div key={e.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={iOwe ? 'text-owe' : 'text-owed'}>
                        {iOwe ? '↗' : '↙'}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className={`text-xs ${iOwe ? 'text-owe' : 'text-owed'}`}>
                          {iOwe ? `You borrowed $${Number(e.amount).toFixed(2)}` : `You lent $${Number(e.amount).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleArchive(e.id)}
                      disabled={archiving === e.id}
                      aria-label="Mark as settled"
                      className="text-muted disabled:opacity-40"
                    >
                      ✓
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}