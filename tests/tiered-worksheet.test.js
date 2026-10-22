/* Tests for the tiered worksheet core (issue #1226, slice 1 of #1225):
 * question tier / difficulty validation in player/validate.js
 * (worksheets only - exit tickets are unchanged), tier teaching in the
 * worksheet prompt builder with a tier-carrying exemplar, and tier
 * labels in player/printable.js on the student sheet and answer key.
 * Node-only, zero dependencies.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateWorksheet, validateExitTicket } = require('../player/validate.js');
const printable = require('../player/printable.js');
const Worksheet = require('../generator/build_worksheet_prompt.js');

function wsWith(questions) {
  return {
    title: 'Fractions Practice', level: 'primary', subject: 'math', topic: 'fractions',
    questions: questions
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

function errorsFor(question) {
  return validateWorksheet(wsWith([question]));
}

/* ---------- validator: tier / difficulty, strict when present ---------- */

test('unknown tier is rejected', () => {
  const q = saBase(); q.tier = 'advanced';
  assert.deepEqual(errorsFor(q), ['questions[0].tier: must be support|core|extension when present']);
});

test('non-string tier is rejected', () => {
  const q = saBase(); q.tier = 2;
  assert.deepEqual(errorsFor(q), ['questions[0].tier: must be support|core|extension when present']);
});

test('valid tier without difficulty validates', () => {
  const q = saBase(); q.tier = 'extension';
  assert.deepEqual(errorsFor(q), []);
});

test('valid difficulty without tier validates', () => {
  const q = mcBase(); q.difficulty = 3;
  assert.deepEqual(errorsFor(q), []);
});

test('difficulty 0 and 6 are rejected', () => {
  const low = saBase(); low.difficulty = 0;
  assert.deepEqual(errorsFor(low), ['questions[0].difficulty: must be an integer from 1 to 5 when present']);
  const high = saBase(); high.difficulty = 6;
  assert.deepEqual(errorsFor(high), ['questions[0].difficulty: must be an integer from 1 to 5 when present']);
});

test('non-integer difficulty is rejected', () => {
  const frac = saBase(); frac.difficulty = 2.5;
  assert.deepEqual(errorsFor(frac), ['questions[0].difficulty: must be an integer from 1 to 5 when present']);
  const str = saBase(); str.difficulty = '3';
  assert.deepEqual(errorsFor(str), ['questions[0].difficulty: must be an integer from 1 to 5 when present']);
});

test('fully tiered worksheet across all tiers and difficulty edges validates', () => {
  const support = saBase(); support.tier = 'support'; support.difficulty = 1;
  const core = mcBase(); core.id = 'q2'; core.tier = 'core'; core.difficulty = 3;
  const extension = saBase(); extension.id = 'q3'; extension.tier = 'extension'; extension.difficulty = 5;
  assert.deepEqual(validateWorksheet(wsWith([support, core, extension])), []);
});

test('untiered worksheet validates exactly as before', () => {
  const mc = mcBase(); mc.id = 'q2';
  assert.deepEqual(validateWorksheet(wsWith([saBase(), mc])), []);
});

test('exit-ticket validation ignores tier and difficulty (worksheets only)', () => {
  const ticket = {
    title: 'Fractions Check', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [0, 1, 2].map((i) => {
      const q = saBase();
      q.id = 'q' + (i + 1);
      q.tier = 'not-a-tier';
      q.difficulty = 9;
      return q;
    })
  };
  assert.deepEqual(validateExitTicket(ticket), []);
});

/* ---------- prompt: tier teaching + tier-carrying exemplar ---------- */

test('worksheet system template teaches the tier meanings', () => {
  const t = Worksheet.WORKSHEET_SYSTEM_TEMPLATE;
  for (const phrase of [
    'tier (support|core|extension)',
    'Extension means transfer and multi-step reasoning',
    'Support means the same',
    'objective at reduced cognitive load',
    'Core is the standard objective at full load'
  ]) {
    assert.ok(t.includes(phrase), 'system template must contain: ' + phrase);
  }
});

test('prompt exemplar carries tier and difficulty on every question and validates clean', () => {
  const exemplar = JSON.parse(Worksheet.WATER_CYCLE_WORKSHEET_EXEMPLAR);
  assert.ok(exemplar.questions.length >= 2);
  for (const q of exemplar.questions) {
    assert.ok(['support', 'core', 'extension'].includes(q.tier), 'exemplar question tier: ' + q.id);
    assert.ok(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 5,
      'exemplar question difficulty: ' + q.id);
  }
  assert.deepEqual(validateWorksheet(exemplar), []);
});

