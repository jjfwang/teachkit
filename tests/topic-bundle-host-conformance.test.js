'use strict';
// Host conformance for #1648 (scope items 2-3): projectTopicBundleForHost
// + HOST_COMPATIBILITY + P5 equivalent-fractions fixtures (core +
// extended). The projection is the learner-safe JSON Aceceed's renderer
// adapter consumes: every answer key stripped, blueprint reduced to
// identity/objectives/beats, simulation check without correctIndex or
// explanation. Fixtures under tests/fixtures/ are regenerated from the
// shared mock and must match exactly, so they cannot go stale silently.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const topicBundle = require('../generator/topic-bundle.js');
const { makeMock, requestFor, contentFor, clone } = require('./topic-bundle-mock.js');

const STRIPPED_KEYS = ['answer', 'answers', 'expectedAnswer', 'correct', 'correctIndex',
  'rubric', 'feedback', 'markScheme', 'modelAnswer'];
const CHOICE_STRIPPED_KEYS = ['rationale', 'misconception'];
const FIXTURE_DIR = path.join(__dirname, 'fixtures');

async function generateBundle(mode, options) {
  const mock = makeMock('p5', options);
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { mode: mode, blueprintContent: contentFor('p5') }),
    { callChat: mock.callChat });
  return bundle;
}

// Every key present anywhere in a value, recursively.
function collectKeys(value, into) {
  if (Array.isArray(value)) { value.forEach((item) => collectKeys(item, into)); return into; }
  if (value !== null && typeof value === 'object') {
    Object.keys(value).forEach((key) => { into.add(key); collectKeys(value[key], into); });
  }
  return into;
}

// Paths (dot-joined) where a string value occurs, recursively.
function valuePaths(value, target, prefix, out) {
  if (typeof value === 'string') { if (value === target) out.push(prefix); return; }
  if (Array.isArray(value)) { value.forEach((item, i) => valuePaths(item, target, prefix + '[' + i + ']', out)); return; }
  if (value !== null && typeof value === 'object') {
    Object.keys(value).forEach((key) => valuePaths(value[key], target, prefix ? prefix + '.' + key : key, out));
  }
}

// A minimal hand-built bundle for malformed-shape and 'none'
// declaration tests: the projection is pure, so no generation needed.
function minimalBundle() {
  return {
    schemaVersion: 'topic-bundle.v1',
    scope: { country: 'sg', topicId: 'equivalent-fractions' },
    mode: 'core',
    idempotencyKey: 'minimal-key',
    blueprint: {
      identity: 'minimal-identity',
      request: { objectives: [{ objectiveId: 'P5-EF-1', text: 'Recognise equivalent fractions.' }] },
      content: { beats: [{ beatId: 'activate', objectiveIds: ['P5-EF-1'], kind: 'activate',
        durationSeconds: 60, visual: 'none' }] }
    },
    lessonPlan: { title: 'Minimal plan' },
    slides: { slides: [] },
    animation: null,
    visual: { kind: 'none',
      declarations: [{ visualId: 'vis-none', beatId: 'activate', requested: 'none',
        declaredMissing: true, reason: 'No visual needed.' }],
      simulation: null },
    assessment: { diagnostic: { doNow: [] }, formative: { worksheet: { questions: [] } }, exitTicket: { questions: [] } },
    materials: {},
    index: { byObjective: {}, byBeat: {} },
    manifest: { revision: 'minimal-revision', scopeKey: 'minimal-identity' },
    coherence: { capabilities: [], warnings: [] }
  };
}

function assertNoAnswerKeys(projection) {
  const keys = collectKeys(projection, new Set());
  for (const key of STRIPPED_KEYS.concat(CHOICE_STRIPPED_KEYS)) {
    assert.ok(!keys.has(key), 'stripped key leaked into projection: ' + key);
  }
}

function assertAnswerValuesLearnerSafe(projection) {
  // Answer values that survive only as multiple-choice choice texts
  // (where the correctness flag was stripped) or simulation check
  // options (where correctIndex was stripped): the text is kept, the
  // flag is gone.
  const choiceTextAnswers = ['Yes: 1/2 = 2/4.', '4/6'];
  for (const answer of choiceTextAnswers) {
    const paths = [];
    valuePaths(projection, answer, '', paths);
    assert.ok(paths.length > 0, 'answer value vanished entirely (choice text should be kept): ' + answer);
    for (const found of paths) {
      assert.ok(found.includes('choices') || found.includes('options'),
        'answer value ' + answer + ' leaked outside choices/options at ' + found);
    }
  }
  // Pure answer values (a quiz-bank answer, never a choice text) must
  // not appear anywhere: in core there is no quiz bank, in extended
  // the answer key is stripped.
  const strippedOnlyPaths = [];
  valuePaths(projection, 'The scaling factor for numerator and denominator.', '', strippedOnlyPaths);
  assert.deepEqual(strippedOnlyPaths, []);
  // Rubric criteria are server-only: they must not appear at all.
  const rubricPaths = [];
  valuePaths(projection, 'Produces the canonical answer and explains the method.', '', rubricPaths);
  assert.deepEqual(rubricPaths, []);
  // A correct choice keeps its text but loses its flag.
  const diagnostics = projection.assessment.diagnostic;
  const correctChoice = diagnostics.doNow[0].choices.find((choice) => choice.text === 'Yes: 1/2 = 2/4.');
  assert.ok(correctChoice, 'correct choice text missing from projection');
  assert.equal(correctChoice.correct, undefined);
  assert.equal(correctChoice.rationale, undefined);
  assert.equal(correctChoice.misconception, undefined);
}

