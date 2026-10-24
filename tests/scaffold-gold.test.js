/* animath gold scaffolds gate tests (issue #1233, slice 2 of #1230).
 * Pins the six-topic subset gate for Phase B2: one hand-authored gold
 * scaffolds material in samples/scaffolds/ per gate topic (the Phase
 * A1 gate topics - Primary / Secondary / JC, maths + sciences at each
 * level). Each material must validate clean against validateScaffolds,
 * echo its topic's gold student notes (samples/notes/<stem>.json) on
 * title / level / subject / topic, draw every word-bank term from that
 * notes file's definitions (exact Set membership - no substring or
 * case-folded matching), take every cloze answer from the same set's
 * word bank, and fade strictly: first set full, last set minimal, with
 * the counts of word-bank terms, starters, frames and total cloze
 * answers each non-increasing along the sets (recomputed here
 * independently of the validator).
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
  'primary-science-plant-systems',
  'primary-science-life-cycles',
  'primary-science-adaptations',
  'primary-science-energy-forms'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

for (const stem of STEMS) {
  test('gold scaffolds ' + stem + ': validates clean and stays keyed to its gold notes', () => {
    const scaffolds = load('samples/scaffolds/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateScaffolds(scaffolds), [],
      stem + ': validateScaffolds reports zero errors');

    assert.equal(scaffolds.title, notes.title, stem + ': title echoes the gold notes');
    assert.equal(scaffolds.level, notes.level, stem + ': level echoes the gold notes');
    assert.equal(scaffolds.subject, notes.subject, stem + ': subject echoes the gold notes');
    assert.equal(scaffolds.topic, notes.topic, stem + ': topic echoes the gold notes');

    const definitionTerms = new Set(notes.definitions.map((d) => d.term));
    for (const set of scaffolds.sets) {
      const bankTerms = new Set(set.wordBank.map((e) => e.term));
      for (const entry of set.wordBank) {
        assert.ok(definitionTerms.has(entry.term),
          stem + ': word-bank term ' + JSON.stringify(entry.term) +
          ' is one of the paired notes definition terms (exact match)');
      }
      for (const item of set.cloze) {
        for (const answer of item.answers) {
          assert.ok(bankTerms.has(answer),
            stem + ': cloze answer ' + JSON.stringify(answer) +
            ' is a term of the same set\'s word bank (exact match)');
        }
      }
    }

    assert.equal(scaffolds.sets[0].level, 'full', stem + ': first set is full');
    assert.equal(scaffolds.sets[scaffolds.sets.length - 1].level, 'minimal',
      stem + ': last set is minimal');

    const counts = scaffolds.sets.map((set) => ({
      wordBank: set.wordBank.length,
      starters: set.starters.length,
      frames: set.frames.length,
      clozeAnswers: set.cloze.reduce((sum, item) => sum + item.answers.length, 0)
    }));
    for (let i = 1; i < counts.length; i++) {
      for (const key of ['wordBank', 'starters', 'frames', 'clozeAnswers']) {
        assert.ok(counts[i][key] <= counts[i - 1][key],
          stem + ': ' + key + ' count is non-increasing from set ' + i +
          ' to set ' + (i + 1) + ' (' + counts[i - 1][key] + ' -> ' + counts[i][key] + ')');
      }
    }
  });

  test('gold scaffolds ' + stem + ': renders non-empty through renderScaffolds', () => {
    const scaffolds = load('samples/scaffolds/' + stem + '.json');
    const html = printable.renderScaffolds(scaffolds);
    assert.ok(html.length > 0, stem + ': renderScaffolds output is non-empty');
    assert.ok(html.includes(scaffolds.title), stem + ': rendered scaffolds carry their title');
  });
}

test('the gate spans Primary, Secondary and JC with maths and sciences at each level', () => {
  const levels = new Set();
  const pairs = new Set();
  for (const stem of STEMS) {
    const scaffolds = load('samples/scaffolds/' + stem + '.json');
    levels.add(scaffolds.level);
    pairs.add(scaffolds.level + ':' + (scaffolds.subject === 'math' ? 'math' : 'science'));
  }
  assert.deepEqual([...levels].sort(), ['jc', 'primary', 'secondary']);
  assert.equal(pairs.size, 6, 'maths and sciences at each of the three levels');
});
