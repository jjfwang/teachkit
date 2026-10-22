/* Pack metadata tests (issue #1221, slice 1 of #1207, Phase A3).
 * Guards: validatePackMetadata in player/validate.js (every branch),
 * topicFacts in generator/syllabus.js (the six Phase A gate topics carry
 * recorded facts; other topics default; unknown ids throw), and the
 * deterministic metadata block generateLessonPack emits on every pack
 * manifest (syllabus-resolved facts when the topic resolves, a valid
 * empty block when it does not; no LLM authoring). deps.callChat is
 * stubbed throughout with the water-cycle gold materials.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validatePackMetadata } = require('../player/validate.js');
const { topicFacts } = require('../generator/syllabus.js');
const PIPELINE = require('../generator/pipeline.js');
const pkg = require('../package.json');

function validMetadata() {
  return {
    syllabusYear: 2023,
    outcomeCodes: [{ code: 'PSCI-2023-WATER-CYCLE', title: 'Water cycle' }],
    assessmentObjectives: [],
    aiGenerated: { label: 'AI-generated', model: 'stub-model', generatorVersion: '1.2.3' },
    review: null,
    moderation: { state: 'unreviewed' }
  };
}

test('validatePackMetadata: a well-formed block validates clean', () => {
  assert.deepEqual(validatePackMetadata(validMetadata()), []);
  const signed = validMetadata();
  signed.syllabusYear = null;
  signed.review = { reviewer: 'A. Teacher', reviewDate: '2026-10-23' };
  signed.moderation = { state: 'approved' };
  assert.deepEqual(validatePackMetadata(signed), []);
});

test('validatePackMetadata: non-object metadata is rejected', () => {
  assert.deepEqual(validatePackMetadata(null), ['metadata: must be an object']);
  assert.deepEqual(validatePackMetadata('x'), ['metadata: must be an object']);
  assert.deepEqual(validatePackMetadata([]), ['metadata: must be an object']);
});

test('validatePackMetadata: syllabusYear must be null or a positive integer', () => {
  for (const bad of ['2023', 2023.5, 0, -1, undefined]) {
    const md = validMetadata();
    md.syllabusYear = bad;
    assert.deepEqual(validatePackMetadata(md),
      ['metadata.syllabusYear: must be null or a positive integer year'], String(bad));
  }
});

test('validatePackMetadata: code lists must be arrays of code/title objects', () => {
  const md = validMetadata();
  md.outcomeCodes = 'nope';
  md.assessmentObjectives = [null, { code: '', title: 'T' }, { code: 'C' }, ['x']];
  assert.deepEqual(validatePackMetadata(md), [
    'metadata.outcomeCodes: required array',
    'metadata.assessmentObjectives[0]: must be an object',
    'metadata.assessmentObjectives[1].code: required non-empty string',
    'metadata.assessmentObjectives[2].title: required non-empty string',
    'metadata.assessmentObjectives[3]: must be an object'
  ]);
});

test('validatePackMetadata: aiGenerated label, model and version are required', () => {
  const missing = validMetadata();
  missing.aiGenerated = null;
  assert.deepEqual(validatePackMetadata(missing), ['metadata.aiGenerated: must be an object']);
  const blank = validMetadata();
  blank.aiGenerated = { label: ' ', model: '', generatorVersion: 7 };
  assert.deepEqual(validatePackMetadata(blank), [
    'metadata.aiGenerated.label: required non-empty string',
    'metadata.aiGenerated.model: required non-empty string',
    'metadata.aiGenerated.generatorVersion: required non-empty string'
  ]);
});

test('validatePackMetadata: review is null or a complete sign-off object', () => {
  const badShape = validMetadata();
  badShape.review = 'pending';
  assert.deepEqual(validatePackMetadata(badShape), ['metadata.review: must be null or an object']);
  const blank = validMetadata();
  blank.review = { reviewer: '', reviewDate: ' ' };
  assert.deepEqual(validatePackMetadata(blank), [
    'metadata.review.reviewer: required non-empty string',
    'metadata.review.reviewDate: required non-empty string'
  ]);
});

test('validatePackMetadata: moderation state is enumerated', () => {
  const missing = validMetadata();
  missing.moderation = [];
  assert.deepEqual(validatePackMetadata(missing), ['metadata.moderation: must be an object']);
  const bad = validMetadata();
  bad.moderation = { state: 'done' };
  assert.deepEqual(validatePackMetadata(bad),
    ['metadata.moderation.state: must be one of unreviewed|in-moderation|approved|rejected']);
  for (const ok of ['unreviewed', 'in-moderation', 'approved', 'rejected']) {
    const md = validMetadata();
    md.moderation = { state: ok };
    assert.deepEqual(validatePackMetadata(md), [], ok);
  }
});

test('topicFacts: the six gate topics carry recorded facts', () => {
  assert.deepEqual(topicFacts('fractions'), {
    syllabusYear: 2021,
    outcomeCodes: [{ code: 'PMATH-2021-FRACTIONS', title: 'Fractions' }],
    assessmentObjectives: []
  });
  assert.deepEqual(topicFacts('water-cycle'), {
    syllabusYear: 2023,
    outcomeCodes: [{ code: 'PSCI-2023-WATER-CYCLE', title: 'Water cycle' }],
    assessmentObjectives: []
  });
  assert.deepEqual(topicFacts('secondary/e-math/e-algebra'), {
    syllabusYear: 2020,
    outcomeCodes: [{ code: '4052-ALGEBRA', title: 'Algebra' }],
    assessmentObjectives: [
      { code: 'AO1', title: 'Knowledge and understanding' },
      { code: 'AO2', title: 'Handling information and solving problems' }
    ]
  });
  assert.deepEqual(topicFacts('phys-energy').assessmentObjectives.length, 3);
  assert.deepEqual(topicFacts('h2-differentiation').outcomeCodes,
    [{ code: '9758-DIFFERENTIATION', title: 'Differentiation' }]);
  assert.deepEqual(topicFacts('h2-cell-bio').syllabusYear, 2016);
});

test('topicFacts: topics without recorded facts default, copies are fresh, unknown throws', () => {
  assert.deepEqual(topicFacts('whole-numbers'),
    { syllabusYear: null, outcomeCodes: [], assessmentObjectives: [] });
  const a = topicFacts('water-cycle');
  a.outcomeCodes.push({ code: 'X', title: 'Y' });
  assert.equal(topicFacts('water-cycle').outcomeCodes.length, 1, 'returned lists are fresh copies');
  assert.throws(() => topicFacts('no-such-topic'), /unknown syllabus id/);
});

/* --- generateLessonPack emission, stubbed with the gold materials --- */

