/* animath quiz bank tests - zero network.
 * Guards the quiz bank core (issue #1255, slice 1 of #1254):
 * validateQuizBank in player/validate.js, buildQuizBankPrompts in
 * generator/build_quiz_bank_prompt.js (its exemplar must validate
 * clean), and generateQuizBank in generator/pipeline.js (the
 * generateDiagnostics sibling - bank resolved verbatim then slugified
 * with an honest no-bank failure, the same unpack -> author -> repair
 * stages, validation through validateQuizBank). deps.callChat is
 * stubbed throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateQuizBank } = require('../player/validate.js');
const {
  buildQuizBankPrompts,
  QUIZ_BANK_SYSTEM_TEMPLATE,
  FRACTIONS_QUIZ_BANK_EXEMPLAR
} = require('../generator/build_quiz_bank_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const QB_OBJ = JSON.parse(FRACTIONS_QUIZ_BANK_EXEMPLAR);
const QB_TEXT = JSON.stringify(QB_OBJ);
const BANK_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalQuizBank() {
  return {
    title: 'Adding Fractions Quiz Bank', level: 'primary', subject: 'math', topic: 'fractions-addition',
    items: [
      { prompt: 'What is 1/2 + 1/4?', answer: '3/4', choices: ['3/4', '2/6'], misconceptionCode: BANK_WRONG_TURN, outcomeCode: 'P5-FRAC-ADD' },
      { prompt: 'What is 1/3 + 1/3?', answer: '2/3' },
      { prompt: 'What is 2/5 + 1/5?', answer: '3/5' },
      { prompt: 'What is 3/4 + 1/4?', answer: '1' }
    ]
  };
}

/* ---------------- validateQuizBank ---------------- */

test('validator: the prompt exemplar quiz bank validates clean', () => {
  assert.deepEqual(validateQuizBank(JSON.parse(FRACTIONS_QUIZ_BANK_EXEMPLAR)), []);
});

