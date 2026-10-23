export const RECENT_TOPICS_STORAGE_KEY = 'ece_recent_topics_list_v1';
export const RECENT_TOPICS_EVENT = 'ece_recent_topics_updated';

// Default initial high-yield topics from the ECE Board syllabus
export const DEFAULT_RECENT_TOPIC_IDS = [
  'top-alg-fractions', // Algebraic Fractions / Rational Expressions
  'top-linear-eq', // Linear Equations
  'top-quadratics', // Quadratic Equations & Roots
  'top-laws-exponents', // Laws of Exponents
  'top-logarithms', // Logarithms & Properties
];

export function getRecentTopicIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_TOPICS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_RECENT_TOPIC_IDS;
}

export function recordRecentTopicId(topicId: string): void {
  if (!topicId) return;
  try {
    const current = getRecentTopicIds();
    const updated = [topicId, ...current.filter((id) => id !== topicId)].slice(0, 8);
    localStorage.setItem(RECENT_TOPICS_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(RECENT_TOPICS_EVENT));
    }
  } catch {
    // ignore
  }
}
