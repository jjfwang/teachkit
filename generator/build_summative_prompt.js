/* animath summative assessment prompt builder - turns a unit of
 * teaching topics into LLM prompts for a summative assessment
 * material (Phase C3, issue #1259). Companion to
 * generator/build_quiz_bank_prompt.js: same UMD wrapper, same level
 * labels and tone wording, same fill() helper. A summative assessment
 * is unit-level: it spans at least 2 topics, carries a blueprint grid
 * whose row marks sum to totalMarks, items whose marks sum to their
 * blueprint row, a mark scheme per item, a rubric field for open
 * responses, and a moderation state. It is never folded into a
 * lesson pack. Zero dependencies, ASCII only. Works in browser and
 * Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathSummativePrompt = api;
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

  // Hand-authored fractions unit summative exemplar (issue #1259):
  // spans fractions-addition and fractions-subtraction, blueprint
  // rows 10 + 10 = totalMarks 20, items summing to their row, every
  // item carrying a mark scheme whose points sum to the item marks,
  // so it passes validateSummative. Kept as a JS object literal and
  // compacted with JSON.stringify so the module works unchanged in
  // browser and Node.
  var FRACTIONS_SUMMATIVE_EXEMPLAR_OBJ = {
    title: 'Fractions Unit Test', level: 'primary', subject: 'math',
    unitTitle: 'Fractions: adding and subtracting',
    topics: ['fractions-addition', 'fractions-subtraction'],
    durationMinutes: 40, totalMarks: 20,
    blueprint: [
      { outcomeCode: 'P5-FRAC-ADD', assessmentObjective: 'AO1 recall and apply', marks: 10, cognitiveLevel: 'apply' },
      { outcomeCode: 'P5-FRAC-SUB', assessmentObjective: 'AO2 reason and solve', marks: 10, cognitiveLevel: 'reason' }
    ],
    items: [
      {
        prompt: 'Calculate 1/2 + 1/4. Show your working.',
        blueprintRow: 0, commandWord: 'Calculate', marks: 6,
        markScheme: { points: [
          { text: 'Renames 1/2 as 2/4 (common denominator)', marks: 3 },
          { text: 'Adds numerators to get 3/4', marks: 3 }
        ] }
      },
      {
        prompt: 'A baker uses 3/4 kg of flour in the morning and 1/4 kg in the afternoon. How much flour is used in total?',
        blueprintRow: 0, commandWord: 'Calculate', marks: 4,
        markScheme: { points: [
          { text: 'Sets up 3/4 + 1/4', marks: 2 },
          { text: 'Correct total of 1 kg', marks: 2 }
        ] }
      },
      {
        prompt: 'Calculate 5/6 - 1/3. Show your working.',
        blueprintRow: 1, commandWord: 'Calculate', marks: 5,
        markScheme: { points: [
          { text: 'Renames 1/3 as 2/6 (common denominator)', marks: 2 },
          { text: 'Subtracts numerators to get 3/6 or 1/2', marks: 3 }
        ] }
      },
      {
        prompt: 'Mei has 7/8 of a pizza. She gives 3/8 to her brother. Explain how much pizza she has left.',
        blueprintRow: 1, commandWord: 'Explain', marks: 5,
        markScheme: { points: [
          { text: 'States the denominators are already the same (eighths)', marks: 2 },
          { text: 'Subtracts numerators and states 4/8 or 1/2 of a pizza', marks: 3 }
        ] }
      }
    ],
    rubric: {
      criteria: [
        {
          name: 'Mathematical communication',
          levels: [
            { label: 'Secure', descriptor: 'Working is complete, ordered and uses correct fraction notation throughout.' },
            { label: 'Developing', descriptor: 'Working is partial or notation is inconsistent, but the method can be followed.' },
            { label: 'Beginning', descriptor: 'Little or no working shown; the method cannot be followed.' }
          ]
        }
      ]
    },
    moderation: { state: 'unreviewed' },
    review: null
  };
  var FRACTIONS_SUMMATIVE_EXEMPLAR = JSON.stringify(FRACTIONS_SUMMATIVE_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var SUMMATIVE_SYSTEM_TEMPLATE = [
    'You are animath\'s summative assessment author. You write',
    'unit-level summative assessments for Singapore lessons as JSON',
    'documents following the animath summative assessment spec',
    '(SPEC.md "Summative assessment spec"). A summative assessment',
    'spans a whole unit of at least 2 topics and is sat under exam',
    'conditions: fixed duration, a marks total, a blueprint grid.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the summative assessment JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, unitTitle, topics, durationMinutes, totalMarks, blueprint, items, rubric, moderation, review.',
    '3. topics holds at least 2 topic slugs spanning the unit; durationMinutes and totalMarks are positive integers.',
    '4. blueprint is a non-empty array of rows {outcomeCode, assessmentObjective, marks, cognitiveLevel}; the row marks sum EXACTLY to totalMarks.',
    '5. Every item carries a prompt, a blueprintRow (the zero-based index of its blueprint row), a commandWord, marks, and a markScheme whose credit points sum EXACTLY to the item marks. The items on each blueprint row sum EXACTLY to that row marks, and every row has at least one item.',
    '6. rubric is an object with at least 1 criterion {name, levels} and every criterion has at least 2 levels {label, descriptor} for judging open responses.',
    '7. moderation is {state: "unreviewed"} and review is null: a generated assessment is never born moderated or approved.',
    '8. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'SUMMATIVE DESIGN:',
    '- Exam format: command words (Calculate, Explain, Show that) match the cognitive level of the item blueprint row.',
    '- The blueprint is the contract: marks follow the outcome weighting of the unit, not the order items are written.',
    '- Mark schemes credit observable steps, so two markers award the same marks to the same script.',
    '',
    'QUALITY GATES - what separates a hand-authored assessment from a sloppy set:',
    '- Every mark is accounted for twice: once in the blueprint sums, once in the item and mark-scheme sums.',
    '- Items are answerable from the unit as taught, in the stated duration, with no trick demands.',
    '- Rubric descriptors describe observable differences between levels, never effort or neatness alone.',
    '',
    'WORKED EXAMPLE - hand-authored fractions unit test (2 topics,',
    'blueprint 10 + 10 = 20 marks, every item mark-schemed).',
    'Match this quality bar:',
    FRACTIONS_SUMMATIVE_EXEMPLAR
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  // opts: {level, subject, unitTitle, topics, focus, workedExample}
  function buildSummativePrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildSummativePrompts: subject is required');
    }
    if (!Array.isArray(opts.topics) || opts.topics.length < 2) {
      throw new Error('buildSummativePrompts: opts.topics must be an array of at least 2 topic slugs');
    }
    opts.topics.forEach(function (topic, i) {
      if (typeof topic !== 'string' || !topic.trim()) {
        throw new Error('buildSummativePrompts: opts.topics[' + i + '] must be a non-empty string');
      }
    });
    var level = opts.level || 'primary';
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildSummativePrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(SUMMATIVE_SYSTEM_TEMPLATE, {
      LEVEL_LABEL: LEVEL_LABELS[level] || level,
      TONE: LEVEL_TONE[level] || LEVEL_TONE.secondary
    });
    var user = [
      'Level: ' + level + ' (' + (LEVEL_LABELS[level] || level) + ')',
      'Subject: ' + opts.subject,
      'Unit: ' + (opts.unitTitle || '(unit title not given)'),
      'Topics spanned: ' + opts.topics.join(', '),
      'Student\'s focus: ' + (opts.focus || '(none given)'),
      '',
      'Write the summative assessment JSON now. At least 2 topics, ' +
        'a blueprint whose rows sum to totalMarks, items summing ' +
        'to their blueprint row, a mark scheme on every item.'
    ].join('\n');
    if (workedExample) {
      user += '\n\nWorked example for this unit - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildSummativePrompts: buildSummativePrompts,
    SUMMATIVE_SYSTEM_TEMPLATE: SUMMATIVE_SYSTEM_TEMPLATE,
    FRACTIONS_SUMMATIVE_EXEMPLAR: FRACTIONS_SUMMATIVE_EXEMPLAR
  };
});
