/* animath gold revision gate tests (issue #1270, slice 2 of #1267).
 * Pins the six-topic subset gate for Phase D1: one hand-authored gold
 * revision file in samples/revision/ per quiz-bank gate topic, under
 * the same filename as its paired gold quiz bank and gold notes. Each
 * must validate clean against validateRevision, echo its paired bank
 * and notes on title / level / subject / topic, and be derived
 * verbatim - never free-authored: every definition card is a paired
 * notes definition term / meaning, the trap card is the paired notes
 * trap misconception / explanation, every quiz-bank card and every
 * practice-set item is a paired quiz bank item prompt / answer. The
 * study sheet shows flashcard fronts and practice prompts only (no
 * back and no practice answer), while the answer key shows every back
 * and answer. Pack-demo wiring for the six gate packs is pinned too.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const validate = require('../player/validate.js');
const printable = require('../player/printable.js');

const GATE_STEMS = [
  'primary-math-fractions-addition',
  'primary-science-water-cycle',
  'secondary-e-algebra',
  'secondary-physics-energy',
  'jc-h2-differentiation',
  'jc-h2-cell-bio'
];

const STEMS = [
  ...GATE_STEMS,
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
  'primary-science-energy-forms',
  'primary-science-photosynthesis',
  'secondary-e-trigonometry',
  'secondary-e-mensuration',
  'secondary-e-probability',
  'secondary-science-electricity',
  'secondary-science-cells',
  'secondary-science-chem-acids',
  'secondary-science-chem-atomic',
  'secondary-science-chem-bonding',
  'secondary-science-chem-mole',
  'secondary-physics-kinematics',
  'secondary-physics-forces',
  'secondary-physics-waves',
  'jc-h2-sequences',
  'jc-h2-vectors',
  'jc-h2-complex'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

for (const stem of STEMS) {
  test('gold revision ' + stem + ': validates clean, derived verbatim, withholds on the study sheet', () => {
    const rev = load('samples/revision/' + stem + '.json');
    const bank = load('samples/quiz-banks/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateRevision(rev), [],
      stem + ': validateRevision reports zero errors');
    for (const field of ['title', 'level', 'subject', 'topic']) {
      assert.equal(rev[field], notes[field], stem + ': ' + field + ' echoes the gold notes');
      assert.equal(rev[field], bank[field], stem + ': ' + field + ' echoes the gold quiz bank');
    }
    assert.ok(rev.flashcards.length >= 4, stem + ': at least 4 flashcards');
    assert.ok(rev.practiceSets.length >= 2, stem + ': at least 2 practice sets');
    for (let i = 1; i < rev.practiceSets.length; i += 1) {
      assert.ok(rev.practiceSets[i].dayOffset > rev.practiceSets[i - 1].dayOffset,
        stem + ': practice set dayOffsets strictly increase');
    }

    const defPairs = new Set(notes.definitions.map((d) => d.term + '\u0001' + d.meaning));
    const bankPairs = new Set(bank.items.map((it) => it.prompt + '\u0001' + it.answer));
    let trapCards = 0;
    for (const card of rev.flashcards) {
      const pair = card.front + '\u0001' + card.back;
      if (card.source === 'definition') {
        assert.ok(defPairs.has(pair), stem + ': definition card is a notes term / meaning verbatim');
      } else if (card.source === 'trap') {
        trapCards += 1;
        assert.equal(card.front, notes.trap.misconception, stem + ': trap card front is the notes trap misconception verbatim');
        assert.equal(card.back, notes.trap.explanation, stem + ': trap card back is the notes trap explanation verbatim');
      } else {
        assert.equal(card.source, 'quiz-bank', stem + ': card source is one of definition / trap / quiz-bank');
        assert.ok(bankPairs.has(pair), stem + ': quiz-bank card is a bank item prompt / answer verbatim');
      }
    }
    assert.equal(trapCards, 1, stem + ': exactly one trap card');
    for (const set of rev.practiceSets) {
      assert.ok(set.items.length >= 1, stem + ': practice set carries items');
      for (const item of set.items) {
        assert.ok(bankPairs.has(item.prompt + '\u0001' + item.answer),
          stem + ': practice item is a bank item prompt / answer verbatim');
      }
    }

    const student = printable.renderRevision(rev);
    const key = printable.renderRevisionAnswerKey(rev);
    for (const card of rev.flashcards) {
      assert.ok(student.includes(esc(card.front)), stem + ': study sheet shows a flashcard front');
      assert.ok(!student.includes(esc(card.back)), stem + ': study sheet withholds a flashcard back');
      assert.ok(key.includes(esc(card.front)), stem + ': answer key shows a flashcard front');
      assert.ok(key.includes(esc(card.back)), stem + ': answer key shows a flashcard back');
    }
    for (const set of rev.practiceSets) {
      for (const item of set.items) {
        assert.ok(student.includes(esc(item.prompt)), stem + ': study sheet shows a practice prompt');
        assert.ok(!student.includes(esc(item.answer)), stem + ': study sheet withholds a practice answer');
        assert.ok(key.includes(esc(item.prompt)), stem + ': answer key shows a practice prompt');
        assert.ok(key.includes(esc(item.answer)), stem + ': answer key shows a practice answer');
      }
    }
  });
}

test('gold revision: renderRevision rejects an invalid file and the options argument is honoured', () => {
  const rev = load('samples/revision/primary-science-water-cycle.json');
  assert.throws(() => printable.renderRevision({ title: 'x' }), /invalid revision/);
  assert.throws(() => printable.renderRevisionAnswerKey(null), /invalid revision/);
  const plain = printable.renderRevision(rev);
  const enlarged = printable.renderRevision(rev, { enlargedPrint: true });
  assert.ok(enlarged.includes('pr-enlarged'), 'enlarged option reaches the revision sheet');
  assert.ok(!plain.includes('pr-enlarged'), 'default rendering carries no variant class');
  const keyPlain = printable.renderRevisionAnswerKey(rev);
  const keyUncluttered = printable.renderRevisionAnswerKey(rev, { unclutteredLayout: true });
  assert.ok(keyUncluttered.includes('pr-uncluttered'), 'uncluttered option reaches the answer key');
  assert.ok(!keyPlain.includes('pr-uncluttered'), 'default key carries no variant class');
});

test('gold revision: pack-demo wires exactly the six gate packs', () => {
  const demo = fs.readFileSync(path.join(__dirname, '..', 'player', 'pack-demo.html'), 'utf8');
  assert.equal(demo.split('../samples/revision/').length - 1, 6);
  assert.equal(demo.split('AnimathValidate.validateRevision(').length - 1, 6);
  assert.equal(demo.split('AnimathPrintable.renderRevision(').length - 1, 6);
  assert.equal(demo.split('AnimathPrintable.renderRevisionAnswerKey(').length - 1, 6);
  for (const stem of GATE_STEMS) {
    assert.ok(demo.includes('../samples/revision/' + stem + '.json'), 'revision fetch present: ' + stem);
  }
});
