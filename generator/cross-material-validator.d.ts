/** Deterministic cross-material validator + explicit capability resolver (issue #1641).
 * Storage-neutral and LLM-free: checks a frozen LessonBlueprint (#1640) against the
 * authored topic bundle built from it. A result with valid === false must never be
 * approved or published; problems carry actionable paths for per-artifact repair.
 *
 * Bundle contract (topic-bundle.v1):
 * - scope must equal blueprint.request.scope field for field (stale scope is rejected).
 * - materials is a subset of the beta.2 per-material docs, each still checked by its
 *   own player/validate.js validator: animation, slides, lessonPlan, worksheet,
 *   exitTicket, quizBank, diagnostics. Absent materials are skipped, never invented.
 * - Cross-material links are optional fields the beta.2 validators ignore: slides may
 *   carry beatId / objectiveIds; worksheet questions carry `objective` (native) or
 *   `objectiveId`; exit-ticket / quiz-bank / diagnostics questions carry `objectiveId`;
 *   any assessment question or item may carry `exampleId` and
 *   `quantities: [{ id, value, unit }]`, checked against the frozen example's
 *   same-id quantities. When at least one assessment link exists, every blueprint
 *   objective must be linked by at least one assessment question.
 * - visuals is an array of VisualDeclarations. When the key is absent no visual
 *   checks run; when present, every blueprint beat whose recommendation is not
 *   'none' needs a supported declaration, and a missing visual is valid only when
 *   explicitly declared missing with a reason.
 * - simulation is an optional simulation-kit spec, validated by the registry only.
 *
 * Capability resolver: simulation requires a registered model serving this topic
 * family (same level; subject after the mathematics->math synonym; topic equal to
 * the registered slug or a sub-topic of it, e.g. equivalent-fractions inside
 * fractions). animation requires a sceneId present in the bundle animation.
 * diagram requires a label or a slide shape kind. slide-first requires an existing
 * slideIndex and must not reference a scene or model. none is valid only when
 * explicitly declared missing with a reason. An unsupported request is rejected
 * unless an explicit fallback (animation, diagram or slide-first) is declared and
 * itself resolves; the decision records the fallback and its reason.
 */
export type VisualCapability = 'simulation' | 'animation' | 'diagram' | 'slide-first' | 'none';
export type VisualFallback = 'animation' | 'diagram' | 'slide-first';
export interface VisualDeclaration {
  visualId: string;
  beatId: string;
  requested: VisualCapability;
  model?: string;
  sceneId?: string;
  diagram?: string | { kind: string; label?: string };
  slideIndex?: number;
  exampleId?: string;
  declaredMissing?: boolean;
  reason?: string;
  fallback?: VisualFallback;
}
export interface CapabilityDecision {
  visualId: string | null;
  beatId: string | null;
  requested: VisualCapability | null;
  capability: VisualCapability | null;
  supported: boolean;
  model?: string;
  sceneId?: string;
  declaredMissing: boolean;
  reason: string | null;
  fallback?: { from: VisualCapability; reason: string };
}
export interface CapabilityContext {
  scope: { level: string; subject: string; topicId: string };
  sceneIds: string[];
  slideCount: number;
  simulation?: unknown;
}
export interface BundleProblem { path: string; code: string; message: string; }
export interface TopicBundleCoverage {
  objectives: string[];
  planCovered: string[];
  planMissing: string[];
  assessmentCovered: string[];
  assessmentMissing: string[];
  assessmentChecked: boolean;
}
export interface TopicBundleResult {
  valid: boolean;
  schemaVersion: 'topic-bundle.v1';
  blueprintIdentity: string | null;
  problems: BundleProblem[];
  capabilities: CapabilityDecision[];
  coverage: TopicBundleCoverage;
}
export interface TopicBundleMaterials {
  animation?: unknown;
  slides?: unknown;
  lessonPlan?: unknown;
  worksheet?: unknown;
  exitTicket?: unknown;
  quizBank?: unknown;
  diagnostics?: unknown;
}
export interface TopicBundle {
  schemaVersion: 'topic-bundle.v1';
  scope: Record<string, string>;
  blueprint: unknown;
  materials?: TopicBundleMaterials;
  visuals?: VisualDeclaration[];
  simulation?: unknown;
}
export const schemaVersion: 'topic-bundle.v1';
export function resolveVisualCapability(visual: unknown, context: CapabilityContext): CapabilityDecision;
export function validateTopicBundle(bundle: unknown, options?: { expectedRequest?: unknown }): TopicBundleResult;
export function verifyTopicBundle(bundle: unknown, options?: { expectedRequest?: unknown }): Promise<TopicBundleResult>;
