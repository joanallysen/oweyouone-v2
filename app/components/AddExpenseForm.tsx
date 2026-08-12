'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        <button onClick={() => router.back()} aria-label="Back" className="text-text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="font-bold text-lg">
          OweYouOne <span className="text-xs text-sec font-normal">v.2</span>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 flex-1">
        <label className="text-sm text-sec block">Who owes who</label>
        {/* direction toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => setDirection('i_owe')}
            className={`flex-1 py-3 text-sm transition-colors ${
              direction === 'i_owe' ? 'bg-[#3A2024] text-owe font-medium' : 'bg-surface text-sec'
            }`}
          >
            You owe {contactName}
          </button>
          <button
            onClick={() => setDirection('they_owe')}
            className={`flex-1 py-3 text-sm transition-colors ${
              direction === 'they_owe' ? 'bg-[#193326] text-owed font-medium' : 'bg-surface text-sec'
            }`}
          >
            {contactName} owes you
          </button>
        </div>

        <div>
          <label className="text-sm text-sec block mb-2">Title</label>
          <input
            type="text"
            placeholder="e.g. Oil, Rent, Dinner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-[#5C5C63]"
          />
        </div>

        <div>
          <label className="text-sm text-sec block mb-2">Amount</label>
          <div className="flex items-center bg-surface border border-border rounded-lg px-4 py-6">
            <span className="text-4xl font-bold mr-1">$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
              }}
              className="flex-1 min-w-0 bg-transparent text-4xl font-bold outline-none placeholder-muted"
              autoFocus
            />
          </div>
        </div>

        {error && <p className="text-owe text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-accent-bg text-accent rounded-lg py-3 text-sm font-medium disabled:opacity-50 mt-auto"
        >
          {saving ? 'Adding...' : 'Add Expenses'}
        </button>
      </div>
    </div>
  );
}