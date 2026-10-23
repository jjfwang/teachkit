// TypeScript definitions for generator/build_worked_examples_prompt.js - animath worked-example set prompt builder.
export interface WorkedExamplesMisconception {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface WorkedExamplesTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: WorkedExamplesMisconception;
}
export interface WorkedExamplesPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  transitions?: WorkedExamplesTransition[];
  workedExample?: string;
}
export interface WorkedExamplesPrompts {
  system: string;
  user: string;
}
export function buildWorkedExamplesPrompts(opts: WorkedExamplesPromptOptions): WorkedExamplesPrompts;
export const WORKED_EXAMPLES_SYSTEM_TEMPLATE: string;
// Hand-authored fractions worked-example set (issue #1248): compact JSON
// string of a set whose complete example annotates every step, whose
// faded example withholds its final step as a suffix, and whose paired
// problem carries its teacher-key solution, validating clean against
// validateWorkedExamples.
export const FRACTIONS_WORKED_EXAMPLES_EXEMPLAR: string;
