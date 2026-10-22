/* Tests for the mark-scheme core (issue #1211, slice 1 of #1205):
 * question marks / markScheme / workedSolution validation in
 * player/validate.js, scheme generation rules in the worksheet and
 * exit-ticket prompt builders, and teacher-key-only scheme rendering
 * in player/printable.js. Node-only, zero dependencies.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateWorksheet, validateExitTicket } = require('../player/validate.js');
const printable = require('../player/printable.js');
const Worksheet = require('../generator/build_worksheet_prompt.js');
const Ticket = require('../generator/build_exit_ticket_prompt.js');

function wsWith(question) {
  return {
    title: 'Fractions Practice', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [question]
  };
}

function saBase() {
  return { id: 'q1', prompt: 'Name the process.', kind: 'short-answer', answer: 'Evaporation' };
}

function mcBase() {
  return {
    id: 'q1', prompt: 'Pick the larger fraction.', kind: 'multiple-choice',
    choices: [{ text: '1/3' }, { text: '1/2', correct: true }]
  };
}

function goodScheme() {
  return {
    points: [
      { text: 'Converts 1/2 to 2/4', marks: 2 },
      { text: 'Adds the quarters to get 3/4', marks: 2 }
    ],
    alternatives: ['0.75'],
    commonErrors: ['Adding numerators and denominators to get 2/6'],
    ecf: true
  };
}

function errorsFor(question) {
  return validateWorksheet(wsWith(question));
}

/* ---------- validator: well-formed schemes ---------- */

test('short-answer question with a well-formed scheme and worked solution validates', () => {
  const q = saBase();
  q.marks = 4;
  q.markScheme = goodScheme();
  q.workedSolution = '1/2 = 2/4, so 2/4 + 1/4 = 3/4.';
  assert.deepEqual(errorsFor(q), []);
});

test('multiple-choice question with a scheme and no worked solution validates', () => {
  const q = mcBase();
  q.marks = 1;
  q.markScheme = { points: [{ text: 'Chooses 1/2', marks: 1 }], ecf: false };
  assert.deepEqual(errorsFor(q), []);
});

test('marks alone and workedSolution alone are each optional and valid', () => {
  const q1 = saBase();
  q1.marks = 3;
  assert.deepEqual(errorsFor(q1), []);
  const q2 = mcBase();
  q2.workedSolution = 'Compare the denominators.';
  assert.deepEqual(errorsFor(q2), []);
});

test('exit ticket question carrying a scheme validates through validateExitTicket', () => {
  const q1 = saBase();
  q1.marks = 4;
  q1.markScheme = goodScheme();
  q1.workedSolution = '1/2 = 2/4, so 2/4 + 1/4 = 3/4.';
  const q2 = saBase(); q2.id = 'q2';
  const q3 = mcBase(); q3.id = 'q3';
  const ticket = {
    title: 'Fractions Exit Ticket', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [q1, q2, q3]
  };
  assert.deepEqual(validateExitTicket(ticket), []);
});

/* ---------- validator: marks ---------- */

test('marks of zero, negative, fractional or non-numeric each fail', () => {
  for (const bad of [0, -2, 2.5, '4']) {
    const q = saBase();
    q.marks = bad;
    const errors = errorsFor(q);
    assert.ok(errors.some((e) => e.includes('.marks: must be a positive integer when present')),
      'marks=' + JSON.stringify(bad) + ' should fail, got: ' + errors.join('; '));
  }
});

/* ---------- validator: markScheme shape ---------- */

test('markScheme that is not an object fails', () => {
  for (const bad of ['scheme', ['points'], null]) {
    const q = saBase();
    q.marks = 4;
    q.markScheme = bad;
    q.workedSolution = 'Steps.';
    const errors = errorsFor(q);
    assert.ok(errors.some((e) => e.includes('.markScheme: must be an object when present')),
      'markScheme=' + JSON.stringify(bad) + ' should fail, got: ' + errors.join('; '));
  }
});

test('markScheme without the question marks fails', () => {
  const q = saBase();
  q.markScheme = goodScheme();
  q.workedSolution = 'Steps.';
  const errors = errorsFor(q);
  assert.ok(errors.some((e) => e.includes('.markScheme: requires the question marks')),
    'expected the requires-marks error, got: ' + errors.join('; '));
});

