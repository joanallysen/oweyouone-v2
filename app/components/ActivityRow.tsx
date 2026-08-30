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

  // other party (receiver), the one affected by the activity.
  /*
    if item.payer_id == sessionUserId 
      return item.borrowed_id
    else 
      return item.payer_id
  */
  const otherPartyId = item.receiver_id;
  const otherPartyName = item.receiver_name;

  const description = describeActivity({
    sessionUserId,
    actorId: item.actor_id,
    actorName: item.actor_name,
    receiverId: item.receiver_id,
    receiverName: item.receiver_name,
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
        {/* the actor avatar. */}
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

/*
actor me payer me borrower david
me -> david (green)
actor -> receiver (borrower david so green)

actor me payer david borrower me
me -> david (red)
actor -> receiver (borrower me so red)

actor david payer me borrower david
david -> me (green)
actor -> receiver (borrower david so green)

actor david payer david borrower me
david -> me (red)
actor -> receiver (borrowed me so red)

actor id
receiver id
borrower id
*/