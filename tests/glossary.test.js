/* animath glossary tests - zero network.
 * Guards the glossary core (issue #1283, slice 3 of #1276):
 * validateGlossary in player/validate.js, buildGlossaryPrompts in
 * generator/build_glossary_prompt.js (its exemplar must validate
 * clean and derive verbatim from the fractions student notes), and
 * generateGlossary in generator/pipeline.js (the generateOrganisers
 * sibling on the notes-content model of issue #1279: no
 * misconception bank gate - it authors from the shared unpack plus
 * any caller-supplied paired notes definitions, mechanismSteps,
 * workedExample and objectives). deps.callChat is stubbed
 * throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateGlossary } = require('../player/validate.js');
const {
  buildGlossaryPrompts,
  GLOSSARY_SYSTEM_TEMPLATE,
  FRACTIONS_GLOSSARY_EXEMPLAR
} = require('../generator/build_glossary_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const GLOSS_OBJ = JSON.parse(FRACTIONS_GLOSSARY_EXEMPLAR);
const GLOSS_TEXT = JSON.stringify(GLOSS_OBJ);
const NOTES = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'notes', 'primary-math-fractions-addition.json'), 'utf8'));
const BANK_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';
const TRANSITIONS = [
  { name: 'Common denominator', from_state: 'halves and quarters side by side', to_state: 'both fractions written in quarters', driver: 'renaming one half as two quarters' },
  { name: 'Add numerators', from_state: 'both fractions written in quarters', to_state: 'three quarters shaded', driver: 'adding the numerators and keeping the denominator' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalGlossary() {
  return {
    title: 'Adding fractions: 1/2 + 1/4', level: 'primary', subject: 'math', topic: 'fractions',
    entries: [
      { term: 'Fraction', meaning: 'A part of a whole.', example: '1/2 is a fraction.' },
      { term: 'Numerator', meaning: 'The top number.', example: 'The numerator of 3/4 is 3.' },
      { term: 'Denominator', meaning: 'The bottom number.', example: 'The denominator of 3/4 is 4.' }
    ]
  };
}

/* ---------------- validateGlossary ---------------- */

test('validator: the prompt exemplar glossary validates clean', () => {
  assert.deepEqual(validateGlossary(JSON.parse(FRACTIONS_GLOSSARY_EXEMPLAR)), []);
});

test('validator: a minimal hand-built glossary validates clean', () => {
  assert.deepEqual(validateGlossary(minimalGlossary()), []);
});

