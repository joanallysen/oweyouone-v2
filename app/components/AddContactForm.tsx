'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddContactForm({onClose}: {onClose: () => void;}) {

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setShow(true);
  }, []);


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
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-150 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm mx-4 p-6 bg-bg border border-border rounded-2xl shadow-2xl flex flex-col gap-4 transition-all duration-200 ${
          show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        <div>
          <h2 className="text-lg font-semibold text-text">Add Contact</h2>
          <p className="text-sm text-sec mt-1">Enter the email of the person you'd like to add.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            type="email"
            placeholder="Their email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-bg/40 focus:border-accent-bg transition-colors"
          />
          {error && <p className="text-owe text-sm">{error}</p>}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm text-sec rounded-lg hover:bg-border/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-accent-bg text-accent rounded-lg font-medium shadow-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}