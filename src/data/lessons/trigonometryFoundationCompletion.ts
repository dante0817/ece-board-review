import type {LearnLesson} from '../../domain/learn/lessonTypes';
import lessonData from './trigonometryFoundationCompletion.json';
/** 14 original draft lessons completing Foundations topics 03–04.
 * No study outcomes imply independent editorial certification.
 */
export const TRIGONOMETRY_FOUNDATION_COMPLETION_LESSONS = lessonData as unknown as Record<string,LearnLesson>;
export const TRIGONOMETRY_FOUNDATION_COMPLETION_IDS = Object.keys(TRIGONOMETRY_FOUNDATION_COMPLETION_LESSONS);
