/* Tests for player/printable.js - printable worksheet + exit-ticket
 * renderer (issue #758). Node-only, zero dependencies: every render
 * function is a pure spec -> HTML-string transform.
 * Run: node --test "tests/*.test.js"
 */
'use strict';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const printable = require('../player/printable.js');
const validate = require('../player/validate.js');

const ROOT = path.join(__dirname, '..');
const worksheet = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/worksheets/primary-science-water-cycle.json'), 'utf8'));
const ticket = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/tickets/primary-science-water-cycle.json'), 'utf8'));
const notes = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/notes/primary-science-water-cycle.json'), 'utf8'));
const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/scripts/primary-science-water-cycle.json'), 'utf8'));

function teacherOnlyStrings(spec) {
  const out = [];
  for (const q of spec.questions) {
    if (q.explanation) out.push(q.explanation);
    if (q.feedback) out.push(q.feedback);
    if (q.misconception) out.push(q.misconception);
    if (q.kind === 'short-answer') out.push(q.answer);
  }
  return out;
}

describe('gold samples', () => {
  test('both gold samples validate with zero errors', () => {
    assert.deepEqual(validate.validateWorksheet(worksheet), []);
    assert.deepEqual(validate.validateExitTicket(ticket), []);
  });

  test('all four renders are non-empty and carry title and topic', () => {
    const renders = [
      [printable.renderWorksheet(worksheet), worksheet],
      [printable.renderWorksheetAnswerKey(worksheet), worksheet],
      [printable.renderExitTicket(ticket), ticket],
      [printable.renderExitTicketAnswerKey(ticket), ticket],
    ];
    for (const [html, spec] of renders) {
      assert.ok(html.length > 0);
      assert.ok(html.includes(spec.title), 'title present');
      assert.ok(html.includes(spec.topic), 'topic present');
      assert.ok(html.includes(spec.subject), 'subject present');
    }
    assert.ok(printable.renderWorksheet(worksheet).includes('pr-student'));
    assert.ok(printable.renderWorksheetAnswerKey(worksheet).includes('pr-teacher'));
    assert.ok(printable.renderWorksheetAnswerKey(worksheet).includes('pr-answer-key'));
    assert.ok(printable.renderExitTicket(ticket).includes('pr-student'));
    assert.ok(printable.renderExitTicketAnswerKey(ticket).includes('pr-teacher'));
  });

  test('student renders contain every prompt and every choice text', () => {
    for (const [html, spec] of [
      [printable.renderWorksheet(worksheet), worksheet],
      [printable.renderExitTicket(ticket), ticket],
    ]) {
      for (const q of spec.questions) {
        assert.ok(html.includes(q.prompt), 'prompt present: ' + q.id);
        if (q.kind === 'multiple-choice') {
          for (const c of q.choices) assert.ok(html.includes(c.text), 'choice present: ' + c.text);
        }
      }
    }
  });

  test('student renders never leak teacher content or correct markers', () => {
    for (const [html, spec] of [
      [printable.renderWorksheet(worksheet), worksheet],
      [printable.renderExitTicket(ticket), ticket],
    ]) {
      for (const s of teacherOnlyStrings(spec)) {
        assert.ok(!html.includes(s), 'leaked teacher string: ' + s.slice(0, 40));
      }
      assert.ok(!html.includes('correct'), 'no correct marker');
      assert.ok(!html.includes('data-correct'), 'no data-correct marker');
      assert.ok(!html.includes('Misconception:'), 'no misconception label');
    }
  });

  test('teacher renders contain every answer, explanation, misconception and feedback', () => {
    const wsKey = printable.renderWorksheetAnswerKey(worksheet);
    for (const q of worksheet.questions) {
      if (q.kind === 'multiple-choice') {
        const right = q.choices.find((c) => c.correct === true);
        assert.ok(wsKey.includes(right.text), 'correct text present: ' + q.id);
      } else {
        assert.ok(wsKey.includes(q.answer), 'answer present: ' + q.id);
      }
      if (q.explanation) assert.ok(wsKey.includes(q.explanation), 'explanation present: ' + q.id);
      if (q.misconception) assert.ok(wsKey.includes('Misconception: ' + q.misconception), 'misconception present: ' + q.id);
    }
    const tkKey = printable.renderExitTicketAnswerKey(ticket);
    for (const q of ticket.questions) {
      if (q.kind === 'multiple-choice') {
        const right = q.choices.find((c) => c.correct === true);
        assert.ok(tkKey.includes(right.text), 'correct text present: ' + q.id);
      } else {
        assert.ok(tkKey.includes(q.answer), 'answer present: ' + q.id);
      }
      if (q.feedback) assert.ok(tkKey.includes(q.feedback), 'feedback present: ' + q.id);
      if (q.misconception) assert.ok(tkKey.includes('Misconception: ' + q.misconception), 'misconception present: ' + q.id);
    }
  });
});

describe('escapeHtml and hostile specs', () => {
  test('escapeHtml escapes &, <, > and " with & first', () => {
    assert.equal(printable.escapeHtml('a & b <c> "d"'), 'a &amp; b &lt;c&gt; &quot;d&quot;');
    assert.equal(printable.escapeHtml('&lt;'), '&amp;lt;');
    assert.equal(printable.escapeHtml('plain'), 'plain');
  });

  test('hostile spec renders escaped with no raw script tag', () => {
    const hostile = {
      title: 'Evil <script>alert("x")</script> & Co',
      level: 'primary', subject: 'science & "tech"', topic: 'water-cycle',
      questions: [
        {
          id: 'q1', kind: 'multiple-choice',
          prompt: 'Pick <b>one</b> & "go"',
          choices: [
            { text: '<script>bad()</script>', correct: true },
            { text: 'Safe & sound' },
          ],
          explanation: 'Because <script>alert(1)</script> & "reasons"',
          misconception: 'Bad <idea> & co',
        },
      ],
    };
    const student = printable.renderWorksheet(hostile);
    const key = printable.renderWorksheetAnswerKey(hostile);
    for (const html of [student, key]) {
      assert.ok(!html.includes('<script'), 'no raw script tag');
      assert.ok(html.includes('&lt;script&gt;'), 'script escaped');
      assert.ok(html.includes('&amp;'), 'ampersand escaped');
      assert.ok(html.includes('&quot;'), 'quote escaped');
    }
    assert.ok(key.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'explanation escaped');
  });
});

