# teachkit Animation Spec — v0.1

The spec is the contract between the **generator** (the LLM) and the
**player**. A spec is a JSON document describing a short animated explainer:
2–8 scenes, each with shapes that appear, move, and highlight on a timeline,
plus narration text per scene.

Authority order: this file > `README.md` > `SYLLABUS.md` > any issue >
implementation. If code and spec disagree, the code is wrong.

## Top-level document

| field     | type                              | notes                                              |
|-----------|-----------------------------------|----------------------------------------------------|
| `animath` | string                            | spec version, currently `"0.1"`                    |
| `title`   | string                            | human title, shown in the player header            |
| `level`   | `"primary"` \| `"secondary"` \| `"jc"` |                                              |
| `subject` | string                            | required non-empty string — any school subject; math\|science\|geography are the syllabus-covered subjects |
| `topic`   | string                            | slug from `SYLLABUS.md`                            |
| `kind`    | `"concept"` \| `"problem"`        | concept = explain an idea; problem = pose then solve |
| `canvas`  | `{width, height}`                 | pixels; `960 × 540` recommended                    |
| `scenes`  | Scene[1..8]                       | played in order (1 scene = holistic cycle/system staging) |

## Scene

```json
{
  "id": "s1",
  "caption": "Make the pieces the same size",
  "narration": "We can't add halves and quarters directly. Split the half into two quarters.",
  "duration_ms": 8000,
  "steps": [ ... ]
}
```

- `id`: unique within the document.
- `caption`: short on-screen heading for the scene.
- `narration`: 1–2 sentences in a spoken tone suited to the level. Shown under
  the stage; reserved for future text-to-speech.
- `duration_ms`: 4000–12000.
- `steps`: ordered by `at_ms` ascending.

## Steps

Every step has `at_ms` (0 ≤ at_ms < scene `duration_ms`) and a `do` verb.

- `show`: `{at_ms, do:"show", shape}` — fades the shape in over ~300ms.
- `hide`: `{at_ms, do:"hide", target}` — fades the shape out. `target` is a
  shape id shown earlier in the same scene.
- `move`: `{at_ms, do:"move", target, to, dur_ms}` — interpolates the shape's
  position from its current spot to `to` over `dur_ms` ms. `to` may carry
  position fields, size fields, or both: `w`/`h` for `rect`, `r` for `circle`,
  and only fields valid for the target kind (`x`/`y` for `text`/`latex`,
  `cx`/`cy` for `circle`, `x1`/`y1`/`x2`/`y2` for `line`/`arrow`). At least
  one numeric field is required. A `polygon` moves by its vertices: `to`
  carries only `points`, an array of `[x,y]` pairs with the same length as
  the shape's `points`, interpolated pointwise. Moveable kinds in v0:
  `text`, `rect`, `circle`, `line`, `arrow`, `latex`, `polygon`.
- `emphasize`: `{at_ms, do:"emphasize", target, dur_ms?}` — pulse-highlight the
  shape (scale pulse). Default `dur_ms` 900.
- `caption`: `{at_ms, do:"caption", text}` — replaces the scene caption bar
  mid-scene.

## Playback

The reference player (`player/player.js`) advances a spec through a small
playback state machine. The relevant state fields are `sceneIdx` (current
scene), `sceneTime` (ms into the current scene), `playing`, `lastTick`
(timestamp of the previous frame), and `fired` (per-scene record of steps
already triggered):

- When playback reaches the end of a non-final scene, the player advances
  to the next scene and keeps playing. `tick()` calls
  `goScene(state.sceneIdx + 1, 0)`, then re-arms playback directly —
  `state.playing = true; state.lastTick = now` — instead of calling
  `play()`: `tick()` already schedules the next animation frame itself
  (`state.raf = requestAnimationFrame(tick)`), and a second frame request
  would run the loop twice as fast.
- When the final scene ends, playback stops. `tick()` calls `pause()`
  (cancelling the scheduled frame, flipping `state.playing` off) and
  leaves the final frame on screen —
  `renderSceneAt(state.sceneIdx, scene.duration_ms, true)`.
- Manual navigation always lands paused: the prev/next buttons, the
  filmstrip, and the keyboard prev/next shortcuts go through `goScene()`,
  which calls `pause()` before jumping; the scrub slider calls `pause()`
  directly and then renders the scrubbed position. The restart button is
  the deliberate exception — `goScene(0, 0)` followed by `play()` — so it
  lands on the first scene playing.
- `play()` pressed at or past the end of a scene seeks before playing: at
  the end of a non-final scene it jumps to the next scene from 0
  (`goScene(state.sceneIdx + 1, 0)`); at the end of the final scene it
  restarts the final scene from 0
  (`renderSceneAt(state.sceneIdx, 0, reducedMotion)`). Either way it then
  sets `state.playing = true`, `state.lastTick = performance.now()` and
  schedules the frame loop.

The player mounts paused on the first frame (`renderSceneAt(0, 0,
reducedMotion)`); playback starts when the user presses play.

## Mechanism-first authoring

Contract validity (see "Validation") is the floor, not the bar. Every scene
shows a *mechanism*: at least one state change — a process, transformation, or
cause->effect — carried by the visuals. The state change rides on `move`, or
on staged `show`/`hide` steps that build or transform a diagram over time
(bars growing one after another, an electron travelling along a wire, a shape
morphing across consecutive beats). `emphasize` may mark a turning point but
never carries the mechanism alone. On-screen text (captions, labels,
narration) supports the visual; it never carries the explanation by itself —
a scene of text fading in line by line is contract-valid but not yet good
enough. No text-only scenes.

## Shapes

Every shape has a unique `id` within its scene.

- `explain` (optional, all kinds): a plain-text "explain me this" sentence
  for the shape. The player shows it as a tooltip when the viewer hovers
  over, taps, or keyboard-focuses the shape; shapes without `explain` stay
  inert (only shapes that carry it become hover/focus targets). Authoring
  guidance: write it for a student staring at that one part — name the
  part, state what it means in this scene, one short sentence, plain text
  (no markdown, no LaTeX). Key chart/diagram parts should carry one;
  decorative shapes and captions should not.

