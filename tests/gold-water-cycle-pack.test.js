/* animath gold water-cycle-pack tests - zero dependencies, Node built-in test runner.
 * Run: node --test "tests/*.test.js"
 *
 * Guards issue #1077: the hand-authored gold lesson pack for primary
 * science water-cycle - deck, worksheet, exit ticket, student notes and
 * teacher script under samples/{decks,worksheets,tickets,notes,scripts}/,
 * named primary-science-water-cycle to match the animation filename,
 * keyed to the water-cycle animation
 * (samples/primary-science-water-cycle.json) and the bank beat
 * MISCONCEPTIONS['water-cycle'].
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  validateSlides, validateWorksheet, validateExitTicket, validateNotes, validateScript
} = require('../player/validate.js');
const { MISCONCEPTIONS } = require('../generator/misconceptions.js');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

const animation = load('samples/primary-science-water-cycle.json');
const deck = load('samples/decks/primary-science-water-cycle.json');
const worksheet = load('samples/worksheets/primary-science-water-cycle.json');
const ticket = load('samples/tickets/primary-science-water-cycle.json');
const notes = load('samples/notes/primary-science-water-cycle.json');
const script = load('samples/scripts/primary-science-water-cycle.json');

const BANK_BEAT = MISCONCEPTIONS['water-cycle'];
const TITLE = 'The Water Cycle';
const EXPECTED_KINDS = ['title', 'objective', 'hook', 'concept', 'mechanism',
  'mechanism', 'mechanism', 'mechanism', 'example', 'practice', 'exit-ticket'];
const SCENE_IDS = animation.scenes.map((s) => s.id);

/* Envelope + animation grounding */

test('water-cycle animation carries scenes s1 to s4 with the brief captions', () => {
  assert.deepEqual(SCENE_IDS, ['s1', 's2', 's3', 's4']);
  assert.deepEqual(animation.scenes.map((s) => s.caption), [
    'Evaporation: water rises as vapour',
    'Condensation: vapour becomes cloud',
    'Precipitation: water falls as rain',
    'Watch out: water is not gone for good once it evaporates'
  ]);
  assert.equal(animation.title, 'The water cycle');
  assert.equal(animation.topic, 'water-cycle');
  assert.equal(animation.level, 'primary');
  assert.equal(animation.subject, 'science');
});

test('all five gold materials share the water-cycle envelope', () => {
  for (const [name, spec] of Object.entries({ deck, worksheet, ticket, notes, script })) {
    assert.equal(spec.level, 'primary', name + ' level');
    assert.equal(spec.subject, 'science', name + ' subject');
    assert.equal(spec.topic, 'water-cycle', name + ' topic');
  }
  assert.equal(deck.title, TITLE);
  assert.equal(worksheet.title, TITLE);
  assert.equal(notes.title, TITLE);
  assert.equal(script.title, TITLE);
  assert.equal(ticket.title, TITLE + ' Exit Ticket');
});

test('all five gold materials validate with zero errors', () => {
  assert.deepEqual(validateSlides(deck), []);
  assert.deepEqual(validateWorksheet(worksheet), []);
  assert.deepEqual(validateExitTicket(ticket), []);
  assert.deepEqual(validateNotes(notes), []);
  assert.deepEqual(validateScript(script), []);
});

/* Deck */

test('gold water-cycle deck kind sequence is the 11-slide structure', () => {
  assert.equal(deck.slides.length, 11);
  assert.deepEqual(deck.slides.map((s) => s.kind), EXPECTED_KINDS);
});

test('gold water-cycle deck mechanism visuals are s1 to s4, all real animation scenes', () => {
  const mech = deck.slides.filter((s) => s.kind === 'mechanism');
  assert.deepEqual(mech.map((s) => s.visual), ['s1', 's2', 's3', 's4']);
  for (const v of mech.map((s) => s.visual)) {
    assert.ok(SCENE_IDS.includes(v), 'visual ' + v + ' is a real animation scene id');
  }
});

test('every gold water-cycle deck slide has a heading, 1-3 bullets and speaker notes', () => {
  for (const slide of deck.slides) {
    assert.ok(slide.heading && slide.heading.trim(), 'slide heading present');
    assert.ok(Array.isArray(slide.bullets) && slide.bullets.length >= 1 && slide.bullets.length <= 3,
      'slide has 1-3 bullets');
    assert.ok(slide.notes && slide.notes.trim(), 'slide has speaker notes');
  }
});

test('gold water-cycle deck keeps the bank wrong turn out of the slides', () => {
  assert.ok(!JSON.stringify(deck).includes(BANK_BEAT.wrongTurn),
    'deck does not carry the bank wrong turn verbatim');
});

/* Worksheet */

test('gold water-cycle worksheet has 5 mixed questions, each with an explanation', () => {
  assert.equal(worksheet.questions.length, 6);
  assert.deepEqual(worksheet.questions.map((q) => q.id), ['q1', 'q2', 'q3', 'q4', 'q5']);
  const kinds = new Set(worksheet.questions.map((q) => q.kind));
  assert.ok(kinds.has('multiple-choice') && kinds.has('short-answer'), 'worksheet mixes question kinds');
  for (const q of worksheet.questions) {
    assert.ok(q.explanation && q.explanation.trim(), q.id + ' has an explanation');
    if (q.kind === 'multiple-choice') {
      assert.ok(q.choices.length >= 2, q.id + ' has at least 2 choices');
      assert.equal(q.choices.filter((c) => c.correct === true).length, 1,
        q.id + ' has exactly one correct choice');
    }
  }
});

