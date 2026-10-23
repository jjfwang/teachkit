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
export interface OrganisersDefinition {
  term: string;
  meaning: string;
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
  /** Paired student-notes definitions the definition-based slot entries are drawn from. */
  definitions?: OrganisersDefinition[];
  /** Paired student-notes mechanism steps the step-based slot entries are drawn from. */
  mechanismSteps?: string[];
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
