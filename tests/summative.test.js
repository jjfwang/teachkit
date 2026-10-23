/* animath summative assessment tests - zero network.
 * Guards the summative assessment core (issue #1259, slice 3 of
 * #1254): validateSummative in player/validate.js (blueprint rows
 * summing to totalMarks, items summing to their blueprint row, mark
 * schemes through the Phase A1 machinery, the in-material rubric,
 * moderation reusing the Phase A3 states with approved requiring a
 * review record), buildSummativePrompts in
 * generator/build_summative_prompt.js (its exemplar must validate
 * clean), and generateSummative in generator/pipeline.js (authored
 * directly from the unit, honest failure naming summative on repair
 * exhaustion). deps.callChat is stubbed throughout.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateSummative } = require('../player/validate.js');
const {
  buildSummativePrompts,
  SUMMATIVE_SYSTEM_TEMPLATE,
  FRACTIONS_SUMMATIVE_EXEMPLAR
} = require('../generator/build_summative_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const SUM_OBJ = JSON.parse(FRACTIONS_SUMMATIVE_EXEMPLAR);
const SUM_TEXT = JSON.stringify(SUM_OBJ);

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalSummative() {
  return JSON.parse(FRACTIONS_SUMMATIVE_EXEMPLAR);
}

/* ---------------- validateSummative ---------------- */

