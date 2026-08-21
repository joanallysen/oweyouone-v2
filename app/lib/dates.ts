export function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions =
    d.getFullYear() !== currentYear
      ? { day: '2-digit', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: 'long' };
  return d.toLocaleDateString('en-US', options);
}

export function dateKey(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}