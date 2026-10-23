/* animath feedback prompt builder - turns a teaching topic and its
 * paired assessment materials into LLM prompts for a feedback
 * material (Phase E2, issue #1295). Companion to
 * generator/build_glossary_prompt.js: same UMD wrapper, same level
 * labels and tone wording, same fill() helper, and the same
 * notes-content model (issue #1279) - the caller supplies the paired
 * assessment content (exit-ticket questions, worksheet questions,
 * quiz items, the notes trap) and the author prompt renders it so
 * model answers and common errors can be derived from it verbatim.
 * A feedback material is one combined topic-level material: a
 * whole-class feedback sheet (strengths, common errors, next
 * steps), model answers and error-analysis fix-it tasks. It holds
 * no student data: generation takes the topic and its paired
 * assessment materials only. Zero dependencies, ASCII only. Works
 * in browser and Node.
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.AnimathFeedbackPrompt = api;
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

  // Hand-authored fractions feedback exemplar (issue #1295):
  // derived verbatim from the gold fractions worksheet and exit
  // ticket - every model answer's question is a paired worksheet
  // or exit-ticket question prompt verbatim, its answer is that
  // question's workedSolution verbatim, and its creditPoints are
  // the source question's markScheme points texts verbatim; every
  // common error's misconception is the paired exit-ticket
  // question misconception verbatim - so it passes
  // validateFeedback. Kept as a JS object literal and compacted
  // with JSON.stringify so the module works unchanged in browser
  // and Node.
  var FRACTIONS_FEEDBACK_EXEMPLAR_OBJ = {
    title: 'Adding fractions: 1/2 + 1/4', level: 'primary', subject: 'math', topic: 'fractions',
    strengths: [
      'Most of the class can convert a half into quarters: a quarter fits inside a half exactly twice, so 1/2 = 2/4.',
      'Once every piece is a quarter, the class adds the tops and keeps the bottom: 2/4 + 1/4 = 3/4.'
    ],
    modelAnswers: [
      {
        question: 'Write 1/2 as quarters, then use your answer to work out 1/2 + 1/4.',
        answer: '1/2 = 2/4, so 2/4 + 1/4 = 3/4.',
        creditPoints: [
          'The half must be re-cut into quarters before the pieces can be counted together',
          'Carries the working through to the correct final answer'
        ]
      },
      {
        question: 'In one sentence: why is 1/2 + 1/4 not 2/6?',
        answer: 'Adding the bottoms would pretend the pieces had changed into sixths, but the pieces stayed quarters: the denominator names the piece size, so 1/2 + 1/4 = 2/4 + 1/4 = 3/4, not 2/6.',
        creditPoints: [
          'A strong answer names the piece size: the denominator tells you how big each piece is, and that never changed',
          'Carries the working through to the correct final answer'
        ]
      }
    ],
    commonErrors: [
      {
        misconception: 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.',
        example: 'On the exit ticket question "What is 1/2 + 1/4?", the wrong answer 2/6 adds 1 + 1 for the tops and 2 + 4 for the bottoms.',
        fixIt: {
          prompt: 'Fix it: 1/2 + 1/4 = 2/6. First convert the half into quarters, then add the tops only.',
          corrected: '1/2 = 2/4, so 2/4 + 1/4 = 3/4.'
        }
      },
      {
        misconception: 'Adding tops and bottoms: 1/2 + 1/4 = 2/6.',
        example: 'On the worksheet, a classmate explains: "1/2 + 1/4 = 2/6, because 1 + 1 = 2 and 2 + 4 = 6."',
        fixIt: {
          prompt: 'Fix it: explain in one sentence why the bottom number is never added, then write the correct sum.',
          corrected: 'The bottom number names the piece size and the pieces stayed quarters: 1/2 + 1/4 = 2/4 + 1/4 = 3/4, not 2/6.'
        }
      }
    ],
    nextSteps: [
      'Reteach the piece-size idea with a bar re-cut into quarters before any adding happens.',
      'Practise converting halves to quarters until 1/2 = 2/4 is automatic, then add.'
    ]
  };
  var FRACTIONS_FEEDBACK_EXEMPLAR = JSON.stringify(FRACTIONS_FEEDBACK_EXEMPLAR_OBJ)
    .split('}}').join('} }');

  var FEEDBACK_SYSTEM_TEMPLATE = [
    'You are animath\'s feedback author. You write whole-class',
    'feedback materials for Singapore lessons as JSON documents',
    'following the animath feedback spec (SPEC.md "Feedback',
    'spec"). A feedback material is one combined topic-level',
    'material: a whole-class feedback sheet (strengths, common',
    'errors, next steps), model answers and error-analysis',
    'fix-it tasks, derived from the topic\'s paired assessment',
    'materials. It holds no student data.',
    '',
    'HARD RULES - violate any of these and the material is rejected:',
    '1. Return ONLY the feedback JSON. No markdown fences, no commentary.',
    '2. Material fields, exactly: title, level, subject, topic, strengths, modelAnswers, commonErrors, nextSteps.',
    '3. Derive, never invent: every model answer\'s question is a paired worksheet or exit-ticket question prompt verbatim, its answer is that question\'s workedSolution or expected answer verbatim, and its creditPoints are the source question markScheme points texts verbatim when it carries one (an empty array when it carries none).',
    '4. Every common error\'s misconception is verbatim from a paired exit-ticket question misconception field, a diagnostics rationale misconception, a quiz-bank item misconceptionCode, a markScheme commonErrors entry, or the paired notes trap misconception.',
    '5. The material holds at least 1 strength, at least 2 model answers, at least 2 common errors (each with an example and a fixIt of prompt and corrected) and at least 1 next step, all non-empty strings.',
    '6. Write for a {{LEVEL_LABEL}} student. Tone: {{TONE}}.',
    '   No jargon above the level. Short sentences.',
    '',
    'FEEDBACK DESIGN:',
    '- Address the whole class, never a named student: strengths first, then the errors worth fixing together, then what happens next.',
    '- A fix-it task makes the student redo the exact step the misconception breaks, and its corrected text shows the fixed working.',
    '',
    'QUALITY GATES - what separates hand-authored feedback from a sloppy summary:',
    '- Every model answer is copy-exact: a student could compare it against the mark scheme point by point.',
    '- Every fix-it targets the named misconception, never a generic "try again".',
    '',
    'WORKED EXAMPLE - hand-authored fractions feedback (model',
    'answers and misconceptions derived verbatim from the gold',
    'fractions worksheet and exit ticket). Match this quality bar:',
    FRACTIONS_FEEDBACK_EXEMPLAR
  ].join('\n');

  function fill(template, vars) {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, function (m, key) {
      return vars[key] !== undefined ? vars[key] : m;
    });
  }

  function normalizeStringList(list, label) {
    if (list === undefined || list === null) return null;
    if (!Array.isArray(list)) {
      throw new Error('buildFeedbackPrompts: opts.' + label + ' entries must be arrays of non-empty strings');
    }
    var out = [];
    for (var i = 0; i < list.length; i++) {
      if (typeof list[i] !== 'string' || !list[i].trim()) {
        throw new Error('buildFeedbackPrompts: a ' + label + ' entry must be a non-empty string');
      }
      out.push(list[i].trim());
    }
    return out;
  }

  // Caller-supplied paired assessment questions (exit-ticket or
  // worksheet): {prompt, answer, workedSolution, misconception,
  // creditPoints, commonErrors}. Only prompt is required; the rest
  // ride through when present so the author can derive verbatim.
  function normalizeQuestions(questions, label) {
    if (questions === undefined || questions === null) return null;
    if (!Array.isArray(questions)) {
      throw new Error('buildFeedbackPrompts: opts.' + label + ' must be an array of question objects, got ' + typeof questions);
    }
    if (questions.length === 0) return null;
    var out = [];
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var p = 'buildFeedbackPrompts: opts.' + label + '[' + i + ']';
      if (!q || typeof q !== 'object' || Array.isArray(q)) {
        throw new Error(p + ' must be an object with a non-empty prompt');
      }
      if (typeof q.prompt !== 'string' || !q.prompt.trim()) {
        throw new Error(p + '.prompt must be a non-empty string');
      }
      var item = { prompt: q.prompt.trim() };
      var textFields = ['answer', 'workedSolution', 'misconception'];
      for (var j = 0; j < textFields.length; j++) {
        var f = textFields[j];
        if (q[f] !== undefined && q[f] !== null) {
          if (typeof q[f] !== 'string' || !q[f].trim()) {
            throw new Error(p + '.' + f + ' must be a non-empty string when present');
          }
          item[f] = q[f].trim();
        }
      }
      var points = normalizeStringList(q.creditPoints, label);
      if (points) item.creditPoints = points;
      var errs = normalizeStringList(q.commonErrors, label);
      if (errs) item.commonErrors = errs;
      out.push(item);
    }
    return out;
  }

  // Caller-supplied paired quiz-bank items: {prompt, answer,
  // misconceptionCode}.
  function normalizeQuizItems(items) {
    if (items === undefined || items === null) return null;
    if (!Array.isArray(items)) {
      throw new Error('buildFeedbackPrompts: opts.quizItems must be an array of item objects, got ' + typeof items);
    }
    if (items.length === 0) return null;
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var q = items[i];
      var p = 'buildFeedbackPrompts: opts.quizItems[' + i + ']';
      if (!q || typeof q !== 'object' || Array.isArray(q)) {
        throw new Error(p + ' must be an object with a non-empty prompt');
      }
      if (typeof q.prompt !== 'string' || !q.prompt.trim()) {
        throw new Error(p + '.prompt must be a non-empty string');
      }
      var item = { prompt: q.prompt.trim() };
      var textFields = ['answer', 'misconceptionCode'];
      for (var j = 0; j < textFields.length; j++) {
        var f = textFields[j];
        if (q[f] !== undefined && q[f] !== null) {
          if (typeof q[f] !== 'string' || !q[f].trim()) {
            throw new Error(p + '.' + f + ' must be a non-empty string when present');
          }
          item[f] = q[f].trim();
        }
      }
      out.push(item);
    }
    return out;
  }

  // The paired notes trap: {misconception, explanation}.
  function normalizeNotesTrap(trap) {
    if (trap === undefined || trap === null) return null;
    if (!trap || typeof trap !== 'object' || Array.isArray(trap)) {
      throw new Error('buildFeedbackPrompts: opts.notesTrap must be an object with a non-empty misconception');
    }
    if (typeof trap.misconception !== 'string' || !trap.misconception.trim()) {
      throw new Error('buildFeedbackPrompts: opts.notesTrap.misconception must be a non-empty string');
    }
    var out = { misconception: trap.misconception.trim() };
    if (trap.explanation !== undefined && trap.explanation !== null) {
      if (typeof trap.explanation !== 'string' || !trap.explanation.trim()) {
        throw new Error('buildFeedbackPrompts: opts.notesTrap.explanation must be a non-empty string when present');
      }
      out.explanation = trap.explanation.trim();
    }
    return out;
  }

  function questionLines(lines, questions, heading) {
    if (!questions) return;
    lines.push(heading);
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      lines.push((i + 1) + '. ' + q.prompt);
      if (q.workedSolution) lines.push('   Worked solution: ' + q.workedSolution);
      if (q.answer) lines.push('   Expected answer: ' + q.answer);
      if (q.misconception) lines.push('   Misconception: ' + q.misconception);
      if (q.creditPoints) lines.push('   Credit points: ' + q.creditPoints.join(' | '));
      if (q.commonErrors) lines.push('   Common errors: ' + q.commonErrors.join(' | '));
    }
  }

  function pairedUserBlock(exitTicketQuestions, worksheetQuestions, quizItems, notesTrap) {
    var lines = [
      '',
      '',
      'Paired assessment materials - derive the feedback from these, verbatim where the rules require it:'
    ];
    questionLines(lines, exitTicketQuestions, 'Exit-ticket questions:');
    questionLines(lines, worksheetQuestions, 'Worksheet questions:');
    if (quizItems) {
      lines.push('Quiz-bank items:');
      for (var i = 0; i < quizItems.length; i++) {
        var q = quizItems[i];
        lines.push((i + 1) + '. ' + q.prompt);
        if (q.answer) lines.push('   Expected answer: ' + q.answer);
        if (q.misconceptionCode) lines.push('   Misconception code: ' + q.misconceptionCode);
      }
    }
    if (notesTrap) {
      lines.push('Paired notes trap:');
      lines.push('Misconception: ' + notesTrap.misconception);
      if (notesTrap.explanation) lines.push('Explanation: ' + notesTrap.explanation);
    }
    return lines.join('\n');
  }

  // opts: {level, subject, topic, topicLabel, focus,
  // exitTicketQuestions, worksheetQuestions, quizItems, notesTrap}
  function buildFeedbackPrompts(opts) {
    opts = opts || {};
    if (!opts.subject) {
      throw new Error('buildFeedbackPrompts: subject is required');
    }
    var level = opts.level || 'primary';
    var exitTicketQuestions = normalizeQuestions(opts.exitTicketQuestions, 'exitTicketQuestions');
    var worksheetQuestions = normalizeQuestions(opts.worksheetQuestions, 'worksheetQuestions');
    var quizItems = normalizeQuizItems(opts.quizItems);
    var notesTrap = normalizeNotesTrap(opts.notesTrap);
    var system = fill(FEEDBACK_SYSTEM_TEMPLATE, {
      LEVEL_LABEL: LEVEL_LABELS[level] || level,
      TONE: LEVEL_TONE[level] || LEVEL_TONE.secondary
    });
    var user = [
      'Level: ' + level + ' (' + (LEVEL_LABELS[level] || level) + ')',
      'Subject: ' + opts.subject,
      'Topic: ' + (opts.topicLabel || opts.topic || '') + ' (' + (opts.topic || '') + ')',
      'Student\'s focus: ' + (opts.focus || '(none given)'),
      '',
      'Write the feedback JSON now. At least 2 model answers and ' +
        'at least 2 common errors derived verbatim from the paired ' +
        'assessment materials, each error with a fix-it task.'
    ].join('\n');
    if (exitTicketQuestions || worksheetQuestions || quizItems || notesTrap) {
      user += pairedUserBlock(exitTicketQuestions, worksheetQuestions, quizItems, notesTrap);
    }
    return { system: system, user: user };
  }

  return {
    buildFeedbackPrompts: buildFeedbackPrompts,
    FEEDBACK_SYSTEM_TEMPLATE: FEEDBACK_SYSTEM_TEMPLATE,
    FRACTIONS_FEEDBACK_EXEMPLAR: FRACTIONS_FEEDBACK_EXEMPLAR
  };
});
