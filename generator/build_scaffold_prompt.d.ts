// TypeScript definitions for generator/build_scaffold_prompt.js - animath scaffolds prompt builder.
export interface ScaffoldMisconceptionBeat {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface ScaffoldTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: ScaffoldMisconceptionBeat;
}
export interface ScaffoldDefinition {
  term: string;
  meaning: string;
}
export interface ScaffoldPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  transitions?: ScaffoldTransition[];
  /** Paired student-notes definitions; every word-bank term is drawn from these. */
  definitions?: ScaffoldDefinition[];
  /** Paired student-notes mechanism steps; the cloze is built from these. */
  mechanismSteps?: string[];
  workedExample?: string;
}
export interface ScaffoldPrompts {
  system: string;
  user: string;
}
export function buildScaffoldPrompts(opts: ScaffoldPromptOptions): ScaffoldPrompts;
export const SCAFFOLD_SYSTEM_TEMPLATE: string;
// Trimmed water-cycle scaffolds (issue #1231): compact JSON string of a
// hand-authored material whose three sets fade full, partial, minimal
// with non-increasing counts on every measure.
export const WATER_CYCLE_SCAFFOLD_EXEMPLAR: string;
