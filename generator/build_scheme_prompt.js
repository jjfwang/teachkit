/* animath scheme of work prompt builder - turns a unit of teaching
 * topics into LLM prompts for a scheme of work material (Phase E1,
 * issue #1290). Companion to generator/build_summative_prompt.js:
 * same UMD wrapper, same level labels and tone wording, same fill()
 * helper. A scheme of work is unit-level: it sequences at least 2
 * topics across the weeks of a term in syllabus order, records the
 * prerequisites each topic builds on (earlier entries only), and
 * marks assessment points by material kind, never by id. It is
 * never folded into a lesson pack. Zero dependencies, ASCII only.
 * Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathSchemePrompt = api;
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

  // Hand-authored primary math scheme exemplar (issue #1290): a
  // Term 2 sequence of fractions, decimals and percentage in
  // syllabus order, prerequisites naming earlier entries only,
  // weeks within the 6-week term, one diagnostics and one
  // summative assessment point, so it passes validateScheme. Kept
  // as a JS object literal and compacted with JSON.stringify so
  // the module works unchanged in browser and Node.
  var PRIMARY_MATH_SCHEME_EXEMPLAR_OBJ = {
    title: 'Primary Mathematics Term 2 Scheme of Work', level: 'primary', subject: 'math',
    unitTitle: 'Number: fractions, decimals and percentage',
    term: 'Term 2', weeks: 6,
    sequence: [
      {
        topic: 'fractions', week: 1, lessons: 4, prerequisites: [],
        assessmentPoints: [
          { kind: 'diagnostics', title: 'Fractions entry check' }
        ]
      },
      {
        topic: 'decimals', week: 3, lessons: 4, prerequisites: ['fractions'],
        assessmentPoints: []
      },
      {
        topic: 'percentage', week: 5, lessons: 4, prerequisites: ['fractions', 'decimals'],
        assessmentPoints: [
          { kind: 'summative', title: 'Number unit test' }
        ]
      }
    ]
  };
  var PRIMARY_MATH_SCHEME_EXEMPLAR = JSON.stringify(PRIMARY_MATH_SCHEME_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var SCHEME_SYSTEM_TEMPLATE = [
    'You are animath\'s scheme of work author. You write',
    'unit-level schemes of work for Singapore lessons as JSON',
    'documents following the animath scheme of work spec',
    '(SPEC.md "Scheme of work spec"). A scheme of work stitches',
    'topic lesson packs into a term sequence: topics in teaching',
    'order, prerequisites, and assessment points along the way.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the scheme of work JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, unitTitle, term, weeks, sequence.',
    '3. sequence holds at least 2 entries in teaching order, following the syllabus track order for the level and subject.',
    '4. Every entry carries a topic slug, a week (a positive integer at most weeks), lessons (a positive integer), prerequisites and assessmentPoints.',
    '5. Every prerequisite names the topic of an EARLIER entry only: no self, forward or duplicate prerequisites.',
    '6. assessmentPoints is an array (may be empty) of {kind, title} with kind one of diagnostics, quizBank, summative, review; reference materials by kind, never by id.',
    '7. Store no syllabus text in the material: syllabus facts stay in the syllabus data layer.',
    '8. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'SCHEME DESIGN:',
    '- Teaching order is the syllabus order: later topics build on the topics sequenced before them.',
    '- Weeks pace the term honestly: a topic starts in its week and its lessons fit before the next topic starts.',
    '- Assessment points sit where a teacher would check: a diagnostics point early, a summative point at the end of the unit.',
    '',
    'QUALITY GATES - what separates a hand-authored scheme from a sloppy list:',
    '- Every prerequisite is real: the earlier topic genuinely supplies what the later topic needs.',
    '- No topic is stranded: the sequence covers the whole unit in the stated weeks.',
    '',
    'WORKED EXAMPLE - hand-authored primary math Term 2 scheme',
    '(fractions, decimals, percentage in syllabus order,',
    'prerequisites backwards only). Match this quality bar:',
    PRIMARY_MATH_SCHEME_EXEMPLAR
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  // opts: {level, subject, unitTitle, term, topics, focus, workedExample}
  function buildSchemePrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildSchemePrompts: subject is required');
    }
    if (!Array.isArray(opts.topics) || opts.topics.length < 2) {
      throw new Error('buildSchemePrompts: opts.topics must be an array of at least 2 topic slugs');
    }
    opts.topics.forEach(function (topic, i) {
      if (typeof topic !== 'string' || !topic.trim()) {
        throw new Error('buildSchemePrompts: opts.topics[' + i + '] must be a non-empty string');
      }
    });
    var level = opts.level || 'primary';
    var workedExample = null;
    if (opts.workedExample !== undefined && opts.workedExample !== null) {
      if (typeof opts.workedExample !== 'string' || !opts.workedExample.trim()) {
        throw new Error('buildSchemePrompts: opts.workedExample must be a non-empty string when present');
      }
      workedExample = opts.workedExample;
    }
    var system = fill(SCHEME_SYSTEM_TEMPLATE, {
      LEVEL_LABEL: LEVEL_LABELS[level] || level,
      TONE: LEVEL_TONE[level] || LEVEL_TONE.secondary
    });
    var user = [
      'Level: ' + level + ' (' + (LEVEL_LABELS[level] || level) + ')',
      'Subject: ' + opts.subject,
      'Unit: ' + (opts.unitTitle || '(unit title not given)'),
      'Term: ' + (opts.term || '(term not given)'),
      'Topics in teaching order: ' + opts.topics.join(', '),
      'Student\'s focus: ' + (opts.focus || '(none given)'),
      '',
      'Write the scheme of work JSON now. At least 2 topics in ' +
        'syllabus order, every week within the term, prerequisites ' +
        'naming earlier topics only.'
    ].join('\n');
    if (workedExample) {
      user += '\n\nWorked example for this unit - adapt its structure and quality, do not copy it verbatim:\n' + workedExample;
    }
    return { system: system, user: user };
  }

  return {
    buildSchemePrompts: buildSchemePrompts,
    SCHEME_SYSTEM_TEMPLATE: SCHEME_SYSTEM_TEMPLATE,
    PRIMARY_MATH_SCHEME_EXEMPLAR: PRIMARY_MATH_SCHEME_EXEMPLAR
  };
});
