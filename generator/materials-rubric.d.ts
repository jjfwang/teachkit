// TypeScript definitions for generator/materials-rubric.js — materials
// rubric with reading-age heuristic (slice 2 of #1235). Scores student-
// facing text only; teacher-only text is never measured. The reading age
// is a heuristic signal, never a gate.
export interface MaterialDimension {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  note: string;
}
export interface MaterialStats {
  words: number;
  sentences: number;
  syllables: number;
  fleschEase: number;
  gradeLevel: number;
  readingAgeLow: number;
  readingAgeHigh: number;
}
export interface MaterialScore {
  score: number;
  maxScore: number;
  dimensions: MaterialDimension[];
  kind: string | null;
  stats: MaterialStats | null;
}
export interface ExtractedStudentText {
  kind: string | null;
  texts: string[];
  fieldsUsed: string[];
}
export function scoreMaterial(material: Record<string, unknown> | null): MaterialScore;
export function extractStudentText(material: Record<string, unknown> | null): ExtractedStudentText;
export interface ReadingAgeResult {
  words: number;
  sentences: number;
  syllables: number;
  ease: number;
  grade: number;
  ageLow: number;
  ageHigh: number;
  score: number;
  note: string;
}
export interface MaterialsRubricInternals {
  countSyllables(word: string): number;
  readingAge(texts: string[]): ReadingAgeResult | null;
}
export const INTERNALS: MaterialsRubricInternals;
