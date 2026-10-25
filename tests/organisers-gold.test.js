/* animath gold organisers gate tests (issue #1281, slice 2 of #1276).
 * Pins the six-topic subset gate for Phase D2: one hand-authored gold
 * organisers file in samples/organisers/ per Phase A gate topic, under
 * the same filename as its paired gold notes and gold revision. Each
 * must validate clean against validateOrganisers, echo its paired
 * notes on title / level / subject / topic, and be derived verbatim -
 * never free-authored: the flow template's slot entries are the paired
 * notes mechanismSteps in order, and every other template's entries
 * are drawn verbatim from the paired notes mechanismSteps and
 * definitions (a frayer slot carries a notes definition term as its
 * label and its meaning as its entry). The student sheet shows slot
 * labels and studentPrompts only (no slot entry), while the key shows
 * every entry. Pack-demo wiring for the six gate packs is pinned too.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const validate = require('../player/validate.js');
const printable = require('../player/printable.js');

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
  'jc-h2-complex'
];

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

for (const stem of STEMS) {
  test('gold organisers ' + stem + ': validates clean, derived verbatim, withholds on the student sheet', () => {
    const org = load('samples/organisers/' + stem + '.json');
    const notes = load('samples/notes/' + stem + '.json');

    assert.deepEqual(validate.validateOrganisers(org), [],
      stem + ': validateOrganisers reports zero errors');
    for (const field of ['title', 'level', 'subject', 'topic']) {
      assert.equal(org[field], notes[field], stem + ': ' + field + ' echoes the gold notes');
    }
    assert.ok(org.templates.length >= 2, stem + ': at least 2 templates');

    const mechSteps = notes.mechanismSteps;
    const defMeanings = new Map(notes.definitions.map((d) => [d.term, d.meaning]));
    const allowedEntries = new Set([...mechSteps, ...notes.definitions.map((d) => d.meaning)]);
    let flowSeen = 0;
    for (const template of org.templates) {
      if (template.kind === 'flow') {
        flowSeen += 1;
        const flowEntries = template.slots.flatMap((slot) => slot.entries);
        assert.deepEqual(flowEntries, mechSteps,
          stem + ': flow entries are the notes mechanismSteps in order');
      }
      for (const slot of template.slots) {
        for (const entry of slot.entries) {
          assert.ok(allowedEntries.has(entry),
            stem + ': every entry is drawn verbatim from the notes mechanismSteps or definitions');
        }
        if (template.kind === 'frayer') {
          assert.ok(defMeanings.has(slot.label),
            stem + ': frayer slot label is a notes definition term verbatim');
          assert.deepEqual(slot.entries, [defMeanings.get(slot.label)],
            stem + ': frayer slot entry is the notes definition meaning verbatim');
        }
      }
    }
    assert.equal(flowSeen, 1, stem + ': exactly one flow template');

    const sheet = printable.renderOrganisers(org);
    const key = printable.renderOrganisersKey(org);
    for (const template of org.templates) {
      for (const slot of template.slots) {
        assert.ok(sheet.includes(esc(slot.label)), stem + ': student sheet shows a slot label');
        if (slot.studentPrompt) {
          assert.ok(sheet.includes(esc(slot.studentPrompt)), stem + ': student sheet shows a studentPrompt');
        }
        for (const entry of slot.entries) {
          assert.ok(!sheet.includes(esc(entry)), stem + ': student sheet never shows a slot entry');
          assert.ok(key.includes(esc(entry)), stem + ': key shows a slot entry');
        }
      }
    }
  });
}

test('gold organisers: renderOrganisers rejects an invalid file and the options argument is honoured', () => {
  const org = load('samples/organisers/primary-science-water-cycle.json');
  assert.throws(() => printable.renderOrganisers({ title: 'x' }), /invalid organisers/);
  assert.throws(() => printable.renderOrganisersKey(null), /invalid organisers/);
  const plain = printable.renderOrganisers(org);
  const enlarged = printable.renderOrganisers(org, { enlargedPrint: true });
  assert.ok(enlarged.includes('pr-enlarged'), 'enlarged option reaches the organisers sheet');
  assert.ok(!plain.includes('pr-enlarged'), 'default rendering carries no variant class');
  const keyPlain = printable.renderOrganisersKey(org);
  const keyUncluttered = printable.renderOrganisersKey(org, { unclutteredLayout: true });
  assert.ok(keyUncluttered.includes('pr-uncluttered'), 'uncluttered option reaches the key');
  assert.ok(!keyPlain.includes('pr-uncluttered'), 'default key carries no variant class');
});

test('gold organisers: pack-demo wires exactly the six gate packs', () => {
  const demo = fs.readFileSync(path.join(__dirname, '..', 'player', 'pack-demo.html'), 'utf8');
  assert.equal(demo.split('../samples/organisers/').length - 1, 6);
  assert.equal(demo.split('AnimathValidate.validateOrganisers(').length - 1, 6);
  assert.equal(demo.split('AnimathPrintable.renderOrganisers(').length - 1, 6);
  assert.equal(demo.split('AnimathPrintable.renderOrganisersKey(').length - 1, 6);
  for (const stem of GATE_STEMS) {
    assert.ok(demo.includes('../samples/organisers/' + stem + '.json'), 'organisers fetch present: ' + stem);
  }
});
