/* animath organisers tests - zero network.
 * Guards the organisers core (issue #1277, slice 1 of #1276):
 * validateOrganisers in player/validate.js, buildOrganisersPrompts
 * in generator/build_organisers_prompt.js (its exemplar must
 * validate clean and derive verbatim from the fractions student
 * notes), and generateOrganisers in generator/pipeline.js (the
 * generateRevision sibling - bank resolved verbatim then slugified
 * with an honest no-bank failure naming organisers, the same
 * unpack -> author -> repair stages, validation through
 * validateOrganisers). deps.callChat is stubbed throughout; no LLM
 * calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateOrganisers } = require('../player/validate.js');
const {
  buildOrganisersPrompts,
  ORGANISERS_SYSTEM_TEMPLATE,
  FRACTIONS_ORGANISERS_EXEMPLAR
} = require('../generator/build_organisers_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const ORG_OBJ = JSON.parse(FRACTIONS_ORGANISERS_EXEMPLAR);
const ORG_TEXT = JSON.stringify(ORG_OBJ);
const BANK_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalOrganisers() {
  return {
    title: 'Adding fractions: 1/2 + 1/4', level: 'primary', subject: 'math', topic: 'fractions',
    templates: [
      {
        kind: 'flow',
        slots: [
          { label: 'Pose the sum', entries: ['Adding fractions: pose the sum 1/2 + 1/4.'], studentPrompt: 'Write the sum.' },
          { label: 'Count the pieces', entries: ['Count the quarters: 2/4 + 1/4 = 3/4.'] }
        ]
      },
      {
        kind: 'kwl',
        slots: [
          { label: 'What I know', entries: ['A fraction is a part of a whole.'], studentPrompt: 'Add one thing you already know.' }
        ]
      }
    ]
  };
}

/* ---------------- validateOrganisers ---------------- */

test('validator: the prompt exemplar organisers validates clean', () => {
  assert.deepEqual(validateOrganisers(JSON.parse(FRACTIONS_ORGANISERS_EXEMPLAR)), []);
});

test('validator: a minimal hand-built organisers validates clean', () => {
  assert.deepEqual(validateOrganisers(minimalOrganisers()), []);
});

