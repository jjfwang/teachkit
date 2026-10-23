/* animath revision tests - zero network.
 * Guards the revision core (issue #1268, slice 1 of #1267):
 * validateRevision in player/validate.js, buildRevisionPrompts in
 * generator/build_revision_prompt.js (its exemplar must validate
 * clean and derive verbatim from the fractions quiz bank and notes),
 * and generateRevision in generator/pipeline.js (the generateQuizBank
 * sibling - bank resolved verbatim then slugified with an honest
 * no-bank failure naming revision, the same unpack -> author ->
 * repair stages, validation through validateRevision). deps.callChat
 * is stubbed throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateRevision } = require('../player/validate.js');
const {
  buildRevisionPrompts,
  REVISION_SYSTEM_TEMPLATE,
  FRACTIONS_REVISION_EXEMPLAR
} = require('../generator/build_revision_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const REV_OBJ = JSON.parse(FRACTIONS_REVISION_EXEMPLAR);
const REV_TEXT = JSON.stringify(REV_OBJ);
const BANK_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalRevision() {
  return {
    title: 'Adding Fractions Revision', level: 'primary', subject: 'math', topic: 'fractions-addition',
    flashcards: [
      { front: 'Fraction', back: 'A part of a whole.', source: 'definition' },
      { front: BANK_WRONG_TURN, back: 'The bottom number names the piece size.', source: 'trap' },
      { front: 'What is 1/2 + 1/4?', back: '3/4', source: 'quiz-bank' },
      { front: 'What is 2/5 + 1/5?', back: '3/5', source: 'quiz-bank' }
    ],
    practiceSets: [
      { dayOffset: 1, items: [{ prompt: 'What is 1/3 + 1/3?', answer: '2/3' }] },
      { dayOffset: 3, items: [{ prompt: 'What is 3/8 + 2/8?', answer: '5/8' }] }
    ]
  };
}

/* ---------------- validateRevision ---------------- */

test('validator: the prompt exemplar revision validates clean', () => {
  assert.deepEqual(validateRevision(JSON.parse(FRACTIONS_REVISION_EXEMPLAR)), []);
});

test('validator: a minimal hand-built revision validates clean', () => {
  assert.deepEqual(validateRevision(minimalRevision()), []);
});

