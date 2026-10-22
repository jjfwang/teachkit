/* Tests for the tiered worksheet gold retrofit (issue #1228, slice 2 of
 * #1225): the six Phase A gate-topic gold worksheets carry tier,
 * difficulty and objective on every question, and every objective of
 * the paired gold lesson plan is served by at least one question at
 * EACH tier (support / core / extension) - the coverage rule settled on
 * #1225. Also pins the validateWorksheet objective check (strict when
 * present, worksheets only; exit tickets unchanged).
 * Node-only, zero dependencies.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateWorksheet, validateExitTicket } = require('../player/validate.js');

const ROOT = path.join(__dirname, '..');
const TIERS = ['support', 'core', 'extension'];
const TOPICS = [
  'primary-math-fractions-addition',
  'primary-science-water-cycle',
  'secondary-e-algebra',
  'secondary-physics-energy',
  'jc-h2-differentiation',
  'jc-h2-cell-bio'
];

function load(dir, topic) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', dir, topic + '.json'), 'utf8'));
}

for (const topic of TOPICS) {
  test(topic + ': gold worksheet is tiered and covers every plan objective at each tier', () => {
    const worksheet = load('worksheets', topic);
    const plan = load('plans', topic);
    assert.deepEqual(validateWorksheet(worksheet), [], topic + ' worksheet must validate clean');
    const planIds = plan.objectives.map((o) => o.id);
    assert.ok(planIds.length > 0);
    for (const q of worksheet.questions) {
      assert.ok(TIERS.includes(q.tier), topic + ' ' + q.id + ' carries a valid tier');
      assert.ok(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 5,
        topic + ' ' + q.id + ' carries a difficulty in 1..5');
      assert.ok(planIds.includes(q.objective),
        topic + ' ' + q.id + ' objective ' + q.objective + ' is a paired plan objective id');
    }
    for (const oid of planIds) {
      for (const tier of TIERS) {
        assert.ok(
          worksheet.questions.some((q) => q.objective === oid && q.tier === tier),
          topic + ': objective ' + oid + ' is served at tier ' + tier);
      }
    }
  });
}

/* ---------- validator: objective, strict when present, worksheets only ---------- */

function wsWith(question) {
  return {
    title: 'Fractions Practice', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [question]
  };
}

function saBase() {
  return { id: 'q1', prompt: 'Name the process.', kind: 'short-answer', answer: 'Evaporation' };
}

test('a non-string objective is rejected on a worksheet question', () => {
  const q = saBase(); q.objective = 2;
  assert.deepEqual(validateWorksheet(wsWith(q)),
    ['questions[0].objective: must be a non-empty string when present']);
});

test('an empty objective is rejected on a worksheet question', () => {
  const q = saBase(); q.objective = '  ';
  assert.deepEqual(validateWorksheet(wsWith(q)),
    ['questions[0].objective: must be a non-empty string when present']);
});

test('a valid objective validates on a worksheet question', () => {
  const q = saBase(); q.objective = 'o1';
  assert.deepEqual(validateWorksheet(wsWith(q)), []);
});

test('objective is not checked on exit tickets', () => {
  const ticket = wsWith(Object.assign(saBase(), { objective: 2 }));
  ticket.questions.push(
    { id: 'q2', prompt: 'Second.', kind: 'short-answer', answer: 'Condensation' },
    { id: 'q3', prompt: 'Third.', kind: 'short-answer', answer: 'Precipitation' });
  assert.deepEqual(validateExitTicket(ticket), []);
});
