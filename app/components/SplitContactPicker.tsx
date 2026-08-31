'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInitials, avatarColorClasses } from '@/app/lib/activity';
import type { SplitContact } from '@/app/split/page';

export default function SplitContactPicker({ contacts }: { contacts: SplitContact[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const allSelected = selectedIds.length === contacts.length && contacts.length > 0;

  function toggle(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    setSelectedIds(allSelected ? [] : contacts.map((c) => c.id));
  }

  function handleContinue() {
    if (selectedIds.length < 2) return;
    router.push(`/split/amount?contacts=${selectedIds.join(',')}`);
  }

  return (
    <>
      <div className="flex flex-col px-5 pb-40">
        <div className="grid grid-cols-3 gap-3">
          {contacts.map((c) => {
            const selected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border px-2 py-4 ${
                  selected ? 'bg-border border-border-strong' : 'bg-surface border-border opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColorClasses(c.id)}`}>
                  {getInitials(c.name)}
                </div>
                <span className="text-xs text-text truncate w-full text-center">{c.name}</span>
              </button>
            );
          })}
        </div>

        {contacts.length === 0 && <p className="text-muted text-sm py-6">No contacts yet.</p>}
      </div>

      {contacts.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-20 bg-bg/95 backdrop-blur-sm border-t border-border px-5 pt-3 pb-4">
          <button type="button" onClick={selectAll} className="w-full text-sm font-medium text-text text-center mb-3">
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedIds.length < 2}
            className="w-full bg-border border border-border-strong rounded-lg py-3 text-sm font-medium text-text disabled:opacity-40 flex flex-col items-center"
          >
            <span>Continue</span>
            <span className="text-xs text-sec font-normal">
              {selectedIds.length} Contact{selectedIds.length === 1 ? '' : 's'} Selected
            </span>
          </button>
        </div>
      )}
    </>
  );
}