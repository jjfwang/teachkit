'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('../generator/lesson-blueprint.js');
const fixtures = require('./fixtures/topic-blueprints.json');
const copy = value => JSON.parse(JSON.stringify(value));

test('frozen topic-wide fixtures cover P5, Secondary Science and JC Maths without mutation', async () => {
  for (const fixture of Object.values(fixtures)) {
    const original = copy(fixture);
    const blueprint = await api.createLessonBlueprint(fixture.request, fixture.content);
    assert.equal(blueprint.schemaVersion, 'lesson-blueprint.v1');
    assert.match(blueprint.identity, /^[a-f0-9]{64}$/);
    assert.match(blueprint.revision, /^[a-f0-9]{64}$/);
    assert.deepEqual(await api.verifyLessonBlueprint(blueprint, fixture.request), []);
    assert.equal(blueprint.content.beats.reduce((sum, beat) => sum + beat.durationSeconds, 0), 1800);
    assert.equal(blueprint.request.objectives.length, 2);
    assert.ok(Object.isFrozen(blueprint.content.beats[0].objectiveIds));
    assert.ok(Object.isFrozen(blueprint.content.examples[0].quantities));
    assert.ok(Object.isFrozen(blueprint.request.sources[0].claims[0]));
    assert.throws(() => { blueprint.content.beats[0].explanation = 'changed'; }, TypeError);
    assert.deepEqual(fixture, original);
  }
  // Independently solve the actual frozen fraction examples, not the authoring code.
  const comparison = [...fixtures.p5.content.examples[0].statement.matchAll(/(\d+)\/(\d+)/g)];
  assert.equal(Number(comparison[0][1]) * Number(comparison[1][2]), Number(comparison[1][1]) * Number(comparison[0][2]));
  const scaling = fixtures.p5.content.examples[1];
  const originalFraction = scaling.statement.match(/(\d+)\/(\d+)/);
  const requiredDenominator = scaling.statement.match(/denominator (\d+)/);
  const answerFraction = scaling.answer.match(/^(\d+)\/(\d+)$/);
  assert.equal(Number(answerFraction[2]), Number(requiredDenominator[1]));
  assert.equal(Number(originalFraction[1]) * Number(answerFraction[2]), Number(answerFraction[1]) * Number(originalFraction[2]));
  const quantities = Object.fromEntries(scaling.quantities.map(quantity => [quantity.id, quantity.value]));
  assert.deepEqual(quantities, { numerator: Number(originalFraction[1]), denominator: Number(originalFraction[2]), equivalentNumerator: Number(answerFraction[1]), equivalentDenominator: Number(answerFraction[2]) });
  assert.equal(2 * 2 - 4, 0);
  assert.equal(2 ** 2 - 4 * 2, -4);
  assert.equal(fixtures.jc.content.examples[1].answer, '(2, −4)');
});

test('full-topic identity is independent of selected objective, source order and locale casing', async () => {
  const { request } = fixtures.p5;
  const reordered = copy(request);
  reordered.objectives.reverse();
  reordered.objectives.forEach(objective => objective.sourceClaimIds.reverse());
  reordered.sources.reverse();
  reordered.sources.forEach(source => source.claims.reverse());
  reordered.scope.locale = 'EN-sg';
  assert.equal(await api.topicBlueprintIdentity(request), await api.topicBlueprintIdentity(reordered));
  // A session's selected objective is deliberately outside this authoring contract.
  assert.ok(api.validateRequest({ ...request, selectedObjectiveId: request.objectives[0].objectiveId }).some(error => error.includes('unsupported field')));
  const twoSources = copy(request);
  twoSources.sources.push({ sourceId: 'other-source', revision: '2', contentHash: 'c'.repeat(64), claims: [{ claimId: 'other-claim', text: 'A second source.' }] });
  const reverseSources = copy(twoSources); reverseSources.sources.reverse();
  assert.equal(await api.topicBlueprintIdentity(twoSources), await api.topicBlueprintIdentity(reverseSources));
  const twoClaims = copy(request); twoClaims.objectives[1].sourceClaimIds.push('fractions.same-value');
  const reverseClaims = copy(twoClaims); reverseClaims.objectives[1].sourceClaimIds.reverse();
  assert.equal(await api.topicBlueprintIdentity(twoClaims), await api.topicBlueprintIdentity(reverseClaims));
});