- `text`: `{id, kind:"text", x, y, text, size?, color?, align?}` —
  `align`: `"start"` (default) | `"middle"` | `"end"`. `size` in px, default 28.
- `latex`: `{id, kind:"latex", x, y, tex, size?, color?}` — math rendered
  with KaTeX (see "Math notation"). `tex` is required plain LaTeX;
  `size` in px, default 28.
- `rect`: `{id, kind:"rect", x, y, w, h, fill?, stroke?, strokeWidth?, rx?}`
- `circle`: `{id, kind:"circle", cx, cy, r, fill?, stroke?, strokeWidth?}`
- `line`: `{id, kind:"line", x1, y1, x2, y2, stroke?, width?, dash?}` —
  `dash` is an optional string of space-separated numbers (e.g. `"6 4"`),
  passed through to SVG `stroke-dasharray`; absent or empty means solid.
  Use for asymptotes, construction lines, hidden 3D edges, field-line
  conventions.
- `arrow`: `{id, kind:"arrow", x1, y1, x2, y2, stroke?, width?, dash?, widths?}` —
  line with a head; `dash` applies to the shaft only (the head stays solid).
  Optional `widths: [w1, w2]` makes the shaft a tapered polygon instead of a
  stroke — tail width `w1` at (x1,y1), head width `w2` at (x2,y2), interpolated
  linearly along the shaft (Sankey-style flow arrows for energy diagrams);
  both must be positive numbers. The arrowhead scales with the head width
  (`w2` when `widths` is present, else `width`). `dash` is ignored on a tapered
  shaft (stroke-dasharray cannot apply to a filled polygon). A `move` step on
  an arrow may carry `widths` (an array of two positive numbers) to animate
  the taper widening or narrowing; if the shown shape declared no `widths`,
  the taper snaps in at the end of the move.
- `polygon`: `{id, kind:"polygon", points:[[x,y],...], fill?, stroke?, strokeWidth?}`
- `sector`: `{id, kind:"sector", cx, cy, r, startAngle, endAngle, fill?, stroke?, strokeWidth?}` —
  pie slice / angle arc / mensuration sector. Angles in degrees: `0` is east,
  positive is clockwise (canvas y-down). `r` must be positive. Not moveable in v0.

Coordinates are canvas pixels, origin top-left. Colors are CSS hex strings
(`"#1a1a1a"`). Sensible defaults: 2px `#1a1a1a` strokes, transparent fills.

## Math notation (v0.1)

Two kinds of on-screen math:

- `latex` shapes — rendered with KaTeX when the player page loads it
  (`player/demo.html` pins a CDN copy), with a plain-text fallback
  otherwise. Use `latex` where unicode breaks down: fractions, stacked
  notation, algebra (`tex: "a^2 + b^2 = c^2"`). `size` in px (default 28);
  `color` a CSS hex string.
- `text` shapes stay **unicode-only**: `½ ¼ ¾ × ÷ − → √ π θ ° ² ³ ≤ ≥ ≠ ± ≈ ∠ △`.
  The validator still rejects backslash sequences like `\frac` inside
  `text` — those belong in `tex`, never in `text`.

## Slide spec

A slide deck is the teaching-material companion to an animation spec: an
ordered set of slides for presenting a topic before or alongside the
animation. `validateSlides` in `player/validate.js` enforces this contract
and returns a `string[]` of errors, exactly like `validateSpec` (empty =
valid).

Deck fields:

| field     | type                                   | notes                                  |
|-----------|----------------------------------------|----------------------------------------|
| `title`   | string                                 | required non-empty                     |
| `level`   | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject` | string                                 | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`   | string                                 | required non-empty                     |
| `slides`  | Slide[]                                | required non-empty array               |

Slide fields:

| field     | type   | notes |
|-----------|--------|-------|
| `kind`    | string | required, one of `title` \| `objective` \| `hook` \| `concept` \| `mechanism` \| `example` \| `practice` \| `exit-ticket` |
| `heading` | string | optional; a slide must have a heading or non-empty `bullets` (or both) |
| `bullets` | string[] | optional; every entry a non-empty string |
| `notes`   | string | optional speaker notes; must be a string when present (empty allowed) |
| `visual`  | string \| object | optional; see below |

A `visual` is valid in exactly two forms: (a) a non-empty string — an
animation scene id; or (b) a descriptor object with a non-empty `sceneId`
and/or a `kind` naming a shape kind from the Shapes section (when both
fields are present, both must be valid). Anything else — `null`, a number,
an array, an empty string, `{}`, an empty `sceneId` with no valid `kind`,
an unknown `kind` with no valid `sceneId` — is a **dangling visual
reference** and is rejected.

Ordering rules: a `title` slide is required and must be first; an
`exit-ticket` slide is required and must be last; an `objective` slide is
not required, but when one is present it must come before the first
`concept` or `mechanism` slide. No other ordering constraints apply.

## Worksheet spec

A worksheet is the practice-material companion to an animation spec: an
ordered set of questions a student answers on paper or in class, with an
answer key for the teacher. `validateWorksheet` in `player/validate.js`
enforces this contract and returns a `string[]` of errors, exactly like
`validateSpec` (empty = valid).

Worksheet fields:

| field       | type       | notes                                  |
|-------------|------------|----------------------------------------|
| `title`     | string     | required non-empty                     |
| `level`     | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject`   | string     | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`     | string     | required non-empty                     |
| `variant`   | string     | optional; only value `homework` — see below |
| `questions` | Question[] | required array of at least 1 question  |

The worksheet answer key is the set of per-question `explanation` fields
(see the Question table below): the explanation for a question states why
its answer is correct, and it may name the misconception it addresses via
the question's `misconception` field.

