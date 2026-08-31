'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddExpenseForm({
  contactId,
  contactName,
}: {
  contactId: number;
  contactName: string;
}) {
  const [direction, setDirection] = useState<'i_owe' | 'they_owe'>('they_owe');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit() {
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactId,
        name: title.trim(),
        amount: parsed,
        direction, // 'i_owe' | 'they_owe' — server maps to payer/borrower
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push(`/contacts/${contactId}`);
    router.refresh();
  }

  return (
      <div className="min-h-screen flex flex-col bg-bg text-text">
        <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm flex items-center gap-3 px-5 py-4 border-b border-border">
          <Link href={`/contacts/${contactId}`} aria-label="Back" className="text-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="font-bold text-lg">
            OweYouOne <span className="text-xs text-sec font-normal">v.2</span>
          </div>
        </div>

        <div className="px-5 py-6 flex flex-col gap-6 flex-1">
          <div>
            <label className="text-sm text-sec block mb-2">Who owes who</label>
            <div className="flex rounded-xl overflow-hidden border border-border p-1 gap-1 bg-surface">
              <button
                onClick={() => setDirection('i_owe')}
                className={`flex-1 py-3 rounded-lg text-sm transition-all ${
                  direction === 'i_owe'
                    ? 'bg-[#3A2024] text-owe font-medium shadow-sm'
                    : 'text-sec hover:text-text'
                }`}
              >
                You owe {contactName}
              </button>
              <button
                onClick={() => setDirection('they_owe')}
                className={`flex-1 py-3 rounded-lg text-sm transition-all ${
                  direction === 'they_owe'
                    ? 'bg-[#193326] text-owed font-medium shadow-sm'
                    : 'text-sec hover:text-text'
                }`}
              >
                {contactName} owes you
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-sec block mb-2">Title</label>
            <input
              type="text"
              placeholder="e.g. Oil, Rent, Dinner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-bg/40 focus:border-accent-bg transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-sec block mb-2">Amount</label>
            <div className="flex items-center bg-surface border border-border rounded-xl px-4 py-8 focus-within:ring-2 focus-within:ring-accent-bg/40 focus-within:border-accent-bg transition-colors">
              <span className="text-4xl font-bold mr-1 text-white">$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
                }}
                className="flex-1 min-w-0 max-w-[200px] bg-transparent text-4xl font-bold outline-none placeholder-muted"
              />
            </div>
          </div>

          {error && <p className="text-owe text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-accent-bg text-accent rounded-xl py-3.5 text-sm shadow-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all mt-auto"
          >
            {saving ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
  );
}