// TypeScript definitions for generator/build_scheme_prompt.js - animath scheme of work prompt builder.
export interface SchemePromptOptions {
  level?: string;
  subject: string;
  /** The unit title the scheme covers. */
  unitTitle?: string;
  /** The term the scheme runs in. */
  term?: string;
  /** At least 2 topic slugs, in teaching (syllabus) order. */
  topics: string[];
  focus?: string;
  workedExample?: string;
}
export interface SchemePrompts {
  system: string;
  user: string;
}
export function buildSchemePrompts(opts: SchemePromptOptions): SchemePrompts;
export const SCHEME_SYSTEM_TEMPLATE: string;
// Hand-authored primary math Term 2 scheme (issue #1290): compact
// JSON string sequencing fractions, decimals and percentage in
// syllabus order, validating clean against validateScheme.
export const PRIMARY_MATH_SCHEME_EXEMPLAR: string;