Worksheet questions may be tiered so one worksheet can serve support,
core and extension learners together. A question's optional `tier` is
one of `support`, `core` or `extension`, with normative meanings:
`extension` means transfer and multi-step reasoning — never more volume
or longer arithmetic; `support` means the same objective at reduced
cognitive load (smaller numbers, scaffolded steps, worked-example
proximity) — never a different or lesser objective; `core` is the
standard objective at full load. A question's optional `difficulty` is
an integer from 1 to 5, where 1 is the least demanding within its tier.
Both fields are worksheet-only and optional: validation is strict when
they are present (an unknown `tier` or a `difficulty` that is not an
integer from 1 to 5 is an error), and a worksheet with neither field
validates exactly as before. Exit-ticket questions do not carry `tier`
or `difficulty`. The tier label shows on both the student sheet and the
teacher answer key; the difficulty is authoring metadata and is not
rendered.

A question's optional `objective` is the id of the lesson-plan
objective the question serves (for example `o1` in the paired lesson
plan). It is a coverage key only — facts, never rendered — and it is
worksheet-only like `tier` and `difficulty`: validation is strict when
it is present (a non-string or empty `objective` is an error), and a
worksheet without it validates exactly as before. Exit-ticket questions
do not carry `objective`.

A worksheet's optional `variant` is worksheet-level, not per-question:
its only value is `homework`, and validation is strict when it is
present (a non-string or any other value is an error), while a
worksheet without it validates exactly as before. Exit tickets do not
carry `variant` at all. A homework worksheet is a spaced, low-stakes
selection across the topic, self-markable by design: `renderWorksheet`
adds a homework header line on the student sheet naming it homework,
low-stakes and self-marked, and `renderWorksheetAnswerKey` serves as
the self-mark key under that framing. Answers and explanations appear
only in the self-mark key, never on the question sheet — homework or
not — and a standard worksheet renders exactly as before.

## Exit ticket spec

An exit ticket is the short end-of-lesson check for a topic: a small set
of questions whose answers tell the teacher what to reteach next lesson.
`validateExitTicket` in `player/validate.js` enforces this contract and
returns a `string[]` of errors, exactly like `validateSpec` (empty =
valid).

Exit ticket fields:

| field       | type       | notes                                  |
|-------------|------------|----------------------------------------|
| `title`     | string     | required non-empty                     |
| `level`     | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject`   | string     | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`     | string     | required non-empty                     |
| `questions` | Question[] | required array of 3 to 5 questions     |

Exit-ticket feedback is the per-question `feedback` field (see the
Question table below): feedback is written per answer, telling the student
what their answer shows, and it is keyed to a misconception via the
question's `misconception` field when the answer reveals one.

## Question (worksheet and exit ticket)

Worksheet and exit-ticket questions share one shape:

| field           | type    | notes |
|-----------------|---------|-------|
| `id`            | string  | required non-empty; unique within the document |
| `prompt`        | string  | required non-empty — the question text |
| `kind`          | `"multiple-choice"` \| `"short-answer"` | required |
| `choices`       | Choice[] | multiple-choice only: required array of at least 2 choices |
| `answer`        | string  | short-answer only: required non-empty — the expected answer |
| `explanation`   | string  | optional; the worksheet answer-key explanation — must be a non-empty string when present |
| `feedback`      | string  | optional; the exit-ticket per-answer feedback — must be a non-empty string when present |
| `misconception` | string  | optional; names the misconception the `explanation` or `feedback` addresses — must be a non-empty string when present |
| `marks`         | integer | optional; the total marks for the question — must be a positive integer when present |
| `markScheme`    | object  | optional; the mark scheme — see below; requires `marks` |
| `workedSolution` | string | optional; the step-by-step worked solution — must be a non-empty string when present, and is required on a short-answer question that carries a `markScheme` |
| `tier`          | string  | worksheet questions only; optional; one of `"support"` \| `"core"` \| `"extension"` — see the Worksheet spec; must be one of these values when present |
| `difficulty`    | integer | worksheet questions only; optional; an integer from 1 to 5 — see the Worksheet spec; must be an integer in that range when present |
| `objective`     | string  | worksheet questions only; optional; the id of the lesson-plan objective the question serves — see the Worksheet spec; must be a non-empty string when present |

A `Choice` is an object `{text, correct}`: `text` is a required non-empty
string, and `correct` marks the right answer — exactly one choice in a
multiple-choice question must carry `correct: true`; every other choice
omits `correct` or sets it to `false`.

A `markScheme` is an object `{points, alternatives, commonErrors, ecf}`.
`points` is a required non-empty array of credit points `{text, marks}`:
`text` is a required non-empty string naming what earns the credit, and
`marks` is a positive integer; the points' marks must sum exactly to the
question's `marks`, so a `markScheme` without `marks` is invalid.
`alternatives` (other acceptable answers) and `commonErrors` are
optional arrays of non-empty strings. `ecf` is an optional boolean:
when true, error carried forward applies — a later step built on an
earlier wrong value can still earn its marks. The mark scheme and the
worked solution are teacher-key material: they render only in the
teacher answer key, never on the student sheet.

## Student notes spec

Student notes are the study-material companion to an animation spec: a
short set of notes a student reads before or after a lesson.
`validateNotes` in `player/validate.js` enforces this contract and
returns a `string[]` of errors, exactly like `validateSpec` (empty =
valid).

Notes fields:

| field            | type       | notes                                  |
|------------------|------------|----------------------------------------|
| `title`          | string     | required non-empty                     |
| `level`          | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject`        | string     | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`          | string     | required non-empty                     |
| `objectives`     | string[]   | required non-empty array; every entry a non-empty string |
| `definitions`    | Definition[] | required array of at least 1 definition |
| `mechanismSteps` | string[]   | required non-empty array; every entry a non-empty string |
| `workedExample`  | string     | required non-empty |
| `trap`           | object     | required; see below |

A `Definition` is an object `{term, meaning}`: both `term` and
`meaning` are required non-empty strings.

The `trap` is an object `{misconception, explanation}`: both
`misconception` and `explanation` are required non-empty strings. The
misconception names the common wrong turn for this topic, and the
explanation states why it is wrong and what to do instead.

## Teacher script spec

A teacher script is the delivery companion to an animation spec: a
timed sequence of segments a teacher follows while teaching a topic.
`validateScript` in `player/validate.js` enforces this contract and
returns a `string[]` of errors, exactly like `validateSpec` (empty =
valid).

