/* animath guide tests - zero network.
 * Guards the guide core (issue #1302, slice 1 of #1301):
 * validateGuide in player/validate.js, buildGuidePrompts in
 * generator/build_guide_prompt.js (its exemplar must validate
 * clean and derive verbatim from the gold primary-math scheme of
 * work and the paired notes, revision, quiz bank and exit
 * ticket), and generateGuide in generator/pipeline.js (the
 * feedback notes-content model extended to unit level:
 * caller-supplied paired unit content, no unpack, no bank gate,
 * no cache; rejects only on missing callChat or missing
 * validator). deps.callChat is stubbed throughout; no LLM calls
 * leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateGuide } = require('../player/validate.js');
const {
  buildGuidePrompts,
  GUIDE_SYSTEM_TEMPLATE,
  PRIMARY_MATH_GUIDE_EXEMPLAR
} = require('../generator/build_guide_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const GUIDE_OBJ = JSON.parse(PRIMARY_MATH_GUIDE_EXEMPLAR);
const GUIDE_TEXT = JSON.stringify(GUIDE_OBJ);
const SCHEME = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'schemes', 'primary-math-fractions-addition.json'), 'utf8'));
const FRACTIONS_NOTES = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'notes', 'primary-math-fractions-addition.json'), 'utf8'));
const DECIMALS_NOTES = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'notes', 'primary-math-decimals.json'), 'utf8'));
const PERCENTAGE_NOTES = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'notes', 'primary-math-percentage.json'), 'utf8'));
const REVISION = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'revision', 'primary-math-fractions-addition.json'), 'utf8'));
const QUIZ = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'quiz-banks', 'primary-math-fractions-addition.json'), 'utf8'));
const TICKET = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'tickets', 'primary-math-fractions-addition.json'), 'utf8'));
const MISCONCEPTION = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalGuide() {
  return {
    title: 'Primary Mathematics Scheme of Work: Number', level: 'primary', subject: 'math',
    unitTitle: 'Number: fractions, decimals and percentage', term: 'Term 2',
    topics: ['fractions', 'decimals'],
    overview: ['Three ways to talk about parts of a whole.'],
    keyIdeas: [
      { term: 'Fraction', explanation: 'A part of a whole.' },
      { term: 'Percent', explanation: 'A count out of one hundred.' }
    ],
    revisionPlan: [{ dayOffset: 1, focus: 'Practise adding fractions.' }],
    traps: [{ misconception: MISCONCEPTION, watchFor: 'Watch for added bottoms.' }],
    parentQuestions: [
      { question: 'What is 1/2 + 1/4?', answer: '3/4' },
      { question: 'What is 2/5 + 1/5?', answer: '3/5' }
    ]
  };
}

/* ---------------- validateGuide ---------------- */

test('validator: the prompt exemplar guide validates clean', () => {
  assert.deepEqual(validateGuide(JSON.parse(PRIMARY_MATH_GUIDE_EXEMPLAR)), []);
});

test('validator: a minimal hand-built guide validates clean', () => {
  assert.deepEqual(validateGuide(minimalGuide()), []);
});

test('validator: validateGuide is exported from player/validate.js (validate-cli surface)', () => {
  const validate = require('../player/validate.js');
  assert.equal(typeof validate.validateGuide, 'function');
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateGuide(null), ['spec: must be an object']);
  assert.deepEqual(validateGuide('guide'), ['spec: must be an object']);
  assert.deepEqual(validateGuide([]), ['spec: must be an object']);
});

test('validator: header fields mirror the scheme and are enforced', () => {
  const doc = minimalGuide();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.unitTitle;
  delete doc.term;
  const errors = validateGuide(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'unitTitle: required non-empty string'));
  assert.ok(hasError(errors, 'term: required non-empty string'));
});

test('validator: topics need at least 2 non-empty slugs', () => {
  const a = minimalGuide();
  delete a.topics;
  assert.ok(hasError(validateGuide(a), 'topics: required array of at least 2 topic slugs'));
  const b = minimalGuide();
  b.topics = ['fractions'];
  assert.ok(hasError(validateGuide(b), 'topics: required array of at least 2 topic slugs'));
  const c = minimalGuide();
  c.topics = ['fractions', ''];
  assert.ok(hasError(validateGuide(c), 'topics[1]: must be a non-empty string'));
  const d = minimalGuide();
  d.topics = ['fractions', 42];
  assert.ok(hasError(validateGuide(d), 'topics[1]: must be a non-empty string'));
});

