'use strict';
/* Cross-material validator + capability resolver (issue #1641). The valid
 * bundle is built from the frozen P5 fixture in topic-blueprints.json, so
 * every negative fixture below mutates exactly one contract term. */
const test = require('node:test');
const assert = require('node:assert/strict');
const blueprintApi = require('../generator/lesson-blueprint.js');
const api = require('../generator/cross-material-validator.js');
const fixtures = require('./fixtures/topic-blueprints.json');
const copy = value => JSON.parse(JSON.stringify(value));

const HEADER = { title: 'Equivalent fractions', level: 'primary', subject: 'mathematics', topic: 'equivalent-fractions' };

function animationSpec() {
  return {
    animath: '0.1', title: 'Equivalent fractions', level: 'primary',
    subject: 'mathematics', topic: 'equivalent-fractions', kind: 'concept',
    canvas: { width: 1280, height: 720 },
    scenes: [{
      id: 'fraction-bars-scene', caption: 'Half and fourth bars', narration: 'The shaded amounts match.',
      duration_ms: 6000,
      steps: [{ at_ms: 0, do: 'show', shape: { id: 'bar', kind: 'rect', x: 100, y: 100, w: 400, h: 80 } }]
    }]
  };
}

function slidesSpec() {
  return {
    ...HEADER,
    slides: [
      { kind: 'title', heading: 'Equivalent fractions' },
      { kind: 'objective', heading: 'What we will learn', bullets: ['Recognise equivalent fractions.'], beatId: 'activate', objectiveIds: ['P5-EF-1'] },
      { kind: 'concept', heading: 'Half and fourths', bullets: ['1/2 covers the same amount as 2/4.'], visual: 'fraction-bars-scene', beatId: 'explain', objectiveIds: ['P5-EF-1'] },
      { kind: 'example', heading: 'Scale thirds to sixths', bullets: ['2/3 = 4/6.'], visual: { kind: 'rect' }, beatId: 'predict', objectiveIds: ['P5-EF-2'] },
      { kind: 'practice', heading: 'Your turn', bullets: ['Write 2/3 with denominator 6.'], beatId: 'practice', objectiveIds: ['P5-EF-2'] },
      { kind: 'exit-ticket', heading: 'Exit ticket', bullets: ['Explain equivalence in one sentence.'], beatId: 'exit', objectiveIds: ['P5-EF-1', 'P5-EF-2'] }
    ]
  };
}

function lessonPlanSpec() {
  return {
    ...HEADER, durationMinutes: 30,
    objectives: [
      { id: 'P5-EF-1', text: 'Recognise equivalent fractions using equal-sized wholes.', successCriteria: ['Identifies matching shaded quantities.'], assessmentPoints: ['Names the equivalent fraction.'] },
      { id: 'P5-EF-2', text: 'Generate equivalent fractions by scaling numerator and denominator together.', successCriteria: ['Produces 4/6 and explains multiplication by 2.'], assessmentPoints: ['Scales both numbers together.'] }
    ],
    activities: [
      { title: 'Activate', minutes: 10, objectiveIds: ['P5-EF-1'] },
      { title: 'Explain and practise', minutes: 10, objectiveIds: ['P5-EF-2'] },
      { title: 'Exit', minutes: 10, objectiveIds: ['P5-EF-1', 'P5-EF-2'] }
    ]
  };
}

function worksheetSpec() {
  return {
    ...HEADER,
    questions: [
      { id: 'ws-1', kind: 'multiple-choice', prompt: 'Is 1/2 equivalent to 2/4 for the same whole?', objective: 'P5-EF-1', exampleId: 'half-fourths',
        choices: [{ text: 'Yes: 1/2 = 2/4.', correct: true }, { text: 'No, they differ.', correct: false }] },
      { id: 'ws-2', kind: 'short-answer', prompt: 'Write 2/3 as an equivalent fraction with denominator 6.', objective: 'P5-EF-2', exampleId: 'thirds-sixths', answer: '4/6',
        quantities: [
          { id: 'numerator', value: 2, unit: '' }, { id: 'denominator', value: 3, unit: '' },
          { id: 'equivalentNumerator', value: 4, unit: '' }, { id: 'equivalentDenominator', value: 6, unit: '' }
        ] }
    ]
  };
}

