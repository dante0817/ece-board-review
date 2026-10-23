import type { LearningStatus, StatusField, ProgressSnapshot, CurriculumTopic, TrigBindingMap } from './types';

export const EMPTY_STATUS: Readonly<LearningStatus> = Object.freeze({read1: false, read2: false, read3: false, mastered: false, review: false});
export function normalizeStatus(value: Partial<LearningStatus> | null | undefined): LearningStatus {
  return {read1: value?.read1 === true,read2: value?.read2 === true,read3: value?.read3 === true,mastered: value?.mastered === true,review: value?.review === true};
}
// v10.35.1 reading marks are cumulative. Mastered and Needs Review are independent.
export function transitionStatus(previous: LearningStatus, field: StatusField, enabled: boolean): LearningStatus {
  const next = {...normalizeStatus(previous),[field]:enabled};
  if (field === 'read2' && enabled) next.read1=true;
  if (field === 'read3' && enabled) {next.read1=true; next.read2=true;}
  if (field === 'read1' && !enabled) {next.read2=false;next.read3=false;}
  if (field === 'read2' && !enabled) next.read3=false;
  return next;
}
export function topicStats(topic: CurriculumTopic, progress: ProgressSnapshot, bindings: TrigBindingMap) {
  const all=topic.subtopics;
  const mapped=all.filter(s=>bindings[s.id]?.lessonAvailable === true);
  const mastered=mapped.filter(s=>progress[s.id]?.mastered === true).length;
  const review=all.filter(s=>progress[s.id]?.review === true).length;
  return {defined:all.length, available:mapped.length, mastered, review, coverage:mapped.length/all.length, mastery:mapped.length ? mastered/mapped.length : 0};
}
export function overallStats(topics: CurriculumTopic[], progress: ProgressSnapshot, bindings: TrigBindingMap) {
  const core=topics.filter(t=>!t.optional).flatMap(t=>t.subtopics);
  const available=core.filter(s=>bindings[s.id]?.lessonAvailable === true);
  return {coreTopics:topics.filter(t=>!t.optional).length,optionalTopics:topics.filter(t=>t.optional).length,
    definedCore:core.length,availableCore:available.length,
    selfMasteredAvailable:available.filter(s=>progress[s.id]?.mastered===true).length,
    needsReview:core.filter(s=>progress[s.id]?.review === true).length};
}
