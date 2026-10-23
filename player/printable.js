/* Printable worksheet + exit-ticket renderer - zero-dependency
 * student sheet and teacher answer-key renderer (issue #758), plus
 * printable student notes and teacher script renderer (issue #766).
 *
 * Renders a worksheet validated by AnimathValidate.validateWorksheet,
 * an exit ticket validated by AnimathValidate.validateExitTicket,
 * student notes validated by AnimathValidate.validateNotes, a
 * teacher script validated by AnimathValidate.validateScript, or a
 * lesson plan validated by AnimathValidate.validateLessonPlan, or a
 * scaffolds material validated by AnimathValidate.validateScaffolds
 * or a diagnostics material validated by AnimathValidate.validateDiagnostics
 * (SPEC.md "Worksheet spec" / "Exit ticket spec" / "Student notes
 * spec" / "Teacher script spec" / "Lesson plan spec" / "Scaffolds
 * spec") to HTML strings.
 *
 * Student/teacher separation is structural (the presenter speaker-notes
 * precedent): the student functions never read choices[].correct,
 * answer, explanation, feedback, or misconception, so teacher content
 * cannot leak into a student sheet. The teacher functions are separate
 * entry points that render the answer key.
 *
 * UMD, zero dependencies, no DOM at load: every function is a pure
 * spec -> HTML-string transform, node-testable without fakes.
 *
 * Usage from a demo page (thin bootstrap only):
 *   var html = AnimathPrintable.renderWorksheet(spec);
 */