function diagnosticsSpec() {
  return {
    ...HEADER,
    doNow: [
      { id: 'diag-1', prompt: 'Is 1/2 the same amount as 2/4?', kind: 'multiple-choice', objectiveId: 'P5-EF-1', exampleId: 'half-fourths',
        choices: [
          { text: 'Yes: 1/2 = 2/4.', correct: true },
          { text: 'No, 2/4 is larger.', correct: false, misconception: 'scale-both',
            rationale: { chose: 'Picked the larger denominator as larger.', thinks: 'Thinks a bigger denominator means a bigger fraction.', reteach: 'Compare shaded amounts of the same whole.' } }
        ] },
      { id: 'diag-2', prompt: 'Which fraction equals 2/3 with denominator 6?', kind: 'multiple-choice', objectiveId: 'P5-EF-2', exampleId: 'thirds-sixths',
        choices: [
          { text: '4/6', correct: true },
          { text: '2/6', correct: false, misconception: 'scale-both',
            rationale: { chose: 'Kept the numerator unchanged.', thinks: 'Thinks only the denominator changes.', reteach: 'Multiply the numerator and denominator by the same number.' } }
        ] }
    ],
    hingeQuestions: [
      { id: 'diag-h1', prompt: 'Which fraction equals 2/3 with denominator 6?', kind: 'multiple-choice', scriptCue: 'Ask for the scaling reason.', objectiveId: 'P5-EF-2', exampleId: 'thirds-sixths',
        choices: [
          { text: '4/6', correct: true },
          { text: '2/6', correct: false, misconception: 'scale-both',
            rationale: { chose: 'Kept the numerator unchanged.', thinks: 'Thinks only the denominator changes.', reteach: 'Multiply the numerator and denominator by the same number.' } }
        ] }
    ]
  };
}

function simulationSpec() {
  return {
    simulation: '0.2', model: 'fraction-bars', title: 'Fraction bars', level: 'primary',
    subject: 'math', topic: 'fractions',
    disclaimer: 'Fraction bars show equal parts of one whole. The model is illustrative, not a measurement.',
    parameters: [
      { id: 'numerator', label: 'Numerator', min: 0, max: 2, step: 1, default: 1 },
      { id: 'denominator', label: 'Denominator', min: 1, max: 2, step: 1, default: 2 }
    ],
    beats: [
      { id: 'compare', label: 'Compare bars', narration: 'Compare 1 of 2 parts with 2 of 4 parts.' },
      { id: 'scale', label: 'Scale both numbers', narration: 'Multiply the numerator and denominator by the same number.' }
    ],
    check: { question: 'Which fraction equals 1/2?', options: ['2/4', '1/4'], correctIndex: 0, explanation: '2 of 4 equal parts is the same amount as 1 of 2.' }
  };
}

async function validBundle() {
  const blueprint = await blueprintApi.createLessonBlueprint(fixtures.p5.request, fixtures.p5.content);
  return {
    schemaVersion: 'topic-bundle.v1',
    // The frozen blueprint is the authority: its scope is normalized
    // (locale lowercased, sets sorted), so copy it from the blueprint.
    scope: copy(blueprint.request.scope),
    blueprint,
    materials: { animation: animationSpec(), slides: slidesSpec(), lessonPlan: lessonPlanSpec(), worksheet: worksheetSpec(), diagnostics: diagnosticsSpec() },
    visuals: [
      { visualId: 'v-activate', beatId: 'activate', requested: 'diagram', diagram: { kind: 'rect', label: 'Fraction bars' } },
      { visualId: 'v-explain', beatId: 'explain', requested: 'simulation', model: 'fraction-bars', exampleId: 'half-fourths' },
      { visualId: 'v-predict', beatId: 'predict', requested: 'animation', sceneId: 'fraction-bars-scene' },
      { visualId: 'v-practice', beatId: 'practice', requested: 'slide-first', slideIndex: 4 }
    ],
    simulation: simulationSpec()
  };
}

