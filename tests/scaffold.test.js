/* animath scaffolds tests - zero network.
 * Guards the scaffolds core (issue #1231, slice 1 of #1230):
 * validateScaffolds in player/validate.js, buildScaffoldPrompts in
 * generator/build_scaffold_prompt.js (its exemplar must validate
 * clean), and generateScaffolds in generator/pipeline.js (the
 * generateLessonPlan sibling - same unpack -> author -> repair
 * stages, validation through validateScaffolds). deps.callChat is
 * stubbed throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateScaffolds } = require('../player/validate.js');
const {
  buildScaffoldPrompts,
  SCAFFOLD_SYSTEM_TEMPLATE,
  WATER_CYCLE_SCAFFOLD_EXEMPLAR
} = require('../generator/build_scaffold_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const SCAFFOLD_OBJ = JSON.parse(WATER_CYCLE_SCAFFOLD_EXEMPLAR);
const SCAFFOLD_TEXT = JSON.stringify(SCAFFOLD_OBJ);

function cloneScaffold() { return JSON.parse(SCAFFOLD_TEXT); }

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalScaffold() {
  return {
    title: 'Water Cycle Scaffolds', level: 'primary', subject: 'science', topic: 'water-cycle',
    sets: [
      {
        level: 'full',
        wordBank: [{ term: 'evaporation', gloss: 'water turning into vapour' }],
        starters: ['When the sun heats the water, it...'],
        frames: ['___ is water turning into vapour.'],
        cloze: [{ text: 'Heated water rises by ___.', answers: ['evaporation'] }]
      },
      {
        level: 'minimal',
        wordBank: [{ term: 'evaporation', gloss: 'water turning into vapour' }],
        starters: ['In the water cycle, water...'],
        frames: ['___ turns water into vapour.'],
        cloze: [{ text: 'The first stage is ___.', answers: ['evaporation'] }]
      }
    ]
  };
}

/* ---------------- validateScaffolds ---------------- */

test('validator: the prompt exemplar scaffolds validate clean', () => {
  assert.deepEqual(validateScaffolds(cloneScaffold()), []);
});

