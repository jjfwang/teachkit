/* animath lesson plan tests — zero network.
 * Guards the lesson-plan core (issue #1215, slice 1 of #1206):
 * validateLessonPlan in player/validate.js, buildLessonPlanPrompts in
 * generator/build_lesson_plan_prompt.js (its exemplar must validate
 * clean), and generateLessonPlan in generator/pipeline.js (the
 * generateScript sibling — same unpack -> author -> repair stages,
 * validation through validateLessonPlan). deps.callChat is stubbed
 * throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateLessonPlan } = require('../player/validate.js');
const {
  buildLessonPlanPrompts,
  LESSON_PLAN_SYSTEM_TEMPLATE,
  WATER_CYCLE_LESSON_PLAN_EXEMPLAR
} = require('../generator/build_lesson_plan_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const PLAN_OBJ = JSON.parse(WATER_CYCLE_LESSON_PLAN_EXEMPLAR);
const PLAN_TEXT = JSON.stringify(PLAN_OBJ);

function clonePlan() { return JSON.parse(PLAN_TEXT); }

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

/* ---------------- validateLessonPlan ---------------- */

test('validator: the prompt exemplar plan validates clean', () => {
  assert.deepEqual(validateLessonPlan(clonePlan()), []);
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateLessonPlan(null), ['spec: must be an object']);
  assert.deepEqual(validateLessonPlan('plan'), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const plan = clonePlan();
  delete plan.title;
  plan.level = 'university';
  delete plan.subject;
  delete plan.topic;
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: durationMinutes must be a positive number', () => {
  for (const bad of [undefined, 0, -5, '30']) {
    const plan = clonePlan();
    plan.durationMinutes = bad;
    assert.ok(hasError(validateLessonPlan(plan), 'durationMinutes: required positive number'),
      'durationMinutes=' + bad);
  }
});

test('validator: objectives must be a non-empty array', () => {
  for (const bad of [undefined, [], 'o1']) {
    const plan = clonePlan();
    plan.objectives = bad;
    assert.ok(hasError(validateLessonPlan(plan), 'objectives: required non-empty array'),
      'objectives=' + bad);
  }
});

test('validator: objective entries must be objects with id and text', () => {
  const plan = clonePlan();
  plan.objectives = [null, { successCriteria: ['I can x'], assessmentPoints: ['Check x'] }];
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'objectives[0]: must be an object'));
  assert.ok(hasError(errors, 'objectives[1].id: required non-empty string'));
  assert.ok(hasError(errors, 'objectives[1].text: required non-empty string'));
});

test('validator: duplicate objective ids are rejected', () => {
  const plan = clonePlan();
  plan.objectives[1].id = 'o1';
  plan.activities.forEach((a) => { a.objectiveIds = ['o1']; });
  assert.ok(hasError(validateLessonPlan(plan), 'objectives[1].id: duplicate objective id'));
});

test('validator: every objective needs success criteria and assessment points', () => {
  const plan = clonePlan();
  plan.objectives[0].successCriteria = [];
  plan.objectives[0].assessmentPoints = undefined;
  plan.objectives[1].successCriteria = ['I can x', '  '];
  plan.objectives[1].assessmentPoints = 'not an array';
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'objectives[0].successCriteria: required non-empty array'));
  assert.ok(hasError(errors, 'objectives[0].assessmentPoints: required non-empty array'));
  assert.ok(hasError(errors, 'objectives[1].successCriteria[1]: must be a non-empty string'));
  assert.ok(hasError(errors, 'objectives[1].assessmentPoints: required non-empty array'));
});

test('validator: activities must be a non-empty array', () => {
  for (const bad of [undefined, []]) {
    const plan = clonePlan();
    plan.activities = bad;
    assert.ok(hasError(validateLessonPlan(plan), 'activities: required non-empty array'),
      'activities=' + bad);
  }
});

test('validator: activity entries must be objects with title and minutes', () => {
  const plan = clonePlan();
  plan.activities = [null, { objectiveIds: ['o1'] }];
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'activities[0]: must be an object'));
  assert.ok(hasError(errors, 'activities[1].title: required non-empty string'));
  assert.ok(hasError(errors, 'activities[1].minutes: required positive number'));
});

