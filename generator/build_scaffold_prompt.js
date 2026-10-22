/* animath scaffolds prompt builder - turns a teaching topic into LLM
 * prompts for a scaffolds material (Phase B2, issue #1231).
 * Companion to generator/build_lesson_plan_prompt.js (lesson plans):
 * same UMD wrapper, same level labels and tone wording, same fill()
 * helper, and the same transition normalization. A scaffolds material
 * is the fading language support paired with the student notes: a
 * word bank drawn from the notes definitions, sentence starters and
 * frames, and a cloze built from the notes mechanism steps, arranged
 * in sets whose support fades full -> partial -> minimal. Zero
 * dependencies, ASCII only. Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathScaffoldPrompt = api;
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

  var WATER_CYCLE_SCAFFOLD_EXEMPLAR_OBJ = {
    title: 'The Water Cycle', level: 'primary', subject: 'science', topic: 'water-cycle',
    sets: [
      {
        level: 'full',
        wordBank: [
          { term: 'evaporation', gloss: 'water turning into vapour when it is heated' },
          { term: 'condensation', gloss: 'vapour cooling and turning back into liquid drops' },
          { term: 'precipitation', gloss: 'water falling from clouds as rain' },
          { term: 'collection', gloss: 'water gathering in rivers, lakes and reservoirs' }
        ],
        starters: [
          'When the sun heats the water, it...',
          'As the vapour rises and cools, it...',
          'The rain falls and gathers in...'
        ],
        frames: [
          '___ is water turning into vapour when it is heated.',
          'When vapour cools, ___ turns it back into tiny droplets.'
        ],
        cloze: [
          { text: 'Heated water rises as vapour by ___.', answers: ['evaporation'] },
          {
            text: 'Cooling vapour turns back into drops by ___, and the water later falls as ___.',
            answers: ['condensation', 'precipitation']
          }
        ]
      },
      {
        level: 'partial',
        wordBank: [
          { term: 'evaporation', gloss: 'water turning into vapour when it is heated' },
          { term: 'condensation', gloss: 'vapour cooling and turning back into liquid drops' },
          { term: 'collection', gloss: 'water gathering in rivers, lakes and reservoirs' }
        ],
        starters: [
          'The sun heats the water and it...',
          'The drops gather in...'
        ],
        frames: [
          '___ happens when vapour cools and forms droplets.'
        ],
        cloze: [
          {
            text: 'Water vapour rises after ___ and gathers again by ___ in rivers and lakes.',
            answers: ['evaporation', 'collection']
          }
        ]
      },
      {
        level: 'minimal',
        wordBank: [
          { term: 'evaporation', gloss: 'water turning into vapour when it is heated' },
          { term: 'condensation', gloss: 'vapour cooling and turning back into liquid drops' }
        ],
        starters: [
          'In the water cycle, water...'
        ],
        frames: [
          '___ is vapour turning back into liquid.'
        ],
        cloze: [
          { text: 'The stage where vapour cools into drops is ___.', answers: ['condensation'] }
        ]
      }
    ]
  };
  var WATER_CYCLE_SCAFFOLD_EXEMPLAR = JSON.stringify(WATER_CYCLE_SCAFFOLD_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var SCAFFOLD_SYSTEM_TEMPLATE = [
    'You are animath\'s scaffolds author. You write scaffolds',
    'materials for Singapore lessons as JSON documents following the',
    'animath scaffolds spec (SPEC.md "Scaffolds spec"). A scaffolds',
    'material is the fading language support paired with the student',
    'notes: a word bank, sentence starters, sentence frames and a',
    'cloze, arranged in sets that withdraw support step by step.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the scaffolds JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, sets.',
    '3. Sets are in strictly fading order: at least 2 sets, the first set level is full, the last is minimal, and levels advance full, partial, minimal with no repeats and no rises.',
    '4. Each set carries level, wordBank, starters, frames and cloze, and none of the four collections is ever empty.',
    '5. Word-bank entries are {term, gloss}: the term comes from the paired student notes definitions and the gloss is a short learner-facing meaning. Terms are unique within a set.',
    '6. The counts of word-bank terms, starters, frames and cloze gaps never grow along the sequence: each later set has the same number or fewer of each.',
    '7. Frames are sentences carrying the gap marker ___ (three underscores). Cloze items are {text, answers}: the text carries exactly one ___ per answer, in order, and every answer is a word-bank term of the SAME set.',
    '8. Build the cloze from the paired notes mechanism steps and definitions: gap the key terms where the steps name them, never unrelated facts.',
    '9. Write for a {{LEVEL_LABEL}} class. Tone: {{TONE}}.',
    '   Starters, frames and glosses are worded for the level.',
    '',
    'SCAFFOLD DESIGN:',
    '- The full set lets a learner who cannot yet start still write: bank, starters, frames and cloze all present.',
    '- Each later set removes support the learner has practised with, until the minimal set is a light prompt, not a crutch.',
    '- Starters open the sentences the topic demands (sequence and cause first); frames carry the topic sentence shapes with the key term gapped.',
    '- Cloze answers sit in the teacher key only - never print an answer inside the cloze text.',
    '',
    'QUALITY GATES - what separates a hand-authored scaffold from a sloppy one:',
    '- Every word-bank term earns its place: it appears in a frame, a starter or a cloze gap of its set.',
    '- The fading is real: dropping a set must remove support, not reshuffle the same support.',
    '- Glosses say what the term does in this topic, not a dictionary line.',
    '',
    'WORKED EXAMPLE - hand-authored water-cycle scaffolds, trimmed',
    '(three sets fading full, partial, minimal with non-increasing',
    'counts on every measure, every cloze answer a term of its own',
    'set). Match this quality bar:',
    WATER_CYCLE_SCAFFOLD_EXEMPLAR
  ].join('\n');

  var TRANSITION_SYSTEM_BLOCK = [
    '',
    '',
    'TRANSITION ACTIVITIES - the topic has been unpacked into an',
    'ordered list of state transitions (see the user message for the',
    'full data). Cover the transitions in the given order:',
    '1. The cloze items follow the transition order: gap the key',
    '   terms where each transition names them - never gap a later',
    '   transition before an earlier one.',
    '2. The driver must be part of the starter or frame wording',
    '   (e.g. the sun\'s heat, cooling, gravity), not only background.'
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  var MIN_SCAFFOLD_TRANSITIONS = 2;
  var MAX_SCAFFOLD_TRANSITIONS = 8;
  var TRANSITION_FIELDS = ['name', 'from_state', 'to_state', 'driver'];

  function validateScaffoldTransition(t, index) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      throw new Error('buildScaffoldPrompts: opts.transitions[' + index + '] must be ' +
        'an object with non-empty name, from_state, to_state, driver');
    }
    var out = {};
    for (var i = 0; i < TRANSITION_FIELDS.length; i++) {
      var field = TRANSITION_FIELDS[i];
      var value = t[field];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('buildScaffoldPrompts: opts.transitions[' + index + '].' +
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
      throw new Error('buildScaffoldPrompts: opts.transitions must be an array of ' +
        '{name, from_state, to_state, driver}, got ' + typeof transitions);
    }
    if (transitions.length === 0) return null;
    if (transitions.length < MIN_SCAFFOLD_TRANSITIONS ||
        transitions.length > MAX_SCAFFOLD_TRANSITIONS) {
      throw new Error('buildScaffoldPrompts: opts.transitions must hold ' +
        MIN_SCAFFOLD_TRANSITIONS + '-' + MAX_SCAFFOLD_TRANSITIONS +
        ' transitions, got ' + transitions.length);
    }
    var out = [];
    for (var i = 0; i < transitions.length; i++) {
      out.push(validateScaffoldTransition(transitions[i], i));
    }
    return out;
  }

  function transitionsUserBlock(transitions) {
    var lines = [
      '',
      '',
      'Ordered state transitions - build the cloze from these transitions, in this order:'
    ];
    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      lines.push((i + 1) + '. ' + t.name + ': "' + t.from_state + '" -> "' +
        t.to_state + '" (driver: ' + t.driver + ')');
      if (t.misconception) {
        var m = t.misconception;
        lines.push('   * This transition carries the topic misconception beat (gap the term students confuse here):');
        lines.push('     Wrong turn: ' + m.wrongTurn);
        lines.push('     Why students slip: ' + m.why);
        lines.push('     Show the correct turn: ' + m.correctTurn);
      }
    }
    return lines.join('\n');
  }

  function normalizeDefinitions(definitions) {
    if (definitions === undefined || definitions === null) return null;
    if (!Array.isArray(definitions)) {
      throw new Error('buildScaffoldPrompts: opts.definitions must be an array of ' +
        '{term, meaning}, got ' + typeof definitions);
    }
    if (definitions.length === 0) return null;
    var out = [];
    for (var i = 0; i < definitions.length; i++) {
      var d = definitions[i];
      if (!d || typeof d !== 'object' || Array.isArray(d)) {
        throw new Error('buildScaffoldPrompts: opts.definitions[' + i + '] must be ' +
          'an object with non-empty term and meaning');
      }
      if (typeof d.term !== 'string' || !d.term.trim()) {
        throw new Error('buildScaffoldPrompts: opts.definitions[' + i + '].term must be a non-empty string');
      }
      if (typeof d.meaning !== 'string' || !d.meaning.trim()) {
        throw new Error('buildScaffoldPrompts: opts.definitions[' + i + '].meaning must be a non-empty string');
      }
      out.push({ term: d.term.trim(), meaning: d.meaning.trim() });
    }
    return out;
  }

  function normalizeMechanismSteps(steps) {
    if (steps === undefined || steps === null) return null;
    if (!Array.isArray(steps)) {
      throw new Error('buildScaffoldPrompts: opts.mechanismSteps must be an array of ' +
        'non-empty strings, got ' + typeof steps);
    }
    if (steps.length === 0) return null;
    var out = [];
    for (var i = 0; i < steps.length; i++) {
      if (typeof steps[i] !== 'string' || !steps[i].trim()) {
        throw new Error('buildScaffoldPrompts: opts.mechanismSteps[' + i + '] must be a non-empty string');
      }
      out.push(steps[i].trim());
    }
    return out;
  }

  function notesUserBlock(definitions, mechanismSteps) {
    var lines = [
      '',
      '',
      'Paired student notes - derive the scaffolds from these:'
    ];
    if (definitions) {
      lines.push('Definitions (every word-bank term comes from this list):');
      for (var i = 0; i < definitions.length; i++) {
        lines.push('- ' + definitions[i].term + ': ' + definitions[i].meaning);
      }
    }
    if (mechanismSteps) {
      lines.push('Mechanism steps (build the cloze from these steps, in order):');
      for (var j = 0; j < mechanismSteps.length; j++) {
        lines.push((j + 1) + '. ' + mechanismSteps[j]);
      }
    }
    return lines.join('\n');
  }

  function buildScaffoldPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildScaffoldPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var transitions = normalizeTransitions(opts.transitions);
    var definitions = normalizeDefinitions(opts.definitions);
    var mechanismSteps = normalizeMechanismSteps(opts.mechanismSteps);
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildScaffoldPrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(SCAFFOLD_SYSTEM_TEMPLATE, {
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
      'Write the scaffolds JSON now. Sets in strictly fading order ' +
        '(full first, minimal last) with non-increasing counts, every ' +
        'cloze answer a word-bank term of the same set.'
    ].join('\n');
    if (transitions) user += transitionsUserBlock(transitions);
    if (definitions || mechanismSteps) user += notesUserBlock(definitions, mechanismSteps);
    if (workedExample) {
      user += '\n\nWorked example for this topic - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildScaffoldPrompts: buildScaffoldPrompts,
    SCAFFOLD_SYSTEM_TEMPLATE: SCAFFOLD_SYSTEM_TEMPLATE,
    WATER_CYCLE_SCAFFOLD_EXEMPLAR: WATER_CYCLE_SCAFFOLD_EXEMPLAR
  };
});