function assertDeclarationsMatchMatrix(projection) {
  const matrix = topicBundle.HOST_COMPATIBILITY;
  assert.ok(matrix.visualKinds.includes(projection.visual.kind), 'visual kind not in matrix: ' + projection.visual.kind);
  for (const declaration of projection.visual.declarations) {
    const shape = matrix.declarationShapes[declaration.requested];
    assert.ok(shape, 'declaration requested kind not in matrix: ' + declaration.requested);
    const allowed = new Set(shape);
    if (declaration.fallback !== undefined) {
      assert.ok(matrix.declarationFallback.values.includes(declaration.fallback),
        'fallback not in matrix: ' + declaration.fallback);
      allowed.add(matrix.declarationFallback.field);
      allowed.add(matrix.declarationFallback.payloadFields[declaration.fallback]);
    }
    for (const key of Object.keys(declaration)) {
      assert.ok(allowed.has(key), 'declaration field ' + key + ' not in matrix shape for ' + declaration.requested);
    }
  }
}

test('topic-bundle host conformance: matrix is versioned and truthful', () => {
  const matrix = topicBundle.HOST_COMPATIBILITY;
  assert.equal(typeof topicBundle.projectTopicBundleForHost, 'function');
  assert.equal(matrix.version, 'host-compat.v1');
  assert.equal(matrix.schemaVersion, 'topic-bundle.v1');
  assert.deepEqual(matrix.visualKinds, ['simulation', 'animation', 'diagram', 'slide-first', 'none']);
  assert.deepEqual(Object.keys(matrix.declarationShapes).sort(),
    ['animation', 'diagram', 'none', 'simulation', 'slide-first']);
  assert.deepEqual(matrix.animationFields, ['id', 'caption', 'narration', 'duration_ms', 'steps']);
  assert.deepEqual(matrix.animationStepFields, ['at_ms', 'do', 'shape', 'text']);
  assert.deepEqual(matrix.assessmentProjection.strippedFields, STRIPPED_KEYS);
  assert.deepEqual(matrix.assessmentProjection.choiceStrippedFields, CHOICE_STRIPPED_KEYS);
  assert.deepEqual(matrix.assessmentProjection.droppedSections, ['rubric']);
  assert.ok(Object.isFrozen(matrix), 'matrix must stay frozen so it cannot drift from the projection');
});

