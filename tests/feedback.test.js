/* animath feedback tests - zero network.
 * Guards the feedback core (issue #1295, slice 1 of #1294):
 * validateFeedback in player/validate.js, buildFeedbackPrompts in
 * generator/build_feedback_prompt.js (its exemplar must validate
 * clean and derive verbatim from the gold fractions worksheet and
 * exit ticket), and generateFeedback in generator/pipeline.js (the
 * notes-content model: caller-supplied paired assessment content,
 * no unpack, no bank gate, no cache; rejects only on missing
 * callChat or missing validator). deps.callChat is stubbed
 * throughout; no LLM calls leave the process.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateFeedback } = require('../player/validate.js');
const {
  buildFeedbackPrompts,
  FEEDBACK_SYSTEM_TEMPLATE,
  FRACTIONS_FEEDBACK_EXEMPLAR
} = require('../generator/build_feedback_prompt.js');
const PIPELINE = require('../generator/pipeline.js');

const FB_OBJ = JSON.parse(FRACTIONS_FEEDBACK_EXEMPLAR);
const FB_TEXT = JSON.stringify(FB_OBJ);
const WORKSHEET = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'worksheets', 'primary-math-fractions-addition.json'), 'utf8'));
const TICKET = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'tickets', 'primary-math-fractions-addition.json'), 'utf8'));
const MISCONCEPTION = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

function hasError(errors, fragment) {
  return errors.some((e) => e.indexOf(fragment) !== -1);
}

function minimalFeedback() {
  return {
    title: 'Adding fractions: 1/2 + 1/4', level: 'primary', subject: 'math', topic: 'fractions',
    strengths: ['The class converts halves to quarters.'],
    modelAnswers: [
      { question: 'What is 1/2 + 1/4?', answer: '3/4', creditPoints: ["Chooses '3/4'"] },
      { question: 'Write 1/2 as quarters.', answer: '2/4', creditPoints: [] }
    ],
    commonErrors: [
      { misconception: MISCONCEPTION, example: 'A student wrote 2/6.', fixIt: { prompt: 'Fix it.', corrected: '3/4.' } },
      { misconception: MISCONCEPTION, example: 'A classmate added the bottoms.', fixIt: { prompt: 'Fix it.', corrected: '3/4.' } }
    ],
    nextSteps: ['Reteach piece size.']
  };
}

/* ---------------- validateFeedback ---------------- */

test('validator: the prompt exemplar feedback validates clean', () => {
  assert.deepEqual(validateFeedback(JSON.parse(FRACTIONS_FEEDBACK_EXEMPLAR)), []);
});

test('validator: a minimal hand-built feedback validates clean', () => {
  assert.deepEqual(validateFeedback(minimalFeedback()), []);
});

test('validator: validateFeedback is exported from player/validate.js (validate-cli surface)', () => {
  const validate = require('../player/validate.js');
  assert.equal(typeof validate.validateFeedback, 'function');
});

test('validator: non-object spec is rejected', () => {
  assert.deepEqual(validateFeedback(null), ['spec: must be an object']);
  assert.deepEqual(validateFeedback('feedback'), ['spec: must be an object']);
  assert.deepEqual(validateFeedback([]), ['spec: must be an object']);
});

test('validator: header fields are enforced', () => {
  const doc = minimalFeedback();
  delete doc.title;
  doc.level = 'university';
  delete doc.subject;
  delete doc.topic;
  const errors = validateFeedback(doc);
  assert.ok(hasError(errors, 'title: required non-empty string'));
  assert.ok(hasError(errors, 'level: must be'));
  assert.ok(hasError(errors, 'subject: required non-empty string'));
  assert.ok(hasError(errors, 'topic: required non-empty string'));
});

test('validator: strengths and nextSteps need at least 1 non-empty string', () => {
  const a = minimalFeedback();
  a.strengths = [];
  assert.ok(hasError(validateFeedback(a), 'strengths: required array of at least 1'));
  const b = minimalFeedback();
  b.strengths = [''];
  assert.ok(hasError(validateFeedback(b), 'strengths[0]: must be a non-empty string'));
  const c = minimalFeedback();
  delete c.nextSteps;
  assert.ok(hasError(validateFeedback(c), 'nextSteps: required array of at least 1'));
  const d = minimalFeedback();
  d.nextSteps = [42];
  assert.ok(hasError(validateFeedback(d), 'nextSteps[0]: must be a non-empty string'));
});

