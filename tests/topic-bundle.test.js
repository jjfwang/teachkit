'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const topicBundle = require('../generator/topic-bundle.js');
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'topic-blueprints.json'), 'utf8'));

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function requestFor(level, overrides) {
  const request = clone(fixtures[level].request);
  if (overrides) Object.assign(request, overrides);
  return request;
}
function contentFor(level) { return clone(fixtures[level].content); }

// Deterministic mock LLM: authors every artifact from the frozen
// blueprint summary carried in the stage prompt. No real provider.
function makeMock(fixtureLevel, options) {
  const opts = options || {};
  const calls = {};
  const scopeOf = (user) => user.blueprint.scope;
  const rationale = (i) => ({
    chose: 'Selected a distractor value.',
    thinks: 'Applied the wrong scaling rule.',
    reteach: 'Revisit the frozen worked example steps.'
  });
  function diagnostics(user, restricted) {
    const bp = user.blueprint;
    const ex = bp.content.examples;
    const obj = bp.objectives;
    const mc = (id, objectiveId, example, withCue) => ({
      id, prompt: 'Which option gives the worked answer for ' + example.id + '?',
      kind: 'multiple-choice', objectiveId, exampleId: example.id,
      ...(withCue ? { scriptCue: 'Pause after the worked example.' } : {}),
      choices: [
        { text: example.answer, correct: true },
        { text: 'Not the worked answer A', correct: false, misconception: 'scale-both', rationale: rationale(1) },
        { text: 'Not the worked answer B', correct: false, misconception: 'scale-both', rationale: rationale(2) }
      ]
    });
    return {
      title: 'Diagnostics', level: scopeOf(user).level, subject: scopeOf(user).subject, topic: scopeOf(user).topicId,
      doNow: [mc('diag-1', obj[0].objectiveId, ex[0], false), mc('diag-2', restricted ? obj[0].objectiveId : obj[1].objectiveId, ex[1] || ex[0], false)],
      hingeQuestions: [mc('diag-h1', restricted ? obj[0].objectiveId : obj[1].objectiveId, ex[1] || ex[0], true)]
    };
  }
  function worksheet(user, wrongAnswer, restricted) {
    const bp = user.blueprint;
    const ex = bp.content.examples;
    const obj = bp.objectives;
    return {
      title: 'Worksheet', level: scopeOf(user).level, subject: scopeOf(user).subject, topic: scopeOf(user).topicId,
      questions: [
        { id: 'ws-1', kind: 'short-answer', prompt: 'Work the first example and give the answer.',
          objective: obj[0].objectiveId, objectiveId: obj[0].objectiveId, exampleId: ex[0].id,
          answer: wrongAnswer ? 'A deliberately wrong answer.' : ex[0].answer,
          explanation: 'Follows the frozen worked example.', marks: 2 },
        { id: 'ws-2', kind: 'short-answer', prompt: 'Work the second example and give the answer.',
          ...(restricted ? {} : { objective: obj[1].objectiveId, objectiveId: obj[1].objectiveId }),
          exampleId: ex[1] ? ex[1].id : ex[0].id,
          answer: (ex[1] || ex[0]).answer, explanation: 'Follows the frozen worked example.', marks: 2 }
      ]
    };
  }
  function exitTicket(user, restricted) {
    const bp = user.blueprint;
    const ex = bp.content.examples;
    const obj = bp.objectives;
    return {
      title: 'Exit Ticket', level: scopeOf(user).level, subject: scopeOf(user).subject, topic: scopeOf(user).topicId,
      questions: [
        { id: 'et-1', kind: 'short-answer', prompt: 'Give the first worked answer.', objectiveId: obj[0].objectiveId,
          exampleId: ex[0].id, answer: ex[0].answer, feedback: 'Matches the frozen example.' },
        { id: 'et-2', kind: 'short-answer', prompt: 'Give the second worked answer.', objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId,
          exampleId: ex[1] ? ex[1].id : ex[0].id, answer: (ex[1] || ex[0]).answer, feedback: 'Matches the frozen example.' },
        { id: 'et-3', kind: 'multiple-choice', prompt: 'Which option is the second worked answer?', objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId,
          choices: [{ text: (ex[1] || ex[0]).answer, correct: true }, { text: 'Not the worked answer', correct: false }],
          feedback: 'Matches the frozen example.' }
      ]
    };
  }
  async function callChat(system, userJson) {
    const user = JSON.parse(userJson);
    calls[user.stage] = (calls[user.stage] || 0) + 1;
    if (opts.badJsonAlways === user.stage) return 'this is not json {';
    if (opts.badJsonOnce === user.stage && calls[user.stage] === 1) return 'this is not json {';
    const bp = user.blueprint;
    const scope = bp ? bp.scope : null;
    const problems = (user.problems || []).join(' ');
    const restricted = opts.unassessedOnce && !/not assessed/.test(problems);
    let doc;
    if (user.stage === 'blueprint') {
      doc = contentFor(fixtureLevel);
    } else if (user.stage === 'lessonPlan') {
      doc = { title: 'Lesson Plan', level: scope.level, subject: scope.subject, topic: scope.topicId,
        durationMinutes: bp.parameters.durationMinutes,
        objectives: bp.objectives.map((o) => ({ id: o.objectiveId, text: o.text,
          successCriteria: ['Shows ' + o.objectiveId + ' in work.'], assessmentPoints: ['Answers the check for ' + o.objectiveId + '.'] })),
        activities: bp.content.beats.map((beat) => ({ title: beat.kind + ' beat', minutes: beat.durationSeconds / 60,
          objectiveIds: beat.objectiveIds, scriptCue: 'Teach beat ' + beat.beatId + '.' })) };
    } else if (user.stage === 'slides') {
      const beats = bp.content.beats;
      const kinds = ['title', 'objective', 'concept', 'example', 'practice', 'exit-ticket'];
      const beatFor = [beats[0], beats[0], beats[1], beats[1], beats[3], beats[4]];
      const dangling = opts.danglingScene === 'always' || (opts.danglingScene === 'once' && !/dangling/.test(problems));
      doc = { title: 'Slides', level: scope.level, subject: scope.subject, topic: scope.topicId,
        slides: kinds.map((kind, i) => ({ kind, heading: kind + ' slide', bullets: ['Point for ' + kind + '.'],
          beatId: beatFor[i].beatId, objectiveIds: beatFor[i].objectiveIds,
          ...(kind === 'example' ? { visual: dangling ? 'missing-scene' : { kind: 'rect', label: 'Worked example visual' } } : {}) })) };
    } else if (user.stage === 'animation') {
      doc = { animath: '0.1', title: 'Animation', level: scope.level, subject: scope.subject, topic: scope.topicId,
        kind: 'concept', canvas: { width: 1280, height: 720 },
        scenes: [{ id: 'fraction-bar-scene', caption: 'Two equal bars split into parts.',
          narration: 'The shaded quantities match.', duration_ms: 8000,
          steps: [
            { at_ms: 0, do: 'show', shape: { id: 'bar-one', kind: 'rect', x: 100, y: 200, w: 400, h: 80 } },
            { at_ms: 1000, do: 'show', shape: { id: 'bar-two', kind: 'rect', x: 100, y: 400, w: 400, h: 80 } },
            { at_ms: 2000, do: 'caption', text: 'The shaded quantities match.' } ] }] };
    } else if (user.stage === 'diagnostics') {
      doc = diagnostics(user, restricted);
    } else if (user.stage === 'worksheet') {
      const wrong = opts.badWorksheetAnswer === 'always' ||
        (opts.badWorksheetAnswer === 'once' && !/answer/.test(problems));
      doc = worksheet(user, wrong, restricted);
    } else if (user.stage === 'exitTicket') {
      doc = exitTicket(user, restricted);
    } else if (user.stage === 'quizBank') {
      const ex = bp.content.examples;
      const obj = bp.objectives;
      doc = { title: 'Quiz Bank', level: scope.level, subject: scope.subject, topic: scope.topicId,
        items: [
          { prompt: 'First worked answer?', answer: ex[0].answer, objectiveId: restricted ? obj[0].objectiveId : obj[0].objectiveId, exampleId: ex[0].id },
          { prompt: 'Second worked answer?', answer: (ex[1] || ex[0]).answer, objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId, exampleId: ex[1] ? ex[1].id : ex[0].id },
          { prompt: 'What must stay the same when scaling?', answer: 'The scaling factor for numerator and denominator.', objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId },
          { prompt: 'What does the first objective ask for?', answer: obj[0].text, objectiveId: obj[0].objectiveId } ] };
    } else if (user.stage === 'visuals') {
      const visuals = [];
      bp.content.beats.forEach((beat) => {
        if (beat.visual === 'none') return;
        if (opts.slideFirstVisuals) {
          visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'slide-first', slideIndex: 0 });
        } else if (beat.visual === 'diagram') {
          visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'diagram', diagram: 'Diagram for beat ' + beat.beatId + '.' });
        } else if (beat.visual === 'animation') {
          if (user.mode === 'extended') {
            visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'animation', sceneId: 'fraction-bar-scene' });
          } else {
            visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'animation', fallback: 'diagram', diagram: 'Diagram fallback for beat ' + beat.beatId + '.' });
          }
        } else if (beat.visual === 'simulation') {
          visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'simulation', model: 'fraction-bars', exampleId: (bp.content.examples[1] || bp.content.examples[0]).id });
        }
      });
      doc = { visuals };
      if (!opts.slideFirstVisuals && bp.content.beats.some((beat) => beat.visual === 'simulation')) {
        const wrongDefaults = opts.badSimulationOnce && !/does not match frozen quantity/.test(problems);
        doc.simulation = { simulation: '0.2', model: 'fraction-bars', title: 'Fraction Bars', level: 'primary', subject: 'math', topic: 'fractions',
          disclaimer: 'A teaching model for equal wholes; it does not measure real objects.',
          parameters: [
            { id: 'numerator', label: 'Numerator', min: 0, max: 4, step: 1, default: wrongDefaults ? 1 : 2 },
            { id: 'denominator', label: 'Denominator', min: 1, max: 6, step: 1, default: wrongDefaults ? 2 : 3 } ],
          beats: [
            { id: 'split', label: 'Split the bar', narration: 'Split the whole into equal parts.' },
            { id: 'shade', label: 'Shade the parts', narration: 'Shade the numerator parts.' } ],
          check: { question: 'Which fraction is shaded?', options: ['2/3', '4/6'], correctIndex: 1,
            explanation: 'Two of three parts equals four of six parts.' } };
      }
    } else {
      throw new Error('mock: unknown stage ' + user.stage);
    }
    return JSON.stringify(doc);
  }
  return { callChat, calls };
}

