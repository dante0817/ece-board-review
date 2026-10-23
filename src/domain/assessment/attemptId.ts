export function makeAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
