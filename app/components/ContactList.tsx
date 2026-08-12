'use client';

import { useState } from 'react';
import Link from 'next/link';

// most of this are string causee typscript problem ig
export type Contact = {
  id: number;
  email: string;
  name: string | null;
  i_owe: string;
  they_owe: string;
  net: string;
};

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState('');

  const filtered = contacts.filter((c) => {
    const target = (c.name || c.email).toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  return (
    <div className="flex flex-col">
      <div className="px-5 mb-2">
        <input
          type="text"
          placeholder="Search contacts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-border-strong"
        />
      </div>

      <div className="flex flex-col px-2">
        {filtered.length === 0 && (
          <p className="text-muted px-3 py-6 text-sm">
            {contacts.length === 0 ? 'No contacts yet. Add one to get started.' : 'No matches.'}
          </p>
        )}

        {filtered.map((c) => {
          const net = Number(c.net);
          return (
            <Link
              key={c.id}
              href={`/contacts/${c.id}`}
              className="flex items-center justify-between px-3 py-4 rounded-lg active:bg-surface transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full bg-border flex items-center justify-center text-sm text-text">
                  {(c.name || c.email)[0].toUpperCase()}
                </div>
                <span className="truncate text-sm">{c.name || c.email}</span>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-sec uppercase tracking-wide">I owe</span>
                  <span className="text-sm text-owe">${Number(c.i_owe).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-sec uppercase tracking-wide">They owe</span>
                  <span className="text-sm text-owed">${Number(c.they_owe).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-sec uppercase tracking-wide">Net</span>
                  <span className={`text-sm font-semibold ${net >= 0 ? 'text-owed' : 'text-owe'}`}>
                    {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
                  </span>
                </div>
                <span className="text-muted">›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}