test('topic-bundle: golden P5 core bundle end to end with host-supplied blueprint', async () => {
  const mock = makeMock('p5');
  const events = [];
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }),
    { callChat: mock.callChat, onProgress: (stage, event) => events.push([stage, event.status]) });
  assert.equal(bundle.schemaVersion, 'topic-bundle.v1');
  assert.equal(bundle.mode, 'core');
  assert.equal(bundle.animation, null);
  assert.equal(bundle.manifest.status, 'draft');
  assert.equal(bundle.manifest.scopeKey, bundle.blueprint.identity);
  assert.equal(bundle.manifest.generatorVersion, 'teachkit-topic-v1');
  assert.deepEqual(bundle.manifest.sourceRevisions, ['fixture-source@fixture-1']);
  assert.equal(bundle.blueprint.content.beats.length, 5);
  assert.equal(bundle.lessonPlan.durationMinutes, 30);
  assert.equal(bundle.slides.slides.length, 6);
  assert.equal(bundle.assessment.diagnostic.doNow.length, 2);
  assert.equal(bundle.assessment.exitTicket.questions.length, 3);
  assert.equal(bundle.assessment.formative.worksheet.questions.length, 2);
  assert.equal(bundle.assessment.formative.quizBank, undefined);
  // Indexing by objective and beat, for subset selection without regenerating.
  assert.deepEqual(bundle.index.byObjective['P5-EF-1'].beatIds, ['activate', 'explain', 'exit']);
  assert.deepEqual(bundle.index.byObjective['P5-EF-2'].beatIds, ['predict', 'practice', 'exit']);
  assert.ok(bundle.index.byObjective['P5-EF-1'].assessmentIds.includes('check-1'));
  assert.ok(bundle.index.byObjective['P5-EF-1'].assessmentIds.includes('diag-1'));
  assert.ok(bundle.index.byObjective['P5-EF-1'].assessmentIds.includes('ws-1'));
  assert.ok(bundle.index.byObjective['P5-EF-1'].assessmentIds.includes('et-1'));
  assert.deepEqual(bundle.index.byBeat.exit.slideIndexes, [5]);
  assert.deepEqual(bundle.index.byBeat.exit.assessmentIds, ['check-3']);
  // Core mode authors no animation: the explain beat falls back to a
  // diagram through the capability resolver, recorded as a warning.
  assert.equal(bundle.visual.kind, 'diagram');
  assert.equal(bundle.coherence.problems.length, 0);
  assert.equal(bundle.coherence.capabilities.length, 4);
  assert.ok(bundle.coherence.warnings.some((w) => w.includes('fell back from animation')));
  assert.equal(bundle.coherence.capabilities.find((d) => d.beatId === 'explain').capability, 'diagram');
  assert.equal(bundle.coherence.capabilities.find((d) => d.beatId === 'explain').fallback.from, 'animation');
  // Frozen, and host-supplied blueprint means no blueprint model call.
  assert.equal(mock.calls.blueprint, undefined);
  assert.ok(Object.isFrozen(bundle));
  assert.ok(Object.isFrozen(bundle.blueprint));
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5'));
  assert.deepEqual(problems, []);
  const stages = events.filter(([, status]) => status === 'completed').map(([stage]) => stage);
  for (const stage of ['blueprint', 'lessonPlan', 'slides', 'diagnostics', 'worksheet', 'exitTicket', 'visuals']) {
    assert.ok(stages.includes(stage), 'missing completed stage ' + stage);
  }
  assert.equal(mock.calls.animation, undefined);
  assert.equal(mock.calls.quizBank, undefined);
});

