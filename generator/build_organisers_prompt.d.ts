// TypeScript definitions for generator/build_organisers_prompt.js - animath organisers prompt builder.
export interface OrganisersEntry {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface OrganisersTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: OrganisersEntry;
}
export interface OrganisersPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  /** Resolved misconception bank entry; wins over the bank lookup when supplied. */
  bank?: OrganisersEntry;
  transitions?: OrganisersTransition[];
  workedExample?: string;
}
export interface OrganisersPrompts {
  system: string;
  user: string;
}
export function buildOrganisersPrompts(opts: OrganisersPromptOptions): OrganisersPrompts;
export const ORGANISERS_SYSTEM_TEMPLATE: string;
// Hand-authored fractions organisers set (issue #1277): compact JSON
// string of a set derived verbatim from the fractions student notes,
// validating clean against validateOrganisers.
export const FRACTIONS_ORGANISERS_EXEMPLAR: string;
