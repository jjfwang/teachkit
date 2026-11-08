# Topic-level teaching bundle: beta.2 baseline and next implementation

**Status (2026-11-08):** The topic-first API and validators are **shipped in
Teachkit v0.2.0**. This document retains the beta.2-era motivation and design
history; the implemented API authority is [TOPIC_BUNDLE.md](TOPIC_BUNDLE.md)
and [generator/topic-bundle.d.ts](../generator/topic-bundle.d.ts).
LessonBlueprint #1640, cross-material validation #1641 and topic API #1642
are closed following merged PRs #1643–#1645.
**Aceceed integration is separate work**: [AC #1810–#1814](https://github.com/jjfwang/ac/issues/1812)
and [Teachkit #1648](https://github.com/jjfwang/teachkit/issues/1648).
Do not interpret this historical design as a requirement for S3 or RDS.
Related: #743 (teaching-materials umbrella), #1204 (trust/lesson-plan/metadata), and [interactive teaching roadmap](INTERACTIVE_TEACHING_ROADMAP.md).

## Goal

Given an **exact curriculum, grade, subject, topic and objective**, produce one
coherent, reviewable, reusable **teaching bundle**: a timed teaching plan,
instructional slides, a useful animation or interactive model when supported,
and assessments with answer keys/rubrics. "Coherent" means each output teaches
and checks the same approved objective, not merely sharing a title.

This library is an **offline, no-student-data authoring + validation + rendering**
capability. Aceceed remains responsible for student state, source authorization,
adaptive tutoring, speech, live session orchestration and parental reporting.

## Product decision: pre-generate and reuse by TOPIC

One bundle is authored, reviewed and published **offline per exact curriculum
TOPIC + level/grade + subject + locale + syllabus revision**. Its blueprint
contains the **full approved set of objectives for that topic**; slides,
animation beats and assessment questions reference individual objective IDs
*inside* the topic bundle. Different students, sessions and selected objectives
must share this already-approved topic bundle, not fork new full packs.

Aceceed's current lesson-pack scope/build spec is instead keyed by
`objectiveId`. This is a **real migration gap**: add a topic identity and
an objective-to-topic index on the existing Core curriculum/review owner,
preserve the existing six-file objective pack API as a legacy compatibility
path, and migrate gradually with tests. Do not rewrite approved object keys
or start a second catalog.

Before sessions, Aceceed's existing admin batch queue enumerates reviewed
curriculum topics and asks Teachkit to generate any missing topic bundles.
For known topics whose approved bundle is not yet available, one bounded,
asynchronous catalog backfill may be queued/joined. **Current teaching continues
without waiting** using already permitted session tools. Unknown/unmapped
topics do not automatically become an approved syllabus asset. New approved
bundle revisions are adopted by future sessions, not hot-swapped into the
current voice/slide timeline.

## Current integration/storage decision: storage-neutral generator + host JSONB

**Canonical as of 2026-11-08. Supersedes the original S3/RDS-first proposals
in the pre-v0.2.0 design.** The released `generateTopicTeachingBundle` API is
storage neutral: it returns a deeply frozen `TopicTeachingBundle` in memory.
Teachkit does not create mandatory files, issue S3 operations, connect to a
database or approve its own content. The caller supplies `deps.callChat`.
The existing `generateLessonPack`, browser player and approved-asset utilities
are separate legacy/specialized APIs and remain backward compatible.

**For Aceceed's *new* topic kits**, the sole authoritative teaching-JSON store
is **Aceceed Core PostgreSQL JSONB** under [AC #1812](https://github.com/jjfwang/ac/issues/1812).
Aceceed owns validated conversion from Teachkit bundle to a versioned declarative
scene/interaction/animation schema, immutable full-document content hashes,
independent review and publication transactions, rollback, learner authorization,
answer-key redaction, and Live Tutor revision pinning. Codex / Claude Code CLI
is injected as the caller's background model runner, not part of Teachkit.
Development may use local PostgreSQL. Remote RDS is **not** a prerequisite.

**No S3 dependency for new Topic Kit JSON**: new structured content, slides,
supported animation declarations and assessment JSON are stored in Postgres.
Existing S3-backed Aceceed topic revisions remain **read-only legacy
compatibility** during a measured migration; unrelated paper/image uploads and
large optional binaries can still use object storage. Do not delete existing
S3 blobs or migrations. Do not open a second content registry.

### Responsibilities and invariant boundaries

| Concern | Teachkit v0.2.0 | Aceceed |
| --- | --- | --- |
| Approved curriculum inputs | consumes scoped objectives, source claims | authenticates/reviews the curriculum and selects the exact topic |
| Bundle generation | author/freeze blueprint, plan, slides, visual, assessments; validate coherence | run offline jobs/CLI, idempotency, retries, constraints |
| Storage | **none required**; in-memory returned JSON | schema-validated immutable **Postgres JSONB** revisions |
| Review and publication | draft metadata only, never auto-publish | independent content-hash review and atomic active revision |
| Scene/animation rendering | supplies optional visual/animation declarations with capability fallback | validate/convert to allowlisted Expo React Native components |
| Learner delivery | no student data in generator | pin approved revision, strip answer keys/rubrics, drive tutor scene events |
| Legacy support | preserve old generation exports | preserve S3 read-only path until verified migration |

The **generator bundle schema is not the frontend rendering schema**:
`slides` and `animation` are currently typed `unknown` and
`visual.declarations` is an array of records in the v0.2.0 public typings.
Neither coherence validation nor `visual.kind` proves these values are
renderable on Expo/iOS/Android. Define a versioned Aceceed rendering
projection; reject unsupported declarations or use an explicit diagram/
slide-first fallback. Never execute arbitrary generated JavaScript/HTML
as part of rendering. This compatibility boundary is tracked by
[Teachkit #1648](https://github.com/jjfwang/teachkit/issues/1648)
and [AC #1811](https://github.com/jjfwang/ac/issues/1811).

### Independent version dimensions

- **Curriculum scope**: exact country, authority, release, syllabus, grade,
  subject, topic, locale, full approved objective IDs and source hashes.
- **Immutable content revision**: canonical JSONB value and SHA-256, one
  approved content hash per revision.
- **Schema revision**: Teachkit generator bundle schema and Aceceed renderer
  schema evolve independently; conversion must validate both.
- **Generator provenance**: Teachkit version, CLI/model/prompt/validator
  versions and authorization evidence, recorded in Core.
- **Session revision**: exact approved content hash pinned at admission;
  publication/rollback influences future sessions, never hot-swaps a session.

### Delivery and acceptance

1. Core resolves and authorizes a complete approved topic and schedules
   one bounded background build for the canonical scope.
2. Core invokes the released Teachkit API through caller-supplied CLI model
   adapter and obtains an in-memory bundle.
3. Core re-verifies the bundle, projects only supported visual/animation
   structures into its safe rendering protocol, and inserts the complete
   immutable validated JSON revision **transactionally into PostgreSQL**.
4. Admin previews actual renderable content, reviews exact content hash
   independently and publishes a revision transactionally.
5. Live Tutor retrieves and pins that revision. The client sees no answers,
   private rubrics, model prompts or unapproved content.
6. Run a P5-equivalent-fractions `core` and `extended` fixture through
   this boundary with negative tests for dangling references, unknown
   component types, mismatched scope and answer-key exposure. This adapter
   acceptance is **not yet proven** by Teachkit's existing mock-LLM tests.

No change to the Teachkit generation API should be made merely to support a
database choice; propose a small additive field/export only if conformance
testing reveals a concrete missing reference.

## What beta.2 already provides

- `generateAnimation`, `generateSlides`, `generateLessonPlan`,
  `generateWorksheet`, `generateExitTicket`, `generateDiagnostics`,
  `generateQuizBank` and other material-specific pipelines.
- `generateLessonPack` and `generateLessonPackForSyllabus` for fourteen
  materials with a shared initial unpack and per-material author/repair
  validation, plus topic-slug in-memory caching.
- Animated SVG renderer; a separately validated and allowlisted simulation
  registry (eight exemplar models, **not** arbitrary subject/topic coverage);
  tutor beat-to-slide/speech synchronization; prepublication review; approved
  immutable asset storage.
- Lesson-plan objectives, success criteria, timings and assessment points.

**Current gaps:** the shared unpack is predominantly mechanism/transitions, not
a single authoritative instructional blueprint. Most pack materials are
individually authored and individually validated. There is no general pack-level
guarantee that objectives, example numbers, scene references, slide references,
script cues and assessment items agree. A topic-slug-only cache is unsafe
across grade, syllabus version, curriculum authority, language, objectives or
difficulty; Aceceed currently forces regeneration to work around this.
The all-material pack requires a misconception-bank match and an animation,
which is unsuitable for unsupported topics and slide-first subjects.

## Shipped: LessonBlueprint (slice 1)

Slice 1 of "Implementation slices" below is DONE, merged as PR #1643
(issue #1640) on main after beta.2. The shipped contract is the authority
where this document's proposal differs from it:

- Export: `@jjfwang/teachkit/lesson-blueprint`
  (`generator/lesson-blueprint.js`, types in
  `generator/lesson-blueprint.d.ts`), documented in
  `docs/LESSON_BLUEPRINT.md`. Schema version `lesson-blueprint.v1`.
- Request shape: `{ scope, objectives, sources, generation, parameters }`.
  Scope is `{ country, authority, curriculumReleaseId, syllabus,
  syllabusVersion, level, grade, subject, topicId, locale }` with an exact
  grade (broad bands such as `primary` are rejected) and a case-insensitive
  locale. Objectives are full objects `{ objectiveId, revision, contentHash,
  text, sourceClaimIds }`, not bare IDs. Sources are `{ sourceId, revision,
  contentHash, claims: [{ claimId, text }] }`. Generation provenance is
  `{ generatorVersion, model, promptVersion, validatorVersion }`.
  Parameters are `{ durationMinutes, difficulty }` only; there is no `mode`
  field on the blueprint (core/extended mode remains a proposal for the
  future unified API layer, not part of the shipped blueprint).
- Blueprint shape: `{ schemaVersion, identity, revision, request, content }`.
  `identity` is the SHA-256 of the canonical versioned request (the scope
  key); `revision` is the SHA-256 of the schema version, identity and
  content. Changing approved objective membership creates a different
  identity; it does not overwrite the previous blueprint.
- Content: prerequisites, definitions, misconceptions, examples, beats and
  assessments. Beat kinds are exactly `activate`, `explain`, `predict`,
  `practice`, `feedback`, `exit`; the per-beat `visual` field is a
  recommendation (`simulation` | `animation` | `diagram` | `none`), and a
  beat can explicitly have no visual. At least one worked example is
  required, each declaring `quantities: [{ id, value, unit }]`. Beat
  durations must sum to exactly the requested lesson duration, every
  objective needs a teaching beat and an assessment item, and an assessment
  that uses a canonical example must retain its exact answer.
- Functions: `createLessonBlueprint` (validates, copies, deeply freezes),
  `validateLessonBlueprint`, `verifyLessonBlueprint` (recomputes both
  hashes), `validateRequest`, `topicBlueprintIdentity`. Unknown fields are
  rejected; references are checked against the full snapshot.
- Gold fixtures: P5 equivalent fractions (two objectives, five beats,
  30 minutes), Secondary Science and JC Maths in
  `tests/fixtures/topic-blueprints.json`. They are hand-authored test
  snapshots under `fixture-authority`, not an approved official curriculum
  release or evidence of real model generation.

## Proposed input and output contracts

**API names and shapes below are proposals only. Existing beta.2 exports stay
unchanged.** Prefer adding a new versioned subpath rather than changing the
existing `generateLessonPack` behavior in place. Where the proposal overlaps
the shipped LessonBlueprint (scope, objectives, sources, generation
provenance), the shipped shape in "Shipped: LessonBlueprint (slice 1)" above
governs; the sketch below is already conformed to it.

```ts
type TopicBundleRequest = {
  curriculum: {
    country: string; authority: string; curriculumReleaseId: string;
    syllabus: string; syllabusVersion: string;
    grade: string; // e.g. P5 or Sec2, not just primary
    level: 'primary' | 'secondary' | 'jc';
    subject: string; topicId: string;
    locale: string; // e.g. en-SG; explicit to avoid cross-language reuse
  };
  objectives: Array<{
    objectiveId: string; revision: string; contentHash: string;
    text: string; sourceClaimIds: string[];
  }>;
  approvedSources: Array<{
    sourceId: string; revision: string; contentHash: string;
    claims: Array<{ claimId: string; text: string }>;
  }>;
  generation: {
    generatorVersion: string; model: string;
    promptVersion: string; validatorVersion: string;
  };
  parameters: {
    durationMinutes: number; difficulty: 'support' | 'standard' | 'stretch';
    // mode is a unified-API proposal only; the shipped blueprint has no mode:
    mode?: 'core' | 'extended'; // core: plan, visuals, slides, assessment
  };
};

type TopicTeachingBundle = {
  manifest: {
    schemaVersion: string; generatorVersion: string; revision: string;
    scopeKey: string; // blueprint identity hash
    sourceRevisions: string[]; status: 'draft' | 'approved';
    artifactHashes: Record<string, string>;
  };
  blueprint: LessonBlueprint; // lesson-blueprint.v1, shipped (PR #1643)
  lessonPlan: object;
  slides: object;
  visual: { kind: 'animation' | 'simulation' | 'diagram' | 'none';
            spec?: object; limitation?: string };
  assessment: { diagnostic: object; formative: object; exitTicket: object;
                rubric: object };
  coherence: { problems: string[]; warnings: string[] };
};
```

### Authoritative lesson blueprint

Generate *one* grounded blueprint before any material. It must include:

- Immutable curriculum identity, approved source/claim references, precise
  prior knowledge and outcome-aligned learning objectives (`objectiveId`).
- Concept graph with prerequisite nodes, vocabulary and definitions, at
  least one canonical worked example (numbers, units, symbols, with declared
  quantities), misconceptions and correct explanations,
  difficulty/support/stretch strategies.
- Ordered teaching beats (`beatId`), each mapping to `objectiveId`,
  misconception, explanation, expected student evidence, and recommended
  visual type; a beat can explicitly have **no animation**.
- Assessment specifications per objective, cognitive level, misconception,
  expected answer, marking criteria and partial-credit rubric.
- Pedagogical pacing, e.g. activate prior knowledge -> explain -> predict ->
  practice -> feedback -> exit check, using the shipped beat kinds
  (`activate`, `explain`, `predict`, `practice`, `feedback`, `exit`).
  Visualisation/manipulation is a per-beat `visual` recommendation
  (`simulation` | `animation` | `diagram` | `none`), not a beat kind.
  The author proposes the timing; the validator enforces the stated duration
  (beat durations must sum to exactly the requested duration).

After validation the blueprint is **frozen**. Individual authors can vary the
wording, but cannot invent new facts, numeric values, objectives or scene IDs.
If sources conflict or a curriculum claim is ungrounded, fail closed for
prepublication review; do not let the LLM silently choose a claim.

### Generation graph

```text
curriculum + sources + topic/grade + scope
             |
    resolve syllabus + capabilities
             |
    grounded lesson blueprint --> validate & freeze
             |
   +---------+---------+---------------+
   |         |         |               |
 lesson    slides    visual         assessment
 plan      author    author         author
   |         |         |               |
   +---------+---------+---------------+
             |
  validate each + cross-material coherence
             |
 independent content/pedagogy review (human escalation if uncertain)
             |
 publish immutable, hash-addressed bundle and playback anchors
```

To minimise model cost, author the blueprint once, parallelise independent
material generation after it is frozen, and repair only the failed artifact
where possible. Keep a bounded retry budget and record token/latency metrics.
The live player and Aceceed tutor should load **approved prebuilt materials**;
generation and review never block a student slider, answer or speech turn.

## Four outputs and their joined acceptance contracts

| Output | Expected content | Critical linked references |
| --- | --- | --- |
| Teaching plan | Duration-checked sequence, objectives, success criteria, activities, support/stretch and checks | Activity -> `beatId` / `objectiveId`; each outcome covered |
| Slides | Hook, explanation, worked example, visual cues, guided practice, exit prompt | Slide -> `beatId`, optional `sceneId`, one approved example |
| Animation / simulation | Mechanism-first visual that really changes state; for supported topics, predictive manipulatives and observable feedback | Visual -> `beatId` / stable semantic object IDs; no fabricated physics; capability check |
| Assessment | Diagnostic -> formative practice -> exit ticket with answers, distractor rationales, partial-credit rules and feedback | Question -> `objectiveId`, misconception code, evidence target, marking rubric |

Each assessment includes a way to expose a student's misconception to Aceceed.
Teachkit defines **what is checked** and the grading contract; Aceceed decides
**when to check next** and how to adapt the live lesson.

## Hard validation/publishing gates

1. Exact scope match across all artifacts: curriculum authority + version,
   grade, subject, topic, objective IDs, language and source revision.
2. Every lesson objective has at least one teaching beat, an assessment item
   and observable success criterion; no orphan slides or questions.
3. Every referenced scene/beat/object ID exists; slide -> animation ->
   script/speech cue agreement survives pause, interruption and seek.
4. Key terminology, numerical worked examples, units and answer keys match
   the frozen blueprint. Deterministic checks run first; independent review
   handles scientific and pedagogical judgement.
5. Assessment answer/rubric is independently solved/checked; explanation
   and distractor misconception correspond to the stated objective.
6. Allowlist simulation models. If unsupported, choose a still diagram or
   slide-first pathway with an explicit limitation, never a pretend simulator.
7. Screen-reader text, contrast/legibility, keyboard access and reduced
   motion; screenshot/device validation is a separate measured QA stage.
8. Publication is fail-closed: only an approved immutable revision is
   accessible to students; failed/uncertain cases require review.
9. Cache key includes all curriculum fields, objective revision, source hashes,
   language, mode and generator/model versions. No topic-slug-only reuse.
10. No student answers, identifiers or raw learner histories in Teachkit
    generation inputs, bundled assets, caches or review prompts.

## Reference pilot and release gates

Start with **Singapore Primary 5 Mathematics: equivalent fractions**. Use the
approved curriculum objective, one fraction-bar explanation, one worked
example, 4-6 slides, a 30-minute lesson plan, 2 diagnostic/2 formative/2 exit
items (counts are pilot targets, not library-wide hard requirements). Repeat a
smaller smoke case for Secondary Science and JC Mathematics to catch level
leakage.

Acceptance evidence:
- Deterministic valid/fail fixtures for each of the ten gates and an end-to-end
  mock-LLM test of the proposed unified API.
- Cross-material negative tests (nonexistent scene, objective missing from
  assessment, inconsistent answers, mismatched grade/language/syllabus,
  unsupported simulator, stale approval, unsafe cache collision).
- Benchmark quality rubric: curriculum correctness; conceptual mechanism;
  pedagogy; visual semantics; assessment alignment; accessibility; latency
  and model cost, measured across the three levels.
- Manual browser/mobile visual QA and a genuine Aceceed lesson playback
  with slide/voice/visual synchronization before any broad release claim.

## Implementation slices for an agent loop

1. **Blueprint & identity (P0).** DONE - shipped as `lesson-blueprint.v1`
   (PR #1643, issue #1640); see "Shipped: LessonBlueprint (slice 1)" above.
   A versioned `LessonBlueprint` schema, builder/validator, immutable scope
   hash and three gold fixtures. No change to the existing `animath:0.1` or
   beta.2 pack contracts.
2. **Coherence & capability (P0).** Pack cross-reference checks and explicit
   simulation/animation/diagram/slide-first fallback; failing fixtures must
   not publish. Keep beta.2 public subpaths backward compatible.
3. **Unified API (P1).** `generateTopicTeachingBundle` behind a new
   `./topic-bundle` export, author stages and targeted repair, core/extended
   modes, stable manifest and per-stage observability. MERGED in PR #1645,
   shipped in v0.2.0 (issue #1642 closed); see
   `docs/TOPIC_BUNDLE.md`.
4. **Aceceed integration (P1, separate repo).** Pin a verified v0.2.0
   release commit, test source-claim mapping and legacy compatibility,
   validate/declaratively project teaching JSON into Postgres JSONB,
   connect objective evidence to Live Tutor without live generation, and
   keep historic S3 reads during migration. Follow AC #1810–#1814.
   No forced npm registry release, new S3 Topic Kit writes, or live-session
   model call.

**Non-goals for this slice:** inventing a universal simulator, replacing
Aceceed's learner model, broad syllabus gold backfill, or breaking the current
`generateLessonPack` consumers.
