import type {LearnLesson} from '../../domain/learn/lessonTypes';
import lessons from './trigonometryVectors.json';
/** Eight original draft vector lessons. Independent editorial verification pending. */
export const TRIGONOMETRY_VECTORS_LESSONS = lessons as Record<string,LearnLesson>;
