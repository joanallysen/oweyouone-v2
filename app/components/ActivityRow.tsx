import { getInitials, avatarColorClasses, describeActivity, amountColorClass } from '@/app/lib/activity';

function InitialsAvatar({ userId, name, isYou }: { userId: number; name: string; isYou?: boolean }) {
    return (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColorClasses(userId)}`}>
        {isYou ? 'YOU' : getInitials(name)}
        </div>
    );
}

function GroupAvatar() {
    return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold bg-border text-sec">
        👥
        </div>
    );
}

export default function ActivityRow({ sessionUserId, item }: { sessionUserId: number; item: any }) {
  const isActorSession = item.actor_id === sessionUserId;
  const isSplit = item.split_id != null;

  const otherPartyId = item.payer_id === sessionUserId ? item.borrower_id : item.payer_id;
  const otherPartyName = item.payer_id === sessionUserId ? item.borrower_name : item.payer_name;

  const description = describeActivity({
    sessionUserId,
    actorId: item.actor_id,
    actorName: item.actor_name,
    borrowerId: item.borrower_id,
    borrowerName: item.borrower_name,
    amount: item.amount,
    action: item.action,
    name: item.expense_name,
    splitId: item.split_id,
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
      <div className="flex items-center gap-1 shrink-0">
        <InitialsAvatar
          userId={isActorSession ? sessionUserId : item.actor_id}
          name={isActorSession ? 'You' : item.actor_name}
          isYou={isActorSession}
        />
        <span className="text-sec text-xs">→</span>
        {isSplit ? (
          <GroupAvatar />
        ) : (
          <InitialsAvatar userId={otherPartyId} name={otherPartyName} isYou={otherPartyId === sessionUserId} />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-text font-medium truncate">{item.expense_name}</p>
        <p className={`text-sm truncate ${amountColorClass({ sessionUserId, borrowerId: item.borrower_id, payerId: item.payer_id, splitId: item.split_id })}`}>
          {description}
        </p>
      </div>
    </div>
  );
}