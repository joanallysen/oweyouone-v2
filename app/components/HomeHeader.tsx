'use client';

import { useState } from 'react';
import AddContactForm from '@/app/components/AddContactForm';

export default function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm flex justify-between items-center px-5 py-4 border-b border-border">
      <div className="font-bold text-lg">
        OweYouOne <span className="text-xs text-sec font-normal">v.2</span>
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setOpen(true)}
          aria-label="Add contact"
          className="text-text"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
        </button>

        {open && (
          <AddContactForm onClose={() => setOpen(false)} />
        )}
      </div>
    </div>
  );
}