Script fields:

| field      | type      | notes                                  |
|------------|-----------|----------------------------------------|
| `title`    | string    | required non-empty                     |
| `level`    | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject`  | string    | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`    | string    | required non-empty                     |
| `segments` | Segment[] | required non-empty array               |

Segment fields:

| field       | type     | notes |
|-------------|----------|-------|
| `minutes`   | number   | required positive number |
| `say`       | string   | required non-empty — what the teacher says |
| `cue`       | string   | optional; must be a non-empty string when present |
| `questions` | string[] | optional; must be an array when present, every entry a non-empty string |
| `watchFor`  | string   | optional; must be a non-empty string when present — the student response or misconception to watch for |

Total timing: the `minutes` values of all segments must sum to
5..120 minutes (inclusive). The total is only evaluated when every
segment has a positive numeric `minutes` value.

## Lesson plan spec

A lesson plan is the plan a teacher script delivers from: the
objectives for one lesson, how success on each objective is recognised
and checked, and the timed activity sequence that delivers them.
`validateLessonPlan` in `player/validate.js` enforces this contract
and returns a `string[]` of errors, exactly like `validateScript`
(empty = valid).

Plan fields:

| field             | type        | notes                                  |
|-------------------|-------------|----------------------------------------|
| `title`           | string      | required non-empty                     |
| `level`           | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject`         | string      | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`           | string      | required non-empty                     |
| `durationMinutes` | number      | required positive number — the lesson length |
| `objectives`      | Objective[] | required non-empty array               |
| `activities`      | Activity[]  | required non-empty array               |

Objective fields:

| field              | type     | notes |
|--------------------|----------|-------|
| `id`               | string   | required non-empty, unique within the plan |
| `text`             | string   | required non-empty — what students will learn |
| `successCriteria`  | string[] | required non-empty array of non-empty strings — I-can statements that show the objective is met |
| `assessmentPoints` | string[] | required non-empty array of non-empty strings — where in the lesson the teacher checks this objective |

Activity fields:

| field            | type     | notes |
|------------------|----------|-------|
| `title`          | string   | required non-empty |
| `minutes`        | number   | required positive number |
| `objectiveIds`   | string[] | required non-empty array; every entry must reference a declared objective `id` |
| `scriptCue`      | string   | optional; must be a non-empty string when present — the teacher-script segment cue the activity is delivered by |
| `grouping`       | string   | optional; must be a non-empty string when present |
| `resources`      | string[] | optional; must be an array when present, every entry a non-empty string |
| `differentiation`| object   | optional; must be an object when present, with optional `support` and `stretch` fields, each a non-empty string when present |

Total timing: the `minutes` values of all activities must sum exactly
to `durationMinutes`. The total is only evaluated when every activity
has a positive numeric `minutes` value and `durationMinutes` is a
positive number.

## Scaffolds spec

A scaffolds material is the fading support paired with the student
notes for one topic: the language support a learner starts with,
withdrawn in ordered sets so the learner ends up writing unaided.
`validateScaffolds` in `player/validate.js` enforces this contract
and returns a `string[]` of errors, exactly like `validateNotes`
(empty = valid).

Material fields:

| field     | type          | notes                                  |
|-----------|---------------|----------------------------------------|
| `title`   | string        | required non-empty                     |
| `level`   | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject` | string        | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`   | string        | required non-empty                     |
| `sets`    | ScaffoldSet[] | required array of at least 2 sets      |

The sets array is in strictly fading order: the first set's `level`
is `full`, the last set's `level` is `minimal`, and set levels
advance through `full`, `partial`, `minimal` with no level repeated
and no level rising. Support is withdrawn across the sequence, never
within one labelled sheet.

Set fields:

| field      | type           | notes |
|------------|----------------|-------|
| `level`    | `"full"` \| `"partial"` \| `"minimal"` | the set's support level |
| `wordBank` | WordBankEntry[] | required non-empty array |
| `starters` | string[]       | required non-empty array of non-empty sentence starters |
| `frames`   | string[]       | required non-empty array of non-empty sentence frames, each containing at least one `___` gap marker |
| `cloze`    | ClozeItem[]    | required non-empty array |

WordBankEntry fields:

| field   | type   | notes |
|---------|--------|-------|
| `term`  | string | required non-empty, unique within the set — drawn from the paired student notes definitions |
| `gloss` | string | required non-empty — a short learner-facing meaning |

ClozeItem fields:

| field     | type     | notes |
|-----------|----------|-------|
| `text`    | string   | required non-empty — built from the paired notes mechanism steps and definitions, carrying one `___` gap marker per answer |
| `answers` | string[] | required non-empty array, one answer per gap marker in order; every answer is a `term` of the same set's word bank |

The gap marker is exactly `___` (three underscores) in frames and
cloze text alike. Cloze answers are teacher-key only: they are part
of the material's shape here, and any rendering of a scaffolds
material must keep them out of the student-facing text.

Fading counts: along the sets sequence, the counts of word-bank
terms, starters, frames and cloze gaps (the total number of cloze
answers in the set) must each be non-increasing — support never
grows as it fades.

## Diagnostics spec

A diagnostics material is the misconception-coded question set for one
topic: a short prior-knowledge Do Now that opens the lesson, plus hinge
questions asked mid-lesson where the teacher pivots on the answers.
`validateDiagnostics` in `player/validate.js` enforces this contract
and returns a `string[]` of errors, exactly like `validateScaffolds`
(empty = valid).

Material fields:

| field           | type          | notes                                  |
|-----------------|---------------|----------------------------------------|
| `title`         | string        | required non-empty                     |
| `level`         | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject`       | string        | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`         | string        | required non-empty                     |
| `doNow`         | Question[]    | required array of 2..4 questions — the prior-knowledge opener |
| `hingeQuestions` | Question[]   | required array of 1..3 questions — the mid-lesson pivot checks |

Every question in both arrays reuses the shared Question shape (see
"Question (worksheet and exit ticket)") with these diagnostics rules:

