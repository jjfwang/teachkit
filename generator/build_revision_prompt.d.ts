// TypeScript definitions for generator/build_revision_prompt.js - animath revision prompt builder.
export interface RevisionEntry {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface RevisionTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: RevisionEntry;
}
export interface RevisionPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  /** Resolved misconception bank entry; wins over the bank lookup when supplied. */
  bank?: RevisionEntry;
  transitions?: RevisionTransition[];
  workedExample?: string;
}
export interface RevisionPrompts {
  system: string;
  user: string;
}
export function buildRevisionPrompts(opts: RevisionPromptOptions): RevisionPrompts;
export const REVISION_SYSTEM_TEMPLATE: string;
// Hand-authored fractions revision set (issue #1268): compact JSON
// string of a set derived verbatim from the fractions quiz bank and
// notes, validating clean against validateRevision.
export const FRACTIONS_REVISION_EXEMPLAR: string;
