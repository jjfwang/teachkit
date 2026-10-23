/* animath worked-examples prompt builder - turns a teaching topic into
 * LLM prompts for a worked-example set material (Phase C2, issue
 * #1248). Companion to generator/build_diagnostics_prompt.js: same UMD
 * wrapper, same level labels and tone wording, same fill() helper and
 * the same transition normalization. A worked-example set teaches one
 * topic by example in fading order: a complete annotated example, a
 * faded example whose later steps are withheld, and a paired problem.
 * Zero dependencies, ASCII only. Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathWorkedExamplesPrompt = api;
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

  // Hand-authored fractions worked-example set exemplar (issue #1248):
  // topic fractions-addition. The complete example annotates every
  // step; the faded example shows its first step and withholds the
  // rest as a suffix; the paired problem carries its teacher-key
  // solution. It passes validateWorkedExamples. Kept as a JS object
  // literal and compacted with JSON.stringify so the module works
  // unchanged in browser and Node.
  var FRACTIONS_WORKED_EXAMPLES_EXEMPLAR_OBJ = {
    title: 'Adding Fractions Worked Examples', level: 'primary', subject: 'math', topic: 'fractions-addition',
    complete: {
      problem: 'What is 1/2 + 1/4?',
      steps: [
        { text: 'Rename 1/2 as 2/4 so both fractions are written in quarters.', annotation: 'The denominator names the piece size, and renaming a fraction does not change its amount.' },
        { text: 'Add the numerators: 2/4 + 1/4 = 3/4.', annotation: 'Only the count of pieces changes; the pieces stay quarter-sized.' }
      ],
      selfExplanation: 'Explain in your own words why the denominator stays the same when fractions are added.'
    },
    faded: {
      problem: 'What is 2/3 + 1/6?',
      steps: [
        { text: 'Rename 2/3 as 4/6 so both fractions are written in sixths.', annotation: 'Multiply the top and bottom by 2 to rename the fraction without changing its amount.', withheld: false },
        { text: 'Add the numerators: 4/6 + 1/6 = 5/6.', withheld: true }
      ],
      selfExplanation: 'Explain what you did to finish the faded step, and why it works.'
    },
    paired: {
      problem: 'What is 3/4 + 1/8?',
      solution: 'Rename 3/4 as 6/8, then add the numerators: 6/8 + 1/8 = 7/8.'
    }
  };
  var FRACTIONS_WORKED_EXAMPLES_EXEMPLAR = JSON.stringify(FRACTIONS_WORKED_EXAMPLES_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var WORKED_EXAMPLES_SYSTEM_TEMPLATE = [
    'You are animath\'s worked-examples author. You write worked-example',
    'sets for Singapore lessons as JSON documents following the animath',
    'worked-example set spec (SPEC.md "Worked-example set spec"). A set',
    'teaches one topic by example in fading order: first a complete',
    'annotated example, then the same kind of problem with its later',
    'steps withheld for the student to complete, then a paired problem',
    'the student attempts alone.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the worked-example set JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, complete, faded, paired.',
    '3. Complete: problem, steps (at least 2) and selfExplanation. Every complete step carries text AND annotation, both non-empty: the annotation says why the step works, not just what it does.',
    '4. Faded: problem, steps (at least 2) and selfExplanation. Every faded step carries a boolean withheld field; the annotation is optional. At least one step is shown, at least one is withheld, and the withheld steps are a suffix - once a step is withheld, every later step is withheld too.',
    '5. A withheld step still carries its full text: it is the teacher-key answer the student is meant to produce, never a blank or a placeholder.',
    '6. Paired: problem and solution. The solution works the paired problem in full and is teacher-key only.',
    '7. The selfExplanation on the complete and faded examples asks the student to explain the method in their own words - a real prompt, not a yes/no question.',
    '8. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'WORKED-EXAMPLE DESIGN:',
    '- One method, three passes: the complete, faded and paired problems exercise the same method at the same difficulty, so support fades and nothing else changes.',
    '- Annotations carry the reasoning: each one names why the step is legal or needed, in words a student can reuse.',
    '- The faded example withholds the steps the lesson most wants the student to practise, not the setup.',
    '',
    'QUALITY GATES - what separates a hand-authored set from a sloppy one:',
    '- The faded problem is solvable from its shown steps plus the complete example - no new idea appears only in a withheld step.',
    '- The paired solution is complete enough to mark from: every step of the method appears.',
    '- Self-explanation prompts target the method, not the arithmetic.',
    '',
    'WORKED EXAMPLE - hand-authored fractions worked-example set (a',
    'complete annotated example, a faded example withholding its final',
    'step, and a paired problem with its solution). Match this quality',
    'bar:',
    FRACTIONS_WORKED_EXAMPLES_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION STEPS - the topic has been unpacked into an ordered',
    'list of state transitions (see the user message for the full data):',
    '1. Build the steps of the complete and faded examples on the',
    '   transitions in order: each transition becomes a step, so the',
    '   worked examples walk the topic state by state.',
    '2. Withhold the faded steps from the transition the lesson most',
    '   wants practised onwards, keeping the earlier transitions shown.'
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  // Transition normalization mirrors build_diagnostics_prompt.js
  // exactly: 2-8 items, non-empty name/from_state/to_state/driver
  // (trimmed), an optional misconception beat rides through;
  // absent/empty -> null, malformed -> descriptive throw.
  var MIN_WORKED_EXAMPLES_TRANSITIONS = 2;
  var MAX_WORKED_EXAMPLES_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateWorkedExamplesTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildWorkedExamplesPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildWorkedExamplesPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildWorkedExamplesPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_WORKED_EXAMPLES_TRANSITIONS ||
        transitions.length > MAX_WORKED_EXAMPLES_TRANSITIONS) {
      throw new Error('buildWorkedExamplesPrompts: opts.transitions must hold ' +
        MIN_WORKED_EXAMPLES_TRANSITIONS + '-' + MAX_WORKED_EXAMPLES_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateWorkedExamplesTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - build the example steps on these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (annotate against it):');
        lines.push('     Wrong turn: ' + m.wrongTurn);
        lines.push('     Why students slip: ' + m.why);
        lines.push('     Show the correct turn: ' + m.correctTurn);
      }
    }
    return lines.join('\n');
  }

  // opts: {level, subject, topic, topicLabel, focus, transitions,
  // workedExample}
  function buildWorkedExamplesPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildWorkedExamplesPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildWorkedExamplesPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(WORKED_EXAMPLES_SYSTEM_TEMPLATE, {
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
      'Write the worked-example set JSON now. A complete annotated ' +
        'example, a faded example withholding its later steps as a ' +
        'suffix, and a paired problem with its teacher-key solution.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildWorkedExamplesPrompts: buildWorkedExamplesPrompts,
    WORKED_EXAMPLES_SYSTEM_TEMPLATE: WORKED_EXAMPLES_SYSTEM_TEMPLATE,
    FRACTIONS_WORKED_EXAMPLES_EXEMPLAR: FRACTIONS_WORKED_EXAMPLES_EXEMPLAR
  };
});
