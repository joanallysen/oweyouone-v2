'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ initialName }: { initialName: string }) {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSaved(false);

        const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        });

        if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
        }

        setSaved(true);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xs mt-4">
        <label className="text-sm text-gray-600">Name</label>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        {error && <p className="text-red-600 text-sm m-0">{error}</p>}
        {saved && <p className="text-green-600 text-sm m-0">Saved!</p>}
        <button type="submit" className="py-2.5 rounded-md bg-gray-900 text-white text-sm">
            Save
        </button>
        </form>
    );
}