test('topic-bundle: full mock-LLM end to end (blueprint authored by the model)', async () => {
  const mock = makeMock('p5');
  const bundle = await topicBundle.generateTopicTeachingBundle(requestFor('p5'), { callChat: mock.callChat });
  assert.equal(mock.calls.blueprint, 1);
  assert.equal(bundle.blueprint.identity.length, 64);
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5'));
  assert.deepEqual(problems, []);
});

test('topic-bundle: extended mode adds animation and quiz bank', async () => {
  const mock = makeMock('p5');
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { mode: 'extended', blueprintContent: contentFor('p5') }),
    { callChat: mock.callChat });
  assert.equal(bundle.mode, 'extended');
  assert.equal(bundle.animation.scenes[0].id, 'fraction-bar-scene');
  assert.equal(bundle.visual.kind, 'animation');
  assert.equal(bundle.assessment.formative.quizBank.items.length, 4);
  assert.equal(bundle.coherence.warnings.length, 0);
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5', { mode: 'extended' }));
  assert.deepEqual(problems, []);
});

test('topic-bundle: stable scope-based idempotency key, mode-sensitive', async () => {
  const mock = makeMock('p5');
  const first = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  const second = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  assert.equal(first.idempotencyKey, second.idempotencyKey);
  assert.equal(first.manifest.revision, second.manifest.revision);
  const coreKey = await topicBundle.topicBundleScopeKey(requestFor('p5'));
  const extendedKey = await topicBundle.topicBundleScopeKey(requestFor('p5'), 'extended');
  assert.notEqual(coreKey, extendedKey);
  assert.equal(coreKey, first.idempotencyKey);
  const changed = requestFor('p5');
  changed.objectives[1].revision = '2';
  assert.notEqual(await topicBundle.topicBundleScopeKey(changed), coreKey);
});

