// TypeScript definitions for generator/build_guide_prompt.js - animath guide prompt builder.
export interface GuideNotesDefinition {
  term: string;
  meaning: string;
}
export interface GuideNotesTrap {
  misconception: string;
  explanation?: string;
}
export interface GuideTopicNotes {
  topic: string;
  /** Paired notes definitions the key ideas derive from, verbatim. */
  definitions?: GuideNotesDefinition[];
  /** Paired notes trap the guide traps may carry, verbatim. */
  trap?: GuideNotesTrap;
}
export interface GuidePracticeSetItem {
  prompt: string;
  answer?: string;
}
export interface GuidePracticeSet {
  dayOffset: number;
  items?: GuidePracticeSetItem[];
}
export interface GuidePairedQuestion {
  prompt: string;
  answer?: string;
  workedSolution?: string;
  misconception?: string;
  misconceptionCode?: string;
}
export interface GuidePromptOptions {
  level?: string;
  subject: string;
  unitTitle?: string;
  term?: string;
  /** The paired scheme sequence topics, in order; at least 2 slugs. */
  topics: string[];
  focus?: string;
  /** Caller-supplied per-topic paired notes content, rendered into the author prompt. */
  notesByTopic?: GuideTopicNotes[];
  /** Caller-supplied gate-topic paired revision practice sets. */
  revisionPracticeSets?: GuidePracticeSet[];
  /** Caller-supplied gate-topic paired quiz-bank items. */
  quizItems?: GuidePairedQuestion[];
  /** Caller-supplied gate-topic paired exit-ticket questions. */
  exitTicketQuestions?: GuidePairedQuestion[];
  /** Caller-supplied gate-topic paired feedback common-error misconceptions, verbatim. */
  feedbackCommonErrors?: string[];
}
export interface GuidePrompts {
  system: string;
  user: string;
}
export function buildGuidePrompts(opts: GuidePromptOptions): GuidePrompts;
export const GUIDE_SYSTEM_TEMPLATE: string;
// Hand-authored primary math guide (issue #1302): compact JSON
// string of a guide material derived verbatim from the gold
// primary-math scheme of work and the paired notes, revision,
// quiz bank and exit ticket, validating clean against
// validateGuide.
export const PRIMARY_MATH_GUIDE_EXEMPLAR: string;
