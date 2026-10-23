/* animath diagnostics tests - zero network.
 * Guards the diagnostics core (issue #1241, slice 1 of #1240):
 * validateDiagnostics in player/validate.js, buildDiagnosticsPrompts
 * in generator/build_diagnostics_prompt.js (its exemplar must
 * validate clean), and generateDiagnostics in generator/pipeline.js
 * (the generateScaffolds sibling - same unpack -> author -> repair
 * stages, validation through validateDiagnostics, and a hard rule
 * that diagnostics are generated from the misconception bank, never
 * invented). deps.callChat is stubbed throughout; no LLM calls leave
 * the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateDiagnostics } = require('../player/validate.js');
const {
  buildDiagnosticsPrompts,
  DIAGNOSTICS_SYSTEM_TEMPLATE,
  FRACTIONS_DIAGNOSTICS_EXEMPLAR
} = require('../generator/build_diagnostics_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const DIAG_OBJ = JSON.parse(FRACTIONS_DIAGNOSTICS_EXEMPLAR);
const DIAG_TEXT = JSON.stringify(DIAG_OBJ);
const BANK_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function distractor(text) {
  return {
    text: text,
    misconception: 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.',
    rationale: {
      chose: 'The learner picked the coded wrong answer here.',
      thinks: 'They are following the coded wrong turn.',
      reteach: 'Reteach the step with a bar model first.'
    }
  };
}

function mcQuestion(id, prompt, hinge) {
  const q = {
    id: id, prompt: prompt, kind: 'multiple-choice',
    choices: [{ text: '3/4', correct: true }, distractor('2/6')]
  };
  if (hinge) q.scriptCue = 'Hinge point after the worked example';
  return q;
}

function minimalDiagnostics() {
  return {
    title: 'Adding Fractions Diagnostics', level: 'primary', subject: 'math', topic: 'fractions-addition',
    doNow: [
      mcQuestion('dn1', 'What is 1/2 + 1/4?'),
      mcQuestion('dn2', 'What is 1/3 + 1/3?')
    ],
    hingeQuestions: [mcQuestion('h1', 'Which first step is right?', true)]
  };
}

/* ---------------- validateDiagnostics ---------------- */

test('validator: the prompt exemplar diagnostics validate clean', () => {
  assert.deepEqual(validateDiagnostics(JSON.parse(FRACTIONS_DIAGNOSTICS_EXEMPLAR)), []);
});

test('validator: a minimal hand-built material validates clean', () => {
  assert.deepEqual(validateDiagnostics(minimalDiagnostics()), []);
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateDiagnostics(null), ['spec: must be an object']);
  assert.deepEqual(validateDiagnostics('diagnostics'), ['spec: must be an object']);
  assert.deepEqual(validateDiagnostics([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalDiagnostics();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateDiagnostics(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: doNow counts outside 2..4 are rejected', () => {
  const one = minimalDiagnostics();
  one.doNow = one.doNow.slice(0, 1);
  assert.ok(hasError(validateDiagnostics(one), 'doNow: required array of 2..4 questions'));
  const five = minimalDiagnostics();
  five.doNow.push(mcQuestion('dn3', 'What is 1/5 + 1/5?'), mcQuestion('dn4', 'What is 2/5 + 1/5?'), mcQuestion('dn5', 'What is 3/5 + 1/5?'));
  assert.ok(hasError(validateDiagnostics(five), 'doNow: required array of 2..4 questions'));
});

test('validator: hinge counts outside 1..3 are rejected', () => {
  const zero = minimalDiagnostics();
  zero.hingeQuestions = [];
  assert.ok(hasError(validateDiagnostics(zero), 'hingeQuestions: required array of 1..3 questions'));
  const four = minimalDiagnostics();
  four.hingeQuestions.push(
    mcQuestion('h2', 'Second hinge?', true),
    mcQuestion('h3', 'Third hinge?', true),
    mcQuestion('h4', 'Fourth hinge?', true));
  assert.ok(hasError(validateDiagnostics(four), 'hingeQuestions: required array of 1..3 questions'));
});

test('validator: a non-array doNow is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow = 'questions';
  assert.ok(hasError(validateDiagnostics(doc), 'doNow: required array of 2..4 questions'));
});

test('validator: a question that is not an object is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0] = 'nope';
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0]: must be an object'));
});

test('validator: duplicate id across doNow and hingeQuestions is rejected', () => {
  const doc = minimalDiagnostics();
  doc.hingeQuestions[0].id = 'dn1';
  assert.ok(hasError(validateDiagnostics(doc), 'hingeQuestions[0].id: duplicate question id "dn1"'));
});

test('validator: a missing question id is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].id;
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].id: required non-empty string'));
});

test('validator: a missing prompt is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].prompt;
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].prompt: required non-empty string'));
});

