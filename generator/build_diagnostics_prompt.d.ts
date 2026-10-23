// TypeScript definitions for generator/build_diagnostics_prompt.js - animath diagnostics prompt builder.
export interface DiagnosticsBankEntry {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface DiagnosticsTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: DiagnosticsBankEntry;
}
export interface DiagnosticsPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  /** Resolved misconception bank entry; wins over the bank lookup when supplied. */
  bank?: DiagnosticsBankEntry;
  transitions?: DiagnosticsTransition[];
  workedExample?: string;
}
export interface DiagnosticsPrompts {
  system: string;
  user: string;
}
export function buildDiagnosticsPrompts(opts: DiagnosticsPromptOptions): DiagnosticsPrompts;
export const DIAGNOSTICS_SYSTEM_TEMPLATE: string;
// Hand-authored fractions diagnostics (issue #1241): compact JSON string
// of a material whose every distractor is coded to the fractions bank
// wrongTurn with a teacher-only rationale, validating clean against
// validateDiagnostics.
export const FRACTIONS_DIAGNOSTICS_EXEMPLAR: string;
