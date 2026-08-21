export function getInitials(name:string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic color per user, independent of the owe/owed semantic tokens
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
}

export function describeActivity(params: {
  sessionUserId: number;
  actorId: number;
  actorName: string;
  borrowerId: number;
  borrowerName: string;
  amount: string;
  action: ActivityAction;
}) {
  const { sessionUserId, actorId, actorName, borrowerId, borrowerName, amount, action} = params;
  const actorLabel = actorId === sessionUserId ? 'You' : actorName;
  const borrowerLabel = borrowerId === sessionUserId ? 'You borrowed' : `${borrowerName} borrowed`;
  const verb = VERB[action]; 
  return `${actorLabel} ${verb} '${borrowerLabel} $${Number(amount).toFixed(2)}'`;
}

// color: red if session user is the borrower on this expense, green if lender
export function amountColorClass(params: { sessionUserId: number; borrowerId: number }) {
  return params.sessionUserId === params.borrowerId ? 'text-owe' : 'text-owed';
}