- `id` is required non-empty and unique across BOTH arrays.
- `prompt` is required non-empty.
- `kind` must be `multiple-choice` — diagnostics questions are always
  multiple-choice, so `short-answer` (and a missing kind) is rejected.
- `choices` is a required array of at least 2 choices with exactly one
  choice marked `correct: true`.
- Every hinge question carries a required non-empty `scriptCue`: the
  cue of the teacher-script segment where the teacher pivots on the
  answer. `scriptCue` does not belong on Do Now questions and must be
  absent there.

Choice fields beyond the shared `{text, correct}` shape:

| field           | type   | notes |
|-----------------|--------|-------|
| `misconception` | string | required on every incorrect choice: the topic misconception bank entry's `wrongTurn` verbatim (for a faceted entry, the primary facet's `wrongTurn`); the correct choice must NOT carry it |
| `rationale`     | object | required on every incorrect choice; the correct choice must NOT carry it — see below |

A `rationale` is an object with exactly three fields, each a required
non-empty string:

| field     | notes |
|-----------|-------|
| `chose`   | what the student chose |
| `thinks`  | what the student is most likely thinking |
| `reteach` | how the teacher reteaches the point |

No other keys are allowed on a rationale. The `misconception` code and
the `rationale` are teacher-only: they never appear on a student sheet,
and no rationale part text may appear verbatim in the question prompt
or in any choice text of the same question — rationale wording must
never leak onto student-renderable fields. The validator checks the
code's presence and shape only; it never checks bank membership.

## Worked-example set spec

A worked-example set is one topic taught by example in fading order:
a complete annotated example the student studies, a faded example
whose later steps are withheld for the student to complete, and a
paired example-problem the student attempts alone.
`validateWorkedExamples` in `player/validate.js` enforces this
contract and returns a `string[]` of errors, exactly like
`validateDiagnostics` (empty = valid). The validator enforces
presence and shape only. The set is a sibling material: the notes
material's single `workedExample` string is a different field and is
unchanged by this section.

Material fields:

| field      | type   | notes |
|------------|--------|-------|
| `title`    | string | required non-empty |
| `level`    | `"primary"` \| `"secondary"` \| `"jc"` | |
| `subject`  | string | required non-empty — any school subject, not restricted to the syllabus-known list |
| `topic`    | string | required non-empty |
| `complete` | object | the complete annotated example — see below |
| `faded`    | object | the faded-steps example — see below |
| `paired`   | object | the paired example-problem — see below |

The `complete` example:

| field             | type     | notes |
|-------------------|----------|-------|
| `problem`         | string   | required non-empty |
| `steps`           | object[] | required array of at least 2 steps, in working order |
| `selfExplanation` | string   | required non-empty — the prompt asking the student to explain the method in their own words |

Every `complete` step is an object with `text` (the step itself) and
`annotation` (why the step works); both are required non-empty
strings.

The `faded` example has the same `problem`, `steps` and
`selfExplanation` fields, with step differences: a faded step's
`annotation` is optional (when present it must be a non-empty string)
and every faded step carries a required boolean `withheld`. At least
one step must be shown (`withheld: false`) and at least one step must
be withheld, and the withheld steps form a suffix — once a step is
withheld, every later step is withheld too. A withheld step's `text`
and `annotation` are teacher-key only: they are the answers the
student is meant to produce, and any rendering of a worked-example
set must keep them out of the student-facing text.

The `paired` example-problem is an object with a required non-empty
`problem` and a required non-empty `solution`. The `solution` is
teacher-key only, like a withheld step: it never appears on a student
sheet.

## Quiz bank spec

A quiz bank is the cumulative formative question bank for one topic:
a set of short retrieval items a teacher can draw on across sessions
to check that earlier learning still sticks, long after the lesson
that taught it. `validateQuizBank` in `player/validate.js` enforces
this contract and returns a `string[]` of errors, exactly like
`validateDiagnostics` (empty = valid). The validator enforces
presence and shape only; it never checks bank membership.

Material fields:

| field   | type       | notes                                  |
|---------|------------|----------------------------------------|
| `title` | string     | required non-empty                     |
| `level` | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject` | string   | required non-empty - any school subject, not restricted to the syllabus-known list |
| `topic` | string     | required non-empty                     |
| `items` | object[]   | required array of at least 4 retrieval items - see below |

Every item is an object with these fields:

| field              | type     | notes |
|--------------------|----------|-------|
| `prompt`           | string   | required non-empty - the retrieval question put to the student |
| `answer`           | string   | required non-empty - the teacher key: the correct answer the response is marked against. It never appears on a student sheet. |
| `choices`          | string[] | optional - when present, an array of at least 2 non-empty strings the student picks from; the `answer` is the correct one |
| `misconceptionCode` | string  | optional - when present, a non-empty string: the topic misconception bank entry's `wrongTurn` verbatim (for a faceted entry, the primary facet's `wrongTurn`), naming the wrong turn the item is built to catch |
| `outcomeCode`      | string   | optional - when present, a non-empty string: the syllabus outcome code the item retrieves against, recorded as a fact only |

Items are retrieval practice, not new teaching: each one can be
answered in about a minute from memory, and the bank as a whole
spans the topic so it stays useful across sessions. The bank is
generated from the topic's misconception bank entry (see
`generateQuizBank`): a topic with no bank entry cannot grow a quiz
bank, because its coded items would have to invent misconceptions.

## Revision spec

A revision material is the per-topic study set a student works
through after the lesson: flashcards for recall plus spaced-practice
sets scheduled by study offset. It is derived, never free-authored:
every flashcard and practice item comes verbatim from the topic's
paired quiz bank and student notes. `validateRevision` in
`player/validate.js` enforces this contract and returns a `string[]`
of errors, exactly like `validateQuizBank` (empty = valid). The
validator enforces presence and shape only; it never checks
derivation or bank membership.

Material fields:

| field   | type       | notes                                  |
|---------|------------|----------------------------------------|
| `title` | string     | required non-empty                     |
| `level` | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject` | string   | required non-empty - any school subject, not restricted to the syllabus-known list |
| `topic` | string     | required non-empty                     |
| `flashcards` | object[] | required array of at least 4 flashcards - see below |
| `practiceSets` | object[] | required array of at least 2 spaced-practice sets - see below |