test('validator: overview needs at least 1 non-empty string', () => {
  const a = minimalGuide();
  a.overview = [];
  assert.ok(hasError(validateGuide(a), 'overview: required array of at least 1'));
  const b = minimalGuide();
  b.overview = [''];
  assert.ok(hasError(validateGuide(b), 'overview[0]: must be a non-empty string'));
  const c = minimalGuide();
  c.overview = [42];
  assert.ok(hasError(validateGuide(c), 'overview[0]: must be a non-empty string'));
});

test('validator: keyIdeas need at least 2 well-formed entries', () => {
  const a = minimalGuide();
  a.keyIdeas = a.keyIdeas.slice(0, 1);
  assert.ok(hasError(validateGuide(a), 'keyIdeas: required array of at least 2 entries'));
  const b = minimalGuide();
  b.keyIdeas = ['nope', b.keyIdeas[1]];
  assert.ok(hasError(validateGuide(b), 'keyIdeas[0]: must be an object'));
  const c = minimalGuide();
  delete c.keyIdeas[0].term;
  assert.ok(hasError(validateGuide(c), 'keyIdeas[0].term: required non-empty string'));
  const d = minimalGuide();
  delete d.keyIdeas[0].explanation;
  assert.ok(hasError(validateGuide(d), 'keyIdeas[0].explanation: required non-empty string'));
});

test('validator: revisionPlan entries need a non-negative integer dayOffset and a focus', () => {
  const a = minimalGuide();
  delete a.revisionPlan;
  assert.ok(hasError(validateGuide(a), 'revisionPlan: required array of at least 1 entries'));
  const b = minimalGuide();
  b.revisionPlan = [null];
  assert.ok(hasError(validateGuide(b), 'revisionPlan[0]: must be an object'));
  const c = minimalGuide();
  c.revisionPlan[0].dayOffset = -1;
  assert.ok(hasError(validateGuide(c), 'revisionPlan[0].dayOffset: must be a non-negative integer'));
  const d = minimalGuide();
  d.revisionPlan[0].dayOffset = 1.5;
  assert.ok(hasError(validateGuide(d), 'revisionPlan[0].dayOffset: must be a non-negative integer'));
  const e = minimalGuide();
  delete e.revisionPlan[0].focus;
  assert.ok(hasError(validateGuide(e), 'revisionPlan[0].focus: required non-empty string'));
});

test('validator: traps need at least 1 well-formed entry', () => {
  const a = minimalGuide();
  a.traps = [];
  assert.ok(hasError(validateGuide(a), 'traps: required array of at least 1 entries'));
  const b = minimalGuide();
  b.traps = ['nope'];
  assert.ok(hasError(validateGuide(b), 'traps[0]: must be an object'));
  const c = minimalGuide();
  delete c.traps[0].misconception;
  assert.ok(hasError(validateGuide(c), 'traps[0].misconception: required non-empty string'));
  const d = minimalGuide();
  delete d.traps[0].watchFor;
  assert.ok(hasError(validateGuide(d), 'traps[0].watchFor: required non-empty string'));
});

test('validator: parentQuestions need at least 2 well-formed entries', () => {
  const a = minimalGuide();
  a.parentQuestions = a.parentQuestions.slice(0, 1);
  assert.ok(hasError(validateGuide(a), 'parentQuestions: required array of at least 2 entries'));
  const b = minimalGuide();
  b.parentQuestions = [null, b.parentQuestions[1]];
  assert.ok(hasError(validateGuide(b), 'parentQuestions[0]: must be an object'));
  const c = minimalGuide();
  delete c.parentQuestions[0].question;
  assert.ok(hasError(validateGuide(c), 'parentQuestions[0].question: required non-empty string'));
  const d = minimalGuide();
  delete d.parentQuestions[0].answer;
  assert.ok(hasError(validateGuide(d), 'parentQuestions[0].answer: required non-empty string'));
});

/* ---------------- exemplar derivation ---------------- */

test('exemplar: header and topics mirror the gold primary-math scheme', () => {
  assert.equal(GUIDE_OBJ.title, SCHEME.title);
  assert.equal(GUIDE_OBJ.level, SCHEME.level);
  assert.equal(GUIDE_OBJ.subject, SCHEME.subject);
  assert.equal(GUIDE_OBJ.unitTitle, SCHEME.unitTitle);
  assert.equal(GUIDE_OBJ.term, SCHEME.term);
  assert.deepEqual(GUIDE_OBJ.topics, SCHEME.sequence.map((e) => e.topic));
});

