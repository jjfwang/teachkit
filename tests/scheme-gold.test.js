/* animath gold scheme of work gate tests (issue #1292, slice 2 of
 * #1289). Pins the six-strand subset gate for Phase E1: one
 * hand-authored gold scheme in samples/schemes/ per Phase A gate
 * strand (primary math, primary science, secondary E-math, secondary
 * physics, JC H2 math, JC H2 biology), filed under the gate topic's
 * notes stem. A scheme is unit-level: each scheme sequences at least
 * 3 topics from its own level and subject track in
 * generator/syllabus.js order, every prerequisite names an earlier
 * entry, every sequenced topic resolves via resolveSyllabusTopic to
 * the scheme's level and subject, and every sequenced topic carries
 * gold notes (a samples/notes file whose topic field is the slug).
 * Each scheme must validate clean against validateScheme and render
 * in full via renderScheme - header plus every entry's week, topic,
 * lessons, prerequisites and assessment points; a scheme holds no
 * answers, so there is no answer-key renderer.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const validate = require('../player/validate.js');
const printable = require('../player/printable.js');
const { SYLLABUS, resolveSyllabusTopic } = require('../generator/syllabus.js');

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

function goldNotesFor(scheme, topic) {
  return NOTES.find((n) => n.topic === topic && n.level === scheme.level && n.subject === scheme.subject);
}

function trackFor(scheme) {
  const level = SYLLABUS.levels.find((l) => l.id === scheme.level);
  return level.tracks.find((t) => t.subject === scheme.subject &&
    scheme.sequence.every((e) => t.topics.some((topic) => topic.slug === e.topic)));
}

for (const stem of STEMS) {
  test('gold scheme ' + stem + ': validates clean, sequences its track in order, renders in full', () => {
    const scheme = load('samples/schemes/' + stem + '.json');
    const gateNotes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateScheme(scheme), [],
      stem + ': validateScheme reports zero errors');
    assert.equal(scheme.level, gateNotes.level, stem + ': level matches the gate notes');
    assert.equal(scheme.subject, gateNotes.subject, stem + ': subject matches the gate notes');
    assert.ok(scheme.sequence.length >= 3, stem + ': sequences at least 3 topics');
    assert.ok(scheme.sequence.some((e) => e.topic === gateNotes.topic),
      stem + ': sequence includes the gate topic ' + gateNotes.topic);

    // Derivation pins: track order, resolution, gold-notes pairing.
    const track = trackFor(scheme);
    assert.ok(track, stem + ': syllabus track exists for level and subject');
    const order = scheme.sequence.map((e) => track.topics.findIndex((t) => t.slug === e.topic));
    order.forEach((idx, i) => {
      assert.ok(idx >= 0, stem + ': topic ' + scheme.sequence[i].topic + ' is on the track');
      if (i > 0) assert.ok(idx > order[i - 1], stem + ': sequence follows syllabus track order');
    });
    const seen = [];
    for (const entry of scheme.sequence) {
      for (const pre of entry.prerequisites) {
        assert.ok(seen.includes(pre), stem + ': prerequisite ' + pre + ' names an earlier entry');
      }
      seen.push(entry.topic);
      const resolved = resolveSyllabusTopic(entry.topic);
      assert.equal(resolved.topic, entry.topic, stem + ': topic resolves via resolveSyllabusTopic');
      assert.equal(resolved.level, scheme.level, stem + ': resolved level matches');
      assert.equal(resolved.subject, scheme.subject, stem + ': resolved subject matches');
      assert.ok(goldNotesFor(scheme, entry.topic),
        stem + ': topic ' + entry.topic + ' carries gold notes under the same slug');
    }

    // Full rendering: no field withheld, and no answer-key renderer.
    assert.equal(printable.renderSchemeAnswerKey, undefined,
      stem + ': no renderSchemeAnswerKey exists (a scheme holds no answers)');
    const html = printable.renderScheme(scheme);
    for (const text of [scheme.title, scheme.subject, scheme.unitTitle, scheme.level, scheme.term, String(scheme.weeks)]) {
      assert.ok(html.includes(text), stem + ': render shows header field ' + text);
    }
    for (const entry of scheme.sequence) {
      assert.ok(html.includes('Week ' + entry.week + ': ' + entry.topic),
        stem + ': render shows week and topic for ' + entry.topic);
      assert.ok(html.includes('Lessons: ' + entry.lessons),
        stem + ': render shows lessons for ' + entry.topic);
      for (const pre of entry.prerequisites) {
        assert.ok(html.includes(pre), stem + ': render shows prerequisite ' + pre);
      }
      for (const point of entry.assessmentPoints) {
        assert.ok(html.includes(point.kind + ': ' + point.title),
          stem + ': render shows assessment point ' + point.title);
      }
    }
  });
}
