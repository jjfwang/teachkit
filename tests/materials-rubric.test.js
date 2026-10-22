/* Materials rubric tests (issue #1238, slice 2 of #1235) — scoreMaterial
 * over student-facing text only, with the Flesch reading-age heuristic.
 * All expected numbers below are computed by hand from the documented
 * formula in generator/materials-rubric.js, not copied from the code. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const ROOT = path.join(__dirname, '..');
const {
  scoreMaterial,
  extractStudentText,
  INTERNALS,
} = require('../generator/materials-rubric.js');
const { countSyllables, readingAge } = INTERNALS;

const TRAP = 'Photosynthesis mitochondria specialisation';

function dim(result, key) {
  return result.dimensions.find((d) => d.key === key);
}

test('countSyllables pins the brief worked words', () => {
  const pins = {
    cat: 1, the: 1, water: 2, table: 2, fraction: 2, observe: 2,
    walked: 1, wanted: 2, energy: 3, photosynthesis: 5, mitochondria: 5,
  };
  for (const [word, n] of Object.entries(pins)) {
    assert.equal(countSyllables(word), n, word);
  }
});

test('countSyllables rule edges: silent e, -ed/-es adjustments, floors', () => {
  assert.equal(countSyllables(''), 0); // empty after stripping
  assert.equal(countSyllables('!!!'), 0); // no a-z letters
  assert.equal(countSyllables('whale'), 1); // trailing e dropped (le after a vowel)
  assert.equal(countSyllables('bcdfg'), 1); // no vowel runs: minimum 1
  assert.equal(countSyllables('added'), 2); // -ed after d: no subtraction
  assert.equal(countSyllables('makes'), 1); // -es after k: subtract 1
  assert.equal(countSyllables('passes'), 2); // -es after s: no subtraction
  assert.equal(countSyllables('boxes'), 2); // -es after x: no subtraction
  assert.equal(countSyllables('buzzes'), 2); // -es after z: no subtraction
  assert.equal(countSyllables('watches'), 2); // -es after ch: no subtraction
  assert.equal(countSyllables('washes'), 2); // -es after sh: no subtraction
  assert.equal(countSyllables('Water!'), 2); // case and punctuation stripped
});

/* Reading-age arithmetic, by hand from the documented formula
 * ease = 206.835 - 1.015*(W/S) - 84.6*(Y/W); grade = clamp(round1((110-ease)/10), 3, 18);
 * ageLow = max(5, round(grade)+5).
 *
 * "The cat sat on the mat.": W=6, S=1, Y=6 (every word 1 syllable).
 *   ease = 206.835 - 6.09 - 84.6 = 116.145 -> 116.1; grade = -0.6 -> clamped 3.0; age 8-9; band 4.
 * "Increasing the concentration ... container.": W=18, S=1, Y=33.
 *   ease = 206.835 - 18.27 - 84.6*(33/18) = 206.835 - 18.27 - 155.1 = 33.465 -> 33.5;
 *   grade = 7.6535 -> 7.7; age 13-14; band 3.
 * "The evaporation of water ... energy.": W=20, S=1, Y=40.
 *   ease = 206.835 - 20.3 - 169.2 = 17.335 -> 17.3; grade = 9.2665 -> 9.3; age 14-15; band 2.
 * "The evaporation of surface water ... reservoir.": W=21, S=1, Y=45.
 *   ease = 206.835 - 21.315 - 84.6*(45/21) = 4.234 -> 4.2; grade = 10.5766 -> 10.6; age 16-17; band 1.
 * "Photosynthesis in mitochondria ... communication.": W=13, S=1, Y=49
 *   (5+1+5+3+5+4+5+1+5+4+5+1+5 word by word).
 *   ease = 206.835 - 13.195 - 84.6*(49/13) = -125.191 -> -125.2;
 *   grade = 23.5 -> clamped 18.0; age 23-24; band 0.
 */
