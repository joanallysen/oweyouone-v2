/*
    remainder coin goes to first payer
    example: splitEvenly(1000, 3) -> [334, 333, 333]
 */
export function splitEvenly(totalCents: number, parts: number): number[] {
    if (parts <= 0) throw new Error('parts must be greater than 0');
    const base = Math.floor(totalCents / parts);
    const remainder = totalCents - base * parts;

    const shares: number[] = [];

    for (let i =0; i<parts ; i++){
        if (i < remainder){
            shares.push(base + 1);
        } else{
            shares.push(base);
        }
    }
    return shares
}

/*
split a dollar amount across payer and contacts, make it back to dollar
result look like [33.33, 33.33]

*/
export function splitEvenlyAmongContacts(totalAmount: string, contactCount: number): string[] {
    const totalCents = Math.round(Number(totalAmount) * 100);
    const participantCount = contactCount + 1; // with the payer, but payer wont show up
    const allShares = splitEvenly(totalCents, participantCount);
    // drop one share for the payer, the rest belong to the contacts.
    return allShares.slice(1).map((cents) => (cents / 100).toFixed(2));
}