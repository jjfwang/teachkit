/* animath diagnostics prompt builder - turns a teaching topic into LLM
 * prompts for a diagnostics material (Phase C1, issue #1241).
 * Companion to generator/build_exit_ticket_prompt.js (exit tickets):
 * same UMD wrapper, same level labels and tone wording, same fill()
 * helper, same transition normalization, and the same misconception
 * bank lookup reused through build_prompt.js's exported
 * misconceptionFor. A diagnostics material is a prior-knowledge Do Now
 * plus hinge questions whose every wrong answer is coded to the topic
 * bank misconception with a teacher-only rationale. Zero
 * dependencies, ASCII only. Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathDiagnosticsPrompt = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var LEVEL_LABELS = {
    primary: 'Primary school (PSLE)',
    secondary: 'Secondary school (O/N-level)',
    jc: 'Junior college (H2)'
  };

  var LEVEL_TONE = {
    primary: 'warm, concrete, everyday examples (cakes, MRT trips)',
    secondary: 'direct, precise, exam-aware',
    jc: 'rigorous, defines terms, shows derivations'
  };

  // The misconception lookup is reused from build_prompt.js: in Node we
  // require it; in the browser the page loads build_prompt.js before this
  // file so globalThis.AnimathPrompt is set. Missing either way degrades
  // to a null lookup (the generic misconception line) instead of failing.
  var BUILD_PROMPT = (function () {
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
      try { return require('./build_prompt.js'); } catch (e) { return null; }
    } /* node:coverage ignore next */
    return (typeof window !== 'undefined' ? window : globalThis).AnimathPrompt || null;
  })();

  function bankBeat(topicSlug, facetHint) {
    if (!BUILD_PROMPT || typeof BUILD_PROMPT.misconceptionFor !== 'function') return null;
    var entry = BUILD_PROMPT.misconceptionFor(topicSlug, facetHint);
    if (!entry) return null;
    if (!entry.wrongTurn || !entry.why || !entry.correctTurn) return null;
    return { wrongTurn: entry.wrongTurn, why: entry.why, correctTurn: entry.correctTurn };
  }

  var GENERIC_MISCONCEPTION_LINE =
    'No misconception bank entry was supplied for this topic: code every ' +
    'incorrect choice to the one classic wrong turn for the topic, named ' +
    'in the choice misconception field, with a rationale for each.';

  var FRACTIONS_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

  // Hand-authored fractions diagnostics exemplar (issue #1241): topic
  // fractions-addition, built on the fractions bank entry - every
  // distractor carries that entry's wrongTurn verbatim as its
  // misconception code, and every rationale is worded so none of its
  // parts appears in the question prompt or choice texts, so it passes
  // validateDiagnostics. Kept as a JS object literal and compacted with
  // JSON.stringify so the module works unchanged in browser and Node.
  var FRACTIONS_DIAGNOSTICS_EXEMPLAR_OBJ = {
    title: 'Adding Fractions Diagnostics', level: 'primary', subject: 'math', topic: 'fractions-addition',
    doNow: [
      {
        id: 'dn1', prompt: 'What is 1/2 + 1/4?', kind: 'multiple-choice',
        choices: [
          { text: '3/4', correct: true },
          {
            text: '2/6', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the sum that adds both rows of the fraction.',
              thinks: 'They believe the top and bottom numbers can be added straight across.',
              reteach: 'Shade one half and one quarter of the same bar to show the piece size stays in quarters.'
            }
          },
          {
            text: '2/4', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked a total built only from the top numbers over one bottom.',
              thinks: 'They think only the numerators move when fractions are combined.',
              reteach: 'Convert one half into two quarters on a number line, then count the quarters together.'
            }
          }
        ]
      },
      {
        id: 'dn2', prompt: 'A cake is cut into 4 equal slices. You eat 1 slice, then 1 more slice. How much of the cake have you eaten?', kind: 'multiple-choice',
        choices: [
          { text: '2/4', correct: true },
          {
            text: '2/8', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the answer that doubles both parts of the fraction.',
              thinks: 'They treat the denominator as another count that grows when slices are added.',
              reteach: 'Lay the two eaten slices back into the four-slice cake outline to show the whole still has four parts.'
            }
          },
          {
            text: '1/4', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the size of just one of the slices eaten.',
              thinks: 'They think the second slice does not change the total eaten.',
              reteach: 'Count the eaten slices one at a time against the whole cake: one quarter, then two quarters.'
            }
          }
        ]
      },
      {
        id: 'dn3', prompt: 'What is 1/3 + 1/3?', kind: 'multiple-choice',
        choices: [
          { text: '2/3', correct: true },
          {
            text: '2/6', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the answer that adds the bottom numbers as well as the top ones.',
              thinks: 'They see the denominator as a second number to total up.',
              reteach: 'Draw one bar split in thirds and shade two parts to show the thirds stay thirds.'
            }
          },
          {
            text: '1/6', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked a single sixth as the combined amount.',
              thinks: 'They think joining two parts makes each part smaller.',
              reteach: 'Place two third-sized pieces side by side and compare with one sixth-sized piece.'
            }
          }
        ]
      }
    ],
    hingeQuestions: [
      {
        id: 'h1', prompt: 'We need 1/2 + 2/4. Which first step is right?', kind: 'multiple-choice',
        scriptCue: 'Hinge point after the common-denominator demonstration',
        choices: [
          { text: 'Rewrite 1/2 as 2/4, then add the tops', correct: true },
          {
            text: 'Add the tops and the bottoms to get 3/6', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the step that adds every number in sight.',
              thinks: 'They believe both rows of a fraction are added in the same way.',
              reteach: 'Pause and rename one half as two quarters on the board, stressing the piece size is unchanged.'
            }
          },
          {
            text: 'Multiply the bottoms to get a new bottom of 8', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the step that makes a brand-new bottom number.',
              thinks: 'They think a common bottom comes from multiplying the two bottoms here.',
              reteach: 'Show that one half already equals two quarters, so no new bottom is needed for this pair.'
            }
          }
        ]
      },
      {
        id: 'h2', prompt: 'A student writes 1/2 + 1/4 = 2/6. What should the class do next?', kind: 'multiple-choice',
        scriptCue: 'Hinge point before the exit practice questions',
        choices: [
          { text: 'Show 1/2 as 2/4 with a bar model, then add to get 3/4', correct: true },
          {
            text: 'Accept 2/6 and move on to harder sums', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked moving on without fixing the method.',
              thinks: 'They think a finished answer matters more than a sound method.',
              reteach: 'Return to the bar model and compare the wrong total with the shaded three quarters.'
            }
          },
          {
            text: 'Tell the class to always add the bottoms too', misconception: FRACTIONS_WRONG_TURN,
            rationale: {
              chose: 'The learner picked the rule that adds bottom numbers as a class rule.',
              thinks: 'They believe the wrong turn is the official method for adding fractions.',
              reteach: 'Contrast one bar split in halves with the same bar split in quarters to expose the clash.'
            }
          }
        ]
      }
    ]
  };
  var FRACTIONS_DIAGNOSTICS_EXEMPLAR = JSON.stringify(FRACTIONS_DIAGNOSTICS_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var DIAGNOSTICS_SYSTEM_TEMPLATE = [
    'You are animath\'s diagnostics author. You write diagnostics',
    'materials for Singapore lessons as JSON documents following the',
    'animath diagnostics spec (SPEC.md "Diagnostics spec"). A',
    'diagnostics material pairs a short prior-knowledge Do Now with',
    'hinge questions asked mid-lesson: every wrong answer is coded to',
    'a named misconception so the teacher can see what the answer',
    'means and how to reteach it.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the diagnostics JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, doNow, hingeQuestions.',
    '3. Counts: doNow holds 2-4 questions; hingeQuestions holds 1-3 questions.',
    '4. Every question is multiple-choice with at least 2 choices and exactly one choice marked correct: true. Question ids are unique across BOTH arrays.',
    '5. Every incorrect choice carries a misconception field: the topic misconception bank entry\'s wrongTurn given in the user message, verbatim (for a faceted entry, the primary facet\'s wrongTurn). Never invent a misconception code.',
    '6. Every incorrect choice carries a rationale object with exactly the three fields chose, thinks and reteach: what the student chose, what they are most likely thinking, and how to reteach the point. The correct choice carries NEITHER misconception NOR rationale.',
    '7. The misconception and rationale are teacher-only: never copy rationale wording into the question prompt or any choice text.',
    '8. Every hinge question carries a scriptCue: the cue of the teacher-script segment where the teacher pivots on the answer. Do Now questions never carry a scriptCue.',
    '9. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'DIAGNOSTICS DESIGN:',
    '- The Do Now checks prior knowledge the lesson builds on: quick questions a student can answer in a minute each.',
    '- Hinge questions sit at the pivot points of the lesson: the answers decide whether the teacher reteaches or moves on.',
    '- Each distractor is a deliberate wrong turn, not a random wrong answer: picking it tells the teacher exactly which misconception to address.',
    '',
    'QUALITY GATES - what separates hand-authored diagnostics from a sloppy set:',
    '- Every distractor is coded: no uncoded wrong answers anywhere.',
    '- Rationales name the thinking, not just the error: chose, thinks and reteach are three different statements.',
    '- Hinge scriptCues name a real pivot moment in the lesson, not a generic check.',
    '',
    'WORKED EXAMPLE - hand-authored fractions diagnostics (3 Do Now',
    'questions, 2 hinge questions, every distractor coded to the',
    'fractions bank wrongTurn with a teacher-only rationale). Match',
    'this quality bar:',
    FRACTIONS_DIAGNOSTICS_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION HINGES - the topic has been unpacked into an ordered',
    'list of state transitions (see the user message for the full data):',
    '1. Key the hinge questions to the transitions in order: the first',
    '   hinge question pivots on the first transition, the second on',
    '   the second, and so on.',
    '2. Each hinge question\'s scriptCue names the pivot for its',
    '   transition: the moment the teacher checks that transition',
    '   landed before teaching the next one.'
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  // Transition normalization mirrors build_scaffold_prompt.js exactly:
  // 2-8 items, non-empty name/from_state/to_state/driver (trimmed), an
  // optional misconception beat rides through; absent/empty -> null,
  // malformed -> descriptive throw.
  var MIN_DIAGNOSTICS_TRANSITIONS = 2;
  var MAX_DIAGNOSTICS_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateDiagnosticsTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildDiagnosticsPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildDiagnosticsPrompts: opts.transitions[' + index + '].' +
          field + ' must be a non-empty string');
      }
      out[field] = value.trim();
    }
    if (t.misconception && typeof t.misconception === 'object' && !Array.isArray(t.misconception)) {
      out.misconception = {
        wrongTurn: t.misconception.wrongTurn,
        why: t.misconception.why,
        correctTurn: t.misconception.correctTurn
      };
    }
    return out;
  }

  function normalizeTransitions(transitions) {
    if (transitions === undefined || transitions === null) return null;
    if (!Array.isArray(transitions)) {
      throw new Error('buildDiagnosticsPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_DIAGNOSTICS_TRANSITIONS ||
        transitions.length > MAX_DIAGNOSTICS_TRANSITIONS) {
      throw new Error('buildDiagnosticsPrompts: opts.transitions must hold ' +
        MIN_DIAGNOSTICS_TRANSITIONS + '-' + MAX_DIAGNOSTICS_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateDiagnosticsTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - key the hinge scriptCues to these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (code the hinge distractors to it):');
        lines.push('     Wrong turn: ' + m.wrongTurn);
        lines.push('     Why students slip: ' + m.why);
        lines.push('     Show the correct turn: ' + m.correctTurn);
      }
    }
    return lines.join('\n');
  }

  function bankUserBlock(bank) {
    var lines = [
      '',
      '',
      'Topic misconception bank entry:'
    ];
    if (!bank) {
      lines.push(GENERIC_MISCONCEPTION_LINE);
      return lines.join('\n');
    }
    lines.push('Wrong turn: ' + bank.wrongTurn);
    lines.push('Why students slip: ' + bank.why);
    lines.push('Correct turn: ' + bank.correctTurn);
    return lines.join('\n');
  }

  // opts: {level, subject, topic, topicLabel, focus, facet, bank,
  // transitions, workedExample}
  function buildDiagnosticsPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildDiagnosticsPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var bank = opts.bank || bankBeat(opts.topic, opts.facet);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildDiagnosticsPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(DIAGNOSTICS_SYSTEM_TEMPLATE, {
      LEVEL_LABEL: LEVEL_LABELS[level] || level,
      TONE: LEVEL_TONE[level] || LEVEL_TONE.secondary
    });
    if (transitions) system += TRANSITION_SYSTEM_BLOCK;
    var user = [
      'Level: ' + level + ' (' + (LEVEL_LABELS[level] || level) + ')',
      'Subject: ' + opts.subject,
      'Topic: ' + (opts.topicLabel || opts.topic || '') + ' (' + (opts.topic || '') + ')',
      'Student\'s focus: ' + (opts.focus || '(none given)'),
      '',
      'Write the diagnostics JSON now. A Do Now of 2-4 questions and ' +
        '1-3 hinge questions, every distractor coded to the bank ' +
        'misconception with a teacher-only rationale.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    user += bankUserBlock(bank);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildDiagnosticsPrompts: buildDiagnosticsPrompts,
    DIAGNOSTICS_SYSTEM_TEMPLATE: DIAGNOSTICS_SYSTEM_TEMPLATE,
    FRACTIONS_DIAGNOSTICS_EXEMPLAR: FRACTIONS_DIAGNOSTICS_EXEMPLAR
  };
});
