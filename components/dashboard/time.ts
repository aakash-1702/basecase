const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

/** "Just now" / "3h ago" / "Yesterday" / "4d ago" */
export function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / HOUR);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/** "Due today" / "1 day overdue" / "3 days overdue" */
export function getDueLabel(date: Date | string | null | undefined): string {
  if (!date) return "Due now";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / DAY);
  if (days <= 0) return "Due today";
  if (days === 1) return "1 day overdue";
  return `${days} days overdue`;
}
