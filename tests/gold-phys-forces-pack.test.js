/* animath gold phys-forces-pack tests - zero dependencies, Node built-in test runner.
 * Run: node --test "tests/*.test.js"
 *
 * Guards issue #1031: the hand-authored gold lesson pack for a secondary
 * topic (secondary Physics forces) - deck, worksheet, exit ticket,
 * student notes and teacher script under
 * samples/{decks,worksheets,tickets,notes,scripts}/, mirroring the
 * phys-forces gold and keyed to the phys-forces animation
 * (samples/secondary-physics-forces.json) and the bank beat
 * MISCONCEPTIONS['phys-forces'].
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

const animation = load('samples/secondary-physics-forces.json');
const deck = load('samples/decks/secondary-physics-forces.json');
const worksheet = load('samples/worksheets/secondary-physics-forces.json');
const ticket = load('samples/tickets/secondary-physics-forces.json');
const notes = load('samples/notes/secondary-physics-forces.json');
const script = load('samples/scripts/secondary-physics-forces.json');

const BANK_BEAT = MISCONCEPTIONS['phys-forces'];
const TITLE = 'Forces: friction, moments and pressure';
const EXPECTED_KINDS = ['title', 'objective', 'hook', 'concept', 'mechanism',
  'mechanism', 'mechanism', 'mechanism',
  'example', 'practice', 'exit-ticket'];
const SCENE_IDS = animation.scenes.map((s) => s.id);

/* Envelope + animation grounding */

test('phys-forces animation carries scenes s1 to s4 with the brief captions', () => {
  assert.deepEqual(SCENE_IDS, ['s1', 's2', 's3', 's4']);
  assert.deepEqual(animation.scenes.map((s) => s.caption), [
    'Friction opposes relative motion',
    'Moments: force times distance from the pivot',
    'Pressure: the same force on different areas',
    'Check the thinking'
  ]);
  assert.equal(animation.title, TITLE);
  assert.equal(animation.topic, 'phys-forces');
  assert.equal(animation.level, 'secondary');
  assert.equal(animation.subject, 'science');
});