function codes(result) { return result.problems.map(problem => problem.code); }
function hasCode(result, code) { return codes(result).includes(code); }

test('valid P5 bundle validates with every capability resolved and recorded', async () => {
  const bundle = await validBundle();
  const before = copy(bundle);
  const result = api.validateTopicBundle(bundle);
  assert.equal(result.valid, true, JSON.stringify(result.problems, null, 2));
  assert.deepEqual(result.problems, []);
  assert.equal(result.blueprintIdentity, bundle.blueprint.identity);
  assert.deepEqual(result.capabilities.map(decision => decision.capability), ['diagram', 'simulation', 'animation', 'slide-first']);
  assert.ok(result.capabilities.every(decision => decision.supported));
  assert.equal(result.capabilities[1].model, 'fraction-bars');
  assert.equal(result.capabilities[2].sceneId, 'fraction-bars-scene');
  assert.deepEqual(result.coverage.objectives, ['P5-EF-1', 'P5-EF-2']);
  assert.deepEqual(result.coverage.planCovered, ['P5-EF-1', 'P5-EF-2']);
  assert.deepEqual(result.coverage.planMissing, []);
  assert.deepEqual(result.coverage.assessmentCovered, ['P5-EF-1', 'P5-EF-2']);
  assert.equal(result.coverage.assessmentChecked, true);
  assert.deepEqual(bundle, before, 'validation must not mutate its input');
  // Deterministic: the same bundle validates to the same result.
  assert.deepEqual(api.validateTopicBundle(bundle), result);
});

test('verifyTopicBundle accepts the valid bundle and rejects a tampered revision', async () => {
  const bundle = await validBundle();
  assert.equal((await api.verifyTopicBundle(bundle)).valid, true);
  const tampered = await validBundle();
  const forged = copy(tampered.blueprint);
  forged.revision = '0'.repeat(64);
  tampered.blueprint = forged;
  const result = await api.verifyTopicBundle(tampered);
  assert.equal(result.valid, false);
  assert.ok(hasCode(result, 'blueprint-invalid'));
  assert.ok(result.problems.some(problem => problem.path === 'blueprint.revision'));
});

test('bundle without materials or visuals stays valid (beta.2 backward compatibility)', async () => {
  const blueprint = await blueprintApi.createLessonBlueprint(fixtures.p5.request, fixtures.p5.content);
  const result = api.validateTopicBundle({ schemaVersion: 'topic-bundle.v1', scope: copy(blueprint.request.scope), blueprint });
  assert.equal(result.valid, true, JSON.stringify(result.problems, null, 2));
  assert.deepEqual(result.capabilities, []);
  assert.equal(result.coverage.assessmentChecked, false);
});

test('resolver: simulation needs a registered model serving this topic family', () => {
  const context = { scope: { level: 'primary', subject: 'mathematics', topicId: 'equivalent-fractions' }, sceneIds: [], slideCount: 0, simulation: null };
  const ok = api.resolveVisualCapability({ visualId: 'v', beatId: 'explain', requested: 'simulation', model: 'fraction-bars' }, context);
  assert.equal(ok.supported, true);
  assert.equal(ok.capability, 'simulation');
  const unknown = api.resolveVisualCapability({ visualId: 'v', beatId: 'explain', requested: 'simulation', model: 'quantum-field' }, context);
  assert.equal(unknown.supported, false);
  assert.match(unknown.reason, /unknown simulation model quantum-field/);
  const wrongTopic = api.resolveVisualCapability({ visualId: 'v', beatId: 'explain', requested: 'simulation', model: 'ideal-gas' }, context);
  assert.equal(wrongTopic.supported, false);
  // Level is checked first: ideal-gas is a JC model, not a Primary one.
  assert.match(wrongTopic.reason, /registered for level jc, not primary/);
  // A pure topic mismatch: transpiration serves plant-systems, not the water cycle.
  const waterContext = { scope: { level: 'primary', subject: 'science', topicId: 'water-cycle' }, sceneIds: [], slideCount: 0, simulation: null };
  const topicMismatch = api.resolveVisualCapability({ visualId: 'v', beatId: 'explain', requested: 'simulation', model: 'transpiration' }, waterContext);
  assert.equal(topicMismatch.supported, false);
  assert.match(topicMismatch.reason, /registered for topic plant-systems, not water-cycle/);
  const noModel = api.resolveVisualCapability({ visualId: 'v', beatId: 'explain', requested: 'simulation' }, context);
  assert.equal(noModel.supported, false);
  assert.match(noModel.reason, /requires a model id/);
});