test('validator: kind short-answer is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].kind = 'short-answer';
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].kind: must be multiple-choice'));
});

test('validator: a missing kind is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[1].kind;
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[1].kind: must be multiple-choice'));
});

test('validator: fewer than 2 choices is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices = [{ text: '3/4', correct: true }];
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].choices: required array of at least 2 choices'));
});

test('validator: zero correct choices and two correct choices are rejected', () => {
  const zero = minimalDiagnostics();
  zero.doNow[0].choices[0].correct = false;
  assert.ok(hasError(validateDiagnostics(zero), 'doNow[0].choices: exactly one choice must be marked correct'));
  const two = minimalDiagnostics();
  two.doNow[0].choices[1].correct = true;
  assert.ok(hasError(validateDiagnostics(two), 'doNow[0].choices: exactly one choice must be marked correct'));
});

test('validator: a choice missing its text is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].choices[1].text;
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].choices[1].text: required non-empty string'));
});

test('validator: a choice that is not an object is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1] = '2/6';
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].choices[1]: must be an object'));
});

test('validator: a hinge question without a scriptCue is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.hingeQuestions[0].scriptCue;
  assert.ok(hasError(validateDiagnostics(doc), 'hingeQuestions[0].scriptCue: required non-empty string on hinge questions'));
});

test('validator: a doNow question carrying a scriptCue is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].scriptCue = 'Not a hinge';
  assert.ok(hasError(validateDiagnostics(doc), 'doNow[0].scriptCue: belongs on hinge questions only'));
});

test('validator: a distractor without a misconception is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].choices[1].misconception;
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].misconception: required non-empty string on an incorrect choice'));
});

test('validator: a distractor with an empty misconception is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1].misconception = '  ';
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].misconception: required non-empty string on an incorrect choice'));
});

test('validator: the correct choice must not carry a misconception', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[0].misconception = BANK_WRONG_TURN;
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[0].misconception: must not appear on the correct choice'));
});

test('validator: the correct choice must not carry a rationale', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[0].rationale = {
    chose: 'The learner picked the right answer.',
    thinks: 'They understand the step.',
    reteach: 'No reteach needed here.'
  };
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[0].rationale: must not appear on the correct choice'));
});

test('validator: a rationale that is not an object is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1].rationale = 'because they added the bottoms';
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale: required object on an incorrect choice'));
});

test('validator: a rationale missing chose is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].choices[1].rationale.chose;
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale.chose: required non-empty string'));
});

test('validator: a rationale missing thinks is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].choices[1].rationale.thinks;
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale.thinks: required non-empty string'));
});

test('validator: a rationale missing reteach is rejected', () => {
  const doc = minimalDiagnostics();
  delete doc.doNow[0].choices[1].rationale.reteach;
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale.reteach: required non-empty string'));
});

test('validator: a rationale part that is an empty string is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1].rationale.thinks = ' ';
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale.thinks: required non-empty string'));
});

test('validator: a rationale with an extra key is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1].rationale.extra = 'surprise';
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale: must carry exactly the chose, thinks and reteach parts'));
});

test('validator: rationale text appearing verbatim in the prompt is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1].rationale.chose = 'What is 1/2';
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale.chose: rationale text must not appear in the prompt or choice text (teacher-only)'));
});

test('validator: rationale text appearing verbatim in a choice text is rejected', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[0].text = 'three quarters in total';
  doc.doNow[0].choices[1].rationale.thinks = 'three quarters';
  assert.ok(hasError(validateDiagnostics(doc),
    'doNow[0].choices[1].rationale.thinks: rationale text must not appear in the prompt or choice text (teacher-only)'));
});

test('validator: a rationale part shorter than 4 chars skips the leak check', () => {
  const doc = minimalDiagnostics();
  doc.doNow[0].choices[1].rationale.chose = '2/6';
  assert.deepEqual(validateDiagnostics(doc), []);
});

/* ---------------- buildDiagnosticsPrompts ---------------- */