test('topic-bundle host conformance: P5 core projection is deterministic and matches its fixture', async () => {
  const bundle = await generateBundle('core');
  const before = JSON.stringify(bundle);
  const projection = topicBundle.projectTopicBundleForHost(bundle);
  // Deterministic: same bundle twice, and a regenerated bundle, project identically.
  assert.equal(JSON.stringify(topicBundle.projectTopicBundleForHost(bundle)), JSON.stringify(projection));
  const regenerated = await generateBundle('core');
  assert.equal(JSON.stringify(topicBundle.projectTopicBundleForHost(regenerated)), JSON.stringify(projection));
  // The projection never mutates the frozen bundle.
  assert.equal(JSON.stringify(bundle), before);
  assert.notEqual(projection.blueprint.beats[0], bundle.blueprint.content.beats[0]);
  assert.notEqual(projection.lessonPlan, bundle.lessonPlan);
  assert.notEqual(projection.assessment, bundle.assessment);
  assert.deepEqual(await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5')), []);
  // Identity and versioning.
  assert.equal(projection.schemaVersion, 'host-projection.v1');
  assert.equal(projection.compatibilityVersion, 'host-compat.v1');
  assert.equal(projection.mode, 'core');
  assert.equal(projection.revision, bundle.manifest.revision);
  assert.equal(projection.scopeKey, bundle.manifest.scopeKey);
  assert.equal(projection.idempotencyKey, bundle.idempotencyKey);
  assert.deepEqual(projection.scope, bundle.scope);
  // Blueprint: identity, objectives and beats only; no assessments with
  // expectedAnswer or rubric.
  assert.equal(projection.blueprint.identity, bundle.blueprint.identity);
  assert.deepEqual(projection.blueprint.objectives, bundle.blueprint.request.objectives);
  assert.deepEqual(projection.blueprint.beats.map((beat) => beat.beatId),
    ['activate', 'explain', 'predict', 'practice', 'exit']);
  assert.deepEqual(projection.blueprint.beats[1],
    { beatId: 'explain', objectiveIds: ['P5-EF-1'], kind: 'explain', durationSeconds: 360, visual: 'animation' });
  // Slides keep their full sequence with beat and objective ids.
  assert.deepEqual(projection.slides.slides.map((slide) => slide.beatId),
    bundle.slides.slides.map((slide) => slide.beatId));
  assert.deepEqual(projection.slides.slides[5].objectiveIds, ['P5-EF-1', 'P5-EF-2']);
  // Core mode authors no animation; the explain beat falls back to a
  // diagram, recorded in the coherence warnings.
  assert.equal(projection.animation, null);
  assert.equal(projection.visual.kind, 'diagram');
  assert.equal(projection.visual.simulation, null);
  assert.ok(projection.coherence.warnings.some((w) => w.includes('fell back from animation')));
  const explain = projection.visual.declarations.find((d) => d.beatId === 'explain');
  assert.equal(explain.requested, 'animation');
  assert.equal(explain.fallback, 'diagram');
  assert.equal(typeof explain.diagram, 'string');
  assertDeclarationsMatchMatrix(projection);
  // Index is ids only and matches the bundle.
  assert.deepEqual(projection.index, bundle.index);
  assert.deepEqual(projection.index.byObjective['P5-EF-1'].beatIds, ['activate', 'explain', 'exit']);
  // Assessment: prompts, choice texts and marks kept; every answer key gone.
  assert.equal(projection.assessment.rubric, undefined);
  assert.equal(projection.assessment.formative.worksheet.questions[0].answer, undefined);
  assert.equal(projection.assessment.formative.worksheet.questions[0].marks, 2);
  assert.equal(projection.assessment.exitTicket.questions[0].feedback, undefined);
  assertNoAnswerKeys(projection);
  assertAnswerValuesLearnerSafe(projection);
  // Committed fixture: regenerating must equal it exactly.
  const fixture = fs.readFileSync(path.join(FIXTURE_DIR, 'topic-bundle-host-projection-p5-core.json'), 'utf8');
  assert.equal(fixture, JSON.stringify(projection, null, 2) + '\n');
});

test('topic-bundle host conformance: P5 extended projection carries animation and quiz bank', async () => {
  const bundle = await generateBundle('extended');
  const projection = topicBundle.projectTopicBundleForHost(bundle);
  assert.equal(JSON.stringify(topicBundle.projectTopicBundleForHost(bundle)), JSON.stringify(projection));
  const regenerated = await generateBundle('extended');
  assert.equal(JSON.stringify(topicBundle.projectTopicBundleForHost(regenerated)), JSON.stringify(projection));
  assert.equal(projection.mode, 'extended');
  assert.equal(projection.animation.scenes[0].id, 'fraction-bar-scene');
  assert.equal(projection.visual.kind, 'animation');
  assert.deepEqual(projection.coherence.warnings, []);
  const explain = projection.visual.declarations.find((d) => d.beatId === 'explain');
  assert.equal(explain.requested, 'animation');
  assert.equal(explain.sceneId, 'fraction-bar-scene');
  assert.equal(explain.fallback, undefined);
  for (const scene of projection.animation.scenes) {
    for (const key of Object.keys(scene)) {
      assert.ok(topicBundle.HOST_COMPATIBILITY.animationFields.includes(key), 'scene field not in matrix: ' + key);
    }
    for (const step of scene.steps) {
      for (const key of Object.keys(step)) {
        assert.ok(topicBundle.HOST_COMPATIBILITY.animationStepFields.includes(key), 'step field not in matrix: ' + key);
      }
    }
  }
  assertDeclarationsMatchMatrix(projection);
  assert.equal(projection.assessment.formative.quizBank.items.length, 4);
  assert.equal(projection.assessment.formative.quizBank.items[0].prompt, 'First worked answer?');
  assert.equal(projection.assessment.formative.quizBank.items[0].answer, undefined);
  assertNoAnswerKeys(projection);
  assertAnswerValuesLearnerSafe(projection);
  const fixture = fs.readFileSync(path.join(FIXTURE_DIR, 'topic-bundle-host-projection-p5-extended.json'), 'utf8');
  assert.equal(fixture, JSON.stringify(projection, null, 2) + '\n');
});

test('topic-bundle host conformance: simulation projection keeps the spec without its check answers', async () => {
  const content = contentFor('p5');
  content.beats.find((b) => b.beatId === 'predict').visual = 'simulation';
  const mock = makeMock('p5');
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: content }), { callChat: mock.callChat });
  const projection = topicBundle.projectTopicBundleForHost(bundle);
  assert.equal(projection.visual.kind, 'simulation');
  const predict = projection.visual.declarations.find((d) => d.beatId === 'predict');
  assert.equal(predict.requested, 'simulation');
  assert.equal(predict.model, 'fraction-bars');
  assert.equal(predict.exampleId, 'thirds-sixths');
  assertDeclarationsMatchMatrix(projection);
  assert.equal(projection.visual.simulation.model, 'fraction-bars');
  assert.equal(projection.visual.simulation.check.question, 'Which fraction is shaded?');
  assert.deepEqual(projection.visual.simulation.check.options, ['2/3', '4/6']);
  assert.equal(projection.visual.simulation.check.correctIndex, undefined);
  assert.equal(projection.visual.simulation.check.explanation, undefined);
  assertNoAnswerKeys(projection);
});