test('identity separates every release/grade/topic/language/source/objective and generation dimension', async () => {
  const original = await api.topicBlueprintIdentity(fixtures.p5.request);
  const mutations = [
    ...['country', 'authority', 'curriculumReleaseId', 'syllabus', 'syllabusVersion', 'level', 'grade', 'subject', 'topicId'].map(key => request => { request.scope[key] += '-changed'; }),
    request => { request.scope.locale = 'zh-SG'; },
    request => { request.objectives.pop(); },
    request => { request.objectives[0].revision = '2'; },
    request => { request.objectives[0].contentHash = 'a'.repeat(64); },
    request => { request.objectives[0].text += ' Changed.'; },
    request => { request.sources[0].revision = '2'; },
    request => { request.sources[0].contentHash = 'b'.repeat(64); },
    request => { request.sources[0].claims[0].text += ' Changed.'; },
    ...['generatorVersion', 'model', 'promptVersion', 'validatorVersion'].map(key => request => { request.generation[key] += '-changed'; }),
    request => { request.parameters.difficulty = 'stretch'; },
    request => { request.parameters.durationMinutes = 20; },
  ];
  for (const mutate of mutations) {
    const request = copy(fixtures.p5.request); mutate(request);
    assert.notEqual(await api.topicBlueprintIdentity(request), original);
  }
});

test('request validation rejects missing, conflicting, duplicate, private and malformed input', async () => {
  const cases = [
    [null, 'plain object'],
    [{}, 'required'],
    [{ ...fixtures.p5.request, studentId: 'private' }, 'unsupported field'],
  ];
  const mutations = [
    [request => { request.scope = null; }, 'request.scope'],
    [request => { request.scope.grade = 'primary'; }, 'exact grade'],
    [request => { request.scope.grade = 5; }, 'exact grade'],
    [request => { request.scope.locale = 'not a language'; }, 'language tag'],
    [request => { request.scope.locale = null; }, 'language tag'],
    [request => { request.scope.subject = ' '; }, 'nonempty text'],
    [request => { request.generation = null; }, 'request.generation'],
    [request => { request.generation.model = '\u0000'; }, 'nonempty text'],
    [request => { request.parameters = null; }, 'request.parameters'],
    [request => { request.parameters.durationMinutes = 0; }, '1..180'],
    [request => { request.parameters.difficulty = 'unknown'; }, 'difficulty'],
    [request => { request.sources = []; }, 'bounded array'],
    [request => { request.sources = [null]; }, 'plain object'],
    [request => { request.sources[0].sourceId = 'with space'; }, 'identifier'],
    [request => { request.sources[0].contentHash = 42; }, 'SHA-256'],
    [request => { request.sources[0].claims = [null]; }, 'plain object'],
    [request => { request.sources[0].claims.push(copy(request.sources[0].claims[0])); }, 'conflicting source claim'],
    [request => { request.sources.push(copy(request.sources[0])); }, 'duplicate identifier'],
    [request => { request.objectives = new Array(2); }, 'sparse'],
    [request => { request.objectives = Array(201).fill(null); }, 'bounded array'],
    [request => { request.objectives = [null]; }, 'plain object'],
    [request => { request.objectives.push(copy(request.objectives[0])); }, 'duplicate identifier'],
    [request => { request.objectives[0].sourceClaimIds = ['missing']; }, 'unknown reference'],
    [request => { request.objectives[0].sourceClaimIds.push(request.objectives[0].sourceClaimIds[0]); }, 'duplicate reference'],
    [request => { request.objectives[0].contentHash = 'BAD'; }, 'SHA-256'],
  ];
  for (const [mutate, expected] of mutations) {
    const request = copy(fixtures.p5.request); mutate(request); cases.push([request, expected]);
  }
  for (const [request, expected] of cases) {
    assert.ok(api.validateRequest(request).some(error => error.includes(expected)), expected);
    await assert.rejects(api.topicBlueprintIdentity(request), new RegExp(expected.replaceAll('.', '\\.')));
  }
});

