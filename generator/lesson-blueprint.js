/* Frozen, topic-wide authoring contract. No models, storage or publication.
 * Hosts must resolve the complete, currently approved Core curriculum snapshot.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./approved-assets.js'));
  else root.TeachkitLessonBlueprint = factory(root.TeachkitAssetStore);
})(typeof window !== 'undefined' ? window : globalThis, function (assets) {
  'use strict';
  var schemaVersion = 'lesson-blueprint.v1';
  var hashPattern = /^[a-f0-9]{64}$/;
  var idPattern = /^[A-Za-z0-9][A-Za-z0-9:._\/-]{0,127}$/;
  var scopeFields = ['country', 'authority', 'curriculumReleaseId', 'syllabus', 'syllabusVersion', 'level', 'grade', 'subject', 'topicId', 'locale'];
  function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
  function dataProperties(value) {
    return !Object.getOwnPropertySymbols(value).length && !Object.getOwnPropertyNames(value).some(function (key) {
      var descriptor = Object.getOwnPropertyDescriptor(value, key);
      return !descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value');
    });
  }
  function record(value) { return object(value) && dataProperties(value); }
  function array(value) {
    if (!Array.isArray(value)) return false;
    for (var index = 0; index < value.length; index++) {
      var descriptor = Object.getOwnPropertyDescriptor(value, index);
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) return false;
    }
    return true;
  }
  function shape(value, keys, path, errors) {
    if (!object(value)) { errors.push(path + ': expected plain object'); return false; }
    if (!dataProperties(value)) { errors.push(path + ': expected plain JSON data properties'); return false; }
    Object.keys(value).forEach(function (key) {
      if (keys.indexOf(key) < 0) errors.push(path + '.' + key + ': unsupported field');
    });
    keys.forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(path + '.' + key + ': required');
    });
    return true;
  }
  function text(value, path, errors) {
    if (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > 8000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) errors.push(path + ': expected bounded nonempty text');
  }
  function id(value, path, errors) {
    if (typeof value !== 'string' || !idPattern.test(value)) errors.push(path + ': expected stable identifier');
  }
  function hash(value, path, errors) {
    if (typeof value !== 'string' || !hashPattern.test(value)) errors.push(path + ': expected SHA-256');
  }
  function list(value, path, errors, visit, minimum) {
    if (!Array.isArray(value) || value.length < minimum || value.length > 200) { errors.push(path + ': expected bounded array (minimum ' + minimum + ')'); return []; }
    var valid = true;
    for (var index = 0; index < value.length; index++) {
      var descriptor = Object.getOwnPropertyDescriptor(value, index);
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) { errors.push(path + '[' + index + ']: sparse arrays and accessors are not supported'); valid = false; }
    }
    if (!valid) return [];
    value.forEach(function (item, index) { visit(item, path + '[' + index + ']', errors); });
    return value;
  }
  function refs(value, path, errors, known, minimum) {
    var seen = new Set();
    list(value, path, errors, function (ref, at) {
      id(ref, at, errors);
      if (seen.has(ref)) errors.push(at + ': duplicate reference');
      if (!known.has(ref)) errors.push(at + ': unknown reference ' + String(ref));
      seen.add(ref);
    }, minimum);
  }
  function unique(items, field, path, errors) {
    var seen = new Set();
    items.forEach(function (item, index) {
      if (!record(item)) return;
      if (seen.has(item[field])) errors.push(path + '[' + index + '].' + field + ': duplicate identifier');
      seen.add(item[field]);
    });
    return seen;
  }
  function validateRequest(request) {
    var errors = [];
    if (!shape(request, ['scope', 'objectives', 'sources', 'generation', 'parameters'], 'request', errors)) return errors;
    if (shape(request.scope, scopeFields, 'request.scope', errors)) {
      scopeFields.forEach(function (key) { text(request.scope[key], 'request.scope.' + key, errors); });
      if (typeof request.scope.grade !== 'string' || /^(primary|secondary|jc|all|any)$/i.test(request.scope.grade)) errors.push('request.scope.grade: exact grade required');
      if (typeof request.scope.locale !== 'string' || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(request.scope.locale)) errors.push('request.scope.locale: expected language tag');
    }
    if (shape(request.generation, ['generatorVersion', 'model', 'promptVersion', 'validatorVersion'], 'request.generation', errors)) {
      Object.keys(request.generation).forEach(function (key) { text(request.generation[key], 'request.generation.' + key, errors); });
    }
    if (shape(request.parameters, ['durationMinutes', 'difficulty'], 'request.parameters', errors)) {
      if (!Number.isInteger(request.parameters.durationMinutes) || request.parameters.durationMinutes < 1 || request.parameters.durationMinutes > 180) errors.push('request.parameters.durationMinutes: expected 1..180');
      if (['support', 'standard', 'stretch'].indexOf(request.parameters.difficulty) < 0) errors.push('request.parameters.difficulty: unsupported difficulty');
    }
    var claims = new Set();
    var sources = list(request.sources, 'request.sources', errors, function (source, path) {
      if (!shape(source, ['sourceId', 'revision', 'contentHash', 'claims'], path, errors)) return;
      id(source.sourceId, path + '.sourceId', errors); text(source.revision, path + '.revision', errors); hash(source.contentHash, path + '.contentHash', errors);
      list(source.claims, path + '.claims', errors, function (claim, at) {
        if (!shape(claim, ['claimId', 'text'], at, errors)) return;
        id(claim.claimId, at + '.claimId', errors); text(claim.text, at + '.text', errors);
        if (claims.has(claim.claimId)) errors.push(at + '.claimId: duplicate or conflicting source claim');
        claims.add(claim.claimId);
      }, 1);
    }, 1);
    unique(sources, 'sourceId', 'request.sources', errors);
    var objectives = list(request.objectives, 'request.objectives', errors, function (objective, path) {
      if (!shape(objective, ['objectiveId', 'revision', 'contentHash', 'text', 'sourceClaimIds'], path, errors)) return;
      id(objective.objectiveId, path + '.objectiveId', errors); text(objective.revision, path + '.revision', errors);
      hash(objective.contentHash, path + '.contentHash', errors); text(objective.text, path + '.text', errors);
      refs(objective.sourceClaimIds, path + '.sourceClaimIds', errors, claims, 1);
    }, 1);
    unique(objectives, 'objectiveId', 'request.objectives', errors);
    return errors;
  }
  function normalizeRequest(request) {
    var errors = validateRequest(request);
    if (errors.length) throw new Error(errors.join('\n'));
    var result = JSON.parse(assets.canonical(request));
    result.scope.locale = result.scope.locale.toLowerCase();
    result.objectives.sort(function (a, b) { return a.objectiveId < b.objectiveId ? -1 : 1; });
    result.objectives.forEach(function (objective) { objective.sourceClaimIds.sort(); });
    result.sources.sort(function (a, b) { return a.sourceId < b.sourceId ? -1 : 1; });
    result.sources.forEach(function (source) { source.claims.sort(function (a, b) { return a.claimId < b.claimId ? -1 : 1; }); });
    return result;
  }
  async function topicBlueprintIdentity(request) {
    return assets.sha256(assets.canonical({ schemaVersion: schemaVersion, request: normalizeRequest(request) }));
  }
  function contentErrors(request, content) {
    var errors = [];
    if (!shape(content, ['prerequisites', 'definitions', 'misconceptions', 'examples', 'beats', 'assessments'], 'content', errors)) return errors;
    var claims = new Set(); request.sources.forEach(function (source) { source.claims.forEach(function (claim) { claims.add(claim.claimId); }); });
    var objectives = new Set(request.objectives.map(function (objective) { return objective.objectiveId; }));
    function sourced(item, path) { refs(item.sourceClaimIds, path + '.sourceClaimIds', errors, claims, 1); }
    var prerequisites = list(content.prerequisites, 'content.prerequisites', errors, function (item, path) {
      if (!shape(item, ['id', 'text', 'sourceClaimIds'], path, errors)) return;
      id(item.id, path + '.id', errors); text(item.text, path + '.text', errors); sourced(item, path);
    }, 0);
    var definitions = list(content.definitions, 'content.definitions', errors, function (item, path) {
      if (!shape(item, ['id', 'term', 'meaning', 'sourceClaimIds'], path, errors)) return;
      id(item.id, path + '.id', errors); text(item.term, path + '.term', errors); text(item.meaning, path + '.meaning', errors); sourced(item, path);
    }, 1);
    var misconceptions = list(content.misconceptions, 'content.misconceptions', errors, function (item, path) {
      if (!shape(item, ['id', 'objectiveId', 'incorrect', 'correction', 'sourceClaimIds'], path, errors)) return;
      id(item.id, path + '.id', errors); refs([item.objectiveId], path + '.objectiveId', errors, objectives, 1);
      text(item.incorrect, path + '.incorrect', errors); text(item.correction, path + '.correction', errors); sourced(item, path);
    }, 0);
    var examples = list(content.examples, 'content.examples', errors, function (item, path) {
      if (!shape(item, ['id', 'objectiveIds', 'statement', 'steps', 'answer', 'unit', 'quantities', 'sourceClaimIds'], path, errors)) return;
      id(item.id, path + '.id', errors); refs(item.objectiveIds, path + '.objectiveIds', errors, objectives, 1);
      text(item.statement, path + '.statement', errors); list(item.steps, path + '.steps', errors, text, 1); text(item.answer, path + '.answer', errors);
      if (typeof item.unit !== 'string' || item.unit.length > 128) errors.push(path + '.unit: expected bounded unit');
      var quantities = list(item.quantities, path + '.quantities', errors, function (quantity, at) {
        if (!shape(quantity, ['id', 'value', 'unit'], at, errors)) return;
        id(quantity.id, at + '.id', errors);
        if (typeof quantity.value !== 'number' || !Number.isFinite(quantity.value) || Math.abs(quantity.value) > 1e12) errors.push(at + '.value: expected finite quantity in -1e12..1e12');
        if (typeof quantity.unit !== 'string' || quantity.unit.length > 128 || /[\u0000-\u001f\u007f]/.test(quantity.unit)) errors.push(at + '.unit: expected bounded unit');
      }, 0);
      unique(quantities, 'id', path + '.quantities', errors);
      sourced(item, path);
    }, 1);
    unique(prerequisites, 'id', 'content.prerequisites', errors);
    var definitionIds = unique(definitions, 'id', 'content.definitions', errors);
    var misconceptionIds = unique(misconceptions, 'id', 'content.misconceptions', errors);
    var exampleIds = unique(examples, 'id', 'content.examples', errors);
    var coverage = new Set(), seconds = 0;
    var beats = list(content.beats, 'content.beats', errors, function (beat, path) {
      if (!shape(beat, ['beatId', 'objectiveIds', 'kind', 'durationSeconds', 'explanation', 'successCriteria', 'expectedEvidence', 'exampleIds', 'definitionIds', 'misconceptionIds', 'visual', 'sourceClaimIds'], path, errors)) return;
      id(beat.beatId, path + '.beatId', errors); refs(beat.objectiveIds, path + '.objectiveIds', errors, objectives, 1);
      if (array(beat.objectiveIds)) beat.objectiveIds.forEach(function (ref) { coverage.add(ref); });
      if (['activate', 'explain', 'predict', 'practice', 'feedback', 'exit'].indexOf(beat.kind) < 0) errors.push(path + '.kind: unsupported beat kind');
      if (!Number.isInteger(beat.durationSeconds) || beat.durationSeconds < 1 || beat.durationSeconds > 10800) errors.push(path + '.durationSeconds: expected positive bounded seconds');
      else seconds += beat.durationSeconds;
      text(beat.explanation, path + '.explanation', errors); text(beat.expectedEvidence, path + '.expectedEvidence', errors);
      list(beat.successCriteria, path + '.successCriteria', errors, text, 1);
      refs(beat.exampleIds, path + '.exampleIds', errors, exampleIds, 0); refs(beat.definitionIds, path + '.definitionIds', errors, definitionIds, 0);
      refs(beat.misconceptionIds, path + '.misconceptionIds', errors, misconceptionIds, 0);
      examples.forEach(function (example) {
        if (record(example) && array(beat.exampleIds) && beat.exampleIds.indexOf(example.id) >= 0 &&
            array(example.objectiveIds) && array(beat.objectiveIds) &&
            !example.objectiveIds.some(function (ref) { return beat.objectiveIds.indexOf(ref) >= 0; })) errors.push(path + '.exampleIds: example does not cover beat objectives');
      });
      misconceptions.forEach(function (misconception) {
        if (record(misconception) && array(beat.misconceptionIds) && beat.misconceptionIds.indexOf(misconception.id) >= 0 &&
            array(beat.objectiveIds) && beat.objectiveIds.indexOf(misconception.objectiveId) < 0) errors.push(path + '.misconceptionIds: misconception does not cover beat objectives');
      });
      if (['simulation', 'animation', 'diagram', 'none'].indexOf(beat.visual) < 0) errors.push(path + '.visual: unsupported recommendation');
      sourced(beat, path);
    }, 1);
    var beatIds = unique(beats, 'beatId', 'content.beats', errors);
    if (seconds !== request.parameters.durationMinutes * 60) errors.push('content.beats: duration must equal requested lesson duration');
    objectives.forEach(function (objective) { if (!coverage.has(objective)) errors.push('content.beats: objective not taught ' + objective); });
    var assessed = new Set();
    var assessments = list(content.assessments, 'content.assessments', errors, function (item, path) {
      if (!shape(item, ['assessmentId', 'objectiveId', 'beatId', 'phase', 'prompt', 'expectedAnswer', 'rubric', 'misconceptionIds', 'exampleId', 'sourceClaimIds'], path, errors)) return;
      id(item.assessmentId, path + '.assessmentId', errors); refs([item.objectiveId], path + '.objectiveId', errors, objectives, 1);
      refs([item.beatId], path + '.beatId', errors, beatIds, 1);
      var beat = beats.find(function (candidate) { return record(candidate) && candidate.beatId === item.beatId; });
      if (beat && array(beat.objectiveIds) && beat.objectiveIds.indexOf(item.objectiveId) < 0) errors.push(path + '.beatId: beat does not teach assessment objective');
      assessed.add(item.objectiveId);
      if (['diagnostic', 'formative', 'exit'].indexOf(item.phase) < 0) errors.push(path + '.phase: unsupported assessment phase');
      text(item.prompt, path + '.prompt', errors); text(item.expectedAnswer, path + '.expectedAnswer', errors);
      list(item.rubric, path + '.rubric', errors, function (criterion, at) {
        if (!shape(criterion, ['criterion', 'marks'], at, errors)) return;
        text(criterion.criterion, at + '.criterion', errors);
        if (!Number.isInteger(criterion.marks) || criterion.marks < 1 || criterion.marks > 100) errors.push(at + '.marks: expected 1..100');
      }, 1);
      refs(item.misconceptionIds, path + '.misconceptionIds', errors, misconceptionIds, 0);
      misconceptions.forEach(function (misconception) {
        if (record(misconception) && array(item.misconceptionIds) && item.misconceptionIds.indexOf(misconception.id) >= 0 && misconception.objectiveId !== item.objectiveId) errors.push(path + '.misconceptionIds: misconception does not cover assessment objective');
      });
      if (item.exampleId !== null) {
        refs([item.exampleId], path + '.exampleId', errors, exampleIds, 1);
        var example = examples.find(function (candidate) { return record(candidate) && candidate.id === item.exampleId; });
        if (example && item.expectedAnswer !== example.answer) errors.push(path + '.expectedAnswer: differs from canonical example answer');
        if (example && array(example.objectiveIds) && example.objectiveIds.indexOf(item.objectiveId) < 0) errors.push(path + '.exampleId: example does not cover objective');
      }
      sourced(item, path);
    }, 1);
    unique(assessments, 'assessmentId', 'content.assessments', errors);
    objectives.forEach(function (objective) { if (!assessed.has(objective)) errors.push('content.assessments: objective not assessed ' + objective); });
    return errors;
  }
  function validateLessonBlueprint(blueprint, expectedRequest) {
    var errors = [];
    if (!shape(blueprint, ['schemaVersion', 'identity', 'revision', 'request', 'content'], 'blueprint', errors)) return errors;
    if (blueprint.schemaVersion !== schemaVersion) errors.push('blueprint.schemaVersion: unsupported schema');
    hash(blueprint.identity, 'blueprint.identity', errors); hash(blueprint.revision, 'blueprint.revision', errors);
    var requestErrors = validateRequest(blueprint.request); errors = errors.concat(requestErrors);
    if (!requestErrors.length) {
      errors = errors.concat(contentErrors(blueprint.request, blueprint.content));
      if (expectedRequest !== undefined) {
        try { if (assets.canonical(normalizeRequest(blueprint.request)) !== assets.canonical(normalizeRequest(expectedRequest))) errors.push('blueprint.request: expected curriculum snapshot mismatch'); }
        catch (error) { errors.push('expectedRequest: ' + error.message); }
      }
    }
    return errors;
  }
  function freeze(value) {
    if (value && typeof value === 'object') { Object.keys(value).forEach(function (key) { freeze(value[key]); }); Object.freeze(value); }
    return value;
  }
  async function createLessonBlueprint(request, content) {
    var snapshot = normalizeRequest(request), errors = contentErrors(snapshot, content);
    if (errors.length) throw new Error(errors.join('\n'));
    var copied = JSON.parse(assets.canonical(content));
    var identity = await topicBlueprintIdentity(snapshot);
    var revision = await assets.sha256(assets.canonical({ schemaVersion: schemaVersion, identity: identity, content: copied }));
    return freeze({ schemaVersion: schemaVersion, identity: identity, revision: revision, request: snapshot, content: copied });
  }
  async function verifyLessonBlueprint(blueprint, expectedRequest) {
    var errors = validateLessonBlueprint(blueprint, expectedRequest);
    if (errors.length) return errors;
    if (await topicBlueprintIdentity(blueprint.request) !== blueprint.identity) errors.push('blueprint.identity: hash mismatch');
    if (await assets.sha256(assets.canonical({ schemaVersion: schemaVersion, identity: blueprint.identity, content: blueprint.content })) !== blueprint.revision) errors.push('blueprint.revision: hash mismatch');
    return errors;
  }
  return { schemaVersion: schemaVersion, validateRequest: validateRequest, topicBlueprintIdentity: topicBlueprintIdentity,
    createLessonBlueprint: createLessonBlueprint, validateLessonBlueprint: validateLessonBlueprint, verifyLessonBlueprint: verifyLessonBlueprint };
});