test('resolver: animation, diagram, slide-first and declared-missing rules', () => {
  const context = { scope: { level: 'primary', subject: 'mathematics', topicId: 'equivalent-fractions' }, sceneIds: ['fraction-bars-scene'], slideCount: 6, simulation: null };
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'animation', sceneId: 'fraction-bars-scene' }, context).capability, 'animation');
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'animation', sceneId: 'nope' }, context).supported, false);
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'diagram', diagram: 'A hand-drawn bar' }, context).capability, 'diagram');
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'diagram', diagram: { kind: 'sparkle' } }, context).supported, false);
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'slide-first', slideIndex: 4 }, context).capability, 'slide-first');
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'slide-first', slideIndex: 6 }, context).supported, false);
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'slide-first', slideIndex: 4, sceneId: 'fraction-bars-scene' }, context).supported, false);
  const missing = api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'none', declaredMissing: true, reason: 'No visual for this beat; the slide carries the task.' }, context);
  assert.equal(missing.supported, true);
  assert.equal(missing.declaredMissing, true);
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'none' }, context).supported, false);
  assert.equal(api.resolveVisualCapability({ visualId: 'v', beatId: 'b', requested: 'hologram' }, context).supported, false);
  assert.equal(api.resolveVisualCapability(null, context).supported, false);
});

test('resolver: explicit fallback is recorded, and a failed fallback stays rejected', () => {
  const context = { scope: { level: 'primary', subject: 'mathematics', topicId: 'equivalent-fractions' }, sceneIds: ['fraction-bars-scene'], slideCount: 6, simulation: null };
  const fellBack = api.resolveVisualCapability(
    { visualId: 'v', beatId: 'b', requested: 'simulation', model: 'ideal-gas', fallback: 'diagram', diagram: { kind: 'rect' }, reason: 'Ideal-gas does not serve fractions.' },
    context);
  assert.equal(fellBack.supported, true);
  assert.equal(fellBack.capability, 'diagram');
  assert.equal(fellBack.fallback.from, 'simulation');
  assert.match(fellBack.fallback.reason, /registered for level jc, not primary/);
  const bothFail = api.resolveVisualCapability(
    { visualId: 'v', beatId: 'b', requested: 'simulation', model: 'ideal-gas', fallback: 'animation', sceneId: 'nope' },
    context);
  assert.equal(bothFail.supported, false);
  assert.match(bothFail.reason, /fallback animation also unavailable/);
  const badFallback = api.resolveVisualCapability(
    { visualId: 'v', beatId: 'b', requested: 'simulation', model: 'ideal-gas', fallback: 'simulation' },
    context);
  assert.equal(badFallback.supported, false);
  assert.match(badFallback.reason, /not an allowed fallback/);
});

test('negative fixture: dangling slide scene reference and unknown slide beat', async () => {
  const dangling = await validBundle();
  dangling.materials.slides.slides[2].visual = 'missing-scene';
  const first = api.validateTopicBundle(dangling);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'dangling-scene'));
  assert.ok(first.problems.some(problem => problem.path === 'materials.slides.slides[2].visual'));
  const badBeat = await validBundle();
  badBeat.materials.slides.slides[1].beatId = 'nope';
  const second = api.validateTopicBundle(badBeat);
  assert.equal(second.valid, false);
  assert.ok(hasCode(second, 'unknown-beat'));
});

