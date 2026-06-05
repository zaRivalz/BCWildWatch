// Compact "12 min ago" style relative timestamps for report feeds and tables.
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diffMs = Date.now() - then;
  if (diffMs < 0) return 'just now';

  const min = Math.round(diffMs / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;

  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;

  const days = Math.round(hr / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Date(iso).toLocaleDateString();
}
