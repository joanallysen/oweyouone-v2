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
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M0 18v-1.575q0-1.075 1.1-1.75T4 14q.325 0 .625.013t.575.062q-.35.525-.525 1.1t-.175 1.2V18zm6 0v-1.625q0-.8.438-1.463t1.237-1.162T9.588 13T12 12.75q1.325 0 2.438.25t1.912.75t1.225 1.163t.425 1.462V18zm13.5 0v-1.625q0-.65-.162-1.225t-.488-1.075q.275-.05.563-.062T20 14q1.8 0 2.9.663t1.1 1.762V18zM4 13q-.825 0-1.412-.587T2 11q0-.85.588-1.425T4 9q.85 0 1.425.575T6 11q0 .825-.575 1.413T4 13m16 0q-.825 0-1.412-.587T18 11q0-.85.588-1.425T20 9q.85 0 1.425.575T22 11q0 .825-.575 1.413T20 13m-8-1q-1.25 0-2.125-.875T9 9q0-1.275.875-2.137T12 6q1.275 0 2.138.863T15 9q0 1.25-.862 2.125T12 12"/></svg>
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
        <p className={`text-sm ${amountColorClass({ sessionUserId, borrowerId: item.borrower_id, payerId: item.payer_id, splitId: item.split_id })}`}>
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