test('validator: activity objectiveIds must resolve to declared objectives', () => {
  const plan = clonePlan();
  plan.activities[0].objectiveIds = undefined;
  plan.activities[1].objectiveIds = [];
  plan.activities[2].objectiveIds = ['o2', ' ', 'nope'];
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'activities[0].objectiveIds: required non-empty array'));
  assert.ok(hasError(errors, 'activities[1].objectiveIds: required non-empty array'));
  assert.ok(hasError(errors, 'activities[2].objectiveIds[1]: required non-empty string'));
  assert.ok(hasError(errors, 'activities[2].objectiveIds[2]: unknown objective id'));
});

test('validator: optional activity fields are checked when present', () => {
  const plan = clonePlan();
  plan.activities[0].scriptCue = ' ';
  plan.activities[0].grouping = 42;
  plan.activities[1].resources = 'board';
  plan.activities[1].differentiation = 'pairs';
  plan.activities[2].resources = ['notes', ''];
  plan.activities[2].differentiation = { support: '', stretch: 7 };
  plan.activities[3].differentiation = ['support'];
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'activities[0].scriptCue: must be a non-empty string when present'));
  assert.ok(hasError(errors, 'activities[0].grouping: must be a non-empty string when present'));
  assert.ok(hasError(errors, 'activities[1].resources: must be an array of non-empty strings when present'));
  assert.ok(hasError(errors, 'activities[1].differentiation: must be an object when present'));
  assert.ok(hasError(errors, 'activities[2].resources[1]: must be a non-empty string'));
  assert.ok(hasError(errors, 'activities[2].differentiation.support: must be a non-empty string when present'));
  assert.ok(hasError(errors, 'activities[2].differentiation.stretch: must be a non-empty string when present'));
  assert.ok(hasError(errors, 'activities[3].differentiation: must be an object when present'));
});

test('validator: activity minutes must sum exactly to durationMinutes', () => {
  const plan = clonePlan();
  plan.activities[3].minutes = 6;
  assert.ok(hasError(validateLessonPlan(plan), 'activities: minutes must sum to durationMinutes'));
});

test('validator: the sum is not evaluated when a minutes value is invalid', () => {
  const plan = clonePlan();
  plan.activities[3].minutes = 'five';
  const errors = validateLessonPlan(plan);
  assert.ok(hasError(errors, 'activities[3].minutes: required positive number'));
  assert.ok(!hasError(errors, 'minutes must sum to durationMinutes'));
});

/* ---------------- buildLessonPlanPrompts ---------------- */

const PROMPT_OPTS = { topic: 'water-cycle', topicLabel: 'Water cycle', level: 'primary', subject: 'science' };

const TRANSITIONS = [
  { name: 'evaporation', from_state: 'liquid water', to_state: 'water vapour', driver: "the sun's heat" },
  {
    name: 'condensation', from_state: 'water vapour', to_state: 'liquid droplets', driver: 'cooling',
    misconception: { wrongTurn: 'Water disappears for good.', why: 'The vapour is invisible.', correctTurn: 'The same water returns as drops.' }
  }
];

test('prompt: subject is required', () => {
  assert.throws(() => buildLessonPlanPrompts({}), /subject is required/);
  assert.throws(() => buildLessonPlanPrompts(), /subject is required/);
});

test('prompt: system and user carry level, tone, topic and the exemplar', () => {
  const { system, user } = buildLessonPlanPrompts(PROMPT_OPTS);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.ok(system.indexOf('lesson plan author') !== -1);
  assert.ok(system.indexOf(WATER_CYCLE_LESSON_PLAN_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('TRANSITION ACTIVITIES') === -1, 'no transition block without transitions');
  assert.ok(user.indexOf('Water cycle (water-cycle)') !== -1);
  assert.ok(user.indexOf('{{LEVEL_LABEL}}') === -1, 'template placeholders are filled');
  assert.ok(LESSON_PLAN_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, 'raw template keeps placeholders');
});

test('prompt: unknown level falls back to the raw level and secondary tone', () => {
  const { system } = buildLessonPlanPrompts({ subject: 'science', level: 'adult' });
  assert.ok(system.indexOf('Write for a adult class') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: transitions add the ordering block and the misconception beat', () => {
  const { system, user } = buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: TRANSITIONS });
  assert.ok(system.indexOf('TRANSITION ACTIVITIES') !== -1);
  assert.ok(user.indexOf('1. evaporation: "liquid water" -> "water vapour"') !== -1);
  assert.ok(user.indexOf('Wrong turn: Water disappears for good.') !== -1);
});

