# Frozen topic lesson blueprint

`@jjfwang/teachkit/lesson-blueprint` is an additive, storage-neutral authoring
contract (`lesson-blueprint.v1`). It does not change the beta.2 animation or
objective lesson-pack APIs. It makes no model, filesystem or network calls.

The trusted host resolves one canonical curriculum topic, its **complete**
objective set, exact grade and locale, and the current source snapshots. Core
remains the authority for ACTIVE curriculum membership, source rights and
approval. Shape validation cannot prove those database facts, that a source
hash corresponds to an issuer document, or that a caller supplied every
objective. Never derive this request from a learner's free text. The host must
also enforce its country-specific grade taxonomy: `grade` is an exact catalog
value (for example `P5`), distinct from the broad `level` (`primary`).

```js
const blueprint = require('@jjfwang/teachkit/lesson-blueprint');
const frozen = await blueprint.createLessonBlueprint(approvedTopicSnapshot, content);
const errors = await blueprint.verifyLessonBlueprint(frozen, approvedTopicSnapshot);
if (errors.length) throw new Error(errors.join('\n'));
```

The full request and content types are in
[`lesson-blueprint.d.ts`](../generator/lesson-blueprint.d.ts). Every field is
explicit and unknown fields are rejected. There is no student, session,
attachment, private-answer or selected-objective input. A session selects an
objective only after loading a separately approved bundle; selection is not
part of the generation identity.

`topicBlueprintIdentity(request)` hashes the versioned complete request:
country, authority, curriculum release, syllabus/version, broad level, exact
grade, subject, canonical topic, locale, objective IDs/revisions/content hashes,
source IDs/revisions/content hashes and claim snapshots, difficulty, duration,
generator, model, prompt and validator versions. Objective, source, claim and
claim-reference sets are sorted without mutating inputs. Language tags are
case-insensitive. Other identifiers remain exact and are never guessed or
collapsed by display title. Changing approved objective membership creates a
different identity; it does not overwrite the previous blueprint.

`createLessonBlueprint` validates the snapshot and content, copies both, then
deeply freezes the result. Its `identity` identifies the build specification;
its `revision` additionally hashes the complete blueprint content. Stable
objective, beat, example and assessment IDs are supplied by the author and
preserved. References are checked against the full snapshot. Every objective
needs a teaching beat with observable success criteria and assessment evidence.
Beat durations must sum to the exact requested lesson duration. Referenced
examples and misconceptions must cover the corresponding objective, and an
assessment using a canonical example must retain its exact answer.

Every example also declares `quantities: [{ id, value, unit }]` for deterministic
binding of numeric material and supported simulation parameters. IDs are unique
within the example; values are finite numbers bounded to `-1e12..1e12`, and units
are strings of at most 128 characters (empty for dimensionless values). Use an
empty array for a nonnumeric example. Prose and an example ID alone cannot prove
that a visual uses the intended numeric values: downstream validators must
compare each numeric binding to its same-ID frozen quantity. This remains
separate from independent scientific and pedagogical review.

`validateRequest` and `validateLessonBlueprint` return path-bearing structural
errors, including unknown fields, missing provenance, duplicate/conflicting
claims, dangling references, sparse arrays and incomplete objective coverage.
`verifyLessonBlueprint` additionally recomputes both hashes; use it for stored
or received JSON. These checks do not independently solve arbitrary assessment
questions or prove scientific correctness. Source interpretation, pedagogical
quality, answers and visual capability still require their separate validation
and independent review before publication. A `visual` field is a recommendation,
not authorization to run an arbitrary simulation.

The JSON fixtures under `tests/fixtures/topic-blueprints.json` contain a P5
equivalent-fractions example with two objectives, five beats and 30 minutes,
plus Secondary Science and JC Maths examples. They are hand-authored test
snapshots under `fixture-authority`, not an approved official curriculum
release or evidence of real model generation. Assessment answers and rubrics
are authoring data for backend use; do not expose the blueprint as a public
learner asset. Publication, private S3 storage, immutable PostgreSQL revisions,
review and active-session pinning belong to Aceceed Core.

For browser use, load `generator/approved-assets.js` before
`generator/lesson-blueprint.js`, then use `TeachkitLessonBlueprint`. The shared
canonical JSON and SHA-256 helpers require WebCrypto. No asset-store adapter is
created or used by the blueprint module.
