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

  // HTML-escape for text content and double-quoted attribute values,
  // the export-frames.js esc chain: & first, then <, >, ".
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function sheetHeader(spec, kindClass, kindLabel) {
    var parts = [];
    parts.push('<section class="' + kindClass + '">');
    parts.push('<h1 class="pr-title">' + escapeHtml(spec.title) + '</h1>');
    parts.push('<p class="pr-meta">' + escapeHtml(spec.subject) + ' · ' +
      escapeHtml(spec.topic) + ' · ' + escapeHtml(spec.level) + '</p>');
    parts.push('<p class="pr-kind">' + kindLabel + '</p>');
    if (typeof spec.instructions === 'string' && spec.instructions.length > 0) {
      parts.push('<p class="pr-instructions">' + escapeHtml(spec.instructions) + '</p>');
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
  function renderStudentSheet(spec, kindClass, kindLabel, showTier) {
    var parts = sheetHeader(spec, kindClass, kindLabel);
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
  function renderAnswerKey(spec, kindClass, kindLabel, showTier) {
    var parts = sheetHeader(spec, kindClass, kindLabel);
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

  function renderWorksheet(spec) {
    assertValidWorksheet(spec);
    return renderStudentSheet(spec, 'pr-sheet pr-student pr-worksheet', 'Worksheet', true);
  }

  function renderWorksheetAnswerKey(spec) {
    assertValidWorksheet(spec);
    return renderAnswerKey(spec, 'pr-sheet pr-teacher pr-answer-key pr-worksheet', 'Worksheet answer key', true);
  }

  function renderExitTicket(spec) {
    assertValidExitTicket(spec);
    return renderStudentSheet(spec, 'pr-sheet pr-student pr-exit-ticket', 'Exit ticket', false);
  }

  function renderExitTicketAnswerKey(spec) {
    assertValidExitTicket(spec);
    return renderAnswerKey(spec, 'pr-sheet pr-teacher pr-answer-key pr-exit-ticket', 'Exit ticket answer key', false);
  }

  // Student notes: objectives, definitions, mechanism steps, a worked
  // example, and the trap (misconception plus why it is wrong).
  function renderNotes(spec) {
    assertValidNotes(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-notes', 'Student notes');
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
  function renderScript(spec) {
    assertValidScript(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-script', 'Teacher script');
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
  function renderLessonPlan(spec) {
    assertValidLessonPlan(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-lesson-plan', 'Lesson plan');
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
  function renderScaffolds(spec) {
    assertValidScaffolds(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-student pr-scaffolds', 'Scaffolds');
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
  function renderScaffoldsAnswerKey(spec) {
    assertValidScaffolds(spec);
    var parts = sheetHeader(spec, 'pr-sheet pr-teacher pr-answer-key pr-scaffolds', 'Scaffolds answer key');
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
    escapeHtml: escapeHtml
  };
  global.AnimathPrintable = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