test('prompt: empty transitions are treated as none', () => {
  const { system } = buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: [] });
  assert.ok(system.indexOf('TRANSITION ACTIVITIES') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: 'x' }), /must be an array/);
  assert.throws(() => buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  const nine = Array.from({ length: 9 }, (_, i) => ({ ...TRANSITIONS[0], name: 't' + i }));
  assert.throws(() => buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: nine }), /must hold 2-8 transitions/);
  assert.throws(() => buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: [null, TRANSITIONS[0]] }), /must be an object/);
  assert.throws(
    () => buildLessonPlanPrompts({ ...PROMPT_OPTS, transitions: [{ name: 'x', from_state: ' ', to_state: 'b', driver: 'c' }, TRANSITIONS[0]] }),
    /from_state must be a non-empty string/);
});

test('prompt: workedExample must be a non-empty string and is appended when given', () => {
  assert.throws(() => buildLessonPlanPrompts({ ...PROMPT_OPTS, workedExample: ' ' }), /workedExample must be a non-empty string/);
  const { user } = buildLessonPlanPrompts({ ...PROMPT_OPTS, workedExample: 'Example: one drop, sea to cloud.' });
  assert.ok(user.indexOf('Example: one drop, sea to cloud.') !== -1);
});

/* ---------------- generateLessonPlan ---------------- */

const OPTS = { topic: 'water-cycle', topicLabel: 'Water cycle', level: 'primary', subject: 'science' };
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isPlanCall(system) { return system.indexOf('lesson plan author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

function progressRecorder() {
  const events = [];
  return { events, onProgress: (stage, n, max) => { events.push([stage, n, max]); } };
}

test('pipeline: happy path resolves the exemplar plan with the built-in validator', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : PLAN_TEXT);
  const rec = progressRecorder();
  const doc = await PIPELINE.generateLessonPlan(OPTS, { callChat, onProgress: rec.onProgress });
  assert.deepEqual(doc, PLAN_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isPlanCall(calls[1].system), 'author call uses the lesson plan author prompt');
  assert.deepEqual(rec.events, [['unpack', 1, 1], ['author', 1, 1]]);
});

test('pipeline: a non-JSON first response is repaired with lesson plan wording', async () => {
  let authorCalls = 0;
  const { calls, callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? 'oops, not JSON at all' : PLAN_TEXT;
  });
  const rec = progressRecorder();
  const doc = await PIPELINE.generateLessonPlan(OPTS, { callChat, onProgress: rec.onProgress });
  assert.deepEqual(doc, PLAN_OBJ);
  assert.equal(calls.length, 3, 'unpack + author + one repair');
  assert.ok(calls[2].user.indexOf('did not produce a valid lesson plan') !== -1);
  assert.ok(calls[2].user.indexOf('Return ONLY the corrected lesson plan as a single JSON object.') !== -1);
  assert.deepEqual(rec.events, [['unpack', 1, 1], ['author', 1, 1], ['repair', 1, 3]]);
});

test('pipeline: exhaustion rejects carrying the validateLessonPlan problems', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(
    () => PIPELINE.generateLessonPlan({ ...OPTS, maxRepairs: 1 }, { callChat }),
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /Lesson plan still invalid after 1 repair attempt/);
      assert.ok(Array.isArray(err.problems) && err.problems.length > 0);
      assert.deepEqual(err.problems, validateLessonPlan({}));
      return true;
    });
  assert.equal(calls.length, 3, 'unpack + author + 1 repair');
});

test('pipeline: missing callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateLessonPlan(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateLessonPlan(OPTS, {}), /callChat/);
});

test('pipeline: deps.validateLessonPlan is honoured over the built-in validator', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal plan' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateLessonPlan(OPTS, { callChat, validateLessonPlan: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: deps.validate is the fallback when validateLessonPlan is not supplied', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : PLAN_TEXT);
  const doc = await PIPELINE.generateLessonPlan(OPTS, { callChat, validate: spy });
  assert.deepEqual(doc, PLAN_OBJ);
  assert.equal(seen.length, 1);
});

test('pipeline: a rejecting unpack call still resolves a valid plan', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(PLAN_TEXT);
  };
  const doc = await PIPELINE.generateLessonPlan(OPTS, { callChat });
  assert.deepEqual(doc, PLAN_OBJ);
});