function gold(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}
const GOLD = {
  animation: gold('samples/primary-science-water-cycle.json'),
  slides: gold('samples/decks/primary-science-water-cycle.json'),
  worksheet: gold('samples/worksheets/primary-science-water-cycle.json'),
  notes: gold('samples/notes/primary-science-water-cycle.json'),
  exitTicket: gold('samples/tickets/primary-science-water-cycle.json'),
  script: gold('samples/scripts/primary-science-water-cycle.json'),
  lessonPlan: gold('samples/plans/primary-science-water-cycle.json'),
  scaffolds: gold('samples/scaffolds/primary-science-water-cycle.json')
};
const TRANSITIONS_TEXT = JSON.stringify([
  { name: 'evaporation', from_state: 'liquid water', to_state: 'water vapour', driver: "the sun's heat" },
  { name: 'condensation', from_state: 'water vapour', to_state: 'liquid droplets', driver: 'cooling' }
]);

function route(system) {
  if (system.indexOf('topic unpacker') !== -1) return TRANSITIONS_TEXT;
  if (system.indexOf('animation author') !== -1) return JSON.stringify(GOLD.animation);
  if (system.indexOf('slide-deck author') !== -1) return JSON.stringify(GOLD.slides);
  if (system.indexOf('worksheet author') !== -1) return JSON.stringify(GOLD.worksheet);
  if (system.indexOf('notes author') !== -1) return JSON.stringify(GOLD.notes);
  if (system.indexOf('exit-ticket author') !== -1) return JSON.stringify(GOLD.exitTicket);
  if (system.indexOf('script author') !== -1) return JSON.stringify(GOLD.script);
  if (system.indexOf('lesson plan author') !== -1) return JSON.stringify(GOLD.lessonPlan);
  if (system.indexOf('scaffolds author') !== -1) return JSON.stringify(GOLD.scaffolds);
  throw new Error('unrouted system prompt: ' + system.slice(0, 60));
}
const callChat = (system) => Promise.resolve(route(system));

test('generateLessonPackForSyllabus: manifest metadata carries the resolved topic facts', async () => {
  PIPELINE.clearPackCache();
  const pack = await PIPELINE.generateLessonPackForSyllabus('water-cycle', {}, { callChat });
  assert.deepEqual(pack.manifest.metadata, {
    syllabusYear: 2023,
    outcomeCodes: [{ code: 'PSCI-2023-WATER-CYCLE', title: 'Water cycle' }],
    assessmentObjectives: [],
    aiGenerated: { label: 'AI-generated', model: 'unknown', generatorVersion: pkg.version },
    review: null,
    moderation: { state: 'unreviewed' }
  });
  assert.deepEqual(validatePackMetadata(pack.manifest.metadata), []);
});

test('generateLessonPack: slugified topic resolves facts and opts.model is recorded', async () => {
  PIPELINE.clearPackCache();
  const pack = await PIPELINE.generateLessonPack(
    { topic: 'Water Cycle!', level: 'Primary Science', subject: 'Science', model: 'stub-model-1' },
    { callChat });
  assert.equal(pack.manifest.metadata.syllabusYear, 2023);
  assert.deepEqual(pack.manifest.metadata.outcomeCodes,
    [{ code: 'PSCI-2023-WATER-CYCLE', title: 'Water cycle' }]);
  assert.equal(pack.manifest.metadata.aiGenerated.model, 'stub-model-1');
  assert.deepEqual(validatePackMetadata(pack.manifest.metadata), []);
});

test('generateLessonPack: an unresolved topic still emits a valid metadata block', async () => {
  PIPELINE.clearPackCache();
  const pack = await PIPELINE.generateLessonPack(
    { topic: 'The Water Cycle', topicLabel: 'Water cycle', level: 'Primary Science', subject: 'Science' },
    { callChat });
  assert.deepEqual(pack.manifest.metadata, {
    syllabusYear: null,
    outcomeCodes: [],
    assessmentObjectives: [],
    aiGenerated: { label: 'AI-generated', model: 'unknown', generatorVersion: pkg.version },
    review: null,
    moderation: { state: 'unreviewed' }
  });
  assert.deepEqual(validatePackMetadata(pack.manifest.metadata), []);
});
