/* animath gold feedback gate tests (issue #1297, slice 2 of
 * #1294). Pins the six-strand subset gate for Phase E2: one
 * hand-authored gold feedback material in samples/feedback/ per
 * Phase A gate strand (primary math, primary science, secondary
 * E-math, secondary physics, JC H2 math, JC H2 biology), filed
 * under the gate topic's notes stem. Every model answer derives
 * verbatim from the paired gold worksheet or exit ticket: its
 * question is a paired question prompt verbatim, its answer is
 * that question's workedSolution or expected answer verbatim, and
 * its creditPoints are the source question's markScheme points
 * texts verbatim (an empty array when the source carries no mark
 * scheme). Every common error's misconception is verbatim from
 * the union of the paired files on disk: exit-ticket question
 * misconceptions, diagnostics rationale misconceptions, quiz-bank
 * misconceptionCodes, worksheet markScheme commonErrors entries
 * and the paired notes trap misconception. Each material must
 * validate clean against validateFeedback, render in full via
 * renderFeedback (the teacher sheet withholds nothing), and
 * render via renderFeedbackFixIts (the student sheet: header,
 * strengths, misconception, example and fix-it prompt only -
 * never a model answer, a credit point or corrected working).
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
  'jc-h2-thermal',
  'jc-h2-quantum'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

function expectedAnswer(q) {
  if (q.workedSolution) return q.workedSolution;
  if (q.choices) {
    const correct = q.choices.find((c) => c.correct === true);
    return correct ? correct.text : undefined;
  }
  return q.answer;
}

function creditPointsOf(q) {
  return q.markScheme ? q.markScheme.points.map((p) => p.text) : [];
}

function misconceptionUnion(stem) {
  const union = new Set();
  const ticket = load('samples/tickets/' + stem + '.json');
  for (const q of ticket.questions) {
    if (q.misconception) union.add(q.misconception);
  }
  const diagnostics = load('samples/diagnostics/' + stem + '.json');
  for (const section of [diagnostics.doNow, diagnostics.hingeQuestions]) {
    for (const q of section) {
      for (const choice of q.choices) {
        if (choice.misconception) union.add(choice.misconception);
      }
    }
  }
  const quizBank = load('samples/quiz-banks/' + stem + '.json');
  for (const item of quizBank.items) {
    if (item.misconceptionCode) union.add(item.misconceptionCode);
  }
  const worksheet = load('samples/worksheets/' + stem + '.json');
  for (const q of worksheet.questions) {
    if (q.markScheme && q.markScheme.commonErrors) {
      for (const entry of q.markScheme.commonErrors) union.add(entry);
    }
  }
  const notes = load('samples/notes/' + stem + '.json');
  union.add(notes.trap.misconception);
  return union;
}

for (const stem of STEMS) {
  test('gold feedback ' + stem + ': validates clean, derives verbatim, renders in full and fix-its withhold answers', () => {
    const feedback = load('samples/feedback/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');
    const worksheet = load('samples/worksheets/' + stem + '.json');
    const ticket = load('samples/tickets/' + stem + '.json');
    const sources = worksheet.questions.concat(ticket.questions);

    assert.deepEqual(validate.validateFeedback(feedback), [],
      stem + ': validateFeedback reports zero errors');
    assert.equal(feedback.title, notes.title, stem + ': title matches the gate notes');
    assert.equal(feedback.level, notes.level, stem + ': level matches the gate notes');
    assert.equal(feedback.subject, notes.subject, stem + ': subject matches the gate notes');
    assert.equal(feedback.topic, notes.topic, stem + ': topic matches the gate notes');

    // Derivation pins: model answers are paired questions verbatim.
    const questionSet = new Set(sources.map((q) => q.prompt));
    const answerSet = new Set(sources.map((q) => expectedAnswer(q)));
    assert.ok(feedback.modelAnswers.length >= 2, stem + ': at least 2 model answers');
    for (const ma of feedback.modelAnswers) {
      assert.ok(questionSet.has(ma.question),
        stem + ': model answer question is a paired question prompt verbatim: ' + ma.question);
      assert.ok(answerSet.has(ma.answer),
        stem + ': model answer answer is a paired expected answer verbatim: ' + ma.answer);
      const src = sources.find((q) => q.prompt === ma.question &&
        expectedAnswer(q) === ma.answer && JSON.stringify(creditPointsOf(q)) === JSON.stringify(ma.creditPoints));
      assert.ok(src, stem + ': model answer derives from one paired source question: ' + ma.question);
      assert.deepEqual(ma.creditPoints, creditPointsOf(src),
        stem + ': creditPoints equal the source markScheme points (or [] when none)');
    }

    // Derivation pins: misconceptions come from the paired union.
    const union = misconceptionUnion(stem);
    assert.ok(feedback.commonErrors.length >= 2, stem + ': at least 2 common errors');
    for (const ce of feedback.commonErrors) {
      assert.ok(union.has(ce.misconception),
        stem + ': misconception is in the paired union verbatim: ' + ce.misconception);
    }
    assert.ok(feedback.strengths.length >= 1, stem + ': at least 1 strength');
    assert.ok(feedback.nextSteps.length >= 1, stem + ': at least 1 next step');

    // Full teacher rendering: no field withheld.
    const html = printable.renderFeedback(feedback);
    for (const text of [feedback.title, feedback.level, feedback.subject, feedback.topic]) {
      assert.ok(html.includes(text), stem + ': renderFeedback shows header field ' + text);
    }
    for (const strength of feedback.strengths) {
      assert.ok(html.includes(strength), stem + ': renderFeedback shows strength ' + strength);
    }
    for (const ma of feedback.modelAnswers) {
      assert.ok(html.includes(ma.question), stem + ': renderFeedback shows model answer question ' + ma.question);
      assert.ok(html.includes(ma.answer), stem + ': renderFeedback shows model answer answer ' + ma.answer);
      for (const point of ma.creditPoints) {
        assert.ok(html.includes(point), stem + ': renderFeedback shows credit point ' + point);
      }
    }
    for (const ce of feedback.commonErrors) {
      assert.ok(html.includes(printable.escapeHtml(ce.misconception)), stem + ': renderFeedback shows misconception ' + ce.misconception);
      assert.ok(html.includes(ce.example), stem + ': renderFeedback shows example ' + ce.example);
      assert.ok(html.includes(ce.fixIt.prompt), stem + ': renderFeedback shows fix-it prompt ' + ce.fixIt.prompt);
      assert.ok(html.includes(ce.fixIt.corrected), stem + ': renderFeedback shows corrected working ' + ce.fixIt.corrected);
    }
    for (const step of feedback.nextSteps) {
      assert.ok(html.includes(step), stem + ': renderFeedback shows next step ' + step);
    }

    // Student fix-its rendering: prompts only, answers withheld.
    const fixIts = printable.renderFeedbackFixIts(feedback);
    for (const text of [feedback.title, feedback.level, feedback.subject, feedback.topic]) {
      assert.ok(fixIts.includes(text), stem + ': renderFeedbackFixIts shows header field ' + text);
    }
    for (const strength of feedback.strengths) {
      assert.ok(fixIts.includes(strength), stem + ': renderFeedbackFixIts shows strength ' + strength);
    }
    for (const ce of feedback.commonErrors) {
      assert.ok(fixIts.includes(printable.escapeHtml(ce.misconception)), stem + ': renderFeedbackFixIts shows misconception ' + ce.misconception);
      assert.ok(fixIts.includes(ce.example), stem + ': renderFeedbackFixIts shows example ' + ce.example);
      assert.ok(fixIts.includes(ce.fixIt.prompt), stem + ': renderFeedbackFixIts shows fix-it prompt ' + ce.fixIt.prompt);
    }
    for (const ma of feedback.modelAnswers) {
      assert.ok(!fixIts.includes(ma.question),
        stem + ': renderFeedbackFixIts withholds model answer question ' + ma.question);
      assert.ok(!fixIts.includes(ma.answer),
        stem + ': renderFeedbackFixIts withholds model answer answer ' + ma.answer);
      for (const point of ma.creditPoints) {
        assert.ok(!fixIts.includes(point),
          stem + ': renderFeedbackFixIts withholds credit point ' + point);
      }
    }
    for (const ce of feedback.commonErrors) {
      assert.ok(!fixIts.includes(ce.fixIt.corrected),
        stem + ': renderFeedbackFixIts withholds corrected working ' + ce.fixIt.corrected);
    }
  });
}
