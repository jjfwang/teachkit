// TypeScript definitions for generator/build_quiz_bank_prompt.js - animath quiz bank prompt builder.
export interface QuizBankEntry {
  wrongTurn: string;
  why: string;
  correctTurn: string;
}
export interface QuizBankTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
  misconception?: QuizBankEntry;
}
export interface QuizBankPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  facet?: string;
  /** Resolved misconception bank entry; wins over the bank lookup when supplied. */
  bank?: QuizBankEntry;
  transitions?: QuizBankTransition[];
  workedExample?: string;
}
export interface QuizBankPrompts {
  system: string;
  user: string;
}
export function buildQuizBankPrompts(opts: QuizBankPromptOptions): QuizBankPrompts;
export const QUIZ_BANK_SYSTEM_TEMPLATE: string;
// Hand-authored fractions quiz bank (issue #1255): compact JSON string
// of a bank whose choice items are coded to the fractions bank
// wrongTurn, validating clean against validateQuizBank.
export const FRACTIONS_QUIZ_BANK_EXEMPLAR: string;