describe('optional branches with synthetic minimal specs', () => {
  const minimalWorksheet = {
    title: 'Minimal', level: 'primary', subject: 'math', topic: 'fractions',
    questions: [
      { id: 'q1', kind: 'short-answer', prompt: 'What is half of 4?', answer: '2' },
    ],
  };

  test('worksheet without instructions or optional question fields renders', () => {
    const student = printable.renderWorksheet(minimalWorksheet);
    assert.ok(!student.includes('pr-instructions'));
    assert.ok(student.includes('pr-answer-lines'));
    const key = printable.renderWorksheetAnswerKey(minimalWorksheet);
    assert.ok(key.includes('Answer: 2'));
    assert.ok(!key.includes('pr-explanation'));
    assert.ok(!key.includes('pr-misconception'));
  });

  test('worksheet with instructions and a bare multiple-choice question renders', () => {
    const spec = {
      title: 'With Instructions', level: 'secondary', subject: 'math', topic: 'algebra',
      instructions: 'Answer every question.',
      questions: [
        {
          id: 'q1', kind: 'multiple-choice', prompt: 'What is 1 + 1?',
          choices: [{ text: '2', correct: true }, { text: '3' }],
        },
      ],
    };
    const student = printable.renderWorksheet(spec);
    assert.ok(student.includes('Answer every question.'));
    assert.ok(student.includes('pr-choices'));
    const key = printable.renderWorksheetAnswerKey(spec);
    assert.ok(key.includes('Answer: 2'));
    assert.ok(!key.includes('pr-feedback'));
  });

  test('empty-string instructions are not rendered', () => {
    const spec = Object.assign({}, minimalWorksheet, { instructions: '' });
    assert.ok(!printable.renderWorksheet(spec).includes('pr-instructions'));
  });

  test('exit ticket with questions lacking feedback and misconception renders', () => {
    const spec = {
      title: 'Bare Ticket', level: 'jc', subject: 'geography', topic: 'rivers',
      questions: [
        { id: 'q1', kind: 'short-answer', prompt: 'Name a river.', answer: 'The Nile' },
        {
          id: 'q2', kind: 'multiple-choice', prompt: 'Pick a sea.',
          choices: [{ text: 'The North Sea', correct: true }, { text: 'The Sahara' }],
        },
        { id: 'q3', kind: 'short-answer', prompt: 'Name a lake.', answer: 'Lake Victoria', feedback: 'Good recall.' },
      ],
    };
    const student = printable.renderExitTicket(spec);
    assert.ok(student.includes('Name a river.'));
    assert.ok(!student.includes('The Nile'));
    const key = printable.renderExitTicketAnswerKey(spec);
    assert.ok(key.includes('Answer: The Nile'));
    assert.ok(key.includes('Feedback: Good recall.'));
    assert.ok(!key.includes('Misconception:'));
  });
});

describe('validation and validator resolution', () => {
  test('invalid specs throw with the invalid worksheet / exit ticket prefix', () => {
    assert.throws(() => printable.renderWorksheet({}), /invalid worksheet:/);
    assert.throws(() => printable.renderWorksheetAnswerKey(null), /invalid worksheet:/);
    assert.throws(() => printable.renderExitTicket({}), /invalid exit ticket:/);
    assert.throws(() => printable.renderExitTicketAnswerKey(minimalTicketBad()), /invalid exit ticket:/);
  });

  function minimalTicketBad() {
    return { title: 'T', level: 'primary', subject: 'math', topic: 'x', questions: [] };
  }

  test('validator resolves through the AnimathValidate global when present', () => {
    globalThis.AnimathValidate = validate;
    try {
      assert.ok(printable.renderWorksheet(worksheet).includes(worksheet.title));
      assert.ok(printable.renderExitTicket(ticket).includes(ticket.title));
    } finally {
      delete globalThis.AnimathValidate;
    }
  });

  test('a global validator without the functions throws the missing-validator error', () => {
    globalThis.AnimathValidate = {};
    try {
      assert.throws(() => printable.renderWorksheet(worksheet), /animath printable: player\/validate\.js is missing/);
      assert.throws(() => printable.renderExitTicket(ticket), /animath printable: player\/validate\.js is missing/);
    } finally {
      delete globalThis.AnimathValidate;
    }
  });
});

describe('notes and script gold samples', () => {
  test('both gold samples validate with zero errors', () => {
    assert.deepEqual(validate.validateNotes(notes), []);
    assert.deepEqual(validate.validateScript(script), []);
  });

  test('notes and script renders are non-empty and carry title, topic and subject', () => {
    for (const [html, spec] of [
      [printable.renderNotes(notes), notes],
      [printable.renderScript(script), script],
    ]) {
      assert.ok(html.length > 0);
      assert.ok(html.includes(spec.title), 'title present');
      assert.ok(html.includes(spec.topic), 'topic present');
      assert.ok(html.includes(spec.subject), 'subject present');
    }
    const notesHtml = printable.renderNotes(notes);
    assert.ok(notesHtml.includes('pr-sheet pr-notes'));
    assert.ok(notesHtml.includes('Student notes'));
    assert.ok(notesHtml.includes('pr-objectives'));
    assert.ok(notesHtml.includes('pr-definitions'));
    assert.ok(notesHtml.includes('pr-mechanism-steps'));
    assert.ok(notesHtml.includes('pr-worked-example'));
    assert.ok(notesHtml.includes('pr-trap'));
    const scriptHtml = printable.renderScript(script);
    assert.ok(scriptHtml.includes('pr-sheet pr-script'));
    assert.ok(scriptHtml.includes('Teacher script'));
    assert.ok(scriptHtml.includes('pr-segments'));
  });

  test('notes render contains every objective, definition, step, worked example and trap', () => {
    const html = printable.renderNotes(notes);
    for (const o of notes.objectives) assert.ok(html.includes(o), 'objective present');
    for (const d of notes.definitions) {
      assert.ok(html.includes(d.term), 'term present: ' + d.term);
      assert.ok(html.includes(d.meaning), 'meaning present: ' + d.term);
    }
    for (const s of notes.mechanismSteps) assert.ok(html.includes(s), 'step present');
    assert.ok(html.includes(notes.workedExample), 'worked example present');
    assert.ok(html.includes(notes.trap.misconception), 'trap misconception present');
    assert.ok(html.includes(notes.trap.explanation), 'trap explanation present');
  });

  test('script render contains every segment and the summed total of 30 minutes', () => {
    const html = printable.renderScript(script);
    assert.ok(html.includes('Total: 30 minutes'), 'total line pinned');
    for (const seg of script.segments) {
      assert.ok(html.includes(seg.say), 'say present');
      assert.ok(html.includes(seg.minutes + ' minutes'), 'minutes present');
      if (seg.cue) assert.ok(html.includes('Cue: ' + seg.cue), 'cue present');
      if (seg.questions) for (const q of seg.questions) assert.ok(html.includes(q), 'question present');
      if (seg.watchFor) assert.ok(html.includes('Watch for: ' + seg.watchFor), 'watchFor present');
    }
  });
});