test('markScheme with missing, empty or non-array points fails', () => {
  for (const badPoints of [undefined, [], 'points']) {
    const q = saBase();
    q.marks = 4;
    q.markScheme = { points: badPoints };
    q.workedSolution = 'Steps.';
    const errors = errorsFor(q);
    assert.ok(errors.some((e) => e.includes('.markScheme.points: required non-empty array')),
      'points=' + JSON.stringify(badPoints) + ' should fail, got: ' + errors.join('; '));
  }
});

test('credit point that is not an object fails', () => {
  const q = saBase();
  q.marks = 4;
  q.markScheme = { points: [null, { text: 'Adds the quarters', marks: 4 }] };
  q.workedSolution = 'Steps.';
  const errors = errorsFor(q);
  assert.ok(errors.some((e) => e.includes('.markScheme.points[0]: must be an object')),
    'got: ' + errors.join('; '));
});

test('credit point with empty text fails', () => {
  const q = saBase();
  q.marks = 4;
  q.markScheme = { points: [{ text: '  ', marks: 4 }] };
  q.workedSolution = 'Steps.';
  const errors = errorsFor(q);
  assert.ok(errors.some((e) => e.includes('.markScheme.points[0].text: required non-empty string')),
    'got: ' + errors.join('; '));
});

test('credit point with non-positive or fractional marks fails', () => {
  for (const bad of [0, -1, 1.5, '2']) {
    const q = saBase();
    q.marks = 4;
    q.markScheme = { points: [{ text: 'Converts', marks: bad }] };
    q.workedSolution = 'Steps.';
    const errors = errorsFor(q);
    assert.ok(errors.some((e) => e.includes('.markScheme.points[0].marks: must be a positive integer')),
      'point marks=' + JSON.stringify(bad) + ' should fail, got: ' + errors.join('; '));
  }
});

test('credit points not summing to the question marks fail', () => {
  const q = saBase();
  q.marks = 5;
  q.markScheme = goodScheme();
  q.workedSolution = 'Steps.';
  const errors = errorsFor(q);
  assert.ok(errors.some((e) => e.includes('credit point marks sum to 4, not the question marks 5')),
    'got: ' + errors.join('; '));
});

test('alternatives must be an array of non-empty strings when present', () => {
  const q1 = saBase();
  q1.marks = 4;
  q1.markScheme = goodScheme();
  q1.markScheme.alternatives = '0.75';
  q1.workedSolution = 'Steps.';
  assert.ok(errorsFor(q1).some((e) => e.includes('.markScheme.alternatives: must be an array of non-empty strings')));
  const q2 = saBase();
  q2.marks = 4;
  q2.markScheme = goodScheme();
  q2.markScheme.alternatives = ['0.75', ' '];
  q2.workedSolution = 'Steps.';
  assert.ok(errorsFor(q2).some((e) => e.includes('.markScheme.alternatives[1]: must be a non-empty string')));
});

test('commonErrors must be an array of non-empty strings when present', () => {
  const q1 = saBase();
  q1.marks = 4;
  q1.markScheme = goodScheme();
  q1.markScheme.commonErrors = 42;
  q1.workedSolution = 'Steps.';
  assert.ok(errorsFor(q1).some((e) => e.includes('.markScheme.commonErrors: must be an array of non-empty strings')));
  const q2 = saBase();
  q2.marks = 4;
  q2.markScheme = goodScheme();
  q2.markScheme.commonErrors = [''];
  q2.workedSolution = 'Steps.';
  assert.ok(errorsFor(q2).some((e) => e.includes('.markScheme.commonErrors[0]: must be a non-empty string')));
});

test('ecf must be a boolean when present', () => {
  const q = saBase();
  q.marks = 4;
  q.markScheme = goodScheme();
  q.markScheme.ecf = 'yes';
  q.workedSolution = 'Steps.';
  assert.ok(errorsFor(q).some((e) => e.includes('.markScheme.ecf: must be a boolean when present')));
});

/* ---------- validator: workedSolution ---------- */

test('empty workedSolution fails even without a scheme', () => {
  const q = saBase();
  q.workedSolution = '   ';
  assert.ok(errorsFor(q).some((e) => e.includes('.workedSolution: must be a non-empty string when present')));
});

test('short-answer question with a scheme but no workedSolution fails', () => {
  const q = saBase();
  q.marks = 4;
  q.markScheme = goodScheme();
  const errors = errorsFor(q);
  assert.ok(errors.some((e) => e.includes('.workedSolution: required on a short-answer question carrying a markScheme')),
    'got: ' + errors.join('; '));
});

