/* Public topic-to-teaching-bundle generation API (issue #1642).
 * Additive and storage-neutral: one frozen LessonBlueprint (#1640) is
 * authored once per topic + full approved objective set, then plan,
 * slides, chosen visual and assessments are authored from it, each
 * validated by its own beta.2 validator and finally by the #1641
 * cross-material validator + capability resolver. A bundle that fails
 * validation fails closed: generateTopicTeachingBundle rejects with an
 * Error carrying .problems, and nothing is published or cached.
 *
 * - No misconception-bank match is required: the diagnostics validator
 *   is bank-free (it checks misconception codes and rationale shape
 *   only). No animation is required: a beat recommending animation or
 *   simulation on an unsupported subject resolves through the
 *   resolver's explicit diagram / slide-first fallback, or is declared
 *   missing with a reason; core mode authors no animation at all.
 * - No S3, database or filesystem-as-library: the bundle is returned
 *   in memory; the host owns storage, approval and publication. No
 *   student data is accepted anywhere in the request path.
 * - No slug-only reuse: the idempotency key hashes the full scope,
 *   objective/source revisions, mode and generator provenance via the
 *   blueprint identity (design gate 9). generateLessonPack and its
 *   slug-only pack cache are untouched.
 * - All model traffic goes through the caller-supplied
 *   deps.callChat(system, user), like generator/pipeline.js; this
 *   module makes no network calls of its own.
 *
 * Request: the shipped TopicBlueprintRequest fields (scope,
 * objectives, sources, generation, parameters) plus optional
 * mode ('core' | 'extended', default 'core'), optional
 * blueprintContent (host-authored blueprint content; when supplied
 * the blueprint stage skips the model call) and optional
 * reviewStatus ('draft' | 'approved', default 'draft'). Unknown
 * fields are rejected. Stage progress is reported through
 * deps.onProgress(stage, event); per-stage token/latency totals are
 * returned in bundle.progress.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./approved-assets.js'), require('./lesson-blueprint.js'),
      require('./cross-material-validator.js'), require('../player/validate.js'), require('../player/simulation-kit.js'));
  } else {
    /* node:coverage ignore next 3 */
    root.TeachkitTopicBundle = factory(root.TeachkitAssetStore, root.TeachkitLessonBlueprint,
      root.TeachkitCrossMaterialValidator, root.AnimathValidate, root.TeachkitSimulations);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (assets, blueprintApi, validatorApi, validateApi, simulations) {
  'use strict';
  var schemaVersion = 'topic-bundle.v1';
  var MODES = ['core', 'extended'];
  var REVIEW_STATUSES = ['draft', 'approved'];
  var MAX_BULK_TOPICS = 50;
  var DEFAULT_MAX_REPAIRS = 3;
  var DEFAULT_MAX_CROSS_REPAIRS = 2;
  var REQUEST_FIELDS = ['scope', 'objectives', 'sources', 'generation', 'parameters', 'mode', 'blueprintContent', 'reviewStatus'];
  // Cross-material problem path prefixes that name exactly one stage to
  // re-author. 'blueprint' problems are fatal: the frozen blueprint is
  // never repaired by re-authoring materials around it.
  var CROSS_STAGE_PREFIXES = [
    ['materials.lessonPlan', 'lessonPlan'], ['materials.slides', 'slides'],
    ['materials.animation', 'animation'], ['materials.worksheet', 'worksheet'],
    ['materials.diagnostics', 'diagnostics'], ['materials.exitTicket', 'exitTicket'],
    ['materials.quizBank', 'quizBank'], ['visuals', 'visuals'], ['simulation', 'visuals']
  ];
  var ASSESSMENT_STAGES = ['diagnostics', 'worksheet', 'exitTicket'];
  function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
  }
  function clone(value) { return JSON.parse(assets.canonical(value)); }
  function freeze(value) {
    if (value && typeof value === 'object') { Object.keys(value).forEach(function (key) { freeze(value[key]); }); Object.freeze(value); }
    return value;
  }
  async function hash(value) { return assets.sha256(assets.canonical(value)); }
  function isPlainJson(value) {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.every(isPlainJson);
    if (!record(value)) return false;
    return Object.keys(value).every(function (key) { return isPlainJson(value[key]); });
  }
  function requestProjection(request) {
    return { scope: request.scope, objectives: request.objectives, sources: request.sources,
      generation: request.generation, parameters: request.parameters };
  }
  function validateTopicBundleRequest(request) {
    var errors = [];
    if (!record(request)) return ['request: expected plain object'];
    Object.keys(request).forEach(function (key) {
      if (REQUEST_FIELDS.indexOf(key) < 0) errors.push('request.' + key + ': unsupported field');
    });
    ['scope', 'objectives', 'sources', 'generation', 'parameters'].forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(request, key)) errors.push('request.' + key + ': required');
    });
    if (errors.length) return errors;
    errors = errors.concat(blueprintApi.validateRequest(requestProjection(request)));
    if (request.mode !== undefined && MODES.indexOf(request.mode) < 0) errors.push('request.mode: expected core or extended');
    if (request.reviewStatus !== undefined && REVIEW_STATUSES.indexOf(request.reviewStatus) < 0) errors.push('request.reviewStatus: expected draft or approved');
    if (request.blueprintContent !== undefined && !record(request.blueprintContent)) errors.push('request.blueprintContent: expected plain object');
    return errors;
  }
  function normalizeRequest(request) {
    var errors = validateTopicBundleRequest(request);
    if (errors.length) throw new Error(errors.join('\n'));
    var result = clone(request);
    if (result.mode === undefined) result.mode = 'core';
    if (result.reviewStatus === undefined) result.reviewStatus = 'draft';
    return result;
  }
  async function topicBundleScopeKey(request, mode) {
    var normalized = normalizeRequest(request);
    if (mode !== undefined) {
      if (MODES.indexOf(mode) < 0) throw new Error('request.mode: expected core or extended');
      normalized.mode = mode;
    }
    var identity = await blueprintApi.topicBlueprintIdentity(requestProjection(normalized));
    return hash({ schemaVersion: schemaVersion, mode: normalized.mode, blueprintIdentity: identity });
  }
  function extractCall(result) {
    var text = null;
    var usage = null;
    if (typeof result === 'string') text = result;
    else if (record(result)) {
      if (typeof result.content === 'string') text = result.content;
      else if (typeof result.text === 'string') text = result.text;
      if (record(result.usage)) usage = result.usage;
    }
    if (text === null) throw new Error('callChat: expected a JSON string or an object with a content/text string');
    return { text: text, usage: usage };
  }
  function mergeTokens(into, usage) {
    if (!record(usage)) return into;
    var input = usage.inputTokens !== undefined ? usage.inputTokens : usage.promptTokens;
    var output = usage.outputTokens !== undefined ? usage.outputTokens : usage.completionTokens;
    var total = usage.totalTokens;
    if (typeof input === 'number') into.inputTokens = (into.inputTokens || 0) + input;
    if (typeof output === 'number') into.outputTokens = (into.outputTokens || 0) + output;
    if (typeof total === 'number') into.totalTokens = (into.totalTokens || 0) + total;
    else if (typeof input === 'number' && typeof output === 'number') into.totalTokens = (into.totalTokens || 0) + input + output;
    return into;
  }
  function stagePrompt(stage, context) {
    return {
      system: 'You author one teaching-bundle artifact as JSON only. Return ONLY a single JSON object, no prose, no code fences. ' +
        'Every fact, number, objective id, beat id, example id and answer must come from the frozen blueprint context supplied; ' +
        'never invent objectives, examples, answers or scene ids.',
      user: { stage: stage, schemaVersion: schemaVersion, mode: context.mode, scope: context.scope,
        blueprintIdentity: context.blueprintIdentity, blueprint: context.blueprintSummary, problems: context.problems || null,
        previous: context.previous || null }
    };
  }
  // One authored artifact with bounded targeted repair. validate is a
  // function (doc) -> string[] | Promise<string[]>; an empty array means
  // the artifact is valid. Returns { doc, attempts }.
  async function authorStage(ctx, stage, context, validate, seedProblems) {
    var started = Date.now();
    var tokens = {};
    var problems = seedProblems === undefined ? null : seedProblems;
    var previous = null;
    var attempts = 0;
    var maxAttempts = 1 + ctx.maxRepairs;
    ctx.progress(stage, { status: 'started', attempt: 0 });
    while (attempts < maxAttempts) {
      attempts += 1;
      var prompt = stagePrompt(stage, { mode: ctx.mode, scope: ctx.scope, blueprintIdentity: ctx.blueprintIdentity,
        blueprintSummary: ctx.blueprintSummary, problems: problems, previous: previous });
      var reply;
      try {
        reply = extractCall(await ctx.deps.callChat(prompt.system, JSON.stringify(prompt.user)));
      } catch (error) {
        throw new Error(stage + ': callChat failed: ' + error.message);
      }
      mergeTokens(tokens, reply.usage);
      var doc = null;
      var errors = [];
      try { doc = JSON.parse(reply.text); } catch (error) { errors = ['not valid JSON: ' + error.message]; }
      if (doc !== null && !isPlainJson(doc)) errors = ['response is not plain JSON data'];
      if (!errors.length) errors = await validate(doc);
      if (!errors.length) {
        ctx.progress(stage, { status: 'completed', attempt: attempts, tokens: tokens, latencyMs: Date.now() - started });
        return { doc: doc, attempts: attempts };
      }
      problems = errors;
      previous = doc === null ? reply.text.slice(0, 20000) : doc;
      ctx.progress(stage, { status: 'repairing', attempt: attempts, tokens: tokens, latencyMs: Date.now() - started, problems: errors });
    }
    var failure = new Error(stage + ': failed validation after ' + maxAttempts + ' attempts: ' + problems.join('; '));
    failure.stage = stage;
    failure.problems = problems.map(function (message) { return { path: stage, code: 'artifact-invalid', message: message }; });
    throw failure;
  }
  function blueprintSummary(blueprint) {
    return { identity: blueprint.identity, scope: blueprint.request.scope,
      objectives: blueprint.request.objectives, parameters: blueprint.request.parameters, content: blueprint.content };
  }
  function validateVisualsDoc(doc, blueprint, materials) {
    var errors = [];
    if (!record(doc)) return ['visuals: expected an object with a visuals array'];
    if (!Array.isArray(doc.visuals)) return ['visuals.visuals: expected an array of visual declarations'];
    var sceneIds = [];
    if (record(materials.animation) && Array.isArray(materials.animation.scenes)) {
      materials.animation.scenes.forEach(function (scene) {
        if (record(scene) && typeof scene.id === 'string' && scene.id) sceneIds.push(scene.id);
      });
    }
    var slideCount = record(materials.slides) && Array.isArray(materials.slides.slides) ? materials.slides.slides.length : 0;
    var declared = {};
    doc.visuals.forEach(function (visual, i) {
      if (!record(visual)) { errors.push('visuals.visuals[' + i + ']: visual must be an object'); return; }
      if (typeof visual.beatId === 'string') declared[visual.beatId] = true;
      var decision = validatorApi.resolveVisualCapability(visual, { scope: blueprint.request.scope,
        sceneIds: sceneIds, slideCount: slideCount, simulation: doc.simulation === undefined ? null : doc.simulation });
      if (!decision.supported) errors.push('visuals.visuals[' + i + ']: ' + String(decision.reason));
    });
    blueprint.content.beats.forEach(function (beat) {
      if (beat.visual !== 'none' && !declared[beat.beatId]) errors.push('visuals: beat ' + beat.beatId + ' recommends ' + beat.visual + ' but has no visual declaration');
    });
    if (doc.simulation !== undefined && doc.simulation !== null) {
      simulations.validate(doc.simulation).forEach(function (error) { errors.push('visuals.simulation: ' + error); });
    }
    return errors;
  }
  function validatorBundle(bundle) {
    return { schemaVersion: schemaVersion, scope: bundle.scope, blueprint: bundle.blueprint,
      materials: bundle.materials, visuals: bundle.visual.declarations,
      simulation: bundle.visual.simulation === undefined ? undefined : bundle.visual.simulation };
  }
  function buildIndex(blueprint, materials, declarations) {
    var byObjective = {};
    var byBeat = {};
    blueprint.request.objectives.forEach(function (objective) {
      byObjective[objective.objectiveId] = { beatIds: [], slideIndexes: [], assessmentIds: [], visualIds: [] };
    });
    blueprint.content.beats.forEach(function (beat) {
      byBeat[beat.beatId] = { objectiveIds: beat.objectiveIds.slice(), slideIndexes: [], assessmentIds: [], visualIds: [] };
      beat.objectiveIds.forEach(function (id) { if (byObjective[id]) byObjective[id].beatIds.push(beat.beatId); });
    });
    blueprint.content.assessments.forEach(function (item) {
      if (byBeat[item.beatId]) byBeat[item.beatId].assessmentIds.push(item.assessmentId);
      if (byObjective[item.objectiveId]) byObjective[item.objectiveId].assessmentIds.push(item.assessmentId);
    });
    if (record(materials.slides) && Array.isArray(materials.slides.slides)) {
      materials.slides.slides.forEach(function (slide, i) {
        if (!record(slide)) return;
        if (typeof slide.beatId === 'string' && byBeat[slide.beatId]) byBeat[slide.beatId].slideIndexes.push(i);
        if (Array.isArray(slide.objectiveIds)) slide.objectiveIds.forEach(function (id) {
          if (byObjective[id] && byObjective[id].slideIndexes.indexOf(i) < 0) byObjective[id].slideIndexes.push(i);
        });
      });
    }
    function linkQuestion(question) {
      if (!record(question) || typeof question.id !== 'string') return;
      var objectiveId = question.objectiveId !== undefined ? question.objectiveId : question.objective;
      if (typeof objectiveId === 'string' && byObjective[objectiveId] && byObjective[objectiveId].assessmentIds.indexOf(question.id) < 0) {
        byObjective[objectiveId].assessmentIds.push(question.id);
      }
    }
    if (record(materials.diagnostics)) {
      (materials.diagnostics.doNow || []).forEach(linkQuestion);
      (materials.diagnostics.hingeQuestions || []).forEach(linkQuestion);
    }
    if (record(materials.worksheet)) (materials.worksheet.questions || []).forEach(linkQuestion);
    if (record(materials.exitTicket)) (materials.exitTicket.questions || []).forEach(linkQuestion);
    if (record(materials.quizBank)) (materials.quizBank.items || []).forEach(linkQuestion);
    (declarations || []).forEach(function (visual) {
      if (!record(visual) || typeof visual.visualId !== 'string') return;
      if (typeof visual.beatId === 'string' && byBeat[visual.beatId]) byBeat[visual.beatId].visualIds.push(visual.visualId);
      if (typeof visual.beatId === 'string' && byBeat[visual.beatId]) {
        byBeat[visual.beatId].objectiveIds.forEach(function (id) {
          if (byObjective[id] && byObjective[id].visualIds.indexOf(visual.visualId) < 0) byObjective[id].visualIds.push(visual.visualId);
        });
      }
    });
    return { byObjective: byObjective, byBeat: byBeat };
  }
  function buildRubric(blueprint) {
    var rubric = {};
    blueprint.request.objectives.forEach(function (objective) { rubric[objective.objectiveId] = []; });
    blueprint.content.assessments.forEach(function (item) {
      rubric[item.objectiveId].push({ assessmentId: item.assessmentId, phase: item.phase, beatId: item.beatId,
        expectedAnswer: item.expectedAnswer, criteria: clone(item.rubric) });
    });
    return rubric;
  }
  async function artifactHashes(parts) {
    var hashes = {};
    var keys = Object.keys(parts).sort();
    for (var i = 0; i < keys.length; i++) hashes[keys[i]] = await hash(parts[keys[i]]);
    return hashes;
  }
  function stageForProblem(problem) {
    var path = problem.path || '';
    for (var i = 0; i < CROSS_STAGE_PREFIXES.length; i++) {
      if (path === CROSS_STAGE_PREFIXES[i][0] || path.indexOf(CROSS_STAGE_PREFIXES[i][0] + '.') === 0 || path.indexOf(CROSS_STAGE_PREFIXES[i][0] + '[') === 0) {
        return CROSS_STAGE_PREFIXES[i][1];
      }
    }
    if (path === 'materials' || path.indexOf('materials.') === 0) return 'assessment';
    /* node:coverage ignore next 1 */
    return null;
  }
  async function generateTopicTeachingBundle(request, deps) {
    var normalized = normalizeRequest(request);
    if (!record(deps) || typeof deps.callChat !== 'function') {
      throw new Error('generateTopicTeachingBundle: deps.callChat(system, user) is required');
    }
    var maxRepairs = Number.isInteger(deps.maxRepairs) && deps.maxRepairs >= 0 ? deps.maxRepairs : DEFAULT_MAX_REPAIRS;
    var maxCrossRepairs = Number.isInteger(deps.maxCrossRepairs) && deps.maxCrossRepairs >= 0 ? deps.maxCrossRepairs : DEFAULT_MAX_CROSS_REPAIRS;
    var progressTotals = {};
    var onProgress = typeof deps.onProgress === 'function' ? deps.onProgress : function () {};
    function progress(stage, event) {
      if (event.tokens !== undefined) progressTotals[stage] = { attempts: event.attempt || 0, tokens: event.tokens, latencyMs: event.latencyMs || 0 };
      onProgress(stage, event);
    }
    var projection = requestProjection(normalized);
    var ctx = { deps: deps, maxRepairs: maxRepairs, mode: normalized.mode, scope: clone(normalized.scope),
      blueprintIdentity: null, blueprintSummary: null, progress: progress };
    // Stage 1: freeze the blueprint once per topic + full objective set.
    progress('blueprint', { status: 'started', attempt: 0 });
    var blueprintStarted = Date.now();
    var blueprint;
    if (normalized.blueprintContent !== undefined) {
      try {
        blueprint = await blueprintApi.createLessonBlueprint(projection, normalized.blueprintContent);
      } catch (error) {
        var failure = new Error('blueprint: host-supplied blueprint content is invalid: ' + error.message);
        failure.stage = 'blueprint';
        failure.problems = String(error.message).split('\n').map(function (message) {
          return { path: 'blueprint', code: 'blueprint-invalid', message: message };
        });
        throw failure;
      }
      progress('blueprint', { status: 'completed', attempt: 0, tokens: {}, latencyMs: Date.now() - blueprintStarted });
    } else {
      var authored = await authorStage(ctx, 'blueprint', null, async function (content) {
        try { await blueprintApi.createLessonBlueprint(projection, content); return []; }
        catch (error) { return String(error.message).split('\n'); }
      });
      blueprint = await blueprintApi.createLessonBlueprint(projection, authored.doc);
    }
    ctx.blueprintIdentity = blueprint.identity;
    // The bundle scope is the blueprint's normalized scope (locale is
    // lowercased by the blueprint): a raw-request copy would read as a
    // stale scope to the cross-material validator.
    ctx.scope = clone(blueprint.request.scope);
    ctx.blueprintSummary = blueprintSummary(blueprint);
    var beats = blueprint.content.beats;
    var wantsAnimation = beats.some(function (beat) { return beat.visual === 'animation'; });
    var wantsSimulation = beats.some(function (beat) { return beat.visual === 'simulation'; });
    var extended = normalized.mode === 'extended';
    // Stage 2+: author each material from the frozen blueprint, each
    // validated by its own beta.2 validator with bounded repair.
    var materials = {};
    async function authorMaterial(stage, validate) {
      var result = await authorStage(ctx, stage, null, function (doc) { return validate(doc); });
      materials[stage] = result.doc;
      return result.doc;
    }
    await authorMaterial('lessonPlan', function (doc) { return validateApi.validateLessonPlan(doc); });
    await authorMaterial('slides', function (doc) { return validateApi.validateSlides(doc); });
    if (extended && wantsAnimation) await authorMaterial('animation', function (doc) { return validateApi.validateSpec(doc); });
    await authorMaterial('diagnostics', function (doc) { return validateApi.validateDiagnostics(doc); });
    await authorMaterial('worksheet', function (doc) { return validateApi.validateWorksheet(doc); });
    await authorMaterial('exitTicket', function (doc) { return validateApi.validateExitTicket(doc); });
    if (extended) await authorMaterial('quizBank', function (doc) { return validateApi.validateQuizBank(doc); });
    var visualsDoc = (await authorStage(ctx, 'visuals', null, function (doc) {
      return validateVisualsDoc(doc, blueprint, materials);
    })).doc;
    async function assemble() {
      var index = buildIndex(blueprint, materials, visualsDoc.visuals);
      var assessment = { diagnostic: materials.diagnostics,
        formative: extended ? { worksheet: materials.worksheet, quizBank: materials.quizBank } : { worksheet: materials.worksheet },
        exitTicket: materials.exitTicket, rubric: buildRubric(blueprint) };
      var parts = { blueprint: blueprint, lessonPlan: materials.lessonPlan, slides: materials.slides,
        visual: { declarations: visualsDoc.visuals, simulation: visualsDoc.simulation === undefined ? null : visualsDoc.simulation },
        assessment: assessment, index: index };
      if (materials.animation !== undefined) parts.animation = materials.animation;
      var hashes = await artifactHashes(parts);
      var scopeKey = blueprint.identity;
      var idempotencyKey = await hash({ schemaVersion: schemaVersion, mode: normalized.mode, blueprintIdentity: scopeKey });
      var revision = await hash({ schemaVersion: schemaVersion, scopeKey: scopeKey, mode: normalized.mode, artifactHashes: hashes });
      var sourceRevisions = normalized.sources.map(function (source) { return source.sourceId + '@' + source.revision; }).sort();
      return { schemaVersion: schemaVersion, scope: clone(ctx.scope), mode: normalized.mode,
        idempotencyKey: idempotencyKey, blueprint: blueprint, lessonPlan: materials.lessonPlan, slides: materials.slides,
        animation: materials.animation === undefined ? null : materials.animation,
        visual: parts.visual, assessment: assessment, materials: clone(materials), index: index,
        manifest: { schemaVersion: schemaVersion, generatorVersion: normalized.generation.generatorVersion,
          revision: revision, scopeKey: scopeKey, sourceRevisions: sourceRevisions, status: normalized.reviewStatus,
          artifactHashes: hashes, mode: normalized.mode },
        coherence: { problems: [], warnings: [], capabilities: [] },
        progress: { stages: progressTotals } };
    }
    // Stage 3: cross-material validation with targeted bounded repair.
    var bundle = await assemble();
    var rounds = 0;
    while (true) {
      var check = await validatorApi.verifyTopicBundle(validatorBundle(bundle), { expectedRequest: projection });
      bundle.coherence.problems = check.problems;
      bundle.coherence.capabilities = check.capabilities;
      if (check.valid) break;
      if (check.problems.some(function (problem) { return (problem.path || '').indexOf('blueprint') === 0; })) {
        /* node:coverage ignore next 6 */
        var blueprintFailure = new Error('generateTopicTeachingBundle: frozen blueprint failed cross-material validation: ' +
          check.problems.map(function (p) { return p.path + ': ' + p.message; }).join('; '));
        blueprintFailure.stage = 'cross-material-validation';
        blueprintFailure.problems = check.problems;
        throw blueprintFailure;
      }
      if (rounds >= maxCrossRepairs) {
        var failure2 = new Error('generateTopicTeachingBundle: bundle failed cross-material validation after ' +
          (rounds + 1) + ' checks: ' + check.problems.map(function (p) { return p.path + ': ' + p.message; }).join('; '));
        failure2.stage = 'cross-material-validation';
        failure2.problems = check.problems;
        failure2.coherence = check;
        throw failure2;
      }
      rounds += 1;
      var stages = {};
      check.problems.forEach(function (problem) {
        var stage = stageForProblem(problem);
        if (stage === 'assessment') {
          ASSESSMENT_STAGES.forEach(function (name) { (stages[name] = stages[name] || []).push(problem.path + ': ' + problem.message); });
          if (extended) (stages.quizBank = stages.quizBank || []).push(problem.path + ': ' + problem.message);
        } else if (stage) {
          (stages[stage] = stages[stage] || []).push(problem.path + ': ' + problem.message);
        }
      });
      var stageNames = Object.keys(stages);
      if (!stageNames.length) {
        /* node:coverage ignore next 6 */
        var unknownFailure = new Error('generateTopicTeachingBundle: bundle failed cross-material validation with no repairable stage: ' +
          check.problems.map(function (p) { return p.path + ': ' + p.message; }).join('; '));
        unknownFailure.stage = 'cross-material-validation';
        unknownFailure.problems = check.problems;
        throw unknownFailure;
      }
      for (var s = 0; s < stageNames.length; s++) {
        var name = stageNames[s];
        var repairProblems = stages[name];
        if (name === 'visuals') {
          visualsDoc = (await authorStage(ctx, 'visuals', null, function (doc) {
            return validateVisualsDoc(doc, blueprint, materials);
          }, repairProblems)).doc;
        } else {
          var validateFor = {
            lessonPlan: function (doc) { return validateApi.validateLessonPlan(doc); },
            slides: function (doc) { return validateApi.validateSlides(doc); },
            animation: function (doc) { return validateApi.validateSpec(doc); },
            diagnostics: function (doc) { return validateApi.validateDiagnostics(doc); },
            worksheet: function (doc) { return validateApi.validateWorksheet(doc); },
            exitTicket: function (doc) { return validateApi.validateExitTicket(doc); },
            quizBank: function (doc) { return validateApi.validateQuizBank(doc); }
          }[name];
          materials[name] = (await authorStage(ctx, name, null, validateFor, repairProblems)).doc;
        }
      }
      bundle = await assemble();
    }
    var decisions = bundle.coherence.capabilities;
    var kind = 'none';
    if (decisions.some(function (d) { return d.capability === 'simulation'; })) kind = 'simulation';
    else if (decisions.some(function (d) { return d.capability === 'animation'; })) kind = 'animation';
    else if (decisions.some(function (d) { return d.capability === 'diagram'; })) kind = 'diagram';
    else if (decisions.some(function (d) { return d.capability === 'slide-first'; })) kind = 'slide-first';
    bundle.visual.kind = kind;
    bundle.coherence.warnings = decisions.filter(function (d) { return d.fallback !== undefined; })
      .map(function (d) { return 'visual ' + d.visualId + ' fell back from ' + d.fallback.from + ': ' + d.fallback.reason; });
    return freeze(bundle);
  }
  async function verifyTopicTeachingBundle(bundle, request) {
    var problems = [];
    if (!record(bundle)) return ['bundle: expected plain object'];
    if (bundle.schemaVersion !== schemaVersion) problems.push('bundle.schemaVersion: expected ' + schemaVersion);
    if (!record(bundle.manifest)) { problems.push('bundle.manifest: missing'); return problems; }
    if (record(bundle.blueprint)) {
      var expected = record(request) ? requestProjection(normalizeRequest(request)) : undefined;
      var verified = await blueprintApi.verifyLessonBlueprint(bundle.blueprint, expected);
      verified.forEach(function (error) { problems.push('blueprint: ' + error); });
    }
    var parts = {};
    if (record(bundle.blueprint)) parts.blueprint = bundle.blueprint;
    if (bundle.lessonPlan !== undefined) parts.lessonPlan = bundle.lessonPlan;
    if (bundle.slides !== undefined) parts.slides = bundle.slides;
    if (record(bundle.visual)) {
      // The manifest hashes the visual without its derived kind label,
      // exactly as assemble() built it; kind is a summary, not content.
      parts.visual = { declarations: bundle.visual.declarations,
        simulation: bundle.visual.simulation === undefined ? null : bundle.visual.simulation };
    }
    if (record(bundle.assessment)) parts.assessment = bundle.assessment;
    if (record(bundle.index)) parts.index = bundle.index;
    if (bundle.animation !== undefined && bundle.animation !== null) parts.animation = bundle.animation;
    var expectedHashes = await artifactHashes(parts);
    Object.keys(expectedHashes).forEach(function (key) {
      if (bundle.manifest.artifactHashes === undefined || bundle.manifest.artifactHashes[key] !== expectedHashes[key]) {
        problems.push('manifest.artifactHashes.' + key + ': hash mismatch');
      }
    });
    if (record(bundle.blueprint)) {
      var scopeKey = bundle.blueprint.identity;
      if (bundle.manifest.scopeKey !== scopeKey) problems.push('manifest.scopeKey: does not match blueprint identity');
      var revision = await hash({ schemaVersion: schemaVersion, scopeKey: scopeKey, mode: bundle.mode, artifactHashes: expectedHashes });
      if (bundle.manifest.revision !== revision) problems.push('manifest.revision: hash mismatch');
      if (record(request)) {
        var idempotencyKey = await topicBundleScopeKey(request, bundle.mode);
        if (bundle.idempotencyKey !== idempotencyKey) problems.push('bundle.idempotencyKey: does not match request scope and mode');
      }
    }
    if (record(bundle.blueprint) && record(bundle.visual) && record(bundle.materials)) {
      var check = await validatorApi.verifyTopicBundle(validatorBundle(bundle),
        { expectedRequest: record(request) ? requestProjection(normalizeRequest(request)) : undefined });
      check.problems.forEach(function (problem) { problems.push(problem.path + ': ' + problem.message); });
    }
    return problems;
  }
  // Bounded admin-scheduled bulk pre-generation from an approved topic
  // list. Sequential, separate from student traffic: one bad topic fails
  // only its own entry. Repeated topics in one batch share the first
  // result by stable scope-based idempotency key.
  async function generateTopicTeachingBundles(requests, deps) {
    if (!Array.isArray(requests) || requests.length < 1 || requests.length > MAX_BULK_TOPICS) {
      throw new Error('generateTopicTeachingBundles: expected an array of 1..' + MAX_BULK_TOPICS + ' requests');
    }
    var onProgress = record(deps) && typeof deps.onProgress === 'function' ? deps.onProgress : function () {};
    var seen = {};
    var results = [];
    for (var i = 0; i < requests.length; i++) {
      var scopeKey = null;
      var idempotencyKey = null;
      try {
        idempotencyKey = await topicBundleScopeKey(requests[i]);
        scopeKey = idempotencyKey;
      } catch (error) {
        results.push({ index: i, status: 'failed', scopeKey: null, idempotencyKey: null, error: error.message });
        onProgress('bulk-topic', { status: 'failed', index: i, scopeKey: null, error: error.message });
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(seen, idempotencyKey)) {
        results.push({ index: i, status: 'duplicate', scopeKey: scopeKey, idempotencyKey: idempotencyKey, bundle: seen[idempotencyKey] });
        onProgress('bulk-topic', { status: 'duplicate', index: i, scopeKey: scopeKey });
        continue;
      }
      onProgress('bulk-topic', { status: 'started', index: i, scopeKey: scopeKey });
      try {
        var bundle = await generateTopicTeachingBundle(requests[i], deps);
        seen[idempotencyKey] = bundle;
        results.push({ index: i, status: 'generated', scopeKey: scopeKey, idempotencyKey: idempotencyKey, bundle: bundle });
        onProgress('bulk-topic', { status: 'completed', index: i, scopeKey: scopeKey });
      } catch (error) {
        results.push({ index: i, status: 'failed', scopeKey: scopeKey, idempotencyKey: idempotencyKey,
          error: error.message, problems: error.problems || null });
        onProgress('bulk-topic', { status: 'failed', index: i, scopeKey: scopeKey, error: error.message });
      }
    }
    return results;
  }
  return { schemaVersion: schemaVersion, validateTopicBundleRequest: validateTopicBundleRequest,
    topicBundleScopeKey: topicBundleScopeKey, generateTopicTeachingBundle: generateTopicTeachingBundle,
    generateTopicTeachingBundles: generateTopicTeachingBundles, verifyTopicTeachingBundle: verifyTopicTeachingBundle };
});
