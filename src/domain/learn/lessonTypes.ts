/** Author-authored, versioned content. Reading is NOT scored assessment evidence. */
export type LessonStatus = 'summary' | 'draft' | 'reviewed' | 'verified';
export type LessonBlock =
  | { id: string; type:'paragraph' | 'definition' | 'note'; text:string }
  | { id: string; type:'formula'; latex:string; description?:string }
  | { id: string; type:'diagram'; diagram:'radian'|'right-triangle'|'unit-circle'|'sine-graph'|'tangent-graph'|'reciprocal-graph'|'transform-graph'|'inverse-graphs'|'oblique-triangle'|'ssa-ambiguity'|'vector-components'|'vector-cross-product'|'complex-plane'|'roots-of-unity'|'polar-grid'|'parametric-circle'|'wave-sinusoid'|'wave-damped'|'wave-phasor'|'advanced-sphere'|'advanced-hyperbola'; caption:string }
  | { id: string; type:'worked-example'; title:string; problem:string; strategy?:string; steps:string[]; check:string; takeaway?:string }
  | { id: string; type:'checkpoint'; prompt:string; answer:string; explanation?:string };
export interface LessonSection {
  id:string; title:string; objectiveIds:string[]; blocks:LessonBlock[];
}
export interface LearnLesson {
  id:string; title:string; summary:string; contentVersion:number;
  status:LessonStatus; sections:LessonSection[];
}
export interface TopicLaunchIntent {
  topicId:string;
  view:'learn'|'practice'|'quiz'|'review'|'mistakes'|'progress';
  sectionId?:string;
  /** Algebra catalog module, distinct from broad canonical chapter topic. */
  catalogModuleId?:string;
  catalogModuleName?:string;
  source?:'catalog'|'reader'|'queue'|'search';
  nonce:number;
}
