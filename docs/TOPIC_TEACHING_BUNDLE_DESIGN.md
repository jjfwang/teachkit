# Topic-level teaching bundle: beta.2 baseline and next implementation

Status: **design proposal, not an implemented beta.2 API** (2026-11-07).
Update (2026-11-07): slice 1 below (LessonBlueprint) has shipped on main after
beta.2 as `lesson-blueprint.v1` (PR #1643, issue #1640); slice 2 (coherence &
capability) has shipped as `topic-bundle.v1` validation (PR #1644, issue
#1641); slice 3 (unified API) has shipped as `@jjfwang/teachkit/topic-bundle`
(`generator/topic-bundle.js`, issue #1642, open for review, not merged) — see
"Shipped: LessonBlueprint (slice 1)" and `docs/TOPIC_BUNDLE.md`. Slice 4
(Aceceed integration) remains a separate-repo proposal.
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
an objective-to-topic index on the existing Core catalog/review/S3 owner,
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

## Cloud-authoritative storage and explicit version management

**Requirement:** No generated topic kit is durably saved to the developer's
local filesystem. The local Teachkit runner may compose bounded JSON in memory,
but must use a pluggable store to upload artifacts into private **AWS S3** as
they are produced, with a verified manifest before any publish. A failed upload
is an unfinished/retryable build, never a local canonical release. Test fixtures
can still reside in the source tree; they are not published teaching content.

**Ownership:** Teachkit defines the versioned JSON schema, blueprint,
validation and pluggable `ArtifactSink` / `ArtifactSource` interfaces. It
must not own AC's production database. **Aceceed Core** owns the canonical topic
registry, approval/version state machine, identity, access control, managed
PostgreSQL records and production S3 adapter. Prefer **RDS PostgreSQL**, extending
the existing Prisma/TeachingArtifact/build-job/review owners; do not introduce
DynamoDB or a second catalog. Local Core services may publish to a private
development AWS S3 bucket using short-lived IAM credentials; for an authoritative
managed catalog they must use a private development RDS via SSM tunnel/VPN or an
authenticated Core publishing endpoint. Do not open PostgreSQL on public 5432.
Keep dev and production accounts/buckets/IAM/publish authority isolated.

### Four independent version dimensions

- **Curriculum identity:** country, authority, syllabus release/version,
  precise grade, subject, canonical `topicId`, locale, and complete approved
  objective set (with source hashes). Distinct scope means distinct catalog
  identity, not a text-slug match.
- **Bundle content revision:** monotonic or opaque immutable `revision`,
  exact manifest hash, component keys/hashes, frozen blueprint and objective IDs.
- **Schema version:** `topic-bundle.v1`, upgraded through explicit migrations.
- **Generator provenance:** Teachkit package version, model and prompt/validator
  revisions, sources, review receipts, content build specification.

S3 bucket Versioning is **recovery**, not product-level teaching revisioning:
old and new approved teaching bundles have different immutable keys and DB
revisions even when the bucket is not versioned. S3 Versioning should be
enabled as defense in depth; optional Object Lock Governance Mode needs a
specific retention/operational review rather than unbounded default retention.

Suggested storage shape:

```text
s3://<private-catalog-bucket>/
  topic-kits/v1/<scope>/<topicId>/
    revisions/r0001/
      manifest-<sha256>.json
      blueprint-<sha256>.json
      lesson-plan-<sha256>.json
      slides-<sha256>.json
      animation-<sha256>.json
      assessment-<sha256>.json
      assets/<assetId>-<sha256>.<ext>
    revisions/r0002/
      ...
```

This is an illustrative logical convention; the Core-owned `manifest` and DB
registry define the authoritative lookup. Do not create an overwritable S3
`latest` pointer as the sole source of truth, and keep answer keys private.

### Safe publish and rollback

1. Core resolves reviewed topic and claims a durable build in PostgreSQL,
   idempotent by exact scope + source revision + build specification.
2. Generator uploads content-addressed objects directly to S3 private draft
   staging with conditional `If-None-Match: *`; retries re-verify exact SHA-256.
3. Once all material refs exist, verify hashes, cross-material objective/beat
   links, current reviewed curriculum/source and capability, then freeze the
   manifest and independent approval receipt.
4. Publish by **one PostgreSQL transaction** setting the exact approved
   revision ACTIVE/current, retaining superseded revisions and history.
   S3 and PostgreSQL are not atomic together: a recoverable draft/staged/
   published state machine must handle orphan uploads and interrupted workers.
5. AC session admission pins artifact id, revision and content hash, verifies
   publication and material integrity; no live-session hot swap. Rollback
   changes the current pointer for **future** sessions after current source and
   review eligibility checks; it does not overwrite old bytes.

Retain complete published revisions to support reproducible past-session
replay and rollback. Abandoned, never-published drafts may be garbage
collected after a reviewed interval. Use S3 inventory/lifecycle and RDS
backups/PITR plus periodic restore drills; maintain DB-to-S3 referential
integrity audits.

### Deployment trajectory

- **Local generation now:** local service processes; remote dev S3 as the
  only authoritative material store and private development RDS/managed
  registry as the version authority; short-lived development credentials.
- **Public beta:** separate production RDS + private S3, managed auth/secrets,
  migrations, approved revision promotion and a small measured application host.
- **Scale:** move Core/AI/reviewer compute to managed containers and Redis to
  managed service as necessary. Content revision hashes, PostgreSQL logical
  identities and S3 file formats remain unchanged.

Implement this as an additive schema/adapter change without altering the
already-shipped `0.2.0-beta.2` behavior. Legacy AC objective-scoped packs
remain valid during migration to topic-scoped bundles. The new topic library
is **curriculum content**, not student records or chat history.


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
   modes, stable manifest and per-stage observability. SHIPPED on a branch
   for issue #1642 (open for review, not merged); see
   `docs/TOPIC_BUNDLE.md`.
4. **Aceceed integration (P1, separate repo).** Pin a verified npm beta
   version, regenerate `pnpm-lock.yaml`, test six-material compatibility,
   remove obsolete animath only after usage audit, and connect objective
   evidence to Aceceed's tutoring loop. No direct live-session model call.

**Non-goals for this slice:** inventing a universal simulator, replacing
Aceceed's learner model, broad syllabus gold backfill, or breaking the current
`generateLessonPack` consumers.