/* ---------- renderer: tier labels on sheet and key ---------- */

function tieredWorksheet() {
  const support = saBase(); support.tier = 'support'; support.difficulty = 1;
  support.explanation = 'Heat turns liquid to vapour.';
  const extension = mcBase(); extension.id = 'q2'; extension.tier = 'extension'; extension.difficulty = 5;
  extension.explanation = 'Halves are bigger pieces.';
  return wsWith([support, extension]);
}

test('student sheet shows the tier label for every tiered question', () => {
  const html = printable.renderWorksheet(tieredWorksheet());
  assert.ok(html.includes('<p class="pr-tier">Tier: Support</p>'));
  assert.ok(html.includes('<p class="pr-tier">Tier: Extension</p>'));
});

test('answer key shows the tier label for every tiered question', () => {
  const html = printable.renderWorksheetAnswerKey(tieredWorksheet());
  assert.ok(html.includes('<p class="pr-tier">Tier: Support</p>'));
  assert.ok(html.includes('<p class="pr-tier">Tier: Extension</p>'));
});

test('difficulty is not rendered on the sheet or the key', () => {
  assert.ok(!printable.renderWorksheet(tieredWorksheet()).includes('Difficulty'));
  assert.ok(!printable.renderWorksheetAnswerKey(tieredWorksheet()).includes('Difficulty'));
});

const UNTIERED_STUDENT = [
  '<section class="pr-sheet pr-student pr-worksheet">',
  '<h1 class="pr-title">Fractions Practice</h1>',
  '<p class="pr-meta">math · fractions · primary</p>',
  '<p class="pr-kind">Worksheet</p>',
  '<ol class="pr-questions">',
  '<li class="pr-question">',
  '<p class="pr-prompt">Pick the larger fraction.</p>',
  '<ul class="pr-choices">',
  '<li class="pr-choice">1/3</li>',
  '<li class="pr-choice">1/2</li>',
  '</ul>',
  '</li>',
  '<li class="pr-question">',
  '<p class="pr-prompt">Name the process.</p>',
  '<div class="pr-answer-lines"><span class="pr-answer-line"></span><span class="pr-answer-line"></span><span class="pr-answer-line"></span></div>',
  '</li>',
  '</ol>',
  '</section>'
].join('\n');

const UNTIERED_KEY = [
  '<section class="pr-sheet pr-teacher pr-answer-key pr-worksheet">',
  '<h1 class="pr-title">Fractions Practice</h1>',
  '<p class="pr-meta">math · fractions · primary</p>',
  '<p class="pr-kind">Worksheet answer key</p>',
  '<ol class="pr-questions">',
  '<li class="pr-question">',
  '<p class="pr-prompt">Pick the larger fraction.</p>',
  '<p class="pr-answer">Answer: 1/2</p>',
  '<p class="pr-explanation">Halves are bigger pieces.</p>',
  '</li>',
  '<li class="pr-question">',
  '<p class="pr-prompt">Name the process.</p>',
  '<p class="pr-answer">Answer: Evaporation</p>',
  '<p class="pr-explanation">Heat turns liquid to vapour.</p>',
  '</li>',
  '</ol>',
  '</section>'
].join('\n');

function untieredWorksheet() {
  const mc = mcBase(); mc.explanation = 'Halves are bigger pieces.';
  const sa = saBase(); sa.id = 'q2'; sa.explanation = 'Heat turns liquid to vapour.';
  return wsWith([mc, sa]);
}

test('un-tiered student sheet renders byte-identically to before', () => {
  assert.equal(printable.renderWorksheet(untieredWorksheet()), UNTIERED_STUDENT);
});

test('un-tiered answer key renders byte-identically to before', () => {
  assert.equal(printable.renderWorksheetAnswerKey(untieredWorksheet()), UNTIERED_KEY);
});

test('exit-ticket rendering shows no tier label for a tiered question', () => {
  const questions = [0, 1, 2].map((i) => {
    const q = saBase();
    q.id = 'q' + (i + 1);
    q.tier = 'core';
    q.feedback = 'Well done.';
    return q;
  });
  const ticket = {
    title: 'Fractions Check', level: 'primary', subject: 'math', topic: 'fractions',
    questions: questions
  };
  assert.ok(!printable.renderExitTicket(ticket).includes('pr-tier'));
  assert.ok(!printable.renderExitTicketAnswerKey(ticket).includes('pr-tier'));
});