test('exemplar: key ideas derive verbatim from the sequenced topics paired notes', () => {
  const definitions = FRACTIONS_NOTES.definitions
    .concat(DECIMALS_NOTES.definitions, PERCENTAGE_NOTES.definitions);
  for (const idea of GUIDE_OBJ.keyIdeas) {
    const src = definitions.find((d) => d.term === idea.term);
    assert.ok(src, 'key idea term is a paired notes definition term verbatim: ' + idea.term);
    assert.equal(idea.explanation, src.meaning);
  }
});

test('exemplar: trap misconceptions are paired notes traps verbatim', () => {
  const trapMisconceptions = [FRACTIONS_NOTES.trap.misconception,
    DECIMALS_NOTES.trap.misconception, PERCENTAGE_NOTES.trap.misconception];
  for (const trap of GUIDE_OBJ.traps) {
    assert.ok(trapMisconceptions.includes(trap.misconception));
  }
});

test('exemplar: revision plan dayOffsets are paired revision practiceSet dayOffsets', () => {
  const offsets = REVISION.practiceSets.map((s) => s.dayOffset);
  for (const entry of GUIDE_OBJ.revisionPlan) {
    assert.ok(offsets.includes(entry.dayOffset));
  }
});

test('exemplar: parent questions derive verbatim from the paired quiz bank and exit ticket', () => {
  const sources = QUIZ.items.map((q) => ({ prompt: q.prompt, answer: q.answer }))
    .concat(TICKET.questions.map((q) => ({
      prompt: q.prompt, answer: q.answer !== undefined ? q.answer : q.workedSolution
    })));
  for (const pq of GUIDE_OBJ.parentQuestions) {
    const src = sources.find((q) => q.prompt === pq.question);
    assert.ok(src, 'parent question is a paired quiz-bank or exit-ticket prompt verbatim: ' + pq.question);
    assert.equal(pq.answer, src.answer);
  }
});

/* ---------------- buildGuidePrompts ---------------- */

test('prompts: system template names the spec and carries the exemplar', () => {
  assert.ok(GUIDE_SYSTEM_TEMPLATE.includes('Guide'));
  assert.ok(GUIDE_SYSTEM_TEMPLATE.includes(PRIMARY_MATH_GUIDE_EXEMPLAR));
  const { system, user } = buildGuidePrompts({
    subject: 'math', unitTitle: 'Number', term: 'Term 2', topics: ['fractions', 'decimals']
  });
  assert.ok(system.includes('Primary school (PSLE)'));
  assert.ok(user.includes('Unit: Number'));
  assert.ok(user.includes('Term: Term 2'));
  assert.ok(user.includes('Topics in scheme order: fractions, decimals'));
});

test('prompts: subject is required and topics need at least 2 slugs', () => {
  assert.throws(() => buildGuidePrompts({}), /subject is required/);
  assert.throws(() => buildGuidePrompts(), /subject is required/);
  assert.throws(() => buildGuidePrompts({ subject: 'math' }), /topics must be an array of at least 2/);
  assert.throws(() => buildGuidePrompts({ subject: 'math', topics: 'x' }), /topics entries must be arrays/);
  assert.throws(() => buildGuidePrompts({ subject: 'math', topics: ['fractions', ''] }), /a topics entry must be a non-empty string/);
  assert.throws(() => buildGuidePrompts({ subject: 'math', topics: ['fractions'] }), /topics must be an array of at least 2/);
});

test('prompts: missing unit and term render honest placeholders, unknown level falls back', () => {
  const { system, user } = buildGuidePrompts({
    subject: 'math', topics: ['fractions', 'decimals'], level: 'weird'
  });
  assert.ok(user.includes('Unit: (unit title not given)'));
  assert.ok(user.includes('Term: (term not given)'));
  assert.ok(user.includes('Level: weird (weird)'));
  assert.ok(system.includes('Write for a weird student'));
});