describe('notes and script hostile and optional branches', () => {
  test('hostile notes spec renders escaped with no raw script tag', () => {
    const hostile = {
      title: 'Evil <script>alert("x")</script> & Co',
      level: 'primary', subject: 'science & "tech"', topic: 'water-cycle',
      objectives: ['Learn <b>this</b> & "that"'],
      definitions: [{ term: '<script>term()</script>', meaning: 'Means <i>stuff</i> & things' }],
      mechanismSteps: ['Step <script>one</script> & done'],
      workedExample: 'Example <script>alert(2)</script> & "quoted"',
      trap: { misconception: 'Bad <idea> & co', explanation: 'Wrong because <script>alert(3)</script>' },
    };
    const html = printable.renderNotes(hostile);
    assert.ok(!html.includes('<script'), 'no raw script tag');
    assert.ok(html.includes('&lt;script&gt;'), 'script escaped');
    assert.ok(html.includes('&amp;'), 'ampersand escaped');
    assert.ok(html.includes('&quot;'), 'quote escaped');
    assert.ok(html.includes('&lt;script&gt;alert(3)&lt;/script&gt;'), 'trap explanation escaped');
  });

  test('hostile script spec renders escaped with no raw script tag', () => {
    const hostile = {
      title: 'Evil <script>alert("x")</script> & Co',
      level: 'primary', subject: 'science', topic: 'water-cycle',
      segments: [
        {
          minutes: 10, say: 'Say <script>alert(1)</script> & "go"',
          cue: '<b>cue</b> & co', questions: ['Ask <i>this</i>?'],
          watchFor: 'Watch <script>bad()</script> & co',
        },
      ],
    };
    const html = printable.renderScript(hostile);
    assert.ok(!html.includes('<script'), 'no raw script tag');
    assert.ok(html.includes('&lt;script&gt;'), 'script escaped');
    assert.ok(html.includes('&amp;'), 'ampersand escaped');
    assert.ok(html.includes('&quot;'), 'quote escaped');
    assert.ok(html.includes('Total: 10 minutes'), 'total present');
  });

  test('notes with and without instructions renders', () => {
    const base = {
      title: 'Plain Notes', level: 'primary', subject: 'math', topic: 'fractions',
      objectives: ['Add fractions'], definitions: [{ term: 'Half', meaning: 'One of two equal parts' }],
      mechanismSteps: ['Find a common denominator'], workedExample: '1/2 + 1/2 = 1',
      trap: { misconception: 'Add the denominators', explanation: 'Denominators name the part size' },
    };
    const plain = printable.renderNotes(base);
    assert.ok(!plain.includes('pr-instructions'));
    const withInstr = printable.renderNotes(Object.assign({}, base, { instructions: 'Read before the lesson.' }));
    assert.ok(withInstr.includes('Read before the lesson.'));
    assert.ok(withInstr.includes('pr-instructions'));
  });

  test('script bare segment renders without cue, questions or watchFor', () => {
    const spec = {
      title: 'Bare Script', level: 'secondary', subject: 'math', topic: 'algebra',
      segments: [{ minutes: 10, say: 'Just talk.' }],
    };
    const html = printable.renderScript(spec);
    assert.ok(html.includes('Just talk.'));
    assert.ok(html.includes('Total: 10 minutes'));
    assert.ok(!html.includes('pr-cue'));
    assert.ok(!html.includes('pr-segment-questions'));
    assert.ok(!html.includes('pr-watch-for'));
  });

  test('script full segment renders cue, questions and watchFor', () => {
    const spec = {
      title: 'Full Script', level: 'secondary', subject: 'math', topic: 'algebra',
      segments: [{ minutes: 15, say: 'Explain it.', cue: 'board', questions: ['Why?'], watchFor: 'Sign errors' }],
    };
    const html = printable.renderScript(spec);
    assert.ok(html.includes('Cue: board'));
    assert.ok(html.includes('pr-segment-questions'));
    assert.ok(html.includes('Why?'));
    assert.ok(html.includes('Watch for: Sign errors'));
  });
});

describe('notes and script validation and validator resolution', () => {
  test('invalid specs throw with the invalid notes / script prefix', () => {
    assert.throws(() => printable.renderNotes({}), /invalid notes:/);
    assert.throws(() => printable.renderNotes(null), /invalid notes:/);
    assert.throws(() => printable.renderScript({}), /invalid script:/);
    assert.throws(() => printable.renderScript(null), /invalid script:/);
  });

  test('validator resolves through the AnimathValidate global when present', () => {
    globalThis.AnimathValidate = validate;
    try {
      assert.ok(printable.renderNotes(notes).includes(notes.title));
      assert.ok(printable.renderScript(script).includes(script.title));
    } finally {
      delete globalThis.AnimathValidate;
    }
  });

  test('a global validator without the functions throws the missing-validator error', () => {
    globalThis.AnimathValidate = {};
    try {
      assert.throws(() => printable.renderNotes(notes), /animath printable: player\/validate\.js is missing/);
      assert.throws(() => printable.renderScript(script), /animath printable: player\/validate\.js is missing/);
    } finally {
      delete globalThis.AnimathValidate;
    }
  });
});