test('blueprint structural validation fails closed at every material reference and coverage boundary', async () => {
  const blueprint = await api.createLessonBlueprint(fixtures.p5.request, fixtures.p5.content);
  const mutations = [
    [value => { value.schemaVersion = 'future'; }, 'schemaVersion'],
    [value => { value.identity = null; }, 'SHA-256'],
    [value => { value.request = null; }, 'plain object'],
    [value => { value.content = null; }, 'plain object'],
    [value => { value.content.prerequisites = [null]; }, 'plain object'],
    [value => { value.content.definitions = [null]; }, 'plain object'],
    [value => { value.content.misconceptions = [null]; }, 'plain object'],
    [value => { value.content.examples = [null]; }, 'plain object'],
    [value => { value.content.beats = [null]; }, 'plain object'],
    [value => { value.content.assessments = [null]; }, 'plain object'],
    [value => { value.content.definitions[0].privateAnswers = []; }, 'unsupported field'],
    [value => { value.content.examples[0].unit = null; }, 'bounded unit'],
    [value => { value.content.examples[0].unit = 'u'.repeat(129); }, 'bounded unit'],
    [value => { delete value.content.examples[0].quantities; }, 'quantities: required'],
    [value => { value.content.examples[0].quantities = [null]; }, 'plain object'],
    [value => { value.content.examples[0].quantities[0].private = 'not allowed'; }, 'unsupported field'],
    [value => { value.content.examples[0].quantities[0].id = 'not an id'; }, 'stable identifier'],
    [value => { value.content.examples[0].quantities.push(copy(value.content.examples[0].quantities[0])); }, 'duplicate identifier'],
    ...[null, '1', Infinity, NaN, 1e12 + 1, -1e12 - 1].map(quantity => [value => { value.content.examples[0].quantities[0].value = quantity; }, 'finite quantity']),
    ...[null, '\u0000', 'm'.repeat(129)].map(unit => [value => { value.content.examples[0].quantities[0].unit = unit; }, 'bounded unit']),
    [value => { value.content.beats[0].kind = 'unknown'; }, 'beat kind'],
    [value => { value.content.beats[0].visual = 'arbitrary-code'; }, 'recommendation'],
    [value => { value.content.beats[0].durationSeconds = 0; }, 'positive bounded seconds'],
    [value => { value.content.beats[0].durationSeconds -= 1; }, 'duration must equal'],
    [value => { value.content.beats.forEach(beat => { beat.objectiveIds = ['P5-EF-2']; }); }, 'objective not taught'],
    [value => { value.content.beats[0].exampleIds = ['missing']; }, 'unknown reference'],
    [value => { value.content.beats[0].exampleIds = ['thirds-sixths']; }, 'example does not cover beat'],
    [value => { value.content.beats[0].misconceptionIds = ['scale-both']; }, 'misconception does not cover beat'],
    [value => { value.content.assessments[0].misconceptionIds = ['scale-both']; }, 'misconception does not cover assessment'],
    [value => { value.content.assessments[0].beatId = 'practice'; }, 'does not teach assessment objective'],
    [value => { value.content.assessments[0].beatId = 'missing'; }, 'unknown reference'],
    [value => { value.content.assessments[0].phase = 'unknown'; }, 'assessment phase'],
    [value => { value.content.assessments[0].expectedAnswer = '3/4'; }, 'canonical example answer'],
    [value => { value.content.assessments[0].exampleId = 'thirds-sixths'; }, 'example does not cover objective'],
    [value => { value.content.assessments[0].rubric = [null]; }, 'plain object'],
    [value => { value.content.assessments[0].rubric[0].marks = 0; }, '1..100'],
    [value => { value.content.assessments = value.content.assessments.slice(0, 1); }, 'objective not assessed'],
    [value => { value.content.beats = new Array(5); }, 'sparse'],
  ];
  assert.ok(api.validateLessonBlueprint(null).length);
  for (const [mutate, expected] of mutations) {
    const changed = copy(blueprint); mutate(changed);
    assert.ok(api.validateLessonBlueprint(changed).some(error => error.includes(expected)), expected);
    assert.ok((await api.verifyLessonBlueprint(changed)).length);
  }
  const changed = copy(blueprint); changed.content.beats[0].explanation = 'Different wording.';
  assert.deepEqual(api.validateLessonBlueprint(changed), []);
  assert.ok((await api.verifyLessonBlueprint(changed)).some(error => error.includes('revision: hash mismatch')));
  changed.identity = '0'.repeat(64);
  assert.ok((await api.verifyLessonBlueprint(changed)).some(error => error.includes('identity: hash mismatch')));
  const other = copy(fixtures.p5.request); other.scope.grade = 'P6';
  assert.ok(api.validateLessonBlueprint(blueprint, other).some(error => error.includes('snapshot mismatch')));
  assert.ok(api.validateLessonBlueprint(blueprint, {}).some(error => error.startsWith('expectedRequest:')));
  const alternate = copy(fixtures.p5.content); alternate.assessments[0].exampleId = null;
  assert.deepEqual(await api.verifyLessonBlueprint(await api.createLessonBlueprint(fixtures.p5.request, alternate)), []);
  await assert.rejects(api.createLessonBlueprint(fixtures.p5.request, {}), /required/);
});

