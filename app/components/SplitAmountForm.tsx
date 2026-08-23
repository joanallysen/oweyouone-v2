// app/components/SplitAmountForm.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInitials, avatarColorClasses } from '@/app/lib/activity';
import { splitEvenlyAmongContacts } from '@/app/lib/split';
import type { SplitContact } from '@/app/split/amount/page';

export default function SplitAmountForm({ contacts }: { contacts: SplitContact[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [mode, setMode] = useState<'even' | 'custom'>('even');
  const [customAmounts, setCustomAmounts] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participantCount = contacts.length + 1; // + you

  const evenShares = useMemo(() => {
    const total = Number(totalAmount);
    if (!total) return {} as Record<number, string>;
    const shares = splitEvenlyAmongContacts(totalAmount, contacts.length);
    const map: Record<number, string> = {};
    contacts.forEach((c, i) => {
      map[c.id] = shares[i];
    });
    return map;
  }, [totalAmount, contacts]);

  const perPersonDisplay = useMemo(() => {
    const total = Number(totalAmount);
    if (!total) return null;
    return (total / participantCount).toFixed(2);
  }, [totalAmount, participantCount]);

  const canSubmit =
    name.trim().length > 0 &&
    (mode === 'even'
      ? Number(totalAmount) > 0
      : contacts.every((c) => Number(customAmounts[c.id]) > 0));

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const shares = contacts.map((c) => ({
      contactId: c.id,
      amount: mode === 'even' ? evenShares[c.id] : Number(customAmounts[c.id]).toFixed(2),
    }));

    const res = await fetch('/api/expenses/split', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), shares }),
    });

    setSubmitting(false);
    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong. Try again.');
    }
  }

  return (
    <>
      <div className="flex flex-col px-5 pb-40 gap-6">
        <div className="flex flex-wrap gap-3">
          {contacts.map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-2 w-16">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColorClasses(c.id)}`}>
                {getInitials(c.name)}
              </div>
              <span className="text-xs text-text truncate w-full text-center">{c.name}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('even')}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              mode === 'even' ? 'bg-border border-border-strong text-text' : 'bg-transparent border-border text-muted'
            }`}
          >
            Split evenly
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              mode === 'custom' ? 'bg-border border-border-strong text-text' : 'bg-transparent border-border text-muted'
            }`}
          >
            Custom amounts
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold mb-4">Split Amount</p>

          <label className="text-xs text-sec mb-1 block">Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dinner"
            className="w-full bg-transparent border-b border-border py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-border-strong mb-5"
          />

          {mode === 'even' ? (
            <>
              <label className="text-xs text-sec mb-1 block">Price</label>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-text">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent border-b border-border py-1 text-3xl font-bold text-text placeholder-muted focus:outline-none focus:border-border-strong"
                />
              </div>

              {perPersonDisplay && (
                <p className="text-sm text-muted mt-3">
                  ${Number(totalAmount).toFixed(2)} / {participantCount} = ${perPersonDisplay} per person
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text">{c.name}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={customAmounts[c.id] ?? ''}
                    onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="0.00"
                    className="w-24 bg-surface border border-border rounded-lg px-2 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-border-strong"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-danger-bg">{error}</p>}
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-20 bg-bg/95 backdrop-blur-sm border-t border-border px-5 pt-3 pb-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full bg-border border border-border-strong rounded-lg py-3 text-sm font-medium text-text disabled:opacity-40"
        >
          {submitting ? 'Splitting…' : 'Split'}
        </button>
      </div>
    </>
  );
}