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

    setLoading(false);

    if (!res.ok) {
    const data = await res.json();
    setError(data.error || 'Something went wrong');
    return;
    }

    setEmail('');
    setOpen(false);
    router.refresh();
}

return (
    <>
    <button
        onClick={() => setOpen(true)}
        style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '14px 20px',
        borderRadius: '999px',
        border: 'none',
        background: '#111',
        color: '#fff',
        fontSize: '15px',
        cursor: 'pointer',
        }}
    >
        + Add Contact
    </button>

    {open && (
        <div
        style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
        onClick={() => setOpen(false)}
        >
        <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '300px',
            }}
        >
            <h2 style={{ margin: 0, fontSize: '18px' }}>Add Contact</h2>
            <input
            type="email"
            placeholder="Their email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            />
            {error && <p style={{ color: 'red', margin: 0, fontSize: '14px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setOpen(false)}>
                Cancel
            </button>
            <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
            </button>
            </div>
        </form>
        </div>
    )}
    </>
);
}