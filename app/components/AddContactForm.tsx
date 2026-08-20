'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddContactForm({onClose}: {onClose: () => void;}) {

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
    router.refresh();
  }

  return (
    <>
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={onClose}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
                onClick={onClose}
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
    </>
  );
}