test('all five gold materials share the phys-forces envelope', () => {
  for (const [name, spec] of Object.entries({ deck, worksheet, ticket, notes, script })) {
    assert.equal(spec.level, 'secondary', name + ' level');
    assert.equal(spec.subject, 'science', name + ' subject');
    assert.equal(spec.topic, 'phys-forces', name + ' topic');
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

test('gold phys-forces deck kind sequence is the 11-slide structure', () => {
  assert.equal(deck.slides.length, 11);
  assert.deepEqual(deck.slides.map((s) => s.kind), EXPECTED_KINDS);
});

test('gold phys-forces deck mechanism visuals are s1 to s4, all real animation scenes', () => {
  const mech = deck.slides.filter((s) => s.kind === 'mechanism');
  assert.deepEqual(mech.map((s) => s.visual), ['s1', 's2', 's3', 's4']);
  assert.deepEqual(mech.map((s) => s.heading), animation.scenes.map((s) => s.caption));
  for (const v of mech.map((s) => s.visual)) {
    assert.ok(SCENE_IDS.includes(v), 'visual ' + v + ' is a real animation scene id');
  }
});

test('every gold phys-forces deck slide has a heading, 1-3 bullets and speaker notes', () => {
  for (const slide of deck.slides) {
    assert.ok(slide.heading && slide.heading.trim(), 'slide heading present');
    assert.ok(Array.isArray(slide.bullets) && slide.bullets.length >= 1 && slide.bullets.length <= 3,
      'slide has 1-3 bullets');
    assert.ok(slide.notes && slide.notes.trim(), 'slide has speaker notes');
  }
});

test('gold phys-forces deck keeps the bank wrong turn out of the slides', () => {
  assert.ok(!JSON.stringify(deck).includes(BANK_BEAT.wrongTurn),
    'deck does not carry the bank wrong turn verbatim');
});

/* Worksheet */

test('gold phys-forces worksheet has 5 mixed questions, each with an explanation', () => {
  assert.equal(worksheet.questions.length, 5);
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

test('gold phys-forces worksheet encodes the bank misconception in a multiple-choice question', () => {
  const hit = worksheet.questions.find((q) => q.kind === 'multiple-choice'
    && q.misconception === BANK_BEAT.wrongTurn);
  assert.ok(hit, 'a multiple-choice question carries the bank wrong turn as its misconception');
  assert.equal(hit.misconception, BANK_BEAT.wrongTurn);
  assert.ok(hit.explanation.includes(BANK_BEAT.wrongTurn),
    'the question explanation includes the bank wrong turn verbatim');
});

/* Exit ticket */

test('gold phys-forces ticket has 4 mixed questions, each with feedback', () => {
  assert.equal(ticket.questions.length, 4);
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

test('gold phys-forces ticket keys a question to the bank misconception with a reteach point', () => {
  const keyed = ticket.questions.find((q) => q.misconception === BANK_BEAT.wrongTurn);
  assert.ok(keyed, 'a ticket question misconception equals the bank wrong turn verbatim');
  assert.ok(keyed.feedback.includes(BANK_BEAT.wrongTurn),
    'the keyed question feedback names the bank wrong turn verbatim');
  assert.ok(keyed.feedback.includes(BANK_BEAT.correctTurn),
    'the keyed question feedback carries the bank correct turn verbatim');
});

/* Notes */

test('gold phys-forces notes carry 4 mechanism steps, a worked example and the bank trap', () => {
  assert.ok(notes.objectives.length >= 1);
  const terms = notes.definitions.map((d) => d.term.toLowerCase());
  for (const term of ['friction', 'net force', 'moment', 'pivot', 'pressure', 'pascal']) {
    assert.ok(terms.includes(term), 'definitions include ' + term);
  }
  for (const d of notes.definitions) {
    assert.ok(d.meaning && d.meaning.trim(), 'definition ' + d.term + ' has a meaning');
  }
  assert.equal(notes.mechanismSteps.length, 4, 'one mechanism step per animation scene');
  assert.ok(notes.workedExample && notes.workedExample.trim(), 'worked example present');
  assert.ok(notes.workedExample.includes('force / area = 200 / 0.5 = 400 Pa'),
    'worked example shows the pressure calculation for the wide face');
  assert.equal(notes.trap.misconception, BANK_BEAT.wrongTurn);
  assert.ok(notes.trap.explanation.includes(BANK_BEAT.why),
    'trap explanation includes the bank why verbatim');
  assert.ok(notes.trap.explanation.includes(BANK_BEAT.correctTurn),
    'trap explanation includes the bank correct turn verbatim');
});

/* Script */

test('gold phys-forces script segments are timed inside 5-120 and every segment says something', () => {
  const total = script.segments.reduce((sum, s) => sum + s.minutes, 0);
  assert.ok(total >= 5 && total <= 120, 'script minutes sum ' + total + ' is inside 5-120');
  for (const s of script.segments) {
    assert.ok(s.say && s.say.trim(), 'segment has required say text');
    assert.ok(Array.isArray(s.questions) && s.questions.length >= 1
      && s.questions.every((q) => q && q.trim()), 'segment has non-empty questions');
  }
});

test('gold phys-forces script scene-like cues are real animation scene ids covering s1 to s4', () => {
  for (const s of script.segments) {
    if (s.cue && /^s\d+$/.test(s.cue)) {
      assert.ok(SCENE_IDS.includes(s.cue), 'cue ' + s.cue + ' is a real animation scene id');
    }
  }
  assert.deepEqual(script.segments.map((s) => s.cue), ['s1', 's2', 's3', 's4']);
  const cues = script.segments.map((s) => s.cue);
  assert.ok(cues.includes('s1') && cues.includes('s4'), 'script cues cover the first and last scenes');
});

test('gold phys-forces script watches for the bank misconception verbatim only on the final s4 segment', () => {
  const watchers = script.segments.filter((s) => s.watchFor && s.watchFor.includes(BANK_BEAT.wrongTurn));
  assert.equal(watchers.length, 1, 'exactly one watchFor includes the bank wrong turn verbatim');
  assert.equal(watchers[0].cue, 's4', 'the s4 segment watches for the bank wrong turn');
  assert.equal(script.segments[script.segments.length - 1].cue, 's4', 'the watcher segment is the final segment');
  assert.equal(watchers[0], script.segments[script.segments.length - 1],
    'the watcher is the final segment');
  assert.ok(watchers[0].watchFor.includes(BANK_BEAT.correctTurn),
    'the watcher carries the bank correct turn verbatim');
  const text = JSON.stringify(script);
  assert.ok(text.includes('worksheet') && text.includes('student notes') && text.includes('exit ticket'),
    'script cues and questions cover the other materials');
});

/* CHANGELOG */

test('CHANGELOG carries exactly one entry for the phys-forces gold lesson pack', () => {
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const count = changelog.split('phys-forces gold lesson pack').length - 1;
  assert.equal(count, 1, 'exactly one CHANGELOG entry names the phys-forces gold lesson pack');
});
