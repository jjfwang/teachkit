/* animath revision prompt builder - turns a teaching topic into LLM
 * prompts for a revision material (Phase D1, issue #1268).
 * Companion to generator/build_quiz_bank_prompt.js (quiz bank): same
 * UMD wrapper, same level labels and tone wording, same fill()
 * helper, same transition normalization, and the same misconception
 * bank lookup reused through build_prompt.js's exported
 * misconceptionFor. A revision material is a per-topic study set:
 * flashcards plus spaced-practice sets, every card and item derived
 * verbatim from the topic's paired quiz bank and student notes.
 * Zero dependencies, ASCII only. Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathRevisionPrompt = api;
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
    'No misconception bank entry was supplied for this topic: build the ' +
    'trap card on the one classic wrong turn for the topic, taken ' +
    'verbatim from the student notes trap.';

  var FRACTIONS_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

  // Hand-authored fractions revision exemplar (issue #1268): topic
  // fractions-addition, derived verbatim from the fractions quiz bank
  // and the fractions notes - definition cards carry a notes term and
  // its meaning, the trap card carries the notes trap misconception
  // and its explanation, quiz-bank cards and practice items carry a
  // quiz bank prompt and its answer - so it passes validateRevision.
  // Kept as a JS object literal and compacted with JSON.stringify so
  // the module works unchanged in browser and Node.
  var FRACTIONS_REVISION_EXEMPLAR_OBJ = {
    title: 'Adding Fractions Revision', level: 'primary', subject: 'math', topic: 'fractions-addition',
    flashcards: [
      {
        front: 'Fraction',
        back: 'A part of a whole, written as one number over another: the top number counts the pieces taken and the bottom number names the piece size.',
        source: 'definition'
      },
      {
        front: 'Denominator',
        back: 'The bottom number of a fraction. It names the piece size - how many equal pieces the whole was cut into - so quarters have denominator 4.',
        source: 'definition'
      },
      {
        front: FRACTIONS_WRONG_TURN,
        back: 'The bottom number names the piece size, so it cannot be added like the tops. The bottom number stays 4 because the piece size never changed: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
        source: 'trap'
      },
      {
        front: 'What is 1/2 + 1/4?',
        back: '3/4',
        source: 'quiz-bank'
      },
      {
        front: 'What is 2/5 + 1/5?',
        back: '3/5',
        source: 'quiz-bank'
      }
    ],
    practiceSets: [
      {
        dayOffset: 1,
        items: [
          { prompt: 'What is 1/3 + 1/3?', answer: '2/3' },
          { prompt: 'A recipe uses 1/2 cup of flour, then 1/4 cup more. How much flour is used in total?', answer: '3/4 cup' }
        ]
      },
      {
        dayOffset: 3,
        items: [
          { prompt: 'What is 3/8 + 2/8?', answer: '5/8' },
          { prompt: 'Explain in one line why the denominator stays the same when you add 1/4 + 2/4.', answer: 'The denominator names the piece size (quarters); adding pieces does not change their size, so 1/4 + 2/4 = 3/4.' }
        ]
      }
    ]
  };
  var FRACTIONS_REVISION_EXEMPLAR = JSON.stringify(FRACTIONS_REVISION_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var REVISION_SYSTEM_TEMPLATE = [
    'You are animath\'s revision author. You write revision',
    'materials for Singapore lessons as JSON documents following the',
    'animath revision spec (SPEC.md "Revision spec"). A revision',
    'material is a per-topic study set: flashcards for recall plus',
    'spaced-practice sets scheduled by study offset.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the revision JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, flashcards, practiceSets.',
    '3. Derive, never invent: every flashcard and practice item comes verbatim from the topic quiz bank and the student notes definitions and trap. A definition card front and back are a notes term and its meaning; the trap card front and back are the notes trap misconception and its explanation; a quiz-bank card front and back are a quiz bank item prompt and its answer.',
    '4. The set holds at least 4 flashcards, each carrying front, back and source, where source is one of quiz-bank, definition, trap.',
    '5. The set holds at least 2 practice sets. Every set carries a dayOffset, a positive integer strictly increasing across the sets, and a non-empty items array of {prompt, answer} taken verbatim from quiz bank items. Offsets only: no dates, no student state.',
    '6. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'REVISION DESIGN:',
    '- Recall, not new teaching: every card and item is answerable from memory of the topic as taught.',
    '- Space the practice: the first set revisits the core ideas soon after the lesson, later sets reach the hardest items at wider offsets.',
    '',
    'QUALITY GATES - what separates a hand-authored set from a sloppy one:',
    '- Every back and answer is exact enough to self-mark from: no vague keys a student would have to interpret.',
    '- No card or item repeats another in different words.',
    '',
    'WORKED EXAMPLE - hand-authored fractions revision set (5',
    'flashcards derived from the fractions notes and quiz bank, 2',
    'practice sets at offsets 1 and 3). Match this quality bar:',
    FRACTIONS_REVISION_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION SPAN - the topic has been unpacked into an ordered',
    'list of state transitions (see the user message for the full data):',
    '1. Span the transitions in order: the earliest practice items',
    '   revisit the first transition, and later sets reach the later',
    '   transitions, so the practice grows with the topic.',
    '2. Build the trap card and the coded practice items on the',
    '   transition carrying the topic misconception beat.'
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  // Transition normalization mirrors build_diagnostics_prompt.js exactly:
  // 2-8 items, non-empty name/from_state/to_state/driver (trimmed), an
  // optional misconception beat rides through; absent/empty -> null,
  // malformed -> descriptive throw.
  var MIN_REVISION_TRANSITIONS = 2;
  var MAX_REVISION_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateRevisionTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildRevisionPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildRevisionPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildRevisionPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_REVISION_TRANSITIONS ||
        transitions.length > MAX_REVISION_TRANSITIONS) {
      throw new Error('buildRevisionPrompts: opts.transitions must hold ' +
        MIN_REVISION_TRANSITIONS + '-' + MAX_REVISION_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateRevisionTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - span the practice items across these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (build its trap card and practice items on it):');
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
  function buildRevisionPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildRevisionPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var bank = opts.bank || bankBeat(opts.topic, opts.facet);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildRevisionPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(REVISION_SYSTEM_TEMPLATE, {
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
      'Write the revision JSON now. At least 4 flashcards derived ' +
        'verbatim from the topic quiz bank and notes, and at least 2 ' +
        'practice sets at strictly increasing day offsets.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    user += bankUserBlock(bank);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildRevisionPrompts: buildRevisionPrompts,
    REVISION_SYSTEM_TEMPLATE: REVISION_SYSTEM_TEMPLATE,
    FRACTIONS_REVISION_EXEMPLAR: FRACTIONS_REVISION_EXEMPLAR
  };
});
