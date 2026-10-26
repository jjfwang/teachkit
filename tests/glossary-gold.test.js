/* animath gold glossary gate tests (issue #1285, slice 4 of #1276).
 * Pins the six-topic subset gate for Phase D2: one hand-authored gold
 * glossary file in samples/glossary/ per Phase A gate topic, under
 * the same filename as its paired gold notes and gold organisers.
 * Each must validate clean against validateGlossary, echo its paired
 * notes on title / level / subject / topic, and be derived verbatim -
 * never free-authored: every entry's term and meaning are a paired
 * notes definition verbatim, in the same order as the notes
 * definitions block, and every entry's example is drawn verbatim
 * from the paired notes workedExample, one of its mechanismSteps, or
 * one of its objectives. renderGlossary is the full reference sheet:
 * it shows every entry's term, meaning and example (a glossary
 * withholds nothing, so there is no separate key renderer). The
 * glossary stays standalone - no pack-demo wiring is pinned here.
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
  'jc-h2-complex',
  'jc-h2-integration',
  'jc-h2-probability',
  'jc-h2-functions-graphs',
  'jc-h2-statistics',
  'jc-h2-mechanics',
  'jc-h2-em',
  'jc-h2-thermal'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

for (const stem of STEMS) {
  test('gold glossary ' + stem + ': validates clean, derived verbatim, fully rendered', () => {
    const gloss = load('samples/glossary/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateGlossary(gloss), [],
      stem + ': validateGlossary reports zero errors');
    for (const field of ['title', 'level', 'subject', 'topic']) {
      assert.equal(gloss[field], notes[field], stem + ': ' + field + ' echoes the gold notes');
    }

    assert.deepEqual(
      gloss.entries.map((e) => ({ term: e.term, meaning: e.meaning })),
      notes.definitions.map((d) => ({ term: d.term, meaning: d.meaning })),
      stem + ': every entry term and meaning is a paired notes definition verbatim, in notes order');

    const allowedExamples = new Set([notes.workedExample, ...notes.mechanismSteps, ...notes.objectives]);
    for (const entry of gloss.entries) {
      assert.ok(allowedExamples.has(entry.example),
        stem + ': every example is drawn verbatim from the paired notes workedExample, mechanismSteps or objectives');
    }

    const sheet = printable.renderGlossary(gloss);
    assert.ok(sheet.includes(esc(gloss.title)), stem + ': reference sheet shows the title');
    for (const entry of gloss.entries) {
      assert.ok(sheet.includes(esc(entry.term)), stem + ': reference sheet shows a term');
      assert.ok(sheet.includes(esc(entry.meaning)), stem + ': reference sheet shows a meaning');
      assert.ok(sheet.includes(esc(entry.example)), stem + ': reference sheet shows an example');
    }
  });
}

test('gold glossary: renderGlossary rejects an invalid file and the options argument is honoured', () => {
  const gloss = load('samples/glossary/primary-science-water-cycle.json');
  assert.throws(() => printable.renderGlossary({ title: 'x' }), /invalid glossary/);
  assert.throws(() => printable.renderGlossary(null), /invalid glossary/);
  const plain = printable.renderGlossary(gloss);
  const enlarged = printable.renderGlossary(gloss, { enlargedPrint: true });
  assert.ok(enlarged.includes('pr-enlarged'), 'enlarged option reaches the glossary sheet');
  assert.ok(!plain.includes('pr-enlarged'), 'default rendering carries no variant class');
});
