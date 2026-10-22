/* teachkit materials rubric — slice 2 of #1235 (Phase B3, epic #1204):
 * scoreMaterial(material) scores a generated teaching material (worksheet,
 * exit ticket, student notes, scaffolds, slide deck) in the same shape as
 * the animation rubric in generator/rubric.js — { score, maxScore,
 * dimensions, kind, stats } — but measured over student-facing text only.
 * Teacher-only text is NEVER measured: per-question answer / answers /
 * correctAnswer fields, markScheme, workedSolution, deck speaker notes,
 * and teacher-script segments (say / cue / watchFor) are never read.
 * Teacher scripts are therefore unsupported: they extract no student text
 * and score 0 on presence and reading age.
 *
 * READING-AGE HEURISTIC — a heuristic only, never a gate:
 * Flesch Reading Ease = 206.835 - 1.015 x (words / sentences)
 *   - 84.6 x (syllables / words), computed over the joined student text.
 * Grade level ~= (110 - ease) / 10, clamped to 3-18, rounded to 1 dp.
 * Reading age band = grade rounded, + 5 years, floored at 5, reported as
 * a two-year band (ageLow to ageLow + 1).
 * Bands for the reading-age dimension (max 4): grade <= 6 -> 4;
 * <= 8 -> 3; <= 10 -> 2; <= 12 -> 1; above 12 -> 0.
 *
 * SYLLABLE RULE (approximate, per word): lowercase, strip non a-z;
 * empty -> 0; length <= 3 -> 1; drop a trailing silent 'e' unless the
 * word ends 'le' preceded by a consonant; count maximal runs of
 * [aeiouy]; subtract 1 if the word ends 'ed' and the letter before 'ed'
 * is not t/d; subtract 1 if it ends 'es' and the letter before 'es' is
 * not s/x/z/ch/sh; a final 'ia' hiatus counts as two syllables
 * (the -ia ending is pronounced as two beats: mi-to-chon-dri-a);
 * minimum 1. Worked: cat 1, the 1, water 2, table 2,
 * fraction 2, observe 2, walked 1, wanted 2, energy 3,
 * photosynthesis 5, mitochondria 5.
 *
 * LIMITS: Flesch scores are unstable on short text; the syllable rule
 * is approximate (silent-e and -ed/-es adjustments miss irregular
 * words); proper nouns and numbers inflate the measured difficulty.
 * Treat the reading age as a rough signal for a human reviewer, never
 * as a pass/fail gate.
 *
 * Sentence splitting: the joined text splits on runs of [.!?]+ followed
 * by whitespace or end of text; segments containing at least one word
 * count; text with no terminator counts as one sentence. Words are
 * whitespace tokens containing at least one [A-Za-z0-9].
 *
 * Non-object input scores 0 with a reason and never throws
 * (generator/rubric.js precedent). Works in browser and Node (no DOM,
 * no deps).
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; /* node:coverage ignore next */
  else global.TeachkitMaterialsRubric = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function isObj(x) {
    return !!x && typeof x === 'object' && !Array.isArray(x);
  }

  function round1(x) {
    return Math.round(x * 10) / 10;
  }

  // --- syllables -----------------------------------------------------------

  var VOWELS = 'aeiouy';

  function countSyllables(word) {
    var w = String(word).toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    var s = w;
    var endsLeConsonant = s.endsWith('le') && VOWELS.indexOf(s.charAt(s.length - 3)) === -1;
    if (s.endsWith('e') && !endsLeConsonant) s = s.slice(0, -1);
    var runs = s.match(/[aeiouy]+/g);
    var n = runs ? runs.length : 0;
    var beforeEd = w.charAt(w.length - 3);
    if (w.endsWith('ed') && beforeEd !== 't' && beforeEd !== 'd') n -= 1;
    var stemEs = w.slice(0, -2);
    var beforeEs = w.charAt(w.length - 3);
    if (w.endsWith('es') && 'sxz'.indexOf(beforeEs) === -1 &&
        !stemEs.endsWith('ch') && !stemEs.endsWith('sh')) n -= 1;
    if (s.endsWith('ia')) n += 1;
    return Math.max(1, n);
  }

  // --- text measurement ----------------------------------------------------

  function wordTokens(text) {
    return text.split(/\s+/).filter(function (t) { return /[A-Za-z0-9]/.test(t); });
  }

  function countSentences(text) {
    var parts = text.split(/[.!?]+(?=\s|$)/);
    var n = 0;
    parts.forEach(function (p) { if (wordTokens(p).length > 0) n += 1; });
    return n;
  }

  function readingAge(texts) {
    var joined = texts.filter(function (t) {
      return typeof t === 'string' && t.trim().length > 0;
    }).join(' ');
    var words = wordTokens(joined);
    var W = words.length;
    if (W === 0) return null;
    var S = countSentences(joined);
    var Y = 0;
    words.forEach(function (t) { Y += countSyllables(t); });
    var ease = 206.835 - 1.015 * (W / S) - 84.6 * (Y / W);
    var grade = Math.min(18, Math.max(3, round1((110 - ease) / 10)));
    var ageLow = Math.max(5, Math.round(grade) + 5);
    var score = grade <= 6 ? 4 : grade <= 8 ? 3 : grade <= 10 ? 2 : grade <= 12 ? 1 : 0;
    var note = 'Reading age about ' + ageLow + '-' + (ageLow + 1) +
      ' (Flesch grade ' + grade.toFixed(1) + ', ease ' + round1(ease).toFixed(1) +
      ') over ' + W + ' words in ' + S + ' sentences.';
    return {
      words: W, sentences: S, syllables: Y, ease: ease, grade: grade,
      ageLow: ageLow, ageHigh: ageLow + 1, score: score, note: note
    };
  }

  // --- student-text extraction ----------------------------------------------
  // Only the fields named here are ever read. Answer keys, mark schemes,
  // worked solutions, speaker notes and script segments are never read.

  function detectKind(m) {
    if (Array.isArray(m.sets)) return 'scaffold';
    if (Array.isArray(m.slides)) return 'deck';
    if (Array.isArray(m.questions)) return m.kind === 'exit-ticket' ? 'exit-ticket' : 'worksheet';
    if (Array.isArray(m.segments)) return 'script';
    if (Array.isArray(m.body) || Array.isArray(m.definitions) || Array.isArray(m.mechanismSteps)) return 'notes';
    return 'unknown';
  }

  function pushText(texts, v) {
    if (typeof v === 'string') texts.push(v);
  }

  function pushStrings(texts, arr) {
    if (!Array.isArray(arr)) return;
    arr.forEach(function (v) { pushText(texts, v); });
  }

  function extractWorksheet(m, texts) {
    pushText(texts, m.instructions);
    m.questions.forEach(function (q) { if (isObj(q)) pushText(texts, q.prompt); });
    return ['instructions', 'questions'];
  }

  function extractNotes(m, texts) {
    pushText(texts, m.title);
    if (Array.isArray(m.body)) {
      m.body.forEach(function (sec) {
        if (typeof sec === 'string') texts.push(sec);
        else if (isObj(sec)) { pushText(texts, sec.heading); pushText(texts, sec.text); }
      });
    }
    if (Array.isArray(m.definitions)) {
      m.definitions.forEach(function (d) {
        var term = isObj(d) && typeof d.term === 'string' ? d.term : null;
        var def = null;
        if (isObj(d) && typeof d.definition === 'string') def = d.definition;
        else if (isObj(d) && typeof d.meaning === 'string') def = d.meaning;
        if (term && def) texts.push(term + '. ' + def);
        else if (term) texts.push(term);
        else if (def) texts.push(def);
      });
    }
    if (Array.isArray(m.mechanismSteps)) {
      m.mechanismSteps.forEach(function (st) {
        if (typeof st === 'string') texts.push(st);
        else if (isObj(st)) { pushText(texts, st.title); pushText(texts, st.text); }
      });
    }
    return ['title', 'body', 'definitions', 'mechanismSteps'];
  }

  function extractScaffold(m, texts) {
    m.sets.forEach(function (set) {
      if (!isObj(set)) return;
      if (Array.isArray(set.wordBank)) {
        set.wordBank.forEach(function (e) { if (isObj(e)) pushText(texts, e.term); });
      }
      pushStrings(texts, set.sentenceStarters);
      pushStrings(texts, set.starters);
      pushStrings(texts, set.sentenceFrames);
      pushStrings(texts, set.frames);
      if (Array.isArray(set.cloze)) {
        set.cloze.forEach(function (item) {
          if (typeof item === 'string') texts.push(item);
          else if (isObj(item)) pushText(texts, item.text);
        });
      } else if (isObj(set.cloze)) {
        pushText(texts, set.cloze.passage);
        if (Array.isArray(set.cloze.blanks)) {
          set.cloze.blanks.forEach(function (b) { if (isObj(b)) pushText(texts, b.prompt); });
        }
      }
    });
    return ['sets'];
  }

  function extractDeck(m, texts) {
    m.slides.forEach(function (slide) {
      if (!isObj(slide)) return;
      pushText(texts, slide.title);
      pushText(texts, slide.heading);
      if (typeof slide.body === 'string') texts.push(slide.body);
      else if (Array.isArray(slide.body)) pushStrings(texts, slide.body);
      pushStrings(texts, slide.bullets);
      pushStrings(texts, slide.lines);
    });
    return ['slides'];
  }

  function extractStudentText(material) {
    if (!isObj(material)) return { kind: null, texts: [], fieldsUsed: [] };
    var kind = detectKind(material);
    var texts = [];
    var fieldsUsed = [];
    if (kind === 'worksheet' || kind === 'exit-ticket') fieldsUsed = extractWorksheet(material, texts);
    else if (kind === 'notes') fieldsUsed = extractNotes(material, texts);
    else if (kind === 'scaffold') fieldsUsed = extractScaffold(material, texts);
    else if (kind === 'deck') fieldsUsed = extractDeck(material, texts);
    return { kind: kind, texts: texts, fieldsUsed: fieldsUsed };
  }

  // --- dimensions ------------------------------------------------------------

  function dim(key, label, score, maxScore, note) {
    return { key: key, label: label, score: score, maxScore: maxScore, note: note };
  }

  function malformedResult() {
    var note = 'Material is not an object; nothing to score.';
    return {
      score: 0, maxScore: 10, kind: null, stats: null,
      dimensions: [
        dim('readingAge', 'Reading age', 0, 4, note),
        dim('textPresence', 'Student text presence', 0, 3, note),
        dim('instructionClarity', 'Instruction clarity', 0, 3, note)
      ]
    };
  }

  function presenceScore(kind, m, texts) {
    var count = 0;
    var t3 = 0;
    var t2 = 0;
    var unit = '';
    if (kind === 'worksheet' || kind === 'exit-ticket') {
      count = m.questions.length; t3 = 5; t2 = 3; unit = 'question prompt(s)';
    } else if (kind === 'notes') {
      count = Array.isArray(m.body) ? m.body.length : 0;
      if (count === 0 && texts.length > 0) count = 1;
      t3 = 3; t2 = 2; unit = 'notes section(s)';
    } else if (kind === 'scaffold') {
      count = m.sets.length; t3 = 3; t2 = 2; unit = 'scaffold set(s)';
    } else if (kind === 'deck') {
      count = m.slides.length; t3 = 8; t2 = 5; unit = 'slide(s)';
    }
    if (texts.length === 0) return { score: 0, note: 'No student-facing text found.' };
    var s = count >= t3 ? 3 : count >= t2 ? 2 : 1;
    return { score: s, note: count + ' ' + unit + ' carry the student text.' };
  }

  function clarityScore(kind, m) {
    var instructions = typeof m.instructions === 'string' ? m.instructions : '';
    if (!instructions.trim()) {
      if (kind === 'scaffold') {
        var first = isObj(m.sets[0]) ? m.sets[0] : {};
        var starters = Array.isArray(first.sentenceStarters) ? first.sentenceStarters
          : Array.isArray(first.starters) ? first.starters : [];
        return starters.length >= 1
          ? { score: 2, note: 'No instructions; sentence starters carry the guidance.' }
          : { score: 0, note: 'No instructions and no sentence starters.' };
      }
      return { score: 0, note: 'No instructions to judge for clarity.' };
    }
    var words = wordTokens(instructions).length;
    var sentences = countSentences(instructions);
    if (sentences <= 2 && words <= 40) {
      return { score: 3, note: 'Instructions are short: ' + sentences + ' sentence(s), ' + words + ' words.' };
    }
    if (sentences <= 4 || words <= 80) {
      return { score: 2, note: 'Instructions run to ' + sentences + ' sentence(s), ' + words + ' words.' };
    }
    return { score: 1, note: 'Instructions are long: ' + sentences + ' sentence(s), ' + words + ' words.' };
  }

  // --- entry point -----------------------------------------------------------

  function scoreMaterial(material) {
    try {
      if (!isObj(material)) return malformedResult();
      var ext = extractStudentText(material);
      var kind = ext.kind === 'unknown'
        ? (typeof material.kind === 'string' ? material.kind : null) : ext.kind;
      var ra = readingAge(ext.texts);
      var dimensions = [];
      if (ra) {
        dimensions.push(dim('readingAge', 'Reading age', ra.score, 4, ra.note));
      } else {
        dimensions.push(dim('readingAge', 'Reading age', 0, 4, 'No student-facing text to measure.'));
      }
      var presence = presenceScore(ext.kind, material, ext.texts);
      dimensions.push(dim('textPresence', 'Student text presence', presence.score, 3, presence.note));
      var includeClarity = ext.kind === 'worksheet' || ext.kind === 'exit-ticket' || ext.kind === 'scaffold';
      if (includeClarity) {
        var clarity = clarityScore(ext.kind, material);
        dimensions.push(dim('instructionClarity', 'Instruction clarity', clarity.score, 3, clarity.note));
      }
      var score = 0;
      var maxScore = 0;
      dimensions.forEach(function (d) { score += d.score; maxScore += d.maxScore; });
      var stats = ra ? {
        words: ra.words, sentences: ra.sentences, syllables: ra.syllables,
        fleschEase: round1(ra.ease), gradeLevel: ra.grade,
        readingAgeLow: ra.ageLow, readingAgeHigh: ra.ageHigh
      } : null;
      return { score: score, maxScore: maxScore, dimensions: dimensions, kind: kind, stats: stats };
    } catch (err) {
      return malformedResult();
    }
  }

  return {
    scoreMaterial: scoreMaterial,
    extractStudentText: extractStudentText,
    INTERNALS: { countSyllables: countSyllables, readingAge: readingAge }
  };
});
