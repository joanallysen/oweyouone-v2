'use client';

// this file is no longer used and can be deleeted

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
    { href: '/', label: 'Contacts', icon: ContactsIcon },
    { href: '/activity', label: 'Activity', icon: ActivityIcon },
    { href: '/split', label: 'Split', icon: SplitIcon },
    { href: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function Footer() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-2 bg-white border-t border-gray-200">
        {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
            <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 text-[11px] ${
                active ? 'text-gray-900' : 'text-gray-400'
                }`}
            >
                <Icon active={active} />
                {label}
            </Link>
            );
        })}
        </nav>
    );
}

function ContactsIcon({ active }: { active: boolean }) {
    return (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        className={active ? 'stroke-gray-900' : 'stroke-gray-400'}
    >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
    );
}

function ActivityIcon({ active }: { active: boolean }) {
    return (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        className={active ? 'stroke-gray-900' : 'stroke-gray-400'}
    >
        <polyline points="3 12 8 12 10 6 14 18 16 12 21 12" />
    </svg>
    );
    }

    function SplitIcon({ active }: { active: boolean }) {
    return (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        className={active ? 'stroke-gray-900' : 'stroke-gray-400'}
    >
        <path d="M6 3v18M18 3v18M6 12h12" />
    </svg>
    );
}

function ProfileIcon({ active }: { active: boolean }) {
    return (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        className={active ? 'stroke-gray-900' : 'stroke-gray-400'}
    >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
    );
}