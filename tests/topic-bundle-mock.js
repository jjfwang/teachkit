'use strict';
// Shared deterministic mock LLM for topic-bundle tests (factored out of
// tests/topic-bundle.test.js for #1648): authors every artifact from the
// frozen blueprint summary carried in the stage prompt. No real provider.
const fs = require('node:fs');
const path = require('node:path');

const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'topic-blueprints.json'), 'utf8'));

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function requestFor(level, overrides) {
  const request = clone(fixtures[level].request);
  if (overrides) Object.assign(request, overrides);
  return request;
}
function contentFor(level) { return clone(fixtures[level].content); }

// Deterministic mock LLM: authors every artifact from the frozen
// blueprint summary carried in the stage prompt. No real provider.
function makeMock(fixtureLevel, options) {
  const opts = options || {};
  const calls = {};
  const scopeOf = (user) => user.blueprint.scope;
  const rationale = (i) => ({
    chose: 'Selected a distractor value.',
    thinks: 'Applied the wrong scaling rule.',
    reteach: 'Revisit the frozen worked example steps.'
  });
  function diagnostics(user, restricted) {
    const bp = user.blueprint;
    const ex = bp.content.examples;
    const obj = bp.objectives;
    const mc = (id, objectiveId, example, withCue) => ({
      id, prompt: 'Which option gives the worked answer for ' + example.id + '?',
      kind: 'multiple-choice', objectiveId, exampleId: example.id,
      ...(withCue ? { scriptCue: 'Pause after the worked example.' } : {}),
      choices: [
        { text: example.answer, correct: true },
        { text: 'Not the worked answer A', correct: false, misconception: 'scale-both', rationale: rationale(1) },
        { text: 'Not the worked answer B', correct: false, misconception: 'scale-both', rationale: rationale(2) }
      ]
    });
    return {
      title: 'Diagnostics', level: scopeOf(user).level, subject: scopeOf(user).subject, topic: scopeOf(user).topicId,
      doNow: [mc('diag-1', obj[0].objectiveId, ex[0], false), mc('diag-2', restricted ? obj[0].objectiveId : obj[1].objectiveId, ex[1] || ex[0], false)],
      hingeQuestions: [mc('diag-h1', restricted ? obj[0].objectiveId : obj[1].objectiveId, ex[1] || ex[0], true)]
    };
  }
  function worksheet(user, wrongAnswer, restricted) {
    const bp = user.blueprint;
    const ex = bp.content.examples;
    const obj = bp.objectives;
    return {
      title: 'Worksheet', level: scopeOf(user).level, subject: scopeOf(user).subject, topic: scopeOf(user).topicId,
      questions: [
        { id: 'ws-1', kind: 'short-answer', prompt: 'Work the first example and give the answer.',
          objective: obj[0].objectiveId, objectiveId: obj[0].objectiveId, exampleId: ex[0].id,
          answer: wrongAnswer ? 'A deliberately wrong answer.' : ex[0].answer,
          explanation: 'Follows the frozen worked example.', marks: 2 },
        { id: 'ws-2', kind: 'short-answer', prompt: 'Work the second example and give the answer.',
          ...(restricted ? {} : { objective: obj[1].objectiveId, objectiveId: obj[1].objectiveId }),
          exampleId: ex[1] ? ex[1].id : ex[0].id,
          answer: (ex[1] || ex[0]).answer, explanation: 'Follows the frozen worked example.', marks: 2 }
      ]
    };
  }
  function exitTicket(user, restricted) {
    const bp = user.blueprint;
    const ex = bp.content.examples;
    const obj = bp.objectives;
    return {
      title: 'Exit Ticket', level: scopeOf(user).level, subject: scopeOf(user).subject, topic: scopeOf(user).topicId,
      questions: [
        { id: 'et-1', kind: 'short-answer', prompt: 'Give the first worked answer.', objectiveId: obj[0].objectiveId,
          exampleId: ex[0].id, answer: ex[0].answer, feedback: 'Matches the frozen example.' },
        { id: 'et-2', kind: 'short-answer', prompt: 'Give the second worked answer.', objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId,
          exampleId: ex[1] ? ex[1].id : ex[0].id, answer: (ex[1] || ex[0]).answer, feedback: 'Matches the frozen example.' },
        { id: 'et-3', kind: 'multiple-choice', prompt: 'Which option is the second worked answer?', objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId,
          choices: [{ text: (ex[1] || ex[0]).answer, correct: true }, { text: 'Not the worked answer', correct: false }],
          feedback: 'Matches the frozen example.' }
      ]
    };
  }
  async function callChat(system, userJson) {
    const user = JSON.parse(userJson);
    calls[user.stage] = (calls[user.stage] || 0) + 1;
    if (opts.badJsonAlways === user.stage) return 'this is not json {';
    if (opts.badJsonOnce === user.stage && calls[user.stage] === 1) return 'this is not json {';
    const bp = user.blueprint;
    const scope = bp ? bp.scope : null;
    const problems = (user.problems || []).join(' ');
    const restricted = opts.unassessedOnce && !/not assessed/.test(problems);
    let doc;
    if (user.stage === 'blueprint') {
      doc = contentFor(fixtureLevel);
    } else if (user.stage === 'lessonPlan') {
      doc = { title: 'Lesson Plan', level: scope.level, subject: scope.subject, topic: scope.topicId,
        durationMinutes: bp.parameters.durationMinutes,
        objectives: bp.objectives.map((o) => ({ id: o.objectiveId, text: o.text,
          successCriteria: ['Shows ' + o.objectiveId + ' in work.'], assessmentPoints: ['Answers the check for ' + o.objectiveId + '.'] })),
        activities: bp.content.beats.map((beat) => ({ title: beat.kind + ' beat', minutes: beat.durationSeconds / 60,
          objectiveIds: beat.objectiveIds, scriptCue: 'Teach beat ' + beat.beatId + '.' })) };
    } else if (user.stage === 'slides') {
      const beats = bp.content.beats;
      const kinds = ['title', 'objective', 'concept', 'example', 'practice', 'exit-ticket'];
      const beatFor = [beats[0], beats[0], beats[1], beats[1], beats[3], beats[4]];
      const dangling = opts.danglingScene === 'always' || (opts.danglingScene === 'once' && !/dangling/.test(problems));
      doc = { title: 'Slides', level: scope.level, subject: scope.subject, topic: scope.topicId,
        slides: kinds.map((kind, i) => ({ kind, heading: kind + ' slide', bullets: ['Point for ' + kind + '.'],
          beatId: beatFor[i].beatId, objectiveIds: beatFor[i].objectiveIds,
          ...(kind === 'example' ? { visual: dangling ? 'missing-scene' : { kind: 'rect', label: 'Worked example visual' } } : {}) })) };
    } else if (user.stage === 'animation') {
      doc = { animath: '0.1', title: 'Animation', level: scope.level, subject: scope.subject, topic: scope.topicId,
        kind: 'concept', canvas: { width: 1280, height: 720 },
        scenes: [{ id: 'fraction-bar-scene', caption: 'Two equal bars split into parts.',
          narration: 'The shaded quantities match.', duration_ms: 8000,
          steps: [
            { at_ms: 0, do: 'show', shape: { id: 'bar-one', kind: 'rect', x: 100, y: 200, w: 400, h: 80 } },
            { at_ms: 1000, do: 'show', shape: { id: 'bar-two', kind: 'rect', x: 100, y: 400, w: 400, h: 80 } },
            { at_ms: 2000, do: 'caption', text: 'The shaded quantities match.' } ] }] };
    } else if (user.stage === 'diagnostics') {
      doc = diagnostics(user, restricted);
    } else if (user.stage === 'worksheet') {
      const wrong = opts.badWorksheetAnswer === 'always' ||
        (opts.badWorksheetAnswer === 'once' && !/answer/.test(problems));
      doc = worksheet(user, wrong, restricted);
    } else if (user.stage === 'exitTicket') {
      doc = exitTicket(user, restricted);
    } else if (user.stage === 'quizBank') {
      const ex = bp.content.examples;
      const obj = bp.objectives;
      doc = { title: 'Quiz Bank', level: scope.level, subject: scope.subject, topic: scope.topicId,
        items: [
          { prompt: 'First worked answer?', answer: ex[0].answer, objectiveId: restricted ? obj[0].objectiveId : obj[0].objectiveId, exampleId: ex[0].id },
          { prompt: 'Second worked answer?', answer: (ex[1] || ex[0]).answer, objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId, exampleId: ex[1] ? ex[1].id : ex[0].id },
          { prompt: 'What must stay the same when scaling?', answer: 'The scaling factor for numerator and denominator.', objectiveId: restricted ? obj[0].objectiveId : obj[1].objectiveId },
          { prompt: 'What does the first objective ask for?', answer: obj[0].text, objectiveId: obj[0].objectiveId } ] };
    } else if (user.stage === 'visuals') {
      const visuals = [];
      bp.content.beats.forEach((beat) => {
        if (beat.visual === 'none') return;
        if (opts.slideFirstVisuals) {
          visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'slide-first', slideIndex: 0 });
        } else if (beat.visual === 'diagram') {
          visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'diagram', diagram: 'Diagram for beat ' + beat.beatId + '.' });
        } else if (beat.visual === 'animation') {
          if (user.mode === 'extended') {
            visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'animation', sceneId: 'fraction-bar-scene' });
          } else {
            visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'animation', fallback: 'diagram', diagram: 'Diagram fallback for beat ' + beat.beatId + '.' });
          }
        } else if (beat.visual === 'simulation') {
          visuals.push({ visualId: 'vis-' + beat.beatId, beatId: beat.beatId, requested: 'simulation', model: 'fraction-bars', exampleId: (bp.content.examples[1] || bp.content.examples[0]).id });
        }
      });
      doc = { visuals };
      if (!opts.slideFirstVisuals && bp.content.beats.some((beat) => beat.visual === 'simulation')) {
        const wrongDefaults = opts.badSimulationOnce && !/does not match frozen quantity/.test(problems);
        doc.simulation = { simulation: '0.2', model: 'fraction-bars', title: 'Fraction Bars', level: 'primary', subject: 'math', topic: 'fractions',
          disclaimer: 'A teaching model for equal wholes; it does not measure real objects.',
          parameters: [
            { id: 'numerator', label: 'Numerator', min: 0, max: 4, step: 1, default: wrongDefaults ? 1 : 2 },
            { id: 'denominator', label: 'Denominator', min: 1, max: 6, step: 1, default: wrongDefaults ? 2 : 3 } ],
          beats: [
            { id: 'split', label: 'Split the bar', narration: 'Split the whole into equal parts.' },
            { id: 'shade', label: 'Shade the parts', narration: 'Shade the numerator parts.' } ],
          check: { question: 'Which fraction is shaded?', options: ['2/3', '4/6'], correctIndex: 1,
            explanation: 'Two of three parts equals four of six parts.' } };
      }
    } else {
      throw new Error('mock: unknown stage ' + user.stage);
    }
    return JSON.stringify(doc);
  }
  return { callChat, calls };
}

module.exports = { makeMock, requestFor, contentFor, clone };