test('negative fixture: wrong answer key against the canonical example answer', async () => {
  const wrongShort = await validBundle();
  wrongShort.materials.worksheet.questions[1].answer = '5/6';
  const first = api.validateTopicBundle(wrongShort);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'answer-mismatch'));
  assert.ok(first.problems.some(problem => problem.message.includes('4/6')));
  const wrongChoice = await validBundle();
  wrongChoice.materials.worksheet.questions[0].choices[0].text = 'Yes: 1/2 = 3/4.';
  const second = api.validateTopicBundle(wrongChoice);
  assert.equal(second.valid, false);
  assert.ok(hasCode(second, 'answer-mismatch'));
  const unknownExample = await validBundle();
  unknownExample.materials.worksheet.questions[1].exampleId = 'no-such-example';
  assert.ok(hasCode(api.validateTopicBundle(unknownExample), 'unknown-example'));
});

test('negative fixture: omitted objective in the plan and in assessment', async () => {
  const omittedPlan = await validBundle();
  omittedPlan.materials.lessonPlan.activities = [{ title: 'Activate', minutes: 30, objectiveIds: ['P5-EF-1'] }];
  const first = api.validateTopicBundle(omittedPlan);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'omitted-objective'));
  assert.deepEqual(first.coverage.planMissing, ['P5-EF-2']);
  const omittedAssessment = await validBundle();
  omittedAssessment.materials.worksheet.questions[1].objective = 'P5-EF-1';
  omittedAssessment.materials.diagnostics.doNow[1].objectiveId = 'P5-EF-1';
  omittedAssessment.materials.diagnostics.hingeQuestions[0].objectiveId = 'P5-EF-1';
  const second = api.validateTopicBundle(omittedAssessment);
  assert.equal(second.valid, false);
  assert.ok(hasCode(second, 'objective-not-assessed'));
  assert.deepEqual(second.coverage.assessmentMissing, ['P5-EF-2']);
  const droppedObjective = await validBundle();
  droppedObjective.materials.lessonPlan.objectives = droppedObjective.materials.lessonPlan.objectives.slice(0, 1);
  assert.ok(hasCode(api.validateTopicBundle(droppedObjective), 'omitted-objective'));
});

test('negative fixture: unsupported simulation is rejected, explicit fallback is accepted', async () => {
  const unknown = await validBundle();
  unknown.visuals[1].model = 'quantum-field';
  const first = api.validateTopicBundle(unknown);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'unsupported-visual'));
  assert.ok(first.problems.some(problem => problem.message.includes('unknown simulation model quantum-field')));
  const wrongTopic = await validBundle();
  wrongTopic.visuals[1].model = 'ideal-gas';
  assert.ok(hasCode(api.validateTopicBundle(wrongTopic), 'unsupported-visual'));
  const fellBack = await validBundle();
  fellBack.visuals[1] = { visualId: 'v-explain', beatId: 'explain', requested: 'simulation', model: 'ideal-gas', fallback: 'diagram', diagram: { kind: 'rect', label: 'Gas law does not serve fractions.' }, reason: 'Ideal-gas is registered for h2-thermal.' };
  const third = api.validateTopicBundle(fellBack);
  assert.equal(third.valid, true, JSON.stringify(third.problems, null, 2));
  assert.equal(third.capabilities[1].capability, 'diagram');
  assert.equal(third.capabilities[1].fallback.from, 'simulation');
});

test('negative fixture: invalid slide-first animation is rejected', async () => {
  const withScene = await validBundle();
  withScene.visuals[3].sceneId = 'fraction-bars-scene';
  const first = api.validateTopicBundle(withScene);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'unsupported-visual'));
  assert.ok(first.problems.some(problem => problem.message.includes('must not reference an animation scene')));
  const outOfRange = await validBundle();
  outOfRange.visuals[3].slideIndex = 99;
  assert.ok(hasCode(api.validateTopicBundle(outOfRange), 'unsupported-visual'));
  const undeclaredMissing = await validBundle();
  undeclaredMissing.visuals[3] = { visualId: 'v-practice', beatId: 'practice', requested: 'none' };
  assert.ok(hasCode(api.validateTopicBundle(undeclaredMissing), 'unsupported-visual'));
});