test('topic-bundle host conformance: slide-first projection declares slide indexes', async () => {
  const mock = makeMock('p5', { slideFirstVisuals: true });
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  const projection = topicBundle.projectTopicBundleForHost(bundle);
  assert.equal(projection.visual.kind, 'slide-first');
  assert.ok(projection.visual.declarations.length > 0);
  for (const declaration of projection.visual.declarations) {
    assert.equal(declaration.requested, 'slide-first');
    assert.equal(declaration.slideIndex, 0);
  }
  assertDeclarationsMatchMatrix(projection);
  assertNoAnswerKeys(projection);
});

test('topic-bundle host conformance: a declared-missing visual projects with its reason', () => {
  const projection = topicBundle.projectTopicBundleForHost(minimalBundle());
  assert.equal(projection.schemaVersion, 'host-projection.v1');
  assert.equal(projection.visual.kind, 'none');
  assert.deepEqual(projection.visual.declarations,
    [{ visualId: 'vis-none', beatId: 'activate', requested: 'none', declaredMissing: true, reason: 'No visual needed.' }]);
  assert.equal(projection.animation, null);
  assert.equal(projection.visual.simulation, null);
  assert.equal(projection.blueprint.beats[0].visual, 'none');
  assertDeclarationsMatchMatrix(projection);
});

test('topic-bundle host conformance: malformed bundles throw a clear error', () => {
  const cases = [
    ['not an object', () => null],
    ['a string', () => 'topic-bundle.v1'],
    ['wrong schemaVersion', () => { const b = minimalBundle(); b.schemaVersion = 'topic-bundle.v2'; return b; }],
    ['missing schemaVersion', () => { const b = minimalBundle(); delete b.schemaVersion; return b; }],
    ['missing manifest', () => { const b = minimalBundle(); delete b.manifest; return b; }],
    ['missing blueprint', () => { const b = minimalBundle(); delete b.blueprint; return b; }],
    ['missing materials', () => { const b = minimalBundle(); delete b.materials; return b; }],
    ['missing scope', () => { const b = minimalBundle(); delete b.scope; return b; }],
    ['missing blueprint request', () => { const b = minimalBundle(); delete b.blueprint.request; return b; }],
    ['missing blueprint content', () => { const b = minimalBundle(); delete b.blueprint.content; return b; }],
    ['objectives not an array', () => { const b = minimalBundle(); b.blueprint.request.objectives = {}; return b; }],
    ['beats not an array', () => { const b = minimalBundle(); b.blueprint.content.beats = {}; return b; }],
    ['beat without objectiveIds', () => { const b = minimalBundle(); delete b.blueprint.content.beats[0].objectiveIds; return b; }],
    ['missing lessonPlan', () => { const b = minimalBundle(); delete b.lessonPlan; return b; }],
    ['missing slides', () => { const b = minimalBundle(); delete b.slides; return b; }],
    ['missing visual', () => { const b = minimalBundle(); delete b.visual; return b; }],
    ['declarations not an array', () => { const b = minimalBundle(); b.visual.declarations = {}; return b; }],
    ['missing assessment', () => { const b = minimalBundle(); delete b.assessment; return b; }],
    ['missing index', () => { const b = minimalBundle(); delete b.index; return b; }],
    ['missing coherence', () => { const b = minimalBundle(); delete b.coherence; return b; }],
    ['capabilities not an array', () => { const b = minimalBundle(); b.coherence.capabilities = {}; return b; }],
    ['warnings not an array', () => { const b = minimalBundle(); b.coherence.warnings = {}; return b; }]
  ];
  for (const [label, build] of cases) {
    assert.throws(() => topicBundle.projectTopicBundleForHost(build()),
      /projectTopicBundleForHost/, 'malformed case did not throw: ' + label);
  }
});