test('validator: modelAnswers need at least 2 well-formed entries', () => {
  const a = minimalFeedback();
  a.modelAnswers = a.modelAnswers.slice(0, 1);
  assert.ok(hasError(validateFeedback(a), 'modelAnswers: required array of at least 2 entries'));
  const b = minimalFeedback();
  b.modelAnswers = ['nope', b.modelAnswers[1]];
  assert.ok(hasError(validateFeedback(b), 'modelAnswers[0]: must be an object'));
  const c = minimalFeedback();
  c.modelAnswers[0] = { answer: '3/4', creditPoints: [] };
  assert.ok(hasError(validateFeedback(c), 'modelAnswers[0].question: required non-empty string'));
  const d = minimalFeedback();
  delete d.modelAnswers[0].answer;
  assert.ok(hasError(validateFeedback(d), 'modelAnswers[0].answer: required non-empty string'));
  const e = minimalFeedback();
  delete e.modelAnswers[0].creditPoints;
  assert.ok(hasError(validateFeedback(e), 'modelAnswers[0].creditPoints: required array of strings'));
  const f = minimalFeedback();
  f.modelAnswers[0].creditPoints = ['ok', ''];
  assert.ok(hasError(validateFeedback(f), 'modelAnswers[0].creditPoints[1]: must be a non-empty string'));
});

test('validator: commonErrors need at least 2 well-formed entries with fixIt', () => {
  const a = minimalFeedback();
  a.commonErrors = a.commonErrors.slice(0, 1);
  assert.ok(hasError(validateFeedback(a), 'commonErrors: required array of at least 2 entries'));
  const b = minimalFeedback();
  b.commonErrors = [null, b.commonErrors[1]];
  assert.ok(hasError(validateFeedback(b), 'commonErrors[0]: must be an object'));
  const c = minimalFeedback();
  delete c.commonErrors[0].misconception;
  assert.ok(hasError(validateFeedback(c), 'commonErrors[0].misconception: required non-empty string'));
  const d = minimalFeedback();
  delete d.commonErrors[0].example;
  assert.ok(hasError(validateFeedback(d), 'commonErrors[0].example: required non-empty string'));
  const e = minimalFeedback();
  delete e.commonErrors[0].fixIt;
  assert.ok(hasError(validateFeedback(e), 'commonErrors[0].fixIt: must be an object'));
  const f = minimalFeedback();
  f.commonErrors[0].fixIt = { corrected: '3/4.' };
  assert.ok(hasError(validateFeedback(f), 'commonErrors[0].fixIt.prompt: required non-empty string'));
  const g = minimalFeedback();
  g.commonErrors[0].fixIt = { prompt: 'Fix it.' };
  assert.ok(hasError(validateFeedback(g), 'commonErrors[0].fixIt.corrected: required non-empty string'));
});

/* ---------------- exemplar derivation ---------------- */

test('exemplar: model answers derive verbatim from the gold worksheet and ticket', () => {
  const sources = WORKSHEET.questions.concat(TICKET.questions);
  for (const ma of FB_OBJ.modelAnswers) {
    const src = sources.find((q) => q.prompt === ma.question);
    assert.ok(src, 'model answer question is a paired question prompt verbatim: ' + ma.question);
    assert.equal(ma.answer, src.workedSolution);
    assert.deepEqual(ma.creditPoints, src.markScheme.points.map((p) => p.text));
  }
});

test('exemplar: common error misconceptions are ticket misconceptions verbatim', () => {
  const ticketMisconceptions = TICKET.questions.map((q) => q.misconception).filter(Boolean);
  for (const ce of FB_OBJ.commonErrors) {
    assert.ok(ticketMisconceptions.includes(ce.misconception));
  }
});

/* ---------------- buildFeedbackPrompts ---------------- */

test('prompts: system template names the spec and carries the exemplar', () => {
  assert.ok(FEEDBACK_SYSTEM_TEMPLATE.includes('Feedback'));
  assert.ok(FEEDBACK_SYSTEM_TEMPLATE.includes(FRACTIONS_FEEDBACK_EXEMPLAR));
  const { system, user } = buildFeedbackPrompts({ subject: 'math', topic: 'fractions' });
  assert.ok(system.includes('Primary school (PSLE)'));
  assert.ok(user.includes('Topic: fractions (fractions)'));
});

test('prompts: subject is required', () => {
  assert.throws(() => buildFeedbackPrompts({}), /subject is required/);
  assert.throws(() => buildFeedbackPrompts(), /subject is required/);
});

test('prompts: paired assessment content reaches the user prompt verbatim', () => {
  const { user } = buildFeedbackPrompts({
    subject: 'math', topic: 'fractions',
    exitTicketQuestions: TICKET.questions,
    worksheetQuestions: WORKSHEET.questions,
    quizItems: [{ prompt: 'What is 1/3 + 1/3?', answer: '2/3', misconceptionCode: MISCONCEPTION }],
    notesTrap: { misconception: MISCONCEPTION, explanation: 'The bottom number names the piece size.' }
  });
  assert.ok(user.includes('Exit-ticket questions:'));
  assert.ok(user.includes('What is 1/2 + 1/4?'));
  assert.ok(user.includes('Worksheet questions:'));
  assert.ok(user.includes('Write 1/2 as quarters, then use your answer to work out 1/2 + 1/4.'));
  assert.ok(user.includes('Misconception: ' + MISCONCEPTION));
  assert.ok(user.includes('Quiz-bank items:'));
  assert.ok(user.includes('Misconception code: ' + MISCONCEPTION));
  assert.ok(user.includes('Paired notes trap:'));
});