test('canonical numerical quantities are immutable revision data with finite bounds', async () => {
  const { request, content } = copy(fixtures.p5);
  content.examples[0].quantities.push({ id: 'negative-bound', value: -1e12, unit: 'm' }, { id: 'positive-bound', value: 1e12, unit: 'm' }, { id: 'decimal', value: 0.5, unit: '' });
  const first = await api.createLessonBlueprint(request, content);
  assert.ok(Object.isFrozen(first.content.examples[0].quantities[0]));
  assert.throws(() => { first.content.examples[0].quantities[0].value = 3; }, TypeError);
  content.examples[0].quantities[0].value = 3;
  const second = await api.createLessonBlueprint(request, content);
  assert.equal(first.identity, second.identity);
  assert.notEqual(first.revision, second.revision);
  const corrupted = copy(first); corrupted.content.examples[0].quantities[0].value = 3;
  assert.ok((await api.verifyLessonBlueprint(corrupted)).some(error => error.includes('revision: hash mismatch')));
});

test('malformed documents and sparse arrays return diagnostics rather than throw', async () => {
  const blueprint = await api.createLessonBlueprint(fixtures.p5.request, fixtures.p5.content);
  const candidates = [undefined, null, [], 'text', 7, true, Object.create(null)];
  for (const candidate of candidates) {
    assert.doesNotThrow(() => api.validateRequest(candidate));
    assert.doesNotThrow(() => api.validateLessonBlueprint(candidate));
    for (const key of Object.keys(blueprint.content)) {
      const changed = copy(blueprint); changed.content[key] = candidate;
      assert.doesNotThrow(() => api.validateLessonBlueprint(changed));
      if (!Array.isArray(candidate) || !['prerequisites', 'misconceptions'].includes(key)) assert.ok(api.validateLessonBlueprint(changed).length);
    }
  }
  const accessor = copy(fixtures.p5.request);
  Object.defineProperty(accessor.scope, 'grade', { enumerable: true, get() { throw new Error('must never execute'); } });
  assert.ok(api.validateRequest(accessor).some(error => error.includes('JSON data properties')));
  const hidden = copy(fixtures.p5.request);
  Object.defineProperty(hidden, 'scope', { enumerable: false });
  assert.ok(api.validateRequest(hidden).some(error => error.includes('JSON data properties')));
  const symbol = copy(fixtures.p5.request); symbol[Symbol('private')] = 'private';
  assert.ok(api.validateRequest(symbol).some(error => error.includes('JSON data properties')));
  const arrayAccessor = copy(fixtures.p5.request);
  Object.defineProperty(arrayAccessor.objectives, 0, { get() { throw new Error('must never execute'); } });
  assert.ok(api.validateRequest(arrayAccessor).some(error => error.includes('accessors')));
  for (const [collection, field] of [['beats', 'objectiveIds'], ['examples', 'objectiveIds'], ['beats', 'exampleIds'], ['beats', 'misconceptionIds'], ['assessments', 'misconceptionIds']]) {
    const changed = copy(blueprint);
    Object.defineProperty(changed.content[collection][0][field], 0, { get() { throw new Error('must never execute'); } });
    assert.doesNotThrow(() => api.validateLessonBlueprint(changed));
    assert.ok(api.validateLessonBlueprint(changed).length);
  }
  for (const [collection, field] of [['beats', 'beatId'], ['examples', 'id'], ['misconceptions', 'id'], ['assessments', 'assessmentId']]) {
    const changed = copy(blueprint);
    Object.defineProperty(changed.content[collection][0], field, { enumerable: true, get() { throw new Error('must never execute'); } });
    assert.doesNotThrow(() => api.validateLessonBlueprint(changed));
    assert.ok(api.validateLessonBlueprint(changed).length);
  }
});

test('public subpath and UMD browser contract work without storage or provider calls', async () => {
  assert.equal(require('@jjfwang/teachkit/lesson-blueprint').schemaVersion, api.schemaVersion);
  const context = vm.createContext({ crypto: globalThis.crypto, TextEncoder });
  vm.runInContext(fs.readFileSync(require.resolve('../generator/approved-assets.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(require.resolve('../generator/lesson-blueprint.js'), 'utf8'), context, { filename: require.resolve('../generator/lesson-blueprint.js') });
  const identity = await vm.runInContext('TeachkitLessonBlueprint.topicBlueprintIdentity(' + JSON.stringify(fixtures.p5.request) + ')', context);
  assert.equal(identity, await api.topicBlueprintIdentity(fixtures.p5.request));
});
