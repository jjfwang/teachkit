/* animath quiz bank prompt builder - turns a teaching topic into LLM
 * prompts for a quiz bank material (Phase C3, issue #1255).
 * Companion to generator/build_diagnostics_prompt.js (diagnostics):
 * same UMD wrapper, same level labels and tone wording, same fill()
 * helper, same transition normalization, and the same misconception
 * bank lookup reused through build_prompt.js's exported
 * misconceptionFor. A quiz bank is a per-topic cumulative set of
 * retrieval items, reusable across sessions; its coded items are
 * built on the topic bank misconception. Zero dependencies, ASCII
 * only. Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathQuizBankPrompt = api;
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
    'coded items on the one classic wrong turn for the topic, named ' +
    'verbatim in each coded item misconceptionCode field.';

  var FRACTIONS_WRONG_TURN = 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.';

  // Hand-authored fractions quiz bank exemplar (issue #1255): topic
  // fractions-addition, built on the fractions bank entry - the coded
  // items carry that entry's wrongTurn verbatim as their
  // misconceptionCode, so it passes validateQuizBank. Kept as a JS
  // object literal and compacted with JSON.stringify so the module
  // works unchanged in browser and Node.
  var FRACTIONS_QUIZ_BANK_EXEMPLAR_OBJ = {
    title: 'Adding Fractions Quiz Bank', level: 'primary', subject: 'math', topic: 'fractions-addition',
    items: [
      {
        prompt: 'What is 1/2 + 1/4?',
        answer: '3/4',
        choices: ['3/4', '2/6', '2/4'],
        misconceptionCode: FRACTIONS_WRONG_TURN
      },
      {
        prompt: 'What is 1/3 + 1/3?',
        answer: '2/3',
        choices: ['2/3', '2/6', '1/3'],
        misconceptionCode: FRACTIONS_WRONG_TURN
      },
      {
        prompt: 'Explain why the denominator stays the same when you add 1/4 + 2/4.',
        answer: 'The denominator names the piece size (quarters), and adding pieces does not change their size, so the pieces stay quarters: 1/4 + 2/4 = 3/4.'
      },
      {
        prompt: 'A recipe uses 1/2 cup of flour, then 1/4 cup more. How much flour is used in total?',
        answer: '3/4 cup',
        choices: ['3/4 cup', '2/6 cup', '1/2 cup'],
        misconceptionCode: FRACTIONS_WRONG_TURN
      },
      {
        prompt: 'What is 2/5 + 1/5?',
        answer: '3/5'
      }
    ]
  };
  var FRACTIONS_QUIZ_BANK_EXEMPLAR = JSON.stringify(FRACTIONS_QUIZ_BANK_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var QUIZ_BANK_SYSTEM_TEMPLATE = [
    'You are animath\'s quiz bank author. You write quiz banks for',
    'Singapore lessons as JSON documents following the animath quiz',
    'bank spec (SPEC.md "Quiz bank spec"). A quiz bank is a per-topic',
    'cumulative set of short retrieval items a teacher draws on',
    'across sessions to check that earlier learning still sticks.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the quiz bank JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, items.',
    '3. The bank holds at least 4 items. Every item carries a prompt and an answer: the answer is the teacher key the response is marked against, never shown to the student with the prompt.',
    '4. An item may carry choices (at least 2 strings) the student picks from; the answer is then the correct choice, word for word.',
    '5. An item built to catch the topic misconception carries a misconceptionCode: the topic misconception bank entry\'s wrongTurn given in the user message, verbatim (for a faceted entry, the primary facet\'s wrongTurn). Never invent a misconception code.',
    '6. An item may carry an outcomeCode: the syllabus outcome code the item retrieves against, recorded as a fact only.',
    '7. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'QUIZ BANK DESIGN:',
    '- Retrieval, not new teaching: every item is answerable in about a minute from memory of the topic as taught.',
    '- The bank spans the topic cumulatively: early items revisit the first ideas, later items reach the hardest, so the same bank serves week after week.',
    '- Mix formats: some items offer choices, others ask for a short answer or a one-line explanation.',
    '',
    'QUALITY GATES - what separates a hand-authored bank from a sloppy set:',
    '- Every answer is exact enough to mark from: no vague keys a teacher would have to interpret.',
    '- Coded items really catch the wrong turn: a student following it lands on a listed wrong choice or a recognisably wrong short answer.',
    '- No two items ask the same question in different words.',
    '',
    'WORKED EXAMPLE - hand-authored fractions quiz bank (5 retrieval',
    'items, the choice items coded to the fractions bank wrongTurn).',
    'Match this quality bar:',
    FRACTIONS_QUIZ_BANK_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION SPAN - the topic has been unpacked into an ordered',
    'list of state transitions (see the user message for the full data):',
    '1. Span the transitions in order: the earliest items retrieve the',
    '   first transition, and later items reach the later transitions,',
    '   so the bank grows with the topic.',
    '2. Code the items that target a transition carrying the topic',
    '   misconception beat to that beat.'
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
  var MIN_QUIZ_BANK_TRANSITIONS = 2;
  var MAX_QUIZ_BANK_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateQuizBankTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildQuizBankPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildQuizBankPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildQuizBankPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_QUIZ_BANK_TRANSITIONS ||
        transitions.length > MAX_QUIZ_BANK_TRANSITIONS) {
      throw new Error('buildQuizBankPrompts: opts.transitions must hold ' +
        MIN_QUIZ_BANK_TRANSITIONS + '-' + MAX_QUIZ_BANK_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateQuizBankTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - span the items across these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (code its items to it):');
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
  function buildQuizBankPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildQuizBankPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var bank = opts.bank || bankBeat(opts.topic, opts.facet);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildQuizBankPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(QUIZ_BANK_SYSTEM_TEMPLATE, {
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
      'Write the quiz bank JSON now. At least 4 retrieval items ' +
        'spanning the topic, the misconception-catching items coded ' +
        'to the bank misconception.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    user += bankUserBlock(bank);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildQuizBankPrompts: buildQuizBankPrompts,
    QUIZ_BANK_SYSTEM_TEMPLATE: QUIZ_BANK_SYSTEM_TEMPLATE,
    FRACTIONS_QUIZ_BANK_EXEMPLAR: FRACTIONS_QUIZ_BANK_EXEMPLAR
  };
});
