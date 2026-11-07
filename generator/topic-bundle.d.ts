/** Public topic-to-teaching-bundle generation API (issue #1642).
 * Additive and storage-neutral: one frozen LessonBlueprint (#1640) is
 * authored once per topic + full approved objective set, then plan,
 * slides, chosen visual and assessments are authored from it, each
 * validated by its own beta.2 validator and finally by the #1641
 * cross-material validator + capability resolver. A bundle that fails
 * validation fails closed: generateTopicTeachingBundle rejects with an
 * Error carrying .problems, and nothing is published or cached.
 *
 * No misconception-bank match is required (the diagnostics validator
 * is bank-free) and no animation is required (unsupported subjects
 * resolve through the resolver's explicit diagram / slide-first
 * fallback; core mode authors no animation at all). No S3, database
 * or filesystem-as-library: the bundle is returned in memory and the
 * host owns storage, approval and publication. No student data is
 * accepted anywhere in the request path. The idempotency key hashes
 * the full scope, objective/source revisions, mode and generator
 * provenance via the blueprint identity -- never a topic slug alone.
 */
import type { TopicBlueprintRequest, LessonBlueprint, DeepReadonly } from './lesson-blueprint';
import type { CapabilityDecision, BundleProblem } from './cross-material-validator';

export type TopicBundleMode = 'core' | 'extended';
export type TopicBundleReviewStatus = 'draft' | 'approved';
export interface TopicBundleRequest extends TopicBlueprintRequest {
  mode?: TopicBundleMode;
  /** Host-authored blueprint content; when supplied the blueprint stage skips the model call. */
  blueprintContent?: unknown;
  reviewStatus?: TopicBundleReviewStatus;
}
export interface TopicBundleProgressEvent {
  status: 'started' | 'completed' | 'repairing' | 'failed' | 'duplicate';
  attempt?: number;
  tokens?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
  latencyMs?: number;
  problems?: string[];
  index?: number;
  scopeKey?: string | null;
  error?: string;
}
export interface TopicBundleDeps {
  /** Caller-supplied model call, as in generator/pipeline.js. Returns a JSON string, or an object with a content/text string and optional usage. */
  callChat: (system: string, user: string) => Promise<string | { content?: string; text?: string; usage?: Record<string, unknown> }>;
  onProgress?: (stage: string, event: TopicBundleProgressEvent) => void;
  /** Repair attempts per artifact after the first author attempt (default 3). */
  maxRepairs?: number;
  /** Targeted cross-material repair rounds after the first full check (default 2). */
  maxCrossRepairs?: number;
}
export interface TopicBundleVisual {
  kind: 'simulation' | 'animation' | 'diagram' | 'slide-first' | 'none';
  declarations: Array<Record<string, unknown>>;
  simulation: unknown;
}
export interface TopicBundleAssessment {
  diagnostic: unknown;
  formative: { worksheet: unknown; quizBank?: unknown };
  exitTicket: unknown;
  rubric: Record<string, Array<{ assessmentId: string; phase: string; beatId: string; expectedAnswer: string; criteria: unknown }>>;
}
export interface TopicBundleManifest {
  schemaVersion: 'topic-bundle.v1';
  generatorVersion: string;
  revision: string;
  scopeKey: string;
  sourceRevisions: string[];
  status: TopicBundleReviewStatus;
  artifactHashes: Record<string, string>;
  mode: TopicBundleMode;
}
export interface TopicTeachingBundle {
  readonly schemaVersion: 'topic-bundle.v1';
  readonly scope: DeepReadonly<TopicBlueprintRequest['scope']>;
  readonly mode: TopicBundleMode;
  readonly idempotencyKey: string;
  readonly blueprint: LessonBlueprint;
  readonly lessonPlan: unknown;
  readonly slides: unknown;
  readonly animation: unknown;
  readonly visual: TopicBundleVisual;
  readonly assessment: TopicBundleAssessment;
  readonly materials: Record<string, unknown>;
  readonly index: {
    byObjective: Record<string, { beatIds: string[]; slideIndexes: number[]; assessmentIds: string[]; visualIds: string[] }>;
    byBeat: Record<string, { objectiveIds: string[]; slideIndexes: number[]; assessmentIds: string[]; visualIds: string[] }>;
  };
  readonly manifest: TopicBundleManifest;
  readonly coherence: { problems: BundleProblem[]; warnings: string[]; capabilities: CapabilityDecision[] };
  readonly progress: { stages: Record<string, { attempts: number; tokens: Record<string, number>; latencyMs: number }> };
}
export type TopicBundleBulkResult =
  | { index: number; status: 'generated'; scopeKey: string; idempotencyKey: string; bundle: TopicTeachingBundle }
  | { index: number; status: 'duplicate'; scopeKey: string; idempotencyKey: string; bundle: TopicTeachingBundle }
  | { index: number; status: 'failed'; scopeKey: string | null; idempotencyKey: string | null; error: string; problems?: BundleProblem[] | null };
export const schemaVersion: 'topic-bundle.v1';
export function validateTopicBundleRequest(request: unknown): string[];
/** Stable scope-based idempotency key: hashes the full scope, objective/source revisions, mode and generator provenance via the blueprint identity. */
export function topicBundleScopeKey(request: TopicBundleRequest, mode?: TopicBundleMode): Promise<string>;
/** Generates one frozen, cross-validated teaching bundle. Rejects (fail closed) with an Error carrying .problems when any artifact or the cross-material check cannot be repaired within budget. */
export function generateTopicTeachingBundle(request: TopicBundleRequest, deps: TopicBundleDeps): Promise<TopicTeachingBundle>;
/** Bounded admin-scheduled bulk pre-generation (at most 50 topics per call). Sequential; one bad topic fails only its own entry; repeated topics share the first result by idempotency key. */
export function generateTopicTeachingBundles(requests: TopicBundleRequest[], deps: TopicBundleDeps): Promise<TopicBundleBulkResult[]>;
/** Recomputes manifest hashes, revision, idempotency key and the cross-material check for a bundle. Returns an empty array when valid. */
export function verifyTopicTeachingBundle(bundle: unknown, request?: TopicBundleRequest): Promise<string[]>;