test('validator: validateRevision is exported from player/validate.js (validate-cli surface)', () => {
  const validate = require('../player/validate.js');
  assert.equal(typeof validate.validateRevision, 'function');
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateRevision(null), ['spec: must be an object']);
  assert.deepEqual(validateRevision('revision'), ['spec: must be an object']);
  assert.deepEqual(validateRevision([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalRevision();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateRevision(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: fewer than 4 flashcards are rejected', () => {
  const doc = minimalRevision();
  doc.flashcards = doc.flashcards.slice(0, 3);
  assert.ok(hasError(validateRevision(doc), 'flashcards: required array of at least 4 flashcards'));
  const none = minimalRevision();
  delete none.flashcards;
  assert.ok(hasError(validateRevision(none), 'flashcards: required array of at least 4 flashcards'));
  const notArray = minimalRevision();
  notArray.flashcards = 'cards';
  assert.ok(hasError(validateRevision(notArray), 'flashcards: required array of at least 4 flashcards'));
});

test('validator: a non-object flashcard is rejected', () => {
  const doc = minimalRevision();
  doc.flashcards[1] = 'trap card';
  assert.ok(hasError(validateRevision(doc), 'flashcards[1]: must be an object'));
  const arr = minimalRevision();
  arr.flashcards[2] = ['not', 'a', 'card'];
  assert.ok(hasError(validateRevision(arr), 'flashcards[2]: must be an object'));
});

test('validator: flashcard front and back are required non-empty', () => {
  const doc = minimalRevision();
  delete doc.flashcards[0].front;
  doc.flashcards[1].back = '  ';
  const errors = validateRevision(doc);
  assert.ok(hasError(errors, 'flashcards[0].front: required non-empty string'));
  assert.ok(hasError(errors, 'flashcards[1].back: required non-empty string'));
});

test('validator: flashcard source must be one of quiz-bank, definition, trap', () => {
  const doc = minimalRevision();
  doc.flashcards[0].source = 'notes';
  assert.ok(hasError(validateRevision(doc), 'flashcards[0].source: must be one of quiz-bank|definition|trap'));
  const missing = minimalRevision();
  delete missing.flashcards[2].source;
  assert.ok(hasError(validateRevision(missing), 'flashcards[2].source: must be one of quiz-bank|definition|trap'));
});

test('validator: fewer than 2 practice sets are rejected', () => {
  const doc = minimalRevision();
  doc.practiceSets = doc.practiceSets.slice(0, 1);
  assert.ok(hasError(validateRevision(doc), 'practiceSets: required array of at least 2 practice sets'));
  const none = minimalRevision();
  delete none.practiceSets;
  assert.ok(hasError(validateRevision(none), 'practiceSets: required array of at least 2 practice sets'));
});

test('validator: a non-object practice set is rejected', () => {
  const doc = minimalRevision();
  doc.practiceSets[0] = 'day one';
  assert.ok(hasError(validateRevision(doc), 'practiceSets[0]: must be an object'));
});

test('validator: dayOffset must be a positive integer', () => {
  const zero = minimalRevision();
  zero.practiceSets[0].dayOffset = 0;
  assert.ok(hasError(validateRevision(zero), 'practiceSets[0].dayOffset: must be a positive integer'));
  const frac = minimalRevision();
  frac.practiceSets[1].dayOffset = 2.5;
  assert.ok(hasError(validateRevision(frac), 'practiceSets[1].dayOffset: must be a positive integer'));
  const str = minimalRevision();
  str.practiceSets[0].dayOffset = '1';
  assert.ok(hasError(validateRevision(str), 'practiceSets[0].dayOffset: must be a positive integer'));
});

test('validator: dayOffset must be strictly increasing across sets', () => {
  const equal = minimalRevision();
  equal.practiceSets[1].dayOffset = 1;
  assert.ok(hasError(validateRevision(equal), 'practiceSets[1].dayOffset: must be strictly increasing across practice sets'));
  const down = minimalRevision();
  down.practiceSets[0].dayOffset = 5;
  assert.ok(hasError(validateRevision(down), 'practiceSets[1].dayOffset: must be strictly increasing across practice sets'));
});

test('validator: practice set items must be a non-empty array of prompt/answer objects', () => {
  const empty = minimalRevision();
  empty.practiceSets[0].items = [];
  assert.ok(hasError(validateRevision(empty), 'practiceSets[0].items: required non-empty array of practice items'));
  const missing = minimalRevision();
  delete missing.practiceSets[1].items;
  assert.ok(hasError(validateRevision(missing), 'practiceSets[1].items: required non-empty array of practice items'));
  const nonObject = minimalRevision();
  nonObject.practiceSets[0].items = ['recall'];
  assert.ok(hasError(validateRevision(nonObject), 'practiceSets[0].items[0]: must be an object'));
  const blank = minimalRevision();
  blank.practiceSets[0].items[0].prompt = ' ';
  delete blank.practiceSets[1].items[0].answer;
  const errors = validateRevision(blank);
  assert.ok(hasError(errors, 'practiceSets[0].items[0].prompt: required non-empty string'));
  assert.ok(hasError(errors, 'practiceSets[1].items[0].answer: required non-empty string'));
});

/* ---------------- derivation: exemplar is verbatim from bank + notes ---------------- */

test('derivation: exemplar cards and practice items are verbatim from the fractions quiz bank and notes', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const bank = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'samples', 'quiz-banks', 'primary-math-fractions-addition.json'), 'utf8'));
  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'samples', 'notes', 'primary-math-fractions-addition.json'), 'utf8'));
  const exemplar = JSON.parse(FRACTIONS_REVISION_EXEMPLAR);
  const bankPairs = bank.items.map((item) => item.prompt + ' || ' + item.answer);
  for (const card of exemplar.flashcards) {
    if (card.source === 'quiz-bank') {
      assert.ok(bankPairs.includes(card.front + ' || ' + card.back), 'quiz-bank card verbatim: ' + card.front);
    } else if (card.source === 'definition') {
      assert.ok(notes.definitions.some((d) => d.term === card.front && d.meaning === card.back), 'definition card verbatim: ' + card.front);
    } else {
      assert.equal(card.front, notes.trap.misconception);
      assert.equal(card.back, notes.trap.explanation);
    }
  }
  for (const set of exemplar.practiceSets) {
    for (const item of set.items) {
      assert.ok(bankPairs.includes(item.prompt + ' || ' + item.answer), 'practice item verbatim: ' + item.prompt);
    }
  }
});

/* ---------------- buildRevisionPrompts ---------------- */