test('prompts: paired unit content reaches the user prompt verbatim', () => {
  const { user } = buildGuidePrompts({
    subject: 'math', unitTitle: SCHEME.unitTitle, term: SCHEME.term,
    topics: SCHEME.sequence.map((e) => e.topic),
    notesByTopic: [
      { topic: 'fractions', definitions: FRACTIONS_NOTES.definitions, trap: FRACTIONS_NOTES.trap },
      { topic: 'decimals', definitions: DECIMALS_NOTES.definitions, trap: DECIMALS_NOTES.trap }
    ],
    revisionPracticeSets: REVISION.practiceSets,
    quizItems: QUIZ.items,
    exitTicketQuestions: TICKET.questions,
    feedbackCommonErrors: [MISCONCEPTION]
  });
  assert.ok(user.includes('Paired unit materials'));
  assert.ok(user.includes('Paired notes by topic:'));
  assert.ok(user.includes('Definition: Fraction - ' + FRACTIONS_NOTES.definitions[0].meaning));
  assert.ok(user.includes('Trap misconception: ' + MISCONCEPTION));
  assert.ok(user.includes('Trap explanation: ' + FRACTIONS_NOTES.trap.explanation));
  assert.ok(user.includes('Gate topic revision practice sets:'));
  assert.ok(user.includes('Day offset 1:'));
  assert.ok(user.includes('Answer: 3/4'));
  assert.ok(user.includes('Gate topic quiz-bank items:'));
  assert.ok(user.includes('Misconception code: ' + MISCONCEPTION));
  assert.ok(user.includes('Gate topic exit-ticket questions:'));
  assert.ok(user.includes('Worked solution: 2/4'));
  assert.ok(user.includes('Gate topic feedback common errors:'));
});

test('prompts: sparse paired content still renders its lines', () => {
  const { user } = buildGuidePrompts({
    subject: 'math', topics: ['fractions', 'decimals'],
    notesByTopic: [
      { topic: 'fractions', definitions: [], trap: { misconception: MISCONCEPTION } },
      { topic: 'decimals' }
    ],
    revisionPracticeSets: [{ dayOffset: 2 }],
    quizItems: [{ prompt: 'What is 1/3 + 1/3?' }],
    exitTicketQuestions: [{ prompt: 'Write 1/2 as quarters.' }]
  });
  assert.ok(user.includes('Topic: fractions'));
  assert.ok(user.includes('Trap misconception: ' + MISCONCEPTION));
  assert.ok(!user.includes('Trap explanation:'));
  assert.ok(user.includes('Topic: decimals'));
  assert.ok(user.includes('Day offset 2:'));
  assert.ok(user.includes('1. What is 1/3 + 1/3?'));
  assert.ok(user.includes('1. Write 1/2 as quarters.'));
});

test('prompts: empty paired content arrays render no paired block', () => {
  const { user } = buildGuidePrompts({
    subject: 'math', topics: ['fractions', 'decimals'],
    notesByTopic: [], revisionPracticeSets: [], quizItems: [],
    exitTicketQuestions: [], feedbackCommonErrors: []
  });
  assert.ok(!user.includes('Paired unit materials'));
});

test('prompts: malformed notes content throws descriptively', () => {
  const base = { subject: 'math', topics: ['fractions', 'decimals'] };
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: 'x' }), /notesByTopic must be an array/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [null] }), /must be an object/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{}] }), /notesByTopic\[0\].topic/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', definitions: 'x' }] }), /definitions must be an array/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', definitions: [null] }] }), /must be an object/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', definitions: [{ meaning: 'm' }] }] }), /definitions\[0\].term/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', definitions: [{ term: 't' }] }] }), /definitions\[0\].meaning/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', trap: 'x' }] }), /trap must be an object/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', trap: {} }] }), /trap.misconception/);
  assert.throws(() => buildGuidePrompts({ ...base, notesByTopic: [{ topic: 'fractions', trap: { misconception: 'M', explanation: 5 } }] }), /trap.explanation/);
});

