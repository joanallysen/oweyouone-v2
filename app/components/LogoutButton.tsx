'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left bg-[#16161A] border border-[#3A1F1F] text-[#F87171] rounded-lg px-4 py-3 text-sm"
    >
      Log Out
    </button>
  );
}