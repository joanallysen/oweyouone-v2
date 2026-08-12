'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Activity, Split, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Contacts', icon: Users },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/split', label: 'Split', icon: Split },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-sm border-t border-border flex justify-around items-center z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1"
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.75}
              className={active ? 'text-text' : 'text-muted'}
            />
            <span className={`text-[10px] ${active ? 'text-text font-medium' : 'text-muted'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}