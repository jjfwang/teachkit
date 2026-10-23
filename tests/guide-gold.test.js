/* animath gold guide gate tests (issue #1304, slice 2 of
 * #1301). Pins the six-strand subset gate for Phase E3: one
 * hand-authored gold guide material in samples/guides/ per
 * Phase A gate strand (primary math, primary science, secondary
 * E-math, secondary physics, JC H2 math, JC H2 biology), filed
 * under the same filename as the paired gold scheme. The header
 * (title, level, subject, unitTitle, term) and topics equal the
 * paired gold scheme verbatim, topics in scheme sequence order.
 * Every key idea's term is verbatim a definition term in one of
 * the sequenced topics' paired gold notes and its explanation
 * equals that definition's meaning verbatim. Every trap's
 * misconception is verbatim from a sequenced topic's paired
 * notes trap or the gate topic's paired feedback commonErrors.
 * Every parent question is verbatim a prompt from the gate
 * topic's paired gold quiz bank or exit ticket and its answer
 * equals that item's answer verbatim. Every revision plan
 * dayOffset equals a practiceSets dayOffset in the gate topic's
 * paired gold revision. Each material must validate clean
 * against validateGuide, render in full via renderGuide (the
 * parent sheet, answers included), and render via
 * renderGuideStudent (the student sheet: everything except the
 * parent question answers, which it never carries).
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
  'jc-h2-cell-bio'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

const NOTES = fs.readdirSync(path.join(__dirname, '..', 'samples/notes'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => load('samples/notes/' + f));

function goldNotesFor(guide, topic) {
  return NOTES.find((n) => n.topic === topic &&
    n.level === guide.level && n.subject === guide.subject);
}

function ticketAnswer(q) {
  if (q.workedSolution) return q.workedSolution;
  if (q.choices) {
    const correct = q.choices.find((c) => c.correct === true);
    return correct ? correct.text : undefined;
  }
  return q.answer;
}

for (const stem of STEMS) {
  test('gold guide ' + stem + ': validates clean, derives verbatim, renders in full and student sheet withholds answers', () => {
    const guide = load('samples/guides/' + stem + '.json');
    const scheme = load('samples/schemes/' + stem + '.json');
    const gateNotes = load('samples/notes/' + stem + '.json');
    const feedback = load('samples/feedback/' + stem + '.json');
    const quizBank = load('samples/quiz-banks/' + stem + '.json');
    const ticket = load('samples/tickets/' + stem + '.json');
    const revision = load('samples/revision/' + stem + '.json');

    assert.deepEqual(validate.validateGuide(guide), [],
      stem + ': validateGuide reports zero errors');

    // Header and topics equal the paired scheme verbatim, in order.
    for (const field of ['title', 'level', 'subject', 'unitTitle', 'term']) {
      assert.equal(guide[field], scheme[field],
        stem + ': ' + field + ' equals the paired scheme verbatim');
    }
    assert.deepEqual(guide.topics, scheme.sequence.map((e) => e.topic),
      stem + ': topics equal the scheme sequence topics in order');
    assert.equal(guide.level, gateNotes.level, stem + ': level matches the gate notes');
    assert.equal(guide.subject, gateNotes.subject, stem + ': subject matches the gate notes');

    const sequencedNotes = guide.topics.map((topic) => {
      const notes = goldNotesFor(guide, topic);
      assert.ok(notes, stem + ': sequenced topic ' + topic + ' carries gold notes');
      return notes;
    });

    // Key ideas derive verbatim from sequenced topics' notes definitions.
    assert.ok(guide.keyIdeas.length >= 2, stem + ': at least 2 key ideas');
    for (const idea of guide.keyIdeas) {
      const src = sequencedNotes.find((notes) =>
        notes.definitions.some((d) => d.term === idea.term && d.meaning === idea.explanation));
      assert.ok(src, stem + ': key idea derives verbatim from a sequenced notes definition: ' + idea.term);
    }

    // Traps derive verbatim from sequenced notes traps or gate feedback errors.
    const trapUnion = new Set();
    for (const notes of sequencedNotes) trapUnion.add(notes.trap.misconception);
    for (const ce of feedback.commonErrors) trapUnion.add(ce.misconception);
    assert.ok(guide.traps.length >= 1, stem + ': at least 1 trap');
    for (const trap of guide.traps) {
      assert.ok(trapUnion.has(trap.misconception),
        stem + ': trap misconception is verbatim from a sequenced notes trap or gate feedback: ' + trap.misconception);
    }

    // Parent questions derive verbatim from the gate quiz bank or exit ticket.
    const questionSources = [];
    for (const item of quizBank.items) questionSources.push([item.prompt, item.answer]);
    for (const q of ticket.questions) questionSources.push([q.prompt, ticketAnswer(q)]);
    assert.ok(guide.parentQuestions.length >= 2, stem + ': at least 2 parent questions');
    for (const pq of guide.parentQuestions) {
      const src = questionSources.find(([q, a]) => q === pq.question && a === pq.answer);
      assert.ok(src, stem + ': parent question and answer derive verbatim from the gate quiz bank or exit ticket: ' + pq.question);
    }

    // Revision plan dayOffsets equal gate revision practiceSet dayOffsets.
    const dayOffsets = new Set(revision.practiceSets.map((ps) => ps.dayOffset));
    assert.ok(guide.revisionPlan.length >= 1, stem + ': at least 1 revision plan entry');
    for (const entry of guide.revisionPlan) {
      assert.ok(dayOffsets.has(entry.dayOffset),
        stem + ': revision plan dayOffset ' + entry.dayOffset + ' is a gate revision practiceSet dayOffset');
    }

    // Parent rendering: no field withheld, answers included.
    const html = printable.renderGuide(guide);
    for (const text of [guide.title, guide.level, guide.subject, guide.unitTitle, guide.term]) {
      assert.ok(html.includes(printable.escapeHtml(text)), stem + ': renderGuide shows header field ' + text);
    }
    for (const line of guide.overview) {
      assert.ok(html.includes(printable.escapeHtml(line)), stem + ': renderGuide shows overview line ' + line);
    }
    for (const topic of guide.topics) {
      assert.ok(html.includes(printable.escapeHtml(topic)), stem + ': renderGuide shows topic ' + topic);
    }
    for (const idea of guide.keyIdeas) {
      assert.ok(html.includes(printable.escapeHtml(idea.term)), stem + ': renderGuide shows key idea term ' + idea.term);
      assert.ok(html.includes(printable.escapeHtml(idea.explanation)), stem + ': renderGuide shows key idea explanation ' + idea.explanation);
    }
    for (const entry of guide.revisionPlan) {
      assert.ok(html.includes(printable.escapeHtml(entry.focus)), stem + ': renderGuide shows revision focus ' + entry.focus);
    }
    for (const trap of guide.traps) {
      assert.ok(html.includes(printable.escapeHtml(trap.misconception)), stem + ': renderGuide shows misconception ' + trap.misconception);
      assert.ok(html.includes(printable.escapeHtml(trap.watchFor)), stem + ': renderGuide shows watch-for ' + trap.watchFor);
    }
    for (const pq of guide.parentQuestions) {
      assert.ok(html.includes(printable.escapeHtml(pq.question)), stem + ': renderGuide shows parent question ' + pq.question);
      assert.ok(html.includes(printable.escapeHtml(pq.answer)), stem + ': renderGuide shows parent answer ' + pq.answer);
    }

    // Student rendering: everything except the answers.
    const student = printable.renderGuideStudent(guide);
    for (const text of [guide.title, guide.level, guide.subject, guide.unitTitle, guide.term]) {
      assert.ok(student.includes(printable.escapeHtml(text)), stem + ': renderGuideStudent shows header field ' + text);
    }
    for (const idea of guide.keyIdeas) {
      assert.ok(student.includes(printable.escapeHtml(idea.term)), stem + ': renderGuideStudent shows key idea term ' + idea.term);
      assert.ok(student.includes(printable.escapeHtml(idea.explanation)), stem + ': renderGuideStudent shows key idea explanation ' + idea.explanation);
    }
    for (const trap of guide.traps) {
      assert.ok(student.includes(printable.escapeHtml(trap.misconception)), stem + ': renderGuideStudent shows misconception ' + trap.misconception);
    }
    for (const pq of guide.parentQuestions) {
      assert.ok(student.includes(printable.escapeHtml(pq.question)), stem + ': renderGuideStudent shows parent question ' + pq.question);
      assert.ok(!student.includes(pq.answer) && !student.includes(printable.escapeHtml(pq.answer)),
        stem + ': renderGuideStudent withholds parent answer ' + pq.answer);
    }
  });
}