test('topic-bundle: progress reports stage tokens and latency', async () => {
  const mock = makeMock('p5');
  const seen = {};
  const callChat = async (system, user) => {
    const out = await mock.callChat(system, user);
    return { content: out, usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 } };
  };
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }),
    { callChat, onProgress: (stage, event) => { seen[stage] = event; } });
  assert.equal(bundle.progress.stages.lessonPlan.tokens.totalTokens, 30);
  assert.equal(typeof bundle.progress.stages.lessonPlan.latencyMs, 'number');
  assert.equal(seen.slides.status, 'completed');
});

test('topic-bundle: targeted repair fixes a false worksheet answer once', async () => {
  const mock = makeMock('p5', { badWorksheetAnswer: 'once' });
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  assert.equal(mock.calls.worksheet, 2);
  assert.equal(bundle.assessment.formative.worksheet.questions[0].answer, 'Yes: 1/2 = 2/4.');
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5'));
  assert.deepEqual(problems, []);
});

test('topic-bundle: persistent false answer fails closed', async () => {
  const mock = makeMock('p5', { badWorksheetAnswer: 'always' });
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(
      requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat, maxCrossRepairs: 1 }),
    (error) => {
      assert.equal(error.stage, 'cross-material-validation');
      assert.ok(error.problems.some((p) => p.code === 'answer-mismatch'), JSON.stringify(error.problems));
      return true;
    });
});