describe('printable demo page', () => {
  const demo = fs.readFileSync(path.join(ROOT, 'player', 'printable-demo.html'), 'utf8');

  test('demo fetches and validates notes and script before rendering them', () => {
    assert.ok(demo.includes('samples/notes/primary-science-water-cycle.json'));
    assert.ok(demo.includes('samples/scripts/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateNotes'));
    assert.ok(demo.includes('AnimathValidate.validateScript'));
    assert.ok(demo.includes('AnimathPrintable.renderNotes'));
    assert.ok(demo.includes('AnimathPrintable.renderScript'));
    assert.ok(demo.indexOf('AnimathValidate.validateNotes') < demo.indexOf('AnimathPrintable.renderNotes'));
    assert.ok(demo.indexOf('AnimathValidate.validateScript') < demo.indexOf('AnimathPrintable.renderScript'));
  });

  test('demo fetches and validates the lesson plan before rendering it', () => {
    assert.ok(demo.includes('samples/plans/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateLessonPlan'));
    assert.ok(demo.includes('AnimathPrintable.renderLessonPlan'));
    assert.ok(demo.indexOf('AnimathValidate.validateLessonPlan') < demo.indexOf('AnimathPrintable.renderLessonPlan'));
  });

  test('demo fetches and validates diagnostics before rendering them', () => {
    assert.ok(demo.includes('samples/diagnostics/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateDiagnostics'));
    assert.ok(demo.includes('AnimathPrintable.renderDiagnostics'));
    assert.ok(demo.includes('AnimathPrintable.renderDiagnosticsAnswerKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateDiagnostics') < demo.indexOf('AnimathPrintable.renderDiagnostics'));
    assert.ok(demo.indexOf('AnimathValidate.validateDiagnostics') < demo.indexOf('AnimathPrintable.renderDiagnosticsAnswerKey'));
  });

  test('demo fetches and validates worked examples before rendering them', () => {
    assert.ok(demo.includes('samples/worked-examples/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateWorkedExamples'));
    assert.ok(demo.includes('AnimathPrintable.renderWorkedExamples'));
    assert.ok(demo.includes('AnimathPrintable.renderWorkedExamplesAnswerKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateWorkedExamples') < demo.indexOf('AnimathPrintable.renderWorkedExamples'));
    assert.ok(demo.indexOf('AnimathValidate.validateWorkedExamples') < demo.indexOf('AnimathPrintable.renderWorkedExamplesAnswerKey'));
  });

  test('demo fetches and validates the quiz bank before rendering it', () => {
    assert.ok(demo.includes('samples/quiz-banks/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateQuizBank'));
    assert.ok(demo.includes('AnimathPrintable.renderQuizBank'));
    assert.ok(demo.includes('AnimathPrintable.renderQuizBankAnswerKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateQuizBank') < demo.indexOf('AnimathPrintable.renderQuizBank'));
    assert.ok(demo.indexOf('AnimathValidate.validateQuizBank') < demo.indexOf('AnimathPrintable.renderQuizBankAnswerKey'));
  });

  test('demo fetches and validates revision before rendering it', () => {
    assert.ok(demo.includes('samples/revision/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateRevision'));
    assert.ok(demo.includes('AnimathPrintable.renderRevision'));
    assert.ok(demo.includes('AnimathPrintable.renderRevisionAnswerKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateRevision') < demo.indexOf('AnimathPrintable.renderRevision'));
    assert.ok(demo.indexOf('AnimathValidate.validateRevision') < demo.indexOf('AnimathPrintable.renderRevisionAnswerKey'));
  });

  test('demo fetches and validates scaffolds before rendering them', () => {
    assert.ok(demo.includes('samples/scaffolds/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateScaffolds'));
    assert.ok(demo.includes('AnimathPrintable.renderScaffolds'));
    assert.ok(demo.includes('AnimathPrintable.renderScaffoldsAnswerKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateScaffolds') < demo.indexOf('AnimathPrintable.renderScaffolds'));
    assert.ok(demo.indexOf('AnimathValidate.validateScaffolds') < demo.indexOf('AnimathPrintable.renderScaffoldsAnswerKey'));
  });

  test('demo fetches and validates organisers before rendering them', () => {
    assert.ok(demo.includes('samples/organisers/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateOrganisers'));
    assert.ok(demo.includes('AnimathPrintable.renderOrganisers'));
    assert.ok(demo.includes('AnimathPrintable.renderOrganisersKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateOrganisers') < demo.indexOf('AnimathPrintable.renderOrganisers'));
    assert.ok(demo.indexOf('AnimathValidate.validateOrganisers') < demo.indexOf('AnimathPrintable.renderOrganisersKey'));
  });

  test('demo fetches and validates the glossary before rendering it', () => {
    assert.ok(demo.includes('samples/glossary/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateGlossary'));
    assert.ok(demo.includes('AnimathPrintable.renderGlossary'));
    assert.ok(demo.indexOf('AnimathValidate.validateGlossary') < demo.indexOf('AnimathPrintable.renderGlossary'));
  });

  test('demo fetches and validates feedback before rendering it', () => {
    assert.ok(demo.includes('samples/feedback/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateFeedback'));
    assert.ok(demo.includes('AnimathPrintable.renderFeedback'));
    assert.ok(demo.includes('AnimathPrintable.renderFeedbackFixIts'));
    assert.ok(demo.indexOf('AnimathValidate.validateFeedback') < demo.indexOf('AnimathPrintable.renderFeedback'));
    assert.ok(demo.indexOf('AnimathValidate.validateFeedback') < demo.indexOf('AnimathPrintable.renderFeedbackFixIts'));
  });

  test('demo fetches and validates the guide before rendering it', () => {
    assert.ok(demo.includes('samples/guides/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateGuide'));
    assert.ok(demo.includes('AnimathPrintable.renderGuide'));
    assert.ok(demo.includes('AnimathPrintable.renderGuideStudent'));
    assert.ok(demo.indexOf('AnimathValidate.validateGuide') < demo.indexOf('AnimathPrintable.renderGuide'));
    assert.ok(demo.indexOf('AnimathValidate.validateGuide') < demo.indexOf('AnimathPrintable.renderGuideStudent'));
  });

  test('demo fetches and validates the scheme before rendering it', () => {
    assert.ok(demo.includes('samples/schemes/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateScheme'));
    assert.ok(demo.includes('AnimathPrintable.renderScheme'));
    assert.ok(demo.indexOf('AnimathValidate.validateScheme') < demo.indexOf('AnimathPrintable.renderScheme'));
  });

  test('demo fetches and validates the summative before rendering it', () => {
    assert.ok(demo.includes('samples/summatives/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateSummative'));
    assert.ok(demo.includes('AnimathPrintable.renderSummative'));
    assert.ok(demo.includes('AnimathPrintable.renderSummativeAnswerKey'));
    assert.ok(demo.indexOf('AnimathValidate.validateSummative') < demo.indexOf('AnimathPrintable.renderSummative'));
    assert.ok(demo.indexOf('AnimathValidate.validateSummative') < demo.indexOf('AnimathPrintable.renderSummativeAnswerKey'));
  });

  test('demo fetches and validates the homework worksheet before rendering it', () => {
    assert.ok(demo.includes('samples/homework/primary-science-water-cycle.json'));
    assert.ok(demo.includes('AnimathValidate.validateWorksheet(homework)'));
    assert.ok(demo.includes('AnimathPrintable.renderWorksheet(homework)'));
    assert.ok(demo.includes('AnimathPrintable.renderWorksheetAnswerKey(homework)'));
    assert.ok(demo.indexOf('AnimathValidate.validateWorksheet(homework)') < demo.indexOf('AnimathPrintable.renderWorksheet(homework)'));
    assert.ok(demo.indexOf('AnimathValidate.validateWorksheet(homework)') < demo.indexOf('AnimathPrintable.renderWorksheetAnswerKey(homework)'));
    const homeworkIdx = demo.indexOf('samples/homework/primary-science-water-cycle.json');
    assert.ok(demo.indexOf('AnimathValidate.validateWorksheet(homework)', homeworkIdx) > homeworkIdx);
    assert.ok(demo.indexOf('AnimathValidate.validateWorksheet(homework)', homeworkIdx) < demo.indexOf('AnimathPrintable.renderWorksheet(homework)', homeworkIdx));
  });
});

