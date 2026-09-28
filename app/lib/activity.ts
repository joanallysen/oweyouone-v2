export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  'bg-violet-500/20 text-violet-300',
  'bg-sky-500/20 text-sky-300',
  'bg-amber-500/20 text-amber-300',
  'bg-pink-500/20 text-pink-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-orange-500/20 text-orange-300',
];

export function avatarColorClasses(userId: number): string {
  return AVATAR_PALETTE[userId % AVATAR_PALETTE.length];
}

type ActivityAction = 'created' | 'archived' | 'unarchived';

const VERB: Record<ActivityAction, string> = {
  created: 'added',
  archived: 'archived',
  unarchived: 'undid',
};

export function describeActivity(params: {
  sessionUserId: number;
  actorId: number;
  actorName: string;
  receiverId: number;
  receiverName: string;
  borrowerId: number;
  borrowerName: string;
  amount: string;
  action: ActivityAction;
  name: string;
  splitId: number | null;
}) {
  const { sessionUserId, actorId, actorName, action, name, splitId } = params;
  const actorLabel = actorId === sessionUserId ? 'You' : actorName;

  if (splitId) {
    return `${actorLabel} added '${name}'`;
  }

  const { borrowerId, borrowerName, amount } = params;
  const borrowerLabel = borrowerId === sessionUserId ? 'You borrowed' : `${borrowerName} borrowed`;
  const verb = VERB[action];
  return `${actorLabel} ${verb} '${borrowerLabel} $${Number(amount).toFixed(2)}'`;
}

// For a normal expense, session is always either payer or borrower, so
// comparing against borrowerId alone is enough. For a split, borrowerId
// on the joined row is just one arbitrary contact, not necessarily the
// viewer — payerId is the one field guaranteed identical across every
// sibling row, so that's what split rows must key off instead.
export function amountColorClass(params: {
  sessionUserId: number;
  borrowerId: number;
  payerId: number;
  splitId?: number | null;
}) {
  if (params.splitId) {
    return params.sessionUserId === params.payerId ? 'text-owed' : 'text-owe';
  }
  return params.sessionUserId === params.borrowerId ? 'text-owe' : 'text-owed';
}

type ActivityRow = {
    id: number;
    action: 'created' | 'archived' | 'unarchived';
    created_at: Date;
    actor_id: number;
    receiver_id: number | null;
    split_id: number | null;
    expense_id: number;
    expense_name: string;
    amount: string | number;
    payer_id: number;
    borrower_id: number;
    actor_name: string;
    receiver_name: string | null;
    payer_name: string;
    borrower_name: string;
};

function activityDay(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function collapseActivity(rows: any[]): any[] {
    const result: ActivityRow[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
        // Created is always meaningful, so keep it.
        if (row.action === 'created') {
            result.push(row);
            continue;
        }

        // Group archive/unarchive events by:
        // expense + actor + calendar day
        const day = activityDay(row.created_at);
        const key = `${row.expense_id}:${row.actor_id}:${day}`;

        // Because rows are newest -> oldest, we've already
        // processed the newest event for this group.
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);

        // Only the newest archive/unarchive matters.
        // Archived = show it.
        // Unarchived = hide the whole cycle.
        if (row.action === 'archived') {
            result.push(row);
        }
    }

    return result;
}