test('topic-bundle: dangling slide scene fails closed', async () => {
  const mock = makeMock('p5', { danglingScene: 'always' });
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(
      requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat, maxCrossRepairs: 1 }),
    (error) => {
      assert.equal(error.stage, 'cross-material-validation');
      assert.ok(error.problems.some((p) => p.code === 'dangling-scene'), JSON.stringify(error.problems));
      return true;
    });
});

test('topic-bundle: smoke cases for Secondary Science and JC Maths (no animation required)', async () => {
  for (const level of ['secondary', 'jc']) {
    const mock = makeMock(level);
    const bundle = await topicBundle.generateTopicTeachingBundle(
      requestFor(level, { blueprintContent: contentFor(level) }), { callChat: mock.callChat });
    assert.equal(bundle.mode, 'core');
    assert.equal(bundle.animation, null);
    assert.equal(bundle.visual.kind, 'diagram');
    assert.equal(bundle.coherence.problems.length, 0);
    const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor(level));
    assert.deepEqual(problems, []);
  }
});

test('topic-bundle: simulation visual resolves for a simulation beat', async () => {
  const content = contentFor('p5');
  content.beats.find((b) => b.beatId === 'predict').visual = 'simulation';
  const mock = makeMock('p5');
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: content }), { callChat: mock.callChat });
  assert.equal(bundle.visual.kind, 'simulation');
  assert.equal(bundle.visual.simulation.model, 'fraction-bars');
  const decision = bundle.coherence.capabilities.find((d) => d.beatId === 'predict');
  assert.equal(decision.capability, 'simulation');
  assert.equal(decision.model, 'fraction-bars');
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5'));
  assert.deepEqual(problems, []);
});

test('topic-bundle: bulk pre-generation dedupes by idempotency key and isolates failures', async () => {
  const mock = makeMock('p5');
  const bad = requestFor('p5');
  bad.mode = 'bogus';
  const results = await topicBundle.generateTopicTeachingBundles(
    [requestFor('p5', { blueprintContent: contentFor('p5') }),
     requestFor('p5', { blueprintContent: contentFor('p5') }),
     bad],
    { callChat: mock.callChat });
  assert.equal(results[0].status, 'generated');
  assert.equal(results[1].status, 'duplicate');
  assert.equal(results[1].bundle, results[0].bundle);
  assert.equal(results[1].idempotencyKey, results[0].idempotencyKey);
  assert.equal(results[2].status, 'failed');
  assert.match(results[2].error, /mode/);
  assert.equal(mock.calls.blueprint, undefined);
  await assert.rejects(() => topicBundle.generateTopicTeachingBundles([], { callChat: mock.callChat }));
});

test('topic-bundle: request validation rejects unknown fields, bad mode and student data', async () => {
  const mock = makeMock('p5');
  const withStudent = requestFor('p5');
  withStudent.studentId = 'learner-1';
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(withStudent, { callChat: mock.callChat }),
    /studentId/);
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(requestFor('p5', { mode: 'live' }), { callChat: mock.callChat }),
    /mode/);
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(requestFor('p5'), {}),
    /callChat/);
  assert.ok(topicBundle.validateTopicBundleRequest(requestFor('p5')).length === 0);
  assert.ok(topicBundle.validateTopicBundleRequest({ mode: 'core' }).length > 0);
  assert.ok(topicBundle.validateTopicBundleRequest(requestFor('p5', { reviewStatus: 'live' })).some((e) => /reviewStatus/.test(e)));
});

test('topic-bundle: invalid host-supplied blueprint content fails closed', async () => {
  const mock = makeMock('p5');
  const content = contentFor('p5');
  content.beats[0].durationSeconds = 1;
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(
      requestFor('p5', { blueprintContent: content }), { callChat: mock.callChat }),
    (error) => {
      assert.equal(error.stage, 'blueprint');
      return true;
    });
});

