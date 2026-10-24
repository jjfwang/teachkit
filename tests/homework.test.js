/* Homework variant pins (issue #1272, slice 3 of #1267): the six gold
 * homework sheets in samples/homework/ validate clean with variant
 * homework, every question prompt appears verbatim in the paired gold
 * worksheet, validateWorksheet is strict when variant is present, exit
 * tickets reject variant, and the renderers frame homework as
 * low-stakes and self-marked (homework header on the student sheet,
 * answers and explanations only in the self-mark key, standard
 * worksheet rendering unchanged).
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const validate = require('../player/validate.js');
const printable = require('../player/printable.js');

const STEMS = [
  'primary-math-fractions-addition',
  'primary-science-water-cycle',
  'secondary-e-algebra',
  'secondary-physics-energy',
  'jc-h2-differentiation',
  'jc-h2-cell-bio',
  'secondary-math-pythagoras',
  'secondary-science-photosynthesis',
  'primary-math-decimals',
  'primary-math-percentage',
  'primary-math-ratio',
  'primary-math-area-perimeter',
  'primary-math-rate-speed',
  'primary-math-model-method',
  'primary-math-data-graphs',
  'primary-science-forces-magnets',
  'primary-science-human-body-systems',
  'primary-science-plant-systems'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

for (const stem of STEMS) {
  test('gold homework ' + stem + ': validates clean, prompts pinned verbatim, homework rendering', () => {
    const hw = load('samples/homework/' + stem + '.json');
    const ws = load('samples/worksheets/' + stem + '.json');

    assert.deepEqual(validate.validateWorksheet(hw), [],
      stem + ': validateWorksheet reports zero errors');
    assert.equal(hw.variant, 'homework', stem + ': variant is homework');
    for (const field of ['title', 'level', 'subject', 'topic']) {
      assert.equal(hw[field], ws[field], stem + ': ' + field + ' echoes the paired gold worksheet');
    }
    assert.ok(hw.questions.length >= 3, stem + ': at least 3 questions in the spaced selection');
    assert.ok(hw.questions.length < ws.questions.length,
      stem + ': homework is a selection, not the whole worksheet');
    const wsPrompts = new Set(ws.questions.map((q) => q.prompt));
    for (const q of hw.questions) {
      assert.ok(wsPrompts.has(q.prompt),
        stem + ': homework prompt appears verbatim in the paired worksheet: ' + q.prompt);
    }

    const student = printable.renderWorksheet(hw);
    assert.ok(student.includes('pr-homework'), stem + ': student sheet carries the homework header');
    assert.ok(student.includes('Homework'), stem + ': student sheet names it homework');
    assert.ok(!student.includes('Answer:'), stem + ': student sheet carries no answers');
    for (const q of hw.questions) {
      if (q.explanation) {
        assert.ok(!student.includes(esc(q.explanation)),
          stem + ': explanation withheld from the student sheet');
      }
      if (q.kind === 'short-answer') {
        assert.ok(!student.includes(esc(q.answer)),
          stem + ': short-answer answer withheld from the student sheet');
      }
    }

    const key = printable.renderWorksheetAnswerKey(hw);
    assert.ok(key.includes('Homework self-mark key'),
      stem + ': answer key reads as the self-mark key');
    for (const q of hw.questions) {
      if (q.explanation) {
        assert.ok(key.includes(esc(q.explanation)),
          stem + ': explanation present in the self-mark key');
      }
      if (q.kind === 'short-answer') {
        assert.ok(key.includes(esc(q.answer)),
          stem + ': short-answer answer present in the self-mark key');
      }
    }

    const stdStudent = printable.renderWorksheet(ws);
    assert.ok(!stdStudent.includes('pr-homework'),
      stem + ': standard worksheet student sheet has no homework header');
    const stdKey = printable.renderWorksheetAnswerKey(ws);
    assert.ok(stdKey.includes('Worksheet answer key'),
      stem + ': standard worksheet key keeps its title');
    assert.ok(!stdKey.includes('self-mark'),
      stem + ': standard worksheet key is not framed as self-mark');
  });
}

test('homework variant: strict when present, absent unchanged, exit tickets reject it', () => {
  const ws = load('samples/worksheets/primary-math-fractions-addition.json');
  assert.deepEqual(validate.validateWorksheet(ws), [],
    'a worksheet with no variant validates exactly as before');

  const bad = JSON.parse(JSON.stringify(ws));
  bad.variant = 'classwork';
  assert.ok(validate.validateWorksheet(bad).some((e) => e.includes('variant')),
    'an unknown variant value is rejected');

  const nonString = JSON.parse(JSON.stringify(ws));
  nonString.variant = 42;
  assert.ok(validate.validateWorksheet(nonString).some((e) => e.includes('variant')),
    'a non-string variant is rejected');

  const good = JSON.parse(JSON.stringify(ws));
  good.variant = 'homework';
  assert.deepEqual(validate.validateWorksheet(good), [],
    'variant homework validates clean');

  const ticket = load('samples/tickets/primary-math-fractions-addition.json');
  assert.deepEqual(validate.validateExitTicket(ticket), [],
    'the paired exit ticket validates clean without a variant');
  const badTicket = JSON.parse(JSON.stringify(ticket));
  badTicket.variant = 'homework';
  assert.ok(validate.validateExitTicket(badTicket).some((e) => e.includes('variant')),
    'an exit ticket carrying variant is rejected');
});
