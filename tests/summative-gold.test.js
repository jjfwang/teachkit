/* animath gold summative gate tests (issue #1261, slice 4 of #1254).
 * Pins the six-topic subset gate for the summative half of Phase C3:
 * one hand-authored gold summative unit in samples/summatives/ per
 * Phase A gate topic. A summative is unit-level, so each unit's topics
 * array holds its gate topic plus at least one sibling topic at the
 * same level and subject, and every topic slug names an existing gold
 * notes file. Each unit must validate clean against
 * validateSummative (blueprint rows summing to totalMarks, items
 * summing to their blueprint row, mark schemes summing to the item
 * marks), ship moderation unreviewed with review null (gold ships
 * unsigned - naming a reviewer is an owner adoption-time activity),
 * and render so the student paper shows header, duration, total
 * marks, prompts, command words and item marks but contains no mark
 * scheme credit-point text and no rubric descriptor text, while the
 * teacher answer key shows every credit point and the full rubric.
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
  'secondary-physics-kinematics'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

for (const stem of STEMS) {
  test('gold summative ' + stem + ': validates clean, spans its gate topic, withholds on the student paper', () => {
    const unit = load('samples/summatives/' + stem + '.json');
    const gateNotes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateSummative(unit), [],
      stem + ': validateSummative reports zero errors');

    // Unit span: the gate topic plus at least one sibling, every topic
    // pinned to an existing gold notes file at the same level/subject.
    assert.ok(unit.topics.length >= 2, stem + ': unit spans at least 2 topics');
    assert.ok(unit.topics.includes(stem), stem + ': topics include the gate topic');
    assert.equal(unit.level, gateNotes.level, stem + ': level matches the gate notes');
    assert.equal(unit.subject, gateNotes.subject, stem + ': subject matches the gate notes');
    const siblings = unit.topics.filter((t) => t !== stem);
    assert.ok(siblings.length >= 1, stem + ': unit carries at least one sibling topic');
    for (const topic of unit.topics) {
      const notesPath = path.join(__dirname, '..', 'samples/notes/' + topic + '.json');
      assert.ok(fs.existsSync(notesPath), stem + ': topic ' + topic + ' has gold notes');
      const notes = load('samples/notes/' + topic + '.json');
      assert.equal(notes.level, unit.level, stem + ': topic ' + topic + ' is the same level');
      assert.equal(notes.subject, unit.subject, stem + ': topic ' + topic + ' is the same subject');
    }

    // Marks sums, restated independently of the validator.
    const blueprintSum = unit.blueprint.reduce((acc, row) => acc + row.marks, 0);
    assert.equal(blueprintSum, unit.totalMarks, stem + ': blueprint rows sum to totalMarks');
    unit.blueprint.forEach((row, i) => {
      const rowSum = unit.items
        .filter((item) => item.blueprintRow === i)
        .reduce((acc, item) => acc + item.marks, 0);
      assert.ok(rowSum > 0, stem + ': blueprint row ' + i + ' has at least one item');
      assert.equal(rowSum, row.marks, stem + ': items sum to blueprint row ' + i);
    });
    for (const item of unit.items) {
      const pointSum = item.markScheme.points.reduce((acc, p) => acc + p.marks, 0);
      assert.equal(pointSum, item.marks, stem + ': mark scheme sums to the item marks');
    }

    // Gold ships unsigned.
    assert.equal(unit.moderation.state, 'unreviewed', stem + ': moderation ships unreviewed');
    assert.equal(unit.review, null, stem + ': review ships null');

    const student = printable.renderSummative(unit);
    const key = printable.renderSummativeAnswerKey(unit);

    // Student paper: header, exam-format line, prompts, command words, marks.
    assert.ok(student.includes(unit.title), stem + ': student paper shows the title');
    assert.ok(student.includes(unit.unitTitle), stem + ': student paper shows the unit title');
    assert.ok(student.includes('Time allowed: ' + unit.durationMinutes + ' minutes'),
      stem + ': student paper shows the duration');
    assert.ok(student.includes('Total marks: ' + unit.totalMarks),
      stem + ': student paper shows the total marks');
    for (const item of unit.items) {
      assert.ok(student.includes(item.prompt), stem + ': student paper shows an item prompt');
      assert.ok(student.includes(item.commandWord), stem + ': student paper shows a command word');
      assert.ok(student.includes(item.marks + ' marks'), stem + ': student paper shows item marks');
      for (const point of item.markScheme.points) {
        assert.ok(!student.includes(point.text),
          stem + ': student paper withholds mark scheme text: ' + point.text);
        assert.ok(key.includes(point.text),
          stem + ': answer key shows mark scheme text: ' + point.text);
      }
    }
    for (const criterion of unit.rubric.criteria) {
      assert.ok(key.includes(criterion.name), stem + ': answer key shows the rubric criterion');
      for (const level of criterion.levels) {
        assert.ok(!student.includes(level.descriptor),
          stem + ': student paper withholds rubric descriptor: ' + level.label);
        assert.ok(key.includes(level.descriptor),
          stem + ': answer key shows rubric descriptor: ' + level.label);
      }
    }
  });
}

test('gold summatives: the thirty-two units are exactly the Phase A gate set plus the pythagoras, photosynthesis, decimals, percentage, ratio, area-perimeter, rate-speed, model-method, data-graphs, forces-magnets, human-body-systems, plant-systems, life-cycles, adaptations, energy-forms, photosynthesis, e-trigonometry, e-mensuration, e-probability, science-electricity, science-cells, science-chem-acids, science-chem-atomic, science-chem-bonding, science-chem-mole and physics-kinematics backfills', () => {
  const files = fs.readdirSync(path.join(__dirname, '..', 'samples/summatives'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
  assert.deepEqual(files, [...STEMS].sort());
});