test('validator: a minimal two-set material validates clean', () => {
  assert.deepEqual(validateScaffolds(minimalScaffold()), []);
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateScaffolds(null), ['spec: must be an object']);
  assert.deepEqual(validateScaffolds('scaffolds'), ['spec: must be an object']);
  assert.deepEqual(validateScaffolds([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalScaffold();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateScaffolds(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: sets must be an array of at least 2 sets', () => {
  for (const bad of [undefined, 'sets', [minimalScaffold().sets[0]]]) {
    const doc = minimalScaffold();
    doc.sets = bad;
    assert.ok(hasError(validateScaffolds(doc), 'sets: required array of at least 2 scaffold sets'),
      'sets=' + JSON.stringify(bad));
  }
});

test('validator: a non-object set is rejected', () => {
  const doc = minimalScaffold();
  doc.sets[1] = 'minimal';
  assert.ok(hasError(validateScaffolds(doc), 'sets[1]: must be an object'));
});

test('validator: an unknown set level is rejected', () => {
  const doc = minimalScaffold();
  doc.sets[1].level = 'lots';
  assert.ok(hasError(validateScaffolds(doc), 'sets[1].level: must be one of full|partial|minimal'));
});

test('validator: the first set must be full and the last set minimal', () => {
  const notFull = minimalScaffold();
  notFull.sets[0].level = 'partial';
  assert.ok(hasError(validateScaffolds(notFull), 'sets[0].level: first set must be full'));
  const notMinimal = minimalScaffold();
  notMinimal.sets[1].level = 'partial';
  assert.ok(hasError(validateScaffolds(notMinimal), 'sets[1].level: last set must be minimal'));
});

test('validator: repeated and rising levels are rejected', () => {
  const repeated = cloneScaffold();
  repeated.sets[1].level = 'full';
  assert.ok(hasError(validateScaffolds(repeated),
    'levels must fade in order full, partial, minimal without repeats'));
  const rising = cloneScaffold();
  rising.sets[1].level = 'minimal';
  rising.sets[2].level = 'partial';
  assert.ok(hasError(validateScaffolds(rising),
    'levels must fade in order full, partial, minimal without repeats'));
});

test('validator: empty collections are rejected in the full set', () => {
  for (const field of ['wordBank', 'starters', 'frames', 'cloze']) {
    const doc = minimalScaffold();
    doc.sets[0][field] = [];
    assert.ok(hasError(validateScaffolds(doc), 'sets[0].' + field + ': required non-empty array'), field);
  }
});

test('validator: empty collections are rejected in a later set too', () => {
  for (const field of ['wordBank', 'starters', 'frames', 'cloze']) {
    const doc = minimalScaffold();
    doc.sets[1][field] = [];
    assert.ok(hasError(validateScaffolds(doc), 'sets[1].' + field + ': required non-empty array'), field);
  }
});

test('validator: a non-array collection is rejected', () => {
  const doc = minimalScaffold();
  doc.sets[0].starters = 'When the sun heats the water, it...';
  assert.ok(hasError(validateScaffolds(doc), 'sets[0].starters: required non-empty array'));
});

test('validator: word-bank entries need a term and a gloss, unique per set', () => {
  const nonObject = minimalScaffold();
  nonObject.sets[0].wordBank[0] = 'evaporation';
  assert.ok(hasError(validateScaffolds(nonObject), 'sets[0].wordBank[0]: must be an object'));
  const noTerm = minimalScaffold();
  delete noTerm.sets[0].wordBank[0].term;
  assert.ok(hasError(validateScaffolds(noTerm), 'sets[0].wordBank[0].term: required non-empty string'));
  const noGloss = minimalScaffold();
  noGloss.sets[0].wordBank[0].gloss = ' ';
  assert.ok(hasError(validateScaffolds(noGloss), 'sets[0].wordBank[0].gloss: required non-empty string'));
  const dup = minimalScaffold();
  dup.sets[0].wordBank.push({ term: 'evaporation', gloss: 'again' });
  dup.sets[1].wordBank.push({ term: 'condensation', gloss: 'vapour cooling into drops' });
  assert.ok(hasError(validateScaffolds(dup), 'sets[0].wordBank[1].term: duplicate word-bank term'));
});

test('validator: starters must be non-empty strings', () => {
  const doc = minimalScaffold();
  doc.sets[0].starters[0] = '';
  assert.ok(hasError(validateScaffolds(doc), 'sets[0].starters[0]: required non-empty string'));
});

test('validator: frames must be non-empty strings carrying a gap marker', () => {
  const empty = minimalScaffold();
  empty.sets[0].frames[0] = '';
  assert.ok(hasError(validateScaffolds(empty), 'sets[0].frames[0]: required non-empty string'));
  const noMarker = minimalScaffold();
  noMarker.sets[0].frames[0] = 'Evaporation is water turning into vapour.';
  assert.ok(hasError(validateScaffolds(noMarker), 'sets[0].frames[0]: must contain a ___ gap marker'));
});

test('validator: cloze items need text and answers', () => {
  const nonObject = minimalScaffold();
  nonObject.sets[0].cloze[0] = 'gap';
  assert.ok(hasError(validateScaffolds(nonObject), 'sets[0].cloze[0]: must be an object'));
  const noText = minimalScaffold();
  noText.sets[0].cloze[0].text = '';
  assert.ok(hasError(validateScaffolds(noText), 'sets[0].cloze[0].text: required non-empty string'));
  const noAnswers = minimalScaffold();
  noAnswers.sets[0].cloze[0].answers = 'evaporation';
  assert.ok(hasError(validateScaffolds(noAnswers), 'sets[0].cloze[0].answers: required non-empty array'));
  const emptyAnswers = minimalScaffold();
  emptyAnswers.sets[0].cloze[0].answers = [];
  assert.ok(hasError(validateScaffolds(emptyAnswers), 'sets[0].cloze[0].answers: required non-empty array'));
  const blankAnswer = minimalScaffold();
  blankAnswer.sets[0].cloze[0].answers = [' '];
  assert.ok(hasError(validateScaffolds(blankAnswer), 'sets[0].cloze[0].answers[0]: required non-empty string'));
});

test('validator: cloze gap markers must match the answer count', () => {
  const doc = minimalScaffold();
  doc.sets[0].cloze[0].text = 'Heated water rises by ___ and ___ again.';
  assert.ok(hasError(validateScaffolds(doc),
    'sets[0].cloze[0].text: must contain a ___ gap marker for each answer'));
});

test('validator: cloze answers must be word-bank terms of the same set', () => {
  const unknown = minimalScaffold();
  unknown.sets[0].cloze[0].answers = ['condensation'];
  assert.ok(hasError(validateScaffolds(unknown),
    'sets[0].cloze[0].answers[0]: must be a word-bank term of the same set'));
  const otherSet = cloneScaffold();
  otherSet.sets[2].cloze[0].answers = ['precipitation'];
  assert.ok(hasError(validateScaffolds(otherSet),
    'sets[2].cloze[0].answers[0]: must be a word-bank term of the same set'));
});

test('validator: support counts must not grow as support fades', () => {
  const bankGrows = minimalScaffold();
  bankGrows.sets[1].wordBank.push({ term: 'condensation', gloss: 'vapour cooling into drops' });
  assert.ok(hasError(validateScaffolds(bankGrows), 'sets[1]: word bank must not grow as support fades'));
  const startersGrow = minimalScaffold();
  startersGrow.sets[1].starters.push('The rain falls and...');
  assert.ok(hasError(validateScaffolds(startersGrow), 'sets[1]: starters must not grow as support fades'));
  const framesGrow = minimalScaffold();
  framesGrow.sets[1].frames.push('___ gathers in lakes.');
  assert.ok(hasError(validateScaffolds(framesGrow), 'sets[1]: frames must not grow as support fades'));
  const gapsGrow = minimalScaffold();
  gapsGrow.sets[1].cloze.push({ text: 'Again, ___.', answers: ['evaporation'] });
  assert.ok(hasError(validateScaffolds(gapsGrow), 'sets[1]: cloze gaps must not grow as support fades'));
});

/* ---------------- buildScaffoldPrompts ---------------- */

const TRANSITIONS = [
  { name: 'Evaporation', from_state: 'liquid water in a puddle', to_state: 'water vapour in the air', driver: 'the sun heats the water' },
  { name: 'Condensation', from_state: 'water vapour high in the air', to_state: 'tiny liquid droplets in a cloud', driver: 'the vapour cools' }
];

test('prompt: subject is required', () => {
  assert.throws(() => buildScaffoldPrompts({}), /buildScaffoldPrompts: subject is required/);
  assert.throws(() => buildScaffoldPrompts(), /buildScaffoldPrompts: subject is required/);
});

test('prompt: system carries the exemplar and the fading rules; user carries level and topic', () => {
  const { system, user } = buildScaffoldPrompts({ subject: 'science', topic: 'water-cycle', topicLabel: 'Water cycle', level: 'primary' });
  assert.ok(system.indexOf('scaffolds author') !== -1);
  assert.ok(system.indexOf(WATER_CYCLE_SCAFFOLD_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('strictly fading order') !== -1);
  assert.ok(system.indexOf('___') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.ok(system.indexOf('warm, concrete') !== -1);
  assert.ok(user.indexOf('Level: primary') !== -1);
  assert.ok(user.indexOf('Water cycle (water-cycle)') !== -1);
  assert.ok(user.indexOf('Student\'s focus: (none given)') !== -1);
  assert.equal(SCAFFOLD_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: unknown level falls back to the raw label and the secondary tone', () => {
  const { system } = buildScaffoldPrompts({ subject: 'science', topic: 'x', level: 'university' });
  assert.ok(system.indexOf('Write for a university class') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: transitions add the ordering block and the misconception beat', () => {
  const plain = buildScaffoldPrompts({ subject: 'science', topic: 'water-cycle' });
  assert.ok(plain.system.indexOf('TRANSITION ACTIVITIES') === -1);
  assert.ok(plain.user.indexOf('Ordered state transitions') === -1);
  const withBeat = JSON.parse(JSON.stringify(TRANSITIONS));
  withBeat[0].misconception = {
    wrongTurn: 'The puddle water disappears.',
    why: 'The vapour is invisible.',
    correctTurn: 'The water is still there, as vapour.'
  };
  const { system, user } = buildScaffoldPrompts({ subject: 'science', topic: 'water-cycle', transitions: withBeat });
  assert.ok(system.indexOf('TRANSITION ACTIVITIES') !== -1);
  assert.ok(user.indexOf('1. Evaporation: "liquid water in a puddle" -> "water vapour in the air" (driver: the sun heats the water)') !== -1);
  assert.ok(user.indexOf('Wrong turn: The puddle water disappears.') !== -1);
  const empty = buildScaffoldPrompts({ subject: 'science', topic: 'water-cycle', transitions: [] });
  assert.ok(empty.system.indexOf('TRANSITION ACTIVITIES') === -1);
});

test('prompt: malformed transitions throw', () => {
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', transitions: 'x' }), /opts\.transitions must be an array/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', transitions: [TRANSITIONS[0]] }), /must hold 2-8 transitions/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', transitions: ['x', TRANSITIONS[1]] }), /opts\.transitions\[0\] must be an object/);
  const noDriver = JSON.parse(JSON.stringify(TRANSITIONS));
  delete noDriver[1].driver;
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', transitions: noDriver }), /opts\.transitions\[1\]\.driver must be a non-empty string/);
});

test('prompt: definitions and mechanism steps from the paired notes are appended', () => {
  const { user } = buildScaffoldPrompts({
    subject: 'science', topic: 'water-cycle',
    definitions: [
      { term: 'evaporation', meaning: 'water turning into vapour when heated' },
      { term: 'condensation', meaning: 'vapour cooling back into liquid drops' }
    ],
    mechanismSteps: ['The sun heats the water.', 'The vapour cools and forms drops.']
  });
  assert.ok(user.indexOf('Paired student notes') !== -1);
  assert.ok(user.indexOf('- evaporation: water turning into vapour when heated') !== -1);
  assert.ok(user.indexOf('1. The sun heats the water.') !== -1);
  assert.ok(user.indexOf('2. The vapour cools and forms drops.') !== -1);
  const bare = buildScaffoldPrompts({ subject: 'science', topic: 'water-cycle', definitions: [], mechanismSteps: [] });
  assert.ok(bare.user.indexOf('Paired student notes') === -1);
});

test('prompt: malformed definitions and mechanism steps throw', () => {
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', definitions: 'x' }), /opts\.definitions must be an array/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', definitions: ['x'] }), /opts\.definitions\[0\] must be an object/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', definitions: [{ meaning: 'm' }] }), /opts\.definitions\[0\]\.term must be a non-empty string/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', definitions: [{ term: 't' }] }), /opts\.definitions\[0\]\.meaning must be a non-empty string/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', mechanismSteps: 'x' }), /opts\.mechanismSteps must be an array/);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', mechanismSteps: ['ok', ' '] }), /opts\.mechanismSteps\[1\] must be a non-empty string/);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildScaffoldPrompts({ subject: 'science', topic: 'water-cycle', workedExample: 'EXAMPLE SCAFFOLDS' });
  assert.ok(user.indexOf('Worked example for this topic') !== -1);
  assert.ok(user.indexOf('EXAMPLE SCAFFOLDS') !== -1);
  assert.throws(() => buildScaffoldPrompts({ subject: 'science', workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateScaffolds ---------------- */

const OPTS = { topic: 'water-cycle', topicLabel: 'Water cycle', level: 'primary', subject: 'science' };
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

function isUnpackCall(system) { return system.indexOf('topic unpacker') !== -1; }
function isScaffoldCall(system) { return system.indexOf('scaffolds author') !== -1; }

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

test('pipeline: happy path resolves the exemplar scaffolds with the built-in validator', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : SCAFFOLD_TEXT);
  const rec = progressRecorder();
  const doc = await PIPELINE.generateScaffolds(OPTS, { callChat, onProgress: rec.onProgress });
  assert.deepEqual(doc, SCAFFOLD_OBJ);
  assert.equal(calls.length, 2, 'one unpack call + one author call, no repairs');
  assert.ok(isScaffoldCall(calls[1].system), 'author call uses the scaffolds author prompt');
  assert.deepEqual(rec.events, [['unpack', 1, 1], ['author', 1, 1]]);
});

test('pipeline: a non-JSON first response is repaired with scaffolds wording', async () => {
  let authorCalls = 0;
  const { calls, callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? 'oops, not JSON at all' : SCAFFOLD_TEXT;
  });
  const rec = progressRecorder();
  const doc = await PIPELINE.generateScaffolds(OPTS, { callChat, onProgress: rec.onProgress });
  assert.deepEqual(doc, SCAFFOLD_OBJ);
  assert.equal(calls.length, 3, 'unpack + author + one repair');
  assert.ok(calls[2].user.indexOf('did not produce a valid scaffolds material') !== -1);
  assert.ok(calls[2].user.indexOf('Return ONLY the corrected scaffolds as a single JSON object.') !== -1);
  assert.deepEqual(rec.events, [['unpack', 1, 1], ['author', 1, 1], ['repair', 1, 3]]);
});

