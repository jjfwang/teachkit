// TypeScript definitions for generator/build_organisers_prompt.js - animath glossary prompt builder.
export interface GlossaryEntry {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface GlossaryTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: GlossaryEntry;
}
export interface GlossaryDefinition {
  term: string;
  meaning: string;
}
export interface GlossaryPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  /** Resolved misconception bank entry; wins over the bank lookup when supplied. */
  bank?: GlossaryEntry;
  transitions?: GlossaryTransition[];
  /** Paired student-notes definitions every entry term and meaning is drawn from verbatim. */
  definitions?: GlossaryDefinition[];
  /** Paired student-notes mechanism steps an entry example may be drawn from verbatim. */
  mechanismSteps?: string[];
  /** Paired student-notes worked example an entry example may be drawn from verbatim. */
  workedExample?: string;
  /** Paired student-notes objectives an entry example may be drawn from verbatim. */
  objectives?: string[];
}
export interface GlossaryPrompts {
  system: string;
  user: string;
}
export function buildGlossaryPrompts(opts: GlossaryPromptOptions): GlossaryPrompts;
export const GLOSSARY_SYSTEM_TEMPLATE: string;
// Hand-authored fractions glossary (issue #1283): compact JSON string
// of a glossary derived verbatim from the fractions student notes,
// validating clean against validateGlossary.
export const FRACTIONS_GLOSSARY_EXEMPLAR: string;
