/* animath glossary prompt builder - turns a teaching topic into
 * LLM prompts for a glossary material (Phase D2, issue #1283).
 * Companion to generator/build_organisers_prompt.js (organisers):
 * same UMD wrapper, same level labels and tone wording, same fill()
 * helper, same transition normalization, the same misconception
 * bank lookup reused through build_prompt.js's exported
 * misconceptionFor, and the same notes-content options precedent
 * (issue #1279). A glossary material is the standalone finished
 * reference pack for one topic: every entry's term and meaning are
 * a paired notes definition verbatim, and its example is grounded
 * in the paired notes content (the worked example, a mechanism
 * step, or an objective). Zero dependencies, ASCII only. Works in
 * browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathGlossaryPrompt = api;
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

  // The misconception lookup is reused from build_prompt.js: in Node
  // we require it; in the browser the page loads build_prompt.js
  // before this file so globalThis.AnimathPrompt is set. Missing
  // either way degrades to a null lookup (the generic misconception
  // line) instead of failing.
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
    'No misconception bank entry was supplied for this topic: ground ' +
    'every example in the paired student notes content, taken verbatim ' +
    'from the notes worked example, mechanism steps and objectives.';

  // Hand-authored fractions glossary exemplar (issue #1283):
  // drawn verbatim from the fractions student notes - every entry's
  // term and meaning are a notes definition verbatim and every
  // example is drawn verbatim from the fractions notes (its worked
  // example, one of its mechanismSteps, or one of its objectives) -
  // so it passes validateGlossary. Kept as a JS object literal and
  // compacted with JSON.stringify so the module works unchanged in
  // browser and Node.
  var FRACTIONS_GLOSSARY_EXEMPLAR_OBJ = {
    title: 'Adding fractions: 1/2 + 1/4', level: 'primary', subject: 'math', topic: 'fractions',
    entries: [
      {
        term: 'Fraction',
        meaning: 'A part of a whole, written as one number over another: the top number counts the pieces taken and the bottom number names the piece size.',
        example: 'Work out 1/2 + 1/4. The pieces are different sizes, so first convert the half into quarters: a quarter fits inside a half exactly twice, so 1/2 = 2/4. Now every piece is a quarter, so add the tops and keep the bottom: 2/4 + 1/4 = 3/4. The answer is 3/4 - never 2/6, because the bottom number names the piece size and the pieces stayed quarters throughout.'
      },
      {
        term: 'Numerator',
        meaning: 'The top number of a fraction. It counts how many pieces you have.',
        example: 'Count the quarters: add the tops and keep the bottom, 2/4 + 1/4 = 3/4 - the bottom number stays 4 because the piece size never changed.'
      },
      {
        term: 'Denominator',
        meaning: 'The bottom number of a fraction. It names the piece size - how many equal pieces the whole was cut into - so quarters have denominator 4.',
        example: 'Explain why the denominator is never added: it names the piece size'
      },
      {
        term: 'Equivalent fraction',
        meaning: 'A fraction that names the same amount with different numbers, made by re-cutting the pieces: 1/2 and 2/4 are equivalent fractions.',
        example: 'Make the pieces the same size: split the half into 2 quarters, so 1/2 = 2/4 and every piece in the sum is now a quarter.'
      },
      {
        term: 'Common denominator',
        meaning: 'A shared piece size that lets two fractions be added: quarters are the common denominator for 1/2 and 1/4, because 1/2 = 2/4.',
        example: 'Add fractions with different denominators by converting to a common denominator, starting with halves and quarters'
      }
    ]
  };
  var FRACTIONS_GLOSSARY_EXEMPLAR = JSON.stringify(FRACTIONS_GLOSSARY_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var GLOSSARY_SYSTEM_TEMPLATE = [
    'You are animath\'s glossary author. You write glossary',
    'materials for Singapore lessons as JSON documents',
    'following the animath glossary spec (SPEC.md "Glossary',
    'spec"). A glossary material is the standalone finished',
    'reference pack for one topic: its key terms, each with its',
    'meaning and a grounded example.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the glossary JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, entries.',
    '3. Derive, never invent: every entry\'s term and meaning are a paired student notes definition verbatim, and every example is grounded in the paired notes content - drawn verbatim from the notes worked example, one of its mechanism steps, or one of its objectives.',
    '4. The material holds at least 3 entries, each carrying a term, a meaning and an example, all non-empty strings.',
    '5. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'GLOSSARY DESIGN:',
    '- A reference, not a lesson: the student looks a term up and gets its exact meaning plus one concrete example.',
    '- Cover the topic\'s key vocabulary: every term the student must define to follow the topic belongs here.',
    '',
    'QUALITY GATES - what separates a hand-authored glossary from a sloppy one:',
    '- Every meaning is exact: a student could copy it into their notes unchanged.',
    '- Every example shows the term at work in this topic, never a generic illustration.',
    '',
    'WORKED EXAMPLE - hand-authored fractions glossary (entries',
    'whose terms and meanings are the fractions notes definitions',
    'verbatim, each example drawn verbatim from the fractions',
    'notes). Match this quality bar:',
    FRACTIONS_GLOSSARY_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION SPAN - the topic has been unpacked into an ordered',
    'list of state transitions (see the user message for the full data):',
    '1. Ground the examples in these transitions, in order: an',
    '   example may be a transition\'s mechanism step verbatim.',
    '2. Watch the transition carrying the topic misconception beat:',
    '   its terms are the ones students most often misuse.'
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  // Transition normalization mirrors build_revision_prompt.js exactly:
  // 2-8 items, non-empty name/from_state/to_state/driver (trimmed), an
  // optional misconception beat rides through; absent/empty -> null,
  // malformed -> descriptive throw.
  var MIN_GLOSSARY_TRANSITIONS = 2;
  var MAX_GLOSSARY_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateGlossaryTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildGlossaryPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildGlossaryPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildGlossaryPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_GLOSSARY_TRANSITIONS ||
        transitions.length > MAX_GLOSSARY_TRANSITIONS) {
      throw new Error('buildGlossaryPrompts: opts.transitions must hold ' +
        MIN_GLOSSARY_TRANSITIONS + '-' + MAX_GLOSSARY_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateGlossaryTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - ground the glossary examples in these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (its terms are the ones students most often misuse):');
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


  // Notes-content options (issue #1283, on the build_scaffold_prompt.js
  // precedent): opts.definitions is an array of {term, meaning} and
  // opts.mechanismSteps an array of non-empty strings, both drawn from
  // the paired student notes. Absent or empty means none supplied;
  // malformed throws a descriptive buildGlossaryPrompts error.
  function normalizeDefinitions(definitions) {
    if (definitions === undefined || definitions === null) return null;
    if (!Array.isArray(definitions)) {
      throw new Error('buildGlossaryPrompts: opts.definitions must be an array of ' +
        '{term, meaning}, got ' + typeof definitions);
    }
    if (definitions.length === 0) return null;
    var out = [];
    for (var i = 0; i < definitions.length; i++) {
      var d = definitions[i];
      if (!d || typeof d !== 'object' || Array.isArray(d)) {
        throw new Error('buildGlossaryPrompts: opts.definitions[' + i + '] must be ' +
          'an object with non-empty term and meaning');
      }
      if (typeof d.term !== 'string' || !d.term.trim()) {
        throw new Error('buildGlossaryPrompts: opts.definitions[' + i + '].term must be a non-empty string');
      }
      if (typeof d.meaning !== 'string' || !d.meaning.trim()) {
        throw new Error('buildGlossaryPrompts: opts.definitions[' + i + '].meaning must be a non-empty string');
      }
      out.push({ term: d.term.trim(), meaning: d.meaning.trim() });
    }
    return out;
  }

  function normalizeMechanismSteps(steps) {
    if (steps === undefined || steps === null) return null;
    if (!Array.isArray(steps)) {
      throw new Error('buildGlossaryPrompts: opts.mechanismSteps must be an array of ' +
        'non-empty strings, got ' + typeof steps);
    }
    if (steps.length === 0) return null;
    var out = [];
    for (var i = 0; i < steps.length; i++) {
      if (typeof steps[i] !== 'string' || !steps[i].trim()) {
        throw new Error('buildGlossaryPrompts: opts.mechanismSteps[' + i + '] must be a non-empty string');
      }
      out.push(steps[i].trim());
    }
    return out;
  }

  function normalizeObjectives(objectives) {
    if (objectives === undefined || objectives === null) return null;
    if (!Array.isArray(objectives)) {
      throw new Error('buildGlossaryPrompts: opts.objectives must be an array of ' +
        'non-empty strings, got ' + typeof objectives);
    }
    if (objectives.length === 0) return null;
    var out = [];
    for (var i = 0; i < objectives.length; i++) {
      if (typeof objectives[i] !== 'string' || !objectives[i].trim()) {
        throw new Error('buildGlossaryPrompts: opts.objectives[' + i + '] must be a non-empty string');
      }
      out.push(objectives[i].trim());
    }
    return out;
  }

  function notesUserBlock(definitions, mechanismSteps, workedExampleText, objectives) {
    var lines = [
      '',
      '',
      'Paired student notes - derive the glossary entries from these:'
    ];
    if (definitions) {
      lines.push('Definitions (every entry term and meaning comes verbatim from this list):');
      for (var i = 0; i < definitions.length; i++) {
        lines.push('- ' + definitions[i].term + ': ' + definitions[i].meaning);
      }
    }
    if (mechanismSteps) {
      lines.push('Mechanism steps (an example may be one of these steps verbatim, in order):');
      for (var j = 0; j < mechanismSteps.length; j++) {
        lines.push((j + 1) + '. ' + mechanismSteps[j]);
      }
    }
    if (workedExampleText) {
      lines.push('Worked example (an example may be this worked example verbatim):');
      lines.push(workedExampleText);
    }
    if (objectives) {
      lines.push('Objectives (an example may be one of these objectives verbatim):');
      for (var k = 0; k < objectives.length; k++) {
        lines.push('- ' + objectives[k]);
      }
    }
    return lines.join('\n');
  }

  // opts: {level, subject, topic, topicLabel, focus, facet, bank,
  // transitions, definitions, mechanismSteps, workedExample,
  // objectives}
  function buildGlossaryPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildGlossaryPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var definitions = normalizeDefinitions(opts.definitions);
    var mechanismSteps = normalizeMechanismSteps(opts.mechanismSteps);
    var objectives = normalizeObjectives(opts.objectives);
    var bank = opts.bank || bankBeat(opts.topic, opts.facet);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildGlossaryPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(GLOSSARY_SYSTEM_TEMPLATE, {
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
      'Write the glossary JSON now. At least 3 entries whose terms ' +
        'and meanings are the student notes definitions verbatim and ' +
        'whose examples are grounded in the student notes content.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    if (definitions || mechanismSteps || workedExample || objectives) {
      user += notesUserBlock(definitions, mechanismSteps, workedExample, objectives);
    }
    user += bankUserBlock(bank);
    return { system: system, user: user };
  }

  return {
    buildGlossaryPrompts: buildGlossaryPrompts,
    GLOSSARY_SYSTEM_TEMPLATE: GLOSSARY_SYSTEM_TEMPLATE,
    FRACTIONS_GLOSSARY_EXEMPLAR: FRACTIONS_GLOSSARY_EXEMPLAR
  };
});