Every flashcard is an object with these fields:

| field   | type     | notes |
|---------|----------|-------|
| `front` | string   | required non-empty - the prompt side of the card |
| `back`  | string   | required non-empty - the answer side of the card |
| `source` | string  | required - one of `quiz-bank`, `definition`, `trap`, naming where the card was derived from |

Derivation is verbatim: a `definition` card's front and back are a
notes definition's term and meaning; a `trap` card's front and back
are the notes trap's misconception and explanation; a `quiz-bank`
card's front and back are a quiz bank item's prompt and answer.

Every practice set is an object with these fields:

| field       | type     | notes |
|-------------|----------|-------|
| `dayOffset` | integer  | required positive - the study offset in days; strictly increasing across the sets in the array. Offsets only: the material carries no dates and no student state. |
| `items`     | object[] | required non-empty array of practice items, each `{prompt, answer}` with both fields required non-empty strings, taken verbatim from quiz bank items (prompt and answer) |

A revision material is generated from the topic's misconception
bank entry (see `generateRevision`): a topic with no bank entry
cannot grow a revision material, because its coded content would
have to invent misconceptions.

## Organisers spec

A graphic organisers material is the per-topic set of structured
templates a student completes while studying the topic: each
template pre-organises the topic content into labelled slots the
student fills in. The slot entries are derived, never free-authored:
a flow template's entries are the topic's unpack stages in order,
and every other template's entries are drawn verbatim from the
paired student notes (its mechanism steps and definitions).
`validateOrganisers` in `player/validate.js` enforces this contract
and returns a `string[]` of errors, exactly like `validateRevision`
(empty = valid). The validator enforces presence and shape only; it
never checks derivation.

Material fields:

