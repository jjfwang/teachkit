/* animath gold worked-example sets gate tests (issue #1250, slice 2 of
 * #1247). Pins the six-topic subset gate for Phase C2: one hand-authored
 * gold worked-example set in samples/worked-examples/ per gate topic.
 * Each must validate clean against validateWorkedExamples, echo its
 * paired gold notes on title / level / subject / topic, carry a
 * complete example and a faded example of at least 2 steps each plus a
 * paired problem, render so the student sheet contains no withheld
 * faded step text or annotation and no paired solution while the
 * teacher key shows both, and have its gate deck pinned to contain an
 * example-kind slide (the deck reference realised at pack level).
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
  'primary-science-human-body-systems'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

for (const stem of STEMS) {
  test('gold worked examples ' + stem + ': validates clean, withholds on the student sheet, deck carries an example slide', () => {
    const set = load('samples/worked-examples/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');
    const deck = load('samples/decks/' + stem + '.json');

    assert.deepEqual(validate.validateWorkedExamples(set), [],
      stem + ': validateWorkedExamples reports zero errors');
    assert.equal(set.title, notes.title, stem + ': title echoes the gold notes');
    assert.equal(set.level, notes.level, stem + ': level echoes the gold notes');
    assert.equal(set.subject, notes.subject, stem + ': subject echoes the gold notes');
    assert.equal(set.topic, notes.topic, stem + ': topic echoes the gold notes');
    assert.ok(set.complete.steps.length >= 2, stem + ': complete example has at least 2 steps');
    assert.ok(set.faded.steps.length >= 2, stem + ': faded example has at least 2 steps');
    const withheld = set.faded.steps.filter((s) => s.withheld === true);
    const shown = set.faded.steps.filter((s) => s.withheld === false);
    assert.ok(shown.length >= 1 && withheld.length >= 1, stem + ': faded example has shown and withheld steps');

    const student = printable.renderWorkedExamples(set);
    const key = printable.renderWorkedExamplesAnswerKey(set);
    // Student sheet shows the complete example and the shown faded steps.
    assert.ok(student.includes(set.complete.problem), stem + ': student sheet shows the complete problem');
    for (const step of set.complete.steps) {
      assert.ok(student.includes(step.text), stem + ': student sheet shows a complete step');
      assert.ok(student.includes(step.annotation), stem + ': student sheet shows a complete annotation');
    }
    for (const step of shown) {
      assert.ok(student.includes(step.text), stem + ': student sheet shows a shown faded step');
    }
    assert.ok(student.includes(set.paired.problem), stem + ': student sheet shows the paired problem');
    // Student sheet withholds every withheld step's text and annotation
    // and the paired solution; the teacher key shows all of them.
    for (const step of withheld) {
      assert.ok(!student.includes(step.text), stem + ': student sheet withholds a withheld step text');
      if (typeof step.annotation === 'string') {
        assert.ok(!student.includes(step.annotation), stem + ': student sheet withholds a withheld step annotation');
      }
      assert.ok(key.includes(step.text), stem + ': answer key shows a withheld step text');
      if (typeof step.annotation === 'string') {
        assert.ok(key.includes(step.annotation), stem + ': answer key shows a withheld step annotation');
      }
    }
    assert.ok(!student.includes(set.paired.solution), stem + ': student sheet withholds the paired solution');
    assert.ok(key.includes(set.paired.solution), stem + ': answer key shows the paired solution');

    assert.ok(deck.slides.some((slide) => slide.kind === 'example'),
      stem + ': gold deck contains an example-kind slide');
  });
}
