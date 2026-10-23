/* animath organisers prompt builder - turns a teaching topic into
 * LLM prompts for a graphic organisers material (Phase D2, issue
 * #1277). Companion to generator/build_revision_prompt.js (revision):
 * same UMD wrapper, same level labels and tone wording, same fill()
 * helper, same transition normalization, and the same misconception
 * bank lookup reused through build_prompt.js's exported
 * misconceptionFor. An organisers material is a per-topic set of
 * structured templates a student completes: slot entries are derived
 * verbatim - a flow template's entries are the unpack stages in
 * order, other templates draw from the paired notes mechanismSteps
 * and definitions. Zero dependencies, ASCII only. Works in browser
 * and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathOrganisersPrompt = api;
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
    'No misconception bank entry was supplied for this topic: build ' +
    'the watch-out slot on the one classic wrong turn for the topic, ' +
    'taken verbatim from the student notes.';

  // Hand-authored fractions organisers exemplar (issue #1277):
  // derived verbatim from the fractions student notes - the flow
  // template's slot entries are the notes mechanismSteps in order and
  // the frayer template's slots carry a notes definition term as the
  // label and its meaning as the entry - so it passes
  // validateOrganisers. Kept as a JS object literal and compacted
  // with JSON.stringify so the module works unchanged in browser and
  // Node.
  var FRACTIONS_ORGANISERS_EXEMPLAR_OBJ = {
    title: 'Adding fractions: 1/2 + 1/4', level: 'primary', subject: 'math', topic: 'fractions',
    templates: [
      {
        kind: 'flow',
        slots: [
          {
            label: 'Pose the sum',
            entries: ['Adding fractions: pose the sum 1/2 + 1/4 - the pieces are different sizes, halves and quarters, so they cannot be counted together yet.'],
            studentPrompt: 'Write the sum you are solving and say why the pieces cannot be counted together yet.'
          },
          {
            label: 'Make the pieces the same size',
            entries: ['Make the pieces the same size: split the half into 2 quarters, so 1/2 = 2/4 and every piece in the sum is now a quarter.'],
            studentPrompt: 'Show the conversion you used to make every piece the same size.'
          },
          {
            label: 'Count the pieces',
            entries: ['Count the quarters: add the tops and keep the bottom, 2/4 + 1/4 = 3/4 - the bottom number stays 4 because the piece size never changed.'],
            studentPrompt: 'Write the finished sum with its answer.'
          },
          {
            label: 'Watch out',
            entries: ['Watch out: reject 2/6 - adding the tops and the bottoms pretends the pieces became sixths, but no sixth was ever cut.'],
            studentPrompt: 'Explain in your own words why 2/6 is wrong.'
          }
        ]
      },
      {
        kind: 'frayer',
        slots: [
          {
            label: 'Fraction',
            entries: ['A part of a whole, written as one number over another: the top number counts the pieces taken and the bottom number names the piece size.'],
            studentPrompt: 'Draw a picture that shows a fraction.'
          },
          {
            label: 'Numerator',
            entries: ['The top number of a fraction. It counts how many pieces you have.'],
            studentPrompt: 'Circle the numerator in 3/4.'
          },
          {
            label: 'Denominator',
            entries: ['The bottom number of a fraction. It names the piece size - how many equal pieces the whole was cut into - so quarters have denominator 4.'],
            studentPrompt: 'Write what the denominator of 3/4 tells you.'
          },
          {
            label: 'Equivalent fraction',
            entries: ['A fraction that names the same amount with different numbers, made by re-cutting the pieces: 1/2 and 2/4 are equivalent fractions.'],
            studentPrompt: 'Write a fraction equivalent to 1/2.'
          },
          {
            label: 'Common denominator',
            entries: ['A shared piece size that lets two fractions be added: quarters are the common denominator for 1/2 and 1/4, because 1/2 = 2/4.'],
            studentPrompt: 'Name a common denominator for 1/3 and 1/6.'
          }
        ]
      }
    ]
  };
  var FRACTIONS_ORGANISERS_EXEMPLAR = JSON.stringify(FRACTIONS_ORGANISERS_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var ORGANISERS_SYSTEM_TEMPLATE = [
    'You are animath\'s organisers author. You write graphic',
    'organisers materials for Singapore lessons as JSON documents',
    'following the animath organisers spec (SPEC.md "Organisers',
    'spec"). An organisers material is a per-topic set of structured',
    'templates a student completes while studying the topic.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the organisers JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, templates.',
    '3. Derive, never invent: every slot entry comes verbatim from the topic as taught. A flow template\'s slot entries are the topic unpack stages in order; every other template\'s slot entries are drawn verbatim from the student notes mechanism steps and definitions.',
    '4. The material holds at least 2 templates, each carrying a kind - one of kwl, frayer, venn, flow, concept-map - and a non-empty slots array.',
    '5. Every slot carries a label (a non-empty string), an entries array (a non-empty array of non-empty strings, derived verbatim as above) and optionally a studentPrompt: a non-empty string naming what the student completes in that slot.',
    '6. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'ORGANISERS DESIGN:',
    '- Pre-organise, do not re-teach: the templates lay the topic out so the student sees its structure at a glance.',
    '- Each template suits its kind: a flow lays the stages out in order, a frayer digs into the key terms, a kwl tracks what the student knows, wants to know and has learned.',
    '',
    'QUALITY GATES - what separates a hand-authored set from a sloppy one:',
    '- Every entry is exact: a student could copy it into their notes unchanged.',
    '- No slot repeats another slot\'s entries in different words.',
    '',
    'WORKED EXAMPLE - hand-authored fractions organisers set (a flow',
    'template whose entries are the fractions mechanism steps in',
    'order, a frayer template over the fractions definitions).',
    'Match this quality bar:',
    FRACTIONS_ORGANISERS_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION SPAN - the topic has been unpacked into an ordered',
    'list of state transitions (see the user message for the full data):',
    '1. Build the flow template on these transitions, in order: its',
    '   slot entries are the transitions in sequence, earliest first.',
    '2. Build the watch-out slot on the transition carrying the',
    '   topic misconception beat.'
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
  var MIN_ORGANISERS_TRANSITIONS = 2;
  var MAX_ORGANISERS_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateOrganisersTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildOrganisersPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildOrganisersPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildOrganisersPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_ORGANISERS_TRANSITIONS ||
        transitions.length > MAX_ORGANISERS_TRANSITIONS) {
      throw new Error('buildOrganisersPrompts: opts.transitions must hold ' +
        MIN_ORGANISERS_TRANSITIONS + '-' + MAX_ORGANISERS_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateOrganisersTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - build the flow template on these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (build its watch-out slot on it):');
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
  function buildOrganisersPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildOrganisersPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var bank = opts.bank || bankBeat(opts.topic, opts.facet);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildOrganisersPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(ORGANISERS_SYSTEM_TEMPLATE, {
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
      'Write the organisers JSON now. At least 2 templates whose ' +
        'slot entries are derived verbatim from the topic unpack ' +
        'stages and the student notes mechanism steps and definitions.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    user += bankUserBlock(bank);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildOrganisersPrompts: buildOrganisersPrompts,
    ORGANISERS_SYSTEM_TEMPLATE: ORGANISERS_SYSTEM_TEMPLATE,
    FRACTIONS_ORGANISERS_EXEMPLAR: FRACTIONS_ORGANISERS_EXEMPLAR
  };
});