| field   | type       | notes                                  |
|---------|------------|----------------------------------------|
| `title` | string     | required non-empty                     |
| `level` | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject` | string   | required non-empty - any school subject, not restricted to the syllabus-known list |
| `topic` | string     | required non-empty                     |
| `templates` | object[] | required array of at least 2 templates - see below |

Every template is an object with these fields:

| field   | type     | notes |
|---------|----------|-------|
| `kind`  | string   | required - one of `kwl`, `frayer`, `venn`, `flow`, `concept-map` |
| `slots` | object[] | required non-empty array of slots - see below |

Every slot is an object with these fields:

| field   | type     | notes |
|---------|----------|-------|
| `label` | string   | required non-empty - the slot's heading |
| `entries` | string[] | required non-empty array of non-empty strings - the pre-filled content, derived verbatim as above |
| `studentPrompt` | string | optional non-empty - what the student completes in this slot |

An organisers material is generated from the shared lesson unpack
and the topic's paired notes content (see `generateOrganisers`):
the caller may supply the paired notes definitions and mechanism
steps, and the author prompt renders them so slot entries can be
derived from them. No misconception bank entry is required: a
topic with gold notes but no bank entry can still grow an
organisers material.

## Summative assessment spec

A summative assessment is the unit-level assessment sat at the end
of a unit of teaching: it spans at least 2 topics and is taken under
exam conditions, with a fixed duration and a marks total.
`validateSummative` in `player/validate.js` enforces this contract
and returns a `string[]` of errors (empty = valid). A summative
assessment is a standalone unit-level material: it is never folded
into a lesson pack.

Material fields:

| field   | type       | notes                                  |
|---------|------------|----------------------------------------|
| `title` | string     | required non-empty                     |
| `level` | `"primary"` \| `"secondary"` \| `"jc"` |                                        |
| `subject` | string   | required non-empty - any school subject |
| `unitTitle` | string | required non-empty - the unit the assessment covers |
| `topics` | string[]  | required array of at least 2 topic slugs the unit spans |
| `durationMinutes` | integer | required positive - the exam-format time allowed |
| `totalMarks` | integer | required positive - the marks the blueprint sums to |
| `blueprint` | object[] | required non-empty array of blueprint rows - see below |
| `items` | object[]   | required non-empty array of assessment items - see below |
| `rubric` | object    | required - the student-work rubric, see below |
| `moderation` | object | required - `{state}`, one of `unreviewed` \| `in-moderation` \| `approved` \| `rejected`, reusing the lesson pack metadata moderation states |
| `review` | object \| null | the moderation review record `{reviewer, date}`; null until signed |

Every blueprint row is an object with these fields:

| field              | type     | notes |
|--------------------|----------|-------|
| `outcomeCode`      | string   | required non-empty - the syllabus outcome code the row assesses |
| `assessmentObjective` | string | required non-empty - the assessment objective (AO) the row serves |
| `marks`            | integer  | required positive - the row marks; the row marks sum exactly to `totalMarks` |
| `cognitiveLevel`   | string   | required non-empty - the Bloom/DOK label for the row |

Every item is an object with these fields:

| field          | type     | notes |
|----------------|----------|-------|
| `prompt`       | string   | required non-empty - the question put to the student |
| `blueprintRow` | integer  | required - the zero-based index of the item's blueprint row; every row has at least one item, and the items on a row sum exactly to that row's marks |
| `commandWord`  | string   | required non-empty - the exam command word (Calculate, Explain, Show that) matching the row's cognitive level |
| `marks`        | integer  | required positive |
| `markScheme`   | object   | required - validated by the per-question mark scheme machinery (credit points summing exactly to the item marks) |

The `rubric` is a field inside the material (not a separate
material): an object with a `criteria` array of at least 1
criterion, each `{name, levels}` with at least 2 levels
`{label, descriptor}` for judging open responses.

Moderation reuses the pack metadata moderation block: the same
state set, defaulting to `unreviewed`. State `approved` is refused
without a review record `{reviewer, date}` on the material - no
summative assessment is moderated without a named reviewer
(plan Gate 4). A generated assessment is born `unreviewed` with
`review: null`; naming the reviewer is an owner adoption-time
activity.

## Accessible variants

Every printable renderer in `player/printable.js` (`renderWorksheet`,
`renderWorksheetAnswerKey`, `renderExitTicket`,
`renderExitTicketAnswerKey`, `renderNotes`, `renderScript`,
`renderLessonPlan`, `renderScaffolds`, `renderScaffoldsAnswerKey`)
accepts an optional second argument, an options object with three
boolean fields: `enlargedPrint`, `unclutteredLayout` and
`chunkInstructions`. A field is on only when it is exactly `true`.
An absent options argument, `null`, a non-object value, an empty
object and an all-false object all mean every variant is off, and
unknown fields are ignored; passing options never throws. Every
renderer renders the spec's `instructions` in its sheet header, and
that header is the only place the variants take effect.

- `enlargedPrint` appends the `pr-enlarged` class to the sheet's
  outer `section` element, after the existing kind classes. No other
  markup changes. In `player/printable.css`, `.pr-enlarged` renders
  the title at 32px and the body text classes (prompt, instructions,
  choice, answer, objective, mechanism step, say, term, meaning and
  worked example) at roughly 25% larger than the default sizes
  (16px to 20px, 15px to 19px) with `line-height: 1.7`.
- `unclutteredLayout` appends the `pr-uncluttered` class to the
  sheet's outer `section` element, after `pr-enlarged` when both are
  on (the class order is fixed: `pr-enlarged` before
  `pr-uncluttered`). No content is removed or hidden. In
  `player/printable.css`, `.pr-uncluttered` removes the decorative
  framing (the sheet renders with a white background, no border and
  no border radius, and the notes trap box loses its border and
  padding) and increases the spacing between questions and script
  segments (margin-bottom 20px to 36px).
- `chunkInstructions` changes only how the spec's `instructions`
  render. Instead of the default single
  `<p class="pr-instructions">` paragraph, the raw instruction text
  is split into sentences and rendered as
  `<ul class="pr-instructions pr-instructions-chunked">` with one
  `<li class="pr-instruction">` per sentence, each sentence
  HTML-escaped individually after splitting. A split happens at a
  sentence terminator (`.`, `!` or `?`) followed by whitespace and an
  uppercase letter or a digit, so decimals such as `1.5` and
  abbreviations such as `e.g.` do not split, and a trailing sentence
  with no terminator is a single chunk. When the spec has no
  instructions (or an empty string), no instructions markup renders,
  exactly as without the option.

Byte-identity contract: with no options, or with every option off,
each renderer returns output byte-identical to the un-optioned
rendering. The class variants change nothing but the outer section's
class attribute; stylesheets and consumers key the enlarged and
uncluttered presentation off those classes.

Materials are scored by `scoreMaterial` in
`generator/materials-rubric.js`, which returns the animation-rubric
shape (`score`, `maxScore`, `dimensions`, plus `kind` and `stats`)
measured over student-facing text only: worksheet and exit-ticket
instructions and question prompts, notes titles, body sections,
definitions and mechanism steps, scaffold word banks, starters,
frames and cloze text, and deck slide titles, headings, body text,
bullets and lines. Teacher-only text is never measured — per-question
answer fields, `markScheme` and `workedSolution`, deck speaker notes,
and teacher-script segments (including `watchFor`) are never read, so
a teacher script extracts no student text at all. The reading-age
dimension uses the Flesch Reading Ease formula
206.835 − 1.015×(words/sentences) − 84.6×(syllables/words), with
syllables counted by the documented approximate rule in the module
header (vowel runs with silent-e and -ed/-es adjustments and a final
'ia' hiatus), and a grade level of approximately (110 − ease)/10
clamped to 3–18 and rounded to 1 decimal place. The reading age is a
heuristic signal for a human reviewer only; it is never a gate.

## Lesson pack spec

A lesson pack is the bundle `generateLessonPack` in
`generator/pipeline.js` returns for one topic: all twelve teaching
materials for the topic, authored together so they agree with each
other. `generateLessonPackForSyllabus` is the syllabus-keyed entry
point to the same contract (see Cache below).

Pack shape: an object with exactly the keys `manifest`, `animation`,
`slides`, `worksheet`, `notes`, `exitTicket`, `script`, `lessonPlan`,
`scaffolds`, `diagnostics`, `workedExamples`, `quizBank`, `revision`.
Each material value is a spec that validates clean against its own
section of this document: `animation` via `validateSpec`, `slides`
via `validateSlides`, `worksheet` via `validateWorksheet`, `notes`
via `validateNotes`, `exitTicket` via `validateExitTicket`, `script`
via `validateScript`, `lessonPlan` via `validateLessonPlan`,
`scaffolds` via `validateScaffolds`, `diagnostics` via
`validateDiagnostics`, `workedExamples` via
`validateWorkedExamples`, `quizBank` via `validateQuizBank`, and
`revision` via `validateRevision`.

Manifest shape: `manifest` has exactly the keys `slug`, `topic`,
`level`, `subject`, `version`, `materials`, `metadata`.

- `slug` is derived deterministically from the call's `topic`,
  `level`, and `subject` options, in that order. Each part is
  trimmed, lowercased, every run of non-alphanumeric characters is
  collapsed to a single hyphen, and edge hyphens are stripped; empty
  parts are dropped and the remaining parts are joined with hyphens.
  If every part is empty the slug is `untitled`.
- `topic`, `level`, and `subject` echo the resolved call options.
- `version` is the generator (package) version in Node, and the
  string `unknown` in the browser, where no package version is
  available.
- `materials` is exactly the twelve material keys in pack order:
  `animation`, `slides`, `worksheet`, `notes`, `exitTicket`,
  `script`, `lessonPlan`, `scaffolds`, `diagnostics`, `workedExamples`,
  `quizBank`, `revision`.
- `metadata` is the pack's transparency block, emitted deterministically
  by `generateLessonPack` (never authored by the LLM) and validated by
  `validatePackMetadata` in `player/validate.js`. It has exactly the keys
  `syllabusYear`, `outcomeCodes`, `assessmentObjectives`, `aiGenerated`,
  `review`, `moderation`:
  - `syllabusYear` is the year of the syllabus edition the topic maps
    to, or `null` when the topic does not resolve against the syllabus
    data.
  - `outcomeCodes` and `assessmentObjectives` are arrays of
    `{code, title}` entries: official MOE/SEAB code identifiers plus
    short titles, recorded as facts only -- syllabus text is never
    reproduced (Copyright Act 2021). Facts are recorded in the syllabus
    data (`generator/syllabus.js`, mirrored in `web/syllabus.js` and
    `SYLLABUS.md`); a topic with no recorded facts emits empty lists.
  - `aiGenerated` is `{label, model, generatorVersion}`: the label
    states the pack is AI-generated, `model` is the model identity
    available to the call (`unknown` when none is supplied), and
    `generatorVersion` is the generator (package) version.
  - `review` is the human sign-off block, `null` until signed; when
    signed it is `{reviewer, reviewDate}`.
  - `moderation` is `{state}`, one of `unreviewed`, `in-moderation`,
    `approved`, `rejected`; generated packs start `unreviewed`.

Shared unpack: one shared unpack stage authors all twelve materials, so
the whole pack shares one set of transitions (with the topic's
misconceptions attached), one worked example, and one misconception
set. Materials are authored sequentially in pack order.

Failure semantics: a missing `deps.callChat`, or a missing validator
for any material, rejects before any authoring happens. The
diagnostics material is generated from the topic's misconception
bank entry (resolved via `misconceptionFor` on the topic, verbatim
then slugified, with the call's facet): a topic with no bank entry
likewise rejects before any authoring, with an error naming
diagnostics - the pack never invents misconceptions and never
silently omits the diagnostics material. The quiz bank is authored
from the same shared unpack and that same already-resolved bank
entry, so it introduces no new failure mode of its own. The revision
material is authored from the same shared unpack and that same
already-resolved bank entry, so it likewise introduces no new
failure mode of its own. Each material
is authored through its builder, validator, and repair loop (repair
cap `opts.maxRepairs`, default 3); a material that exhausts its
repair cap rejects the whole pack, and the rejection error carries
`err.material` naming the failed material key and `err.problems`
holding that material's validator problems.

Cache: packs are cached in memory by manifest slug. A repeat call
whose slug is already cached resolves the cached pack object with
zero further LLM calls, unless `opts.force` is `true`, which
regenerates the pack and replaces the cached entry. The exported
`clearPackCache` empties the cache. `generateLessonPackForSyllabus`
resolves its syllabus id first — an unresolvable id rejects before
any LLM call — then merges the resolved `topic`, `topicLabel`,
`level`, and `subject` under any explicit non-undefined options, and
delegates to `generateLessonPack`, so a syllabus-keyed call and the
equivalent direct call share one cache entry.

## Validation

`player/validate.js` is the reference validator. `node --test "tests/*.test.js"`
runs it over every file in `samples/` plus negative cases.
It also ships a Node CLI — `node player/validate.js <spec.json>` — guarded by
`require.main === module`, so requiring it as a module or loading it in a
browser never runs the CLI. Exit codes: 0 = valid spec (names the file on
stdout); 2 = validation errors (one finding per line on stdout); 1 = bad
arguments, unreadable file, or invalid JSON (errors and usage on stderr).

## Export

`player/export-frames.js` defines the DOM-free deterministic per-frame SVG
contract (issue #506):

- `shapeMarkup` mirrors `drawShape`'s attribute decisions and geometry — the
  same defaults (fill `none`, stroke `#1a1a1a`, stroke-width 2, text-anchor
  `start`), the same geometry helpers — by reusing the player's exported pure
  helpers, so the contract cannot drift from the renderer.
