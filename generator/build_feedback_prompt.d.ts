// TypeScript definitions for generator/build_feedback_prompt.js - animath feedback prompt builder.
export interface FeedbackQuestion {
  prompt: string;
  answer?: string;
  workedSolution?: string;
  misconception?: string;
  /** Source markScheme points texts, verbatim. */
  creditPoints?: string[];
  /** Source markScheme commonErrors entries, verbatim. */
  commonErrors?: string[];
}
export interface FeedbackQuizItem {
  prompt: string;
  answer?: string;
  misconceptionCode?: string;
}
export interface FeedbackNotesTrap {
  misconception: string;
  explanation?: string;
}
export interface FeedbackPromptOptions {
  level?: string;
  subject: string;
  topic?: string;
  topicLabel?: string;
  focus?: string;
  /** Caller-supplied paired exit-ticket questions, rendered into the author prompt. */
  exitTicketQuestions?: FeedbackQuestion[];
  /** Caller-supplied paired worksheet questions, rendered into the author prompt. */
  worksheetQuestions?: FeedbackQuestion[];
  /** Caller-supplied paired quiz-bank items, rendered into the author prompt. */
  quizItems?: FeedbackQuizItem[];
  /** Caller-supplied paired notes trap, rendered into the author prompt. */
  notesTrap?: FeedbackNotesTrap;
}
export interface FeedbackPrompts {
  system: string;
  user: string;
}
export function buildFeedbackPrompts(opts: FeedbackPromptOptions): FeedbackPrompts;
export const FEEDBACK_SYSTEM_TEMPLATE: string;
// Hand-authored fractions feedback (issue #1295): compact JSON
// string of a feedback material derived verbatim from the gold
// fractions worksheet and exit ticket, validating clean against
// validateFeedback.
export const FRACTIONS_FEEDBACK_EXEMPLAR: string;