test('negative fixture: stale scope is rejected field by field', async () => {
  const staleTopic = await validBundle();
  staleTopic.scope.topicId = 'fractions';
  const first = api.validateTopicBundle(staleTopic);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'stale-scope'));
  assert.ok(first.problems.some(problem => problem.path === 'bundle.scope.topicId'));
  const staleSubject = await validBundle();
  staleSubject.scope.subject = 'science';
  assert.ok(hasCode(api.validateTopicBundle(staleSubject), 'stale-scope'));
  const staleRequest = await validBundle();
  const otherRequest = copy(fixtures.secondary.request);
  assert.ok(api.validateTopicBundle(staleRequest, { expectedRequest: otherRequest }).problems.some(problem => problem.message.includes('expected curriculum snapshot mismatch')));
});

test('negative fixture: numeric bindings must match frozen example quantities', async () => {
  const wrongQuantity = await validBundle();
  wrongQuantity.materials.worksheet.questions[1].quantities[0].value = 3;
  const first = api.validateTopicBundle(wrongQuantity);
  assert.equal(first.valid, false);
  assert.ok(hasCode(first, 'quantity-mismatch'));
  const wrongDefault = await validBundle();
  wrongDefault.simulation.parameters[0].default = 2;
  const second = api.validateTopicBundle(wrongDefault);
  assert.equal(second.valid, false);
  assert.ok(hasCode(second, 'quantity-mismatch'));
  const unknownQuantity = await validBundle();
  unknownQuantity.materials.worksheet.questions[1].quantities.push({ id: 'mystery', value: 1, unit: '' });
  assert.ok(hasCode(api.validateTopicBundle(unknownQuantity), 'unknown-quantity'));
});

test('declared-missing visual is valid and a beat without any visual is a gap', async () => {
  const declared = await validBundle();
  declared.visuals[3] = { visualId: 'v-practice', beatId: 'practice', requested: 'none', declaredMissing: true, reason: 'No visual for this practice beat; the slide carries the task.' };
  const first = api.validateTopicBundle(declared);
  assert.equal(first.valid, true, JSON.stringify(first.problems, null, 2));
  assert.equal(first.capabilities[3].capability, 'none');
  assert.equal(first.capabilities[3].declaredMissing, true);
  const missing = await validBundle();
  missing.visuals = missing.visuals.slice(0, 3);
  const second = api.validateTopicBundle(missing);
  assert.equal(second.valid, false);
  assert.ok(hasCode(second, 'missing-visual'));
  const unexpected = await validBundle();
  unexpected.visuals.push({ visualId: 'v-exit', beatId: 'exit', requested: 'diagram', diagram: { kind: 'rect' } });
  assert.ok(hasCode(api.validateTopicBundle(unexpected), 'unexpected-visual'));
  const duplicate = await validBundle();
  duplicate.visuals.push({ visualId: 'v-activate', beatId: 'activate', requested: 'diagram', diagram: { kind: 'rect' } });
  assert.ok(hasCode(api.validateTopicBundle(duplicate), 'duplicate-visual'));
});

test('shape errors fail closed: bad schema, unknown fields, bad blueprint, bad simulation', async () => {
  const badSchema = await validBundle();
  badSchema.schemaVersion = 'topic-bundle.v0';
  assert.ok(hasCode(api.validateTopicBundle(badSchema), 'unsupported-schema'));
  const extraField = await validBundle();
  extraField.surprise = true;
  assert.ok(hasCode(api.validateTopicBundle(extraField), 'unsupported-field'));
  assert.deepEqual(api.validateTopicBundle(null).problems.map(problem => problem.code), ['invalid-bundle']);
  const badBlueprint = await validBundle();
  badBlueprint.blueprint = { schemaVersion: 'nope' };
  const blueprintResult = api.validateTopicBundle(badBlueprint);
  assert.equal(blueprintResult.valid, false);
  assert.ok(blueprintResult.problems.every(problem => problem.path.startsWith('blueprint')));
  const badSimulation = await validBundle();
  badSimulation.simulation.model = 'quantum-field';
  const simulationResult = api.validateTopicBundle(badSimulation);
  assert.equal(simulationResult.valid, false);
  assert.ok(hasCode(simulationResult, 'invalid-simulation'));
  assert.ok(hasCode(simulationResult, 'unsupported-visual'));
  const badPlanDuration = await validBundle();
  badPlanDuration.materials.lessonPlan.durationMinutes = 45;
  badPlanDuration.materials.lessonPlan.activities.forEach(activity => { activity.minutes = 15; });
  assert.ok(hasCode(api.validateTopicBundle(badPlanDuration), 'duration-mismatch'));
});