- `sceneShapes` replays the scene timeline with the player's instant semantics
  (`renderSceneAt(i, ms, instant=true)`), except move steps interpolate at
  p = (ms - at_ms) / (dur_ms || 800) so mid-tween frames match the live tween
  position. Fades are flattened — a frame either contains a shape or it does
  not; emphasize is a geometric no-op; caption targets the HTML chrome and is
  ignored.
- `renderFrame` returns a standalone byte-deterministic `<svg>` (byte-identical
  across runs and processes); `frameMs` / `sceneFrameCount` define the
  frame-index contract. Text content is XML-escaped; latex shapes render
  through the no-KaTeX fallback (`latexFallbackText`), exactly like the player
  without KaTeX loaded.

`player/export-record.js` is the browser recording harness consuming that
contract:

- It rasterizes each frame's SVG string to an offscreen canvas at a fixed fps
  (default 30) and feeds `canvas.captureStream()` into MediaRecorder, producing
  a WebM blob.
- Wall-clock pacing: frames are drawn on a timer at 1000/fps ms and the stream
  is captured at the same fps, so playback runs at the export fps in real time —
  a 12s scene takes ~12s to record; it is a recorder, not a fast renderer.
- Pure DOM-free helpers: `buildFramePlan`; `defaultExportName`
  (`<slug>-YYYYMMDD-HHmmss.webm`, injectable timestamp so repeats never
  overwrite each other); `preferredMimeTypes` (vp9, then vp8, then plain webm;
  fail-closed — `pickMimeType` returns `''` when nothing is supported);
  `supportCheck` with human-readable reasons.
- `recordSpec` reads every browser capability through an injectable `env`
  (`{ document, Image, MediaRecorder, Blob }`) — never bare globals — so the
  whole pipeline runs in Node under test with fakes.

`player/export-ui.js` wires the harness to a demo page:

- One `attachExportUI(document, window, AnimathExportRecord,
  { getSpec, getSlug })` call: a native Export button plus a short status line
  (idle / recording progress / done with the file name / error reason);
  `player/demo.html` mounts it as `#exportbtn` + `#exportstatus` in the demo
  bar.
- Reduced-motion is respected: the full scene sequence always records at normal
  pace, never time-compressed.
- The button is a native `<button>` (keyboard-accessible by default); when
  MediaRecorder is absent it is disabled with the reason as its title and
  status ("Export unavailable: <reason>").

Honest limitation: the MediaRecorder wiring itself cannot run on this VM's Node
build; the testable contract is everything around it. Parent issue #506 stays
open for end-to-end browser-download acceptance.