test('topic-bundle: verify detects a tampered lesson plan', async () => {
  const mock = makeMock('p5');
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  const tampered = clone(bundle);
  tampered.lessonPlan.activities[0].title = 'Changed after freezing';
  const problems = await topicBundle.verifyTopicTeachingBundle(tampered, requestFor('p5'));
  assert.ok(problems.some((p) => /manifest\.artifactHashes\.lessonPlan/.test(p)), JSON.stringify(problems));
  const retargeted = clone(bundle);
  retargeted.scope = { ...retargeted.scope, grade: 'P6' };
  const scopeProblems = await topicBundle.verifyTopicTeachingBundle(retargeted, requestFor('p5'));
  assert.ok(scopeProblems.length > 0);
});

test('topic-bundle: callChat object form with text and split token usage', async () => {
  const mock = makeMock('p5');
  const callChat = async (system, user) => {
    const out = await mock.callChat(system, user);
    return { text: out, usage: { promptTokens: 5, completionTokens: 7 } };
  };
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat });
  assert.equal(bundle.progress.stages.lessonPlan.tokens.totalTokens, 12);
  assert.equal(bundle.progress.stages.lessonPlan.tokens.inputTokens, 5);
  assert.equal(bundle.progress.stages.lessonPlan.tokens.outputTokens, 7);
});

test('topic-bundle: a throwing callChat fails with the stage named', async () => {
  const callChat = async () => { throw new Error('model down'); };
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(
      requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat }),
    (error) => {
      assert.match(error.message, /lessonPlan: callChat failed: model down/);
      return true;
    });
});

test('topic-bundle: non-JSON reply is repaired once, persistent bad JSON exhausts repairs', async () => {
  const once = makeMock('p5', { badJsonOnce: 'lessonPlan' });
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: once.callChat });
  assert.equal(once.calls.lessonPlan, 2);
  assert.equal(bundle.lessonPlan.durationMinutes, 30);
  const always = makeMock('p5', { badJsonAlways: 'lessonPlan' });
  await assert.rejects(
    () => topicBundle.generateTopicTeachingBundle(
      requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: always.callChat, maxRepairs: 0 }),
    (error) => {
      assert.equal(error.stage, 'lessonPlan');
      assert.match(error.message, /failed validation after 1 attempt/);
      return true;
    });
});

test('topic-bundle: cross repair re-authors every assessment stage for an unassessed objective', async () => {
  const mock = makeMock('p5', { unassessedOnce: true });
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { mode: 'extended', blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  assert.ok(mock.calls.diagnostics >= 2);
  assert.ok(mock.calls.worksheet >= 2);
  assert.ok(mock.calls.exitTicket >= 2);
  assert.ok(mock.calls.quizBank >= 2);
  assert.deepEqual(bundle.index.byObjective['P5-EF-2'].assessmentIds.filter((id) => id.startsWith('diag-')), ['diag-2', 'diag-h1']);
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5', { mode: 'extended' }));
  assert.deepEqual(problems, []);
});

test('topic-bundle: cross repair re-authors visuals for a simulation quantity mismatch', async () => {
  const content = contentFor('p5');
  content.beats.find((b) => b.beatId === 'predict').visual = 'simulation';
  const mock = makeMock('p5', { badSimulationOnce: true });
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: content }), { callChat: mock.callChat });
  assert.equal(mock.calls.visuals, 2);
  assert.equal(bundle.visual.kind, 'simulation');
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5'));
  assert.deepEqual(problems, []);
});

test('topic-bundle: slide-first visuals give a slide-first bundle kind', async () => {
  const mock = makeMock('p5', { slideFirstVisuals: true });
  const bundle = await topicBundle.generateTopicTeachingBundle(
    requestFor('p5', { blueprintContent: contentFor('p5') }), { callChat: mock.callChat });
  assert.equal(bundle.visual.kind, 'slide-first');
  assert.ok(bundle.coherence.capabilities.every((d) => d.capability === 'slide-first'));
  const problems = await topicBundle.verifyTopicTeachingBundle(bundle, requestFor('p5'));
  assert.deepEqual(problems, []);
});

test('topic-bundle: bulk isolates a topic whose generation fails', async () => {
  const mock = makeMock('p5', { badWorksheetAnswer: 'always' });
  const results = await topicBundle.generateTopicTeachingBundles(
    [requestFor('p5', { blueprintContent: contentFor('p5') })],
    { callChat: mock.callChat, maxCrossRepairs: 0 });
  assert.equal(results[0].status, 'failed');
  assert.match(results[0].error, /cross-material validation/);
  assert.ok(results[0].problems.some((p) => p.code === 'answer-mismatch'));
});