test('prompts: credit points and common errors on a question reach the user prompt', () => {
  const { user } = buildFeedbackPrompts({
    subject: 'math', topic: 'fractions',
    worksheetQuestions: [{
      prompt: 'What is 1/2 + 1/4?', workedSolution: '1/2 = 2/4, so 2/4 + 1/4 = 3/4.',
      creditPoints: ["Chooses '3/4'"], commonErrors: [MISCONCEPTION]
    }]
  });
  assert.ok(user.includes("Credit points: Chooses '3/4'"));
  assert.ok(user.includes('Common errors: ' + MISCONCEPTION));
  assert.ok(user.includes('Worked solution: 1/2 = 2/4, so 2/4 + 1/4 = 3/4.'));
});

test('prompts: empty paired content arrays render no paired block', () => {
  const { user } = buildFeedbackPrompts({
    subject: 'math', topic: 'fractions',
    exitTicketQuestions: [], worksheetQuestions: [], quizItems: []
  });
  assert.ok(!user.includes('Paired assessment materials'));
});

test('prompts: malformed paired content throws descriptively', () => {
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', exitTicketQuestions: 'x' }), /exitTicketQuestions must be an array/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', exitTicketQuestions: [{}] }), /exitTicketQuestions\[0\].prompt/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', exitTicketQuestions: [null] }), /must be an object/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', worksheetQuestions: [{ prompt: 'Q', answer: 5 }] }), /worksheetQuestions\[0\].answer/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', worksheetQuestions: [{ prompt: 'Q', creditPoints: 'x' }] }), /entries must be arrays/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', worksheetQuestions: [{ prompt: 'Q', creditPoints: [''] }] }), /entry must be a non-empty string/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', quizItems: 'x' }), /quizItems must be an array/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', quizItems: [{}] }), /quizItems\[0\].prompt/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', quizItems: [null] }), /must be an object/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', quizItems: [{ prompt: 'Q', answer: 5 }] }), /quizItems\[0\].answer/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', notesTrap: 'x' }), /notesTrap must be an object/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', notesTrap: {} }), /notesTrap.misconception/);
  assert.throws(() => buildFeedbackPrompts({ subject: 'math', notesTrap: { misconception: 'M', explanation: 5 } }), /notesTrap.explanation/);
});

/* ---------------- generateFeedback ---------------- */

test('generate: resolves with the first valid feedback, paired content in the prompt', async () => {
  let seenUser = '';
  const deps = {
    callChat: async (system, user) => { seenUser = user; return FB_TEXT; }
  };
  const out = await PIPELINE.generateFeedback(
    { subject: 'math', topic: 'fractions', exitTicketQuestions: TICKET.questions }, deps);
  assert.deepEqual(out, FB_OBJ);
  assert.ok(seenUser.includes('Exit-ticket questions:'));
});

test('generate: missing callChat rejects naming generateFeedback', async () => {
  await assert.rejects(PIPELINE.generateFeedback({ subject: 'math', topic: 'fractions' }, {}),
    /generateFeedback: deps.callChat/);
});

test('generate: malformed paired content rejects before any LLM call', async () => {
  let calls = 0;
  const deps = { callChat: async () => { calls += 1; return FB_TEXT; } };
  await assert.rejects(
    PIPELINE.generateFeedback({ subject: 'math', topic: 'fractions', quizItems: 'x' }, deps),
    /quizItems must be an array/);
  assert.equal(calls, 0);
});

test('generate: repairs an invalid first response, then resolves', async () => {
  let calls = 0;
  const deps = {
    callChat: async () => { calls += 1; return calls === 1 ? '{"title":"x"}' : FB_TEXT; }
  };
  const out = await PIPELINE.generateFeedback({ subject: 'math', topic: 'fractions' }, deps);
  assert.deepEqual(out, FB_OBJ);
  assert.equal(calls, 2);
});

test('generate: exhaustion rejects naming the feedback material with problems', async () => {
  const deps = { callChat: async () => '{"title":"x"}' };
  await assert.rejects(
    PIPELINE.generateFeedback({ subject: 'math', topic: 'fractions', maxRepairs: 0 }, deps),
    (err) => {
      assert.ok(err.message.includes('Feedback material'));
      assert.ok(Array.isArray(err.problems) && err.problems.length > 0);
      return true;
    });
});

test('generate: a caller-supplied validateFeedback wins over the built-in', async () => {
  const deps = {
    callChat: async () => FB_TEXT,
    validateFeedback: () => []
  };
  const out = await PIPELINE.generateFeedback({ subject: 'math', topic: 'fractions' }, deps);
  assert.deepEqual(out, FB_OBJ);
});
