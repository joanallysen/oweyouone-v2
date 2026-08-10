'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';

export default function EditProfilePage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setName(data?.name || '');
        setBio(data?.bio || '');
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setError('');
    setSaving(true);

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/profile');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDEF] flex items-center justify-center">
        <p className="text-[#8B8B93] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-[#0B0B0E] text-[#EDEDEF]">
      <div className="sticky top-0 z-10 bg-[#0B0B0E]/95 backdrop-blur-sm flex items-center gap-3 px-5 py-4 border-b border-[#232328]">
        <button onClick={() => router.push('/profile')} aria-label="Back" className="text-[#EDEDEF]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="font-bold text-lg">
          OweYouOne <span className="text-xs text-[#8B8B93] font-normal">v.2</span>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 py-8">
        <div className="w-24 h-24 rounded-full bg-[#232328] flex items-center justify-center text-2xl">
          {(name || '?')[0].toUpperCase()}
        </div>
        <h1 className="text-xl font-bold mt-4">{name}</h1>
      </div>

      <div className="px-5 flex flex-col gap-4 h-screen flex-1">
        <div>
          <label className="text-sm text-[#8B8B93] block mb-2">Change Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#16161A] border border-[#232328] rounded-lg px-4 py-3 text-sm text-[#EDEDEF] focus:outline-none focus:border-[#5C5C63]"
          />
        </div>

        <div>
          <label className="text-sm text-[#8B8B93] block mb-2">Change Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full bg-[#16161A] border border-[#232328] rounded-lg px-4 py-3 text-sm text-[#EDEDEF] focus:outline-none focus:border-[#5C5C63] resize-none"
          />
        </div>

        {error && <p className="text-[#F87171] text-sm">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#EDEDEF] text-[#0B0B0E] rounded-lg py-3 text-sm font-medium disabled:opacity-50 mt-auto"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}