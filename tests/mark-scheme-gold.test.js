/* Tests for the mark-scheme subset gate (issue #1213, slice 2 of #1205,
 * Phase A1 of epic #1204): the gold worksheets and gold exit tickets for
 * six topics spanning Primary / Secondary / JC and maths + sciences carry
 * marks, a markScheme whose credit points sum exactly to the question
 * marks, and a workedSolution on every short-answer question. The teacher
 * key renders the scheme; the student sheet never does. Node-only, zero
 * dependencies.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateWorksheet, validateExitTicket } = require('../player/validate.js');
const printable = require('../player/printable.js');

const TOPICS = [
  'primary-math-fractions-addition',
  'primary-science-water-cycle',
  'secondary-e-algebra',
  'secondary-physics-energy',
  'jc-h2-differentiation',
  'jc-h2-cell-bio'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

const FILES = [];
for (const stem of TOPICS) {
  FILES.push({ stem, kind: 'worksheet', spec: load('samples/worksheets/' + stem + '.json') });
  FILES.push({ stem, kind: 'ticket', spec: load('samples/tickets/' + stem + '.json') });
}

test('the gate covers exactly the six topics, worksheet and ticket each', () => {
  assert.equal(FILES.length, 12);
  assert.deepEqual([...new Set(FILES.map((f) => f.stem))].sort(), [...TOPICS].sort());
});

for (const { stem, kind, spec } of FILES) {
  test(stem + ' ' + kind + ': every question carries marks and a summing markScheme', () => {
    const errors = kind === 'worksheet' ? validateWorksheet(spec) : validateExitTicket(spec);
    assert.deepEqual(errors, []);
    assert.ok(spec.questions.length > 0);
    for (const q of spec.questions) {
      assert.ok(Number.isInteger(q.marks) && q.marks > 0, q.id + ' marks');
      assert.ok(q.markScheme && Array.isArray(q.markScheme.points) && q.markScheme.points.length > 0,
        q.id + ' markScheme points');
      const sum = q.markScheme.points.reduce((acc, p) => acc + p.marks, 0);
      assert.equal(sum, q.marks, q.id + ' points sum to marks');
      for (const p of q.markScheme.points) {
        assert.ok(typeof p.text === 'string' && p.text.length > 0, q.id + ' point text');
        assert.ok(Number.isInteger(p.marks) && p.marks > 0, q.id + ' point marks');
      }
      if (q.kind === 'short-answer') {
        assert.ok(typeof q.workedSolution === 'string' && q.workedSolution.length > 0,
          q.id + ' workedSolution');
      }
      if (q.kind === 'multiple-choice') {
        assert.equal(q.markScheme.points.length, 1, q.id + ' single MC credit point');
      }
    }
  });
}

test('teacher key renders scheme points for a retrofitted question; student sheet excludes them', () => {
  const { spec } = FILES.find((f) => f.kind === 'worksheet');
  const q = spec.questions.find((x) => x.kind === 'short-answer');
  const key = printable.renderWorksheetAnswerKey(spec);
  assert.ok(key.includes(q.markScheme.points[0].text), 'teacher key shows the first credit point');
  assert.ok(key.includes('Marks: ' + q.marks), 'teacher key shows the marks');
  assert.ok(key.includes(q.workedSolution), 'teacher key shows the worked solution');
  const student = printable.renderWorksheet(spec);
  assert.ok(!student.includes(q.markScheme.points[0].text), 'student sheet has no credit point text');
  assert.ok(!student.includes('pr-mark-scheme'), 'student sheet has no scheme markup');
});

test('exit-ticket teacher key renders scheme points; student ticket excludes them', () => {
  const { spec } = FILES.find((f) => f.kind === 'ticket');
  const q = spec.questions.find((x) => x.kind === 'short-answer');
  const key = printable.renderExitTicketAnswerKey(spec);
  assert.ok(key.includes(q.markScheme.points[0].text), 'teacher key shows the first credit point');
  const student = printable.renderExitTicket(spec);
  assert.ok(!student.includes(q.markScheme.points[0].text), 'student ticket has no credit point text');
});

test('pack-demo stacks all six topics so the demo teacher keys carry the schemes', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'player', 'pack-demo.html'), 'utf8');
  for (const id of ['fractions-manifest', 'e-algebra-secondary-manifest',
    'phys-energy-secondary-manifest', 'differentiation-jc-manifest', 'cell-bio-jc-manifest']) {
    assert.ok(html.includes(id), 'pack-demo manifest present: ' + id);
  }
  // The water-cycle pack is the original stacked pack: it loads its
  // worksheet through printable.js like every later pack.
  assert.ok(html.includes('../samples/worksheets/primary-science-water-cycle.json'),
    'pack-demo loads the water-cycle worksheet');
  assert.ok(html.includes('../samples/tickets/primary-science-water-cycle.json'),
    'pack-demo loads the water-cycle ticket');
});
