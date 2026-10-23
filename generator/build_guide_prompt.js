/* animath guide prompt builder - turns a unit of teaching topics
 * and its paired unit materials into LLM prompts for a guide
 * material (Phase E3, issue #1302). Companion to
 * generator/build_feedback_prompt.js: same UMD wrapper, same level
 * labels and tone wording, same fill() helper, and the same
 * notes-content model extended to unit level - the caller supplies
 * the paired unit content (the scheme sequence, the per-topic
 * notes definitions and traps, and the gate topic's revision,
 * quiz-bank, exit-ticket and feedback content) and the author
 * prompt renders it so key ideas, traps and parent questions can
 * be derived from it verbatim. A guide material is one combined
 * unit-level material: a parent/student revision guide (overview,
 * key ideas, a revision plan, traps to watch for and questions a
 * parent can ask, with answers). It is standalone, never folded
 * into a lesson pack, and holds no student data: generation takes
 * the unit and its paired materials only. Zero dependencies,
 * ASCII only. Works in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathGuidePrompt = api;
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

  // Hand-authored primary math guide exemplar (issue #1302):
  // derived verbatim from the gold primary-math scheme of work
  // (header and topic sequence) and the paired fractions, decimals
  // and percentage notes (every key idea's term is a paired notes
  // definition term and its explanation is that definition's
  // meaning verbatim; every trap's misconception is a sequenced
  // topic's paired notes trap misconception verbatim), the gate
  // topic's (fractions) paired revision (every revision plan
  // dayOffset is a practiceSet dayOffset) and the gate topic's
  // paired quiz bank and exit ticket (every parent question and
  // answer verbatim) - so it passes validateGuide. Kept as a JS
  // object literal and compacted with JSON.stringify so the module
  // works unchanged in browser and Node.
  var PRIMARY_MATH_GUIDE_EXEMPLAR_OBJ = {
    title: 'Primary Mathematics Scheme of Work: Number', level: 'primary', subject: 'math',
    unitTitle: 'Number: fractions, decimals and percentage', term: 'Term 2',
    topics: ['fractions', 'decimals', 'percentage'],
    overview: [
      'This term we learn three ways to talk about parts of a whole: fractions, decimals and percentage.',
      'We start with fractions, then meet decimals, and finish with percentage - each new idea builds on the one before.'
    ],
    keyIdeas: [
      {
        term: 'Fraction',
        explanation: 'A part of a whole, written as one number over another: the top number counts the pieces taken and the bottom number names the piece size.'
      },
      {
        term: 'Denominator',
        explanation: 'The bottom number of a fraction. It names the piece size - how many equal pieces the whole was cut into - so quarters have denominator 4.'
      },
      {
        term: 'Tenths',
        explanation: 'The first place after the decimal point: the whole split into ten equal parts, so each part is one tenth and 0.4 is four tenths.'
      },
      {
        term: 'Percent',
        explanation: 'A count out of one hundred: 25% is 25 out of 100, whatever the whole in the question is.'
      }
    ],
    revisionPlan: [
      { dayOffset: 1, focus: 'Fractions practice set: add halves and quarters, then thirds.' },
      { dayOffset: 3, focus: 'Fractions practice set: explain why the denominator stays the same, then use fractions in a recipe problem.' }
    ],
    traps: [
      {
        misconception: 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.',
        watchFor: 'If your child writes 2/6 for 1/2 + 1/4, they added the bottom numbers too - ask them what size the pieces are.'
      },
      {
        misconception: 'Comparing decimals by digit count: 0.25 looks bigger than 0.4 because 25 > 4.',
        watchFor: 'If your child says 0.25 is bigger than 0.4, ask them to write 0.4 as 0.40 and compare place by place.'
      },
      {
        misconception: '25% of 60 is just 25.',
        watchFor: 'If your child answers 25 for 25% of 60, remind them percent means out of one hundred, so find a quarter of 60 instead.'
      }
    ],
    parentQuestions: [
      { question: 'What is 1/2 + 1/4?', answer: '3/4' },
      { question: 'What is 2/5 + 1/5?', answer: '3/5' },
      { question: 'Write 1/2 as quarters.', answer: '2/4' }
    ]
  };
  var PRIMARY_MATH_GUIDE_EXEMPLAR = JSON.stringify(PRIMARY_MATH_GUIDE_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var GUIDE_SYSTEM_TEMPLATE = [
    'You are animath\'s revision guide author. You write',
    'parent/student revision guides for Singapore units as JSON',
    'documents following the animath guide spec (SPEC.md "Guide',
    'spec"). A guide material is one combined unit-level',
    'material: a plain-language guide a parent or student can',
    'revise from at home, derived from the unit\'s own generated',
    'materials - the scheme of work, the sequenced topics\' paired',
    'student notes, and the gate topic\'s paired revision, quiz',
    'bank, exit ticket and feedback. It holds no student data.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the guide JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, unitTitle, term, topics, overview, keyIdeas, revisionPlan, traps, parentQuestions.',
    '3. The header mirrors the paired scheme of work (title, level, subject, unitTitle, term) and topics equals the scheme sequence topics in order, at least 2 slugs.',
    '4. Derive, never invent: every key idea\'s term is a paired notes definition term verbatim and its explanation is that definition\'s meaning verbatim.',
    '5. Every revision plan dayOffset equals a practiceSet dayOffset in the gate topic\'s paired revision material.',
    '6. Every trap\'s misconception is verbatim from a sequenced topic\'s paired notes trap or the gate topic\'s paired feedback common errors.',
    '7. Every parent question is a prompt from the gate topic\'s paired quiz bank or exit ticket verbatim, with its answer verbatim.',
    '8. The material holds at least 1 overview string, at least 2 key ideas, at least 1 revision plan entry, at least 1 trap and at least 2 parent questions, all non-empty.',
    '9. Write for a {{LEVEL_LABEL}} student and their parent. Tone: {{TONE}}.',
    '   Plain language. No jargon above the level. Short sentences.',
    '',
    'GUIDE DESIGN:',
    '- Write for the kitchen table, not the classroom: a parent who never saw the lesson can still help.',
    '- A trap pairs the misconception with the sign a parent can watch for at home, in plain language.',
    '- Parent questions come with their answers: the parent asks, the child answers, the parent checks.',
    '',
    'QUALITY GATES - what separates a hand-authored guide from a sloppy summary:',
    '- Every key idea is copy-exact: a student could compare it against the notes definition word by word.',
    '- The revision plan follows the paired revision material day by day, never an invented schedule.',
    '',
    'WORKED EXAMPLE - hand-authored primary math guide (header',
    'and topics from the gold primary-math scheme of work, key',
    'ideas and traps derived verbatim from the paired notes,',
    'revision plan and parent questions from the gate topic\'s',
    'paired revision, quiz bank and exit ticket). Match this',
    'quality bar:',
    PRIMARY_MATH_GUIDE_EXEMPLAR
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  function normalizeStringList(list, label) {
    if (list === undefined || list === null) return null;
    if (!Array.isArray(list)) {
      throw new Error('buildGuidePrompts: opts.' + label + ' entries must be arrays of non-empty strings');
    }
    var out = [];
    for (var i = 0; i < list.length; i++) {
      if (typeof list[i] !== 'string' || !list[i].trim()) {
        throw new Error('buildGuidePrompts: a ' + label + ' entry must be a non-empty string');
      }
      out.push(list[i].trim());
    }
    return out;
  }

  // Caller-supplied per-topic paired notes content:
  // {topic, definitions: [{term, meaning}], trap: {misconception,
  // explanation}}. Only topic is required; the rest ride through
  // when present so the author can derive verbatim.
  function normalizeNotesByTopic(list) {
    if (list === undefined || list === null) return null;
    if (!Array.isArray(list)) {
      throw new Error('buildGuidePrompts: opts.notesByTopic must be an array of notes objects, got ' + typeof list);
    }
    if (list.length === 0) return null;
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      var p = 'buildGuidePrompts: opts.notesByTopic[' + i + ']';
      if (!n || typeof n !== 'object' || Array.isArray(n)) {
        throw new Error(p + ' must be an object with a non-empty topic');
      }
      if (typeof n.topic !== 'string' || !n.topic.trim()) {
        throw new Error(p + '.topic must be a non-empty string');
      }
      var item = { topic: n.topic.trim() };
      if (n.definitions !== undefined && n.definitions !== null) {
        if (!Array.isArray(n.definitions)) {
          throw new Error(p + '.definitions must be an array of definition objects');
        }
        var defs = [];
        for (var j = 0; j < n.definitions.length; j++) {
          var d = n.definitions[j];
          var q = p + '.definitions[' + j + ']';
          if (!d || typeof d !== 'object' || Array.isArray(d)) {
            throw new Error(q + ' must be an object with a non-empty term and meaning');
          }
          if (typeof d.term !== 'string' || !d.term.trim()) {
            throw new Error(q + '.term must be a non-empty string');
          }
          if (typeof d.meaning !== 'string' || !d.meaning.trim()) {
            throw new Error(q + '.meaning must be a non-empty string');
          }
          defs.push({ term: d.term.trim(), meaning: d.meaning.trim() });
        }
        if (defs.length) item.definitions = defs;
      }
      if (n.trap !== undefined && n.trap !== null) {
        if (!n.trap || typeof n.trap !== 'object' || Array.isArray(n.trap)) {
          throw new Error(p + '.trap must be an object with a non-empty misconception');
        }
        if (typeof n.trap.misconception !== 'string' || !n.trap.misconception.trim()) {
          throw new Error(p + '.trap.misconception must be a non-empty string');
        }
        var trap = { misconception: n.trap.misconception.trim() };
        if (n.trap.explanation !== undefined && n.trap.explanation !== null) {
          if (typeof n.trap.explanation !== 'string' || !n.trap.explanation.trim()) {
            throw new Error(p + '.trap.explanation must be a non-empty string when present');
          }
          trap.explanation = n.trap.explanation.trim();
        }
        item.trap = trap;
      }
      out.push(item);
    }
    return out;
  }

  // Caller-supplied gate-topic paired revision practice sets:
  // {dayOffset, items: [{prompt, answer}]}.
  function normalizePracticeSets(sets) {
    if (sets === undefined || sets === null) return null;
    if (!Array.isArray(sets)) {
      throw new Error('buildGuidePrompts: opts.revisionPracticeSets must be an array of practice set objects, got ' + typeof sets);
    }
    if (sets.length === 0) return null;
    var out = [];
    for (var i = 0; i < sets.length; i++) {
      var s = sets[i];
      var p = 'buildGuidePrompts: opts.revisionPracticeSets[' + i + ']';
      if (!s || typeof s !== 'object' || Array.isArray(s)) {
        throw new Error(p + ' must be an object with a non-negative integer dayOffset');
      }
      if (!Number.isInteger(s.dayOffset) || s.dayOffset < 0) {
        throw new Error(p + '.dayOffset must be a non-negative integer');
      }
      var item = { dayOffset: s.dayOffset };
      if (s.items !== undefined && s.items !== null) {
        if (!Array.isArray(s.items)) {
          throw new Error(p + '.items must be an array of item objects');
        }
        var items = [];
        for (var j = 0; j < s.items.length; j++) {
          var it = s.items[j];
          var q = p + '.items[' + j + ']';
          if (!it || typeof it !== 'object' || Array.isArray(it)) {
            throw new Error(q + ' must be an object with a non-empty prompt');
          }
          if (typeof it.prompt !== 'string' || !it.prompt.trim()) {
            throw new Error(q + '.prompt must be a non-empty string');
          }
          var entry = { prompt: it.prompt.trim() };
          if (it.answer !== undefined && it.answer !== null) {
            if (typeof it.answer !== 'string' || !it.answer.trim()) {
              throw new Error(q + '.answer must be a non-empty string when present');
            }
            entry.answer = it.answer.trim();
          }
          items.push(entry);
        }
        if (items.length) item.items = items;
      }
      out.push(item);
    }
    return out;
  }

  // Caller-supplied paired questions (quiz-bank items or
  // exit-ticket questions): {prompt, answer, workedSolution,
  // misconception, misconceptionCode}. Only prompt is required.
  function normalizeQuestions(questions, label) {
    if (questions === undefined || questions === null) return null;
    if (!Array.isArray(questions)) {
      throw new Error('buildGuidePrompts: opts.' + label + ' must be an array of question objects, got ' + typeof questions);
    }
    if (questions.length === 0) return null;
    var out = [];
    for (var i = 0; i < questions.length; i++) {
      var q0 = questions[i];
      var p = 'buildGuidePrompts: opts.' + label + '[' + i + ']';
      if (!q0 || typeof q0 !== 'object' || Array.isArray(q0)) {
        throw new Error(p + ' must be an object with a non-empty prompt');
      }
      if (typeof q0.prompt !== 'string' || !q0.prompt.trim()) {
        throw new Error(p + '.prompt must be a non-empty string');
      }
      var item = { prompt: q0.prompt.trim() };
      var textFields = ['answer', 'workedSolution', 'misconception', 'misconceptionCode'];
      for (var j = 0; j < textFields.length; j++) {
        var f = textFields[j];
        if (q0[f] !== undefined && q0[f] !== null) {
          if (typeof q0[f] !== 'string' || !q0[f].trim()) {
            throw new Error(p + '.' + f + ' must be a non-empty string when present');
          }
          item[f] = q0[f].trim();
        }
      }
      out.push(item);
    }
    return out;
  }

  function pairedUserBlock(notesByTopic, revisionPracticeSets, quizItems, exitTicketQuestions, feedbackCommonErrors) {
    var lines = [
      '',
      '',
      'Paired unit materials - derive the guide from these, verbatim where the rules require it:'
    ];
    if (notesByTopic) {
      lines.push('Paired notes by topic:');
      for (var i = 0; i < notesByTopic.length; i++) {
        var n = notesByTopic[i];
        lines.push('Topic: ' + n.topic);
        if (n.definitions) {
          for (var j = 0; j < n.definitions.length; j++) {
            lines.push('   Definition: ' + n.definitions[j].term + ' - ' + n.definitions[j].meaning);
          }
        }
        if (n.trap) {
          lines.push('   Trap misconception: ' + n.trap.misconception);
          if (n.trap.explanation) lines.push('   Trap explanation: ' + n.trap.explanation);
        }
      }
    }
    if (revisionPracticeSets) {
      lines.push('Gate topic revision practice sets:');
      for (var a = 0; a < revisionPracticeSets.length; a++) {
        var s = revisionPracticeSets[a];
        lines.push('Day offset ' + s.dayOffset + ':');
        if (s.items) {
          for (var b = 0; b < s.items.length; b++) {
            lines.push('   ' + (b + 1) + '. ' + s.items[b].prompt);
            if (s.items[b].answer) lines.push('      Answer: ' + s.items[b].answer);
          }
        }
      }
    }
    if (quizItems) {
      lines.push('Gate topic quiz-bank items:');
      for (var c = 0; c < quizItems.length; c++) {
        var q = quizItems[c];
        lines.push((c + 1) + '. ' + q.prompt);
        if (q.answer) lines.push('   Expected answer: ' + q.answer);
        if (q.misconceptionCode) lines.push('   Misconception code: ' + q.misconceptionCode);
      }
    }
    if (exitTicketQuestions) {
      lines.push('Gate topic exit-ticket questions:');
      for (var d = 0; d < exitTicketQuestions.length; d++) {
        var t = exitTicketQuestions[d];
        lines.push((d + 1) + '. ' + t.prompt);
        if (t.workedSolution) lines.push('   Worked solution: ' + t.workedSolution);
        if (t.answer) lines.push('   Expected answer: ' + t.answer);
        if (t.misconception) lines.push('   Misconception: ' + t.misconception);
      }
    }
    if (feedbackCommonErrors) {
      lines.push('Gate topic feedback common errors:');
      for (var e = 0; e < feedbackCommonErrors.length; e++) {
        lines.push((e + 1) + '. ' + feedbackCommonErrors[e]);
      }
    }
    return lines.join('\n');
  }

  // opts: {level, subject, unitTitle, term, topics, focus,
  // notesByTopic, revisionPracticeSets, quizItems,
  // exitTicketQuestions, feedbackCommonErrors}
  function buildGuidePrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildGuidePrompts: subject is required');
    }
    var topics = normalizeStringList(opts.topics, 'topics');
    if (!topics || topics.length < 2) {
      throw new Error('buildGuidePrompts: opts.topics must be an array of at least 2 topic slugs');
    }
    var notesByTopic = normalizeNotesByTopic(opts.notesByTopic);
    var revisionPracticeSets = normalizePracticeSets(opts.revisionPracticeSets);
    var quizItems = normalizeQuestions(opts.quizItems, 'quizItems');
    var exitTicketQuestions = normalizeQuestions(opts.exitTicketQuestions, 'exitTicketQuestions');
    var feedbackCommonErrors = normalizeStringList(opts.feedbackCommonErrors, 'feedbackCommonErrors');
    if (feedbackCommonErrors && feedbackCommonErrors.length === 0) feedbackCommonErrors = null;
    var level = opts.level || 'primary';
    var system = fill(GUIDE_SYSTEM_TEMPLATE, {
      LEVEL_LABEL: LEVEL_LABELS[level] || level,
      TONE: LEVEL_TONE[level] || LEVEL_TONE.secondary
    });
    var user = [
      'Level: ' + level + ' (' + (LEVEL_LABELS[level] || level) + ')',
      'Subject: ' + opts.subject,
      'Unit: ' + (opts.unitTitle || '(unit title not given)'),
      'Term: ' + (opts.term || '(term not given)'),
      'Topics in scheme order: ' + topics.join(', '),
      'Student\'s focus: ' + (opts.focus || '(none given)'),
      '',
      'Write the guide JSON now. At least 2 key ideas and at ' +
        'least 2 parent questions derived verbatim from the ' +
        'paired unit materials, a revision plan pinned to the ' +
        'paired revision day offsets, and traps carrying the ' +
        'paired misconceptions verbatim.'
    ].join('\n');
    if (notesByTopic || revisionPracticeSets || quizItems || exitTicketQuestions || feedbackCommonErrors) {
      user += pairedUserBlock(notesByTopic, revisionPracticeSets, quizItems, exitTicketQuestions, feedbackCommonErrors);
    }
    return { system: system, user: user };
  }

  return {
    buildGuidePrompts: buildGuidePrompts,
    GUIDE_SYSTEM_TEMPLATE: GUIDE_SYSTEM_TEMPLATE,
    PRIMARY_MATH_GUIDE_EXEMPLAR: PRIMARY_MATH_GUIDE_EXEMPLAR
  };
});
