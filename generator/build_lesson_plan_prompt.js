/* animath lesson plan prompt builder - turns a teaching topic into LLM
 * prompts for a lesson plan (Phase A2, issue #1215).
 * Companion to generator/build_script_prompt.js (teacher scripts): same
 * UMD wrapper, same level labels and tone wording, same fill() helper,
 * and the same transition normalization. A lesson plan is the plan a
 * teacher script delivers from: objectives with success criteria and
 * assessment points, and a timed activity sequence whose minutes sum
 * exactly to the plan duration. Zero dependencies, ASCII only. Works
 * in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathLessonPlanPrompt = api;
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

  var WATER_CYCLE_LESSON_PLAN_EXEMPLAR_OBJ = {
    title: 'The Water Cycle', level: 'primary', subject: 'science', topic: 'water-cycle',
    durationMinutes: 30,
    objectives: [
      {
        id: 'o1', text: 'Explain evaporation and condensation in the water cycle',
        successCriteria: [
          'I can say where puddle water goes when it dries up',
          'I can name the process that turns vapour back into drops'
        ],
        assessmentPoints: [
          'Opening answers to where the puddle water went',
          'Partner recap of the four stages in order'
        ]
      },
      {
        id: 'o2', text: 'Trace precipitation and collection as the same water returning',
        successCriteria: [
          'I can explain why drops fall as rain',
          'I can say where rain water gathers'
        ],
        assessmentPoints: ['Answers to what makes the drops fall']
      }
    ],
    activities: [
      {
        title: 'Surface prior ideas', minutes: 5, objectiveIds: ['o1'],
        scriptCue: 's1', grouping: 'whole class', resources: ['board']
      },
      {
        title: 'Teach evaporation and condensation', minutes: 10, objectiveIds: ['o1'],
        scriptCue: 'animation scene s2', grouping: 'pairs',
        differentiation: {
          support: 'Sentence starters for the vapour step.',
          stretch: 'Ask pairs to predict where condensation happens fastest and why.'
        }
      },
      {
        title: 'Teach precipitation and collection', minutes: 10, objectiveIds: ['o2'],
        scriptCue: 'student notes handout'
      },
      {
        title: 'Recap the loop', minutes: 5, objectiveIds: ['o1', 'o2']
      }
    ]
  };
  var WATER_CYCLE_LESSON_PLAN_EXEMPLAR = JSON.stringify(WATER_CYCLE_LESSON_PLAN_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var LESSON_PLAN_SYSTEM_TEMPLATE = [
    'You are animath\'s lesson plan author. You write lesson plans',
    'for Singapore lessons as JSON documents following the animath',
    'lesson plan spec (SPEC.md "Lesson plan spec"). A lesson plan is',
    'the plan a teacher script delivers from: objectives, success',
    'criteria, assessment points, and a timed activity sequence.',
    '',
    'HARD RULES - violate any of these and the plan is rejected:',
    '1. Return ONLY the lesson plan JSON. No markdown fences, no commentary.',
    '2. Plan fields, exactly: title, level, subject, topic, durationMinutes, objectives, activities.',
    '3. Each objective carries id (a short unique id like o1), text, successCriteria (non-empty I-can statements) and assessmentPoints (non-empty: where in the lesson the teacher checks this objective).',
    '4. Each activity carries title, minutes (a positive number) and objectiveIds (the ids of the objectives it delivers), plus optional scriptCue, grouping, resources and differentiation (support / stretch).',
    '5. The activity minutes sum EXACTLY to durationMinutes: plan a real lesson length first, then make the activities add up to it.',
    '6. The scriptCue names the teacher-script segment cue the activity is delivered by (for example a scene id or a material) - omit scriptCue only when no script segment delivers the activity.',
    '7. Every objective is delivered by at least one activity, and every activity objectiveId is a declared objective id.',
    '8. Write for a {{LEVEL_LABEL}} class. Tone: {{TONE}}.',
    '   Objectives and success criteria are worded for the level.',
    '',
    'LESSON PLAN DESIGN:',
    '- Open by surfacing what students already think, then teach the mechanism in order, then recap and check.',
    '- Success criteria are observable: a student either can or cannot yet do them.',
    '- Assessment points sit inside the activities that deliver the objective, not bolted on at the end.',
    '- Differentiation is concrete: support names the scaffold, stretch names the harder question.',
    '',
    'QUALITY GATES - what separates a hand-authored plan from a sloppy one:',
    '- Every activity earns its minutes and names the objectives it delivers.',
    '- Timings are honest: an activity that asks questions needs minutes for students to answer.',
    '- The minutes sum exactly to durationMinutes and the activities run in teaching order.',
    '',
    'WORKED EXAMPLE - hand-authored water-cycle lesson plan, trimmed',
    '(objectives with success criteria and assessment points, activities',
    'whose minutes sum exactly to the 30-minute duration, scriptCues',
    'naming the delivering script segments). Match this quality bar:',
    WATER_CYCLE_LESSON_PLAN_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION ACTIVITIES - the topic has been unpacked into an',
    'ordered list of state transitions (see the user message for the',
    'full data). Cover the transitions in the given order:',
    '1. The activities cover transitions in order: each transition is',
    '   taught in its own activity or in the activity order that',
    '   follows the transition order - never teach a later transition',
    '   first.',
    '2. The driver must be part of the objective or activity wording',
    '   (e.g. the sun\'s heat, cooling, gravity), not only background.'
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  var MIN_PLAN_TRANSITIONS = 2;
  var MAX_PLAN_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validatePlanTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildLessonPlanPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildLessonPlanPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildLessonPlanPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_PLAN_TRANSITIONS ||
        transitions.length > MAX_PLAN_TRANSITIONS) {
      throw new Error('buildLessonPlanPrompts: opts.transitions must hold ' +
        MIN_PLAN_TRANSITIONS + '-' + MAX_PLAN_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validatePlanTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - cover these transitions in the activities, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (key an assessment point to it):');
        lines.push('     Wrong turn: ' + m.wrongTurn);
        lines.push('     Why students slip: ' + m.why);
        lines.push('     Show the correct turn: ' + m.correctTurn);
      }
    }
    return lines.join('\n');
  }

  function buildLessonPlanPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildLessonPlanPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildLessonPlanPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(LESSON_PLAN_SYSTEM_TEMPLATE, {
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
      'Write the lesson plan JSON now. Objectives with success criteria ' +
        'and assessment points, and activities whose minutes sum exactly ' +
        'to durationMinutes.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildLessonPlanPrompts: buildLessonPlanPrompts,
    LESSON_PLAN_SYSTEM_TEMPLATE: LESSON_PLAN_SYSTEM_TEMPLATE,
    WATER_CYCLE_LESSON_PLAN_EXEMPLAR: WATER_CYCLE_LESSON_PLAN_EXEMPLAR
  };
});