test('readingAge pins one fixture per band, computed from the formula', () => {
  const cases = [
    { texts: ['The cat sat on the mat.'], words: 6, sentences: 1, syllables: 6, ease: 116.1, grade: 3.0, ageLow: 8, score: 4 },
    { texts: ['Increasing the concentration of the solution affects the rate at which the particles distribute themselves throughout the container.'], words: 18, sentences: 1, syllables: 33, ease: 33.5, grade: 7.7, ageLow: 13, score: 3 },
    { texts: ['The evaporation of water from the surface of the ocean represents a significant mechanism in the global distribution of energy.'], words: 20, sentences: 1, syllables: 40, ease: 17.3, grade: 9.3, ageLow: 14, score: 2 },
    { texts: ['The evaporation of surface water during periods of elevated temperature reduces the volume of water available for collection in the reservoir.'], words: 21, sentences: 1, syllables: 45, ease: 4.2, grade: 10.6, ageLow: 16, score: 1 },
    { texts: ['Photosynthesis in mitochondria demonstrates extraordinary biochemical specialisation through sophisticated molecular organisation and communication.'], words: 13, sentences: 1, syllables: 49, ease: -125.2, grade: 18.0, ageLow: 23, score: 0 },
  ];
  for (const c of cases) {
    const ra = readingAge(c.texts);
    assert.equal(ra.words, c.words);
    assert.equal(ra.sentences, c.sentences);
    assert.equal(ra.syllables, c.syllables);
    assert.equal(Math.round(ra.ease * 10) / 10, c.ease);
    assert.equal(ra.grade, c.grade);
    assert.equal(ra.ageLow, c.ageLow);
    assert.equal(ra.ageHigh, c.ageLow + 1);
    assert.equal(ra.score, c.score);
    assert.equal(ra.note, `Reading age about ${c.ageLow}-${c.ageLow + 1} (Flesch grade ${c.grade.toFixed(1)}, ease ${c.ease.toFixed(1)}) over ${c.words} words in ${c.sentences} sentences.`);
  }
});

test('readingAge: sentence splitting, no terminator, empty input', () => {
  const multi = readingAge(['Wait! Really? Yes.']);
  assert.equal(multi.sentences, 3);
  assert.equal(multi.words, 3);
  const bare = readingAge(['just some words']);
  assert.equal(bare.sentences, 1);
  assert.equal(readingAge([]), null);
  assert.equal(readingAge(['', '   ']), null);
  const mixed = readingAge([42, null, 'The cat sat on the mat.']);
  assert.equal(mixed.words, 6); // non-string and empty entries ignored
});

test('worksheet extraction: instructions then prompts, in order', () => {
  const ext = extractStudentText({
    instructions: 'Answer all questions.',
    questions: [{ prompt: 'What is half of ten?' }, { prompt: 'Add two and three.' }],
  });
  assert.equal(ext.kind, 'worksheet');
  assert.deepEqual(ext.fieldsUsed, ['instructions', 'questions']);
  assert.deepEqual(ext.texts, ['Answer all questions.', 'What is half of ten?', 'Add two and three.']);
});

test('exit-ticket kind comes from the kind field, not the shape', () => {
  const ext = extractStudentText({ kind: 'exit-ticket', questions: [{ prompt: 'One thing you learned?' }] });
  assert.equal(ext.kind, 'exit-ticket');
  assert.deepEqual(ext.texts, ['One thing you learned?']);
  assert.equal(scoreMaterial({ kind: 'exit-ticket', questions: [{ prompt: 'One thing?' }] }).kind, 'exit-ticket');
});

test('worksheet extraction skips non-object questions and non-string prompts', () => {
  const ext = extractStudentText({
    instructions: 42,
    questions: [null, 'nope', { prompt: 7 }, { prompt: 'Real prompt.' }],
  });
  assert.deepEqual(ext.texts, ['Real prompt.']);
});

test('teacher text never leaks from a worksheet (top-level and per-question)', () => {
  const material = {
    instructions: 'Try each one.',
    markScheme: { points: [{ text: TRAP, marks: 1 }] },
    workedSolution: TRAP,
    questions: [{
      prompt: 'What is half of ten?',
      answer: TRAP, answers: [TRAP], correctAnswer: TRAP,
      markScheme: { points: [{ text: TRAP, marks: 1 }] },
      workedSolution: TRAP,
    }],
  };
  const ext = extractStudentText(material);
  assert.deepEqual(ext.texts, ['Try each one.', 'What is half of ten?']);
  const before = scoreMaterial(material);
  const clean = scoreMaterial({ instructions: 'Try each one.', questions: [{ prompt: 'What is half of ten?' }] });
  assert.deepEqual(before.stats, clean.stats); // traps changed nothing
});

