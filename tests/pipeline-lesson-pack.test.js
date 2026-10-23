/* animath generateLessonPack pipeline tests — zero network.
 * Guards generator/pipeline.js generateLessonPack (issue #768): ONE
 * shared unpack authors all fourteen materials (animation, slides,
 * worksheet, notes, exit ticket, teacher script, lesson plan, scaffolds,
 * diagnostics, worked examples, quiz bank, revision, organisers, feedback), each through its
 * existing builder + validator + repair discipline; the resolved pack
 * carries a manifest (slug, topic, level, subject, generator version,
 * material keys) and is cached in memory by slug — a repeat call makes
 * zero additional callChat calls, opts.force regenerates, and
 * clearPackCache empties the cache. deps.callChat is stubbed throughout.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PIPELINE = require('../generator/pipeline.js');
const validate = require('../player/validate.js');
const pkg = require('../package.json');

function gold(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
}
const GOLD_ANIMATION = gold('samples/primary-science-water-cycle.json');
const GOLD_DECK = gold('samples/decks/primary-science-water-cycle.json');
const GOLD_WORKSHEET = gold('samples/worksheets/primary-science-water-cycle.json');
const GOLD_NOTES = gold('samples/notes/primary-science-water-cycle.json');
const GOLD_TICKET = gold('samples/tickets/primary-science-water-cycle.json');
const GOLD_SCRIPT = gold('samples/scripts/primary-science-water-cycle.json');
const GOLD_PLAN = gold('samples/plans/primary-science-water-cycle.json');
const GOLD_SCAFFOLDS = gold('samples/scaffolds/primary-science-water-cycle.json');
const GOLD_DIAGNOSTICS = gold('samples/diagnostics/primary-science-water-cycle.json');
const GOLD_WORKED = gold('samples/worked-examples/primary-science-water-cycle.json');
const GOLD_QUIZBANK = gold('samples/quiz-banks/primary-science-water-cycle.json');
const GOLD_REVISION = gold('samples/revision/primary-science-water-cycle.json');
const GOLD_ORGANISERS = gold('samples/organisers/primary-science-water-cycle.json');
const GOLD_FEEDBACK = gold('samples/feedback/primary-science-water-cycle.json');

const TRANSITIONS = [
  { name: 'evaporation', from_state: 'liquid water', to_state: 'water vapour', driver: "the sun's heat" },
  { name: 'condensation', from_state: 'water vapour', to_state: 'liquid droplets', driver: 'cooling' }
];
const TRANSITIONS_TEXT = JSON.stringify(TRANSITIONS);

const OPTS = {
  topic: 'The Water Cycle',
  topicLabel: 'Water cycle',
  level: 'Primary Science',
  subject: 'Science'
};
const EXPECTED_SLUG = 'the-water-cycle-primary-science-science';

function route(system) {
  if (system.indexOf('topic unpacker') !== -1) return TRANSITIONS_TEXT;
  if (system.indexOf('animation author') !== -1) return JSON.stringify(GOLD_ANIMATION);
  if (system.indexOf('slide-deck author') !== -1) return JSON.stringify(GOLD_DECK);
  if (system.indexOf('worksheet author') !== -1) return JSON.stringify(GOLD_WORKSHEET);
  if (system.indexOf('notes author') !== -1) return JSON.stringify(GOLD_NOTES);
  if (system.indexOf('exit-ticket author') !== -1) return JSON.stringify(GOLD_TICKET);
  if (system.indexOf('script author') !== -1) return JSON.stringify(GOLD_SCRIPT);
  if (system.indexOf('lesson plan author') !== -1) return JSON.stringify(GOLD_PLAN);
  if (system.indexOf('scaffolds author') !== -1) return JSON.stringify(GOLD_SCAFFOLDS);
  if (system.indexOf('diagnostics author') !== -1) return JSON.stringify(GOLD_DIAGNOSTICS);
  if (system.indexOf('worked-examples author') !== -1) return JSON.stringify(GOLD_WORKED);
  if (system.indexOf('quiz bank author') !== -1) return JSON.stringify(GOLD_QUIZBANK);
  if (system.indexOf('revision author') !== -1) return JSON.stringify(GOLD_REVISION);
  if (system.indexOf('organisers author') !== -1) return JSON.stringify(GOLD_ORGANISERS);
  if (system.indexOf('feedback author') !== -1) return JSON.stringify(GOLD_FEEDBACK);
  throw new Error('unrouted system prompt: ' + system.slice(0, 60));
}

function stubChat(handler) {
  const calls = [];
  const callChat = (system, user) => {
    calls.push({ system, user });
    return Promise.resolve(handler(system, user, calls.length - 1));
  };
  return { calls, callChat };
}

test('full pack: one unpack, fourteen validate-clean materials, manifest correct', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  const pack = await PIPELINE.generateLessonPack(OPTS, { callChat });

  const unpackCalls = calls.filter((c) => c.system.indexOf('topic unpacker') !== -1);
  assert.equal(unpackCalls.length, 1, 'exactly one shared unpack call');
  assert.equal(calls.length, 15, 'one unpack + fourteen author calls, no repairs');

  assert.deepEqual(validate.validateSpec(pack.animation), [], 'animation validates clean');
  assert.deepEqual(validate.validateSlides(pack.slides), [], 'slides validate clean');
  assert.deepEqual(validate.validateWorksheet(pack.worksheet), [], 'worksheet validates clean');
  assert.deepEqual(validate.validateNotes(pack.notes), [], 'notes validate clean');
  assert.deepEqual(validate.validateExitTicket(pack.exitTicket), [], 'exit ticket validates clean');
  assert.deepEqual(validate.validateScript(pack.script), [], 'script validates clean');
  assert.deepEqual(validate.validateLessonPlan(pack.lessonPlan), [], 'lesson plan validates clean');
  assert.deepEqual(validate.validateScaffolds(pack.scaffolds), [], 'scaffolds validate clean');
  assert.deepEqual(validate.validateDiagnostics(pack.diagnostics), [], 'diagnostics validate clean');
  assert.deepEqual(validate.validateWorkedExamples(pack.workedExamples), [], 'worked examples validate clean');
  assert.deepEqual(validate.validateQuizBank(pack.quizBank), [], 'quiz bank validates clean');
  assert.deepEqual(validate.validateRevision(pack.revision), [], 'revision validates clean');
  assert.deepEqual(validate.validateOrganisers(pack.organisers), [], 'organisers validates clean');
  assert.deepEqual(validate.validateFeedback(pack.feedback), [], 'feedback validates clean');
  assert.deepEqual(pack.animation, GOLD_ANIMATION);
  assert.deepEqual(pack.notes, GOLD_NOTES);
  assert.deepEqual(pack.script, GOLD_SCRIPT);
  assert.deepEqual(pack.lessonPlan, GOLD_PLAN);
  assert.deepEqual(pack.scaffolds, GOLD_SCAFFOLDS);
  assert.deepEqual(pack.diagnostics, GOLD_DIAGNOSTICS);
  assert.deepEqual(pack.workedExamples, GOLD_WORKED);
  assert.deepEqual(pack.quizBank, GOLD_QUIZBANK);
  assert.deepEqual(pack.revision, GOLD_REVISION);
  assert.deepEqual(pack.organisers, GOLD_ORGANISERS);
  assert.deepEqual(pack.feedback, GOLD_FEEDBACK);

  const organisersCalls = calls.filter((c) => c.system.indexOf('organisers author') !== -1);
  assert.equal(organisersCalls.length, 1, 'exactly one organisers author call');
  for (const d of GOLD_NOTES.definitions) {
    assert.ok(organisersCalls[0].user.includes(d.term + ': ' + d.meaning),
      'the organisers prompt carries the pack-authored notes definition for ' + d.term);
  }
  GOLD_NOTES.mechanismSteps.forEach((step, i) => {
    assert.ok(organisersCalls[0].user.includes((i + 1) + '. ' + step),
      'the organisers prompt carries the pack-authored notes mechanism step ' + (i + 1));
  });

  const feedbackCalls = calls.filter((c) => c.system.indexOf('feedback author') !== -1);
  assert.equal(feedbackCalls.length, 1, 'exactly one feedback author call');
  assert.equal(calls[calls.length - 1], feedbackCalls[0], 'the feedback author call is the last call');
  for (const q of GOLD_WORKSHEET.questions) {
    assert.ok(feedbackCalls[0].user.includes(q.prompt),
      'the feedback prompt carries the pack-authored worksheet question: ' + q.prompt);
  }
  for (const q of GOLD_TICKET.questions) {
    assert.ok(feedbackCalls[0].user.includes(q.prompt),
      'the feedback prompt carries the pack-authored exit-ticket question: ' + q.prompt);
  }
  for (const item of GOLD_QUIZBANK.items) {
    assert.ok(feedbackCalls[0].user.includes(item.prompt),
      'the feedback prompt carries the pack-authored quiz-bank item: ' + item.prompt);
  }
  assert.ok(feedbackCalls[0].user.includes('Misconception: ' + GOLD_NOTES.trap.misconception),
    'the feedback prompt carries the pack-authored notes trap misconception');

  assert.equal(pack.manifest.slug, EXPECTED_SLUG, 'slug derived from topic + level + subject');
  assert.equal(pack.manifest.topic, 'The Water Cycle');
  assert.equal(pack.manifest.level, 'Primary Science');
  assert.equal(pack.manifest.subject, 'Science');
  assert.equal(pack.manifest.version, pkg.version, 'manifest names the generator version');
  assert.deepEqual(pack.manifest.materials,
    ['animation', 'slides', 'worksheet', 'notes', 'exitTicket', 'script', 'lessonPlan', 'scaffolds', 'diagnostics', 'workedExamples', 'quizBank', 'revision', 'organisers', 'feedback']);
  assert.deepEqual(Object.keys(pack).sort(),
    ['animation', 'diagnostics', 'exitTicket', 'feedback', 'lessonPlan', 'manifest', 'notes', 'organisers', 'quizBank', 'revision', 'scaffolds', 'script', 'slides', 'workedExamples', 'worksheet'],
    'the pack carries exactly the manifest plus the fourteen materials');
});

test('cache: second identical call makes zero additional callChat calls', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  const first = await PIPELINE.generateLessonPack(OPTS, { callChat });
  const countAfterFirst = calls.length;
  const second = await PIPELINE.generateLessonPack(OPTS, { callChat });
  assert.equal(calls.length, countAfterFirst, 'cached call adds no LLM calls');
  assert.equal(second, first, 'the cached pack object is resolved');
});

test('force: opts.force regenerates and replaces the cached entry', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  const first = await PIPELINE.generateLessonPack(OPTS, { callChat });
  const countAfterFirst = calls.length;
  const forced = await PIPELINE.generateLessonPack({ ...OPTS, force: true }, { callChat });
  assert.ok(calls.length > countAfterFirst, 'force bypass makes fresh LLM calls');
  assert.notEqual(forced, first, 'a fresh pack object replaces the cache entry');
  const third = await PIPELINE.generateLessonPack(OPTS, { callChat });
  assert.equal(third, forced, 'the regenerated pack is now the cached one');
});

test('clearPackCache: the next call regenerates', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  await PIPELINE.generateLessonPack(OPTS, { callChat });
  const countAfterFirst = calls.length;
  PIPELINE.clearPackCache();
  await PIPELINE.generateLessonPack(OPTS, { callChat });
  assert.ok(calls.length > countAfterFirst, 'after clearing, generation runs again');
});

test('slug derivation collapses punctuation and drops empty parts', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat(route);
  const pack = await PIPELINE.generateLessonPack(
    { topic: 'Water Cycle!', level: '', subject: 'Science' }, { callChat });
  assert.equal(pack.manifest.slug, 'water-cycle-science');
});

test('material failure rejects the pack naming the material with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('script author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'script', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateScript({}),
        'err.problems comes from validateScript');
      return true;
    });
});

test('lesson plan failure rejects the pack naming lessonPlan with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('lesson plan author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'lessonPlan', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateLessonPlan({}),
        'err.problems comes from validateLessonPlan');
      return true;
    });
});

test('scaffolds failure rejects the pack naming scaffolds with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('scaffolds author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'scaffolds', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateScaffolds({}),
        'err.problems comes from validateScaffolds');
      return true;
    });
});

test('by syllabus id: composite id authors a validate-clean pack with the resolved manifest', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat(route);
  const pack = await PIPELINE.generateLessonPackForSyllabus('primary/p-sci/water-cycle', {}, { callChat });

  assert.deepEqual(validate.validateSpec(pack.animation), [], 'animation validates clean');
  assert.deepEqual(validate.validateSlides(pack.slides), [], 'slides validate clean');
  assert.deepEqual(validate.validateWorksheet(pack.worksheet), [], 'worksheet validates clean');
  assert.deepEqual(validate.validateNotes(pack.notes), [], 'notes validate clean');
  assert.deepEqual(validate.validateExitTicket(pack.exitTicket), [], 'exit ticket validates clean');
  assert.deepEqual(validate.validateScript(pack.script), [], 'script validates clean');
  assert.deepEqual(validate.validateLessonPlan(pack.lessonPlan), [], 'lesson plan validates clean');
  assert.deepEqual(validate.validateScaffolds(pack.scaffolds), [], 'scaffolds validate clean');
  assert.deepEqual(validate.validateDiagnostics(pack.diagnostics), [], 'diagnostics validate clean');
  assert.deepEqual(validate.validateWorkedExamples(pack.workedExamples), [], 'worked examples validate clean');
  assert.deepEqual(validate.validateQuizBank(pack.quizBank), [], 'quiz bank validates clean');
  assert.deepEqual(validate.validateRevision(pack.revision), [], 'revision validates clean');
  assert.deepEqual(validate.validateOrganisers(pack.organisers), [], 'organisers validates clean');
  assert.deepEqual(validate.validateFeedback(pack.feedback), [], 'feedback validates clean');

  assert.equal(pack.manifest.slug, 'water-cycle-primary-science');
  assert.equal(pack.manifest.topic, 'water-cycle');
  assert.equal(pack.manifest.level, 'primary');
  assert.equal(pack.manifest.subject, 'science');
});

test('by syllabus id: cache is shared with a direct call using the resolved values verbatim', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  const first = await PIPELINE.generateLessonPackForSyllabus('water-cycle', {}, { callChat });
  const countAfterFirst = calls.length;
  const second = await PIPELINE.generateLessonPack(
    { topic: 'water-cycle', topicLabel: 'Water cycle', level: 'primary', subject: 'science' },
    { callChat });
  assert.equal(second, first, 'the direct call resolves the cached pack object');
  assert.equal(calls.length, countAfterFirst, 'the direct call adds zero callChat calls');
});

test('by syllabus id: explicit opts win over resolved values, undefined opts do not', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat(route);
  const pack = await PIPELINE.generateLessonPackForSyllabus('water-cycle',
    { level: 'secondary', subject: undefined }, { callChat });
  assert.equal(pack.manifest.level, 'secondary', 'explicit level overlays the resolved level');
  assert.equal(pack.manifest.subject, 'science',
    'an undefined subject opt leaves the resolved subject in place');
  assert.equal(pack.manifest.slug, 'water-cycle-secondary-science');
});

test('by syllabus id: unknown id rejects naming the id with zero callChat calls', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  await assert.rejects(
    () => PIPELINE.generateLessonPackForSyllabus('primary/p-sci/nope', {}, { callChat }),
    /resolveSyllabusTopic: unknown syllabus id "primary\/p-sci\/nope"/);
  assert.equal(calls.length, 0, 'resolution failure happens before any LLM call');
});

test('diagnostics failure rejects the pack naming diagnostics with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('diagnostics author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'diagnostics', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateDiagnostics({}),
        'err.problems comes from validateDiagnostics');
      return true;
    });
});

test('workedExamples failure rejects the pack naming workedExamples with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('worked-examples author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'workedExamples', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateWorkedExamples({}),
        'err.problems comes from validateWorkedExamples');
      return true;
    });
});

test('quizBank failure rejects the pack naming quizBank with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('quiz bank author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'quizBank', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateQuizBank({}),
        'err.problems comes from validateQuizBank');
      return true;
    });
});

test('revision failure rejects the pack naming revision with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('revision author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'revision', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateRevision({}),
        'err.problems comes from validateRevision');
      return true;
    });
});

test('organisers failure rejects the pack naming organisers with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('organisers author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'organisers', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateOrganisers({}),
        'err.problems comes from validateOrganisers');
      return true;
    });
});

test('feedback failure rejects the pack naming feedback with err.problems', async () => {
  PIPELINE.clearPackCache();
  const { callChat } = stubChat((system) => {
    if (system.indexOf('feedback author') !== -1) return '{}';
    return route(system);
  });
  await assert.rejects(
    () => PIPELINE.generateLessonPack({ ...OPTS, maxRepairs: 0 }, { callChat }),
    (err) => {
      assert.equal(err.material, 'feedback', 'the failing material is named');
      assert.deepEqual(err.problems, validate.validateFeedback({}),
        'err.problems comes from validateFeedback');
      return true;
    });
});

test('no misconception bank entry: the pack rejects before any callChat call naming diagnostics', async () => {
  PIPELINE.clearPackCache();
  const { calls, callChat } = stubChat(route);
  const bankless = { topic: 'Underwater Basket Weaving', level: 'Primary Science', subject: 'Science' };
  await assert.rejects(
    () => PIPELINE.generateLessonPack(bankless, { callChat }),
    /generateLessonPack: no misconception bank entry for topic "Underwater Basket Weaving" - diagnostics are generated from the bank/);
  assert.equal(calls.length, 0, 'the bank check happens before the unpack and every author call');
  await assert.rejects(
    () => PIPELINE.generateLessonPack(bankless, { callChat }),
    /no misconception bank entry/);
  assert.equal(calls.length, 0, 'the failed slug was not cached - the retry rejects the same way');
});

test('missing deps: no callChat rejects naming callChat', async () => {
  PIPELINE.clearPackCache();
  await assert.rejects(() => PIPELINE.generateLessonPack(OPTS), /callChat/);
  await assert.rejects(() => PIPELINE.generateLessonPack(OPTS, {}), /callChat/);
});
