/** v10.18: one fail-closed policy for in-app instructional aids. This is not remote proctoring. */
export type AssessmentSessionStatus = 'inactive'|'study-active'|'strict-active'|'finalizing'|'finalized'|'interrupted';
export type InstructionalAid = 'calculator'|'tutor'|'voice-tutor'|'voice-commands'|'formula'|'topic-drawer'|'navigation';
export type DisclosureContext = 'unanswered'|'after-answer'|'skills-center';
export interface AssessmentSession {
  status: AssessmentSessionStatus;
  attemptId: string|null;
  startedAt: string|null;
  endedAt?: string;
  endReason?: 'submitted'|'timeout'|'exited';
}
export const INACTIVE_ASSESSMENT: AssessmentSession = Object.freeze({status:'inactive',attemptId:null,startedAt:null});
export function strictAssessmentLocked(session: AssessmentSession): boolean {
  return session.status === 'strict-active' || session.status === 'finalizing';
}
export function canAccessAid(session: AssessmentSession, aid: InstructionalAid): boolean {
  if(strictAssessmentLocked(session)) return false;
  // Other learning paths retain full access. Study-mode disclosures are recorded separately.
  return true;
}
export function canRevealCalculator(session: AssessmentSession, disclosure?: DisclosureContext): boolean {
  // Explicit post-answer/skills-centre authorization is mandatory. Omission means LOCKED.
  return (disclosure === 'after-answer' || disclosure === 'skills-center') && canAccessAid(session,'calculator');
}
export function startAssessment(session: AssessmentSession, attemptId: string, mode:'study'|'strict', now:string):AssessmentSession {
  if(!attemptId || session.status==='study-active' || strictAssessmentLocked(session)) throw new Error('Assessment already active or missing attempt ID.');
  return {status:mode==='strict'?'strict-active':'study-active',attemptId,startedAt:now};
}
export function finishAssessment(session: AssessmentSession, reason:'submitted'|'timeout'|'exited', now:string):AssessmentSession {
  if(session.status!=='study-active' && session.status!=='strict-active' && session.status!=='finalizing') return session;
  return {...session,status:reason==='exited'?'interrupted':'finalized',endedAt:now,endReason:reason};
}
