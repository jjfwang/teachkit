/* animath gold quiz bank gate tests (issue #1257, slice 2 of #1254).
 * Pins the six-topic subset gate for Phase C3: one hand-authored gold
 * quiz bank in samples/quiz-banks/ per gate topic. Each must validate
 * clean against validateQuizBank, echo its paired gold notes on
 * title / level / subject / topic, carry at least 4 retrieval items
 * with at least one item coded to the topic misconception bank, every
 * misconceptionCode the bank entry wrongTurn verbatim (resolved via
 * misconceptionFor on the bank topic), and render so the student
 * sheet contains no item answer for a choiceless item and no
 * misconceptionCode at all, while the teacher key shows every answer
 * and every code.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const validate = require('../player/validate.js');
const printable = require('../player/printable.js');
const { misconceptionFor } = require('../generator/build_prompt.js');

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
  'primary-science-plant-systems',
  'primary-science-life-cycles',
  'primary-science-adaptations',
  'primary-science-energy-forms'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

for (const stem of STEMS) {
  test('gold quiz bank ' + stem + ': validates clean, codes bank-verbatim, withholds on the student sheet', () => {
    const bank = load('samples/quiz-banks/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateQuizBank(bank), [],
      stem + ': validateQuizBank reports zero errors');
    assert.equal(bank.title, notes.title, stem + ': title echoes the gold notes');
    assert.equal(bank.level, notes.level, stem + ': level echoes the gold notes');
    assert.equal(bank.subject, notes.subject, stem + ': subject echoes the gold notes');
    assert.equal(bank.topic, notes.topic, stem + ': topic echoes the gold notes');
    assert.ok(bank.items.length >= 4, stem + ': bank holds at least 4 retrieval items');

    // Faceted bank topics (bio-nutrition) resolve via the stem's final
    // token as the facet hint; unknown hints fall back to the primary facet.
    const entry = misconceptionFor(bank.topic, stem.split('-').pop());
    assert.ok(entry && entry.wrongTurn, stem + ': topic resolves a misconception bank entry');
    const coded = bank.items.filter((item) => item.misconceptionCode !== undefined);
    assert.ok(coded.length >= 1, stem + ': at least one item is coded to the bank');
    for (const item of coded) {
      assert.equal(item.misconceptionCode, entry.wrongTurn,
        stem + ': misconceptionCode is the bank wrongTurn verbatim');
    }

    const student = printable.renderQuizBank(bank);
    const key = printable.renderQuizBankAnswerKey(bank);
    for (const item of bank.items) {
      assert.ok(student.includes(item.prompt), stem + ': student sheet shows an item prompt');
      assert.ok(key.includes(item.prompt), stem + ': answer key shows an item prompt');
      assert.ok(key.includes(item.answer), stem + ': answer key shows an item answer');
      if (item.choices === undefined) {
        assert.ok(!student.includes(item.answer),
          stem + ': student sheet withholds a choiceless item answer');
      } else {
        for (const choice of item.choices) {
          assert.ok(student.includes(choice), stem + ': student sheet shows an item choice');
        }
      }
      if (item.misconceptionCode !== undefined) {
        // Renderers HTML-escape text, so the code is compared in its escaped form (the glossary/guide gold precedent); the verbatim pin above stays raw.
        assert.ok(!student.includes(printable.escapeHtml(item.misconceptionCode)),
          stem + ': student sheet withholds the misconception code');
        assert.ok(key.includes(printable.escapeHtml(item.misconceptionCode)),
          stem + ': answer key shows the misconception code');
      }
    }
  });
}

test('gold quiz banks: renderQuizBank rejects an invalid bank and the options argument is honoured', () => {
  const bank = load('samples/quiz-banks/primary-science-water-cycle.json');
  assert.throws(() => printable.renderQuizBank({ title: 'x' }), /invalid quiz bank/);
  assert.throws(() => printable.renderQuizBankAnswerKey(null), /invalid quiz bank/);
  const plain = printable.renderQuizBank(bank);
  const enlarged = printable.renderQuizBank(bank, { enlargedPrint: true });
  assert.ok(enlarged.includes('pr-enlarged'), 'enlarged option reaches the quiz bank sheet');
  assert.ok(!plain.includes('pr-enlarged'), 'default rendering carries no variant class');
  const keyPlain = printable.renderQuizBankAnswerKey(bank);
  const keyUncluttered = printable.renderQuizBankAnswerKey(bank, { unclutteredLayout: true });
  assert.ok(keyUncluttered.includes('pr-uncluttered'), 'uncluttered option reaches the answer key');
  assert.ok(!keyPlain.includes('pr-uncluttered'), 'default key carries no variant class');
});

test('quiz bank answer key renders an item outcomeCode (synthetic bank, not gold)', () => {
  const synthetic = {
    title: 'Synthetic Bank', level: 'primary', subject: 'math', topic: 'fractions',
    items: [
      { prompt: 'Q1?', answer: 'A1', outcomeCode: 'M.3.1' },
      { prompt: 'Q2?', answer: 'A2' },
      { prompt: 'Q3?', answer: 'A3' },
      { prompt: 'Q4?', answer: 'A4' }
    ]
  };
  assert.deepEqual(validate.validateQuizBank(synthetic), []);
  const key = printable.renderQuizBankAnswerKey(synthetic);
  assert.ok(key.includes('Outcome: M.3.1'), 'answer key shows the outcome code');
  const student = printable.renderQuizBank(synthetic);
  assert.ok(!student.includes('M.3.1'), 'student sheet never shows the outcome code');
});