/* ---------- printable: teacher key renders the scheme ---------- */

function schemeWorksheet() {
  const q1 = saBase();
  q1.prompt = 'What is 1/2 + 1/4?';
  q1.answer = '3/4';
  q1.explanation = 'Convert to quarters: 2/4 + 1/4 = 3/4.';
  q1.marks = 4;
  q1.markScheme = goodScheme();
  q1.workedSolution = '1/2 = 2/4, so 2/4 + 1/4 = 3/4.';
  const q2 = mcBase();
  q2.id = 'q2';
  q2.marks = 1;
  q2.markScheme = { points: [{ text: 'Chooses 1/2', marks: 1 }], ecf: false };
  return {
    title: 'Fractions Practice', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [q1, q2]
  };
}

test('teacher answer key renders marks, credit points, alternatives, common errors, ECF and worked solution', () => {
  const key = printable.renderWorksheetAnswerKey(schemeWorksheet());
  assert.ok(key.includes('Marks: 4'));
  assert.ok(key.includes('Converts 1/2 to 2/4 (2)'));
  assert.ok(key.includes('Adds the quarters to get 3/4 (2)'));
  assert.ok(key.includes('Also accept: 0.75'));
  assert.ok(key.includes('Common error: Adding numerators and denominators to get 2/6'));
  assert.ok(key.includes('Error carried forward'));
  assert.ok(key.includes('Worked solution: 1/2 = 2/4, so 2/4 + 1/4 = 3/4.'));
  assert.ok(key.includes('Marks: 1'));
  assert.ok(key.includes('Chooses 1/2 (1)'));
});

test('teacher key omits the optional scheme parts that are absent', () => {
  const key = printable.renderWorksheetAnswerKey(schemeWorksheet());
  // q2 carries ecf: false and no alternatives / commonErrors, so exactly
  // one of each optional line appears (from q1).
  assert.equal(key.split('Also accept:').length - 1, 1);
  assert.equal(key.split('Common error:').length - 1, 1);
  assert.equal(key.split('Error carried forward').length - 1, 1);
});

test('student sheet renders none of the scheme material', () => {
  const sheet = printable.renderWorksheet(schemeWorksheet());
  for (const hidden of ['Marks:', 'Converts 1/2 to 2/4', 'Adds the quarters', 'Also accept',
    'Common error', 'Error carried forward', 'Worked solution', '0.75', 'pr-mark-scheme']) {
    assert.ok(!sheet.includes(hidden), 'student sheet leaked: ' + hidden);
  }
});

test('exit ticket answer key renders the scheme; the ticket itself does not', () => {
  const q1 = saBase();
  q1.marks = 4;
  q1.markScheme = goodScheme();
  q1.workedSolution = 'Steps to the answer.';
  const q2 = saBase(); q2.id = 'q2';
  const q3 = mcBase(); q3.id = 'q3';
  const ticket = {
    title: 'Fractions Exit Ticket', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [q1, q2, q3]
  };
  const key = printable.renderExitTicketAnswerKey(ticket);
  assert.ok(key.includes('Marks: 4'));
  assert.ok(key.includes('Converts 1/2 to 2/4 (2)'));
  assert.ok(key.includes('Worked solution: Steps to the answer.'));
  const sheet = printable.renderExitTicket(ticket);
  assert.ok(!sheet.includes('Marks:'));
  assert.ok(!sheet.includes('Converts 1/2 to 2/4'));
});

/* ---------- prompts: scheme generation rules ---------- */

const OPTS = {
  level: 'primary', subject: 'science', topic: 'water-cycle',
  topicLabel: 'Water cycle', focus: 'the full loop'
};

test('worksheet prompt instructs scheme generation with the summing rule', () => {
  const { system } = Worksheet.buildWorksheetPrompts(OPTS);
  assert.ok(system.includes('markScheme'));
  assert.ok(system.includes('sum exactly to the'));
  assert.ok(system.includes('workedSolution'));
});

test('exit-ticket prompt instructs scheme generation with the summing rule', () => {
  const { system } = Ticket.buildExitTicketPrompts(OPTS);
  assert.ok(system.includes('markScheme'));
  assert.ok(system.includes('sum exactly to the'));
  assert.ok(system.includes('workedSolution'));
});
