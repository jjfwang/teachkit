/* animath generate pipeline — slice 5 of the generate pipeline (issue #693).
 *
 * Prompt in, animation out: runs the unpack -> author -> repair stages
 * automatically inside the engine (owner direction 2026-10-12: no
 * confirm/edit-phases UI step). The pipeline is model-agnostic — all LLM
 * traffic goes through the caller-supplied deps.callChat(system, user), all
 * validation through deps.validate(spec); this module makes no network
 * calls of its own, so it is fully mockable in tests and works in browser
 * and Node.
 *
 * Repair semantics mirror llm_client.js generateSpecWithRepair (default 3
 * repair passes; invalid JSON counts as a failed attempt; the final failure
 * rejects with an Error carrying err.problems), reimplemented against
 * deps.callChat because generateSpecWithRepair does its own fetching.
 *
 * generateSlides (issue #747) is the slide-deck sibling: the same unpack
 * stage and repair discipline, but the author prompts come from
 * build_slides_prompt.js and validation runs through validateSlides
 * (deps.validateSlides, else deps.validate, else the built-in
 * player/validate.js validateSlides).
 *
 * generateWorksheet and generateExitTicket (issue #760) are siblings of
 * generateSlides: the same unpack stage and repair discipline, but the
 * author prompts come from build_worksheet_prompt.js /
 * build_exit_ticket_prompt.js and validation runs through
 * validateWorksheet / validateExitTicket (deps.validateWorksheet /
 * deps.validateExitTicket, else deps.validate, else the built-in
 * player/validate.js validators).
 *
 * generateNotes and generateScript (issue #768) are the same kind of
 * sibling (build_notes_prompt.js / build_script_prompt.js, validateNotes
 * / validateScript). generateLessonPack (issue #768) runs ONE shared
 * unpack stage, then authors all twelve materials from it (animation,
 * slides, worksheet, notes, exit ticket, teacher script, lesson plan,
 * scaffolds, diagnostics, worked examples, quiz bank, revision)
 * and resolves with a pack manifest; packs are cached in memory by
 * topic slug.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else global.AnimathPipeline = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Sibling generator modules — the build_prompt.js pattern: Node require()
  // with an early return, then a straight-line browser-global fallback
  // (web/index.html loads unpack.js and build_prompt.js before this file).
  // A missing unpack.js script tag degrades inside unpackStage to the
  // no-transitions path (today's behavior); a missing build_prompt.js
  // rejects at the buildPrompts call. Neither case fails silently.
  var SIBLINGS = (function () {
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
      return {
        unpack: require('./unpack.js'),
        prompt: require('./build_prompt.js'),
        slidesPrompt: require('./build_slides_prompt.js'),
        worksheetPrompt: require('./build_worksheet_prompt.js'),
        exitTicketPrompt: require('./build_exit_ticket_prompt.js'),
        notesPrompt: require('./build_notes_prompt.js'),
        scriptPrompt: require('./build_script_prompt.js'),
        lessonPlanPrompt: require('./build_lesson_plan_prompt.js'),
        scaffoldPrompt: require('./build_scaffold_prompt.js'),
        diagnosticsPrompt: require('./build_diagnostics_prompt.js'),
        workedExamplesPrompt: require('./build_worked_examples_prompt.js'),
        quizBankPrompt: require('./build_quiz_bank_prompt.js'),
        revisionPrompt: require('./build_revision_prompt.js'),
        organisersPrompt: require('./build_organisers_prompt.js'),
        summativePrompt: require('./build_summative_prompt.js'),
        syllabus: require('./syllabus.js'),
        validate: require('../player/validate.js')
      };
    }
    var g = (typeof window !== 'undefined' ? window : globalThis);
    return {
      unpack: g.AnimathUnpack,
      prompt: g.AnimathPrompt,
      slidesPrompt: g.AnimathSlidesPrompt,
      worksheetPrompt: g.AnimathWorksheetPrompt,
      exitTicketPrompt: g.AnimathExitTicketPrompt,
      notesPrompt: g.AnimathNotesPrompt,
      scriptPrompt: g.AnimathScriptPrompt,
      lessonPlanPrompt: g.AnimathLessonPlanPrompt,
      scaffoldPrompt: g.AnimathScaffoldPrompt,
      diagnosticsPrompt: g.AnimathDiagnosticsPrompt,
      workedExamplesPrompt: g.AnimathWorkedExamplesPrompt,
      quizBankPrompt: g.AnimathQuizBankPrompt,
      revisionPrompt: g.AnimathRevisionPrompt,
      organisersPrompt: g.AnimathOrganisersPrompt,
      summativePrompt: g.AnimathSummativePrompt,
      syllabus: g.AnimathSyllabus,
      validate: g.AnimathValidate
    };
  })();

  var DEFAULT_MAX_REPAIRS = 3;

  // Per-kind wording for the shared author/repair loop. The animation
  // strings are byte-identical to the original pipeline wording (existing
  // tests assert them); the slide variants say "slide deck".
  var ANIMATION_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected animation spec as JSON.',
    repairHeader: 'Your previous response did not produce a valid animath spec. It had these problems:',
    invalidLabel: 'The invalid spec you returned:',
    returnLine: 'Return ONLY the corrected animation spec as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Animation spec'
  };
  var SLIDES_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected slide deck as JSON.',
    repairHeader: 'Your previous response did not produce a valid slide deck. It had these problems:',
    invalidLabel: 'The invalid slide deck you returned:',
    returnLine: 'Return ONLY the corrected slide deck as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Slide deck'
  };
  var WORKSHEET_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected worksheet as JSON.',
    repairHeader: 'Your previous response did not produce a valid worksheet. It had these problems:',
    invalidLabel: 'The invalid worksheet you returned:',
    returnLine: 'Return ONLY the corrected worksheet as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Worksheet'
  };
  var NOTES_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected student notes as JSON.',
    repairHeader: 'Your previous response did not produce valid student notes. It had these problems:',
    invalidLabel: 'The invalid student notes you returned:',
    returnLine: 'Return ONLY the corrected student notes as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Student notes'
  };
  var SCRIPT_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected teacher script as JSON.',
    repairHeader: 'Your previous response did not produce a valid teacher script. It had these problems:',
    invalidLabel: 'The invalid teacher script you returned:',
    returnLine: 'Return ONLY the corrected teacher script as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Teacher script'
  };
  var LESSON_PLAN_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected lesson plan as JSON.',
    repairHeader: 'Your previous response did not produce a valid lesson plan. It had these problems:',
    invalidLabel: 'The invalid lesson plan you returned:',
    returnLine: 'Return ONLY the corrected lesson plan as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Lesson plan'
  };
  var SCAFFOLDS_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected scaffolds as JSON.',
    repairHeader: 'Your previous response did not produce a valid scaffolds material. It had these problems:',
    invalidLabel: 'The invalid scaffolds you returned:',
    returnLine: 'Return ONLY the corrected scaffolds as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Scaffolds'
  };
  var DIAGNOSTICS_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected diagnostics as JSON.',
    repairHeader: 'Your previous response did not produce a valid diagnostics material. It had these problems:',
    invalidLabel: 'The invalid diagnostics you returned:',
    returnLine: 'Return ONLY the corrected diagnostics as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Diagnostics'
  };
  var WORKED_EXAMPLES_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected worked-example set as JSON.',
    repairHeader: 'Your previous response did not produce a valid worked-example set. It had these problems:',
    invalidLabel: 'The invalid worked-example set you returned:',
    returnLine: 'Return ONLY the corrected worked-example set as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Worked-example set'
  };
  var QUIZ_BANK_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected quiz bank as JSON.',
    repairHeader: 'Your previous response did not produce a valid quiz bank. It had these problems:',
    invalidLabel: 'The invalid quiz bank you returned:',
    returnLine: 'Return ONLY the corrected quiz bank as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Quiz bank'
  };
  var REVISION_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected revision material as JSON.',
    repairHeader: 'Your previous response did not produce a valid revision material. It had these problems:',
    invalidLabel: 'The invalid revision material you returned:',
    returnLine: 'Return ONLY the corrected revision material as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Revision material'
  };
  var ORGANISERS_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected organisers material as JSON.',
    repairHeader: 'Your previous response did not produce a valid organisers material. It had these problems:',
    invalidLabel: 'The invalid organisers material you returned:',
    returnLine: 'Return ONLY the corrected organisers material as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Organisers material'
  };
  var SUMMATIVE_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected summative assessment as JSON.',
    repairHeader: 'Your previous response did not produce a valid summative assessment. It had these problems:',
    invalidLabel: 'The invalid summative assessment you returned:',
    returnLine: 'Return ONLY the corrected summative assessment as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Summative assessment'
  };
  var EXIT_TICKET_KIND = {
    notJsonProblem: 'The response was not valid JSON. Return ONLY the corrected exit ticket as JSON.',
    repairHeader: 'Your previous response did not produce a valid exit ticket. It had these problems:',
    invalidLabel: 'The invalid exit ticket you returned:',
    returnLine: 'Return ONLY the corrected exit ticket as a single JSON object. No prose, no code fences.',
    rejectLabel: 'Exit ticket'
  };

  // The generator version named in pack manifests: the package.json
  // version in Node; 'unknown' in the browser (no package.json there).
  var GENERATOR_VERSION = (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') ? require('../package.json').version : 'unknown';

  // Deterministic topic slug: each part lowercased, every run of
  // non-alphanumeric characters collapsed to one hyphen, edge hyphens
  // stripped; parts joined topic-level-subject; 'untitled' fallback.
  function slugifyPart(part) {
    return String(part == null ? '' : part).trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function topicSlug(topic, level, subject) {
    var parts = [slugifyPart(topic), slugifyPart(level), slugifyPart(subject)]
      .filter(function (p) { return p.length > 0; });
    return parts.length ? parts.join('-') : 'untitled';
  }

  // In-memory lesson-pack cache keyed by topic slug (issue #768): a pack
  // is generated once before a session and reused every session. No
  // persistence, no filesystem.
  var packCache = new Map();
  function clearPackCache() { packCache.clear(); }

  function stripFences(text) {
    var t = text.trim();
    var m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    return m ? m[1].trim() : t;
  }

  // Same JSON extraction as llm_client.js: plain parse, then a brace-scan
  // fallback so prose-wrapped model output still parses.
  function extractJson(text) {
    var t = stripFences(text);
    try { return JSON.parse(t); } catch (e) { /* try brace scan */ }
    var start = t.indexOf('{');
    var end = t.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(t.slice(start, end + 1)); } catch (e2) { /* fall through */ }
    }
    throw new Error('pipeline: response was not valid JSON');
  }

  // A misbehaving progress listener must never break generation.
  function makeProgress(deps) {
    var onProgress = typeof deps.onProgress === 'function' ? deps.onProgress : function () {};
    return function progress(stage, n, max) {
      try { onProgress(stage, n, max); } catch (e) { /* ignore */ }
    };
  }

  // (a) unpack the topic into its state transitions. Any failure — a
  // throwing prompt builder, a failed chat call, an unusable parse —
  // degrades to null (no transitions), i.e. today's behavior. Shared by
  // generateAnimation and generateSlides.
  function unpackStage(deps, progress, opts) {
    progress('unpack', 1, 1);
    var prompts;
    try {
      prompts = SIBLINGS.unpack.buildUnpackPrompts(opts.topic, {
        level: opts.level,
        subject: opts.subject
      });
    } catch (e) {
      return Promise.resolve(null);
    }
    return Promise.resolve(prompts).then(function (p) {
      return deps.callChat(p.system, p.user);
    }).then(function (text) {
      try { return SIBLINGS.unpack.parseUnpackResponse(text); }
      catch (e) { return null; }
    }, function () { return null; });
  }

  // (b) author the document, then repair against the validator. One
  // author/repair attempt: parse the raw text, run the validator.
  // Non-JSON counts as a failed attempt (the next repair turn asks for
  // JSON again), exactly like generateSpecWithRepair. The repair system
  // prompt is the original author system prompt, as in
  // generateSpecWithRepair. Shared by both kinds; `kind` carries the
  // wording, `validateFn` the validator.
  function authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, kind) {
    function parseAndValidate(text) {
      var spec;
      try {
        spec = extractJson(text);
      } catch (e) {
        return Promise.resolve({
          spec: null,
          raw: text,
          problems: [kind.notJsonProblem]
        });
      }
      return Promise.resolve(validateFn(spec)).then(function (problems) {
        return { spec: spec, raw: null, problems: problems };
      });
    }

    function buildRepairUser(prev) {
      var lines = [kind.repairHeader];
      prev.problems.forEach(function (p) { lines.push('- ' + p); });
      lines.push('');
      if (prev.spec) {
        lines.push(kind.invalidLabel);
        lines.push(JSON.stringify(prev.spec, null, 2));
      } else {
        lines.push('Your raw response (it was not valid JSON):');
        lines.push(String(prev.raw).slice(0, 2000));
      }
      lines.push('');
      lines.push(kind.returnLine);
      return lines.join('\n');
    }

    function rejectWithErrors(problems) {
      var err = new Error(
        kind.rejectLabel + ' still invalid after ' + maxRepairs + ' repair attempt(s): ' +
        problems.join(' | '));
      err.problems = problems;
      throw err;
    }

    function repairRound(prev, repairsUsed) {
      progress('repair', repairsUsed + 1, maxRepairs);
      return deps.callChat(prompts.system, buildRepairUser(prev)).then(function (text) {
        return parseAndValidate(text).then(function (result) {
          if (!result.problems.length) return result.spec;
          if (repairsUsed + 1 < maxRepairs) return repairRound(result, repairsUsed + 1);
          return rejectWithErrors(result.problems);
        });
      });
    }

    progress('author', 1, 1);
    return Promise.resolve(prompts).then(function (p) {
      return deps.callChat(p.system, p.user);
    }).then(function (text) {
      return parseAndValidate(text).then(function (result) {
        if (!result.problems.length) return result.spec;
        if (maxRepairs <= 0) return rejectWithErrors(result.problems);
        return repairRound(result, 0);
      });
    });
  }

  // The slide validator for generateSlides: deps.validateSlides when
  // supplied, else deps.validate, else the built-in player/validate.js
  // validateSlides (Node require / browser global via SIBLINGS). Null
  // when none is available, so generateSlides can reject with a clear
  // deps error naming validateSlides.
  function resolveSlidesValidator(deps) {
    if (typeof deps.validateSlides === 'function') return deps.validateSlides;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateSlides === 'function') {
      return SIBLINGS.validate.validateSlides;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveWorksheetValidator(deps) {
    if (typeof deps.validateWorksheet === 'function') return deps.validateWorksheet;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateWorksheet === 'function') {
      return SIBLINGS.validate.validateWorksheet;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveExitTicketValidator(deps) {
    if (typeof deps.validateExitTicket === 'function') return deps.validateExitTicket;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateExitTicket === 'function') {
      return SIBLINGS.validate.validateExitTicket;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveNotesValidator(deps) {
    if (typeof deps.validateNotes === 'function') return deps.validateNotes;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateNotes === 'function') {
      return SIBLINGS.validate.validateNotes;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveScriptValidator(deps) {
    if (typeof deps.validateScript === 'function') return deps.validateScript;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateScript === 'function') {
      return SIBLINGS.validate.validateScript;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveLessonPlanValidator(deps) {
    if (typeof deps.validateLessonPlan === 'function') return deps.validateLessonPlan;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateLessonPlan === 'function') {
      return SIBLINGS.validate.validateLessonPlan;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveScaffoldsValidator(deps) {
    if (typeof deps.validateScaffolds === 'function') return deps.validateScaffolds;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateScaffolds === 'function') {
      return SIBLINGS.validate.validateScaffolds;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveDiagnosticsValidator(deps) {
    if (typeof deps.validateDiagnostics === 'function') return deps.validateDiagnostics;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateDiagnostics === 'function') {
      return SIBLINGS.validate.validateDiagnostics;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveWorkedExamplesValidator(deps) {
    if (typeof deps.validateWorkedExamples === 'function') return deps.validateWorkedExamples;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateWorkedExamples === 'function') {
      return SIBLINGS.validate.validateWorkedExamples;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveQuizBankValidator(deps) {
    if (typeof deps.validateQuizBank === 'function') return deps.validateQuizBank;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateQuizBank === 'function') {
      return SIBLINGS.validate.validateQuizBank;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveRevisionValidator(deps) {
    if (typeof deps.validateRevision === 'function') return deps.validateRevision;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateRevision === 'function') {
      return SIBLINGS.validate.validateRevision;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveOrganisersValidator(deps) {
    if (typeof deps.validateOrganisers === 'function') return deps.validateOrganisers;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateOrganisers === 'function') {
      return SIBLINGS.validate.validateOrganisers;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveSummativeValidator(deps) {
    if (typeof deps.validateSummative === 'function') return deps.validateSummative;
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateSummative === 'function') {
      return SIBLINGS.validate.validateSummative;
    } /* node:coverage ignore next */
    return null;
  }

  function resolveAnimationValidator(deps) {
    if (typeof deps.validate === 'function') return deps.validate;
    if (SIBLINGS.validate && typeof SIBLINGS.validate.validateSpec === 'function') {
      return SIBLINGS.validate.validateSpec;
    } /* node:coverage ignore next */
    return null;
  }

  // opts:
  //   {topic, topicLabel, level, subject, kind, focus, facet, maxRepairs}
  //   (the buildPrompts option set; topic/subject required; maxRepairs
  //   defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validate(spec) -> string[] | Promise<string[]>,
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first spec that validates clean; rejects with an Error
  // carrying err.problems when every attempt failed. A throwing or
  // unparseable unpack step degrades gracefully to buildPrompts WITHOUT
  // transitions (today's behavior) — the pipeline is never worse than the
  // old path. (A missing unpack.js script tag in the browser degrades the
  // same way: the TypeError is caught by the unpack stage.)
  function generateAnimation(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateAnimation: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    if (typeof deps.validate !== 'function') {
      return Promise.reject(new Error('generateAnimation: deps.validate(spec) ' +
        'must be a function returning the problem list'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      // Slice 6 (issue #695): attach the bank's wrong-turn beat to the
      // transition where it happens before authoring, so buildPrompts can
      // name the misconceived scene. The degraded null path (no
      // transitions) is untouched — attachMisconceptions never sees it.
      // Staging (owner direction 2026-10-12): the unpacked shape
      // (sequence/cycle/system) decides the scene layout.
      var transitions = staged ? staged.transitions : null;
      var shape = staged ? staged.shape : undefined;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.prompt.buildPrompts({
        level: opts.level,
        subject: opts.subject,
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        kind: opts.kind,
        focus: opts.focus,
        facet: opts.facet,
        transitions: transitions,
        shape: shape
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, deps.validate, ANIMATION_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, maxRepairs}
  //   (the buildSlidePrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateSlides?(deck) -> string[] | Promise<string[]>,
  //    validate?(deck) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first slide deck that validates clean against
  // validateSlides; rejects with an Error carrying err.problems when
  // every attempt failed. The unpack step degrades exactly like
  // generateAnimation: a failed unpack authors WITHOUT transitions.
  function generateSlides(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateSlides: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveSlidesValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateSlides: deps.validateSlides(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateSlides is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.slidesPrompt.buildSlidePrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, SLIDES_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, maxRepairs}
  //   (the buildWorksheetPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateWorksheet?(worksheet) -> string[] | Promise<string[]>,
  //    validate?(worksheet) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first worksheet that validates clean against
  // validateWorksheet; rejects with an Error carrying err.problems when
  // every attempt failed. The unpack step degrades exactly like
  // generateSlides: a failed unpack authors WITHOUT transitions.
  function generateWorksheet(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateWorksheet: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveWorksheetValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateWorksheet: deps.validateWorksheet(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateWorksheet is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.worksheetPrompt.buildWorksheetPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, WORKSHEET_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, maxRepairs}
  //   (the buildExitTicketPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateExitTicket?(ticket) -> string[] | Promise<string[]>,
  //    validate?(ticket) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first exit ticket that validates clean against
  // validateExitTicket; rejects with an Error carrying err.problems when
  // every attempt failed. The unpack step degrades exactly like
  // generateSlides: a failed unpack authors WITHOUT transitions.
  function generateExitTicket(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateExitTicket: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveExitTicketValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateExitTicket: deps.validateExitTicket(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateExitTicket is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.exitTicketPrompt.buildExitTicketPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, EXIT_TICKET_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, maxRepairs}
  //   (the buildNotesPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateNotes?(notes) -> string[] | Promise<string[]>,
  //    validate?(notes) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first student notes that validate clean against
  // validateNotes; rejects with an Error carrying err.problems when
  // every attempt failed. The unpack step degrades exactly like
  // generateSlides: a failed unpack authors WITHOUT transitions.
  function generateNotes(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateNotes: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveNotesValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateNotes: deps.validateNotes(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateNotes is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.notesPrompt.buildNotesPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, NOTES_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, maxRepairs}
  //   (the buildScriptPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateScript?(script) -> string[] | Promise<string[]>,
  //    validate?(script) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first teacher script that validates clean against
  // validateScript; rejects with an Error carrying err.problems when
  // every attempt failed. The unpack step degrades exactly like
  // generateSlides: a failed unpack authors WITHOUT transitions.
  function generateScript(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateScript: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveScriptValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateScript: deps.validateScript(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateScript is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.scriptPrompt.buildScriptPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, SCRIPT_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, maxRepairs}
  //   (the buildLessonPlanPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateLessonPlan?(plan) -> string[] | Promise<string[]>,
  //    validate?(plan) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first lesson plan that validates clean against
  // validateLessonPlan; rejects with an Error carrying err.problems
  // when every attempt failed. The unpack step degrades exactly like
  // generateScript: a failed unpack authors WITHOUT transitions.
  // generateLessonPack also authors a plan as its seventh material
  // (issue #1217) through the same builder + validator + repair kind.
  function generateLessonPlan(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateLessonPlan: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveLessonPlanValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateLessonPlan: deps.validateLessonPlan(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateLessonPlan is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.lessonPlanPrompt.buildLessonPlanPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, LESSON_PLAN_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, definitions,
  //    mechanismSteps, maxRepairs}
  //   (the buildScaffoldPrompts option set; topic/subject required;
  //   definitions/mechanismSteps carry the paired student notes the
  //   scaffolds derive from; maxRepairs defaults to 3, 0 disables
  //   repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateScaffolds?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first scaffolds material that validates clean
  // against validateScaffolds; rejects with an Error carrying
  // err.problems when every attempt failed. The unpack step degrades
  // exactly like generateLessonPlan: a failed unpack authors WITHOUT
  // transitions.
  function generateScaffolds(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateScaffolds: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveScaffoldsValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateScaffolds: deps.validateScaffolds(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateScaffolds is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.scaffoldPrompt.buildScaffoldPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        definitions: opts.definitions,
        mechanismSteps: opts.mechanismSteps,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, SCAFFOLDS_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, facet, workedExample,
  //    maxRepairs}
  //   (the buildDiagnosticsPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateDiagnostics?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Diagnostics are generated FROM the misconception bank: the topic's
  // bank entry is resolved first, and a topic with no bank entry
  // rejects before any LLM call - the generator never invents
  // misconceptions. Resolves with the first diagnostics material that
  // validates clean against validateDiagnostics; rejects with an Error
  // carrying err.problems when every attempt failed. The unpack step
  // degrades exactly like generateScaffolds: a failed unpack authors
  // WITHOUT transitions.
  function generateDiagnostics(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    var entry = SIBLINGS.prompt.misconceptionFor(opts.topic, opts.facet);
    if (!entry) {
      return Promise.reject(new Error('generateDiagnostics: no misconception bank entry for topic "' +
        opts.topic + '" - diagnostics are generated from the bank and never invent misconceptions'));
    }
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateDiagnostics: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveDiagnosticsValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateDiagnostics: deps.validateDiagnostics(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateDiagnostics is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.diagnosticsPrompt.buildDiagnosticsPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        facet: opts.facet,
        transitions: transitions,
        bank: { wrongTurn: entry.wrongTurn, why: entry.why, correctTurn: entry.correctTurn },
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, DIAGNOSTICS_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, focus, workedExample,
  //    maxRepairs}
  //   (the buildWorkedExamplesPrompts option set; topic/subject
  //   required; maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateWorkedExamples?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Resolves with the first worked-example set that validates clean
  // against validateWorkedExamples; rejects with an Error carrying
  // err.problems when every attempt failed. The unpack step degrades
  // exactly like generateScaffolds: a failed unpack authors WITHOUT
  // transitions.
  function generateWorkedExamples(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateWorkedExamples: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveWorkedExamplesValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateWorkedExamples: deps.validateWorkedExamples(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateWorkedExamples is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.workedExamplesPrompt.buildWorkedExamplesPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        focus: opts.focus,
        transitions: transitions,
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, WORKED_EXAMPLES_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, facet, focus, workedExample,
  //    maxRepairs}
  //   (the buildQuizBankPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateQuizBank?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Quiz banks are generated FROM the misconception bank: the topic's
  // bank entry is resolved first (the topic verbatim, then its
  // slugified forms, facet carried - the resolvePackBankEntry order),
  // and a topic with no bank entry rejects before any LLM call naming
  // quizBank - the generator never invents misconceptions. Resolves
  // with the first quiz bank that validates clean against
  // validateQuizBank; rejects with an Error carrying err.problems when
  // every attempt failed. The unpack step degrades exactly like
  // generateDiagnostics: a failed unpack authors WITHOUT transitions.
  function generateQuizBank(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    var entry = resolvePackBankEntry(opts);
    if (!entry) {
      return Promise.reject(new Error('generateQuizBank: no misconception bank entry for topic \"' +
        opts.topic + '\" - quizBank materials are generated from the bank and never invent misconceptions'));
    }
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateQuizBank: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveQuizBankValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateQuizBank: deps.validateQuizBank(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateQuizBank is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.quizBankPrompt.buildQuizBankPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        facet: opts.facet,
        focus: opts.focus,
        transitions: transitions,
        bank: { wrongTurn: entry.wrongTurn, why: entry.why, correctTurn: entry.correctTurn },
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, QUIZ_BANK_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, facet, focus, workedExample,
  //    maxRepairs}
  //   (the buildRevisionPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateRevision?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Revision materials are generated FROM the misconception bank: the
  // topic's bank entry is resolved first (the topic verbatim, then its
  // slugified forms, facet carried - the resolvePackBankEntry order),
  // and a topic with no bank entry rejects before any LLM call naming
  // revision - the generator never invents misconceptions, because
  // every flashcard and practice item is derived verbatim from the
  // paired quiz bank and notes. Resolves with the first revision
  // material that validates clean against validateRevision; rejects
  // with an Error carrying err.problems when every attempt failed.
  // The unpack step degrades exactly like generateQuizBank: a failed
  // unpack authors WITHOUT transitions.
  function generateRevision(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    var entry = resolvePackBankEntry(opts);
    if (!entry) {
      return Promise.reject(new Error('generateRevision: no misconception bank entry for topic "' +
        opts.topic + '" - revision materials are generated from the bank and never invent misconceptions'));
    }
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateRevision: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveRevisionValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateRevision: deps.validateRevision(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateRevision is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.revisionPrompt.buildRevisionPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        facet: opts.facet,
        focus: opts.focus,
        transitions: transitions,
        bank: { wrongTurn: entry.wrongTurn, why: entry.why, correctTurn: entry.correctTurn },
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, REVISION_KIND);
    });
  }

  // opts:
  //   {topic, topicLabel, level, subject, facet, focus, workedExample,
  //    maxRepairs}
  //   (the buildOrganisersPrompts option set; topic/subject required;
  //   maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateOrganisers?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'unpack', 'author', 'repair'.
  //
  // Organisers materials are generated FROM the misconception bank:
  // the topic's bank entry is resolved first (the topic verbatim, then
  // its slugified forms, facet carried - the resolvePackBankEntry
  // order), and a topic with no bank entry rejects before any LLM call
  // naming organisers - the generator never invents misconceptions,
  // because every slot entry is derived verbatim from the topic unpack
  // stages and the paired notes mechanism steps and definitions.
  // Resolves with the first organisers material that validates clean
  // against validateOrganisers; rejects with an Error carrying
  // err.problems when every attempt failed. The unpack step degrades
  // exactly like generateRevision: a failed unpack authors WITHOUT
  // transitions.
  function generateOrganisers(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    var entry = resolvePackBankEntry(opts);
    if (!entry) {
      return Promise.reject(new Error('generateOrganisers: no misconception bank entry for topic "' +
        opts.topic + '" - organisers materials are generated from the bank and never invent misconceptions'));
    }
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateOrganisers: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveOrganisersValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateOrganisers: deps.validateOrganisers(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateOrganisers is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var prompts = SIBLINGS.organisersPrompt.buildOrganisersPrompts({
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        facet: opts.facet,
        focus: opts.focus,
        transitions: transitions,
        bank: { wrongTurn: entry.wrongTurn, why: entry.why, correctTurn: entry.correctTurn },
        workedExample: opts.workedExample
      });
      return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, ORGANISERS_KIND);
    });
  }

  // opts:
  //   {topics, unitTitle, level, subject, focus, workedExample,
  //    maxRepairs}
  //   (the buildSummativePrompts option set; subject and at least 2
  //   topics required; maxRepairs defaults to 3, 0 disables repair).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validateSummative?(spec) -> string[] | Promise<string[]>,
  //    validate?(spec) -> string[] | Promise<string[]>  (fallback validator),
  //    onProgress?(stage, n, max)}  stages: 'author', 'repair'.
  //
  // A summative assessment is unit-level: it spans a topics array and
  // is authored directly from the unit (there is no single-topic
  // unpack and no misconception bank resolution - the blueprint, not
  // a bank, is its contract). Resolves with the first assessment that
  // validates clean against validateSummative; rejects with an Error
  // carrying err.problems when every attempt failed, naming summative.
  function generateSummative(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateSummative: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var validateFn = resolveSummativeValidator(deps);
    /* node:coverage ignore next 5 */
    if (!validateFn) {
      return Promise.reject(new Error('generateSummative: deps.validateSummative(spec) ' +
        'must be a function returning the problem list (or supply deps.validate, ' +
        'or load player/validate.js so validateSummative is available)'));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;
    var prompts;
    try {
      prompts = SIBLINGS.summativePrompt.buildSummativePrompts({
        topics: opts.topics,
        unitTitle: opts.unitTitle,
        level: opts.level,
        subject: opts.subject,
        focus: opts.focus,
        workedExample: opts.workedExample
      });
    } catch (err) {
      return Promise.reject(err);
    }
    return authorAndRepair(deps, progress, maxRepairs, prompts, validateFn, SUMMATIVE_KIND);
  }

  // opts:
  //   {topic, topicLabel, level, subject, workedExample, kind, focus,
  //    facet, maxRepairs, force}
  //   (the union of the twelve material option sets; topic/subject
  //   required; maxRepairs defaults to 3; force === true bypasses the
  //   pack cache and regenerates, replacing the cached entry).
  // deps:
  //   {callChat(system, user) -> Promise<string>  (caller-supplied LLM call),
  //    validate?(spec) / validateSlides? / validateWorksheet? /
  //    validateNotes? / validateExitTicket? / validateScript? /
  //    validateLessonPlan? / validateScaffolds? / validateDiagnostics? /
  //    validateWorkedExamples? / validateQuizBank? / validateRevision?
  //      (per-material validators, resolved like the single-material
  //      generators; the built-in player/validate.js validators are the
  //      defaults), onProgress?(stage, n, max)}.
  //
  // Runs ONE shared unpack stage, then authors all twelve materials from
  // that single unpack, each through its existing builder + validator +
  // repair discipline. A material that exhausts its repair cap rejects
  // the whole pack with that material named on err.material (and
  // err.problems carried). Resolves with
  // {manifest, animation, slides, worksheet, notes, exitTicket, script,
  // lessonPlan, scaffolds, diagnostics, workedExamples, quizBank, revision}
  // where manifest = {slug, topic, level, subject, version, materials,
  // metadata} (metadata per packMetadataFor above, issue #1221).
  // Packs are cached in memory by slug: a repeat call with the same
  // slug resolves the cached pack with zero further callChat calls.
  // Pack metadata (issue #1221): the deterministic transparency block on
  // every pack manifest. Syllabus facts come from syllabus resolution --
  // the topic verbatim first, then its slugified form -- never from the
  // LLM; an unresolved topic still emits a valid block with a null year
  // and empty code lists. The AI label names the model identity available
  // to the call (opts.model, default 'unknown') and the generator
  // version; review starts null (unsigned) and moderation unreviewed.
  function packMetadataFor(opts) {
    var facts = null;
    try { facts = SIBLINGS.syllabus.topicFacts(opts.topic); } catch (err) { facts = null; }
    if (!facts) {
      try { facts = SIBLINGS.syllabus.topicFacts(topicSlug(opts.topic)); } catch (err) { facts = null; }
    }
    if (!facts) facts = { syllabusYear: null, outcomeCodes: [], assessmentObjectives: [] };
    return {
      syllabusYear: facts.syllabusYear,
      outcomeCodes: facts.outcomeCodes,
      assessmentObjectives: facts.assessmentObjectives,
      aiGenerated: {
        label: 'AI-generated',
        model: (typeof opts.model === 'string' && opts.model) ? opts.model : 'unknown',
        generatorVersion: GENERATOR_VERSION
      },
      review: null,
      moderation: { state: 'unreviewed' }
    };
  }

  // The pack's diagnostics bank resolution (issue #1245): pure lookup,
  // no LLM traffic. Returns the resolved bank entry or null.
  function resolvePackBankEntry(opts) {
    var topicOnly = topicSlug(opts.topic);
    var candidates = [opts.topic, topicOnly];
    if (topicOnly.indexOf('the-') === 0) candidates.push(topicOnly.slice(4));
    candidates.push(topicSlug(opts.topic, opts.level, opts.subject));
    for (var i = 0; i < candidates.length; i++) {
      var entry = SIBLINGS.prompt.misconceptionFor(candidates[i], opts.facet);
      if (entry) return entry;
    }
    return null;
  }

  function generateLessonPack(opts, deps) {
    opts = opts || {};
    deps = deps || {};
    if (typeof deps.callChat !== 'function') {
      return Promise.reject(new Error('generateLessonPack: deps.callChat(system, user) ' +
        'must be a function returning a Promise of the raw response text'));
    }
    var slug = topicSlug(opts.topic, opts.level, opts.subject);
    if (opts.force !== true && packCache.has(slug)) {
      return Promise.resolve(packCache.get(slug));
    }
    var progress = makeProgress(deps);
    var maxRepairs = (opts.maxRepairs != null) ? opts.maxRepairs : DEFAULT_MAX_REPAIRS;
    var animationValidate = resolveAnimationValidator(deps);
    /* node:coverage ignore next 5 */
    if (!animationValidate) {
      return Promise.reject(new Error('generateLessonPack: no animation validator ' +
        'available (supply deps.validate, or load player/validate.js so ' +
        'validateSpec is available)'));
    }
    var validators = {
      animation: animationValidate,
      slides: resolveSlidesValidator(deps),
      worksheet: resolveWorksheetValidator(deps),
      notes: resolveNotesValidator(deps),
      exitTicket: resolveExitTicketValidator(deps),
      script: resolveScriptValidator(deps),
      lessonPlan: resolveLessonPlanValidator(deps),
      scaffolds: resolveScaffoldsValidator(deps),
      diagnostics: resolveDiagnosticsValidator(deps),
      workedExamples: resolveWorkedExamplesValidator(deps),
      quizBank: resolveQuizBankValidator(deps),
      revision: resolveRevisionValidator(deps)
    };
    var missing = Object.keys(validators).filter(function (k) { return !validators[k]; });
    /* node:coverage ignore next 5 */
    if (missing.length) {
      return Promise.reject(new Error('generateLessonPack: no validator available for ' +
        missing.join(', ') + ' (supply the per-material deps validator, or load ' +
        'player/validate.js)'));
    }
    // The diagnostics material is generated FROM the misconception bank
    // (generateDiagnostics semantics): resolve the topic's bank entry
    // before any authoring, and reject a bank-less topic outright - the
    // pack never invents misconceptions and never silently omits its
    // diagnostics material. The bank is keyed by topic slug, while pack
    // callers pass free-text topics, so resolution tries the topic
    // verbatim, then its slugified forms (topic only, topic only minus
    // a leading article, and the full pack slug, whose longest-prefix
    // rule resolves faceted entries) - the same verbatim-then-slugified
    // order packMetadataFor uses for syllabus facts.
    var bankEntry = resolvePackBankEntry(opts);
    if (!bankEntry) {
      return Promise.reject(new Error('generateLessonPack: no misconception bank entry for topic \"' +
        opts.topic + '\" - diagnostics are generated from the bank and never invent ' +
        'misconceptions, so the pack cannot include its diagnostics material'));
    }

    return unpackStage(deps, progress, opts).then(function (staged) {
      var transitions = staged ? staged.transitions : null;
      var shape = staged ? staged.shape : undefined;
      if (transitions) {
        transitions = SIBLINGS.unpack.attachMisconceptions(transitions, opts.topic);
      }
      var base = {
        topic: opts.topic,
        topicLabel: opts.topicLabel,
        level: opts.level,
        subject: opts.subject,
        transitions: transitions,
        workedExample: opts.workedExample
      };
      var jobs = [
        ['animation', SIBLINGS.prompt.buildPrompts({
          level: opts.level, subject: opts.subject, topic: opts.topic,
          topicLabel: opts.topicLabel, kind: opts.kind, focus: opts.focus,
          facet: opts.facet, transitions: transitions, shape: shape
        }), validators.animation, ANIMATION_KIND],
        ['slides', SIBLINGS.slidesPrompt.buildSlidePrompts(base), validators.slides, SLIDES_KIND],
        ['worksheet', SIBLINGS.worksheetPrompt.buildWorksheetPrompts(base), validators.worksheet, WORKSHEET_KIND],
        ['notes', SIBLINGS.notesPrompt.buildNotesPrompts(base), validators.notes, NOTES_KIND],
        ['exitTicket', SIBLINGS.exitTicketPrompt.buildExitTicketPrompts(base), validators.exitTicket, EXIT_TICKET_KIND],
        ['script', SIBLINGS.scriptPrompt.buildScriptPrompts(base), validators.script, SCRIPT_KIND],
        ['lessonPlan', SIBLINGS.lessonPlanPrompt.buildLessonPlanPrompts(base), validators.lessonPlan, LESSON_PLAN_KIND],
        ['scaffolds', SIBLINGS.scaffoldPrompt.buildScaffoldPrompts(base), validators.scaffolds, SCAFFOLDS_KIND],
        ['diagnostics', SIBLINGS.diagnosticsPrompt.buildDiagnosticsPrompts({
          topic: opts.topic,
          topicLabel: opts.topicLabel,
          level: opts.level,
          subject: opts.subject,
          facet: opts.facet,
          transitions: transitions,
          bank: { wrongTurn: bankEntry.wrongTurn, why: bankEntry.why, correctTurn: bankEntry.correctTurn },
          workedExample: opts.workedExample
        }), validators.diagnostics, DIAGNOSTICS_KIND],
        ['workedExamples', SIBLINGS.workedExamplesPrompt.buildWorkedExamplesPrompts({
          topic: opts.topic,
          topicLabel: opts.topicLabel,
          level: opts.level,
          subject: opts.subject,
          focus: opts.focus,
          transitions: transitions,
          workedExample: opts.workedExample
        }), validators.workedExamples, WORKED_EXAMPLES_KIND],
        ['quizBank', SIBLINGS.quizBankPrompt.buildQuizBankPrompts({
          topic: opts.topic,
          topicLabel: opts.topicLabel,
          level: opts.level,
          subject: opts.subject,
          facet: opts.facet,
          transitions: transitions,
          bank: { wrongTurn: bankEntry.wrongTurn, why: bankEntry.why, correctTurn: bankEntry.correctTurn },
          workedExample: opts.workedExample
        }), validators.quizBank, QUIZ_BANK_KIND],
        ['revision', SIBLINGS.revisionPrompt.buildRevisionPrompts({
          topic: opts.topic,
          topicLabel: opts.topicLabel,
          level: opts.level,
          subject: opts.subject,
          facet: opts.facet,
          focus: opts.focus,
          transitions: transitions,
          bank: { wrongTurn: bankEntry.wrongTurn, why: bankEntry.why, correctTurn: bankEntry.correctTurn },
          workedExample: opts.workedExample
        }), validators.revision, REVISION_KIND]
      ];
      var pack = {
        manifest: {
          slug: slug,
          topic: opts.topic,
          level: opts.level,
          subject: opts.subject,
          version: GENERATOR_VERSION,
          materials: ['animation', 'slides', 'worksheet', 'notes', 'exitTicket', 'script', 'lessonPlan', 'scaffolds', 'diagnostics', 'workedExamples', 'quizBank', 'revision'],
          metadata: packMetadataFor(opts)
        }
      };
      var chain = Promise.resolve();
      jobs.forEach(function (job) {
        chain = chain.then(function () {
          return authorAndRepair(deps, progress, maxRepairs, job[1], job[2], job[3])
            .then(function (doc) { pack[job[0]] = doc; }, function (err) {
              if (err && typeof err === 'object' && err.material == null) err.material = job[0];
              throw err;
            });
        });
      });
      return chain.then(function () {
        packCache.set(slug, pack);
        return pack;
      });
    });
  }

  // generateLessonPackForSyllabus (issue #770): the syllabus-keyed entry
  // point. Resolves id (bare slug or level/track/slug) via
  // generator/syllabus.js first — an unknown, malformed, or ambiguous id
  // rejects (never throws synchronously) before any deps/callChat check
  // or LLM call. The resolved topic/topicLabel/level/subject seed the
  // opts; every own key of opts whose value is not undefined overlays
  // them (explicit opts win), then generateLessonPack runs as usual, so
  // the pack shares its cache entry with a direct generateLessonPack
  // call carrying the resolved values verbatim.
  function generateLessonPackForSyllabus(id, opts, deps) {
    var resolved;
    try {
      resolved = SIBLINGS.syllabus.resolveSyllabusTopic(id);
    } catch (err) {
      return Promise.reject(err);
    }
    var merged = {
      topic: resolved.topic,
      topicLabel: resolved.topicLabel,
      level: resolved.level,
      subject: resolved.subject
    };
    var src = opts || {};
    Object.keys(src).forEach(function (key) {
      if (src[key] !== undefined) merged[key] = src[key];
    });
    return generateLessonPack(merged, deps);
  }

  return { generateAnimation: generateAnimation, generateSlides: generateSlides, generateWorksheet: generateWorksheet, generateExitTicket: generateExitTicket, generateNotes: generateNotes, generateScript: generateScript, generateLessonPlan: generateLessonPlan, generateScaffolds: generateScaffolds, generateDiagnostics: generateDiagnostics, generateWorkedExamples: generateWorkedExamples, generateQuizBank: generateQuizBank, generateRevision: generateRevision, generateOrganisers: generateOrganisers, generateSummative: generateSummative, generateLessonPack: generateLessonPack, generateLessonPackForSyllabus: generateLessonPackForSyllabus, clearPackCache: clearPackCache };
});