test('notes extraction uses the gold field names and joins term to definition', () => {
  const ext = extractStudentText({
    title: 'Water Cycle Notes',
    body: [
      { heading: 'Stages', text: 'Water moves in a cycle.' },
      'A loose string section.',
      { heading: 'Only heading' },
      42,
    ],
    definitions: [
      { term: 'Evaporation', definition: 'Water turning into vapour.' },
      { term: 'Rain', meaning: 'Water falling from clouds.' },
      { term: 'Solo term' },
      { meaning: 'A meaning with no term.' },
      {},
      null,
    ],
    mechanismSteps: [
      { title: 'Heating', text: 'The sun heats the sea.' },
      'A plain string step.',
      null,
    ],
    workedExample: TRAP,
    objectives: [TRAP],
  });
  assert.equal(ext.kind, 'notes');
  assert.deepEqual(ext.fieldsUsed, ['title', 'body', 'definitions', 'mechanismSteps']);
  assert.deepEqual(ext.texts, [
    'Water Cycle Notes',
    'Stages', 'Water moves in a cycle.',
    'A loose string section.',
    'Only heading',
    'Evaporation. Water turning into vapour.',
    'Rain. Water falling from clouds.',
    'Solo term',
    'A meaning with no term.',
    'Heating', 'The sun heats the sea.',
    'A plain string step.',
  ]);
  assert.ok(!ext.texts.join(' ').includes('Photosynthesis'));
});

test('notes detection works from any one of body, definitions, mechanismSteps', () => {
  assert.equal(extractStudentText({ definitions: [{ term: 'A', meaning: 'B.' }] }).kind, 'notes');
  assert.equal(extractStudentText({ body: [{ text: 'Section.' }] }).kind, 'notes');
  assert.equal(extractStudentText({ mechanismSteps: ['Step one.'] }).kind, 'notes');
});

test('scaffold extraction reads support text and never cloze answers', () => {
  const ext = extractStudentText({
    sets: [{
      wordBank: [{ term: 'evaporation' }, { term: 9 }, null, { gloss: 'no term' }],
      sentenceStarters: ['When the sun heats...'],
      starters: ['High up, the air...'],
      sentenceFrames: ['___ turns into vapour.'],
      frames: ['The cycle ___ again.'],
      cloze: {
        passage: 'The sun heats the sea and the water rises.',
        blanks: [{ prompt: 'Name the change.' }, { prompt: 3 }, 'loose', { answer: TRAP }],
      },
    }],
  });
  assert.equal(ext.kind, 'scaffold');
  assert.deepEqual(ext.fieldsUsed, ['sets']);
  assert.deepEqual(ext.texts, [
    'evaporation',
    'When the sun heats...',
    'High up, the air...',
    '___ turns into vapour.',
    'The cycle ___ again.',
    'The sun heats the sea and the water rises.',
    'Name the change.',
  ]);
});

test('scaffold extraction: gold cloze array form, string items, missing parts', () => {
  const ext = extractStudentText({
    sets: [
      null,
      { cloze: [{ text: 'The sun heats the ___ and it rises.', answers: [TRAP] }, 'A string cloze.', null] },
      { wordBank: [{ term: 'rain' }], cloze: { passage: 'Only a passage.' } },
      {},
    ],
  });
  assert.deepEqual(ext.texts, ['The sun heats the ___ and it rises.', 'A string cloze.', 'rain', 'Only a passage.']);
  assert.ok(!ext.texts.join(' ').includes('Photosynthesis'));
});

test('deck extraction: title, heading, body forms, bullets and lines; notes excluded', () => {
  const ext = extractStudentText({
    slides: [
      { title: 'Title text', body: 'Body as a string.', speakerNotes: TRAP, notes: TRAP },
      { heading: 'A heading', body: ['Line one.', 5, 'Line two.'], bullets: ['Bullet one.', null] },
      { title: 'Latex slide', lines: ['x + y = 3', 'a^2 + b^2'] },
      { body: 42 },
      null,
    ],
  });
  assert.equal(ext.kind, 'deck');
  assert.deepEqual(ext.fieldsUsed, ['slides']);
  assert.deepEqual(ext.texts, [
    'Title text', 'Body as a string.',
    'A heading', 'Line one.', 'Line two.', 'Bullet one.',
    'Latex slide', 'x + y = 3', 'a^2 + b^2',
  ]);
});

test('teacher script extracts nothing: say, cue and watchFor are teacher-only', () => {
  const script = {
    kind: 'teacher-script',
    segments: [{ say: 'Say this to the class.', cue: 's1', watchFor: TRAP, questions: ['Ask this?'] }],
  };
  const ext = extractStudentText(script);
  assert.equal(ext.kind, 'script');
  assert.deepEqual(ext.texts, []);
  assert.deepEqual(ext.fieldsUsed, []);
  const result = scoreMaterial(script);
  assert.equal(result.kind, 'script');
  assert.equal(result.stats, null);
  assert.equal(dim(result, 'readingAge').note, 'No student-facing text to measure.');
  assert.equal(dim(result, 'textPresence').score, 0);
  assert.equal(result.maxScore, 7); // instruction clarity omitted
});

