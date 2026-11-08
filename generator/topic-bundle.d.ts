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
/** Learner-safe host projection of a verified bundle (#1648): the JSON
 * Aceceed's renderer adapter consumes. Blueprint keeps identity,
 * objectives and beats only (no assessments, expected answers or
 * rubrics); the assessment keeps prompts, choice texts, marks and ids
 * with every answer key stripped; the simulation spec keeps its
 * question and options but not its check's correctIndex or explanation. */
export interface HostProjectionBeat {
  beatId: string;
  objectiveIds: string[];
  kind: string;
  durationSeconds: number;
  /** Blueprint visual recommendation. */
  visual: 'simulation' | 'animation' | 'diagram' | 'none';
}
export interface HostProjectionDeclaration {
  visualId: string;
  beatId: string;
  requested: 'simulation' | 'animation' | 'diagram' | 'slide-first' | 'none';
  fallback?: 'animation' | 'diagram' | 'slide-first';
  sceneId?: string;
  slideIndex?: number;
  diagram?: unknown;
  model?: string;
  exampleId?: string;
  declaredMissing?: boolean;
  reason?: string;
}
export interface HostTopicBundleProjection {
  readonly schemaVersion: 'host-projection.v1';
  readonly compatibilityVersion: 'host-compat.v1';
  readonly scope: DeepReadonly<TopicBlueprintRequest['scope']>;
  readonly mode: TopicBundleMode;
  readonly revision: string;
  readonly idempotencyKey: string;
  readonly scopeKey: string;
  readonly blueprint: {
    identity: string;
    objectives: DeepReadonly<TopicBlueprintRequest['objectives']>;
    beats: HostProjectionBeat[];
  };
  readonly lessonPlan: unknown;
  readonly slides: unknown;
  readonly animation: unknown;
  readonly visual: {
    kind: 'simulation' | 'animation' | 'diagram' | 'slide-first' | 'none';
    declarations: HostProjectionDeclaration[];
    simulation: unknown;
  };
  /** Assessment with all answer keys stripped; no top-level rubric. */
  readonly assessment: unknown;
  readonly index: {
    byObjective: Record<string, { beatIds: string[]; slideIndexes: number[]; assessmentIds: string[]; visualIds: string[] }>;
    byBeat: Record<string, { objectiveIds: string[]; slideIndexes: number[]; assessmentIds: string[]; visualIds: string[] }>;
  };
  readonly coherence: { capabilities: CapabilityDecision[]; warnings: string[] };
}
/** Versioned host compatibility matrix the projection is checked
 * against: the visual kinds, the fields each declaration shape
 * carries (plus the fallback field and its per-kind payload), the
 * animation scene/step fields the renderer needs, and the keys the
 * assessment projection strips. */
export interface HostCompatibilityMatrix {
  readonly version: 'host-compat.v1';
  readonly schemaVersion: 'topic-bundle.v1';
  readonly visualKinds: Array<'simulation' | 'animation' | 'diagram' | 'slide-first' | 'none'>;
  readonly declarationShapes: Record<'simulation' | 'animation' | 'diagram' | 'slide-first' | 'none', string[]>;
  readonly declarationFallback: {
    field: 'fallback';
    values: Array<'animation' | 'diagram' | 'slide-first'>;
    payloadFields: { animation: 'sceneId'; diagram: 'diagram'; 'slide-first': 'slideIndex' };
  };
  readonly animationFields: string[];
  readonly animationStepFields: string[];
  readonly assessmentProjection: {
    strippedFields: string[];
    choiceStrippedFields: string[];
    droppedSections: string[];
  };
}
export const HOST_COMPATIBILITY: HostCompatibilityMatrix;
/** Pure, deterministic, model-free projection of a verified
 * TopicTeachingBundle into its learner-safe host form. Builds fresh
 * objects and never mutates the frozen bundle. Throws a clear Error
 * on a malformed bundle (wrong/missing schemaVersion, missing
 * manifest/blueprint/materials or any other required part). */
export function projectTopicBundleForHost(bundle: TopicTeachingBundle): HostTopicBundleProjection;
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
