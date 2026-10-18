/* animath gold organic-jc-pack tests - zero dependencies, Node built-in test runner.
 * Run: node --test "tests/*.test.js"
 *
 * Guards issue #899: the hand-authored gold lesson pack for a JC
 * topic (JC H2 chemistry - organic: mechanisms, synthesis and the
 * arrow language) - deck, worksheet, exit ticket, student notes
 * and teacher script under samples/{decks,worksheets,tickets,notes,scripts}/,
 * mirroring the inorganic golds and keyed to the organic
 * animation (samples/jc-h2-organic.json) and the bank beat
 * MISCONCEPTIONS['h2-organic'] primary arrow-direction facet.
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

const animation = load('samples/jc-h2-organic.json');
const deck = load('samples/decks/jc-h2-organic.json');
const worksheet = load('samples/worksheets/jc-h2-organic.json');
const ticket = load('samples/tickets/jc-h2-organic.json');
const notes = load('samples/notes/jc-h2-organic.json');
const script = load('samples/scripts/jc-h2-organic.json');

const BANK_ENTRY = MISCONCEPTIONS['h2-organic'];
const BANK_BEAT = BANK_ENTRY.facets[BANK_ENTRY.primary];
const TITLE = 'JC H2 chemistry \u2014 organic: mechanisms, synthesis and the arrow language';
const EXPECTED_KINDS = ['title', 'objective', 'hook', 'concept', 'mechanism',
  'mechanism', 'mechanism', 'mechanism', 'mechanism', 'mechanism', 'mechanism',
  'mechanism', 'example', 'practice', 'exit-ticket'];
const SCENE_IDS = animation.scenes.map((s) => s.id);

/* Envelope + animation grounding */