test('validator: the prompt exemplar summative validates clean', () => {
  assert.deepEqual(validateSummative(minimalSummative()), []);
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateSummative(null), ['spec: must be an object']);
  assert.deepEqual(validateSummative('summative'), ['spec: must be an object']);
  assert.deepEqual(validateSummative([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalSummative();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.unitTitle;
  const errors = validateSummative(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'unitTitle: required non-empty string'));
});

test('validator: fewer than 2 topics are rejected', () => {
  const one = minimalSummative();
  one.topics = ['fractions-addition'];
  assert.ok(hasError(validateSummative(one), 'topics: required array of at least 2 topic slugs'));
  const none = minimalSummative();
  delete none.topics;
  assert.ok(hasError(validateSummative(none), 'topics: required array of at least 2 topic slugs'));
  const blank = minimalSummative();
  blank.topics = ['fractions-addition', ' '];
  assert.ok(hasError(validateSummative(blank), 'topics[1]: must be a non-empty string'));
});

test('validator: durationMinutes and totalMarks must be positive integers', () => {
  const doc = minimalSummative();
  doc.durationMinutes = 0;
  doc.totalMarks = 20.5;
  const errors = validateSummative(doc);
  assert.ok(hasError(errors, 'durationMinutes: must be a positive integer'));
  assert.ok(hasError(errors, 'totalMarks: must be a positive integer'));
});

test('validator: blueprint must be a non-empty array of well-formed rows', () => {
  const none = minimalSummative();
  delete none.blueprint;
  assert.ok(hasError(validateSummative(none), 'blueprint: required non-empty array of blueprint rows'));
  const notObj = minimalSummative();
  notObj.blueprint[0] = 'row';
  assert.ok(hasError(validateSummative(notObj), 'blueprint[0]: must be an object'));
  const fields = minimalSummative();
  delete fields.blueprint[0].outcomeCode;
  fields.blueprint[0].assessmentObjective = '';
  fields.blueprint[1].cognitiveLevel = ' ';
  fields.blueprint[1].marks = -1;
  const errors = validateSummative(fields);
  assert.ok(hasError(errors, 'blueprint[0].outcomeCode: required non-empty string'));
  assert.ok(hasError(errors, 'blueprint[0].assessmentObjective: required non-empty string'));
  assert.ok(hasError(errors, 'blueprint[1].cognitiveLevel: required non-empty string'));
  assert.ok(hasError(errors, 'blueprint[1].marks: must be a positive integer'));
});

test('validator: blueprint marks not summing to totalMarks are rejected', () => {
  const doc = minimalSummative();
  doc.blueprint[1].marks = 9;
  doc.items[3].marks = 4;
  doc.items[3].markScheme.points[1].marks = 2;
  assert.ok(hasError(validateSummative(doc), 'blueprint: row marks sum to 19, not totalMarks 20'));
});

test('validator: items must be a non-empty array of well-formed items', () => {
  const none = minimalSummative();
  delete none.items;
  assert.ok(hasError(validateSummative(none), 'items: required non-empty array of assessment items'));
  const notObj = minimalSummative();
  notObj.items[0] = 42;
  assert.ok(hasError(validateSummative(notObj), 'items[0]: must be an object'));
  const fields = minimalSummative();
  delete fields.items[0].prompt;
  fields.items[0].commandWord = '';
  fields.items[0].marks = 0;
  const errors = validateSummative(fields);
  assert.ok(hasError(errors, 'items[0].prompt: required non-empty string'));
  assert.ok(hasError(errors, 'items[0].commandWord: required non-empty string'));
  assert.ok(hasError(errors, 'items[0].marks: must be a positive integer'));
});

test('validator: an item referencing a missing blueprint row is rejected', () => {
  const doc = minimalSummative();
  doc.items[0].blueprintRow = 7;
  assert.ok(hasError(validateSummative(doc), 'items[0].blueprintRow: must be an integer index into blueprint'));
  const frac = minimalSummative();
  frac.items[1].blueprintRow = 0.5;
  assert.ok(hasError(validateSummative(frac), 'items[1].blueprintRow: must be an integer index into blueprint'));
});

test('validator: item marks not summing to their blueprint row are rejected', () => {
  const doc = minimalSummative();
  doc.items[0].marks = 5;
  doc.items[0].markScheme.points[0].marks = 2;
  assert.ok(hasError(validateSummative(doc), 'blueprint[0]: item marks sum to 9, not the blueprint row marks 10'));
});

test('validator: a blueprint row with no items is rejected', () => {
  const doc = minimalSummative();
  doc.items[2].blueprintRow = 0;
  doc.items[3].blueprintRow = 0;
  doc.items[2].marks = 2;
  doc.items[2].markScheme.points[0].marks = 1;
  doc.items[2].markScheme.points[1].marks = 1;
  doc.items[3].marks = 3;
  doc.items[3].markScheme.points[0].marks = 1;
  doc.items[3].markScheme.points[1].marks = 2;
  assert.ok(hasError(validateSummative(doc), 'blueprint[1]: no items reference this blueprint row'));
});

test('validator: a missing or malformed markScheme is rejected', () => {
  const missing = minimalSummative();
  delete missing.items[0].markScheme;
  assert.ok(hasError(validateSummative(missing), 'items[0].markScheme: required object'));
  const badSum = minimalSummative();
  badSum.items[1].markScheme.points[0].marks = 1;
  assert.ok(hasError(validateSummative(badSum), 'items[1].markScheme.points: credit point marks sum to 3, not the question marks 4'));
  const noPoints = minimalSummative();
  noPoints.items[2].markScheme = {};
  assert.ok(hasError(validateSummative(noPoints), 'items[2].markScheme.points: required non-empty array of credit points'));
});

test('validator: a malformed rubric is rejected', () => {
  const missing = minimalSummative();
  delete missing.rubric;
  assert.ok(hasError(validateSummative(missing), 'rubric: required object with at least 1 criterion'));
  const noCriteria = minimalSummative();
  noCriteria.rubric = {};
  assert.ok(hasError(validateSummative(noCriteria), 'rubric.criteria: required non-empty array of criteria'));
  const notObj = minimalSummative();
  notObj.rubric.criteria[0] = 'communication';
  assert.ok(hasError(validateSummative(notObj), 'rubric.criteria[0]: must be an object'));
  const fields = minimalSummative();
  fields.rubric.criteria[0].name = '';
  fields.rubric.criteria[0].levels = fields.rubric.criteria[0].levels.slice(0, 1);
  const errors = validateSummative(fields);
  assert.ok(hasError(errors, 'rubric.criteria[0].name: required non-empty string'));
  assert.ok(hasError(errors, 'rubric.criteria[0].levels: required array of at least 2 levels'));
  const levelFields = minimalSummative();
  levelFields.rubric.criteria[0].levels[0] = 'Secure';
  levelFields.rubric.criteria[0].levels[1].label = ' ';
  delete levelFields.rubric.criteria[0].levels[2].descriptor;
  const errs2 = validateSummative(levelFields);
  assert.ok(hasError(errs2, 'rubric.criteria[0].levels[0]: must be an object'));
  assert.ok(hasError(errs2, 'rubric.criteria[0].levels[1].label: required non-empty string'));
  assert.ok(hasError(errs2, 'rubric.criteria[0].levels[2].descriptor: required non-empty string'));
});

test('validator: moderation states are enforced and approved requires a review record', () => {
  const missing = minimalSummative();
  delete missing.moderation;
  assert.ok(hasError(validateSummative(missing), 'moderation: required object with a state'));
  const badState = minimalSummative();
  badState.moderation = { state: 'signed-off' };
  assert.ok(hasError(validateSummative(badState), 'moderation.state: must be one of unreviewed|in-moderation|approved|rejected'));
  const approvedNoReview = minimalSummative();
  approvedNoReview.moderation = { state: 'approved' };
  assert.ok(hasError(validateSummative(approvedNoReview), 'moderation: state approved requires a review record {reviewer, date}'));
  const approved = minimalSummative();
  approved.moderation = { state: 'approved' };
  approved.review = { reviewer: 'A. Rahman', date: '2026-10-23' };
  assert.deepEqual(validateSummative(approved), []);
  const badReview = minimalSummative();
  badReview.review = 'A. Rahman';
  assert.ok(hasError(validateSummative(badReview), 'review: must be null or an object with reviewer and date'));
  const reviewFields = minimalSummative();
  reviewFields.review = { reviewer: '', date: 20261023 };
  const errors = validateSummative(reviewFields);
  assert.ok(hasError(errors, 'review.reviewer: required non-empty string'));
  assert.ok(hasError(errors, 'review.date: required non-empty string'));
});

/* ---------------- buildSummativePrompts ---------------- */

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildSummativePrompts({ subject: 'math', topics: ['fractions-addition', 'fractions-subtraction'] });
  assert.ok(system.indexOf('summative assessment author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_SUMMATIVE_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('title, level, subject, unitTitle, topics, durationMinutes, totalMarks, blueprint, items, rubric, moderation, review') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(SUMMATIVE_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject and at least 2 topics are required', () => {
  assert.throws(() => buildSummativePrompts({ topics: ['a', 'b'] }), /buildSummativePrompts: subject is required/);
  assert.throws(() => buildSummativePrompts(), /buildSummativePrompts: subject is required/);
  assert.throws(() => buildSummativePrompts({ subject: 'math' }), /opts\.topics must be an array of at least 2 topic slugs/);
  assert.throws(() => buildSummativePrompts({ subject: 'math', topics: ['only-one'] }), /opts\.topics must be an array of at least 2 topic slugs/);
  assert.throws(() => buildSummativePrompts({ subject: 'math', topics: ['a', ' '] }), /opts\.topics\[1\] must be a non-empty string/);
});

test('prompt: the user message carries the unit and its topics', () => {
  const { user } = buildSummativePrompts({
    subject: 'math', unitTitle: 'Fractions: adding and subtracting',
    topics: ['fractions-addition', 'fractions-subtraction']
  });
  assert.ok(user.indexOf('Unit: Fractions: adding and subtracting') !== -1);
  assert.ok(user.indexOf('Topics spanned: fractions-addition, fractions-subtraction') !== -1);
  const noUnit = buildSummativePrompts({ subject: 'math', topics: ['a-topic', 'b-topic'] });
  assert.ok(noUnit.user.indexOf('Unit: (unit title not given)') !== -1);
});

test('prompt: an unknown level falls back to the level name and the secondary tone', () => {
  const { system } = buildSummativePrompts({ subject: 'math', topics: ['a', 'b'], level: 'graduate' });
  assert.ok(system.indexOf('Write for a graduate student') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildSummativePrompts({ subject: 'math', topics: ['a', 'b'], workedExample: 'EXAMPLE SUMMATIVE' });
  assert.ok(user.indexOf('Worked example for this unit') !== -1);
  assert.ok(user.indexOf('EXAMPLE SUMMATIVE') !== -1);
  assert.throws(() => buildSummativePrompts({ subject: 'math', topics: ['a', 'b'], workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateSummative ---------------- */

const OPTS = {
  topics: ['fractions-addition', 'fractions-subtraction'],
  unitTitle: 'Fractions: adding and subtracting', level: 'primary', subject: 'math'
};

function isSummativeCall(system) { return system.indexOf('summative assessment author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: happy path resolves the exemplar in one author call', async () => {
  const { calls, callChat } = stubChat(() => SUM_TEXT);
  const doc = await PIPELINE.generateSummative(OPTS, { callChat });
  assert.deepEqual(doc, SUM_OBJ);
  assert.equal(calls.length, 1, 'one author call, no unpack, no repairs');
  assert.ok(isSummativeCall(calls[0].system), 'author call uses the summative author prompt');
  assert.ok(calls[0].user.indexOf('Topics spanned: fractions-addition, fractions-subtraction') !== -1);
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat(() => {
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : SUM_TEXT;
  });
  const doc = await PIPELINE.generateSummative(OPTS, { callChat });
  assert.deepEqual(doc, SUM_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: repair exhaustion rejects naming summative with the problem list', async () => {
  const { callChat } = stubChat(() => '{}');
  await assert.rejects(
    () => PIPELINE.generateSummative({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.ok(/Summative assessment still invalid/.test(err.message));
      assert.ok(Array.isArray(err.problems), 'rejection carries err.problems');
      assert.ok(err.problems.length > 0);
      return true;
    });
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateSummative(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateSummative(OPTS, {}), /callChat/);
});

test('pipeline: malformed topics reject before any callChat call', async () => {
  const { calls, callChat } = stubChat(() => SUM_TEXT);
  await assert.rejects(
    () => PIPELINE.generateSummative({ subject: 'math', topics: ['only-one'] }, { callChat }),
    /buildSummativePrompts: opts\.topics must be an array of at least 2 topic slugs/);
  assert.equal(calls.length, 0);
});

test('pipeline: a custom validateSummative dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal summative' };
  const { callChat } = stubChat(() => JSON.stringify(minimal));
  const doc = await PIPELINE.generateSummative(OPTS, { callChat, validateSummative: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a fallback validate dep is honoured', async () => {
  const minimal = { title: 'Minimal summative' };
  const { callChat } = stubChat(() => JSON.stringify(minimal));
  const doc = await PIPELINE.generateSummative(OPTS, { callChat, validate: () => [] });
  assert.deepEqual(doc, minimal);
});
