/**
 * Returns a local-calendar date key in YYYY-MM-DD format without converting
 * through UTC. This keeps due/review dates aligned to the learner's local day.
 */
export const getLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatShortReviewDate = (dateKey: string | null | undefined): string => {
  if (!dateKey) return 'Not scheduled';
  const parsed = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateKey;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};

export const compareDateKeys = (a: string, b: string): number => a.localeCompare(b);
