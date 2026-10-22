// TypeScript definitions for generator/build_lesson_plan_prompt.js - animath lesson plan prompt builder.
export interface LessonPlanMisconceptionBeat {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface LessonPlanTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: LessonPlanMisconceptionBeat;
}
export interface LessonPlanPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  transitions?: LessonPlanTransition[];
  workedExample?: string;
}
export interface LessonPlanPrompts {
  system: string;
  user: string;
}
export function buildLessonPlanPrompts(opts: LessonPlanPromptOptions): LessonPlanPrompts;
export const LESSON_PLAN_SYSTEM_TEMPLATE: string;
// Trimmed water-cycle lesson plan (issue #1215): compact JSON string of
// a hand-authored plan whose activities sum exactly to its duration.
export const WATER_CYCLE_LESSON_PLAN_EXEMPLAR: string;
