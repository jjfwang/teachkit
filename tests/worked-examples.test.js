/* animath worked-examples tests - zero network.
 * Guards the worked-example set core (issue #1248, slice 1 of #1247):
 * validateWorkedExamples in player/validate.js, buildWorkedExamplesPrompts
 * in generator/build_worked_examples_prompt.js (its exemplar must
 * validate clean), and generateWorkedExamples in generator/pipeline.js
 * (the generateScaffolds sibling - same unpack -> author -> repair
 * stages, validation through validateWorkedExamples). deps.callChat is
 * stubbed throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateWorkedExamples } = require('../player/validate.js');
const {
  buildWorkedExamplesPrompts,
  WORKED_EXAMPLES_SYSTEM_TEMPLATE,
  FRACTIONS_WORKED_EXAMPLES_EXEMPLAR
} = require('../generator/build_worked_examples_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const SET_OBJ = JSON.parse(FRACTIONS_WORKED_EXAMPLES_EXEMPLAR);
const SET_TEXT = JSON.stringify(SET_OBJ);

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function minimalSet() { return clone(SET_OBJ); }

/* ---------------- validateWorkedExamples ---------------- */

test('validator: the prompt exemplar worked-example set validates clean', () => {
  assert.deepEqual(validateWorkedExamples(JSON.parse(FRACTIONS_WORKED_EXAMPLES_EXEMPLAR)), []);
});

test('validator: a minimal well-formed set validates clean', () => {
  assert.deepEqual(validateWorkedExamples(minimalSet()), []);
});

test('validator: non-object specs are rejected', () => {
  assert.deepEqual(validateWorkedExamples(null), ['spec: must be an object']);
  assert.deepEqual(validateWorkedExamples('worked examples'), ['spec: must be an object']);
  assert.deepEqual(validateWorkedExamples([]), ['spec: must be an object']);
});

test('validator: header fields are required', () => {
  const doc = minimalSet();
  delete doc.title;
  doc.level = 'adult';
  assert.ok(hasError(validateWorkedExamples(doc), 'title: required non-empty string'));
  assert.ok(hasError(validateWorkedExamples(doc), 'level: must be primary|secondary|jc'));
});

test('validator: each member must be an object', () => {
  for (const key of ['complete', 'faded', 'paired']) {
    const missing = minimalSet();
    delete missing[key];
    assert.ok(hasError(validateWorkedExamples(missing), key + ': must be an object'), key);
    const wrong = minimalSet();
    wrong[key] = 'nope';
    assert.ok(hasError(validateWorkedExamples(wrong), key + ': must be an object'), key);
  }
});

test('validator: member problems are required', () => {
  for (const key of ['complete', 'faded', 'paired']) {
    const doc = minimalSet();
    doc[key].problem = ' ';
    assert.ok(hasError(validateWorkedExamples(doc), key + '.problem: required non-empty string'), key);
  }
});

test('validator: steps must be an array of at least 2', () => {
  const missing = minimalSet();
  delete missing.complete.steps;
  assert.ok(hasError(validateWorkedExamples(missing), 'complete.steps: required array of at least 2 steps'));
  const one = minimalSet();
  one.faded.steps = one.faded.steps.slice(0, 1);
  assert.ok(hasError(validateWorkedExamples(one), 'faded.steps: required array of at least 2 steps'));
});

test('validator: a step must be an object with non-empty text', () => {
  const notObject = minimalSet();
  notObject.complete.steps[0] = 'rename first';
  assert.ok(hasError(validateWorkedExamples(notObject), 'complete.steps[0]: must be an object'));
  const noText = minimalSet();
  noText.complete.steps[1].text = '';
  assert.ok(hasError(validateWorkedExamples(noText), 'complete.steps[1].text: required non-empty string'));
});

test('validator: complete step annotations are required', () => {
  const missing = minimalSet();
  delete missing.complete.steps[0].annotation;
  assert.ok(hasError(validateWorkedExamples(missing), 'complete.steps[0].annotation: required non-empty string'));
  const blank = minimalSet();
  blank.complete.steps[0].annotation = ' ';
  assert.ok(hasError(validateWorkedExamples(blank), 'complete.steps[0].annotation: required non-empty string'));
});

test('validator: faded annotations are optional but must be non-empty when present', () => {
  const absent = minimalSet();
  delete absent.faded.steps[0].annotation;
  assert.deepEqual(validateWorkedExamples(absent), []);
  const blank = minimalSet();
  blank.faded.steps[0].annotation = '';
  assert.ok(hasError(validateWorkedExamples(blank), 'faded.steps[0].annotation: must be a non-empty string when present'));
});

test('validator: self-explanation prompts are required on complete and faded', () => {
  const complete = minimalSet();
  delete complete.complete.selfExplanation;
  assert.ok(hasError(validateWorkedExamples(complete), 'complete.selfExplanation: required non-empty string'));
  const faded = minimalSet();
  faded.faded.selfExplanation = ' ';
  assert.ok(hasError(validateWorkedExamples(faded), 'faded.selfExplanation: required non-empty string'));
});

test('validator: faded withheld flags are required booleans', () => {
  const missing = minimalSet();
  delete missing.faded.steps[0].withheld;
  assert.ok(hasError(validateWorkedExamples(missing), 'faded.steps[0].withheld: required boolean'));
  const wrong = minimalSet();
  wrong.faded.steps[1].withheld = 'yes';
  assert.ok(hasError(validateWorkedExamples(wrong), 'faded.steps[1].withheld: required boolean'));
});

test('validator: a faded example with no withheld step is rejected', () => {
  const doc = minimalSet();
  doc.faded.steps.forEach((s) => { s.withheld = false; });
  assert.ok(hasError(validateWorkedExamples(doc), 'faded.steps: at least one step must be withheld'));
});

