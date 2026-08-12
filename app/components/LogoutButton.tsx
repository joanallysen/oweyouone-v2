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
      className="w-full text-left bg-surface border border-danger-bg text-owe rounded-lg px-4 py-3 text-sm"
    >
      Log Out
    </button>
  );
}