describe('printable.css print rules', () => {
  const css = fs.readFileSync(path.join(ROOT, 'player', 'printable.css'), 'utf8');

  test('print media hides screen-only controls', () => {
    assert.ok(css.includes('@media print'));
    assert.ok(/\.pr-screen-only\s*\{\s*display:\s*none/.test(css));
  });

  test('teacher sections start on a new printed page', () => {
    assert.ok(/\.pr-teacher\s*\{\s*break-before:\s*page/.test(css));
  });

  test('notes and script classes are styled', () => {
    for (const cls of ['pr-objectives', 'pr-definitions', 'pr-term', 'pr-meaning', 'pr-mechanism-steps', 'pr-worked-example', 'pr-trap', 'pr-total-minutes', 'pr-segments', 'pr-segment', 'pr-cue', 'pr-watch-for']) {
      assert.ok(css.includes('.' + cls), 'css covers .' + cls);
    }
  });

  test('accessible variant classes are styled (issue #1236)', () => {
    assert.ok(/\.pr-enlarged \.pr-title\s*\{\s*font-size:\s*32px/.test(css), 'enlarged title at 32px');
    assert.ok(/\.pr-enlarged \.pr-prompt\s*\{\s*font-size:\s*20px/.test(css), 'enlarged prompt at 20px');
    assert.ok(css.includes('.pr-enlarged .pr-instructions'), 'enlarged covers instructions');
    assert.ok(css.includes('.pr-enlarged .pr-worked-example'), 'enlarged covers worked example');
    assert.ok(/\.pr-uncluttered\s*\{\s*background:\s*#fff;\s*border:\s*none/.test(css), 'uncluttered drops sheet framing');
    assert.ok(/\.pr-uncluttered \.pr-trap\s*\{\s*border:\s*none/.test(css), 'uncluttered drops trap border');
    assert.ok(/\.pr-uncluttered \.pr-question,\s*\.pr-uncluttered \.pr-segment\s*\{\s*margin-bottom:\s*36px/.test(css), 'uncluttered widens block spacing');
  });
});

describe('lesson plan renderer (issue #1219)', () => {
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/plans/primary-science-water-cycle.json'), 'utf8'));

  test('gold lesson plan validates with zero errors and renders in full', () => {
    assert.deepEqual(validate.validateLessonPlan(plan), []);
    const html = printable.renderLessonPlan(plan);
    assert.ok(html.length > 0);
    assert.ok(html.includes('pr-sheet pr-lesson-plan'));
    assert.ok(html.includes('Lesson plan'));
    assert.ok(html.includes(plan.title), 'title present');
    assert.ok(html.includes(plan.topic), 'topic present');
    assert.ok(html.includes(plan.subject), 'subject present');
    assert.ok(html.includes('Total: ' + plan.durationMinutes + ' minutes'), 'duration present');
    for (const objective of plan.objectives) {
      assert.ok(html.includes(objective.id), 'objective id present');
      assert.ok(html.includes(objective.text), 'objective text present');
      for (const criterion of objective.successCriteria) {
        assert.ok(html.includes(criterion), 'success criterion present');
      }
      for (const point of objective.assessmentPoints) {
        assert.ok(html.includes(point), 'assessment point present');
      }
    }
    for (const activity of plan.activities) {
      assert.ok(html.includes(activity.title), 'activity title present');
      assert.ok(html.includes(activity.minutes + ' minutes'), 'activity minutes present');
    }
  });

  test('optional activity fields render only when present', () => {
    const bare = {
      title: 'Bare Plan', level: 'primary', subject: 'math', topic: 'fractions',
      durationMinutes: 10,
      objectives: [{ id: 'o1', text: 'Add fractions', successCriteria: ['I can add halves'], assessmentPoints: ['Exit answers'] }],
      activities: [{ title: 'Teach it', minutes: 10, objectiveIds: ['o1'] }],
    };
    const bareHtml = printable.renderLessonPlan(bare);
    assert.ok(bareHtml.includes('Teach it'));
    assert.ok(!bareHtml.includes('pr-script-cue'));
    assert.ok(!bareHtml.includes('pr-grouping'));
    assert.ok(!bareHtml.includes('pr-resources'));
    assert.ok(!bareHtml.includes('pr-support'));
    assert.ok(!bareHtml.includes('pr-stretch'));
    const full = {
      title: 'Full Plan', level: 'primary', subject: 'math', topic: 'fractions',
      durationMinutes: 10,
      objectives: [{ id: 'o1', text: 'Add fractions', successCriteria: ['I can add halves'], assessmentPoints: ['Exit answers'] }],
      activities: [{
        title: 'Teach it', minutes: 10, objectiveIds: ['o1'], scriptCue: 's1',
        grouping: 'pairs', resources: ['fraction wall'],
        differentiation: { support: 'Use the wall.', stretch: 'Try thirds.' },
      }],
    };
    const fullHtml = printable.renderLessonPlan(full);
    assert.ok(fullHtml.includes('Script cue: s1'));
    assert.ok(fullHtml.includes('Grouping: pairs'));
    assert.ok(fullHtml.includes('fraction wall'));
    assert.ok(fullHtml.includes('Support: Use the wall.'));
    assert.ok(fullHtml.includes('Stretch: Try thirds.'));
  });

  test('differentiation support-only, stretch-only and empty render their present fields', () => {
    function planWith(diff) {
      return {
        title: 'Diff Plan', level: 'secondary', subject: 'math', topic: 'algebra',
        durationMinutes: 5,
        objectives: [{ id: 'o1', text: 'Solve equations', successCriteria: ['I can balance'], assessmentPoints: ['Board check'] }],
        activities: [{ title: 'Drill', minutes: 5, objectiveIds: ['o1'], differentiation: diff }],
      };
    }
    const supportOnly = printable.renderLessonPlan(planWith({ support: 'Hint cards.' }));
    assert.ok(supportOnly.includes('Support: Hint cards.'));
    assert.ok(!supportOnly.includes('pr-stretch'));
    const stretchOnly = printable.renderLessonPlan(planWith({ stretch: 'Harder set.' }));
    assert.ok(stretchOnly.includes('Stretch: Harder set.'));
    assert.ok(!stretchOnly.includes('pr-support'));
    const empty = printable.renderLessonPlan(planWith({}));
    assert.ok(!empty.includes('pr-support'));
    assert.ok(!empty.includes('pr-stretch'));
  });

  test('hostile lesson plan renders escaped with no raw script tag', () => {
    const hostile = {
      title: 'Evil <script>alert("x")</script> & Co',
      level: 'primary', subject: 'science', topic: 'water-cycle',
      durationMinutes: 5,
      objectives: [{
        id: 'o<1>', text: 'Learn <b>this</b> & "that"',
        successCriteria: ['I can <script>say</script> it'], assessmentPoints: ['Ask <i>them</i>'],
      }],
      activities: [{
        title: 'Do <script>bad()</script> & co', minutes: 5, objectiveIds: ['o<1>'],
        scriptCue: '<b>cue</b>', grouping: 'pairs & "trios"', resources: ['<script>wall</script>'],
        differentiation: { support: 'Help <i>now</i>', stretch: 'More & "harder"' },
      }],
    };
    const html = printable.renderLessonPlan(hostile);
    assert.ok(!html.includes('<script'), 'no raw script tag');
    assert.ok(html.includes('&lt;script&gt;'), 'script escaped');
    assert.ok(html.includes('&amp;'), 'ampersand escaped');
    assert.ok(html.includes('&quot;'), 'quote escaped');
  });

  test('invalid lesson plans throw with the invalid lesson plan prefix', () => {
    assert.throws(() => printable.renderLessonPlan({}), /invalid lesson plan:/);
    assert.throws(() => printable.renderLessonPlan(null), /invalid lesson plan:/);
  });

  test('lesson plan validator resolves through the AnimathValidate global when present', () => {
    globalThis.AnimathValidate = validate;
    try {
      assert.ok(printable.renderLessonPlan(plan).includes(plan.title));
    } finally {
      delete globalThis.AnimathValidate;
    }
  });

  test('a global validator without validateLessonPlan throws the missing-validator error', () => {
    globalThis.AnimathValidate = {};
    try {
      assert.throws(() => printable.renderLessonPlan(plan), /animath printable: player\/validate\.js is missing/);
    } finally {
      delete globalThis.AnimathValidate;
    }
  });
});

describe('scaffolds renderer (issue #1233)', () => {
  const scaffolds = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/scaffolds/primary-science-water-cycle.json'), 'utf8'));

  test('gold scaffolds validate with zero errors and render in full', () => {
    assert.deepEqual(validate.validateScaffolds(scaffolds), []);
    const html = printable.renderScaffolds(scaffolds);
    assert.ok(html.length > 0);
    assert.ok(html.includes('pr-sheet pr-student pr-scaffolds'));
    assert.ok(html.includes('Scaffolds'));
    assert.ok(html.includes(scaffolds.title), 'title present');
    assert.ok(html.includes(scaffolds.topic), 'topic present');
    assert.ok(html.includes(scaffolds.subject), 'subject present');
    const labels = { full: 'Full', partial: 'Partial', minimal: 'Minimal' };
    for (const set of scaffolds.sets) {
      assert.ok(html.includes(labels[set.level]), 'set level label present: ' + set.level);
      for (const entry of set.wordBank) {
        assert.ok(html.includes(entry.term), 'word-bank term present: ' + entry.term);
        assert.ok(html.includes(entry.gloss), 'word-bank gloss present: ' + entry.gloss);
      }
      for (const starter of set.starters) {
        assert.ok(html.includes(starter), 'starter present');
      }
      for (const frame of set.frames) {
        assert.ok(html.includes(frame), 'frame present');
      }
      for (const item of set.cloze) {
        assert.ok(html.includes(item.text), 'cloze text present');
      }
    }
  });

  test('student sheet carries no answer-key rendering of the cloze answers', () => {
    const html = printable.renderScaffolds(scaffolds);
    assert.ok(!html.includes('pr-answer'), 'student sheet has no answer markup');
    assert.ok(!html.includes('Answer:'), 'student sheet has no Answer line');
    for (const set of scaffolds.sets) {
      for (const item of set.cloze) {
        const joined = 'Answer: ' + item.answers.join(', ');
        assert.ok(!html.includes(joined),
          'student sheet never contains the joined answers rendering: ' + joined);
      }
    }
  });

  test('teacher answer key contains every cloze answer', () => {
    const html = printable.renderScaffoldsAnswerKey(scaffolds);
    assert.ok(html.includes('pr-sheet pr-teacher pr-answer-key pr-scaffolds'));
    assert.ok(html.includes('Scaffolds answer key'));
    assert.ok(html.includes(scaffolds.title), 'title present');
    for (const set of scaffolds.sets) {
      for (const item of set.cloze) {
        assert.ok(html.includes(item.text), 'cloze text present in the key');
        for (const answer of item.answers) {
          assert.ok(html.includes(answer), 'answer present in the key: ' + answer);
        }
        assert.ok(html.includes('Answer: ' + item.answers.join(', ')),
          'joined answers line present in the key');
      }
    }
  });

  test('hostile scaffolds render escaped with no raw script tag', () => {
    const evilTerm = 'Evil <script>alert("x")</script> & Co';
    const hostile = {
      title: 'Evil <script>alert("x")</script> & Co',
      level: 'primary', subject: 'science', topic: 'water-cycle',
      sets: [
        {
          level: 'full',
          wordBank: [
            { term: evilTerm, gloss: 'A <b>bad</b> & "quoted" gloss' },
            { term: 'Plain term', gloss: 'A plain gloss' },
          ],
          starters: ['Start <script>here</script> & go'],
          frames: ['___ is <i>framed</i> & "quoted".'],
          cloze: [{ text: 'The gap is ___ here.', answers: [evilTerm] }],
        },
        {
          level: 'minimal',
          wordBank: [{ term: 'Plain term', gloss: 'A plain gloss' }],
          starters: ['Start plainly'],
          frames: ['___ is plain.'],
          cloze: [{ text: 'The plain gap is ___.', answers: ['Plain term'] }],
        },
      ],
    };
    assert.deepEqual(validate.validateScaffolds(hostile), []);
    for (const html of [printable.renderScaffolds(hostile), printable.renderScaffoldsAnswerKey(hostile)]) {
      assert.ok(!html.includes('<script'), 'no raw script tag');
      assert.ok(html.includes('&lt;script&gt;'), 'script escaped');
      assert.ok(html.includes('&amp;'), 'ampersand escaped');
      assert.ok(html.includes('&quot;'), 'quote escaped');
    }
  });

  test('invalid scaffolds throw with the invalid scaffolds prefix', () => {
    assert.throws(() => printable.renderScaffolds({}), /invalid scaffolds:/);
    assert.throws(() => printable.renderScaffolds(null), /invalid scaffolds:/);
    assert.throws(() => printable.renderScaffoldsAnswerKey({}), /invalid scaffolds:/);
    assert.throws(() => printable.renderScaffoldsAnswerKey(null), /invalid scaffolds:/);
  });

  test('scaffolds validator resolves through the AnimathValidate global when present', () => {
    globalThis.AnimathValidate = validate;
    try {
      assert.ok(printable.renderScaffolds(scaffolds).includes(scaffolds.title));
      assert.ok(printable.renderScaffoldsAnswerKey(scaffolds).includes(scaffolds.title));
    } finally {
      delete globalThis.AnimathValidate;
    }
  });

  test('a global validator without validateScaffolds throws the missing-validator error', () => {
    globalThis.AnimathValidate = {};
    try {
      assert.throws(() => printable.renderScaffolds(scaffolds), /animath printable: player\/validate\.js is missing/);
      assert.throws(() => printable.renderScaffoldsAnswerKey(scaffolds), /animath printable: player\/validate\.js is missing/);
    } finally {
      delete globalThis.AnimathValidate;
    }
  });
});

describe('accessible variants (issue #1236)', () => {
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/plans/primary-science-water-cycle.json'), 'utf8'));
  const scaffoldsGold = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples/scaffolds/primary-science-water-cycle.json'), 'utf8'));
  const ALL_FALSE = { enlargedPrint: false, unclutteredLayout: false, chunkInstructions: false };
  const variantWorksheet = {
    title: 'Variant Worksheet',
    level: 'primary', subject: 'math', topic: 'fractions',
    instructions: 'Read the question. Choose one answer. Show your working!',
    questions: [
      { id: 'q1', kind: 'multiple-choice', prompt: 'What is half of 4?', choices: [{ text: '2', correct: true }, { text: '3' }] },
    ],
  };

  const PIN_STUDENT_DEFAULT = [
    "<section class=\"pr-sheet pr-student pr-worksheet\">",
    "<h1 class=\"pr-title\">Variant Worksheet</h1>",
    "<p class=\"pr-meta\">math · fractions · primary</p>",
    "<p class=\"pr-kind\">Worksheet</p>",
    "<p class=\"pr-instructions\">Read the question. Choose one answer. Show your working!</p>",
    "<ol class=\"pr-questions\">",
    "<li class=\"pr-question\">",
    "<p class=\"pr-prompt\">What is half of 4?</p>",
    "<ul class=\"pr-choices\">",
    "<li class=\"pr-choice\">2</li>",
    "<li class=\"pr-choice\">3</li>",
    "</ul>",
    "</li>",
    "</ol>",
    "</section>"
  ].join('\n');
  const PIN_KEY_DEFAULT = [
    "<section class=\"pr-sheet pr-teacher pr-answer-key pr-worksheet\">",
    "<h1 class=\"pr-title\">Variant Worksheet</h1>",
    "<p class=\"pr-meta\">math · fractions · primary</p>",
    "<p class=\"pr-kind\">Worksheet answer key</p>",
    "<p class=\"pr-instructions\">Read the question. Choose one answer. Show your working!</p>",
    "<ol class=\"pr-questions\">",
    "<li class=\"pr-question\">",
    "<p class=\"pr-prompt\">What is half of 4?</p>",
    "<p class=\"pr-answer\">Answer: 2</p>",
    "</li>",
    "</ol>",
    "</section>"
  ].join('\n');
  const PIN_STUDENT_ENLARGED = [
    "<section class=\"pr-sheet pr-student pr-worksheet pr-enlarged\">",
    "<h1 class=\"pr-title\">Variant Worksheet</h1>",
    "<p class=\"pr-meta\">math · fractions · primary</p>",
    "<p class=\"pr-kind\">Worksheet</p>",
    "<p class=\"pr-instructions\">Read the question. Choose one answer. Show your working!</p>",
    "<ol class=\"pr-questions\">",
    "<li class=\"pr-question\">",
    "<p class=\"pr-prompt\">What is half of 4?</p>",
    "<ul class=\"pr-choices\">",
    "<li class=\"pr-choice\">2</li>",
    "<li class=\"pr-choice\">3</li>",
    "</ul>",
    "</li>",
    "</ol>",
    "</section>"
  ].join('\n');
  const PIN_STUDENT_UNCLUTTERED = [
    "<section class=\"pr-sheet pr-student pr-worksheet pr-uncluttered\">",
    "<h1 class=\"pr-title\">Variant Worksheet</h1>",
    "<p class=\"pr-meta\">math · fractions · primary</p>",
    "<p class=\"pr-kind\">Worksheet</p>",
    "<p class=\"pr-instructions\">Read the question. Choose one answer. Show your working!</p>",
    "<ol class=\"pr-questions\">",
    "<li class=\"pr-question\">",
    "<p class=\"pr-prompt\">What is half of 4?</p>",
    "<ul class=\"pr-choices\">",
    "<li class=\"pr-choice\">2</li>",
    "<li class=\"pr-choice\">3</li>",
    "</ul>",
    "</li>",
    "</ol>",
    "</section>"
  ].join('\n');
  const PIN_STUDENT_CHUNKED = [
    "<section class=\"pr-sheet pr-student pr-worksheet\">",
    "<h1 class=\"pr-title\">Variant Worksheet</h1>",
    "<p class=\"pr-meta\">math · fractions · primary</p>",
    "<p class=\"pr-kind\">Worksheet</p>",
    "<ul class=\"pr-instructions pr-instructions-chunked\">",
    "<li class=\"pr-instruction\">Read the question.</li>",
    "<li class=\"pr-instruction\">Choose one answer.</li>",
    "<li class=\"pr-instruction\">Show your working!</li>",
    "</ul>",
    "<ol class=\"pr-questions\">",
    "<li class=\"pr-question\">",
    "<p class=\"pr-prompt\">What is half of 4?</p>",
    "<ul class=\"pr-choices\">",
    "<li class=\"pr-choice\">2</li>",
    "<li class=\"pr-choice\">3</li>",
    "</ul>",
    "</li>",
    "</ol>",
    "</section>"
  ].join('\n');
  const PIN_STUDENT_COMBINED = [
    "<section class=\"pr-sheet pr-student pr-worksheet pr-enlarged pr-uncluttered\">",
    "<h1 class=\"pr-title\">Variant Worksheet</h1>",
    "<p class=\"pr-meta\">math · fractions · primary</p>",
    "<p class=\"pr-kind\">Worksheet</p>",
    "<ul class=\"pr-instructions pr-instructions-chunked\">",
    "<li class=\"pr-instruction\">Read the question.</li>",
    "<li class=\"pr-instruction\">Choose one answer.</li>",
    "<li class=\"pr-instruction\">Show your working!</li>",
    "</ul>",
    "<ol class=\"pr-questions\">",
    "<li class=\"pr-question\">",
    "<p class=\"pr-prompt\">What is half of 4?</p>",
    "<ul class=\"pr-choices\">",
    "<li class=\"pr-choice\">2</li>",
    "<li class=\"pr-choice\">3</li>",
    "</ul>",
    "</li>",
    "</ol>",
    "</section>"
  ].join('\n');

  function worksheetWithInstructions(instructions) {
    return {
      title: 'Chunk Worksheet', level: 'primary', subject: 'math', topic: 'fractions',
      instructions: instructions,
      questions: [{ id: 'q1', kind: 'short-answer', prompt: 'What is half of 4?', answer: '2' }],
    };
  }

  function chunkCount(html) {
    return (html.match(/<li class="pr-instruction">/g) || []).length;
  }

  test('default rendering is byte-identical with empty, all-false, null and undefined options on every renderer', () => {
    const cases = [
      [printable.renderWorksheet, worksheet],
      [printable.renderWorksheetAnswerKey, worksheet],
      [printable.renderExitTicket, ticket],
      [printable.renderExitTicketAnswerKey, ticket],
      [printable.renderNotes, notes],
      [printable.renderScript, script],
      [printable.renderLessonPlan, plan],
      [printable.renderScaffolds, scaffoldsGold],
      [printable.renderScaffoldsAnswerKey, scaffoldsGold],
    ];
    for (const [fn, spec] of cases) {
      assert.equal(fn(spec, {}), fn(spec));
      assert.equal(fn(spec, ALL_FALSE), fn(spec));
      assert.equal(fn(spec, null), fn(spec));
      assert.equal(fn(spec, undefined), fn(spec));
    }
  });

  test('full-string pins captured from pre-change code: synthetic worksheet with no options', () => {
    assert.equal(printable.renderWorksheet(variantWorksheet), PIN_STUDENT_DEFAULT);
    assert.equal(printable.renderWorksheetAnswerKey(variantWorksheet), PIN_KEY_DEFAULT);
  });

  test('full-string pins: each variant alone and all three combined on the student sheet', () => {
    assert.equal(printable.renderWorksheet(variantWorksheet, { enlargedPrint: true }), PIN_STUDENT_ENLARGED);
    assert.equal(printable.renderWorksheet(variantWorksheet, { unclutteredLayout: true }), PIN_STUDENT_UNCLUTTERED);
    assert.equal(printable.renderWorksheet(variantWorksheet, { chunkInstructions: true }), PIN_STUDENT_CHUNKED);
    assert.equal(printable.renderWorksheet(variantWorksheet, { enlargedPrint: true, unclutteredLayout: true, chunkInstructions: true }), PIN_STUDENT_COMBINED);
  });

  test('enlarged and uncluttered outputs equal the default with only the section class replaced', () => {
    const base = printable.renderWorksheet(variantWorksheet);
    assert.equal(
      printable.renderWorksheet(variantWorksheet, { enlargedPrint: true }),
      base.replace('pr-sheet pr-student pr-worksheet', 'pr-sheet pr-student pr-worksheet pr-enlarged'));
    assert.equal(
      printable.renderWorksheet(variantWorksheet, { unclutteredLayout: true }),
      base.replace('pr-sheet pr-student pr-worksheet', 'pr-sheet pr-student pr-worksheet pr-uncluttered'));
    const both = printable.renderWorksheet(variantWorksheet, { enlargedPrint: true, unclutteredLayout: true });
    assert.ok(both.startsWith('<section class="pr-sheet pr-student pr-worksheet pr-enlarged pr-uncluttered">'),
      'fixed class order: pr-enlarged before pr-uncluttered');
    assert.equal(both,
      base.replace('pr-sheet pr-student pr-worksheet', 'pr-sheet pr-student pr-worksheet pr-enlarged pr-uncluttered'));
  });

  test('each flag works independently on the answer key and chunking adds no class', () => {
    const key = printable.renderWorksheetAnswerKey(variantWorksheet, { enlargedPrint: true });
    assert.ok(key.includes('<section class="pr-sheet pr-teacher pr-answer-key pr-worksheet pr-enlarged">'));
    assert.ok(!key.includes('pr-uncluttered'));
    const keyUncluttered = printable.renderWorksheetAnswerKey(variantWorksheet, { unclutteredLayout: true });
    assert.ok(keyUncluttered.includes('<section class="pr-sheet pr-teacher pr-answer-key pr-worksheet pr-uncluttered">'));
    assert.ok(!keyUncluttered.includes('pr-enlarged'));
    const keyChunked = printable.renderWorksheetAnswerKey(variantWorksheet, { chunkInstructions: true });
    assert.ok(keyChunked.includes('<section class="pr-sheet pr-teacher pr-answer-key pr-worksheet">'));
    assert.ok(keyChunked.includes('<ul class="pr-instructions pr-instructions-chunked">'));
    assert.equal(chunkCount(keyChunked), 3);
    assert.ok(!keyChunked.includes('<p class="pr-instructions">'));
  });

  test('chunking splits on question and exclamation terminators and keeps the punctuation', () => {
    const html = printable.renderWorksheet(
      worksheetWithInstructions('Are you sure? Yes you are! Good.'), { chunkInstructions: true });
    assert.equal(chunkCount(html), 3);
    assert.ok(html.includes('<li class="pr-instruction">Are you sure?</li>'));
    assert.ok(html.includes('<li class="pr-instruction">Yes you are!</li>'));
    assert.ok(html.includes('<li class="pr-instruction">Good.</li>'));
  });

  test('chunking a single sentence and a sentence with no terminator each give one chunk', () => {
    const single = printable.renderWorksheet(worksheetWithInstructions('Just do it.'), { chunkInstructions: true });
    assert.equal(chunkCount(single), 1);
    assert.ok(single.includes('<li class="pr-instruction">Just do it.</li>'));
    const bare = printable.renderWorksheet(worksheetWithInstructions('Just do it'), { chunkInstructions: true });
    assert.equal(chunkCount(bare), 1);
    assert.ok(bare.includes('<li class="pr-instruction">Just do it</li>'));
  });

  test('chunking does not split decimals or abbreviations but splits before a digit', () => {
    const decimal = printable.renderWorksheet(
      worksheetWithInstructions('Use 1.5 litres. Then stir it well.'), { chunkInstructions: true });
    assert.equal(chunkCount(decimal), 2);
    assert.ok(decimal.includes('<li class="pr-instruction">Use 1.5 litres.</li>'));
    const abbrev = printable.renderWorksheet(
      worksheetWithInstructions('Pick a fruit, e.g. an apple. Eat it now.'), { chunkInstructions: true });
    assert.equal(chunkCount(abbrev), 2);
    assert.ok(abbrev.includes('<li class="pr-instruction">Pick a fruit, e.g. an apple.</li>'));
    const digit = printable.renderWorksheet(
      worksheetWithInstructions('Count the blocks. 3 are red.'), { chunkInstructions: true });
    assert.equal(chunkCount(digit), 2);
    assert.ok(digit.includes('<li class="pr-instruction">3 are red.</li>'));
  });

  test('chunking with no instructions is a no-op and empty instructions render nothing', () => {
    const noInstr = worksheetWithInstructions('x');
    delete noInstr.instructions;
    assert.equal(printable.renderWorksheet(noInstr, { chunkInstructions: true }), printable.renderWorksheet(noInstr));
    assert.ok(!printable.renderWorksheet(noInstr, { chunkInstructions: true }).includes('pr-instructions'));
    const empty = printable.renderWorksheet(worksheetWithInstructions(''), { chunkInstructions: true });
    assert.ok(!empty.includes('pr-instructions'));
  });

  test('hostile HTML inside a chunked sentence is escaped per sentence', () => {
    const html = printable.renderWorksheet(
      worksheetWithInstructions('Use <b>bold</b> & "care". Then stop.'), { chunkInstructions: true });
    assert.ok(!html.includes('<b>bold</b>'));
    assert.ok(html.includes('<li class="pr-instruction">Use &lt;b&gt;bold&lt;/b&gt; &amp; &quot;care&quot;.</li>'));
    assert.ok(html.includes('<li class="pr-instruction">Then stop.</li>'));
  });

  test('truthy non-true flags are off, unknown keys are ignored and a non-object argument is all-off', () => {
    const base = printable.renderWorksheet(variantWorksheet);
    assert.equal(printable.renderWorksheet(variantWorksheet, { enlargedPrint: 1 }), base);
    assert.equal(printable.renderWorksheet(variantWorksheet, { enlargedPrint: 'yes' }), base);
    assert.equal(printable.renderWorksheet(variantWorksheet, { chunkInstructions: 1 }), base);
    assert.equal(printable.renderWorksheet(variantWorksheet, { bogus: true }), base);
    assert.equal(printable.renderWorksheet(variantWorksheet, 'yes'), base);
    assert.equal(printable.renderWorksheet(variantWorksheet, 42), base);
  });

  test('options apply on notes, script, lesson plan and scaffolds renders', () => {
    const notesHtml = printable.renderNotes(notes, { enlargedPrint: true });
    assert.ok(notesHtml.includes('<section class="pr-sheet pr-notes pr-enlarged">'));
    const scriptHtml = printable.renderScript(script, { unclutteredLayout: true });
    assert.ok(scriptHtml.includes('<section class="pr-sheet pr-script pr-uncluttered">'));
    const planHtml = printable.renderLessonPlan(plan, { enlargedPrint: true, unclutteredLayout: true });
    assert.ok(planHtml.includes('<section class="pr-sheet pr-lesson-plan pr-enlarged pr-uncluttered">'));
    const exitHtml = printable.renderExitTicket(ticket, { enlargedPrint: true });
    assert.ok(exitHtml.includes('<section class="pr-sheet pr-student pr-exit-ticket pr-enlarged">'));
  });

  test('scaffolds variant classes land on the outer section only, never on the inner sets', () => {
    for (const [fn, kindClass] of [
      [printable.renderScaffolds, 'pr-sheet pr-student pr-scaffolds'],
      [printable.renderScaffoldsAnswerKey, 'pr-sheet pr-teacher pr-answer-key pr-scaffolds'],
    ]) {
      const html = fn(scaffoldsGold, { enlargedPrint: true, unclutteredLayout: true });
      assert.ok(html.includes('<section class="' + kindClass + ' pr-enlarged pr-uncluttered">'), 'outer section carries the variants');
      const innerCount = (html.match(/<section class="pr-scaffold-set">/g) || []).length;
      assert.equal(innerCount, scaffoldsGold.sets.length, 'every inner set section is unclassed');
      assert.ok(!html.includes('pr-scaffold-set pr-'), 'no inner set carries a variant class');
    }
  });

  test('chunking applies in the notes header', () => {
    const chunkNotes = {
      title: 'Chunk Notes', level: 'primary', subject: 'math', topic: 'fractions',
      instructions: 'Read these notes first. Keep them open during practice!',
      objectives: ['Add fractions'],
      definitions: [{ term: 'Half', meaning: 'One of two equal parts' }],
      mechanismSteps: ['Find a common denominator'],
      workedExample: '1/2 + 1/2 = 1',
      trap: { misconception: 'Add the denominators', explanation: 'Denominators name the part size' },
    };
    const html = printable.renderNotes(chunkNotes, { chunkInstructions: true });
    assert.equal(chunkCount(html), 2);
    assert.ok(html.includes('<li class="pr-instruction">Read these notes first.</li>'));
    assert.ok(html.includes('<li class="pr-instruction">Keep them open during practice!</li>'));
    assert.ok(!html.includes('<p class="pr-instructions">'));
  });

  test('validation still throws on an invalid spec when options are passed', () => {
    assert.throws(() => printable.renderWorksheet({}, { enlargedPrint: true }), /invalid worksheet:/);
    assert.throws(() => printable.renderNotes(null, { chunkInstructions: true }), /invalid notes:/);
    assert.throws(() => printable.renderScaffolds({}, { unclutteredLayout: true }), /invalid scaffolds:/);
  });
});
