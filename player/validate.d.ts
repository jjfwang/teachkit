// TypeScript definitions for player/validate.js — animath spec v0.1 validator.
// Returns an array of error strings; empty array = valid.
export function validateSpec(spec: unknown): string[];
export function validateSlides(spec: unknown): string[];
export function validateWorksheet(spec: unknown): string[];
export function validateExitTicket(spec: unknown): string[];
export function validateNotes(spec: unknown): string[];
export function validateScript(spec: unknown): string[];
export function validateLessonPlan(spec: unknown): string[];
export function validateScaffolds(spec: unknown): string[];
export function validateDiagnostics(spec: unknown): string[];
export function validateWorkedExamples(spec: unknown): string[];
export function validateQuizBank(spec: unknown): string[];
export function validateRevision(spec: unknown): string[];
export function validateOrganisers(spec: unknown): string[];
export function validateGlossary(spec: unknown): string[];
export function validateFeedback(spec: unknown): string[];
export function validateSummative(spec: unknown): string[];
export function validateScheme(spec: unknown): string[];
export function validateGuide(spec: unknown): string[];
export function validatePackMetadata(metadata: unknown): string[];
// Syllabus-known subjects; validateSpec accepts any non-empty subject string.
export const SUBJECTS: string[];
