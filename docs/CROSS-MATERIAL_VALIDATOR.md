# Deterministic cross-material validator + capability resolver

`@jjfwang/teachkit/cross-material-validator` (issue #1641) checks a frozen
`LessonBlueprint` (#1640) against the authored topic bundle built from it,
and decides, per visual, which capability serves it. It is additive and
storage-neutral: it does not change beta.2 pack semantics, generate,
approve, publish or store anything, and it runs no LLM, network or
filesystem call. A result with `valid === false` must never be approved or
published; `problems` carry actionable paths for per-artifact repair.

```js
const validator = require('@jjfwang/teachkit/cross-material-validator');
const result = validator.validateTopicBundle(bundle);
if (!result.valid) throw new Error(result.problems.map(p => p.path + ': ' + p.message).join('\n'));
const verified = await validator.verifyTopicBundle(bundle); // also recomputes blueprint hashes
```

## Bundle contract (`topic-bundle.v1`)

```js
{
  schemaVersion: 'topic-bundle.v1',
  scope: { /* must equal blueprint.request.scope field for field */ },
  blueprint: /* frozen LessonBlueprint */,
  materials: { animation, slides, lessonPlan, worksheet, exitTicket, quizBank, diagnostics },
  visuals: [ /* VisualDeclaration, see below */ ],
  simulation: /* optional simulation-kit spec */
}
```

- **Scope.** Every scope field must still equal the frozen blueprint
  request scope. A changed scope is stale, not a silent re-target.
  Copy the scope from the frozen blueprint (`blueprint.request.scope`),
  which is normalized (locale lowercased, sets sorted).
- **Materials.** A subset of the beta.2 per-material docs. Each present
  material is first checked by its own `player/validate.js` validator.
  Absent materials are skipped, never invented.
- **Cross-material links** are optional fields the beta.2 validators
  ignore: slides may carry `beatId` / `objectiveIds`; worksheet questions
  carry `objective` (native) or `objectiveId`; exit-ticket, quiz-bank and
  diagnostics questions carry `objectiveId`; any assessment question or
  item may carry `exampleId` and `quantities: [{ id, value, unit }]`.
  When a link is present it must resolve against the frozen blueprint:
  slide visuals must name an animation scene in the bundle, beats and
  objectives must exist, answers must equal the canonical example answer,
  and quantities must match the frozen example's same-id value and unit.
  When at least one assessment link exists anywhere, every blueprint
  objective must be linked by at least one assessment question. A bundle
  with no links at all skips that check (beta.2 backward compatibility).
- **Plan coverage.** A present lesson plan must name the full frozen
  objective set, give every objective at least one activity, and keep
  `durationMinutes` equal to the frozen lesson duration.
- **Visuals.** When the `visuals` key is absent, no visual checks run.
  When present, every blueprint beat whose recommendation is not `none`
  needs a supported declaration, and a beat recommending `none` must not
  declare a visual. A missing visual is valid only when explicitly
  declared missing with a reason.
- **Simulation.** When present, the spec is validated by the registry
  (`simulation-kit.js`), never executed. A simulation visual bound to a
  frozen example must use that example's quantities as parameter
  defaults.

## Capability resolver (`resolveVisualCapability`)

Deterministic decision table; it never invents a capability and never runs
model-supplied code.

| Requested | Served when | Otherwise |
|---|---|---|
| `simulation` | Model is registered **and** registered for this topic family: same level; same subject after the `mathematics` -> `math` synonym; topic equal to the registered slug or a sub-topic of it (`equivalent-fractions` inside `fractions`). The bundle simulation spec, when present, must name the same model and pass registry validation. | Unsupported (rejected, unless an explicit fallback resolves). |
| `animation` | `sceneId` exists in the bundle animation scenes. | Unsupported. |
| `diagram` | A non-empty label, or a descriptor whose kind is a slide shape kind. | Unsupported. |
| `slide-first` | `slideIndex` exists **and** the visual references no animation scene or simulation model. A slide-first visual that still demands an animation is invalid. | Unsupported. |
| `none` | Explicitly declared missing with a reason. | Unsupported. |

An unsupported request is rejected unless the declaration names an
explicit `fallback` (`animation`, `diagram` or `slide-first` -- never
`simulation`, never `none`); the fallback is resolved the same way and the
decision records `{ from, reason }`. Every decision is returned in
`result.capabilities` in declaration order.

## Problem codes

`unsupported-schema`, `unsupported-field`, `invalid-bundle`,
`missing-scope`, `stale-scope`, `blueprint-invalid` (including hash
mismatches from `verifyTopicBundle`), `material-invalid`,
`unsupported-material`, `dangling-scene`, `unknown-beat`,
`unknown-objective`, `unknown-example`, `unknown-quantity`,
`omitted-objective`, `objective-not-assessed`, `duration-mismatch`,
`answer-mismatch`, `answer-missing`, `quantity-mismatch`,
`invalid-simulation`, `invalid-visual`, `duplicate-visual`,
`unsupported-visual`, `missing-visual`, `unexpected-visual`.

## Deliberately out of scope

- Fuzzy term or prose consistency: a deterministic validator cannot prove
  two wordings mean the same thing; that stays with scientific and
  pedagogical review (`generator/interactive-review.js`).
- Solving arbitrary assessment questions or proving scientific
  correctness: answers are checked only against the frozen canonical
  example answers.
- Approval, publication, storage or session pinning: those belong to the
  host (Aceceed Core). This module only reports whether a bundle is
  valid; the host gates approval on `valid === false`.
- Generation (#1642) consumes this validator; it is not part of it.