test('pipeline: an invalid material is repaired through validateScaffolds', async () => {
  const reversed = cloneScaffold();
  reversed.sets.reverse();
  let authorCalls = 0;
  const { callChat } = stubChat((system) => {
    if (isUnpackCall(system)) return TRANSITIONS_TEXT;
    authorCalls += 1;
    return authorCalls === 1 ? JSON.stringify(reversed) : SCAFFOLD_TEXT;
  });
  const doc = await PIPELINE.generateScaffolds(OPTS, { callChat });
  assert.deepEqual(doc, SCAFFOLD_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: exhaustion rejects carrying the validateScaffolds problems', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(
    () => PIPELINE.generateScaffolds({ ...OPTS, maxRepairs: 1 }, { callChat }),
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /Scaffolds still invalid after 1 repair attempt/);
      assert.ok(Array.isArray(err.problems) && err.problems.length > 0);
      assert.deepEqual(err.problems, validateScaffolds({}));
      return true;
    });
  assert.equal(calls.length, 3, 'unpack + author + 1 repair');
});

test('pipeline: maxRepairs 0 makes exactly one author call', async () => {
  const { calls, callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : '{}');
  await assert.rejects(() => PIPELINE.generateScaffolds({ ...OPTS, maxRepairs: 0 }, { callChat }));
  assert.equal(calls.length, 2, 'unpack + author, no repairs');
});

test('pipeline: missing callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateScaffolds(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateScaffolds(OPTS, {}), /callChat/);
});

test('pipeline: deps.validateScaffolds is honoured over the built-in validator', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal scaffolds' };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : JSON.stringify(minimal));
  const doc = await PIPELINE.generateScaffolds(OPTS, { callChat, validateScaffolds: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: deps.validate is the fallback when validateScaffolds is not supplied', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const { callChat } = stubChat((system) =>
    isUnpackCall(system) ? TRANSITIONS_TEXT : SCAFFOLD_TEXT);
  const doc = await PIPELINE.generateScaffolds(OPTS, { callChat, validate: spy });
  assert.deepEqual(doc, SCAFFOLD_OBJ);
  assert.equal(seen.length, 1);
});

test('pipeline: a rejecting unpack call still resolves a valid material', async () => {
  const callChat = (system) => {
    if (isUnpackCall(system)) return Promise.reject(new Error('unpack unavailable'));
    return Promise.resolve(SCAFFOLD_TEXT);
  };
  const doc = await PIPELINE.generateScaffolds(OPTS, { callChat });
  assert.deepEqual(doc, SCAFFOLD_OBJ);
});