test('validator: a faded example with no shown step is rejected', () => {
  const doc = minimalSet();
  doc.faded.steps.forEach((s) => { s.withheld = true; });
  assert.ok(hasError(validateWorkedExamples(doc), 'faded.steps: at least one step must be shown'));
});

test('validator: withheld steps must form a suffix', () => {
  const doc = minimalSet();
  doc.faded.steps = [
    { text: 'First step withheld.', withheld: true },
    { text: 'Second step shown again.', withheld: false },
    { text: 'Third step withheld.', withheld: true }
  ];
  assert.ok(hasError(validateWorkedExamples(doc),
    'faded.steps: withheld steps must form a suffix (once a step is withheld, every later step is withheld)'));
});

test('validator: a longer withheld suffix validates clean', () => {
  const doc = minimalSet();
  doc.faded.steps = [
    { text: 'Rename 2/3 as 4/6.', annotation: 'Rename without changing the amount.', withheld: false },
    { text: 'Add the numerators.', withheld: true },
    { text: 'Write the total as 5/6.', withheld: true }
  ];
  assert.deepEqual(validateWorkedExamples(doc), []);
});

test('validator: the paired solution is required', () => {
  const doc = minimalSet();
  delete doc.paired.solution;
  assert.ok(hasError(validateWorkedExamples(doc), 'paired.solution: required non-empty string'));
});

/* ---------------- buildWorkedExamplesPrompts ---------------- */

const TRANSITIONS = [
  { name: 'Common denominator', from_state: 'halves and quarters side by side', to_state: 'both fractions written in quarters', driver: 'renaming one half as two quarters' },
  { name: 'Adding quarters', from_state: 'two amounts in quarters', to_state: 'one total in quarters', driver: 'adding the top numbers only' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(system.indexOf('worked-examples author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_WORKED_EXAMPLES_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('title, level, subject, topic, complete, faded, paired') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(WORKED_EXAMPLES_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject is required', () => {
  assert.throws(() => buildWorkedExamplesPrompts({}), /buildWorkedExamplesPrompts: subject is required/);
  assert.throws(() => buildWorkedExamplesPrompts(), /buildWorkedExamplesPrompts: subject is required/);
});

test('prompt: the user message carries the topic label and slug', () => {
  const { user } = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition', topicLabel: 'Adding fractions' });
  assert.ok(user.indexOf('Adding fractions (fractions-addition)') !== -1);
  assert.ok(user.indexOf('complete annotated example') !== -1);
});

test('prompt: an unknown level falls back to its own label and the secondary tone', () => {
  const { system, user } = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition', level: 'adult' });
  assert.ok(system.indexOf('Write for a adult student') !== -1);
  assert.ok(user.indexOf('Level: adult (adult)') !== -1);
});

test('prompt: transitions add the step block keyed to transition order', () => {
  const plain = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(plain.system.indexOf('TRANSITION STEPS') === -1);
  assert.ok(plain.user.indexOf('Ordered state transitions') === -1);
  const withBeat = clone(TRANSITIONS);
  withBeat[0].misconception = {
    wrongTurn: 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.',
    why: 'The bottom number names the piece size.',
    correctTurn: 'Rename one half as two quarters first.'
  };
  const { system, user } = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION STEPS') !== -1);
  assert.ok(user.indexOf('1. Common denominator: "halves and quarters side by side" -> "both fractions written in quarters" (driver: renaming one half as two quarters)') !== -1);
  assert.ok(user.indexOf('Wrong turn: Adding tops and bottoms: 1/2 + 1/4 = 2/6.') !== -1);
  const empty = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION STEPS') === -1);
  const nulled = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition', transitions: null });
  assert.ok(nulled.system.indexOf('TRANSITION STEPS') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildWorkedExamplesPrompts({ subject: 'math', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildWorkedExamplesPrompts({ subject: 'math', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildWorkedExamplesPrompts({ subject: 'math', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = clone(TRANSITIONS);
  delete noDriver[1].driver;
  assert.throws(() => buildWorkedExamplesPrompts({ subject: 'math', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildWorkedExamplesPrompts({ subject: 'math', topic: 'fractions-addition', workedExample: 'EXAMPLE SET' });
  assert.ok(user.indexOf('Worked example for this topic') !== -1);
  assert.ok(user.indexOf('EXAMPLE SET') !== -1);
  assert.throws(() => buildWorkedExamplesPrompts({ subject: 'math', workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateWorkedExamples ---------------- */

const OPTS = { topic: 'fractions-addition', topicLabel: 'Adding fractions', level: 'primary', subject: 'math' };

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isWorkedExamplesCall(system) { return system.indexOf('worked-examples author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: happy path resolves the exemplar through unpack and author', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : SET_TEXT);
  const doc = await PIPELINE.generateWorkedExamples(OPTS, { callChat });
  assert.deepEqual(doc, SET_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isWorkedExamplesCall(calls[1].system), 'author call uses the worked-examples author prompt');
  assert.ok(calls[1].user.indexOf('Ordered state transitions') !== -1,
    'author user message carries the unpacked transitions');
});

test('pipeline: an invalid first response is repaired to a valid set', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : SET_TEXT;
  });
  const doc = await PIPELINE.generateWorkedExamples(OPTS, { callChat });
  assert.deepEqual(doc, SET_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateWorkedExamples(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateWorkedExamples(OPTS, {}), /callChat/);
});

test('pipeline: a custom validateWorkedExamples dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal set' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateWorkedExamples(OPTS, { callChat, validateWorkedExamples: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a rejecting unpack call still resolves a valid set', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(SET_TEXT);
  };
  const doc = await PIPELINE.generateWorkedExamples(OPTS, { callChat });
  assert.deepEqual(doc, SET_OBJ);
});
