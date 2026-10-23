/* animath scheme of work tests - zero network.
 * Guards the scheme of work core (issue #1290, slice 1 of #1289):
 * validateScheme in player/validate.js (envelope shape plus the
 * prerequisite-earlier and week-within-term structural rules),
 * buildSchemePrompts in generator/build_scheme_prompt.js (its
 * exemplar must validate clean), and generateScheme in
 * generator/pipeline.js (authored directly from the unit, honest
 * failure naming the scheme kind on repair exhaustion).
 * deps.callChat is stubbed throughout.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateScheme } = require('../player/validate.js');
const {
  buildSchemePrompts,
  SCHEME_SYSTEM_TEMPLATE,
  PRIMARY_MATH_SCHEME_EXEMPLAR
} = require('../generator/build_scheme_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const SCHEME_OBJ = JSON.parse(PRIMARY_MATH_SCHEME_EXEMPLAR);
const SCHEME_TEXT = JSON.stringify(SCHEME_OBJ);

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalScheme() {
  return JSON.parse(PRIMARY_MATH_SCHEME_EXEMPLAR);
}

/* ---------------- validateScheme ---------------- */

test('validator: the prompt exemplar scheme validates clean', () => {
  assert.deepEqual(validateScheme(minimalScheme()), []);
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateScheme(null), ['spec: must be an object']);
  assert.deepEqual(validateScheme('scheme'), ['spec: must be an object']);
  assert.deepEqual(validateScheme([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalScheme();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.unitTitle;
  delete doc.term;
  doc.weeks = 0;
  const errors = validateScheme(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'unitTitle: required non-empty string'));
  assert.ok(hasError(errors, 'term: required non-empty string'));
  assert.ok(hasError(errors, 'weeks: must be a positive integer'));
});

test('validator: fewer than 2 sequence entries are rejected', () => {
  const one = minimalScheme();
  one.sequence = one.sequence.slice(0, 1);
  assert.ok(hasError(validateScheme(one), 'sequence: required array of at least 2 entries'));
  const none = minimalScheme();
  delete none.sequence;
  assert.ok(hasError(validateScheme(none), 'sequence: required array of at least 2 entries'));
});

test('validator: malformed sequence entries are rejected', () => {
  const notObj = minimalScheme();
  notObj.sequence[0] = 'fractions';
  assert.ok(hasError(validateScheme(notObj), 'sequence[0]: must be an object'));
  const fields = minimalScheme();
  fields.sequence[0].topic = ' ';
  fields.sequence[1].week = 0;
  fields.sequence[1].lessons = -2;
  const errors = validateScheme(fields);
  assert.ok(hasError(errors, 'sequence[0].topic: required non-empty string'));
  assert.ok(hasError(errors, 'sequence[1].week: must be a positive integer'));
  assert.ok(hasError(errors, 'sequence[1].lessons: must be a positive integer'));
});

test('validator: a week beyond the term weeks is rejected', () => {
  const doc = minimalScheme();
  doc.sequence[2].week = 7;
  assert.ok(hasError(validateScheme(doc), 'sequence[2].week: must be at most weeks (6)'));
});

test('validator: prerequisites must be an array of earlier topic names', () => {
  const notArray = minimalScheme();
  notArray.sequence[1].prerequisites = 'fractions';
  assert.ok(hasError(validateScheme(notArray), 'sequence[1].prerequisites: required array of topic strings'));
  const blank = minimalScheme();
  blank.sequence[1].prerequisites = [' '];
  assert.ok(hasError(validateScheme(blank), 'sequence[1].prerequisites[0]: must be a non-empty string'));
  const forward = minimalScheme();
  forward.sequence[0].prerequisites = ['decimals'];
  assert.ok(hasError(validateScheme(forward), 'sequence[0].prerequisites[0]: prerequisite decimals does not name an earlier entry topic'));
  const self = minimalScheme();
  self.sequence[1].prerequisites = ['decimals'];
  assert.ok(hasError(validateScheme(self), 'sequence[1].prerequisites[0]: prerequisite decimals does not name an earlier entry topic'));
  const unknown = minimalScheme();
  unknown.sequence[2].prerequisites = ['fractions', 'ratio'];
  assert.ok(hasError(validateScheme(unknown), 'sequence[2].prerequisites[1]: prerequisite ratio does not name an earlier entry topic'));
  const dup = minimalScheme();
  dup.sequence[2].prerequisites = ['fractions', 'fractions'];
  assert.ok(hasError(validateScheme(dup), 'sequence[2].prerequisites[1]: duplicate prerequisite fractions'));
});

test('validator: assessment points are shape-checked by kind', () => {
  const notArray = minimalScheme();
  notArray.sequence[0].assessmentPoints = 'diagnostics';
  assert.ok(hasError(validateScheme(notArray), 'sequence[0].assessmentPoints: required array of assessment points'));
  const notObj = minimalScheme();
  notObj.sequence[0].assessmentPoints = ['diagnostics'];
  assert.ok(hasError(validateScheme(notObj), 'sequence[0].assessmentPoints[0]: must be an object'));
  const fields = minimalScheme();
  fields.sequence[0].assessmentPoints = [{ kind: 'exam', title: '' }];
  const errors = validateScheme(fields);
  assert.ok(hasError(errors, 'sequence[0].assessmentPoints[0].kind: must be one of diagnostics|quizBank|summative|review'));
  assert.ok(hasError(errors, 'sequence[0].assessmentPoints[0].title: required non-empty string'));
  const allKinds = minimalScheme();
  allKinds.sequence[0].assessmentPoints = [
    { kind: 'quizBank', title: 'Fractions quiz' },
    { kind: 'review', title: 'Term review week' }
  ];
  assert.deepEqual(validateScheme(allKinds), []);
});

/* ---------------- buildSchemePrompts ---------------- */

test('prompt: the exemplar is embedded in the system prompt', () => {
  const { system } = buildSchemePrompts({ subject: 'math', topics: ['fractions', 'decimals'] });
  assert.ok(system.indexOf('scheme of work author') !== -1);
  assert.ok(system.indexOf(PRIMARY_MATH_SCHEME_EXEMPLAR) !== -1);
  assert.ok(system.indexOf('title, level, subject, unitTitle, term, weeks, sequence') !== -1);
  assert.ok(system.indexOf('Primary school (PSLE)') !== -1);
  assert.equal(SCHEME_SYSTEM_TEMPLATE.indexOf('{{LEVEL_LABEL}}') !== -1, true);
});

test('prompt: subject and at least 2 topics are required', () => {
  assert.throws(() => buildSchemePrompts({ topics: ['a', 'b'] }), /buildSchemePrompts: subject is required/);
  assert.throws(() => buildSchemePrompts(), /buildSchemePrompts: subject is required/);
  assert.throws(() => buildSchemePrompts({ subject: 'math' }), /opts\.topics must be an array of at least 2 topic slugs/);
  assert.throws(() => buildSchemePrompts({ subject: 'math', topics: ['only-one'] }), /opts\.topics must be an array of at least 2 topic slugs/);
  assert.throws(() => buildSchemePrompts({ subject: 'math', topics: ['a', ' '] }), /opts\.topics\[1\] must be a non-empty string/);
});

test('prompt: the user message carries the unit, term and its topics', () => {
  const { user } = buildSchemePrompts({
    subject: 'math', unitTitle: 'Number: fractions, decimals and percentage',
    term: 'Term 2', topics: ['fractions', 'decimals', 'percentage']
  });
  assert.ok(user.indexOf('Unit: Number: fractions, decimals and percentage') !== -1);
  assert.ok(user.indexOf('Term: Term 2') !== -1);
  assert.ok(user.indexOf('Topics in teaching order: fractions, decimals, percentage') !== -1);
  const bare = buildSchemePrompts({ subject: 'math', topics: ['a-topic', 'b-topic'] });
  assert.ok(bare.user.indexOf('Unit: (unit title not given)') !== -1);
  assert.ok(bare.user.indexOf('Term: (term not given)') !== -1);
});

test('prompt: an unknown level falls back to the level name and the secondary tone', () => {
  const { system } = buildSchemePrompts({ subject: 'math', topics: ['a', 'b'], level: 'graduate' });
  assert.ok(system.indexOf('Write for a graduate student') !== -1);
  assert.ok(system.indexOf('direct, precise, exam-aware') !== -1);
});

test('prompt: workedExample is appended when given and rejected when malformed', () => {
  const { user } = buildSchemePrompts({ subject: 'math', topics: ['a', 'b'], workedExample: 'EXAMPLE SCHEME' });
  assert.ok(user.indexOf('Worked example for this unit') !== -1);
  assert.ok(user.indexOf('EXAMPLE SCHEME') !== -1);
  assert.throws(() => buildSchemePrompts({ subject: 'math', topics: ['a', 'b'], workedExample: ' ' }), /opts\.workedExample must be a non-empty string/);
});

/* ---------------- generateScheme ---------------- */

const OPTS = {
  topics: ['fractions', 'decimals', 'percentage'],
  unitTitle: 'Number: fractions, decimals and percentage', term: 'Term 2',
  level: 'primary', subject: 'math'
};

function isSchemeCall(system) { return system.indexOf('scheme of work author') !== -1; }

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('pipeline: happy path resolves the exemplar in one author call', async () => {
  const { calls, callChat } = stubChat(() => SCHEME_TEXT);
  const doc = await PIPELINE.generateScheme(OPTS, { callChat });
  assert.deepEqual(doc, SCHEME_OBJ);
  assert.equal(calls.length, 1, 'one author call, no unpack, no repairs');
  assert.ok(isSchemeCall(calls[0].system), 'author call uses the scheme author prompt');
  assert.ok(calls[0].user.indexOf('Topics in teaching order: fractions, decimals, percentage') !== -1);
});

test('pipeline: an invalid first response is repaired to a valid material', async () => {
  let authorCalls = 0;
  const { callChat } = stubChat(() => {
    authorCalls += 1;
    return authorCalls === 1 ? '{}' : SCHEME_TEXT;
  });
  const doc = await PIPELINE.generateScheme(OPTS, { callChat });
  assert.deepEqual(doc, SCHEME_OBJ);
  assert.equal(authorCalls, 2);
});

test('pipeline: repair exhaustion rejects naming the scheme kind with the problem list', async () => {
  const { callChat } = stubChat(() => '{}');
  await assert.rejects(
    () => PIPELINE.generateScheme({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.ok(/Scheme of work still invalid/.test(err.message));
      assert.ok(Array.isArray(err.problems), 'rejection carries err.problems');
      assert.ok(err.problems.length > 0);
      return true;
    });
});

test('pipeline: deps without callChat rejects naming callChat', async () => {
  await assert.rejects(() => PIPELINE.generateScheme(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateScheme(OPTS, {}), /callChat/);
});

test('pipeline: malformed topics reject before any callChat call', async () => {
  const { calls, callChat } = stubChat(() => SCHEME_TEXT);
  await assert.rejects(
    () => PIPELINE.generateScheme({ subject: 'math', topics: ['only-one'] }, { callChat }),
    /buildSchemePrompts: opts\.topics must be an array of at least 2 topic slugs/);
  assert.equal(calls.length, 0);
});

test('pipeline: a custom validateScheme dep is honoured', async () => {
  const seen = [];
  const spy = (doc) => { seen.push(doc); return []; };
  const minimal = { title: 'Minimal scheme' };
  const { callChat } = stubChat(() => JSON.stringify(minimal));
  const doc = await PIPELINE.generateScheme(OPTS, { callChat, validateScheme: spy });
  assert.deepEqual(doc, minimal);
  assert.deepEqual(seen, [minimal]);
});

test('pipeline: a fallback validate dep is honoured', async () => {
  const minimal = { title: 'Minimal scheme' };
  const { callChat } = stubChat(() => JSON.stringify(minimal));
  const doc = await PIPELINE.generateScheme(OPTS, { callChat, validate: () => [] });
  assert.deepEqual(doc, minimal);
});