test('gold water-cycle worksheet encodes the bank misconception verbatim', () => {
  const keyed = worksheet.questions.filter((q) => q.misconception === BANK_BEAT.wrongTurn);
  assert.equal(keyed.length, 3, 'three worksheet questions carry the bank wrong turn as misconception');
  const hit = worksheet.questions.find((q) => q.kind === 'multiple-choice'
    && q.misconception === BANK_BEAT.wrongTurn);
  assert.ok(hit, 'a multiple-choice question carries the bank wrong turn as its misconception');
  assert.ok(hit.explanation.includes(BANK_BEAT.wrongTurn),
    'the question explanation includes the bank wrong turn verbatim');
});

/* Exit ticket */

test('gold water-cycle ticket has 4 mixed questions, each with feedback', () => {
  assert.equal(ticket.questions.length, 4);
  assert.deepEqual(ticket.questions.map((q) => q.id), ['q1', 'q2', 'q3', 'q4']);
  const kinds = new Set(ticket.questions.map((q) => q.kind));
  assert.ok(kinds.has('multiple-choice') && kinds.has('short-answer'), 'ticket mixes question kinds');
  for (const q of ticket.questions) {
    assert.ok(q.feedback && q.feedback.trim(), q.id + ' has non-empty feedback');
    if (q.kind === 'multiple-choice') {
      assert.equal(q.choices.filter((c) => c.correct === true).length, 1,
        q.id + ' has exactly one correct choice');
    }
  }
});

test('gold water-cycle ticket keys questions to the bank misconception', () => {
  const keyed = ticket.questions.filter((q) => q.misconception === BANK_BEAT.wrongTurn);
  assert.equal(keyed.length, 2, 'two ticket questions carry the bank wrong turn as misconception');
  assert.ok(keyed[0].feedback.toLowerCase().includes('water disappears for good once it evaporates'),
    'the first keyed question feedback names the misconception');
});

/* Notes */

test('gold water-cycle notes carry 4 mechanism steps, a worked example and the bank trap', () => {
  assert.ok(notes.objectives.length >= 1);
  const terms = notes.definitions.map((d) => d.term.toLowerCase());
  for (const term of ['evaporation', 'water vapour', 'condensation', 'precipitation', 'collection']) {
    assert.ok(terms.includes(term), 'definitions include ' + term);
  }
  for (const d of notes.definitions) {
    assert.ok(d.meaning && d.meaning.trim(), 'definition ' + d.term + ' has a meaning');
  }
  assert.equal(notes.mechanismSteps.length, 4, 'one mechanism step per animation scene');
  assert.ok(notes.workedExample && notes.workedExample.trim(), 'worked example present');
  assert.ok(notes.workedExample.includes('evaporates'),
    'worked example walks the puddle through evaporation');
  assert.equal(notes.trap.misconception, BANK_BEAT.wrongTurn);
  assert.ok(notes.trap.explanation.includes('evaporation changes its form, it never removes it'),
    'trap explanation carries the pack correction verbatim');
});

/* Script */

test('gold water-cycle script segments are timed inside 5-120 and every segment says something', () => {
  assert.equal(script.segments.length, 5);
  const total = script.segments.reduce((sum, s) => sum + s.minutes, 0);
  assert.ok(total >= 5 && total <= 120, 'script minutes sum ' + total + ' is inside 5-120');
  for (const s of script.segments) {
    assert.ok(s.say && s.say.trim(), 'segment has required say text');
    assert.ok(Array.isArray(s.questions) && s.questions.length >= 1
      && s.questions.every((q) => q && q.trim()), 'segment has non-empty questions');
  }
});

test('gold water-cycle script scene-like cues are real animation scene ids', () => {
  for (const s of script.segments) {
    if (s.cue && /^s\d+$/.test(s.cue)) {
      assert.ok(SCENE_IDS.includes(s.cue), 'cue ' + s.cue + ' is a real animation scene id');
    }
  }
  assert.deepEqual(script.segments.map((s) => s.cue),
    ['s1', 's1', 's2', 's3', 'student notes handout']);
});

test('gold water-cycle script watches for the bank misconception verbatim only on the opening s1 segment', () => {
  const watchers = script.segments.filter((s) => s.watchFor && s.watchFor.includes(BANK_BEAT.wrongTurn));
  assert.equal(watchers.length, 1, 'exactly one watchFor includes the bank wrong turn verbatim');
  assert.equal(watchers[0].cue, 's1', 'the opening s1 segment watches for the bank wrong turn');
  assert.equal(watchers[0], script.segments[0], 'the watcher is the first segment');
});

/* CHANGELOG */

test('CHANGELOG carries exactly one entry for the water-cycle gold lesson pack', () => {
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const count = changelog.split('water-cycle gold lesson pack').length - 1;
  assert.equal(count, 1, 'exactly one CHANGELOG entry names the water-cycle gold lesson pack');
});