test('diagnostics answers are checked against canonical examples too', async () => {
  const wrong = await validBundle();
  wrong.materials.diagnostics.hingeQuestions[0].choices[0].text = '3/6';
  const result = api.validateTopicBundle(wrong);
  assert.equal(result.valid, false);
  assert.ok(hasCode(result, 'answer-mismatch'));
});

test('linked question with no checkable answer reports answer-missing', async () => {
  const bundle = await validBundle();
  delete bundle.materials.worksheet.questions[1].answer;
  const result = api.validateTopicBundle(bundle);
  assert.equal(result.valid, false);
  assert.ok(hasCode(result, 'answer-missing'));
  assert.ok(hasCode(result, 'material-invalid'), 'the per-material validator also flags the missing answer');
});

test('fallback identical to the requested capability is rejected', () => {
  const context = { scope: { level: 'primary', subject: 'mathematics', topicId: 'equivalent-fractions' }, sceneIds: [], slideCount: 6, simulation: null };
  const decision = api.resolveVisualCapability(
    { visualId: 'v', beatId: 'b', requested: 'animation', sceneId: 'nope', fallback: 'animation' }, context);
  assert.equal(decision.supported, false);
  assert.match(decision.reason, /fallback must differ from the requested capability/);
});

test('visuals must be an array and visual exampleIds must resolve', async () => {
  const notArray = await validBundle();
  notArray.visuals = { 'v-activate': true };
  assert.ok(hasCode(api.validateTopicBundle(notArray), 'invalid-visuals'));
  const unknownExample = await validBundle();
  unknownExample.visuals[1].exampleId = 'no-such-example';
  const result = api.validateTopicBundle(unknownExample);
  assert.equal(result.valid, false);
  assert.ok(hasCode(result, 'unknown-example'));
  assert.ok(result.problems.some(problem => problem.path === 'visuals[1].exampleId'));
});

test('verifyTopicBundle reports combined validate and hash problems in path order', async () => {
  const bundle = await validBundle();
  bundle.materials.worksheet.questions[1].answer = '5/6';
  const forged = copy(bundle.blueprint);
  forged.revision = '0'.repeat(64);
  bundle.blueprint = forged;
  const result = await api.verifyTopicBundle(bundle);
  assert.equal(result.valid, false);
  assert.ok(hasCode(result, 'answer-mismatch'));
  assert.ok(result.problems.some(problem => problem.path === 'blueprint.revision'));
  const paths = result.problems.map(problem => problem.path);
  assert.deepEqual(paths, [...paths].sort(), 'problems are sorted by path');
});

test('browser build: UMD globals load and resolve without Node require', async () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const context = vm.createContext({ crypto: globalThis.crypto, TextEncoder });
  for (const file of ['../generator/approved-assets.js', '../player/simulation-kit.js', '../player/validate.js', '../generator/lesson-blueprint.js', '../generator/cross-material-validator.js']) {
    vm.runInContext(fs.readFileSync(require.resolve(file), 'utf8'), context, { filename: require.resolve(file) });
  }
  const decision = vm.runInContext(
    'TeachkitCrossMaterialValidator.resolveVisualCapability(' +
    JSON.stringify({ visualId: 'v', beatId: 'explain', requested: 'simulation', model: 'fraction-bars' }) + ',' +
    JSON.stringify({ scope: { level: 'primary', subject: 'mathematics', topicId: 'equivalent-fractions' }, sceneIds: [], slideCount: 0, simulation: null }) + ')',
    context);
  assert.equal(decision.supported, true);
  assert.equal(decision.capability, 'simulation');
  const bundle = await validBundle();
  const result = vm.runInContext(
    'TeachkitCrossMaterialValidator.validateTopicBundle(' + JSON.stringify(bundle) + ')', context);
  assert.equal(result.valid, true, JSON.stringify(result.problems, null, 2));
});
