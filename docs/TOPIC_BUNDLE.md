# Public topic-to-teaching-bundle API

`@jjfwang/teachkit/topic-bundle` is the unified generation API for issue
#1642 (design: `docs/TOPIC_TEACHING_BUNDLE_DESIGN.md`). It is additive and
storage-neutral: it does not change `generateLessonPack` or its slug-only
cache, and it writes nothing to S3, a database or the filesystem. The host
owns storage, approval, publication and session admission.

```js
const { generateTopicTeachingBundle } = require('@jjfwang/teachkit/topic-bundle');
const bundle = await generateTopicTeachingBundle(request, { callChat, onProgress });
if (bundle.manifest.status !== 'approved') {
  // Send the bundle through the host's independent review first.
}
```

## Request

The shipped `TopicBlueprintRequest` fields (`scope`, `objectives`, `sources`,
`generation`, `parameters`) plus:

- `mode?: 'core' | 'extended'` (default `'core'`). Core produces the plan,
  slides, chosen visual and assessments. Extended additionally authors an
  animation (when a beat recommends one) and a quiz bank for formative
  practice.
- `blueprintContent?`: host-authored blueprint content. When supplied, the
  blueprint stage skips the model call and freezes the given content
  directly. Otherwise the blueprint is authored once by the model from the
  request snapshot and frozen before any material is written.
- `reviewStatus?: 'draft' | 'approved'` (default `'draft'`). The manifest
  records the host's review status; the library never approves its own
  output. Publication is an explicit host prepublication step.

Unknown fields are rejected, including any student or session field: no
student data is accepted anywhere in the generation path.

## What it produces

One deeply frozen `TopicTeachingBundle` (`topic-bundle.v1`):

- `blueprint`: the frozen `lesson-blueprint.v1` for the topic and its full
  approved objective set.
- `lessonPlan`, `slides`, `animation` (extended only, else `null`),
  `visual: { kind, declarations, simulation }`, `assessment:
  { diagnostic, formative: { worksheet, quizBank? }, exitTicket, rubric }`.
  The rubric is derived deterministically from the blueprint's assessment
  specifications, not authored separately.
- `materials`: the same artifacts keyed by material name, in the shape the
  #1641 cross-material validator consumes.
- `index: { byObjective, byBeat }`: beat IDs, slide indexes, assessment IDs
  and visual IDs per objective and per beat, so a host can select subsets
  without regenerating.
- `manifest: { schemaVersion, generatorVersion, revision, scopeKey,
  sourceRevisions, status, artifactHashes, mode }`. `scopeKey` is the
  blueprint identity; `revision` hashes the scope key, mode and artifact
  hashes. `idempotencyKey` hashes the schema version, mode and blueprint
  identity — the full scope, objective/source revisions and generator
  provenance, never a topic slug alone.
- `coherence: { problems: [], warnings, capabilities }`: the #1641
  capability decisions per visual, including any diagram/slide-first
  fallback and its reason.
- `progress.stages`: per-stage attempts, token totals (when the model
  reports usage) and latency.

## Generation graph

```
request snapshot -> author + freeze blueprint once
  -> author plan, slides, diagnostics, worksheet, exit ticket
     (+ animation, quiz bank in extended mode), each validated by its
     own beta.2 validator with bounded repair (default 3 attempts)
  -> author visual declarations; each resolves through the #1641
     capability resolver (simulation / animation / diagram / slide-first)
  -> #1641 cross-material validation (verifyTopicBundle)
  -> targeted bounded repair: only the artifacts named by the failing
     problem paths are re-authored (default 2 rounds), then re-checked
  -> manifest, index, freeze
```

## No misconception bank, no animation requirement

The diagnostics validator is bank-free: it checks misconception codes and
teacher-only rationale shape, so topics without a misconception bank still
generate. A beat recommending animation or simulation on an unsupported
subject resolves through the resolver's explicit diagram or slide-first
fallback (recorded in `coherence.warnings`), or is declared missing with a
reason. Core mode authors no animation at all.

## Fail-closed behaviour

Any artifact that cannot be repaired within budget, or a bundle that still
fails cross-material validation after the repair rounds, rejects with an
`Error` carrying `.stage` and `.problems` (path/code/message). Nothing is
returned, cached or published in that case. Use
`verifyTopicTeachingBundle(bundle, request)` to re-check a stored bundle:
it recomputes the manifest hashes, revision, idempotency key and the
cross-material check, and returns a list of problem strings (empty when
valid). A changed scope, objective, answer or scene is detected, not
silently re-targeted.

## Bulk pre-generation

`generateTopicTeachingBundles(requests, deps)` (at most 50 topics per
call) is the admin-scheduled bulk entry point, separate from student
traffic. It runs sequentially; one bad topic fails only its own entry
(`{ status: 'failed', error }`). Repeated topics in one batch share the
first result by stable scope-based idempotency key
(`{ status: 'duplicate', bundle }`).

## Progress

`deps.onProgress(stage, event)` is called per stage (`blueprint`,
`lessonPlan`, `slides`, `animation`, `diagnostics`, `worksheet`,
`exitTicket`, `quizBank`, `visuals`; `bulk-topic` for bulk runs) with
`{ status: 'started' | 'completed' | 'repairing', attempt, tokens,
latencyMs, problems? }`. `deps.callChat(system, user)` is the only model
interface, as in `generator/pipeline.js`; it returns a JSON string, or an
object with a `content`/`text` string and optional `usage`.

## Gold pilot

`tests/topic-bundle.test.js` runs the P5 equivalent-fractions bundle
end to end with a mock LLM (no real provider calls), plus Secondary
Science and JC Maths smoke cases, a simulation-beat case
(`fraction-bars`), targeted-repair, and fail-closed negative cases (a
persistently false worksheet answer and a dangling slide scene). The
fixtures are the hand-authored snapshots in
`tests/fixtures/topic-blueprints.json`, not an approved official
curriculum release.
```

Full type definitions are in [`topic-bundle.d.ts`](../generator/topic-bundle.d.ts).