(function (global) {
  'use strict';

  function getValidateWorksheet() {
    var g = global.AnimathValidate;
    if (g) return g.validateWorksheet || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateWorksheet : null;
  }

  function getValidateExitTicket() {
    var g = global.AnimathValidate;
    if (g) return g.validateExitTicket || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateExitTicket : null;
  }

  function getValidateNotes() {
    var g = global.AnimathValidate;
    if (g) return g.validateNotes || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateNotes : null;
  }

  function getValidateScript() {
    var g = global.AnimathValidate;
    if (g) return g.validateScript || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateScript : null;
  }

  function getValidateLessonPlan() {
    var g = global.AnimathValidate;
    if (g) return g.validateLessonPlan || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateLessonPlan : null;
  }

  function getValidateScaffolds() {
    var g = global.AnimathValidate;
    if (g) return g.validateScaffolds || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateScaffolds : null;
  }

  function getValidateDiagnostics() {
    var g = global.AnimathValidate;
    if (g) return g.validateDiagnostics || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateDiagnostics : null;
  }

  function getValidateWorkedExamples() {
    var g = global.AnimathValidate;
    if (g) return g.validateWorkedExamples || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateWorkedExamples : null;
  }

  function getValidateQuizBank() {
    var g = global.AnimathValidate;
    if (g) return g.validateQuizBank || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateQuizBank : null;
  }

  function assertValidWorksheet(spec) {
    var fn = getValidateWorksheet();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid worksheet: ' + errors.join('; '));
  }

  function assertValidExitTicket(spec) {
    var fn = getValidateExitTicket();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid exit ticket: ' + errors.join('; '));
  }

  function assertValidNotes(spec) {
    var fn = getValidateNotes();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid notes: ' + errors.join('; '));
  }

  function assertValidScript(spec) {
    var fn = getValidateScript();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid script: ' + errors.join('; '));
  }

  function assertValidLessonPlan(spec) {
    var fn = getValidateLessonPlan();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid lesson plan: ' + errors.join('; '));
  }

  function assertValidScaffolds(spec) {
    var fn = getValidateScaffolds();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid scaffolds: ' + errors.join('; '));
  }

  function assertValidDiagnostics(spec) {
    var fn = getValidateDiagnostics();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid diagnostics: ' + errors.join('; '));
  }

  function assertValidWorkedExamples(spec) {
    var fn = getValidateWorkedExamples();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid worked examples: ' + errors.join('; '));
  }

  function assertValidQuizBank(spec) {
    var fn = getValidateQuizBank();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid quiz bank: ' + errors.join('; '));
  }

  function getValidateSummative() {
    var g = global.AnimathValidate;
    if (g) return g.validateSummative || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateSummative : null;
  }

  function assertValidSummative(spec) {
    var fn = getValidateSummative();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid summative: ' + errors.join('; '));
  }

  function getValidateRevision() {
    var g = global.AnimathValidate;
    if (g) return g.validateRevision || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateRevision : null;
  }

  function assertValidRevision(spec) {
    var fn = getValidateRevision();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid revision: ' + errors.join('; '));
  }

  function getValidateOrganisers() {
    var g = global.AnimathValidate;
    if (g) return g.validateOrganisers || null;
    return typeof require !== 'undefined' ? require('./validate.js').validateOrganisers : null;
  }

  function assertValidOrganisers(spec) {
    var fn = getValidateOrganisers();
    if (!fn) throw new Error('animath printable: player/validate.js is missing - include it before printable.js so specs can be validated');
    var errors = fn(spec);
    if (errors.length) throw new Error('invalid organisers: ' + errors.join('; '));
  }

  // HTML-escape for text content and double-quoted attribute values,
  // the export-frames.js esc chain: & first, then <, >, ".
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Accessible-variant options (SPEC.md "Accessible variants"): an
  // optional second argument on every public renderer. Normalising
  // never throws - undefined, null, a non-object, {} and an all-false
  // object all normalise to all-off, unknown keys are ignored, and a
  // flag is on only when it is exactly true.
  function normalizeOptions(options) {
    if (!options || typeof options !== 'object') {
      return { enlargedPrint: false, unclutteredLayout: false, chunkInstructions: false };
    }
    return {
      enlargedPrint: options.enlargedPrint === true,
      unclutteredLayout: options.unclutteredLayout === true,
      chunkInstructions: options.chunkInstructions === true
    };
  }

  function variantClasses(opts) {
    var suffix = '';
    if (opts.enlargedPrint) suffix += ' pr-enlarged';
    if (opts.unclutteredLayout) suffix += ' pr-uncluttered';
    return suffix;
  }

  function sheetHeader(spec, kindClass, kindLabel, opts) {
    var parts = [];
    parts.push('<section class="' + kindClass + variantClasses(opts) + '">');
    parts.push('<h1 class="pr-title">' + escapeHtml(spec.title) + '</h1>');
    parts.push('<p class="pr-meta">' + escapeHtml(spec.subject) + ' · ' +
      escapeHtml(spec.topic) + ' · ' + escapeHtml(spec.level) + '</p>');
    parts.push('<p class="pr-kind">' + kindLabel + '</p>');
    if (typeof spec.instructions === 'string' && spec.instructions.length > 0) {
      if (opts.chunkInstructions) {
        // Split the raw text into sentences: a terminator (. ! ?)
        // followed by whitespace and an uppercase letter or digit, so
        // decimals (1.5) and abbreviations (e.g.) never split, and a
        // trailing sentence with no terminator stays one chunk. Each
        // sentence is escaped individually after splitting.
        var sentences = spec.instructions.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
        parts.push('<ul class="pr-instructions pr-instructions-chunked">');
        sentences.forEach(function (sentence) {
          parts.push('<li class="pr-instruction">' + escapeHtml(sentence) + '</li>');
        });
        parts.push('</ul>');
      } else {
        parts.push('<p class="pr-instructions">' + escapeHtml(spec.instructions) + '</p>');
      }
    }
    return parts;
  }

  // Worksheet tier labels (SPEC.md "Worksheet spec"): the tier shows on
  // both the student sheet and the teacher key - labels visible to
  // students are the deliberate inclusion choice. Mapped through this
  // lookup so a raw tier value is never emitted.
  var TIER_LABELS = { support: 'Support', core: 'Core', extension: 'Extension' };

  function tierLine(q, showTier) {
    if (!showTier || !q.tier || !TIER_LABELS[q.tier]) return null;
    return '<p class="pr-tier">Tier: ' + TIER_LABELS[q.tier] + '</p>';
  }

  // Student sheet: prompts and choice texts only. This function must
  // never read choices[].correct, answer, explanation, feedback, or
  // misconception - see the header comment.
  function renderStudentSheet(spec, kindClass, kindLabel, showTier, opts) {
    var parts = sheetHeader(spec, kindClass, kindLabel, opts);
    parts.push('<ol class="pr-questions">');
    spec.questions.forEach(function (q) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(q.prompt) + '</p>');
      var tier = tierLine(q, showTier);
      if (tier) parts.push(tier);
      if (q.kind === 'multiple-choice') {
        parts.push('<ul class="pr-choices">');
        q.choices.forEach(function (choice) {
          parts.push('<li class="pr-choice">' + escapeHtml(choice.text) + '</li>');
        });
        parts.push('</ul>');
      } else {
        parts.push('<div class="pr-answer-lines">' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span></div>');
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher answer key: the correct/expected answer per question, plus
  // the explanation, feedback, and misconception where present.
  function renderAnswerKey(spec, kindClass, kindLabel, showTier, opts) {
    var parts = sheetHeader(spec, kindClass, kindLabel, opts);
    parts.push('<ol class="pr-questions">');
    spec.questions.forEach(function (q) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(q.prompt) + '</p>');
      var tier = tierLine(q, showTier);
      if (tier) parts.push(tier);
      if (q.kind === 'multiple-choice') {
        q.choices.forEach(function (choice) {
          if (choice.correct === true) {
            parts.push('<p class="pr-answer">Answer: ' + escapeHtml(choice.text) + '</p>');
          }
        });
      } else {
        parts.push('<p class="pr-answer">Answer: ' + escapeHtml(q.answer) + '</p>');
      }
      if (q.explanation) {
        parts.push('<p class="pr-explanation">' + escapeHtml(q.explanation) + '</p>');
      }
      if (q.feedback) {
        parts.push('<p class="pr-feedback">Feedback: ' + escapeHtml(q.feedback) + '</p>');
      }
      if (q.misconception) {
        parts.push('<p class="pr-misconception">Misconception: ' + escapeHtml(q.misconception) + '</p>');
      }
      if (q.marks !== undefined) {
        parts.push('<p class="pr-marks">Marks: ' + q.marks + '</p>');
      }
      if (q.markScheme) {
        parts.push('<ul class="pr-mark-scheme">');
        q.markScheme.points.forEach(function (point) {
          parts.push('<li class="pr-credit-point">' + escapeHtml(point.text) + ' (' + point.marks + ')</li>');
        });
        parts.push('</ul>');
        if (q.markScheme.alternatives) {
          q.markScheme.alternatives.forEach(function (alternative) {
            parts.push('<p class="pr-alternative">Also accept: ' + escapeHtml(alternative) + '</p>');
          });
        }
        if (q.markScheme.commonErrors) {
          q.markScheme.commonErrors.forEach(function (commonError) {
            parts.push('<p class="pr-common-error">Common error: ' + escapeHtml(commonError) + '</p>');
          });
        }
        if (q.markScheme.ecf) {
          parts.push('<p class="pr-ecf">Error carried forward: a later step built on an earlier wrong value can still earn its marks.</p>');
        }
      }
      if (q.workedSolution) {
        parts.push('<p class="pr-worked-solution">Worked solution: ' + escapeHtml(q.workedSolution) + '</p>');
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  function renderWorksheet(spec, options) {
    assertValidWorksheet(spec);
    var opts = normalizeOptions(options);
    if (spec.variant === 'homework') {
      var parts = renderStudentSheet(spec, 'pr-sheet pr-student pr-worksheet', 'Worksheet', true, opts).split('\n');
      var kindIdx = parts.findIndex(function (line) { return line.indexOf('pr-kind') !== -1; });
      parts.splice(kindIdx + 1, 0, '<p class="pr-homework">Homework: low-stakes practice - try it on your own, then check yourself with the self-mark key.</p>');
      return parts.join('\n');
    }
    return renderStudentSheet(spec, 'pr-sheet pr-student pr-worksheet', 'Worksheet', true, opts);
  }

  function renderWorksheetAnswerKey(spec, options) {
    assertValidWorksheet(spec);
    if (spec.variant === 'homework') {
      return renderAnswerKey(spec, 'pr-sheet pr-teacher pr-answer-key pr-worksheet', 'Homework self-mark key', true, normalizeOptions(options));
    }
    return renderAnswerKey(spec, 'pr-sheet pr-teacher pr-answer-key pr-worksheet', 'Worksheet answer key', true, normalizeOptions(options));
  }

  function renderExitTicket(spec, options) {
    assertValidExitTicket(spec);
    return renderStudentSheet(spec, 'pr-sheet pr-student pr-exit-ticket', 'Exit ticket', false, normalizeOptions(options));
  }

  function renderExitTicketAnswerKey(spec, options) {
    assertValidExitTicket(spec);
    return renderAnswerKey(spec, 'pr-sheet pr-teacher pr-answer-key pr-exit-ticket', 'Exit ticket answer key', false, normalizeOptions(options));
  }

  // Student notes: objectives, definitions, mechanism steps, a worked
  // example, and the trap (misconception plus why it is wrong).
  function renderNotes(spec, options) {
    assertValidNotes(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-notes', 'Student notes', normalizeOptions(options));
    parts.push('<h2 class="pr-notes-heading">Objectives</h2>');
    parts.push('<ul class="pr-objectives">');
    spec.objectives.forEach(function (objective) {
      parts.push('<li class="pr-objective">' + escapeHtml(objective) + '</li>');
    });
    parts.push('</ul>');
    parts.push('<h2 class="pr-notes-heading">Definitions</h2>');
    parts.push('<dl class="pr-definitions">');
    spec.definitions.forEach(function (definition) {
      parts.push('<dt class="pr-term">' + escapeHtml(definition.term) + '</dt>');
      parts.push('<dd class="pr-meaning">' + escapeHtml(definition.meaning) + '</dd>');
    });
    parts.push('</dl>');
    parts.push('<h2 class="pr-notes-heading">How it works</h2>');
    parts.push('<ol class="pr-mechanism-steps">');
    spec.mechanismSteps.forEach(function (step) {
      parts.push('<li class="pr-mechanism-step">' + escapeHtml(step) + '</li>');
    });
    parts.push('</ol>');
    parts.push('<h2 class="pr-notes-heading">Worked example</h2>');
    parts.push('<p class="pr-worked-example">' + escapeHtml(spec.workedExample) + '</p>');
    parts.push('<section class="pr-trap">');
    parts.push('<h2 class="pr-notes-heading">Watch out: the trap</h2>');
    parts.push('<p class="pr-trap-misconception">' + escapeHtml(spec.trap.misconception) + '</p>');
    parts.push('<p class="pr-trap-explanation">' + escapeHtml(spec.trap.explanation) + '</p>');
    parts.push('</section>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher script: timed segments in order, with the total lesson
  // time summed from the segment minutes. Cue, questions, and watchFor
  // render only when present on a segment.
  function renderScript(spec, options) {
    assertValidScript(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-script', 'Teacher script', normalizeOptions(options));
    var totalMinutes = spec.segments.reduce(function (sum, segment) {
      return sum + segment.minutes;
    }, 0);
    parts.push('<p class="pr-total-minutes">Total: ' + totalMinutes + ' minutes</p>');
    parts.push('<ol class="pr-segments">');
    spec.segments.forEach(function (segment) {
      parts.push('<li class="pr-segment">');
      parts.push('<p class="pr-segment-minutes">' + escapeHtml(segment.minutes) + ' minutes</p>');
      parts.push('<p class="pr-say">' + escapeHtml(segment.say) + '</p>');
      if (segment.cue) {
        parts.push('<p class="pr-cue">Cue: ' + escapeHtml(segment.cue) + '</p>');
      }
      if (segment.questions) {
        parts.push('<ul class="pr-segment-questions">');
        segment.questions.forEach(function (question) {
          parts.push('<li class="pr-segment-question">' + escapeHtml(question) + '</li>');
        });
        parts.push('</ul>');
      }
      if (segment.watchFor) {
        parts.push('<p class="pr-watch-for">Watch for: ' + escapeHtml(segment.watchFor) + '</p>');
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Lesson plan: the duration total, every objective with its
  // success criteria and assessment points, and every activity in
  // order. Optional activity fields (scriptCue, grouping, resources,
  // differentiation) render only when present on the activity.
  function renderLessonPlan(spec, options) {
    assertValidLessonPlan(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-lesson-plan', 'Lesson plan', normalizeOptions(options));
    parts.push('<p class="pr-total-minutes">Total: ' + spec.durationMinutes + ' minutes</p>');
    parts.push('<h2 class="pr-plan-heading">Objectives</h2>');
    parts.push('<ul class="pr-plan-objectives">');
    spec.objectives.forEach(function (objective) {
      parts.push('<li class="pr-plan-objective">');
      parts.push('<p class="pr-objective-id">' + escapeHtml(objective.id) + '</p>');
      parts.push('<p class="pr-objective-text">' + escapeHtml(objective.text) + '</p>');
      parts.push('<ul class="pr-success-criteria">');
      objective.successCriteria.forEach(function (criterion) {
        parts.push('<li class="pr-success-criterion">' + escapeHtml(criterion) + '</li>');
      });
      parts.push('</ul>');
      parts.push('<ul class="pr-assessment-points">');
      objective.assessmentPoints.forEach(function (point) {
        parts.push('<li class="pr-assessment-point">' + escapeHtml(point) + '</li>');
      });
      parts.push('</ul>');
      parts.push('</li>');
    });
    parts.push('</ul>');
    parts.push('<h2 class="pr-plan-heading">Activities</h2>');
    parts.push('<ol class="pr-activities">');
    spec.activities.forEach(function (activity) {
      parts.push('<li class="pr-activity">');
      parts.push('<p class="pr-activity-title">' + escapeHtml(activity.title) + '</p>');
      parts.push('<p class="pr-activity-minutes">' + escapeHtml(activity.minutes) + ' minutes</p>');
      parts.push('<p class="pr-activity-objectives">Objectives: ' +
        activity.objectiveIds.map(escapeHtml).join(', ') + '</p>');
      if (activity.scriptCue) {
        parts.push('<p class="pr-script-cue">Script cue: ' + escapeHtml(activity.scriptCue) + '</p>');
      }
      if (activity.grouping) {
        parts.push('<p class="pr-grouping">Grouping: ' + escapeHtml(activity.grouping) + '</p>');
      }
      if (activity.resources) {
        parts.push('<ul class="pr-resources">');
        activity.resources.forEach(function (resource) {
          parts.push('<li class="pr-resource">' + escapeHtml(resource) + '</li>');
        });
        parts.push('</ul>');
      }
      if (activity.differentiation) {
        if (activity.differentiation.support) {
          parts.push('<p class="pr-support">Support: ' + escapeHtml(activity.differentiation.support) + '</p>');
        }
        if (activity.differentiation.stretch) {
          parts.push('<p class="pr-stretch">Stretch: ' + escapeHtml(activity.differentiation.stretch) + '</p>');
        }
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Scaffolds set level labels (SPEC.md "Scaffolds spec"): mapped
  // through this lookup so a raw level value is never emitted.
  var SCAFFOLD_LEVEL_LABELS = { full: 'Full', partial: 'Partial', minimal: 'Minimal' };

  // Student scaffolds sheet: for each set in fading order, the level
  // label, the word bank (term plus gloss), the sentence starters,
  // the sentence frames as-is, and the cloze text as-is. This
  // function must never read cloze[].answers - see the header
  // comment - so no cloze answer can leak into a student sheet.
  function renderScaffolds(spec, options) {
    assertValidScaffolds(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-scaffolds', 'Scaffolds', normalizeOptions(options));
    spec.sets.forEach(function (set) {
      parts.push('<section class="pr-scaffold-set">');
      parts.push('<h2 class="pr-set-level">' + SCAFFOLD_LEVEL_LABELS[set.level] + '</h2>');
      parts.push('<h3 class="pr-scaffolds-heading">Word bank</h3>');
      parts.push('<dl class="pr-word-bank">');
      set.wordBank.forEach(function (entry) {
        parts.push('<dt class="pr-term">' + escapeHtml(entry.term) + '</dt>');
        parts.push('<dd class="pr-gloss">' + escapeHtml(entry.gloss) + '</dd>');
      });
      parts.push('</dl>');
      parts.push('<h3 class="pr-scaffolds-heading">Sentence starters</h3>');
      parts.push('<ul class="pr-starters">');
      set.starters.forEach(function (starter) {
        parts.push('<li class="pr-starter">' + escapeHtml(starter) + '</li>');
      });
      parts.push('</ul>');
      parts.push('<h3 class="pr-scaffolds-heading">Sentence frames</h3>');
      parts.push('<ul class="pr-frames">');
      set.frames.forEach(function (frame) {
        parts.push('<li class="pr-frame">' + escapeHtml(frame) + '</li>');
      });
      parts.push('</ul>');
      parts.push('<h3 class="pr-scaffolds-heading">Cloze</h3>');
      parts.push('<ol class="pr-cloze">');
      set.cloze.forEach(function (item) {
        parts.push('<li class="pr-cloze-item">' + escapeHtml(item.text) + '</li>');
      });
      parts.push('</ol>');
      parts.push('</section>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher scaffolds answer key: for each set in fading order, the
  // level label and every cloze item with its answers - the answers
  // the student sheet above never reads.
  function renderScaffoldsAnswerKey(spec, options) {
    assertValidScaffolds(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-scaffolds', 'Scaffolds answer key', normalizeOptions(options));
    spec.sets.forEach(function (set) {
      parts.push('<section class="pr-scaffold-set">');
      parts.push('<h2 class="pr-set-level">' + SCAFFOLD_LEVEL_LABELS[set.level] + '</h2>');
      parts.push('<ol class="pr-cloze">');
      set.cloze.forEach(function (item) {
        parts.push('<li class="pr-cloze-item">');
        parts.push('<p class="pr-cloze-text">' + escapeHtml(item.text) + '</p>');
        parts.push('<p class="pr-answer">Answer: ' +
          item.answers.map(escapeHtml).join(', ') + '</p>');
        parts.push('</li>');
      });
      parts.push('</ol>');
      parts.push('</section>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }

  // Diagnostics student sheet: Do Now then hinge questions, each
  // with its prompt and choice texts only. This function must never
  // read choices[].misconception or choices[].rationale - see the
  // header comment - so no code or rationale can leak to a student.
  function renderDiagnostics(spec, options) {
    assertValidDiagnostics(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-diagnostics', 'Diagnostics', normalizeOptions(options));
    parts.push('<h2 class="pr-diagnostics-heading">Do Now</h2>');
    parts.push('<ol class="pr-questions">');
    spec.doNow.forEach(function (q) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(q.prompt) + '</p>');
      parts.push('<ul class="pr-choices">');
      q.choices.forEach(function (choice) {
        parts.push('<li class="pr-choice">' + escapeHtml(choice.text) + '</li>');
      });
      parts.push('</ul>');
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('<h2 class="pr-diagnostics-heading">Hinge questions</h2>');
    parts.push('<ol class="pr-questions">');
    spec.hingeQuestions.forEach(function (q) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(q.prompt) + '</p>');
      parts.push('<ul class="pr-choices">');
      q.choices.forEach(function (choice) {
        parts.push('<li class="pr-choice">' + escapeHtml(choice.text) + '</li>');
      });
      parts.push('</ul>');
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher diagnostics answer key: per question the correct answer,
  // the hinge script cue where present, and for every incorrect
  // choice its misconception code and its chose / thinks / reteach
  // rationale - the teacher-only content the student sheet never reads.
  function renderDiagnosticsAnswerKey(spec, options) {
    assertValidDiagnostics(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-diagnostics', 'Diagnostics answer key', normalizeOptions(options));
    function renderKeyQuestion(q) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(q.prompt) + '</p>');
      if (q.scriptCue) {
        parts.push('<p class="pr-script-cue">Script cue: ' + escapeHtml(q.scriptCue) + '</p>');
      }
      q.choices.forEach(function (choice) {
        if (choice.correct === true) {
          parts.push('<p class="pr-answer">Answer: ' + escapeHtml(choice.text) + '</p>');
        }
      });
      q.choices.forEach(function (choice) {
        if (choice.correct !== true) {
          parts.push('<p class="pr-distractor">Distractor: ' + escapeHtml(choice.text) + '</p>');
          parts.push('<p class="pr-misconception">Misconception: ' + escapeHtml(choice.misconception) + '</p>');
          parts.push('<p class="pr-rationale-chose">Chose: ' + escapeHtml(choice.rationale.chose) + '</p>');
          parts.push('<p class="pr-rationale-thinks">Thinks: ' + escapeHtml(choice.rationale.thinks) + '</p>');
          parts.push('<p class="pr-rationale-reteach">Reteach: ' + escapeHtml(choice.rationale.reteach) + '</p>');
        }
      });
      parts.push('</li>');
    }
    parts.push('<h2 class="pr-diagnostics-heading">Do Now</h2>');
    parts.push('<ol class="pr-questions">');
    spec.doNow.forEach(renderKeyQuestion);
    parts.push('</ol>');
    parts.push('<h2 class="pr-diagnostics-heading">Hinge questions</h2>');
    parts.push('<ol class="pr-questions">');
    spec.hingeQuestions.forEach(renderKeyQuestion);
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Worked examples student sheet: the complete example in full
  // (problem, steps with their annotations, self-explanation prompt),
  // the faded example's shown steps only, and the paired problem to
  // try. This function never reads a step of the faded example whose
  // withheld flag is true, and never reads paired.solution - see the
  // header comment - so withheld content cannot leak to a student.
  function renderWorkedExamples(spec, options) {
    assertValidWorkedExamples(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-worked-examples', 'Worked examples', normalizeOptions(options));
    function renderStep(step, showAnnotation) {
      parts.push('<li class="pr-step">');
      parts.push('<p class="pr-step-text">' + escapeHtml(step.text) + '</p>');
      if (showAnnotation && typeof step.annotation === 'string') {
        parts.push('<p class="pr-step-annotation">' + escapeHtml(step.annotation) + '</p>');
      }
      parts.push('</li>');
    }
    parts.push('<h2 class="pr-worked-heading">Complete example</h2>');
    parts.push('<p class="pr-problem">' + escapeHtml(spec.complete.problem) + '</p>');
    parts.push('<ol class="pr-steps">');
    spec.complete.steps.forEach(function (step) { renderStep(step, true); });
    parts.push('</ol>');
    parts.push('<p class="pr-self-explanation">Explain it: ' + escapeHtml(spec.complete.selfExplanation) + '</p>');
    parts.push('<h2 class="pr-worked-heading">Faded example</h2>');
    parts.push('<p class="pr-problem">' + escapeHtml(spec.faded.problem) + '</p>');
    parts.push('<ol class="pr-steps">');
    spec.faded.steps.forEach(function (step) {
      if (step.withheld === true) {
        parts.push('<li class="pr-step pr-withheld">');
        parts.push('<p class="pr-withheld-note">Step withheld - try it yourself, then check the answer key.</p>');
        parts.push('</li>');
      } else {
        renderStep(step, true);
      }
    });
    parts.push('</ol>');
    parts.push('<p class="pr-self-explanation">Explain it: ' + escapeHtml(spec.faded.selfExplanation) + '</p>');
    parts.push('<h2 class="pr-worked-heading">Now try this</h2>');
    parts.push('<p class="pr-problem">' + escapeHtml(spec.paired.problem) + '</p>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher worked-examples answer key: the full faded example with
  // every step (the withheld steps marked), plus the paired problem's
  // worked solution - the teacher-only content the student sheet
  // never reads.
  function renderWorkedExamplesAnswerKey(spec, options) {
    assertValidWorkedExamples(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-worked-examples', 'Worked examples answer key', normalizeOptions(options));
    parts.push('<h2 class="pr-worked-heading">Faded example in full</h2>');
    parts.push('<p class="pr-problem">' + escapeHtml(spec.faded.problem) + '</p>');
    parts.push('<ol class="pr-steps">');
    spec.faded.steps.forEach(function (step) {
      parts.push('<li class="pr-step">');
      parts.push('<p class="pr-step-text">' + escapeHtml(step.text) + '</p>');
      if (typeof step.annotation === 'string') {
        parts.push('<p class="pr-step-annotation">' + escapeHtml(step.annotation) + '</p>');
      }
      if (step.withheld === true) {
        parts.push('<p class="pr-withheld-marker">Withheld on the student sheet.</p>');
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('<h2 class="pr-worked-heading">Paired problem solution</h2>');
    parts.push('<p class="pr-problem">' + escapeHtml(spec.paired.problem) + '</p>');
    parts.push('<p class="pr-solution">Solution: ' + escapeHtml(spec.paired.solution) + '</p>');
    parts.push('</section>');
    return parts.join('\n');
  }


  // Quiz bank student sheet: each retrieval item's prompt, plus its
  // choices when the item carries them, or answer lines when it does
  // not. This function never reads an item's answer or
  // misconceptionCode - see the header comment - so the teacher key
  // cannot leak to a student.
  function renderQuizBank(spec, options) {
    assertValidQuizBank(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-quiz-bank', 'Quiz bank', normalizeOptions(options));
    parts.push('<ol class="pr-questions">');
    spec.items.forEach(function (item) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(item.prompt) + '</p>');
      if (item.choices !== undefined) {
        parts.push('<ul class="pr-choices">');
        item.choices.forEach(function (choice) {
          parts.push('<li class="pr-choice">' + escapeHtml(choice) + '</li>');
        });
        parts.push('</ul>');
      } else {
        parts.push('<div class="pr-answer-lines">' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span></div>');
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher quiz bank answer key: per item the teacher-key answer,
  // plus the misconception code and outcome code where the item
  // carries them - the teacher-only content the student sheet never
  // reads.
  function renderQuizBankAnswerKey(spec, options) {
    assertValidQuizBank(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-quiz-bank', 'Quiz bank answer key', normalizeOptions(options));
    parts.push('<ol class="pr-questions">');
    spec.items.forEach(function (item) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(item.prompt) + '</p>');
      parts.push('<p class="pr-answer">Answer: ' + escapeHtml(item.answer) + '</p>');
      if (item.misconceptionCode !== undefined) {
        parts.push('<p class="pr-misconception">Misconception: ' + escapeHtml(item.misconceptionCode) + '</p>');
      }
      if (item.outcomeCode !== undefined) {
        parts.push('<p class="pr-outcome">Outcome: ' + escapeHtml(item.outcomeCode) + '</p>');
      }
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Summative header: sheetHeader reads spec.topic, which a unit-level
  // summative does not carry - it carries unitTitle and a topics array
  // instead - so the summative renderers build their own header on the
  // same classes, adding the exam-format line (duration, total marks).
  function summativeHeader(spec, kindClass, kindLabel, opts) {
    var parts = [];
    parts.push('<section class="' + kindClass + variantClasses(opts) + '">');
    parts.push('<h1 class="pr-title">' + escapeHtml(spec.title) + '</h1>');
    parts.push('<p class="pr-meta">' + escapeHtml(spec.subject) + ' · ' +
      escapeHtml(spec.unitTitle) + ' · ' + escapeHtml(spec.level) + '</p>');
    parts.push('<p class="pr-kind">' + kindLabel + '</p>');
    parts.push('<p class="pr-exam-meta">Time allowed: ' + spec.durationMinutes +
      ' minutes · Total marks: ' + spec.totalMarks + '</p>');
    return parts;
  }

  // Summative student paper: the unit header, the exam-format line and
  // each item's prompt, command word and marks, with answer lines.
  // This function never reads an item's markScheme or the rubric, so
  // teacher-only content cannot leak onto the paper a student sits.
  function renderSummative(spec, options) {
    assertValidSummative(spec);
    var parts = summativeHeader(spec, 'pr-sheet pr-student pr-summative', 'Summative assessment', normalizeOptions(options));
    parts.push('<ol class="pr-questions">');
    spec.items.forEach(function (item) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(item.prompt) + '</p>');
      parts.push('<p class="pr-command">' + escapeHtml(item.commandWord) + ' · ' + item.marks + ' marks</p>');
      parts.push('<div class="pr-answer-lines">' +
        '<span class="pr-answer-line"></span>' +
        '<span class="pr-answer-line"></span>' +
        '<span class="pr-answer-line"></span></div>');
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher summative answer key: per item the mark scheme credit
  // points, then the rubric criteria with every level descriptor -
  // the teacher-only content the student paper never reads.
  function renderSummativeAnswerKey(spec, options) {
    assertValidSummative(spec);
    var parts = summativeHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-summative', 'Summative assessment answer key', normalizeOptions(options));
    parts.push('<ol class="pr-questions">');
    spec.items.forEach(function (item) {
      parts.push('<li class="pr-question">');
      parts.push('<p class="pr-prompt">' + escapeHtml(item.prompt) + '</p>');
      parts.push('<ul class="pr-mark-scheme">');
      item.markScheme.points.forEach(function (point) {
        parts.push('<li class="pr-point">' + escapeHtml(point.text) + ' (' + point.marks + ' marks)</li>');
      });
      parts.push('</ul>');
      parts.push('</li>');
    });
    parts.push('</ol>');
    parts.push('<h2 class="pr-rubric-title">Rubric</h2>');
    spec.rubric.criteria.forEach(function (criterion) {
      parts.push('<h3 class="pr-criterion">' + escapeHtml(criterion.name) + '</h3>');
      parts.push('<ul class="pr-levels">');
      criterion.levels.forEach(function (level) {
        parts.push('<li class="pr-level"><span class="pr-level-label">' + escapeHtml(level.label) +
          '</span>: ' + escapeHtml(level.descriptor) + '</li>');
      });
      parts.push('</ul>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }


  // Revision study sheet: every flashcard's front and every spaced
  // practice set's prompts, with answer lines. This function never
  // reads a flashcard's back or a practice item's answer - see the
  // header comment - so the self-check content cannot leak to the
  // study sheet a student works from.
  function renderRevision(spec, options) {
    assertValidRevision(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-revision', 'Revision', normalizeOptions(options));
    parts.push('<ol class="pr-flashcards">');
    spec.flashcards.forEach(function (card) {
      parts.push('<li class="pr-flashcard">');
      parts.push('<p class="pr-front">' + escapeHtml(card.front) + '</p>');
      parts.push('</li>');
    });
    parts.push('</ol>');
    spec.practiceSets.forEach(function (set) {
      parts.push('<h2 class="pr-set-heading">Practice set: day ' + set.dayOffset + '</h2>');
      parts.push('<ol class="pr-questions">');
      set.items.forEach(function (item) {
        parts.push('<li class="pr-question">');
        parts.push('<p class="pr-prompt">' + escapeHtml(item.prompt) + '</p>');
        parts.push('<div class="pr-answer-lines">' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span></div>');
        parts.push('</li>');
      });
      parts.push('</ol>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher / self-check revision answer key: every flashcard's front
  // and back, and every practice item's prompt and answer - the backs
  // and answers the study sheet never reads.
  function renderRevisionAnswerKey(spec, options) {
    assertValidRevision(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-revision', 'Revision answer key', normalizeOptions(options));
    parts.push('<ol class="pr-flashcards">');
    spec.flashcards.forEach(function (card) {
      parts.push('<li class="pr-flashcard">');
      parts.push('<p class="pr-front">' + escapeHtml(card.front) + '</p>');
      parts.push('<p class="pr-back">Back: ' + escapeHtml(card.back) + '</p>');
      parts.push('</li>');
    });
    parts.push('</ol>');
    spec.practiceSets.forEach(function (set) {
      parts.push('<h2 class="pr-set-heading">Practice set: day ' + set.dayOffset + '</h2>');
      parts.push('<ol class="pr-questions">');
      set.items.forEach(function (item) {
        parts.push('<li class="pr-question">');
        parts.push('<p class="pr-prompt">' + escapeHtml(item.prompt) + '</p>');
        parts.push('<p class="pr-answer">Answer: ' + escapeHtml(item.answer) + '</p>');
        parts.push('</li>');
      });
      parts.push('</ol>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }

  // Organisers student sheet: every template's kind heading and
  // every slot's label and studentPrompt, with answer lines for the
  // student to complete. This function never reads a slot's entries -
  // see the header comment - so the derived content cannot leak to
  // the sheet a student works from.
  function renderOrganisers(spec, options) {
    assertValidOrganisers(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-organisers', 'Graphic organisers', normalizeOptions(options));
    spec.templates.forEach(function (template) {
      parts.push('<h2 class="pr-template-heading">' + escapeHtml(template.kind) + '</h2>');
      parts.push('<ol class="pr-slots">');
      template.slots.forEach(function (slot) {
        parts.push('<li class="pr-slot">');
        parts.push('<p class="pr-slot-label">' + escapeHtml(slot.label) + '</p>');
        if (typeof slot.studentPrompt === 'string') {
          parts.push('<p class="pr-student-prompt">' + escapeHtml(slot.studentPrompt) + '</p>');
        }
        parts.push('<div class="pr-answer-lines">' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span>' +
          '<span class="pr-answer-line"></span></div>');
        parts.push('</li>');
      });
      parts.push('</ol>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }

  // Teacher / self-check organisers key: every template and slot
  // with its entries - the derived content the student sheet never
  // reads.
  function renderOrganisersKey(spec, options) {
    assertValidOrganisers(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-organisers', 'Graphic organisers key', normalizeOptions(options));
    spec.templates.forEach(function (template) {
      parts.push('<h2 class="pr-template-heading">' + escapeHtml(template.kind) + '</h2>');
      parts.push('<ol class="pr-slots">');
      template.slots.forEach(function (slot) {
        parts.push('<li class="pr-slot">');
        parts.push('<p class="pr-slot-label">' + escapeHtml(slot.label) + '</p>');
        parts.push('<ul class="pr-entries">');
        slot.entries.forEach(function (entry) {
          parts.push('<li class="pr-entry">' + escapeHtml(entry) + '</li>');
        });
        parts.push('</ul>');
        parts.push('</li>');
      });
      parts.push('</ol>');
    });
    parts.push('</section>');
    return parts.join('\n');
  }

  var api = {
    renderWorksheet: renderWorksheet,
    renderWorksheetAnswerKey: renderWorksheetAnswerKey,
    renderExitTicket: renderExitTicket,
    renderExitTicketAnswerKey: renderExitTicketAnswerKey,
    renderNotes: renderNotes,
    renderScript: renderScript,
    renderLessonPlan: renderLessonPlan,
    renderScaffolds: renderScaffolds,
    renderScaffoldsAnswerKey: renderScaffoldsAnswerKey,
    renderDiagnostics: renderDiagnostics,
    renderDiagnosticsAnswerKey: renderDiagnosticsAnswerKey,
    renderWorkedExamples: renderWorkedExamples,
    renderWorkedExamplesAnswerKey: renderWorkedExamplesAnswerKey,
    renderQuizBank: renderQuizBank,
    renderQuizBankAnswerKey: renderQuizBankAnswerKey,
    renderSummative: renderSummative,
    renderSummativeAnswerKey: renderSummativeAnswerKey,
    renderRevision: renderRevision,
    renderRevisionAnswerKey: renderRevisionAnswerKey,
    renderOrganisers: renderOrganisers,
    renderOrganisersKey: renderOrganisersKey,
    escapeHtml: escapeHtml
  };
  global.AnimathPrintable = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
