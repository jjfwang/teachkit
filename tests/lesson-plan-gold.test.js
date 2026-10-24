/* animath gold lesson-plan gate tests (issue #1217, slice 2 of #1206).
 * Pins the six-topic subset gate for Phase A2: one hand-authored gold
 * lesson plan in samples/plans/ per gate topic (the Phase A1 gate
 * topics of issue #1213 - Primary / Secondary / JC, maths + sciences
 * at each level). Each plan must validate clean against
 * validateLessonPlan, echo its topic's gold teacher script
 * (samples/scripts/<stem>.json) on level / subject / topic, sum its
 * activity minutes exactly to durationMinutes, name only script cues
 * that actually appear in that script's segments in its scriptCue
 * fields, and deliver every objective from at least one activity.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const validate = require('../player/validate.js');

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
  'primary-science-human-body-systems'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

for (const stem of STEMS) {
  test('gold lesson plan ' + stem + ': validates clean and stays keyed to its gold script', () => {
    const plan = load('samples/plans/' + stem + '.json');
    const script = load('samples/scripts/' + stem + '.json');

    assert.deepEqual(validate.validateLessonPlan(plan), [],
      stem + ': validateLessonPlan reports zero errors');

    assert.equal(plan.level, script.level, stem + ': level echoes the gold script');
    assert.equal(plan.subject, script.subject, stem + ': subject echoes the gold script');
    assert.equal(plan.topic, script.topic, stem + ': topic echoes the gold script');
    assert.equal(plan.title, script.title, stem + ': title echoes the gold script');

    const total = plan.activities.reduce((sum, a) => sum + a.minutes, 0);
    assert.equal(total, plan.durationMinutes,
      stem + ': activity minutes sum exactly to durationMinutes');

    const cues = new Set(script.segments.map((s) => s.cue).filter((c) => typeof c === 'string'));
    for (const activity of plan.activities) {
      if (activity.scriptCue !== undefined) {
        assert.ok(cues.has(activity.scriptCue),
          stem + ': scriptCue ' + JSON.stringify(activity.scriptCue) +
          ' names a cue present in the gold script');
      }
    }

    const delivered = new Set();
    for (const activity of plan.activities) {
      for (const id of activity.objectiveIds) delivered.add(id);
    }
    for (const objective of plan.objectives) {
      assert.ok(delivered.has(objective.id),
        stem + ': objective ' + objective.id + ' is delivered by at least one activity');
    }
  });
}

test('the gate spans Primary, Secondary and JC with maths and sciences at each level', () => {
  const levels = new Set();
  const pairs = new Set();
  for (const stem of GATE_STEMS) {
    const plan = load('samples/plans/' + stem + '.json');
    levels.add(plan.level);
    pairs.add(plan.level + ':' + (plan.subject === 'math' ? 'math' : 'science'));
  }
  assert.deepEqual([...levels].sort(), ['jc', 'primary', 'secondary']);
  assert.equal(pairs.size, 6, 'maths and sciences at each of the three levels');
});

const printable = require('../player/printable.js');

for (const stem of STEMS) {
  test('gold lesson plan ' + stem + ': renders non-empty through renderLessonPlan', () => {
    const plan = load('samples/plans/' + stem + '.json');
    const html = printable.renderLessonPlan(plan);
    assert.ok(html.length > 0, stem + ': renderLessonPlan output is non-empty');
    assert.ok(html.includes(plan.title), stem + ': rendered plan carries its title');
    assert.ok(html.includes('Total: ' + plan.durationMinutes + ' minutes'),
      stem + ': rendered plan carries its duration total');
  });
}
