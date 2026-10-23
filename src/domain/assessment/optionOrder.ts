import type { Choice } from './types';
/** Fisher-Yates shuffle of IDs, keeping authored answer keys unchanged. */
export function shuffledOptionIds<T extends Choice>(options: readonly T[], preserveOrder = false, random: () => number = Math.random): string[] {
  const ids = options.map(option => option.id);
  if (new Set(ids).size !== ids.length || !ids.length) throw new Error('Option IDs must be unique and nonempty.');
  if (preserveOrder) return ids;
  for (let i = ids.length - 1; i > 0; i--) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error('Invalid shuffle random source.');
    const j = Math.floor(sample * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
export function orderedChoices<T extends Choice>(options: readonly T[], ids: readonly string[]): T[] {
  if (ids.length !== options.length || new Set(ids).size !== ids.length) throw new Error('Invalid saved option order.');
  const lookup = new Map(options.map(option => [option.id, option]));
  return ids.map(id => {
    const choice = lookup.get(id);
    if (!choice) throw new Error('Saved option order contains an unknown choice.');
    return choice;
  });
}
/** Stable question order within a live attempt even when React rerenders. */
export function buildOptionOrders(items: readonly { id: string; options: Choice[]; preserveOptionOrder?: boolean }[]): Record<string, string[]> {
  const orders: Record<string, string[]> = {};
  for (const item of items) {
    if (orders[item.id]) throw new Error('Duplicate question ID in assessment.');
    orders[item.id] = shuffledOptionIds(item.options, item.preserveOptionOrder);
  }
  return orders;
}

/** Keep authored positions where explanations or answers explicitly depend on A/B/C/D or "above". */
export function hasPositionSensitiveLanguage(...texts: Array<string | undefined>): boolean {
  return texts.some(text => /\boptions?\s+[A-D](?:\s*[,/\s]\s*[A-D])*\b|\bchoices?\s+[A-D]\b|\b(?:all|none) of the above\b|\bboth [A-D] and [A-D]\b|\b[A-D] and [A-D] only\b/i.test(text ?? ''));
}
