/** Host-authorized, complete topic snapshot. No learner/session data is accepted. */
export interface TopicBlueprintRequest {
  scope: { country: string; authority: string; curriculumReleaseId: string; syllabus: string;
    syllabusVersion: string; level: string; grade: string; subject: string; topicId: string; locale: string };
  objectives: Array<{ objectiveId: string; revision: string; contentHash: string; text: string; sourceClaimIds: string[] }>;
  sources: Array<{ sourceId: string; revision: string; contentHash: string; claims: Array<{ claimId: string; text: string }> }>;
  generation: { generatorVersion: string; model: string; promptVersion: string; validatorVersion: string };
  parameters: { durationMinutes: number; difficulty: 'support' | 'standard' | 'stretch' };
}
export type VisualRecommendation = 'simulation' | 'animation' | 'diagram' | 'none';
export interface BlueprintContent {
  prerequisites: Array<{ id: string; text: string; sourceClaimIds: string[] }>;
  definitions: Array<{ id: string; term: string; meaning: string; sourceClaimIds: string[] }>;
  misconceptions: Array<{ id: string; objectiveId: string; incorrect: string; correction: string; sourceClaimIds: string[] }>;
  examples: Array<{ id: string; objectiveIds: string[]; statement: string; steps: string[]; answer: string; unit: string;
    quantities: Array<{ id: string; value: number; unit: string }>; sourceClaimIds: string[] }>;
  beats: Array<{ beatId: string; objectiveIds: string[]; kind: 'activate' | 'explain' | 'predict' | 'practice' | 'feedback' | 'exit';
    durationSeconds: number; explanation: string; successCriteria: string[]; expectedEvidence: string;
    exampleIds: string[]; definitionIds: string[]; misconceptionIds: string[]; visual: VisualRecommendation; sourceClaimIds: string[] }>;
  assessments: Array<{ assessmentId: string; objectiveId: string; beatId: string; phase: 'diagnostic' | 'formative' | 'exit';
    prompt: string; expectedAnswer: string; rubric: Array<{ criterion: string; marks: number }>;
    misconceptionIds: string[]; exampleId: string | null; sourceClaimIds: string[] }>;
}
export type DeepReadonly<T> = T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> } : T;
export interface LessonBlueprint {
  readonly schemaVersion: 'lesson-blueprint.v1';
  readonly identity: string;
  readonly revision: string;
  readonly request: DeepReadonly<TopicBlueprintRequest>;
  readonly content: DeepReadonly<BlueprintContent>;
}
export const schemaVersion: 'lesson-blueprint.v1';
export function validateRequest(request: unknown): string[];
export function topicBlueprintIdentity(request: TopicBlueprintRequest | DeepReadonly<TopicBlueprintRequest>): Promise<string>;
export function createLessonBlueprint(request: TopicBlueprintRequest, content: BlueprintContent): Promise<LessonBlueprint>;
/** Structural validation only. Use verifyLessonBlueprint for untrusted persisted bytes. */
export function validateLessonBlueprint(blueprint: unknown, expectedRequest?: TopicBlueprintRequest | DeepReadonly<TopicBlueprintRequest>): string[];
/** Recomputes identity and content revision hashes as well as structural validation. */
export function verifyLessonBlueprint(blueprint: unknown, expectedRequest?: TopicBlueprintRequest | DeepReadonly<TopicBlueprintRequest>): Promise<string[]>;
