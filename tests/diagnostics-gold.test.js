/* animath gold diagnostics gate tests (issue #1243, slice 2 of #1240).
 * Pins the six-topic subset gate for Phase C1: one hand-authored gold
 * diagnostics material in samples/diagnostics/ per gate topic. Each
 * must validate clean, echo its paired gold notes on title / level /
 * subject / topic, carry doNow 2-4 plus hingeQuestions 1-3, code every
 * distractor with the topic bank entry wrongTurn verbatim (resolved
 * through misconceptionFor on the file topic), draw every hinge
 * scriptCue from the paired gold script actual cues, and render so
 * the student sheet contains no misconception code and no rationale
 * text while the teacher key shows both.
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
  'primary-science-energy-forms',
  'primary-science-photosynthesis',
  'secondary-e-trigonometry',
  'secondary-e-mensuration',
  'secondary-e-probability',
  'secondary-science-electricity',
  'secondary-science-cells'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

for (const stem of STEMS) {
  test('gold diagnostics ' + stem + ': validates clean and stays keyed to its bank and script', () => {
    const diag = load('samples/diagnostics/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');
    const script = load('samples/scripts/' + stem + '.json');

    assert.deepEqual(validate.validateDiagnostics(diag), [],
      stem + ': validateDiagnostics reports zero errors');
    assert.equal(diag.title, notes.title, stem + ': title echoes the gold notes');
    assert.equal(diag.level, notes.level, stem + ': level echoes the gold notes');
    assert.equal(diag.subject, notes.subject, stem + ': subject echoes the gold notes');
    assert.equal(diag.topic, notes.topic, stem + ': topic echoes the gold notes');
    assert.ok(diag.doNow.length >= 2 && diag.doNow.length <= 4, stem + ': doNow count in 2..4');
    assert.ok(diag.hingeQuestions.length >= 1 && diag.hingeQuestions.length <= 3,
      stem + ': hingeQuestions count in 1..3');

    // Faceted bank topics (bio-nutrition) resolve via the stem's final
    // token as the facet hint; unknown hints fall back to the primary facet.
    const entry = misconceptionFor(diag.topic, stem.split('-').pop());
    assert.ok(entry, stem + ': topic resolves a misconception bank entry');
    const cues = new Set(script.segments.map((seg) => seg.cue));
    for (const q of diag.doNow.concat(diag.hingeQuestions)) {
      for (const choice of q.choices) {
        if (choice.correct !== true) {
          assert.equal(choice.misconception, entry.wrongTurn,
            stem + ': distractor code is the bank wrongTurn verbatim for ' + q.id);
        }
      }
    }
    for (const q of diag.hingeQuestions) {
      assert.ok(cues.has(q.scriptCue),
        stem + ': hinge scriptCue ' + JSON.stringify(q.scriptCue) + ' is an actual script cue');
    }
  });

  test('gold diagnostics ' + stem + ': student rendering hides codes and rationales, teacher key shows both', () => {
    const diag = load('samples/diagnostics/' + stem + '.json');
    // Faceted bank topics (bio-nutrition) resolve via the stem's final
    // token as the facet hint; unknown hints fall back to the primary facet.
    const entry = misconceptionFor(diag.topic, stem.split('-').pop());
    const student = printable.renderDiagnostics(diag);
    const key = printable.renderDiagnosticsAnswerKey(diag);
    assert.ok(student.includes(diag.title), stem + ': student sheet carries its title');
    // Renderers HTML-escape text, so the code is compared in its escaped form (the glossary/guide gold precedent); the verbatim pin above stays raw.
    assert.ok(!student.includes(printable.escapeHtml(entry.wrongTurn)), stem + ': student sheet has no misconception code');
    assert.ok(key.includes(printable.escapeHtml(entry.wrongTurn)), stem + ': teacher key shows the misconception code');
    for (const q of diag.doNow.concat(diag.hingeQuestions)) {
      for (const choice of q.choices) {
        if (choice.correct !== true) {
          for (const part of ['chose', 'thinks', 'reteach']) {
            assert.ok(!student.includes(choice.rationale[part]),
              stem + ': student sheet has no rationale ' + part + ' text for ' + q.id);
            assert.ok(key.includes(choice.rationale[part]),
              stem + ': teacher key shows rationale ' + part + ' for ' + q.id);
          }
        }
      }
    }
  });
}

test('renderDiagnostics rejects an invalid diagnostics spec', () => {
  assert.throws(() => printable.renderDiagnostics({}), /invalid diagnostics:/);
  assert.throws(() => printable.renderDiagnostics(null), /invalid diagnostics:/);
  assert.throws(() => printable.renderDiagnosticsAnswerKey({}), /invalid diagnostics:/);
  assert.throws(() => printable.renderDiagnosticsAnswerKey(null), /invalid diagnostics:/);
});

test('the gate spans Primary, Secondary and JC with maths and sciences at each level', () => {
  const levels = new Set();
  const pairs = new Set();
  for (const stem of STEMS) {
    const diag = load('samples/diagnostics/' + stem + '.json');
    levels.add(diag.level);
    pairs.add(diag.level + ':' + (diag.subject === 'math' ? 'math' : 'science'));
  }
  assert.deepEqual([...levels].sort(), ['jc', 'primary', 'secondary']);
  assert.equal(pairs.size, 6, 'maths and sciences at each of the three levels');
});
