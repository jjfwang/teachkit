// TypeScript definitions for player/printable.js - printable worksheet
// and exit-ticket renderer: student sheets and teacher answer keys
// (issue #758), plus student notes and teacher script (issue #766),
// plus the lesson plan renderer (issue #1219), plus the scaffolds
// student sheet and answer key (issue #1233), plus the diagnostics
// student sheet and answer key (issue #1243), plus the quiz bank
// student sheet and answer key (issue #1257).
export interface Choice {
  text: string;
  correct?: boolean;
  [key: string]: unknown;
}
export interface Question {
  id: string;
  prompt: string;
  kind: string;
  choices?: Choice[];
  answer?: string;
  explanation?: string;
  feedback?: string;
  misconception?: string;
  tier?: string;
  difficulty?: number;
  [key: string]: unknown;
}
export interface WorksheetSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  questions: Question[];
  [key: string]: unknown;
}
export interface ExitTicketSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  questions: Question[];
  [key: string]: unknown;
}
export interface Definition {
  term: string;
  meaning: string;
  [key: string]: unknown;
}
export interface Trap {
  misconception: string;
  explanation: string;
  [key: string]: unknown;
}
export interface NotesSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  objectives: string[];
  definitions: Definition[];
  mechanismSteps: string[];
  workedExample: string;
  trap: Trap;
  [key: string]: unknown;
}
export interface Segment {
  minutes: number;
  say: string;
  cue?: string;
  questions?: string[];
  watchFor?: string;
  [key: string]: unknown;
}
export interface ScriptSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  segments: Segment[];
  [key: string]: unknown;
}
export interface LessonPlanObjective {
  id: string;
  text: string;
  successCriteria: string[];
  assessmentPoints: string[];
  [key: string]: unknown;
}
export interface LessonPlanDifferentiation {
  support?: string;
  stretch?: string;
  [key: string]: unknown;
}
export interface LessonPlanActivity {
  title: string;
  minutes: number;
  objectiveIds: string[];
  scriptCue?: string;
  grouping?: string;
  resources?: string[];
  differentiation?: LessonPlanDifferentiation;
  [key: string]: unknown;
}
export interface LessonPlanSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  durationMinutes: number;
  objectives: LessonPlanObjective[];
  activities: LessonPlanActivity[];
  [key: string]: unknown;
}
export interface PrintableOptions {
  enlargedPrint?: boolean;
  unclutteredLayout?: boolean;
  chunkInstructions?: boolean;
}
export function renderWorksheet(spec: WorksheetSpec, options?: PrintableOptions): string;
export function renderWorksheetAnswerKey(spec: WorksheetSpec, options?: PrintableOptions): string;
export function renderExitTicket(spec: ExitTicketSpec, options?: PrintableOptions): string;
export function renderExitTicketAnswerKey(spec: ExitTicketSpec, options?: PrintableOptions): string;
export function renderNotes(spec: NotesSpec, options?: PrintableOptions): string;
export function renderScript(spec: ScriptSpec, options?: PrintableOptions): string;
export function renderLessonPlan(spec: LessonPlanSpec, options?: PrintableOptions): string;
export interface WordBankEntry {
  term: string;
  gloss: string;
  [key: string]: unknown;
}
export interface ClozeItem {
  text: string;
  answers: string[];
  [key: string]: unknown;
}
export interface ScaffoldSet {
  level: string;
  wordBank: WordBankEntry[];
  starters: string[];
  frames: string[];
  cloze: ClozeItem[];
  [key: string]: unknown;
}
export interface ScaffoldsSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  sets: ScaffoldSet[];
  [key: string]: unknown;
}
export function renderScaffolds(spec: ScaffoldsSpec, options?: PrintableOptions): string;
export function renderScaffoldsAnswerKey(spec: ScaffoldsSpec, options?: PrintableOptions): string;
export interface DiagnosticsRationale {
  chose: string;
  thinks: string;
  reteach: string;
  [key: string]: unknown;
}
export interface DiagnosticsChoice {
  text: string;
  correct?: boolean;
  misconception?: string;
  rationale?: DiagnosticsRationale;
  [key: string]: unknown;
}
export interface DiagnosticsQuestion {
  id: string;
  prompt: string;
  kind: string;
  choices: DiagnosticsChoice[];
  scriptCue?: string;
  [key: string]: unknown;
}
export interface DiagnosticsSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  doNow: DiagnosticsQuestion[];
  hingeQuestions: DiagnosticsQuestion[];
  [key: string]: unknown;
}
export function renderDiagnostics(spec: DiagnosticsSpec, options?: PrintableOptions): string;
export function renderDiagnosticsAnswerKey(spec: DiagnosticsSpec, options?: PrintableOptions): string;
export interface WorkedExampleStep {
  text: string;
  annotation?: string;
  withheld?: boolean;
  [key: string]: unknown;
}
export interface WorkedExample {
  problem: string;
  steps: WorkedExampleStep[];
  selfExplanation: string;
  [key: string]: unknown;
}
export interface WorkedExamplesSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  complete: WorkedExample;
  faded: WorkedExample;
  paired: { problem: string; solution: string; [key: string]: unknown };
  [key: string]: unknown;
}
export function renderWorkedExamples(spec: WorkedExamplesSpec, options?: PrintableOptions): string;
export function renderWorkedExamplesAnswerKey(spec: WorkedExamplesSpec, options?: PrintableOptions): string;
export interface QuizBankItem {
  prompt: string;
  answer: string;
  choices?: string[];
  misconceptionCode?: string;
  outcomeCode?: string;
  [key: string]: unknown;
}
export interface QuizBankSpec {
  title: string;
  level: string;
  subject: string;
  topic: string;
  instructions?: string;
  items: QuizBankItem[];
  [key: string]: unknown;
}
export function renderQuizBank(spec: QuizBankSpec, options?: PrintableOptions): string;
export function renderQuizBankAnswerKey(spec: QuizBankSpec, options?: PrintableOptions): string;
export function escapeHtml(s: string): string;
