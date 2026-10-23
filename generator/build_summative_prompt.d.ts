// TypeScript definitions for generator/build_summative_prompt.js - animath summative assessment prompt builder.
export interface SummativePromptOptions {
  level?: string;
  subject: string;
  /** The unit title the assessment covers. */
  unitTitle?: string;
  /** At least 2 topic slugs the unit spans. */
  topics: string[];
  focus?: string;
  workedExample?: string;
}
export interface SummativePrompts {
  system: string;
  user: string;
}
export function buildSummativePrompts(opts: SummativePromptOptions): SummativePrompts;
export const SUMMATIVE_SYSTEM_TEMPLATE: string;
// Hand-authored fractions unit summative (issue #1259): compact JSON
// string of an assessment spanning two topics, validating clean
// against validateSummative.
export const FRACTIONS_SUMMATIVE_EXEMPLAR: string;