test('validator: validateGlossary is exported from player/validate.js (validate-cli surface)', () => {
  const validate = require('../player/validate.js');
  assert.equal(typeof validate.validateGlossary, 'function');
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateGlossary(null), ['spec: must be an object']);
  assert.deepEqual(validateGlossary('glossary'), ['spec: must be an object']);
  assert.deepEqual(validateGlossary([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalGlossary();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateGlossary(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: fewer than 3 entries are rejected', () => {
  const doc = minimalGlossary();
  doc.entries = doc.entries.slice(0, 2);
  assert.ok(hasError(validateGlossary(doc), 'entries: required array of at least 3 entries'));
  const none = minimalGlossary();
  delete none.entries;
  assert.ok(hasError(validateGlossary(none), 'entries: required array of at least 3 entries'));
  const notArray = minimalGlossary();
  notArray.entries = 'entries';
  assert.ok(hasError(validateGlossary(notArray), 'entries: required array of at least 3 entries'));
});

test('validator: a non-object entry is rejected', () => {
  const doc = minimalGlossary();
  doc.entries[1] = 'Numerator';
  assert.ok(hasError(validateGlossary(doc), 'entries[1]: must be an object'));
  const arr = minimalGlossary();
  arr.entries[0] = ['not', 'an', 'entry'];
  assert.ok(hasError(validateGlossary(arr), 'entries[0]: must be an object'));
});

test('validator: empty term, meaning and example are rejected with named errors', () => {
  const term = minimalGlossary();
  term.entries[0].term = '  ';
  assert.ok(hasError(validateGlossary(term), 'entries[0].term: required non-empty string'));
  const meaning = minimalGlossary();
  delete meaning.entries[1].meaning;
  assert.ok(hasError(validateGlossary(meaning), 'entries[1].meaning: required non-empty string'));
  const example = minimalGlossary();
  example.entries[2].example = '';
  assert.ok(hasError(validateGlossary(example), 'entries[2].example: required non-empty string'));
});

/* ---------------- exemplar derivation ---------------- */

test('exemplar: every term and meaning is a fractions notes definition verbatim', () => {
  const byTerm = new Map(NOTES.definitions.map((d) => [d.term, d.meaning]));
  assert.ok(GLOSS_OBJ.entries.length >= 3);
  for (const entry of GLOSS_OBJ.entries) {
    assert.ok(byTerm.has(entry.term), 'term is a notes definition term: ' + entry.term);
    assert.equal(entry.meaning, byTerm.get(entry.term), 'meaning is the notes meaning verbatim: ' + entry.term);
  }
});

test('exemplar: every example is drawn verbatim from the fractions notes', () => {
  const pool = new Set([NOTES.workedExample, ...NOTES.mechanismSteps, ...NOTES.objectives]);
  for (const entry of GLOSS_OBJ.entries) {
    assert.ok(pool.has(entry.example), 'example is verbatim notes content for: ' + entry.term);
  }
  assert.equal(GLOSS_OBJ.title, NOTES.title);
  assert.equal(GLOSS_OBJ.level, NOTES.level);
  assert.equal(GLOSS_OBJ.subject, NOTES.subject);
  assert.equal(GLOSS_OBJ.topic, NOTES.topic);
});

/* ---------------- buildGlossaryPrompts ---------------- */

test('prompt: system template names the glossary author and carries the exemplar', () => {
  const { system } = buildGlossaryPrompts({ subject: 'math', topic: 'fractions' });
  assert.ok(system.indexOf('glossary author') !== -1);
  assert.ok(system.indexOf(FRACTIONS_GLOSSARY_EXEMPLAR) !== -1);
  assert.ok(GLOSSARY_SYSTEM_TEMPLATE.indexOf(FRACTIONS_GLOSSARY_EXEMPLAR) !== -1);
});

test('prompt: subject is required', () => {
  assert.throws(() => buildGlossaryPrompts({}), /buildGlossaryPrompts: subject is required/);
  assert.throws(() => buildGlossaryPrompts(), /buildGlossaryPrompts: subject is required/);
});

test('prompt: user message carries level, subject, topic and focus', () => {
  const { user } = buildGlossaryPrompts({ subject: 'math', topic: 'fractions', topicLabel: 'Adding fractions', level: 'primary', focus: 'vocabulary' });
  assert.ok(user.indexOf('Level: primary') !== -1);
  assert.ok(user.indexOf('Subject: math') !== -1);
  assert.ok(user.indexOf('Adding fractions (fractions)') !== -1);
  assert.ok(user.indexOf("Student's focus: vocabulary") !== -1);
});

test('prompt: the bank entry reaches the user message for a banked topic', () => {
  const { user } = buildGlossaryPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
});

test('prompt: a bank-less topic gets the generic notes-grounding line', () => {
  const { user } = buildGlossaryPrompts({ subject: 'math', topic: 'no-such-topic-xyz' });
  assert.ok(user.indexOf('No misconception bank entry was supplied') !== -1);
});

test('prompt: supplied notes content reaches the author user message', () => {
  const { user } = buildGlossaryPrompts({
    subject: 'math', topic: 'no-such-topic-xyz',
    definitions: [{ term: 'Numerator', meaning: 'The top number of a fraction.' }],
    mechanismSteps: ['Make the pieces the same size first.'],
    workedExample: 'Work out 1/2 + 1/4 in quarters.',
    objectives: ['Define the key vocabulary of fraction addition']
  });
  assert.ok(user.indexOf('Paired student notes - derive the glossary entries from these:') !== -1);
  assert.ok(user.indexOf('- Numerator: The top number of a fraction.') !== -1);
  assert.ok(user.indexOf('1. Make the pieces the same size first.') !== -1);
  assert.ok(user.indexOf('Work out 1/2 + 1/4 in quarters.') !== -1);
  assert.ok(user.indexOf('- Define the key vocabulary of fraction addition') !== -1);
});

test('prompt: empty notes content renders no notes block', () => {
  const { user } = buildGlossaryPrompts({
    subject: 'math', topic: 'no-such-topic-xyz', definitions: [], mechanismSteps: [], objectives: []
  });
  assert.ok(user.indexOf('Paired student notes') === -1);
});

test('prompt: malformed notes content throws a descriptive buildGlossaryPrompts error', () => {
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', definitions: 'nope' }),
    /buildGlossaryPrompts: opts.definitions must be an array of/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', definitions: [{ term: 'T' }] }),
    /buildGlossaryPrompts: opts.definitions\[0\].meaning must be a non-empty string/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', definitions: [{ meaning: 'M' }] }),
    /buildGlossaryPrompts: opts.definitions\[0\].term must be a non-empty string/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', definitions: ['nope'] }),
    /buildGlossaryPrompts: opts.definitions\[0\] must be an object/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', mechanismSteps: 'nope' }),
    /buildGlossaryPrompts: opts.mechanismSteps must be an array of/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', mechanismSteps: ['ok', '  '] }),
    /buildGlossaryPrompts: opts.mechanismSteps\[1\] must be a non-empty string/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', objectives: 'nope' }),
    /buildGlossaryPrompts: opts.objectives must be an array of/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', objectives: ['ok', ''] }),
    /buildGlossaryPrompts: opts.objectives\[1\] must be a non-empty string/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', topic: 'x', workedExample: ' ' }),
    /buildGlossaryPrompts: opts.workedExample must be a non-empty string/);
});

test('prompt: an unknown level falls back to the level name and the secondary tone', () => {
  const { system } = buildGlossaryPrompts({ subject: 'math', topic: 'fractions', level: 'graduate' });
  assert.ok(system.indexOf('Write for a graduate student') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: transitions add the span block keyed to transition order', () => {
  const plain = buildGlossaryPrompts({ subject: 'math', topic: 'fractions-addition' });
  assert.ok(plain.system.indexOf('TRANSITION SPAN') === -1);
  const withBeat = JSON.parse(JSON.stringify(TRANSITIONS));
  withBeat[0].misconception = {
    wrongTurn: BANK_WRONG_TURN,
    why: 'The bottom number names the piece size.',
    correctTurn: 'Rename one half as two quarters first.'
  };
  const { system, user } = buildGlossaryPrompts({ subject: 'math', topic: 'fractions-addition', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION SPAN') !== -1);
  assert.ok(user.indexOf('1. Common denominator: "halves and quarters side by side" -> "both fractions written in quarters" (driver: renaming one half as two quarters)') !== -1);
  assert.ok(user.indexOf('Wrong turn: ' + BANK_WRONG_TURN) !== -1);
  const empty = buildGlossaryPrompts({ subject: 'math', topic: 'fractions-addition', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION SPAN') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = JSON.parse(JSON.stringify(TRANSITIONS));
  delete noDriver[1].driver;
  assert.throws(() => buildGlossaryPrompts({ subject: 'math', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

/* ---------------- generateGlossary ---------------- */

const OPTS = { topic: 'fractions-addition', topicLabel: 'Adding fractions', level: 'primary', subject: 'math' };

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isGlossaryCall(system) { return system.indexOf('glossary author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: a topic with notes content and no bank entry still generates (notes-content model)', async () => {
  const { calls, callChat } = stubChat(() => GLOSS_TEXT);
  const doc = await PIPELINE.generateGlossary({
    topic: 'no-such-topic-xyz', level: 'primary', subject: 'math',
    definitions: [{ term: 'Numerator', meaning: 'The top number of a fraction.' }],
    mechanismSteps: ['Make the pieces the same size first.'],
    workedExample: 'Work out 1/2 + 1/4 in quarters.',
    objectives: ['Define the key vocabulary of fraction addition']
  }, { callChat });
  assert.deepEqual(doc, GLOSS_OBJ);
  const author = calls[calls.length - 1];
  assert.ok(isGlossaryCall(author.system), 'author call uses the glossary author prompt');
  assert.ok(author.user.indexOf('- Numerator: The top number of a fraction.') !== -1,
    'author user message carries the supplied notes definition');
  assert.ok(author.user.indexOf('1. Make the pieces the same size first.') !== -1,
    'author user message carries the supplied notes mechanism step');
  assert.ok(author.user.indexOf('Work out 1/2 + 1/4 in quarters.') !== -1,
    'author user message carries the supplied notes worked example');
  assert.ok(author.user.indexOf('- Define the key vocabulary of fraction addition') !== -1,
    'author user message carries the supplied notes objective');
});

test('pipeline: malformed notes content rejects naming buildGlossaryPrompts', async () => {
  const { callChat } = stubChat(() => GLOSS_TEXT);
  await assert.rejects(
    () => PIPELINE.generateGlossary(
      { topic: 'no-such-topic-xyz', level: 'primary', subject: 'math', definitions: [{ term: 'T' }] },
      { callChat }),
    /buildGlossaryPrompts: opts.definitions\[0\].meaning must be a non-empty string/);
});

test('pipeline: happy path resolves the exemplar with one unpack and one author call', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : GLOSS_TEXT);
  const doc = await PIPELINE.generateGlossary(OPTS, { callChat });
  assert.deepEqual(doc, GLOSS_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isGlossaryCall(calls[1].system), 'author call uses the glossary author prompt');
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : GLOSS_TEXT;
  });
  const doc = await PIPELINE.generateGlossary(OPTS, { callChat });
  assert.deepEqual(doc, GLOSS_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: repair exhaustion rejects naming glossary with the problem list', async () => {
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(
    () => PIPELINE.generateGlossary({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.ok(err.message.indexOf('Glossary material still invalid') !== -1, 'rejection names glossary: ' + err.message);
      assert.ok(Array.isArray(err.problems), 'rejection carries err.problems');
      assert.ok(err.problems.length > 0);
      return true;
    });
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateGlossary(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateGlossary(OPTS, {}), /callChat/);
});

test('pipeline: a custom validateGlossary dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal glossary' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateGlossary(OPTS, { callChat, validateGlossary: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});