test('validator: a minimal hand-built bank validates clean', () => {
  assert.deepEqual(validateQuizBank(minimalQuizBank()), []);
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateQuizBank(null), ['spec: must be an object']);
  assert.deepEqual(validateQuizBank('quiz bank'), ['spec: must be an object']);
  assert.deepEqual(validateQuizBank([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalQuizBank();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateQuizBank(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: fewer than 4 items are rejected', () => {
  const doc = minimalQuizBank();
  doc.items = doc.items.slice(0, 3);
  assert.ok(hasError(validateQuizBank(doc), 'items: required array of at least 4 retrieval items'));
  const none = minimalQuizBank();
  delete none.items;
  assert.ok(hasError(validateQuizBank(none), 'items: required array of at least 4 retrieval items'));
  const notArray = minimalQuizBank();
  notArray.items = 'items';
  assert.ok(hasError(validateQuizBank(notArray), 'items: required array of at least 4 retrieval items'));
});

test('validator: a non-object item is rejected', () => {
  const doc = minimalQuizBank();
  doc.items[1] = 'recall question';
  assert.ok(hasError(validateQuizBank(doc), 'items[1]: must be an object'));
  const arr = minimalQuizBank();
  arr.items[2] = ['not', 'an', 'item'];
  assert.ok(hasError(validateQuizBank(arr), 'items[2]: must be an object'));
});

test('validator: prompt and answer are required non-empty', () => {
  const doc = minimalQuizBank();
  delete doc.items[0].prompt;
  doc.items[1].answer = '  ';
  const errors = validateQuizBank(doc);
  assert.ok(hasError(errors, 'items[0].prompt: required non-empty string'));
  assert.ok(hasError(errors, 'items[1].answer: required non-empty string (teacher key)'));
});

test('validator: choices must be an array of at least 2 non-empty strings when present', () => {
  const one = minimalQuizBank();
  one.items[0].choices = ['3/4'];
  assert.ok(hasError(validateQuizBank(one), 'items[0].choices: must be an array of at least 2 strings when present'));
  const notArray = minimalQuizBank();
  notArray.items[0].choices = '3/4 or 2/6';
  assert.ok(hasError(validateQuizBank(notArray), 'items[0].choices: must be an array of at least 2 strings when present'));
  const blank = minimalQuizBank();
  blank.items[0].choices = ['3/4', ' '];
  assert.ok(hasError(validateQuizBank(blank), 'items[0].choices[1]: must be a non-empty string'));
  const nonString = minimalQuizBank();
  nonString.items[0].choices = ['3/4', 26];
  assert.ok(hasError(validateQuizBank(nonString), 'items[0].choices[1]: must be a non-empty string'));
});

test('validator: misconceptionCode and outcomeCode must be non-empty strings when present', () => {
  const doc = minimalQuizBank();
  doc.items[0].misconceptionCode = '';
  doc.items[1].outcomeCode = 42;
  const errors = validateQuizBank(doc);
  assert.ok(hasError(errors, 'items[0].misconceptionCode: must be a non-empty string when present'));
  assert.ok(hasError(errors, 'items[1].outcomeCode: must be a non-empty string when present'));
  const blankOutcome = minimalQuizBank();
  blankOutcome.items[2].outcomeCode = ' ';
  assert.ok(hasError(validateQuizBank(blankOutcome), 'items[2].outcomeCode: must be a non-empty string when present'));
});

/* ---------------- buildQuizBankPrompts ---------------- */

const TRANSITIONS = [
  { name: 'Common denominator', from_state: 'halves and quarters side by side', to_state: 'both fractions written in quarters', driver: 'renaming one half as two quarters' },
  { name: 'Adding quarters', from_state: 'two amounts in quarters', to_state: 'one total in quarters', driver: 'adding the top numbers only' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(system.indexOf('quiz bank author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_QUIZ_BANK_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('title, level, subject, topic, items') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(QUIZ_BANK_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject is required', () => {
  assert.throws(() => buildQuizBankPrompts({}), /buildQuizBankPrompts: subject is required/);
  assert.throws(() => buildQuizBankPrompts(), /buildQuizBankPrompts: subject is required/);
});

test('prompt: the user message carries the fractions wrongTurn when the topic resolves', () => {
  const { user } = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition', topicLabel: 'Adding fractions' });
  assert.ok(user.indexOf('Topic misconception bank entry:') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  assert.ok(user.indexOf('Adding fractions (fractions-addition)') !== -1);
});

test('prompt: opts.bank wins over the bank lookup', () => {
  const { user } = buildQuizBankPrompts({
    subject: 'math', topic: 'fractions-addition',
    bank: { wrongTurn: 'CUSTOM WRONG TURN', why: 'a custom reason', correctTurn: 'the custom fix' }
  });
  assert.ok(user.indexOf('Wrong turn: CUSTOM WRONG TURN') !== -1);
  assert.ok(user.indexOf(BANK_WRONG_TURN) === -1);
});

test('prompt: the generic line appears when no bank entry resolves and no opts.bank is given', () => {
  const { user } = buildQuizBankPrompts({ subject: 'math', topic: 'no-such-topic-xyz' });
  assert.ok(user.indexOf('No misconception bank entry was supplied for this topic') !== -1);
});

test('prompt: an unknown level falls back to the level name and the secondary tone', () => {
  const { system } = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition', level: 'graduate' });
  assert.ok(system.indexOf('Write for a graduate student') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: transitions add the span block keyed to transition order', () => {
  const plain = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(plain.system.indexOf('TRANSITION SPAN') === -1);
  assert.ok(plain.user.indexOf('Ordered state transitions') === -1);
  const withBeat = JSON.parse(JSON.stringify(TRANSITIONS));
  withBeat[0].misconception = {
    wrongTurn: BANK_WRONG_TURN,
    why: 'The bottom number names the piece size.',
    correctTurn: 'Rename one half as two quarters first.'
  };
  const { system, user } = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION SPAN') !== -1);
  assert.ok(user.indexOf('1. Common denominator: "halves and quarters side by side" -> "both fractions written in quarters" (driver: renaming one half as two quarters)') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  const empty = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION SPAN') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildQuizBankPrompts({ subject: 'math', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildQuizBankPrompts({ subject: 'math', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildQuizBankPrompts({ subject: 'math', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = JSON.parse(JSON.stringify(TRANSITIONS));
  delete noDriver[1].driver;
  assert.throws(() => buildQuizBankPrompts({ subject: 'math', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildQuizBankPrompts({ subject: 'math', topic: 'fractions-addition', workedExample: 'EXAMPLE QUIZ BANK' });
  assert.ok(user.indexOf('Worked example for this topic') !== -1);
  assert.ok(user.indexOf('EXAMPLE QUIZ BANK') !== -1);
  assert.throws(() => buildQuizBankPrompts({ subject: 'math', workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateQuizBank ---------------- */

const OPTS = { topic: 'fractions-addition', topicLabel: 'Adding fractions', level: 'primary', subject: 'math' };

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isQuizBankCall(system) { return system.indexOf('quiz bank author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: a topic with no bank entry rejects before any callChat call, naming quizBank', async () => {
  const { calls, callChat } = stubChat(() => QB_TEXT);
  await assert.rejects(
    () => PIPELINE.generateQuizBank({ topic: 'no-such-topic-xyz', level: 'primary', subject: 'math' }, { callChat }),
    /generateQuizBank: no misconception bank entry for topic "no-such-topic-xyz" - quizBank materials are generated from the bank and never invent misconceptions/);
  assert.equal(calls.length, 0, 'callChat is never called without a bank entry');
});

test('pipeline: a free-text topic resolves through its slugified form', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : QB_TEXT);
  const doc = await PIPELINE.generateQuizBank(
    { topic: 'Fractions Addition', level: 'primary', subject: 'math' }, { callChat });
  assert.deepEqual(doc, QB_OBJ);
});

test('pipeline: happy path resolves the exemplar with the bank entry in the author prompt', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : QB_TEXT);
  const doc = await PIPELINE.generateQuizBank(OPTS, { callChat });
  assert.deepEqual(doc, QB_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isQuizBankCall(calls[1].system), 'author call uses the quiz bank author prompt');
  assert.ok(calls[1].user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1,
    'author user message carries the resolved bank entry');
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : QB_TEXT;
  });
  const doc = await PIPELINE.generateQuizBank(OPTS, { callChat });
  assert.deepEqual(doc, QB_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: repair exhaustion rejects with the problem list', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(
    () => PIPELINE.generateQuizBank({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.ok(Array.isArray(err.problems), 'rejection carries err.problems');
      assert.ok(err.problems.length > 0);
      return true;
    });
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateQuizBank(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateQuizBank(OPTS, {}), /callChat/);
});

test('pipeline: a custom validateQuizBank dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal quiz bank' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateQuizBank(OPTS, { callChat, validateQuizBank: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a rejecting unpack call still resolves a valid material', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(QB_TEXT);
  };
  const doc = await PIPELINE.generateQuizBank(OPTS, { callChat });
  assert.deepEqual(doc, QB_OBJ);
});