test('malformed inputs score the fixed malformed shape and never throw', () => {
  for (const bad of [null, undefined, [], 42, 'text', true]) {
    const result = scoreMaterial(bad);
    assert.equal(result.score, 0);
    assert.equal(result.maxScore, 10);
    assert.equal(result.kind, null);
    assert.equal(result.stats, null);
    assert.equal(result.dimensions.length, 3);
    for (const d of result.dimensions) {
      assert.equal(d.note, 'Material is not an object; nothing to score.');
    }
  }
  assert.deepEqual(extractStudentText(null), { kind: null, texts: [], fieldsUsed: [] });
  assert.deepEqual(extractStudentText([1, 2]), { kind: null, texts: [], fieldsUsed: [] });
});

test('scoreMaterial survives a material whose getters throw', () => {
  const evil = {};
  Object.defineProperty(evil, 'sets', { get() { throw new Error('boom'); } });
  const result = scoreMaterial(evil);
  assert.equal(result.score, 0);
  assert.equal(result.kind, null);
  assert.equal(result.dimensions[0].note, 'Material is not an object; nothing to score.');
});

test('unknown materials: kind passthrough, empty texts, clarity omitted', () => {
  const empty = scoreMaterial({});
  assert.equal(empty.kind, null);
  assert.equal(empty.maxScore, 7);
  assert.equal(empty.stats, null);
  assert.equal(empty.dimensions.length, 2);
  const named = scoreMaterial({ kind: 'mystery', questions: 'nope' });
  assert.equal(named.kind, 'mystery'); // non-array questions means not a worksheet
  assert.equal(named.maxScore, 7);
  assert.equal(dim(named, 'textPresence').note, 'No student-facing text found.');
});

test('empty worksheet: clarity included at 0, maxScore 10', () => {
  const result = scoreMaterial({ questions: [] });
  assert.equal(result.kind, 'worksheet');
  assert.equal(result.maxScore, 10);
  assert.equal(result.dimensions.length, 3);
  assert.equal(dim(result, 'instructionClarity').score, 0);
  assert.equal(dim(result, 'textPresence').score, 0);
});

test('textPresence thresholds per kind', () => {
  const ws = (n) => scoreMaterial({ questions: Array.from({ length: n }, (_, i) => ({ prompt: `Question ${i + 1} text.` })) });
  assert.equal(dim(ws(5), 'textPresence').score, 3);
  assert.equal(dim(ws(4), 'textPresence').score, 2);
  assert.equal(dim(ws(2), 'textPresence').score, 1);
  assert.equal(dim(ws(1), 'textPresence').score, 1);
  const notes = (n) => scoreMaterial({ body: Array.from({ length: n }, (_, i) => ({ text: `Section ${i + 1} text.` })) });
  assert.equal(dim(notes(3), 'textPresence').score, 3);
  assert.equal(dim(notes(2), 'textPresence').score, 2);
  assert.equal(dim(notes(1), 'textPresence').score, 1);
  const defsOnly = scoreMaterial({ definitions: [{ term: 'Rain', meaning: 'Falling water.' }] });
  assert.equal(dim(defsOnly, 'textPresence').score, 1); // text present, no body sections
  const scaffold = (n) => scoreMaterial({ sets: Array.from({ length: n }, () => ({ sentenceStarters: ['Start here.'] })) });
  assert.equal(dim(scaffold(3), 'textPresence').score, 3);
  assert.equal(dim(scaffold(2), 'textPresence').score, 2);
  assert.equal(dim(scaffold(1), 'textPresence').score, 1);
  const deck = (n) => scoreMaterial({ slides: Array.from({ length: n }, (_, i) => ({ title: `Slide ${i + 1}` })) });
  assert.equal(dim(deck(8), 'textPresence').score, 3);
  assert.equal(dim(deck(7), 'textPresence').score, 2);
  assert.equal(dim(deck(4), 'textPresence').score, 1);
});