test('organic JC animation carries scenes s1 to s8 with the brief captions', () => {
  assert.deepEqual(SCENE_IDS, ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']);
  assert.deepEqual(animation.scenes.map((s) => s.caption), [
    'Alkanes: one CH\u2082 group apart',
    'Functional groups change the family',
    'Electrophilic addition to alkenes',
    'SN1: the slow step comes first',
    'SN2: one step, backside attack',
    'One route, three steps',
    'A common mistake: atoms sliding along the arrow',
    'Organic mechanisms in one page'
  ]);
  assert.equal(animation.title, TITLE);
  assert.equal(animation.topic, 'h2-organic');
  assert.equal(animation.level, 'jc');
  assert.equal(animation.subject, 'science');
});

test('all five gold materials share the JC H2 organic envelope', () => {
  assert.equal(BANK_ENTRY.wrongTurn, undefined, 'faceted entry carries no top-level wrongTurn');
  assert.equal(BANK_ENTRY.primary, 'arrow-direction');
  assert.ok(BANK_ENTRY.facets['arrow-direction'], 'arrow-direction facet exists');
  assert.strictEqual(BANK_BEAT, BANK_ENTRY.facets['arrow-direction']);
  for (const [name, spec] of Object.entries({ deck, worksheet, ticket, notes, script })) {
    assert.equal(spec.level, 'jc', name + ' level');
    assert.equal(spec.subject, 'science', name + ' subject');
    assert.equal(spec.topic, 'h2-organic', name + ' topic');
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

test('gold organic JC deck kind sequence is the 15-slide structure', () => {
  assert.equal(deck.slides.length, 15);
  assert.deepEqual(deck.slides.map((s) => s.kind), EXPECTED_KINDS);
});

test('gold organic JC deck mechanism visuals are s1 to s8, all real animation scenes', () => {
  const mech = deck.slides.filter((s) => s.kind === 'mechanism');
  assert.deepEqual(mech.map((s) => s.visual), ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']);
  assert.deepEqual(mech.map((s) => s.heading), animation.scenes.map((s) => s.caption));
  for (const v of mech.map((s) => s.visual)) {
    assert.ok(SCENE_IDS.includes(v), 'visual ' + v + ' is a real animation scene id');
  }
});

test('every gold organic JC deck slide has a heading, 1-3 bullets and speaker notes', () => {
  for (const slide of deck.slides) {
    assert.ok(slide.heading && slide.heading.trim(), 'slide heading present');
    assert.ok(Array.isArray(slide.bullets) && slide.bullets.length >= 1 && slide.bullets.length <= 3,
      'slide has 1-3 bullets');
    assert.ok(slide.notes && slide.notes.trim(), 'slide has speaker notes');
  }
});

test('gold organic JC deck practice and exit-ticket slides address the arrow-direction wrong turn', () => {
  for (const kind of ['practice', 'exit-ticket']) {
    const slide = deck.slides.find((s) => s.kind === kind);
    const text = [slide.heading].concat(slide.bullets).concat([slide.notes]).join('\n');
    assert.ok(text.includes(BANK_BEAT.wrongTurn), kind + ' slide must name the bank wrong turn verbatim');
  }
});

/* Worksheet */

test('gold organic JC worksheet has 5 mixed questions, each with an explanation', () => {
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

test('gold organic JC worksheet encodes the bank misconception in a multiple-choice question', () => {
  const hit = worksheet.questions.find((q) => q.kind === 'multiple-choice'
    && q.misconception === BANK_BEAT.wrongTurn);
  assert.ok(hit, 'a multiple-choice question carries the bank wrong turn as its misconception');
  assert.equal(hit.misconception, BANK_BEAT.wrongTurn);
  assert.ok(hit.explanation.includes(BANK_BEAT.wrongTurn),
    'the question explanation includes the bank wrong turn verbatim');
});

/* Exit ticket */

test('gold organic JC ticket has 4 mixed questions, each with feedback', () => {
  assert.equal(ticket.questions.length, 4);
  const kinds = new Set(ticket.questions.map((q) => q.kind));
  assert.ok(kinds.has('multiple-choice') && kinds.has('short-answer'), 'ticket mixes question kinds');
  for (const q of ticket.questions) {
    assert.ok(q.feedback && q.feedback.trim(), q.id + ' has non-empty feedback');
  }
});

test('gold organic JC ticket keys a question to the bank misconception with a reteach point', () => {
  const keyed = ticket.questions.find((q) => q.misconception === BANK_BEAT.wrongTurn);
  assert.ok(keyed, 'a ticket question misconception equals the bank wrong turn verbatim');
  assert.ok(keyed.feedback.includes(BANK_BEAT.wrongTurn),
    'the keyed question feedback names the bank wrong turn verbatim');
  assert.ok(keyed.feedback.includes(BANK_BEAT.correctTurn),
    'the keyed question feedback carries the follow-the-electrons reteach point verbatim');
});

/* Notes */

test('gold organic JC notes carry 8 mechanism steps, a worked example and the bank trap', () => {
  assert.ok(notes.objectives.length >= 1);
  const terms = notes.definitions.map((d) => d.term.toLowerCase());
  for (const term of ['homologous series', 'functional group', 'electrophile', 'nucleophile', 'carbocation', 'curly arrow']) {
    assert.ok(terms.includes(term), 'definitions include ' + term);
  }
  for (const d of notes.definitions) {
    assert.ok(d.meaning && d.meaning.trim(), 'definition ' + d.term + ' has a meaning');
  }
  assert.equal(notes.mechanismSteps.length, 8, 'one mechanism step per animation scene');
  notes.mechanismSteps.forEach((step, i) => {
    assert.ok(step.includes(animation.scenes[i].caption),
      'mechanism step ' + (i + 1) + ' carries its scene caption verbatim');
  });
  assert.ok(notes.workedExample.includes('CH2=CH2 + HBr'),
    'worked example shows the ethene addition step');
  assert.ok(notes.workedExample.includes('CH3CH2OH'),
    'worked example carries the ethanol intermediate');
  assert.equal(notes.trap.misconception, BANK_BEAT.wrongTurn);
  assert.ok(notes.trap.explanation.includes(BANK_BEAT.why),
    'trap explanation includes the bank why verbatim');
  assert.ok(notes.trap.explanation.includes(BANK_BEAT.correctTurn),
    'trap explanation includes the bank correct turn verbatim');
});

/* Script */

test('gold organic JC script segments are timed inside 5-120 and every segment says something and asks questions', () => {
  assert.equal(script.segments.length, 8);
  const total = script.segments.reduce((sum, s) => sum + s.minutes, 0);
  assert.ok(total >= 5 && total <= 120, 'script minutes sum ' + total + ' is inside 5-120');
  for (const s of script.segments) {
    assert.ok(s.minutes > 0, 'segment minutes are positive');
    assert.ok(s.say && s.say.trim(), 'segment has required say text');
    assert.ok(Array.isArray(s.questions) && s.questions.length >= 1
      && s.questions.every((q) => q && q.trim()), 'segment has non-empty questions');
  }
});

test('gold organic JC script cues are the animation scene ids s1 to s8 in order', () => {
  assert.deepEqual(script.segments.map((s) => s.cue), ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']);
  for (const s of script.segments) {
    assert.ok(SCENE_IDS.includes(s.cue), 'cue ' + s.cue + ' is a real animation scene id');
  }
});

/* Changelog */

test('CHANGELOG carries exactly one entry for the organic JC gold pack', () => {
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const count = changelog.split('JC H2 organic gold lesson pack').length - 1;
  assert.equal(count, 1, 'exactly one CHANGELOG entry names the organic JC gold pack');
});

test('gold organic JC script watches for the bank misconception verbatim on the final scene', () => {
  const watchers = script.segments.filter((s) => s.watchFor && s.watchFor.includes(BANK_BEAT.wrongTurn));
  assert.equal(watchers.length, 1, 'exactly one watchFor includes the bank wrong turn verbatim');
  assert.equal(watchers[0].cue, 's8', 'the watchFor sits on the final s8 segment only');
  const text = JSON.stringify(script);
  assert.ok(text.includes('worksheet') && text.includes('student notes') && text.includes('exit ticket'),
    'script cues and questions cover the other materials');
});