test('validator: validateOrganisers is exported from player/validate.js (validate-cli surface)', () => {
  const validate = require('../player/validate.js');
  assert.equal(typeof validate.validateOrganisers, 'function');
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateOrganisers(null), ['spec: must be an object']);
  assert.deepEqual(validateOrganisers('organisers'), ['spec: must be an object']);
  assert.deepEqual(validateOrganisers([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalOrganisers();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateOrganisers(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: fewer than 2 templates are rejected', () => {
  const doc = minimalOrganisers();
  doc.templates = doc.templates.slice(0, 1);
  assert.ok(hasError(validateOrganisers(doc), 'templates: required array of at least 2 templates'));
  const none = minimalOrganisers();
  delete none.templates;
  assert.ok(hasError(validateOrganisers(none), 'templates: required array of at least 2 templates'));
  const notArray = minimalOrganisers();
  notArray.templates = 'templates';
  assert.ok(hasError(validateOrganisers(notArray), 'templates: required array of at least 2 templates'));
});

test('validator: a non-object template is rejected', () => {
  const doc = minimalOrganisers();
  doc.templates[1] = 'kwl chart';
  assert.ok(hasError(validateOrganisers(doc), 'templates[1]: must be an object'));
  const arr = minimalOrganisers();
  arr.templates[0] = ['not', 'a', 'template'];
  assert.ok(hasError(validateOrganisers(arr), 'templates[0]: must be an object'));
});

test('validator: template kind must be one of kwl, frayer, venn, flow, concept-map', () => {
  const doc = minimalOrganisers();
  doc.templates[0].kind = 'mind-map';
  assert.ok(hasError(validateOrganisers(doc), 'templates[0].kind: must be one of kwl|frayer|venn|flow|concept-map'));
  const missing = minimalOrganisers();
  delete missing.templates[1].kind;
  assert.ok(hasError(validateOrganisers(missing), 'templates[1].kind: must be one of kwl|frayer|venn|flow|concept-map'));
  for (const kind of ['kwl', 'frayer', 'venn', 'flow', 'concept-map']) {
    const ok = minimalOrganisers();
    ok.templates[0].kind = kind;
    assert.deepEqual(validateOrganisers(ok), [], 'kind ' + kind + ' validates clean');
  }
});

test('validator: template slots must be a non-empty array', () => {
  const empty = minimalOrganisers();
  empty.templates[0].slots = [];
  assert.ok(hasError(validateOrganisers(empty), 'templates[0].slots: required non-empty array of slots'));
  const missing = minimalOrganisers();
  delete missing.templates[1].slots;
  assert.ok(hasError(validateOrganisers(missing), 'templates[1].slots: required non-empty array of slots'));
});

test('validator: a non-object slot is rejected', () => {
  const doc = minimalOrganisers();
  doc.templates[0].slots[0] = 'first step';
  assert.ok(hasError(validateOrganisers(doc), 'templates[0].slots[0]: must be an object'));
});

test('validator: slot label is a required non-empty string', () => {
  const doc = minimalOrganisers();
  delete doc.templates[0].slots[0].label;
  doc.templates[1].slots[0].label = '  ';
  const errors = validateOrganisers(doc);
  assert.ok(hasError(errors, 'templates[0].slots[0].label: required non-empty string'));
  assert.ok(hasError(errors, 'templates[1].slots[0].label: required non-empty string'));
});

test('validator: slot entries must be a non-empty array of non-empty strings', () => {
  const empty = minimalOrganisers();
  empty.templates[0].slots[0].entries = [];
  assert.ok(hasError(validateOrganisers(empty), 'templates[0].slots[0].entries: required non-empty array of non-empty strings'));
  const missing = minimalOrganisers();
  delete missing.templates[1].slots[0].entries;
  assert.ok(hasError(validateOrganisers(missing), 'templates[1].slots[0].entries: required non-empty array of non-empty strings'));
  const blank = minimalOrganisers();
  blank.templates[0].slots[1].entries = ['Count the quarters.', ' '];
  assert.ok(hasError(validateOrganisers(blank), 'templates[0].slots[1].entries[1]: must be a non-empty string'));
  const nonString = minimalOrganisers();
  nonString.templates[0].slots[0].entries = [42];
  assert.ok(hasError(validateOrganisers(nonString), 'templates[0].slots[0].entries[0]: must be a non-empty string'));
});

test('validator: studentPrompt is optional but must be a non-empty string when present', () => {
  const absent = minimalOrganisers();
  delete absent.templates[0].slots[0].studentPrompt;
  assert.deepEqual(validateOrganisers(absent), []);
  const blank = minimalOrganisers();
  blank.templates[0].slots[0].studentPrompt = ' ';
  assert.ok(hasError(validateOrganisers(blank), 'templates[0].slots[0].studentPrompt: must be a non-empty string when present'));
  const nonString = minimalOrganisers();
  nonString.templates[1].slots[0].studentPrompt = 7;
  assert.ok(hasError(validateOrganisers(nonString), 'templates[1].slots[0].studentPrompt: must be a non-empty string when present'));
});

/* ---------------- derivation: exemplar is verbatim from the notes ---------------- */

test('derivation: exemplar flow entries are the notes mechanismSteps in order and frayer slots carry notes definitions verbatim', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'samples', 'notes', 'primary-math-fractions-addition.json'), 'utf8'));
  const exemplar = JSON.parse(FRACTIONS_ORGANISERS_EXEMPLAR);
  assert.equal(exemplar.title, notes.title);
  assert.equal(exemplar.level, notes.level);
  assert.equal(exemplar.subject, notes.subject);
  assert.equal(exemplar.topic, notes.topic);
  const flow = exemplar.templates.find((t) => t.kind === 'flow');
  assert.ok(flow, 'exemplar carries a flow template');
  const flowEntries = [];
  for (const slot of flow.slots) {
    for (const entry of slot.entries) flowEntries.push(entry);
  }
  assert.deepEqual(flowEntries, notes.mechanismSteps);
  const frayer = exemplar.templates.find((t) => t.kind === 'frayer');
  assert.ok(frayer, 'exemplar carries a frayer template');
  for (const slot of frayer.slots) {
    const def = notes.definitions.find((d) => d.term === slot.label);
    assert.ok(def, 'frayer slot label is a notes definition term verbatim: ' + slot.label);
    assert.deepEqual(slot.entries, [def.meaning], 'frayer slot entries are the term meaning verbatim: ' + slot.label);
  }
});

/* ---------------- buildOrganisersPrompts ---------------- */

