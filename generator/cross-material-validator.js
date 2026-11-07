/* Deterministic cross-material validator + explicit capability resolver
 * (issue #1641). Additive and storage-neutral: it checks a frozen
 * LessonBlueprint (#1640) against the authored topic bundle built from it
 * -- plan, slides, animation, assessments and visuals -- and decides, per
 * visual, which capability serves it. No LLM, no network, no filesystem,
 * no session or learner data. A failed bundle is never valid, so a host
 * must not approve or publish it; the result carries actionable
 * path-bearing problems for per-artifact repair.
 *
 * Bundle contract (topic-bundle.v1):
 *   { schemaVersion, scope, blueprint, materials?, visuals?, simulation? }
 * - scope must equal blueprint.request.scope field for field (a changed
 *   scope is stale, not a silent re-target).
 * - materials is a subset of the beta.2 per-material docs, each still
 *   checked by its own player/validate.js validator first: animation
 *   (validateSpec), slides (validateSlides), lessonPlan
 *   (validateLessonPlan), worksheet (validateWorksheet), exitTicket
 *   (validateExitTicket), quizBank (validateQuizBank), diagnostics
 *   (validateDiagnostics). Absent materials are skipped, never invented.
 * - Cross-material links are optional fields the beta.2 validators ignore:
 *   slides may carry beatId / objectiveIds; worksheet questions carry
 *   `objective` (native) or `objectiveId`, exit-ticket / quiz-bank /
 *   diagnostics questions carry `objectiveId`; any assessment question or
 *   item may carry `exampleId` and `quantities: [{ id, value, unit }]`.
 *   When a link is present it must resolve against the frozen blueprint;
 *   when at least one assessment link exists anywhere, every blueprint
 *   objective must be linked by at least one assessment question.
 * - visuals is an array of VisualDeclarations (see below). When the key is
 *   absent, no visual checks run; when present, every blueprint beat whose
 *   recommendation is not 'none' needs a supported declaration.
 * - simulation is an optional simulation-kit spec for the topic's
 *   interactive model; it is validated by the registry, never executed.
 *
 * Capability resolver (resolveVisualCapability): deterministic decision
 * table, no guessing. Requested capabilities:
 * - simulation: the model must be registered AND registered for this
 *   topic family (same level; same subject after the mathematics->math
 *   synonym; topic equal to the registered slug, or a sub-topic of it,
 *   e.g. equivalent-fractions inside fractions). The bundle simulation
 *   spec, when present, must name the same model and pass registry
 *   validation. Otherwise the request is unsupported.
 * - animation: the sceneId must exist in the bundle animation scenes.
 * - diagram: a non-empty label, or a descriptor whose kind is one of the
 *   player/validate.js slide shape kinds.
 * - slide-first: the slideIndex must exist and the visual must NOT
 *   reference an animation scene or a simulation model -- a slide-first
 *   visual that still demands an animation is invalid.
 * - none: valid only when explicitly declared missing with a reason.
 * An unsupported request is rejected unless the declaration names an
 * explicit fallback (animation, diagram or slide-first -- never
 * simulation, never none); the fallback is resolved the same way and the
 * decision records { from, reason }. The resolver never invents a
 * capability and never runs model-supplied code.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./lesson-blueprint.js'), require('../player/simulation-kit.js'), require('../player/validate.js'));
  else root.TeachkitCrossMaterialValidator = factory(root.TeachkitLessonBlueprint, root.TeachkitSimulations, root.AnimathValidate);
})(typeof window !== 'undefined' ? window : globalThis, function (blueprintApi, simulations, validateApi) {
  'use strict';
  var schemaVersion = 'topic-bundle.v1';
  var CAPABILITIES = ['simulation', 'animation', 'diagram', 'slide-first', 'none'];
  var FALLBACKS = ['animation', 'diagram', 'slide-first'];
  // Mirrors the SHAPES list in player/validate.js (slide shape kinds).
  var DIAGRAM_KINDS = ['text', 'rect', 'circle', 'line', 'arrow', 'polygon', 'latex', 'sector'];
  var SUBJECT_SYNONYMS = { mathematics: 'math', maths: 'math' };
  var BUNDLE_FIELDS = ['schemaVersion', 'scope', 'blueprint', 'materials', 'visuals', 'simulation'];
  var MATERIAL_VALIDATORS = {
    animation: 'validateSpec', slides: 'validateSlides', lessonPlan: 'validateLessonPlan',
    worksheet: 'validateWorksheet', exitTicket: 'validateExitTicket',
    quizBank: 'validateQuizBank', diagnostics: 'validateDiagnostics'
  };
  function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype &&
      !Object.getOwnPropertySymbols(value).length && !Object.getOwnPropertyNames(value).some(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(value, key);
        return !descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value');
      });
  }
  function text(value, max) {
    return typeof value === 'string' && !!value.trim() && value.length <= max;
  }
  function sorted(values) { return Array.from(values).sort(); }
  function problem(path, code, message) { return { path: path, code: code, message: message }; }
  // Split a per-material / blueprint error of the form "path: message"
  // into a problem under the given prefix; unparseable errors keep the
  // prefix as their path so the artifact is still named.
  function prefixed(error, prefix, code) {
    var message = String(error);
    var at = message.indexOf(': ');
    if (at < 0) return problem(prefix, code, message);
    var head = message.slice(0, at);
    if (head === prefix || head.indexOf(prefix + '.') === 0) return problem(head, code, message.slice(at + 2));
    return problem(prefix + '.' + head, code, message.slice(at + 2));
  }
  function normalizeSubject(subject) {
    var value = String(subject === undefined || subject === null ? '' : subject).trim().toLowerCase();
    return SUBJECT_SYNONYMS[value] || value;
  }
  function modelServesTopic(model, scope) {
    var registered = simulations.syllabusFor(model);
    if (!registered) return 'unknown simulation model ' + model;
    var level = String(scope.level === undefined ? '' : scope.level).trim().toLowerCase();
    var subject = normalizeSubject(scope.subject);
    var topic = String(scope.topicId === undefined ? '' : scope.topicId).trim().toLowerCase();
    if (registered[0] !== level) return 'simulation model ' + model + ' is registered for level ' + registered[0] + ', not ' + level;
    if (registered[1] !== subject) return 'simulation model ' + model + ' is registered for subject ' + registered[1] + ', not ' + subject;
    if (registered[2] !== topic && topic.indexOf(registered[2] + '-') !== 0 && topic.indexOf('-' + registered[2]) !== topic.length - registered[2].length - 1) return 'simulation model ' + model + ' is registered for topic ' + registered[2] + ', not ' + topic;
    return null;
  }
  function validDiagram(diagram) {
    if (typeof diagram === 'string') return diagram.trim().length > 0;
    if (!record(diagram)) return false;
    return DIAGRAM_KINDS.indexOf(diagram.kind) >= 0;
  }
  // One attempt at serving a visual with a single capability. Returns
  // { ok: true, capability, model?, sceneId? } or { ok: false, reason }.
  function attempt(visual, requested, context) {
    if (requested === 'simulation') {
      if (!text(visual.model, 90)) return { ok: false, reason: 'simulation visual requires a model id' };
      var mismatch = modelServesTopic(visual.model, context.scope);
      if (mismatch) return { ok: false, reason: mismatch };
      if (context.simulation !== null && context.simulation !== undefined) {
        if (!record(context.simulation) || context.simulation.model !== visual.model) return { ok: false, reason: 'bundle simulation spec does not name model ' + visual.model };
        var specErrors = simulations.validate(context.simulation);
        if (specErrors.length) return { ok: false, reason: 'simulation spec invalid: ' + specErrors.join('; ') };
      }
      return { ok: true, capability: 'simulation', model: visual.model };
    }
    if (requested === 'animation') {
      if (!text(visual.sceneId, 128)) return { ok: false, reason: 'animation visual requires a sceneId' };
      if (context.sceneIds.indexOf(visual.sceneId) < 0) return { ok: false, reason: 'unknown animation scene ' + visual.sceneId };
      return { ok: true, capability: 'animation', sceneId: visual.sceneId };
    }
    if (requested === 'diagram') {
      if (!validDiagram(visual.diagram)) return { ok: false, reason: 'diagram visual requires a label or a descriptor with a slide shape kind' };
      return { ok: true, capability: 'diagram' };
    }
    if (requested === 'slide-first') {
      if (visual.sceneId !== undefined || visual.model !== undefined) return { ok: false, reason: 'slide-first visual must not reference an animation scene or simulation model' };
      if (!Number.isInteger(visual.slideIndex) || visual.slideIndex < 0 || visual.slideIndex >= context.slideCount) return { ok: false, reason: 'slide-first visual requires a slideIndex in 0..' + (context.slideCount - 1) };
      return { ok: true, capability: 'slide-first' };
    }
    // requested === 'none'
    if (visual.declaredMissing === true && text(visual.reason, 500)) return { ok: true, capability: 'none' };
    return { ok: false, reason: 'a missing visual is valid only when explicitly declared missing with a reason' };
  }
  function resolveVisualCapability(visual, context) {
    context = record(context) ? context : {};
    var scope = record(context.scope) ? context.scope : {};
    var sceneIds = Array.isArray(context.sceneIds) ? context.sceneIds : [];
    var slideCount = Number.isInteger(context.slideCount) ? context.slideCount : 0;
    var simulation = context.simulation === undefined ? null : context.simulation;
    var ctx = { scope: scope, sceneIds: sceneIds, slideCount: slideCount, simulation: simulation };
    var decision = { visualId: null, beatId: null, requested: null, capability: null, supported: false, declaredMissing: false, reason: null };
    if (!record(visual)) { decision.reason = 'visual must be an object'; return decision; }
    decision.visualId = typeof visual.visualId === 'string' ? visual.visualId : null;
    decision.beatId = typeof visual.beatId === 'string' ? visual.beatId : null;
    decision.requested = typeof visual.requested === 'string' ? visual.requested : null;
    if (CAPABILITIES.indexOf(decision.requested) < 0) {
      decision.reason = 'unsupported requested capability ' + String(visual.requested);
      return decision;
    }
    var first = attempt(visual, decision.requested, ctx);
    if (first.ok) {
      decision.capability = first.capability;
      decision.supported = true;
      if (first.model !== undefined) decision.model = first.model;
      if (first.sceneId !== undefined) decision.sceneId = first.sceneId;
      if (decision.capability === 'none') decision.declaredMissing = true;
      return decision;
    }
    if (visual.fallback !== undefined) {
      if (FALLBACKS.indexOf(visual.fallback) < 0) {
        decision.reason = first.reason + '; fallback ' + String(visual.fallback) + ' is not an allowed fallback (animation, diagram or slide-first)';
        return decision;
      }
      if (visual.fallback === decision.requested) {
        decision.reason = first.reason + '; fallback must differ from the requested capability';
        return decision;
      }
      var second = attempt(visual, visual.fallback, ctx);
      if (second.ok) {
        decision.capability = second.capability;
        decision.supported = true;
        if (second.model !== undefined) decision.model = second.model;
        if (second.sceneId !== undefined) decision.sceneId = second.sceneId;
        decision.fallback = { from: decision.requested, reason: first.reason };
        return decision;
      }
      decision.reason = first.reason + '; fallback ' + visual.fallback + ' also unavailable: ' + second.reason;
      return decision;
    }
    decision.reason = first.reason;
    return decision;
  }
  // Deterministic problem order. Sort is stable and problem paths are
  // unique per artifact, so a full three-field tie cannot occur; the
  // final return below only satisfies the comparator contract.
  function compareProblems(a, b) {
    if (a.path !== b.path) return a.path < b.path ? -1 : 1;
    if (a.code !== b.code) return a.code < b.code ? -1 : 1;
    if (a.message !== b.message) return a.message < b.message ? -1 : 1;
    /* node:coverage ignore next */
    return 0;
  }
  function finish(problems, capabilities, coverage, blueprintIdentity) {
    problems.sort(compareProblems);
    return { valid: problems.length === 0, schemaVersion: schemaVersion, blueprintIdentity: blueprintIdentity || null,
      problems: problems, capabilities: capabilities, coverage: coverage };
  }
  function emptyCoverage(objectives) {
    // Missing lists stay empty until their section is actually checked:
    // an absent lesson plan or an assessment with no objective links is
    // skipped (beta.2 backward compatibility), not reported as a gap.
    return { objectives: objectives, planCovered: [], planMissing: [], assessmentCovered: [], assessmentMissing: [], assessmentChecked: false };
  }
  function validateTopicBundle(bundle, options) {
    options = record(options) ? options : {};
    var problems = [];
    var capabilities = [];
    if (!record(bundle)) return finish([problem('bundle', 'invalid-bundle', 'bundle: expected plain object')], capabilities, emptyCoverage([]), null);
    Object.keys(bundle).forEach(function (key) {
      if (BUNDLE_FIELDS.indexOf(key) < 0) problems.push(problem('bundle.' + key, 'unsupported-field', 'bundle.' + key + ': unsupported field'));
    });
    if (bundle.schemaVersion !== schemaVersion) problems.push(problem('bundle.schemaVersion', 'unsupported-schema', 'bundle.schemaVersion: expected ' + schemaVersion));
    if (!record(bundle.scope)) problems.push(problem('bundle.scope', 'missing-scope', 'bundle.scope: expected the blueprint request scope object'));
    if (problems.length) return finish(problems, capabilities, emptyCoverage([]), null);
    var blueprintErrors = blueprintApi.validateLessonBlueprint(bundle.blueprint, options.expectedRequest);
    if (blueprintErrors.length) {
      blueprintErrors.forEach(function (error) { problems.push(prefixed(error, 'blueprint', 'blueprint-invalid')); });
      return finish(problems, capabilities, emptyCoverage([]), null);
    }
    var request = bundle.blueprint.request;
    var content = bundle.blueprint.content;
    var objectives = sorted(request.objectives.map(function (objective) { return objective.objectiveId; }));
    var coverage = emptyCoverage(objectives);
    var objectiveSet = {};
    objectives.forEach(function (id) { objectiveSet[id] = true; });
    var beatIds = {};
    var beatById = {};
    content.beats.forEach(function (beat) { beatIds[beat.beatId] = true; beatById[beat.beatId] = beat; });
    var exampleById = {};
    content.examples.forEach(function (example) { exampleById[example.id] = example; });
    // Stale scope: every scope field must still equal the frozen request.
    var scopeFields = {};
    Object.keys(request.scope).forEach(function (key) { scopeFields[key] = true; });
    Object.keys(bundle.scope).forEach(function (key) { scopeFields[key] = true; });
    Object.keys(scopeFields).sort().forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(request.scope, key)) problems.push(problem('bundle.scope.' + key, 'stale-scope', 'bundle.scope.' + key + ': not part of the frozen blueprint scope'));
      else if (!Object.prototype.hasOwnProperty.call(bundle.scope, key)) problems.push(problem('bundle.scope.' + key, 'stale-scope', 'bundle.scope.' + key + ': missing from bundle scope, frozen value is ' + JSON.stringify(request.scope[key])));
      else if (bundle.scope[key] !== request.scope[key]) problems.push(problem('bundle.scope.' + key, 'stale-scope', 'bundle.scope.' + key + ': stale scope value ' + JSON.stringify(bundle.scope[key]) + ' does not match frozen blueprint value ' + JSON.stringify(request.scope[key])));
    });
    // Per-material validation first (additive: the cross checks below run
    // on the same docs and never replace these validators).
    var materials = record(bundle.materials) ? bundle.materials : {};
    if (bundle.materials !== undefined && !record(bundle.materials)) problems.push(problem('bundle.materials', 'invalid-materials', 'bundle.materials: expected an object keyed by material name'));
    Object.keys(MATERIAL_VALIDATORS).forEach(function (name) {
      if (!Object.prototype.hasOwnProperty.call(materials, name)) return;
      var errors = validateApi[MATERIAL_VALIDATORS[name]](materials[name]);
      errors.forEach(function (error) { problems.push(prefixed(error, 'materials.' + name, 'material-invalid')); });
    });
    Object.keys(materials).forEach(function (name) {
      if (!Object.prototype.hasOwnProperty.call(MATERIAL_VALIDATORS, name)) problems.push(problem('materials.' + name, 'unsupported-material', 'materials.' + name + ': no per-material validator for this material'));
    });
    // Animation scene registry for slide/visual resolution.
    var sceneIds = [];
    if (record(materials.animation) && Array.isArray(materials.animation.scenes)) {
      materials.animation.scenes.forEach(function (scene) {
        if (record(scene) && typeof scene.id === 'string' && scene.id) sceneIds.push(scene.id);
      });
    }
    var slideCount = 0;
    if (record(materials.slides) && Array.isArray(materials.slides.slides)) slideCount = materials.slides.slides.length;
    // Slide references: scene visuals must resolve, beat/objective links
    // must name frozen blueprint ids.
    if (record(materials.slides) && Array.isArray(materials.slides.slides)) {
      materials.slides.slides.forEach(function (slide, i) {
        var base = 'materials.slides.slides[' + i + ']';
        if (!record(slide)) return;
        var sceneId = null;
        if (typeof slide.visual === 'string') sceneId = slide.visual;
        else if (record(slide.visual) && typeof slide.visual.sceneId === 'string') sceneId = slide.visual.sceneId;
        if (sceneId !== null && sceneId.trim().length > 0 && sceneIds.indexOf(sceneId) < 0) {
          problems.push(problem(base + '.visual', 'dangling-scene', base + '.visual: dangling scene reference ' + sceneId));
        }
        if (slide.beatId !== undefined && !beatIds[slide.beatId]) problems.push(problem(base + '.beatId', 'unknown-beat', base + '.beatId: unknown beat ' + String(slide.beatId)));
        if (Array.isArray(slide.objectiveIds)) {
          slide.objectiveIds.forEach(function (ref, j) {
            if (!objectiveSet[ref]) problems.push(problem(base + '.objectiveIds[' + j + ']', 'unknown-objective', base + '.objectiveIds[' + j + ']: unknown objective ' + String(ref)));
          });
        }
      });
    }
    // Plan coverage: the lesson plan must name the full frozen objective
    // set and give every objective at least one activity.
    var planCovered = {};
    if (record(materials.lessonPlan)) {
      var plan = materials.lessonPlan;
      if (Array.isArray(plan.objectives)) {
        plan.objectives.forEach(function (objective, i) {
          if (!record(objective)) return;
          if (typeof objective.id === 'string' && !objectiveSet[objective.id]) problems.push(problem('materials.lessonPlan.objectives[' + i + '].id', 'unknown-objective', 'materials.lessonPlan.objectives[' + i + '].id: unknown objective ' + objective.id));
        });
        objectives.forEach(function (id) {
          if (!plan.objectives.some(function (objective) { return record(objective) && objective.id === id; })) {
            problems.push(problem('materials.lessonPlan.objectives', 'omitted-objective', 'materials.lessonPlan.objectives: objective not covered in plan ' + id));
          }
        });
      }
      if (Array.isArray(plan.activities)) {
        plan.activities.forEach(function (activity, i) {
          if (!record(activity) || !Array.isArray(activity.objectiveIds)) return;
          activity.objectiveIds.forEach(function (ref, j) {
            if (!objectiveSet[ref]) problems.push(problem('materials.lessonPlan.activities[' + i + '].objectiveIds[' + j + ']', 'unknown-objective', 'materials.lessonPlan.activities[' + i + '].objectiveIds[' + j + ']: unknown objective ' + String(ref)));
            else planCovered[ref] = true;
          });
        });
      }
      if (typeof plan.durationMinutes === 'number' && plan.durationMinutes !== request.parameters.durationMinutes) {
        problems.push(problem('materials.lessonPlan.durationMinutes', 'duration-mismatch', 'materials.lessonPlan.durationMinutes: ' + plan.durationMinutes + ' does not match frozen lesson duration ' + request.parameters.durationMinutes));
      }
      coverage.planCovered = sorted(Object.keys(planCovered));
      coverage.planMissing = objectives.filter(function (id) { return !planCovered[id]; });
      coverage.planMissing.forEach(function (id) {
        problems.push(problem('materials.lessonPlan.activities', 'omitted-objective', 'materials.lessonPlan.activities: objective not covered in plan ' + id));
      });
    }
    // Assessment links, answer keys and numeric bindings.
    var assessed = {};
    var anyAssessmentLink = false;
    function answerOf(question) {
      if (typeof question.answer === 'string') return question.answer;
      if (Array.isArray(question.choices)) {
        var correct = question.choices.filter(function (choice) { return record(choice) && choice.correct === true; });
        if (correct.length === 1 && typeof correct[0].text === 'string') return correct[0].text;
      }
      return null;
    }
    function checkAssessmentItems(items, base) {
      if (!Array.isArray(items)) return;
      items.forEach(function (question, i) {
        if (!record(question)) return;
        var at = base + '[' + i + ']';
        var objectiveRef = question.objectiveId !== undefined ? question.objectiveId : question.objective;
        if (objectiveRef !== undefined) {
          anyAssessmentLink = true;
          if (!objectiveSet[objectiveRef]) problems.push(problem(at + '.objectiveId', 'unknown-objective', at + '.objectiveId: unknown objective ' + String(objectiveRef)));
          else assessed[objectiveRef] = true;
        }
        if (question.exampleId !== undefined) {
          var example = exampleById[question.exampleId];
          if (!example) {
            problems.push(problem(at + '.exampleId', 'unknown-example', at + '.exampleId: unknown example ' + String(question.exampleId)));
          } else {
            var answer = answerOf(question);
            if (answer === null) problems.push(problem(at, 'answer-missing', at + ': question linked to example ' + question.exampleId + ' carries no checkable answer'));
            else if (answer !== example.answer) problems.push(problem(at, 'answer-mismatch', at + ': answer differs from canonical example answer ' + JSON.stringify(example.answer)));
            if (Array.isArray(question.quantities)) {
              var frozen = {};
              example.quantities.forEach(function (quantity) { frozen[quantity.id] = quantity; });
              question.quantities.forEach(function (quantity, k) {
                var qpath = at + '.quantities[' + k + ']';
                if (!record(quantity) || typeof quantity.id !== 'string') { problems.push(problem(qpath, 'quantity-mismatch', qpath + ': quantity requires an id')); return; }
                var expected = frozen[quantity.id];
                if (!expected) { problems.push(problem(qpath, 'unknown-quantity', qpath + ': unknown quantity ' + quantity.id + ' for example ' + question.exampleId)); return; }
                if (quantity.value !== expected.value || quantity.unit !== expected.unit) {
                  problems.push(problem(qpath, 'quantity-mismatch', qpath + ': value/unit ' + JSON.stringify(quantity.value) + '/' + JSON.stringify(quantity.unit) + ' does not match frozen quantity ' + JSON.stringify(expected.value) + '/' + JSON.stringify(expected.unit)));
                }
              });
            }
          }
        }
      });
    }
    if (record(materials.worksheet)) checkAssessmentItems(materials.worksheet.questions, 'materials.worksheet.questions');
    if (record(materials.exitTicket)) checkAssessmentItems(materials.exitTicket.questions, 'materials.exitTicket.questions');
    if (record(materials.quizBank)) checkAssessmentItems(materials.quizBank.items, 'materials.quizBank.items');
    if (record(materials.diagnostics)) {
      checkAssessmentItems(materials.diagnostics.doNow, 'materials.diagnostics.doNow');
      checkAssessmentItems(materials.diagnostics.hingeQuestions, 'materials.diagnostics.hingeQuestions');
    }
    coverage.assessmentCovered = sorted(Object.keys(assessed));
    coverage.assessmentChecked = anyAssessmentLink;
    if (anyAssessmentLink) {
      coverage.assessmentMissing = objectives.filter(function (id) { return !assessed[id]; });
      coverage.assessmentMissing.forEach(function (id) {
        problems.push(problem('materials', 'objective-not-assessed', 'materials: objective not assessed in materials ' + id));
      });
    }
    // Simulation spec: registry validation, never execution.
    var simulation = bundle.simulation === undefined ? null : bundle.simulation;
    if (simulation !== null) {
      simulations.validate(simulation).forEach(function (error) {
        problems.push(problem('simulation', 'invalid-simulation', 'simulation: ' + error));
      });
    }
    // Visuals: resolve every declaration; when the key is present, every
    // beat recommending a visual needs a supported declaration.
    if (Object.prototype.hasOwnProperty.call(bundle, 'visuals')) {
      if (!Array.isArray(bundle.visuals)) {
        problems.push(problem('bundle.visuals', 'invalid-visuals', 'bundle.visuals: expected an array of visual declarations'));
      } else {
        var seenVisualIds = {};
        var supportedBeats = {};
        bundle.visuals.forEach(function (visual, i) {
          var base = 'visuals[' + i + ']';
          if (!record(visual)) { problems.push(problem(base, 'invalid-visual', base + ': visual must be an object')); return; }
          if (typeof visual.visualId !== 'string' || !visual.visualId.trim()) problems.push(problem(base + '.visualId', 'invalid-visual', base + '.visualId: required non-empty string'));
          else if (seenVisualIds[visual.visualId]) problems.push(problem(base + '.visualId', 'duplicate-visual', base + '.visualId: duplicate visual id ' + visual.visualId));
          else seenVisualIds[visual.visualId] = true;
          if (typeof visual.beatId !== 'string' || !beatIds[visual.beatId]) problems.push(problem(base + '.beatId', 'unknown-beat', base + '.beatId: unknown beat ' + String(visual.beatId)));
          var decision = resolveVisualCapability(visual, { scope: request.scope, sceneIds: sceneIds, slideCount: slideCount, simulation: simulation });
          capabilities.push(decision);
          if (!decision.supported) {
            problems.push(problem(base, 'unsupported-visual', base + ': ' + String(decision.reason)));
          } else if (typeof visual.beatId === 'string') {
            supportedBeats[visual.beatId] = true;
          }
          if (typeof visual.exampleId === 'string' && !exampleById[visual.exampleId]) {
            problems.push(problem(base + '.exampleId', 'unknown-example', base + '.exampleId: unknown example ' + visual.exampleId));
          }
          // Numeric binding: a simulation visual bound to a frozen example
          // must use that example's quantities as parameter defaults.
          if (decision.supported && decision.capability === 'simulation' && typeof visual.exampleId === 'string' && exampleById[visual.exampleId] && record(simulation) && Array.isArray(simulation.parameters)) {
            var frozenQuantities = {};
            exampleById[visual.exampleId].quantities.forEach(function (quantity) { frozenQuantities[quantity.id] = quantity; });
            simulation.parameters.forEach(function (parameter) {
              if (!record(parameter) || typeof parameter.id !== 'string') return;
              var frozenQuantity = frozenQuantities[parameter.id];
              if (frozenQuantity && parameter.default !== frozenQuantity.value) {
                problems.push(problem(base + '.simulation', 'quantity-mismatch', base + '.simulation: parameter default ' + JSON.stringify(parameter.default) + ' for ' + parameter.id + ' does not match frozen quantity ' + JSON.stringify(frozenQuantity.value)));
              }
            });
          }
        });
        content.beats.forEach(function (beat) {
          if (beat.visual !== 'none' && !supportedBeats[beat.beatId]) {
            problems.push(problem('visuals', 'missing-visual', 'visuals: beat ' + beat.beatId + ' recommends ' + beat.visual + ' but has no supported visual declaration'));
          }
          if (beat.visual === 'none') {
            bundle.visuals.forEach(function (visual, i) {
              if (record(visual) && visual.beatId === beat.beatId && visual.requested !== 'none') {
                problems.push(problem('visuals[' + i + ']', 'unexpected-visual', 'visuals[' + i + ']: beat ' + beat.beatId + ' recommends no visual but declares ' + String(visual.requested)));
              }
            });
          }
        });
      }
    }
    return finish(problems, capabilities, coverage, bundle.blueprint.identity);
  }
  async function verifyTopicBundle(bundle, options) {
    var result = validateTopicBundle(bundle, options);
    if (record(bundle) && record(bundle.blueprint)) {
      var verified = await blueprintApi.verifyLessonBlueprint(bundle.blueprint, record(options) ? options.expectedRequest : undefined);
      var known = {};
      result.problems.forEach(function (item) { known[item.message] = true; });
      verified.forEach(function (error) {
        var message = String(error);
        if (known[message]) return;
        result.problems.push(prefixed(message, 'blueprint', 'blueprint-invalid'));
      });
      result.problems.sort(compareProblems);
      result.valid = result.problems.length === 0;
    }
    return result;
  }
  return { schemaVersion: schemaVersion, resolveVisualCapability: resolveVisualCapability,
    validateTopicBundle: validateTopicBundle, verifyTopicBundle: verifyTopicBundle };
});