test('instructionClarity branches for worksheets', () => {
  const clarity = (instructions) => dim(scoreMaterial({ instructions, questions: [{ prompt: 'Do it.' }] }), 'instructionClarity').score;
  assert.equal(clarity(undefined), 0);
  assert.equal(clarity(''), 0);
  assert.equal(clarity('Read the text. Answer the questions.'), 3); // 2 sentences, 6 words
  assert.equal(clarity('Read the passage carefully now. Think about the main idea first. Then write your answer in full.'), 2); // 3 sentences
  const longWords = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ') + '.';
  assert.equal(clarity(longWords), 2); // 1 sentence but over 40 words, within 80
  const long = Array.from({ length: 5 }, () => Array.from({ length: 20 }, (_, i) => `term${i}`).join(' ')).join('. ') + '.';
  assert.equal(clarity(long), 1); // 5 sentences and over 80 words
});

test('instructionClarity scaffold path uses sentence starters when no instructions', () => {
  const withStarters = scoreMaterial({ sets: [{ sentenceStarters: ['When the sun...'] }] });
  assert.equal(dim(withStarters, 'instructionClarity').score, 2);
  const goldStyle = scoreMaterial({ sets: [{ starters: ['When the sun...'] }] });
  assert.equal(dim(goldStyle, 'instructionClarity').score, 2);
  const bare = scoreMaterial({ sets: [{}] });
  assert.equal(dim(bare, 'instructionClarity').score, 0);
  const nullSet = scoreMaterial({ sets: [null] });
  assert.equal(dim(nullSet, 'instructionClarity').score, 0);
  const withInstructions = scoreMaterial({ instructions: 'Use set one first.', sets: [{ starters: ['When...'] }] });
  assert.equal(dim(withInstructions, 'instructionClarity').score, 3);
});

test('instructionClarity is omitted for notes, deck, script and unknown', () => {
  for (const material of [
    { definitions: [{ term: 'A', meaning: 'B.' }] },
    { slides: [{ title: 'S' }] },
    { segments: [{ say: 'Hello.' }] },
    {},
  ]) {
    const result = scoreMaterial(material);
    assert.equal(result.maxScore, 7);
    assert.equal(result.dimensions.length, 2);
    assert.equal(dim(result, 'instructionClarity'), undefined);
  }
});

test('a simple worksheet scores end to end with the stats block', () => {
  const result = scoreMaterial({
    instructions: 'Answer each question.',
    questions: [
      { prompt: 'The cat sat on the mat.' },
      { prompt: 'The dog ran to the log.' },
      { prompt: 'A hen sat on an egg.' },
      { prompt: 'The sun is hot.' },
      { prompt: 'We can see the sea.' },
    ],
  });
  assert.equal(result.kind, 'worksheet');
  assert.equal(result.maxScore, 10);
  assert.equal(dim(result, 'textPresence').score, 3);
  assert.equal(dim(result, 'instructionClarity').score, 3);
  assert.ok(result.stats);
  assert.equal(result.stats.words, 30); // 3 instruction words + 27 prompt words
  assert.equal(result.score, result.dimensions.reduce((a, d) => a + d.score, 0));
});

test('gold sample materials score with the right kinds', () => {
  const load = (dir, name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', dir, name), 'utf8'));
  const name = 'primary-science-water-cycle.json';
  assert.equal(scoreMaterial(load('worksheets', name)).kind, 'worksheet');
  // Gold tickets carry no kind field, so shape detection defaults them to
  // worksheet: the brief precedence makes the kind field decide.
  assert.equal(scoreMaterial(load('tickets', name)).kind, 'worksheet');
  assert.equal(scoreMaterial(load('notes', name)).kind, 'notes');
  assert.equal(scoreMaterial(load('scaffolds', name)).kind, 'scaffold');
  assert.equal(scoreMaterial(load('decks', name)).kind, 'deck');
  assert.equal(scoreMaterial(load('scripts', name)).kind, 'script');
  for (const dir of ['worksheets', 'notes', 'scaffolds', 'decks']) {
    const result = scoreMaterial(load(dir, name));
    assert.ok(result.stats && result.stats.words > 0, dir);
  }
  // Gold deck speaker notes (the notes field) never reach the stats.
  const deck = load('decks', name);
  const ext = extractStudentText(deck);
  assert.ok(!ext.texts.join(' ').includes('Welcome everyone in'));
});

test('package export ./materials-rubric is registered and loads', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.exports['./materials-rubric'], './generator/materials-rubric.js');
  const mod = require(path.join(ROOT, pkg.exports['./materials-rubric']));
  assert.equal(typeof mod.scoreMaterial, 'function');
  assert.equal(typeof mod.extractStudentText, 'function');
  assert.equal(typeof mod.INTERNALS.countSyllables, 'function');
  assert.equal(typeof mod.INTERNALS.readingAge, 'function');
});