const TRANSITIONS = [
  { name: 'Common denominator', from_state: 'halves and quarters side by side', to_state: 'both fractions written in quarters', driver: 'renaming one half as two quarters' },
  { name: 'Adding quarters', from_state: 'two amounts in quarters', to_state: 'one total in quarters', driver: 'adding the top numbers only' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(system.indexOf('organisers author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_ORGANISERS_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('title, level, subject, topic, templates') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(ORGANISERS_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject is required', () => {
  assert.throws(() => buildOrganisersPrompts({}), /buildOrganisersPrompts: subject is required/);
  assert.throws(() => buildOrganisersPrompts(), /buildOrganisersPrompts: subject is required/);
});

test('prompt: the user message carries the fractions wrongTurn when the topic resolves', () => {
  const { user } = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition', topicLabel: 'Adding fractions' });
  assert.ok(user.indexOf('Topic misconception bank entry:') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  assert.ok(user.indexOf('Adding fractions (fractions-addition)') !== -1);
});

test('prompt: opts.bank wins over the bank lookup', () => {
  const { user } = buildOrganisersPrompts({
    subject: 'math', topic: 'fractions-addition',
    bank: { wrongTurn: 'CUSTOM WRONG TURN', why: 'a custom reason', correctTurn: 'the custom fix' }
  });
  assert.ok(user.indexOf('Wrong turn: CUSTOM WRONG TURN') !== -1);
  assert.ok(user.indexOf(BANK_WRONG_TURN) === -1);
});

test('prompt: the generic line appears when no bank entry resolves and no opts.bank is given', () => {
  const { user } = buildOrganisersPrompts({ subject: 'math', topic: 'no-such-topic-xyz' });
  assert.ok(user.indexOf('No misconception bank entry was supplied for this topic') !== -1);
});

test('prompt: an unknown level falls back to the level name and the secondary tone', () => {
  const { system } = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition', level: 'graduate' });
  assert.ok(system.indexOf('Write for a graduate student') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: transitions add the span block keyed to transition order', () => {
  const plain = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(plain.system.indexOf('TRANSITION SPAN') === -1);
  assert.ok(plain.user.indexOf('Ordered state transitions') === -1);
  const withBeat = JSON.parse(JSON.stringify(TRANSITIONS));
  withBeat[0].misconception = {
    wrongTurn: BANK_WRONG_TURN,
    why: 'The bottom number names the piece size.',
    correctTurn: 'Rename one half as two quarters first.'
  };
  const { system, user } = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION SPAN') !== -1);
  assert.ok(user.indexOf('1. Common denominator: "halves and quarters side by side" -> "both fractions written in quarters" (driver: renaming one half as two quarters)') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  const empty = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION SPAN') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildOrganisersPrompts({ subject: 'math', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildOrganisersPrompts({ subject: 'math', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildOrganisersPrompts({ subject: 'math', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = JSON.parse(JSON.stringify(TRANSITIONS));
  delete noDriver[1].driver;
  assert.throws(() => buildOrganisersPrompts({ subject: 'math', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildOrganisersPrompts({ subject: 'math', topic: 'fractions-addition', workedExample: 'EXAMPLE NOTES' });
  assert.ok(user.indexOf('Worked example for this topic') !== -1);
  assert.ok(user.indexOf('EXAMPLE NOTES') !== -1);
  assert.throws(() => buildOrganisersPrompts({ subject: 'math', workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateOrganisers ---------------- */

const OPTS = { topic: 'fractions-addition', topicLabel: 'Adding fractions', level: 'primary', subject: 'math' };

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isOrganisersCall(system) { return system.indexOf('organisers author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: a topic with no bank entry rejects before any callChat call, naming organisers', async () => {
  const { calls, callChat } = stubChat(() => ORG_TEXT);
  await assert.rejects(
    () => PIPELINE.generateOrganisers({ topic: 'no-such-topic-xyz', level: 'primary', subject: 'math' }, { callChat }),
    /generateOrganisers: no misconception bank entry for topic "no-such-topic-xyz" - organisers materials are generated from the bank and never invent misconceptions/);
  assert.equal(calls.length, 0, 'callChat is never called without a bank entry');
});

test('pipeline: a free-text topic resolves through its slugified form', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : ORG_TEXT);
  const doc = await PIPELINE.generateOrganisers(
    { topic: 'Fractions Addition', level: 'primary', subject: 'math' }, { callChat });
  assert.deepEqual(doc, ORG_OBJ);
});

test('pipeline: happy path resolves the exemplar with the bank entry in the author prompt', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : ORG_TEXT);
  const doc = await PIPELINE.generateOrganisers(OPTS, { callChat });
  assert.deepEqual(doc, ORG_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isOrganisersCall(calls[1].system), 'author call uses the organisers author prompt');
  assert.ok(calls[1].user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1,
    'author user message carries the resolved bank entry');
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : ORG_TEXT;
  });
  const doc = await PIPELINE.generateOrganisers(OPTS, { callChat });
  assert.deepEqual(doc, ORG_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: repair exhaustion rejects naming organisers with the problem list', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(
    () => PIPELINE.generateOrganisers({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.ok(err.message.indexOf('Organisers material still invalid') !== -1, 'rejection names organisers: ' + err.message);
      assert.ok(Array.isArray(err.problems), 'rejection carries err.problems');
      assert.ok(err.problems.length > 0);
      return true;
    });
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateOrganisers(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateOrganisers(OPTS, {}), /callChat/);
});

test('pipeline: a custom validateOrganisers dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal organisers' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateOrganisers(OPTS, { callChat, validateOrganisers: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a rejecting unpack call still resolves a valid material', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(ORG_TEXT);
  };
  const doc = await PIPELINE.generateOrganisers(OPTS, { callChat });
  assert.deepEqual(doc, ORG_OBJ);
});
