'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddContactButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    if (!data.added) {
      setError('Already in your contacts');
      return;
    }

    setEmail('');
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Add contact" className="text-text">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-30"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border p-6 rounded-xl flex flex-col gap-3"
          >
            <h2 className="m-0 text-lg text-text">Add Contact</h2>
            <input
              type="email"
              placeholder="Their email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="bg-bg border border-border rounded-md px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-border-strong"
            />
            {error && <p className="text-owe m-0 text-sm">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm text-sec"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 text-sm bg-accent-bg text-accent rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}