const TRANSITIONS = [
  { name: 'Common denominator', from_state: 'halves and quarters side by side', to_state: 'both fractions written in quarters', driver: 'renaming one half as two quarters' },
  { name: 'Adding quarters', from_state: 'two amounts in quarters', to_state: 'one total in quarters', driver: 'adding the top numbers only' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildDiagnosticsPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(system.indexOf('diagnostics author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_DIAGNOSTICS_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('doNow, hingeQuestions') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(DIAGNOSTICS_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject is required', () => {
  assert.throws(() => buildDiagnosticsPrompts({}), /buildDiagnosticsPrompts: subject is required/);
  assert.throws(() => buildDiagnosticsPrompts(), /buildDiagnosticsPrompts: subject is required/);
});

test('prompt: the user message carries the fractions wrongTurn when the topic resolves', () => {
  const { user } = buildDiagnosticsPrompts({ subject: 'math', topic: 'fractions-addition', topicLabel: 'Adding fractions' });
  assert.ok(user.indexOf('Topic misconception bank entry:') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  assert.ok(user.indexOf('Adding fractions (fractions-addition)') !== -1);
});

test('prompt: opts.bank wins over the bank lookup', () => {
  const { user } = buildDiagnosticsPrompts({
    subject: 'math', topic: 'fractions-addition',
    bank: { wrongTurn: 'CUSTOM WRONG TURN', why: 'a custom reason', correctTurn: 'the custom fix' }
  });
  assert.ok(user.indexOf('Wrong turn: CUSTOM WRONG TURN') !== -1);
  assert.ok(user.indexOf(BANK_WRONG_TURN) === -1);
});

test('prompt: the generic line appears when no bank entry resolves and no opts.bank is given', () => {
  const { user } = buildDiagnosticsPrompts({ subject: 'math', topic: 'no-such-topic-xyz' });
  assert.ok(user.indexOf('No misconception bank entry was supplied for this topic') !== -1);
});

test('prompt: transitions add the hinge block keyed to transition order', () => {
  const plain = buildDiagnosticsPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(plain.system.indexOf('TRANSITION HINGES') === -1);
  assert.ok(plain.user.indexOf('Ordered state transitions') === -1);
  const withBeat = JSON.parse(JSON.stringify(TRANSITIONS));
  withBeat[0].misconception = {
    wrongTurn: BANK_WRONG_TURN,
    why: 'The bottom number names the piece size.',
    correctTurn: 'Rename one half as two quarters first.'
  };
  const { system, user } = buildDiagnosticsPrompts({ subject: 'math', topic: 'fractions-addition', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION HINGES') !== -1);
  assert.ok(system.indexOf('scriptCue') !== -1);
  assert.ok(user.indexOf('1. Common denominator: "halves and quarters side by side" -> "both fractions written in quarters" (driver: renaming one half as two quarters)') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  const empty = buildDiagnosticsPrompts({ subject: 'math', topic: 'fractions-addition', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION HINGES') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildDiagnosticsPrompts({ subject: 'math', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildDiagnosticsPrompts({ subject: 'math', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildDiagnosticsPrompts({ subject: 'math', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = JSON.parse(JSON.stringify(TRANSITIONS));
  delete noDriver[1].driver;
  assert.throws(() => buildDiagnosticsPrompts({ subject: 'math', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildDiagnosticsPrompts({ subject: 'math', topic: 'fractions-addition', workedExample: 'EXAMPLE DIAGNOSTICS' });
  assert.ok(user.indexOf('Worked example for this topic') !== -1);
  assert.ok(user.indexOf('EXAMPLE DIAGNOSTICS') !== -1);
  assert.throws(() => buildDiagnosticsPrompts({ subject: 'math', workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateDiagnostics ---------------- */

const OPTS = { topic: 'fractions-addition', topicLabel: 'Adding fractions', level: 'primary', subject: 'math' };

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isDiagnosticsCall(system) { return system.indexOf('diagnostics author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: a topic with no bank entry rejects before any callChat call', async () => {
  const { calls, callChat } = stubChat(() => DIAG_TEXT);
  await assert.rejects(
    () => PIPELINE.generateDiagnostics({ topic: 'no-such-topic-xyz', level: 'primary', subject: 'math' }, { callChat }),
    /generateDiagnostics: no misconception bank entry for topic "no-such-topic-xyz" - diagnostics are generated from the bank and never invent misconceptions/);
  assert.equal(calls.length, 0, 'callChat is never called without a bank entry');
});

test('pipeline: happy path resolves the exemplar with the bank entry in the author prompt', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : DIAG_TEXT);
  const doc = await PIPELINE.generateDiagnostics(OPTS, { callChat });
  assert.deepEqual(doc, DIAG_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isDiagnosticsCall(calls[1].system), 'author call uses the diagnostics author prompt');
  assert.ok(calls[1].user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1,
    'author user message carries the resolved bank entry');
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : DIAG_TEXT;
  });
  const doc = await PIPELINE.generateDiagnostics(OPTS, { callChat });
  assert.deepEqual(doc, DIAG_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateDiagnostics(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateDiagnostics(OPTS, {}), /callChat/);
});

test('pipeline: a custom validateDiagnostics dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal diagnostics' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateDiagnostics(OPTS, { callChat, validateDiagnostics: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a rejecting unpack call still resolves a valid material', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(DIAG_TEXT);
  };
  const doc = await PIPELINE.generateDiagnostics(OPTS, { callChat });
  assert.deepEqual(doc, DIAG_OBJ);
});