test('prompts: malformed revision and question content throws descriptively', () => {
  const base = { subject: 'math', topics: ['fractions', 'decimals'] };
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: 'x' }), /revisionPracticeSets must be an array/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [null] }), /must be an object/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [{}] }), /dayOffset must be a non-negative integer/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [{ dayOffset: -1 }] }), /dayOffset must be a non-negative integer/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [{ dayOffset: 1, items: 'x' }] }), /items must be an array/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [{ dayOffset: 1, items: [null] }] }), /must be an object/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [{ dayOffset: 1, items: [{}] }] }), /items\[0\].prompt/);
  assert.throws(() => buildGuidePrompts({ ...base, revisionPracticeSets: [{ dayOffset: 1, items: [{ prompt: 'Q', answer: 5 }] }] }), /items\[0\].answer/);
  assert.throws(() => buildGuidePrompts({ ...base, quizItems: 'x' }), /quizItems must be an array/);
  assert.throws(() => buildGuidePrompts({ ...base, quizItems: [null] }), /must be an object/);
  assert.throws(() => buildGuidePrompts({ ...base, quizItems: [{}] }), /quizItems\[0\].prompt/);
  assert.throws(() => buildGuidePrompts({ ...base, quizItems: [{ prompt: 'Q', misconceptionCode: 5 }] }), /quizItems\[0\].misconceptionCode/);
  assert.throws(() => buildGuidePrompts({ ...base, exitTicketQuestions: [{ prompt: 'Q', workedSolution: 5 }] }), /exitTicketQuestions\[0\].workedSolution/);
  assert.throws(() => buildGuidePrompts({ ...base, feedbackCommonErrors: 'x' }), /feedbackCommonErrors entries must be arrays/);
  assert.throws(() => buildGuidePrompts({ ...base, feedbackCommonErrors: [''] }), /a feedbackCommonErrors entry must be a non-empty string/);
});

/* ---------------- generateGuide ---------------- */

test('generate: resolves with the first valid guide, paired content in the prompt', async () => {
  let seenUser = '';
  const deps = {
    callChat: async (system, user) => { seenUser = user; return GUIDE_TEXT; }
  };
  const out = await PIPELINE.generateGuide(
    {
      subject: 'math', unitTitle: SCHEME.unitTitle, term: SCHEME.term,
      topics: SCHEME.sequence.map((e) => e.topic),
      notesByTopic: [{ topic: 'fractions', definitions: FRACTIONS_NOTES.definitions }]
    }, deps);
  assert.deepEqual(out, GUIDE_OBJ);
  assert.ok(seenUser.includes('Paired notes by topic:'));
});

test('generate: missing callChat rejects naming generateGuide', async () => {
  await assert.rejects(PIPELINE.generateGuide({ subject: 'math', topics: ['fractions', 'decimals'] }, {}),
    /generateGuide: deps.callChat/);
});

test('generate: malformed paired content rejects before any LLM call', async () => {
  let calls = 0;
  const deps = { callChat: async () => { calls += 1; return GUIDE_TEXT; } };
  await assert.rejects(
    PIPELINE.generateGuide({ subject: 'math', topics: ['fractions', 'decimals'], quizItems: 'x' }, deps),
    /quizItems must be an array/);
  assert.equal(calls, 0);
});

test('generate: repairs an invalid first response, then resolves', async () => {
  let calls = 0;
  const deps = {
    callChat: async () => { calls += 1; return calls === 1 ? '{"title":"x"}' : GUIDE_TEXT; }
  };
  const out = await PIPELINE.generateGuide({ subject: 'math', topics: ['fractions', 'decimals'] }, deps);
  assert.deepEqual(out, GUIDE_OBJ);
  assert.equal(calls, 2);
});

test('generate: exhaustion rejects naming the guide material with problems', async () => {
  const deps = { callChat: async () => '{"title":"x"}' };
  await assert.rejects(
    PIPELINE.generateGuide({ subject: 'math', topics: ['fractions', 'decimals'], maxRepairs: 0 }, deps),
    (err) => {
      assert.ok(err.message.includes('Guide material'));
      assert.ok(Array.isArray(err.problems) && err.problems.length > 0);
      return true;
    });
});

test('generate: a caller-supplied validateGuide wins over the built-in', async () => {
  const deps = {
    callChat: async () => GUIDE_TEXT,
    validateGuide: () => []
  };
  const out = await PIPELINE.generateGuide({ subject: 'math', topics: ['fractions', 'decimals'] }, deps);
  assert.deepEqual(out, GUIDE_OBJ);
});

test('generate: a caller-supplied fallback validate wins over the built-in', async () => {
  const deps = {
    callChat: async () => GUIDE_TEXT,
    validate: () => []
  };
  const out = await PIPELINE.generateGuide({ subject: 'math', topics: ['fractions', 'decimals'] }, deps);
  assert.deepEqual(out, GUIDE_OBJ);
});
