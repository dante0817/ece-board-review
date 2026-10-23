/** v10.27: a previously opened help tab never carries into another question,
 * attempt or disclosure context. The renderer must fail closed on every mismatch. */
export type CalculatorTab = 'closed' | 'shortcut' | 'verify';
export interface CalculatorTabState { scopeKey: string; tab: CalculatorTab }
export interface CalculatorTabContext {
  questionId: string;
  questionFingerprint?: string;
  assessmentStatus: string;
  attemptId: string | null;
  disclosure?: string;
  techniqueId?: string;
}
export function calculatorDisclosureScope(context: CalculatorTabContext): string {
  // JSON avoids delimiter collisions when identifiers contain punctuation.
  return JSON.stringify([context.questionId, context.questionFingerprint ?? '',
    context.assessmentStatus, context.attemptId, context.disclosure ?? '', context.techniqueId ?? '']);
}
export function visibleCalculatorTab(state: CalculatorTabState, scopeKey: string, permitted: boolean): CalculatorTab {
  return permitted && state.scopeKey === scopeKey && (state.tab === 'shortcut' || state.tab === 'verify')
    ? state.tab : 'closed';
}
export function selectCalculatorTab(scopeKey: string, tab: 'shortcut' | 'verify', permitted: boolean): CalculatorTabState | null {
  return permitted ? {scopeKey, tab} : null;
}
