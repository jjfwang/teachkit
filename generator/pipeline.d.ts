// TypeScript definitions for generator/pipeline.js — the automatic
// unpack -> author -> repair generate pipeline (issue #693). Model-agnostic:
// all LLM traffic goes through the caller-supplied deps.callChat.
export interface PipelineTransition {
  name: string;
  from_state: string;
  to_state: string;
  driver: string;
}
export interface GenerateAnimationOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  kind?: string;
  focus?: string;
  facet?: string | null;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export type PipelineCallChat = (system: string, user: string) => Promise<string>;
export type PipelineValidate = (
  spec: Record<string, unknown>
) => string[] | Promise<string[]>;
/** Progress stages: 'unpack' and 'author' report (1, 1); 'repair' reports (attemptNumber, maxRepairs). */
export type PipelineProgress = (
  stage: 'unpack' | 'author' | 'repair',
  n: number,
  max: number
) => void;
export interface GenerateAnimationDeps {
  callChat: PipelineCallChat;
  validate: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath animation spec that validated clean.
export type AnimathSpecDocument = Record<string, unknown>;
export function generateAnimation(
  opts: GenerateAnimationOptions,
  deps: GenerateAnimationDeps
): Promise<AnimathSpecDocument>;
// generateSlides options (issue #747): the GenerateAnimationOptions fields
// minus kind/focus/facet, plus an optional worked example handed to the
// slide prompt builder.
export interface GenerateSlidesOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateSlidesDeps {
  callChat: PipelineCallChat;
  /** Slide-deck validator; defaults to the built-in validateSlides when omitted. */
  validateSlides?: PipelineValidate;
  /** Fallback validator, used when validateSlides is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath slide deck that validated clean.
export type SlideDeckDocument = Record<string, unknown>;
export function generateSlides(
  opts: GenerateSlidesOptions,
  deps: GenerateSlidesDeps
): Promise<SlideDeckDocument>;
// generateWorksheet options (issue #760): the GenerateSlidesOptions shape
// — topic, optional topicLabel/level, subject, and an optional worked
// example handed to the worksheet prompt builder.
export interface GenerateWorksheetOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateWorksheetDeps {
  callChat: PipelineCallChat;
  /** Worksheet validator; defaults to the built-in validateWorksheet when omitted. */
  validateWorksheet?: PipelineValidate;
  /** Fallback validator, used when validateWorksheet is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath worksheet that validated clean.
export type WorksheetDocument = Record<string, unknown>;
export function generateWorksheet(
  opts: GenerateWorksheetOptions,
  deps: GenerateWorksheetDeps
): Promise<WorksheetDocument>;
// generateExitTicket options (issue #760): the GenerateSlidesOptions shape
// — topic, optional topicLabel/level, subject, and an optional worked
// example handed to the exit-ticket prompt builder.
export interface GenerateExitTicketOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateExitTicketDeps {
  callChat: PipelineCallChat;
  /** Exit-ticket validator; defaults to the built-in validateExitTicket when omitted. */
  validateExitTicket?: PipelineValidate;
  /** Fallback validator, used when validateExitTicket is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath exit ticket that validated clean.
export type ExitTicketDocument = Record<string, unknown>;
export function generateExitTicket(
  opts: GenerateExitTicketOptions,
  deps: GenerateExitTicketDeps
): Promise<ExitTicketDocument>;

// generateNotes options (issue #768): the GenerateSlidesOptions shape
// — topic, optional topicLabel/level, subject, and an optional worked
// example handed to the notes prompt builder.
export interface GenerateNotesOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateNotesDeps {
  callChat: PipelineCallChat;
  /** Student-notes validator; defaults to the built-in validateNotes when omitted. */
  validateNotes?: PipelineValidate;
  /** Fallback validator, used when validateNotes is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath student notes that validated clean.
export type NotesDocument = Record<string, unknown>;
export function generateNotes(
  opts: GenerateNotesOptions,
  deps: GenerateNotesDeps
): Promise<NotesDocument>;
// generateScript options (issue #768): the GenerateSlidesOptions shape
// — topic, optional topicLabel/level, subject, and an optional worked
// example handed to the script prompt builder.
export interface GenerateScriptOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateScriptDeps {
  callChat: PipelineCallChat;
  /** Teacher-script validator; defaults to the built-in validateScript when omitted. */
  validateScript?: PipelineValidate;
  /** Fallback validator, used when validateScript is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath teacher script that validated clean.
export type ScriptDocument = Record<string, unknown>;
export function generateScript(
  opts: GenerateScriptOptions,
  deps: GenerateScriptDeps
): Promise<ScriptDocument>;
// generateLessonPlan options (issue #1215): the GenerateScriptOptions
// shape — topic, optional topicLabel/level, subject, and an optional
// worked example handed to the lesson plan prompt builder.
export interface GenerateLessonPlanOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateLessonPlanDeps {
  callChat: PipelineCallChat;
  /** Lesson-plan validator; defaults to the built-in validateLessonPlan when omitted. */
  validateLessonPlan?: PipelineValidate;
  /** Fallback validator, used when validateLessonPlan is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath lesson plan that validated clean.
export type LessonPlanDocument = Record<string, unknown>;
export function generateLessonPlan(
  opts: GenerateLessonPlanOptions,
  deps: GenerateLessonPlanDeps
): Promise<LessonPlanDocument>;
// generateScaffolds options (issue #1231): the GenerateLessonPlanOptions
// shape plus the paired student-notes derivation inputs — definitions
// (the word bank is drawn from these) and mechanismSteps (the cloze is
// built from these).
export interface ScaffoldsDefinition {
  term: string;
  meaning: string;
}
export interface GenerateScaffoldsOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Unpacked state transitions, attached by the shared unpack stage. */
  transitions?: PipelineTransition[];
  /** Paired student-notes definitions the word bank is drawn from. */
  definitions?: ScaffoldsDefinition[];
  /** Paired student-notes mechanism steps the cloze is built from. */
  mechanismSteps?: string[];
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateScaffoldsDeps {
  callChat: PipelineCallChat;
  /** Scaffolds validator; defaults to the built-in validateScaffolds when omitted. */
  validateScaffolds?: PipelineValidate;
  /** Fallback validator, used when validateScaffolds is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath scaffolds material that validated clean.
export type ScaffoldsDocument = Record<string, unknown>;
export function generateScaffolds(
  opts: GenerateScaffoldsOptions,
  deps: GenerateScaffoldsDeps
): Promise<ScaffoldsDocument>;
// generateDiagnostics options (issue #1241): the GenerateLessonPlanOptions
// shape plus an optional facet hint for faceted bank entries. Diagnostics
// are generated from the misconception bank: a topic with no bank entry
// rejects before any LLM call.
export interface GenerateDiagnosticsOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** Facet hint for a faceted misconception bank entry; the primary facet resolves when omitted. */
  facet?: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateDiagnosticsDeps {
  callChat: PipelineCallChat;
  /** Diagnostics validator; defaults to the built-in validateDiagnostics when omitted. */
  validateDiagnostics?: PipelineValidate;
  /** Fallback validator, used when validateDiagnostics is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath diagnostics material that validated clean.
export type DiagnosticsDocument = Record<string, unknown>;
export function generateDiagnostics(
  opts: GenerateDiagnosticsOptions,
  deps: GenerateDiagnosticsDeps
): Promise<DiagnosticsDocument>;
// generateWorkedExamples options (issue #1248): the
// GenerateLessonPlanOptions shape; the set is authored from the shared
// unpack like generateScaffolds.
export interface GenerateWorkedExamplesOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  /** The student's focus for the set, when given. */
  focus?: string;
  /** Optional worked example for this topic, adapted by the author prompt. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
}
export interface GenerateWorkedExamplesDeps {
  callChat: PipelineCallChat;
  /** Worked-examples validator; defaults to the built-in validateWorkedExamples when omitted. */
  validateWorkedExamples?: PipelineValidate;
  /** Fallback validator, used when validateWorkedExamples is not supplied. */
  validate?: PipelineValidate;
  onProgress?: PipelineProgress;
}
// The parsed animath worked-example set that validated clean.
export type WorkedExamplesDocument = Record<string, unknown>;
export function generateWorkedExamples(
  opts: GenerateWorkedExamplesOptions,
  deps: GenerateWorkedExamplesDeps
): Promise<WorkedExamplesDocument>;
// generateLessonPack (issue #768): one shared unpack authors all ten
// materials; packs are cached in memory by topic slug.
export interface GenerateLessonPackOptions {
  topic: string;
  topicLabel?: string;
  level?: string;
  subject: string;
  kind?: string;
  focus?: string;
  facet?: string | null;
  /** Optional worked example handed to the material prompt builders. */
  workedExample?: string;
  /** Number of repair turns after the first attempt. Default 3; 0 disables repair. */
  maxRepairs?: number;
  /** Bypass the in-memory pack cache and regenerate, replacing the cached entry. */
  force?: boolean;
  /** Model identity recorded on the pack manifest metadata (issue #1221). */
  model?: string;
}
export interface GenerateLessonPackDeps {
  callChat: PipelineCallChat;
  validate?: PipelineValidate;
  validateSlides?: PipelineValidate;
  validateWorksheet?: PipelineValidate;
  validateNotes?: PipelineValidate;
  validateExitTicket?: PipelineValidate;
  validateScript?: PipelineValidate;
  validateLessonPlan?: PipelineValidate;
  validateScaffolds?: PipelineValidate;
  validateDiagnostics?: PipelineValidate;
  validateWorkedExamples?: PipelineValidate;
  onProgress?: PipelineProgress;
}
export interface PackMetadataCode {
  code: string;
  title: string;
}
export interface PackMetadata {
  syllabusYear: number | null;
  outcomeCodes: PackMetadataCode[];
  assessmentObjectives: PackMetadataCode[];
  aiGenerated: { label: string; model: string; generatorVersion: string };
  review: { reviewer: string; reviewDate: string } | null;
  moderation: { state: string };
}
export interface LessonPackManifest {
  slug: string;
  topic: string;
  level?: string;
  subject: string;
  version: string;
  materials: string[];
  metadata: PackMetadata;
}
export interface LessonPackResult {
  manifest: LessonPackManifest;
  animation: AnimathSpecDocument;
  slides: SlideDeckDocument;
  worksheet: WorksheetDocument;
  notes: NotesDocument;
  exitTicket: ExitTicketDocument;
  script: ScriptDocument;
  lessonPlan: LessonPlanDocument;
  scaffolds: ScaffoldsDocument;
  diagnostics: DiagnosticsDocument;
  workedExamples: WorkedExamplesDocument;
}
export function generateLessonPack(
  opts: GenerateLessonPackOptions,
  deps: GenerateLessonPackDeps
): Promise<LessonPackResult>;
// generateLessonPackForSyllabus (issue #770): the syllabus-keyed entry
// point. topic/topicLabel/level/subject are all optional here — they
// are resolved from the syllabus id (bare slug or level/track/slug),
// and any explicitly supplied value wins over the resolved one.
export interface GenerateLessonPackForSyllabusOptions
  extends Omit<GenerateLessonPackOptions, 'topic' | 'subject'> {
  topic?: string;
  topicLabel?: string;
  level?: string;
  subject?: string;
}
export function generateLessonPackForSyllabus(
  id: string,
  opts?: GenerateLessonPackForSyllabusOptions,
  deps: GenerateLessonPackDeps
): Promise<LessonPackResult>;
/** Clear the in-memory lesson-pack cache (issue #768). */
export function clearPackCache(): void;