const TRANSITIONS = [
  { name: 'Common denominator', from_state: 'halves and quarters side by side', to_state: 'both fractions written in quarters', driver: 'renaming one half as two quarters' },
  { name: 'Adding quarters', from_state: 'two amounts in quarters', to_state: 'one total in quarters', driver: 'adding the top numbers only' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(system.indexOf('revision author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_REVISION_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('title, level, subject, topic, flashcards, practiceSets') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(REVISION_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject is required', () => {
  assert.throws(() => buildRevisionPrompts({}), /buildRevisionPrompts: subject is required/);
  assert.throws(() => buildRevisionPrompts(), /buildRevisionPrompts: subject is required/);
});

test('prompt: the user message carries the fractions wrongTurn when the topic resolves', () => {
  const { user } = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition', topicLabel: 'Adding fractions' });
  assert.ok(user.indexOf('Topic misconception bank entry:') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  assert.ok(user.indexOf('Adding fractions (fractions-addition)') !== -1);
});

test('prompt: opts.bank wins over the bank lookup', () => {
  const { user } = buildRevisionPrompts({
    subject: 'math', topic: 'fractions-addition',
    bank: { wrongTurn: 'CUSTOM WRONG TURN', why: 'a custom reason', correctTurn: 'the custom fix' }
  });
  assert.ok(user.indexOf('Wrong turn: CUSTOM WRONG TURN') !== -1);
  assert.ok(user.indexOf(BANK_WRONG_TURN) === -1);
});

test('prompt: the generic line appears when no bank entry resolves and no opts.bank is given', () => {
  const { user } = buildRevisionPrompts({ subject: 'math', topic: 'no-such-topic-xyz' });
  assert.ok(user.indexOf('No misconception bank entry was supplied for this topic') !== -1);
});

test('prompt: an unknown level falls back to the level name and the secondary tone', () => {
  const { system } = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition', level: 'graduate' });
  assert.ok(system.indexOf('Write for a graduate student') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: transitions add the span block keyed to transition order', () => {
  const plain = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(plain.system.indexOf('TRANSITION SPAN') === -1);
  assert.ok(plain.user.indexOf('Ordered state transitions') === -1);
  const withBeat = JSON.parse(JSON.stringify(TRANSITIONS));
  withBeat[0].misconception = {
    wrongTurn: BANK_WRONG_TURN,
    why: 'The bottom number names the piece size.',
    correctTurn: 'Rename one half as two quarters first.'
  };
  const { system, user } = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION SPAN') !== -1);
  assert.ok(user.indexOf('1. Common denominator: "halves and quarters side by side" -> "both fractions written in quarters" (driver: renaming one half as two quarters)') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  const empty = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION SPAN') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildRevisionPrompts({ subject: 'math', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildRevisionPrompts({ subject: 'math', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildRevisionPrompts({ subject: 'math', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = JSON.parse(JSON.stringify(TRANSITIONS));
  delete noDriver[1].driver;
  assert.throws(() => buildRevisionPrompts({ subject: 'math', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildRevisionPrompts({ subject: 'math', topic: 'fractions-addition', workedExample: 'EXAMPLE QUIZ BANK' });
  assert.ok(user.indexOf('Worked example for this topic') !== -1);
  assert.ok(user.indexOf('EXAMPLE QUIZ BANK') !== -1);
  assert.throws(() => buildRevisionPrompts({ subject: 'math', workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateRevision ---------------- */

const OPTS = { topic: 'fractions-addition', topicLabel: 'Adding fractions', level: 'primary', subject: 'math' };

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isRevisionCall(system) { return system.indexOf('revision author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: a topic with no bank entry rejects before any callChat call, naming revision', async () => {
  const { calls, callChat } = stubChat(() => REV_TEXT);
  await assert.rejects(
    () => PIPELINE.generateRevision({ topic: 'no-such-topic-xyz', level: 'primary', subject: 'math' }, { callChat }),
    /generateRevision: no misconception bank entry for topic "no-such-topic-xyz" - revision materials are generated from the bank and never invent misconceptions/);
  assert.equal(calls.length, 0, 'callChat is never called without a bank entry');
});

test('pipeline: a free-text topic resolves through its slugified form', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : REV_TEXT);
  const doc = await PIPELINE.generateRevision(
    { topic: 'Fractions Addition', level: 'primary', subject: 'math' }, { callChat });
  assert.deepEqual(doc, REV_OBJ);
});

test('pipeline: happy path resolves the exemplar with the bank entry in the author prompt', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : REV_TEXT);
  const doc = await PIPELINE.generateRevision(OPTS, { callChat });
  assert.deepEqual(doc, REV_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isRevisionCall(calls[1].system), 'author call uses the revision author prompt');
  assert.ok(calls[1].user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1,
    'author user message carries the resolved bank entry');
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : REV_TEXT;
  });
  const doc = await PIPELINE.generateRevision(OPTS, { callChat });
  assert.deepEqual(doc, REV_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: repair exhaustion rejects with the problem list', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(
    () => PIPELINE.generateRevision({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.ok(Array.isArray(err.problems), 'rejection carries err.problems');
      assert.ok(err.problems.length > 0);
      return true;
    });
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateRevision(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateRevision(OPTS, {}), /callChat/);
});

test('pipeline: a custom validateRevision dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal revision' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateRevision(OPTS, { callChat, validateRevision: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a rejecting unpack call still resolves a valid material', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(REV_TEXT);
  };
  const doc = await PIPELINE.generateRevision(OPTS, { callChat });
  assert.deepEqual(doc, REV_OBJ);
});
