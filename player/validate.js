/* animath spec validator v0.1 — reference implementation of SPEC.md.
 * Returns an array of error strings; empty means valid.
 * Works in browser and Node (no DOM, no deps).
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.AnimathValidate = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var LEVELS = ['primary', 'secondary', 'jc'];
  // SUBJECTS is the syllabus-known list, used for gallery/coverage — NOT
  // an admission list: validateSpec accepts any non-empty subject string.
  var SUBJECTS = ['math', 'science', 'geography', 'economics', 'computing', 'electronics', 'design-technology', 'nutrition-food-science', 'principles-of-accounts', 'business-studies', 'exercise-sports-science', 'management-of-business', 'history', 'social-studies', 'biotechnology', 'design-studies', 'china-studies'];
  var KINDS = ['concept', 'problem'];
  var VERBS = ['show', 'hide', 'move', 'emphasize', 'caption'];
  var SHAPES = ['text', 'rect', 'circle', 'line', 'arrow', 'polygon', 'latex', 'sector'];
  var MOVEABLE = ['text', 'rect', 'circle', 'line', 'arrow', 'latex', 'polygon'];
  var HEX = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
  // Dash pattern: one or more numbers separated by whitespace (e.g. "6 4").
  var DASH = /^\d+(\.\d+)?(\s+\d+(\.\d+)?)*$/;

  function isNum(x) { return typeof x === 'number' && isFinite(x); }

  // Width profile for tapered arrows (issue #164): [tailWidth, headWidth],
  // exactly two positive numbers. Shared by the show-time check and the
  // move-time `widths` field check.
  function isWidths(x) {
    return Array.isArray(x) && x.length === 2 && isNum(x[0]) && x[0] > 0 && isNum(x[1]) && x[1] > 0;
  }

  function checkShape(shape, errors, where) {
    var p = where + '.shape';
    if (!shape || typeof shape !== 'object') { errors.push(p + ': must be an object'); return; }
    if (typeof shape.id !== 'string' || !shape.id) errors.push(p + '.id: required non-empty string');
    if (SHAPES.indexOf(shape.kind) === -1) {
      errors.push(p + '.kind: must be one of ' + SHAPES.join('|'));
      return;
    }
    function num(field) {
      if (!isNum(shape[field])) errors.push(p + '.' + field + ': required number');
    }
    switch (shape.kind) {
      case 'text':
        num('x'); num('y');
        if (typeof shape.text !== 'string') errors.push(p + '.text: required string');
        if (shape.text && /\\[a-zA-Z]+/.test(shape.text)) {
          errors.push(p + '.text: LaTeX commands are not supported in text shapes — use unicode math or a latex shape');
        }
        if (shape.align !== undefined && ['start', 'middle', 'end'].indexOf(shape.align) === -1) {
          errors.push(p + '.align: must be start|middle|end');
        }
        if (shape.size !== undefined && !isNum(shape.size)) errors.push(p + '.size: must be a number');
        break;
      case 'latex':
        num('x'); num('y');
        if (typeof shape.tex !== 'string' || !shape.tex) errors.push(p + '.tex: required non-empty string');
        if (shape.size !== undefined && !isNum(shape.size)) errors.push(p + '.size: must be a number');
        break;
      case 'rect': num('x'); num('y'); num('w'); num('h'); break;
      case 'circle': num('cx'); num('cy'); num('r'); break;
      case 'line':
        num('x1'); num('y1'); num('x2'); num('y2');
        // dash is optional; absent or empty string = solid.
        if (shape.dash !== undefined && shape.dash !== '') {
          if (typeof shape.dash !== 'string' || !DASH.test(shape.dash.trim())) {
            errors.push(p + '.dash: must be a string of space-separated numbers like "6 4"');
          }
        }
        break;
      case 'arrow':
        num('x1'); num('y1'); num('x2'); num('y2');
        // widths is optional; [tailWidth, headWidth] for a tapered shaft.
        if (shape.widths !== undefined && !isWidths(shape.widths)) {
          errors.push(p + '.widths: must be an array of two positive numbers [tailWidth, headWidth]');
        }
        // dash is optional; absent or empty string = solid. Ignored on a
        // tapered shaft (SPEC.md), but still validated here when present.
        if (shape.dash !== undefined && shape.dash !== '') {
          if (typeof shape.dash !== 'string' || !DASH.test(shape.dash.trim())) {
            errors.push(p + '.dash: must be a string of space-separated numbers like "6 4"');
          }
        }
        break;
      case 'polygon':
        if (!Array.isArray(shape.points) || shape.points.length < 3 ||
            !shape.points.every(function (pt) { return Array.isArray(pt) && pt.length === 2 && isNum(pt[0]) && isNum(pt[1]); })) {
          errors.push(p + '.points: required array of [x,y] pairs (min 3)');
        }
        break;
      case 'sector':
        // Not moveable in v0: intentionally absent from MOVEABLE above.
        num('cx'); num('cy');
        if (!isNum(shape.r) || shape.r <= 0) errors.push(p + '.r: required positive number');
        num('startAngle'); num('endAngle');
        break;
    }
    // "Explain me this" tooltip text (issue #173): any shape kind may
    // carry it; it must be a string when present. The player shows the
    // tooltip; empty or whitespace-only strings are inert.
    if (shape.explain !== undefined && typeof shape.explain !== 'string') {
      errors.push(p + '.explain: must be a string when present');
    }
    ['fill', 'stroke', 'color'].forEach(function (f) {
      if (shape[f] !== undefined && (typeof shape[f] !== 'string' ||
          !(HEX.test(shape[f]) || shape[f] === 'none'))) {
        errors.push(p + '.' + f + ': must be a CSS hex color or "none"');
      }
    });
  }

  function validateSpec(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object') return ['spec: must be an object'];
    if (spec.animath !== '0.1') errors.push('animath: must be "0.1"');
    if (typeof spec.title !== 'string' || !spec.title.trim()) errors.push('title: required non-empty string');
    if (LEVELS.indexOf(spec.level) === -1) errors.push('level: must be ' + LEVELS.join('|'));
    if (typeof spec.subject !== 'string' || !spec.subject.trim()) errors.push('subject: required non-empty string');
    if (typeof spec.topic !== 'string' || !spec.topic.trim()) errors.push('topic: required non-empty slug string');
    if (KINDS.indexOf(spec.kind) === -1) errors.push('kind: must be ' + KINDS.join('|'));
    if (!spec.canvas || !isNum(spec.canvas.width) || !isNum(spec.canvas.height)) {
      errors.push('canvas: required {width,height} numbers');
    }
    // 1..8 scenes: a single holistic scene is legitimate staging for a
    // cycle or system topic (owner direction 2026-10-12) — the whole loop
    // or system is visible at once, so splitting it would hide the concept.
    if (!Array.isArray(spec.scenes) || spec.scenes.length < 1 || spec.scenes.length > 8) {
      errors.push('scenes: required array of 1..8 scenes');
      return errors;
    }
    var sceneIds = {};
    spec.scenes.forEach(function (scene, i) {
      var w = 'scenes[' + i + ']';
      if (!scene || typeof scene !== 'object') { errors.push(w + ': must be an object'); return; }
      if (typeof scene.id !== 'string' || !scene.id) errors.push(w + '.id: required non-empty string');
      else if (sceneIds[scene.id]) errors.push(w + '.id: duplicate scene id "' + scene.id + '"');
      else sceneIds[scene.id] = true;
      if (typeof scene.caption !== 'string' || !scene.caption.trim()) errors.push(w + '.caption: required non-empty string');
      if (typeof scene.narration !== 'string' || !scene.narration.trim()) errors.push(w + '.narration: required non-empty string');
      if (!isNum(scene.duration_ms) || scene.duration_ms < 4000 || scene.duration_ms > 12000) {
        errors.push(w + '.duration_ms: required number 4000..12000');
      }
      if (!Array.isArray(scene.steps) || scene.steps.length === 0) {
        errors.push(w + '.steps: required non-empty array');
        return;
      }
      var shown = {};   // shape id -> shape kind, in at_ms order
      var pointCount = {};   // shape id -> polygon vertex count at show time
      var shapeIds = {};
      var lastAt = -1;
      scene.steps.forEach(function (step, j) {
        var s = w + '.steps[' + j + ']';
        if (!step || typeof step !== 'object') { errors.push(s + ': must be an object'); return; }
        if (!isNum(step.at_ms) || step.at_ms < 0 || (isNum(scene.duration_ms) && step.at_ms >= scene.duration_ms)) {
          errors.push(s + '.at_ms: required number, 0 <= at_ms < duration_ms');
        }
        if (step.at_ms < lastAt) errors.push(s + '.at_ms: steps should be ordered ascending');
        lastAt = step.at_ms;
        if (VERBS.indexOf(step.do) === -1) {
          errors.push(s + '.do: must be ' + VERBS.join('|'));
          return;
        }
        if (step.do === 'show') {
          checkShape(step.shape, errors, s);
          if (step.shape && typeof step.shape.id === 'string') {
            if (shapeIds[step.shape.id]) errors.push(s + '.shape.id: duplicate shape id "' + step.shape.id + '" in scene');
            shapeIds[step.shape.id] = true;
            shown[step.shape.id] = step.shape.kind;
            if (step.shape.kind === 'polygon' && Array.isArray(step.shape.points)) {
              pointCount[step.shape.id] = step.shape.points.length;
            }
          }
        } else if (step.do === 'caption') {
          if (typeof step.text !== 'string' || !step.text.trim()) errors.push(s + '.text: required non-empty string');
        } else {
          if (typeof step.target !== 'string' || !step.target) {
            errors.push(s + '.target: required shape id');
          } else if (!shown[step.target]) {
            errors.push(s + '.target: "' + step.target + '" must be shown earlier in the same scene');
          }
          if (step.do === 'move') {
            // SPEC.md: moveable kinds are text, rect, circle, line, arrow,
            // latex, polygon. `to` must carry at least one field and every
            // field must be valid for the target kind: position fields plus
            // w/h for rect, r for circle, `widths` for arrow (the
            // [tail,head] taper pair). Polygon `to` carries only
            // `points`, an array of [x,y] pairs matching the shown shape's
            // vertex count, interpolated pointwise.
            var MOVE_FIELDS = {
              text: ['x', 'y'], latex: ['x', 'y'],
              rect: ['x', 'y', 'w', 'h'], circle: ['cx', 'cy', 'r'],
              line: ['x1', 'y1', 'x2', 'y2'],
              arrow: ['x1', 'y1', 'x2', 'y2', 'widths'],
              polygon: ['points']
            };
            var targetKind = (typeof step.target === 'string' && step.target && shown[step.target])
              ? shown[step.target] : null;
            if (targetKind && MOVEABLE.indexOf(targetKind) === -1) {
              errors.push(s + '.target: kind "' + targetKind + '" is not moveable in v0');
            }
            if (!step.to || typeof step.to !== 'object') {
              errors.push(s + '.to: required position object');
            } else {
              var keys = Object.keys(step.to);
              var isPoly = targetKind === 'polygon' && keys.length === 1 && keys[0] === 'points';
              var fieldsOk = isPoly
                ? Array.isArray(step.to.points) && step.to.points.length > 0 &&
                  step.to.points.every(function (pt) {
                    return Array.isArray(pt) && pt.length === 2 && isNum(pt[0]) && isNum(pt[1]);
                  })
                : keys.length > 0 && keys.every(function (k) {
                    // Issue #164: an arrow move may animate the taper — the
                    // widths value is a [tail,head] pair, not a scalar.
                    if (targetKind === 'arrow' && k === 'widths') return isWidths(step.to[k]);
                    return isNum(step.to[k]);
                  });
              if (!fieldsOk) {
                errors.push(s + '.to: must carry at least one numeric field' +
                  (isPoly ? ' — points must be an array of numeric [x,y] pairs' : ''));
              } else if (targetKind && MOVE_FIELDS[targetKind]) {
                var want = MOVE_FIELDS[targetKind];
                var bad = keys.filter(function (k) { return want.indexOf(k) === -1; });
                if (bad.length) {
                  errors.push(s + '.to: invalid field(s) for kind "' + targetKind + '": ' +
                    bad.join(',') + ' — valid fields: ' + want.join(','));
                } else if (targetKind === 'polygon' && isNum(pointCount[step.target]) &&
                    step.to.points.length !== pointCount[step.target]) {
                  errors.push(s + '.to.points: point count (' + step.to.points.length +
                    ') must match the shown shape\'s points (' + pointCount[step.target] + ')');
                }
              }
            }
            if (!isNum(step.dur_ms)) errors.push(s + '.dur_ms: required number');
          }
        }
      });
    });
    return errors;
  }

  var SLIDE_KINDS = ['title', 'objective', 'hook', 'concept', 'mechanism', 'example', 'practice', 'exit-ticket'];

  // A slide visual is valid in exactly two forms (SPEC.md "Slide spec"):
  // a non-empty animation scene id string, or a descriptor object with a
  // non-empty sceneId and/or a shape kind from SHAPES. When both fields
  // are present, both must be valid. Anything else is a dangling
  // reference. Scene-id resolution is NOT attempted here.
  function isValidSlideVisual(v) {
    if (typeof v === 'string') return v.trim().length > 0;
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
    var hasSceneId = typeof v.sceneId === 'string' && v.sceneId.trim().length > 0;
    var hasKind = SHAPES.indexOf(v.kind) !== -1;
    if (v.sceneId !== undefined && !hasSceneId) return false;
    if (v.kind !== undefined && !hasKind) return false;
    return hasSceneId || hasKind;
  }

  // Slide-deck validator (SPEC.md "Slide spec"): same contract as
  // validateSpec — returns an array of error strings; empty means valid.
  function validateSlides(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object') return ['spec: must be an object'];
    if (typeof spec.title !== 'string' || !spec.title.trim()) errors.push('title: required non-empty string');
    if (LEVELS.indexOf(spec.level) === -1) errors.push('level: must be ' + LEVELS.join('|'));
    // Subject is any non-empty string (like validateSpec) — NOT checked
    // against SUBJECTS, which is only the syllabus-known list.
    if (typeof spec.subject !== 'string' || !spec.subject.trim()) errors.push('subject: required non-empty string');
    if (typeof spec.topic !== 'string' || !spec.topic.trim()) errors.push('topic: required non-empty string');
    if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
      errors.push('slides: required non-empty array');
      return errors;
    }
    var kinds = [];   // valid kind per slide index, null when absent/invalid
    spec.slides.forEach(function (slide, i) {
      var w = 'slides[' + i + ']';
      if (!slide || typeof slide !== 'object') { errors.push(w + ': must be an object'); kinds.push(null); return; }
      if (SLIDE_KINDS.indexOf(slide.kind) === -1) {
        errors.push(w + '.kind: must be ' + SLIDE_KINDS.join('|'));
        kinds.push(null);
      } else {
        kinds.push(slide.kind);
      }
      var hasHeading = typeof slide.heading === 'string' && slide.heading.trim().length > 0;
      if (slide.heading !== undefined && !hasHeading) {
        errors.push(w + '.heading: must be a non-empty string when present');
      }
      var hasBullets = Array.isArray(slide.bullets) && slide.bullets.length >= 1;
      if (slide.bullets !== undefined) {
        if (!Array.isArray(slide.bullets)) {
          errors.push(w + '.bullets: must be an array when present');
        } else {
          slide.bullets.forEach(function (b, j) {
            if (typeof b !== 'string' || !b.trim()) {
              errors.push(w + '.bullets[' + j + ']: required non-empty string');
            }
          });
        }
      }
      if (!hasHeading && !hasBullets) errors.push(w + ': must have a heading or non-empty bullets');
      if (slide.notes !== undefined && typeof slide.notes !== 'string') {
        errors.push(w + '.notes: must be a string when present');
      }
      if (slide.visual !== undefined && !isValidSlideVisual(slide.visual)) {
        errors.push(w + '.visual: dangling visual reference — must be a non-empty scene id string or a descriptor with a non-empty sceneId or a shape kind');
      }
    });
    // Ordering, over slides with a valid kind only.
    if (kinds.indexOf('title') === -1) errors.push('slides: missing a title slide');
    else if (kinds[0] !== 'title') errors.push('slides[0].kind: title slide must be first');
    if (kinds.indexOf('exit-ticket') === -1) errors.push('slides: missing an exit-ticket slide');
    else if (kinds[kinds.length - 1] !== 'exit-ticket') {
      errors.push('slides[' + (kinds.length - 1) + '].kind: exit-ticket slide must be last');
    }
    var objIdx = kinds.indexOf('objective');
    if (objIdx !== -1) {
      var cmIdx = -1;
      for (var k = 0; k < kinds.length; k++) {
        if (kinds[k] === 'concept' || kinds[k] === 'mechanism') { cmIdx = k; break; }
      }
      if (cmIdx !== -1 && objIdx > cmIdx) {
        errors.push('slides: objective slide must come before concept/mechanism slides');
      }
    }
    return errors;
  }

  var QUESTION_KINDS = ['multiple-choice', 'short-answer'];

  // Worksheet question tiers (SPEC.md "Worksheet spec"): support and
  // extension serve the same objective at reduced / extended demand.
  var QUESTION_TIERS = ['support', 'core', 'extension'];

  // Header shared by the worksheet and exit-ticket contracts (SPEC.md):
  // identical checks to validateSlides — subject is any non-empty string,
  // NOT checked against SUBJECTS.
  function checkMaterialHeader(spec, errors) {
    if (typeof spec.title !== 'string' || !spec.title.trim()) errors.push('title: required non-empty string');
    if (LEVELS.indexOf(spec.level) === -1) errors.push('level: must be ' + LEVELS.join('|'));
    if (typeof spec.subject !== 'string' || !spec.subject.trim()) errors.push('subject: required non-empty string');
    if (typeof spec.topic !== 'string' || !spec.topic.trim()) errors.push('topic: required non-empty string');
  }

  // Optional string-array fields on a markScheme (alternatives,
  // commonErrors): when present, an array of non-empty strings.
  function checkStringArray(value, errors, label) {
    if (!Array.isArray(value)) {
      errors.push(label + ': must be an array of non-empty strings when present');
      return;
    }
    value.forEach(function (entry, j) {
      if (typeof entry !== 'string' || !entry.trim()) {
        errors.push(label + '[' + j + ']: must be a non-empty string');
      }
    });
  }

  // Mark scheme on a question (SPEC.md "Question"): credit points
  // whose marks sum to the question marks, so a scheme without the
  // question marks cannot be checked and is an error. Optional
  // alternatives / commonErrors are string arrays; ecf is a boolean.
  function checkMarkScheme(question, errors, p) {
    var s = p + '.markScheme';
    var scheme = question.markScheme;
    if (!scheme || typeof scheme !== 'object' || Array.isArray(scheme)) {
      errors.push(s + ': must be an object when present');
      return;
    }
    if (question.marks === undefined) {
      errors.push(s + ': requires the question marks, so the credit points can be checked against the total');
    }
    if (!Array.isArray(scheme.points) || scheme.points.length === 0) {
      errors.push(s + '.points: required non-empty array of credit points');
    } else {
      var sum = 0;
      var pointsValid = true;
      scheme.points.forEach(function (point, j) {
        var pp = s + '.points[' + j + ']';
        if (!point || typeof point !== 'object') {
          errors.push(pp + ': must be an object');
          pointsValid = false;
          return;
        }
        if (typeof point.text !== 'string' || !point.text.trim()) {
          errors.push(pp + '.text: required non-empty string');
        }
        if (!Number.isInteger(point.marks) || point.marks <= 0) {
          errors.push(pp + '.marks: must be a positive integer');
          pointsValid = false;
        } else {
          sum += point.marks;
        }
      });
      if (pointsValid && Number.isInteger(question.marks) && question.marks > 0 && sum !== question.marks) {
        errors.push(s + '.points: credit point marks sum to ' + sum + ', not the question marks ' + question.marks);
      }
    }
    if (scheme.alternatives !== undefined) checkStringArray(scheme.alternatives, errors, s + '.alternatives');
    if (scheme.commonErrors !== undefined) checkStringArray(scheme.commonErrors, errors, s + '.commonErrors');
    if (scheme.ecf !== undefined && typeof scheme.ecf !== 'boolean') {
      errors.push(s + '.ecf: must be a boolean when present');
    }
  }

  // One worksheet / exit-ticket question (SPEC.md "Question"): the kind
  // decides which answer field is required — choices with exactly one
  // correct: true for multiple-choice, a non-empty answer for
  // short-answer. explanation (worksheet answer key), feedback
  // (exit-ticket per-answer feedback) and misconception are optional and
  // validated non-empty only where present.
  function checkQuestion(question, errors, i, seenIds, tiered) {
    var p = 'questions[' + i + ']';
    if (!question || typeof question !== 'object') { errors.push(p + ': must be an object'); return; }
    if (typeof question.id !== 'string' || !question.id.trim()) {
      errors.push(p + '.id: required non-empty string');
    } else if (seenIds[question.id]) {
      errors.push(p + '.id: duplicate question id "' + question.id + '"');
    } else {
      seenIds[question.id] = true;
    }
    if (typeof question.prompt !== 'string' || !question.prompt.trim()) {
      errors.push(p + '.prompt: required non-empty string');
    }
    ['explanation', 'feedback', 'misconception'].forEach(function (f) {
      if (question[f] !== undefined && (typeof question[f] !== 'string' || !question[f].trim())) {
        errors.push(p + '.' + f + ': must be a non-empty string when present');
      }
    });
    if (question.marks !== undefined &&
        (!Number.isInteger(question.marks) || question.marks <= 0)) {
      errors.push(p + '.marks: must be a positive integer when present');
    }
    // Tier and difficulty are worksheet-only (SPEC.md "Worksheet spec"):
    // strict when present, and only checked when the caller is the
    // worksheet validator, so exit-ticket validation is unchanged.
    if (tiered && question.tier !== undefined &&
        QUESTION_TIERS.indexOf(question.tier) === -1) {
      errors.push(p + '.tier: must be ' + QUESTION_TIERS.join('|') + ' when present');
    }
    if (tiered && question.difficulty !== undefined &&
        (!Number.isInteger(question.difficulty) || question.difficulty < 1 || question.difficulty > 5)) {
      errors.push(p + '.difficulty: must be an integer from 1 to 5 when present');
    }
    // Objective is worksheet-only too (SPEC.md "Worksheet spec"): the id
    // of the lesson-plan objective the question serves, a coverage key
    // that is never rendered. Strict when present, worksheets only, so
    // exit-ticket validation is unchanged.
    if (tiered && question.objective !== undefined &&
        (typeof question.objective !== 'string' || !question.objective.trim())) {
      errors.push(p + '.objective: must be a non-empty string when present');
    }
    if (question.workedSolution !== undefined &&
        (typeof question.workedSolution !== 'string' || !question.workedSolution.trim())) {
      errors.push(p + '.workedSolution: must be a non-empty string when present');
    }
    if (question.markScheme !== undefined) {
      checkMarkScheme(question, errors, p);
      if (question.kind === 'short-answer' && question.workedSolution === undefined) {
        errors.push(p + '.workedSolution: required on a short-answer question carrying a markScheme');
      }
    }
    if (QUESTION_KINDS.indexOf(question.kind) === -1) {
      errors.push(p + '.kind: must be ' + QUESTION_KINDS.join('|'));
      return;
    }
    if (question.kind === 'multiple-choice') {
      if (!Array.isArray(question.choices) || question.choices.length < 2) {
        errors.push(p + '.choices: required array of at least 2 choices');
        return;
      }
      var correctCount = 0;
      question.choices.forEach(function (choice, j) {
        var c = p + '.choices[' + j + ']';
        if (!choice || typeof choice !== 'object') { errors.push(c + ': must be an object'); return; }
        if (typeof choice.text !== 'string' || !choice.text.trim()) {
          errors.push(c + '.text: required non-empty string');
        }
        if (choice.correct === true) correctCount++;
      });
      if (correctCount !== 1) {
        errors.push(p + '.choices: exactly one choice must be marked correct');
      }
    } else if (typeof question.answer !== 'string' || !question.answer.trim()) {
      errors.push(p + '.answer: required non-empty string');
    }
  }

  // Shared worksheet / exit-ticket validator: the two contracts differ
  // only in the question-count bounds.
  function validateMaterial(spec, min, max, rangeError, tiered) {
    var errors = [];
    if (!spec || typeof spec !== 'object') return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.questions) || spec.questions.length < min || spec.questions.length > max) {
      errors.push(rangeError);
      return errors;
    }
    var seenIds = {};
    spec.questions.forEach(function (question, i) {
      checkQuestion(question, errors, i, seenIds, tiered);
    });
    return errors;
  }

  // Worksheet validator (SPEC.md "Worksheet spec"): at least 1 question;
  // the answer key is the per-question explanation / misconception fields.
  function validateWorksheet(spec) {
    var errors = validateMaterial(spec, 1, Infinity, 'questions: required array of 1 or more questions', true);
    if (spec && typeof spec === 'object' && spec.variant !== undefined && spec.variant !== 'homework') {
      errors.push('variant: must be homework when present');
    }
    return errors;
  }

  // Exit-ticket validator (SPEC.md "Exit ticket spec"): 3..5 questions;
  // per-answer feedback is keyed to misconceptions on each question.
  function validateExitTicket(spec) {
    var errors = validateMaterial(spec, 3, 5, 'questions: required array of 3..5 questions', false);
    if (spec && typeof spec === 'object' && spec.variant !== undefined) {
      errors.push('variant: exit tickets do not carry a variant');
    }
    return errors;
  }

  // Student notes validator (SPEC.md "Student notes spec"): study notes
  // for a topic -- objectives, definitions, mechanism steps, a worked
  // example, and the trap (misconception plus explanation).
  function validateNotes(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object') return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.objectives) || spec.objectives.length === 0) {
      errors.push('objectives: required non-empty array');
    } else {
      spec.objectives.forEach(function (objective, i) {
        if (typeof objective !== 'string' || !objective.trim()) {
          errors.push('objectives[' + i + ']: required non-empty string');
        }
      });
    }
    if (!Array.isArray(spec.definitions) || spec.definitions.length === 0) {
      errors.push('definitions: required array of at least 1 definition');
    } else {
      spec.definitions.forEach(function (definition, i) {
        var p = 'definitions[' + i + ']';
        if (!definition || typeof definition !== 'object') {
          errors.push(p + ': must be an object');
          return;
        }
        if (typeof definition.term !== 'string' || !definition.term.trim()) {
          errors.push(p + '.term: required non-empty string');
        }
        if (typeof definition.meaning !== 'string' || !definition.meaning.trim()) {
          errors.push(p + '.meaning: required non-empty string');
        }
      });
    }
    if (!Array.isArray(spec.mechanismSteps) || spec.mechanismSteps.length === 0) {
      errors.push('mechanismSteps: required non-empty array');
    } else {
      spec.mechanismSteps.forEach(function (step, i) {
        if (typeof step !== 'string' || !step.trim()) {
          errors.push('mechanismSteps[' + i + ']: required non-empty string');
        }
      });
    }
    if (typeof spec.workedExample !== 'string' || !spec.workedExample.trim()) {
      errors.push('workedExample: required non-empty string');
    }
    if (!spec.trap || typeof spec.trap !== 'object') {
      errors.push('trap: required object');
    } else {
      if (typeof spec.trap.misconception !== 'string' || !spec.trap.misconception.trim()) {
        errors.push('trap.misconception: required non-empty string');
      }
      if (typeof spec.trap.explanation !== 'string' || !spec.trap.explanation.trim()) {
        errors.push('trap.explanation: required non-empty string');
      }
    }
    return errors;
  }

  // Teacher script validator (SPEC.md "Teacher script spec"): a timed
  // delivery script -- segments with minutes, what to say, and optional
  // cue, questions, and watchFor fields. Total timing must be 5..120
  // minutes when every segment has a valid minutes value.
  function validateScript(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object') return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.segments) || spec.segments.length === 0) {
      errors.push('segments: required non-empty array');
      return errors;
    }
    var allMinutesValid = true;
    var totalMinutes = 0;
    spec.segments.forEach(function (segment, i) {
      var p = 'segments[' + i + ']';
      if (!segment || typeof segment !== 'object') {
        errors.push(p + ': must be an object');
        allMinutesValid = false;
        return;
      }
      if (!isNum(segment.minutes) || segment.minutes <= 0) {
        errors.push(p + '.minutes: required positive number');
        allMinutesValid = false;
      } else {
        totalMinutes += segment.minutes;
      }
      if (typeof segment.say !== 'string' || !segment.say.trim()) {
        errors.push(p + '.say: required non-empty string');
      }
      if (segment.cue !== undefined && (typeof segment.cue !== 'string' || !segment.cue.trim())) {
        errors.push(p + '.cue: must be a non-empty string when present');
      }
      if (segment.questions !== undefined) {
        if (!Array.isArray(segment.questions)) {
          errors.push(p + '.questions: must be an array when present');
        } else {
          segment.questions.forEach(function (question, j) {
            if (typeof question !== 'string' || !question.trim()) {
              errors.push(p + '.questions[' + j + ']: required non-empty string');
            }
          });
        }
      }
      if (segment.watchFor !== undefined && (typeof segment.watchFor !== 'string' || !segment.watchFor.trim())) {
        errors.push(p + '.watchFor: must be a non-empty string when present');
      }
    });
    if (allMinutesValid && (totalMinutes < 5 || totalMinutes > 120)) {
      errors.push('segments: total timing must be 5..120 minutes');
    }
    return errors;
  }

  // Required string-array fields on a lesson plan (an objective's
  // successCriteria / assessmentPoints): a non-empty array whose every
  // entry is a non-empty string.
  function checkRequiredStringArray(value, errors, label) {
    if (!Array.isArray(value) || value.length === 0) {
      errors.push(label + ': required non-empty array of non-empty strings');
      return;
    }
    value.forEach(function (entry, j) {
      if (typeof entry !== 'string' || !entry.trim()) {
        errors.push(label + '[' + j + ']: must be a non-empty string');
      }
    });
  }

  // Lesson plan validator (SPEC.md "Lesson plan spec"): the plan a
  // teacher script delivers from -- objectives with unique ids, success
  // criteria and assessment points, and an activity sequence whose
  // minutes sum exactly to durationMinutes.
  function validateLessonPlan(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object') return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!isNum(spec.durationMinutes) || spec.durationMinutes <= 0) {
      errors.push('durationMinutes: required positive number');
    }
    var objectiveIds = {};
    if (!Array.isArray(spec.objectives) || spec.objectives.length === 0) {
      errors.push('objectives: required non-empty array');
    } else {
      spec.objectives.forEach(function (objective, i) {
        var p = 'objectives[' + i + ']';
        if (!objective || typeof objective !== 'object') {
          errors.push(p + ': must be an object');
          return;
        }
        if (typeof objective.id !== 'string' || !objective.id.trim()) {
          errors.push(p + '.id: required non-empty string');
        } else if (objectiveIds[objective.id]) {
          errors.push(p + '.id: duplicate objective id');
        } else {
          objectiveIds[objective.id] = true;
        }
        if (typeof objective.text !== 'string' || !objective.text.trim()) {
          errors.push(p + '.text: required non-empty string');
        }
        checkRequiredStringArray(objective.successCriteria, errors, p + '.successCriteria');
        checkRequiredStringArray(objective.assessmentPoints, errors, p + '.assessmentPoints');
      });
    }
    if (!Array.isArray(spec.activities) || spec.activities.length === 0) {
      errors.push('activities: required non-empty array');
      return errors;
    }
    var allMinutesValid = true;
    var totalMinutes = 0;
    spec.activities.forEach(function (activity, i) {
      var p = 'activities[' + i + ']';
      if (!activity || typeof activity !== 'object') {
        errors.push(p + ': must be an object');
        allMinutesValid = false;
        return;
      }
      if (typeof activity.title !== 'string' || !activity.title.trim()) {
        errors.push(p + '.title: required non-empty string');
      }
      if (!isNum(activity.minutes) || activity.minutes <= 0) {
        errors.push(p + '.minutes: required positive number');
        allMinutesValid = false;
      } else {
        totalMinutes += activity.minutes;
      }
      if (!Array.isArray(activity.objectiveIds) || activity.objectiveIds.length === 0) {
        errors.push(p + '.objectiveIds: required non-empty array');
      } else {
        activity.objectiveIds.forEach(function (id, j) {
          if (typeof id !== 'string' || !id.trim()) {
            errors.push(p + '.objectiveIds[' + j + ']: required non-empty string');
          } else if (!objectiveIds[id]) {
            errors.push(p + '.objectiveIds[' + j + ']: unknown objective id');
          }
        });
      }
      if (activity.scriptCue !== undefined && (typeof activity.scriptCue !== 'string' || !activity.scriptCue.trim())) {
        errors.push(p + '.scriptCue: must be a non-empty string when present');
      }
      if (activity.grouping !== undefined && (typeof activity.grouping !== 'string' || !activity.grouping.trim())) {
        errors.push(p + '.grouping: must be a non-empty string when present');
      }
      if (activity.resources !== undefined) {
        checkStringArray(activity.resources, errors, p + '.resources');
      }
      if (activity.differentiation !== undefined) {
        if (!activity.differentiation || typeof activity.differentiation !== 'object' || Array.isArray(activity.differentiation)) {
          errors.push(p + '.differentiation: must be an object when present');
        } else {
          if (activity.differentiation.support !== undefined && (typeof activity.differentiation.support !== 'string' || !activity.differentiation.support.trim())) {
            errors.push(p + '.differentiation.support: must be a non-empty string when present');
          }
          if (activity.differentiation.stretch !== undefined && (typeof activity.differentiation.stretch !== 'string' || !activity.differentiation.stretch.trim())) {
            errors.push(p + '.differentiation.stretch: must be a non-empty string when present');
          }
        }
      }
    });
    if (allMinutesValid && isNum(spec.durationMinutes) && spec.durationMinutes > 0 && totalMinutes !== spec.durationMinutes) {
      errors.push('activities: minutes must sum to durationMinutes');
    }
    return errors;
  }

  // Scaffolds validator (SPEC.md "Scaffolds spec", issue #1231): the
  // fading support sets paired with the student notes -- each set
  // carries its own word bank, sentence starters, sentence frames and
  // cloze items; support fades in the order full, partial, minimal and
  // no support measure may grow as it fades. Cloze answers are
  // teacher-key only (rendering lands in a later slice).
  var SCAFFOLD_LEVELS = ['full', 'partial', 'minimal'];

  function countGapMarkers(text) {
    return text.split('___').length - 1;
  }

  function validateScaffolds(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.sets) || spec.sets.length < 2) {
      errors.push('sets: required array of at least 2 scaffold sets');
      return errors;
    }
    var countsComplete = true;
    var counts = [];
    spec.sets.forEach(function (set, i) {
      var p = 'sets[' + i + ']';
      if (!set || typeof set !== 'object' || Array.isArray(set)) {
        errors.push(p + ': must be an object');
        countsComplete = false;
        counts.push(null);
        return;
      }
      if (SCAFFOLD_LEVELS.indexOf(set.level) === -1) {
        errors.push(p + '.level: must be one of full|partial|minimal');
      }
      var terms = {};
      if (!Array.isArray(set.wordBank) || set.wordBank.length === 0) {
        errors.push(p + '.wordBank: required non-empty array');
      } else {
        set.wordBank.forEach(function (entry, j) {
          var q = p + '.wordBank[' + j + ']';
          if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            errors.push(q + ': must be an object');
            return;
          }
          if (typeof entry.term !== 'string' || !entry.term.trim()) {
            errors.push(q + '.term: required non-empty string');
          } else if (terms[entry.term]) {
            errors.push(q + '.term: duplicate word-bank term');
          } else {
            terms[entry.term] = true;
          }
          if (typeof entry.gloss !== 'string' || !entry.gloss.trim()) {
            errors.push(q + '.gloss: required non-empty string');
          }
        });
      }
      if (!Array.isArray(set.starters) || set.starters.length === 0) {
        errors.push(p + '.starters: required non-empty array');
      } else {
        set.starters.forEach(function (starter, j) {
          if (typeof starter !== 'string' || !starter.trim()) {
            errors.push(p + '.starters[' + j + ']: required non-empty string');
          }
        });
      }
      if (!Array.isArray(set.frames) || set.frames.length === 0) {
        errors.push(p + '.frames: required non-empty array');
      } else {
        set.frames.forEach(function (frame, j) {
          if (typeof frame !== 'string' || !frame.trim()) {
            errors.push(p + '.frames[' + j + ']: required non-empty string');
          } else if (countGapMarkers(frame) === 0) {
            errors.push(p + '.frames[' + j + ']: must contain a ___ gap marker');
          }
        });
      }
      if (!Array.isArray(set.cloze) || set.cloze.length === 0) {
        errors.push(p + '.cloze: required non-empty array');
      } else {
        set.cloze.forEach(function (item, j) {
          var q = p + '.cloze[' + j + ']';
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            errors.push(q + ': must be an object');
            return;
          }
          var textOk = typeof item.text === 'string' && !!item.text.trim();
          if (!textOk) {
            errors.push(q + '.text: required non-empty string');
          }
          if (!Array.isArray(item.answers) || item.answers.length === 0) {
            errors.push(q + '.answers: required non-empty array');
          } else {
            if (textOk && countGapMarkers(item.text) !== item.answers.length) {
              errors.push(q + '.text: must contain a ___ gap marker for each answer');
            }
            item.answers.forEach(function (answer, k) {
              if (typeof answer !== 'string' || !answer.trim()) {
                errors.push(q + '.answers[' + k + ']: required non-empty string');
              } else if (!terms[answer]) {
                errors.push(q + '.answers[' + k + ']: must be a word-bank term of the same set');
              }
            });
          }
        });
      }
      if (Array.isArray(set.wordBank) && Array.isArray(set.starters) &&
          Array.isArray(set.frames) && Array.isArray(set.cloze)) {
        var gaps = 0;
        set.cloze.forEach(function (item) {
          if (item && Array.isArray(item.answers)) gaps += item.answers.length;
        });
        counts.push({
          wordBank: set.wordBank.length, starters: set.starters.length,
          frames: set.frames.length, gaps: gaps
        });
      } else {
        countsComplete = false;
        counts.push(null);
      }
    });
    if (spec.sets[0] && typeof spec.sets[0] === 'object' && !Array.isArray(spec.sets[0]) &&
        spec.sets[0].level !== 'full') {
      errors.push('sets[0].level: first set must be full');
    }
    var lastIndex = spec.sets.length - 1;
    var lastSet = spec.sets[lastIndex];
    if (lastSet && typeof lastSet === 'object' && !Array.isArray(lastSet) &&
        lastSet.level !== 'minimal') {
      errors.push('sets[' + lastIndex + '].level: last set must be minimal');
    }
    for (var i = 1; i < spec.sets.length; i++) {
      var prev = spec.sets[i - 1];
      var curr = spec.sets[i];
      var prevRank = prev && typeof prev === 'object' ? SCAFFOLD_LEVELS.indexOf(prev.level) : -1;
      var currRank = curr && typeof curr === 'object' ? SCAFFOLD_LEVELS.indexOf(curr.level) : -1;
      if (prevRank !== -1 && currRank !== -1 && currRank <= prevRank) {
        errors.push('sets[' + i + '].level: levels must fade in order full, partial, minimal without repeats');
      }
    }
    if (countsComplete) {
      for (var c = 1; c < counts.length; c++) {
        if (counts[c].wordBank > counts[c - 1].wordBank) {
          errors.push('sets[' + c + ']: word bank must not grow as support fades');
        }
        if (counts[c].starters > counts[c - 1].starters) {
          errors.push('sets[' + c + ']: starters must not grow as support fades');
        }
        if (counts[c].frames > counts[c - 1].frames) {
          errors.push('sets[' + c + ']: frames must not grow as support fades');
        }
        if (counts[c].gaps > counts[c - 1].gaps) {
          errors.push('sets[' + c + ']: cloze gaps must not grow as support fades');
        }
      }
    }
    return errors;
  }

  // Diagnostics validator (SPEC.md "Diagnostics spec", issue #1241):
  // a Do Now of 2..4 prior-knowledge questions plus 1..3 hinge
  // questions, all multiple-choice. Every incorrect choice is coded to
  // a bank misconception and carries a teacher-only rationale
  // (chose/thinks/reteach); the correct choice carries neither. The
  // validator is bank-free: it checks code presence and shape only.
  var RATIONALE_PARTS = ['chose', 'thinks', 'reteach'];

  function checkDiagnosticsQuestion(question, errors, path, seenIds, isHinge) {
    var p = path;
    if (!question || typeof question !== 'object' || Array.isArray(question)) {
      errors.push(p + ': must be an object');
      return;
    }
    if (typeof question.id !== 'string' || !question.id.trim()) {
      errors.push(p + '.id: required non-empty string');
    } else if (seenIds[question.id]) {
      errors.push(p + '.id: duplicate question id "' + question.id + '"');
    } else {
      seenIds[question.id] = true;
    }
    if (typeof question.prompt !== 'string' || !question.prompt.trim()) {
      errors.push(p + '.prompt: required non-empty string');
    }
    if (question.kind !== 'multiple-choice') {
      errors.push(p + '.kind: must be multiple-choice');
    }
    if (isHinge) {
      if (typeof question.scriptCue !== 'string' || !question.scriptCue.trim()) {
        errors.push(p + '.scriptCue: required non-empty string on hinge questions');
      }
    } else if (question.scriptCue !== undefined) {
      errors.push(p + '.scriptCue: belongs on hinge questions only');
    }
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      errors.push(p + '.choices: required array of at least 2 choices');
      return;
    }
    var correctCount = 0;
    question.choices.forEach(function (choice, j) {
      var c = p + '.choices[' + j + ']';
      if (!choice || typeof choice !== 'object' || Array.isArray(choice)) {
        errors.push(c + ': must be an object');
        return;
      }
      if (typeof choice.text !== 'string' || !choice.text.trim()) {
        errors.push(c + '.text: required non-empty string');
      }
      if (choice.correct === true) {
        correctCount++;
        if (choice.misconception !== undefined) {
          errors.push(c + '.misconception: must not appear on the correct choice');
        }
        if (choice.rationale !== undefined) {
          errors.push(c + '.rationale: must not appear on the correct choice');
        }
        return;
      }
      if (typeof choice.misconception !== 'string' || !choice.misconception.trim()) {
        errors.push(c + '.misconception: required non-empty string on an incorrect choice');
      }
      var rationale = choice.rationale;
      if (!rationale || typeof rationale !== 'object' || Array.isArray(rationale)) {
        errors.push(c + '.rationale: required object on an incorrect choice');
        return;
      }
      var keys = Object.keys(rationale);
      var extra = keys.filter(function (k) { return RATIONALE_PARTS.indexOf(k) === -1; });
      if (extra.length) {
        errors.push(c + '.rationale: must carry exactly the chose, thinks and reteach parts');
      }
      var shapeValid = extra.length === 0;
      RATIONALE_PARTS.forEach(function (part) {
        if (typeof rationale[part] !== 'string' || !rationale[part].trim()) {
          errors.push(c + '.rationale.' + part + ': required non-empty string');
          shapeValid = false;
        }
      });
      if (!shapeValid) return;
      RATIONALE_PARTS.forEach(function (part) {
        var text = rationale[part].trim();
        if (text.length < 4) return;
        var leaked = (typeof question.prompt === 'string' && question.prompt.indexOf(text) !== -1);
        if (!leaked) {
          leaked = question.choices.some(function (other) {
            return other && typeof other.text === 'string' && other.text.indexOf(text) !== -1;
          });
        }
        if (leaked) {
          errors.push(c + '.rationale.' + part + ': rationale text must not appear in the prompt or choice text (teacher-only)');
        }
      });
    });
    if (correctCount !== 1) {
      errors.push(p + '.choices: exactly one choice must be marked correct');
    }
  }

  function validateDiagnostics(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.doNow) || spec.doNow.length < 2 || spec.doNow.length > 4) {
      errors.push('doNow: required array of 2..4 questions');
      return errors;
    }
    if (!Array.isArray(spec.hingeQuestions) || spec.hingeQuestions.length < 1 || spec.hingeQuestions.length > 3) {
      errors.push('hingeQuestions: required array of 1..3 questions');
      return errors;
    }
    var seenIds = {};
    spec.doNow.forEach(function (question, i) {
      checkDiagnosticsQuestion(question, errors, 'doNow[' + i + ']', seenIds, false);
    });
    spec.hingeQuestions.forEach(function (question, i) {
      checkDiagnosticsQuestion(question, errors, 'hingeQuestions[' + i + ']', seenIds, true);
    });
    return errors;
  }

  // Worked-example set validator (SPEC.md "Worked-example set spec",
  // issue #1248): a complete annotated example, a faded example whose
  // withheld steps form a suffix, and a paired problem whose solution
  // is teacher-key only. Presence and shape only.
  function checkWorkedSteps(steps, errors, p, annotationsRequired) {
    if (!Array.isArray(steps) || steps.length < 2) {
      errors.push(p + '.steps: required array of at least 2 steps');
      return;
    }
    steps.forEach(function (step, j) {
      var q = p + '.steps[' + j + ']';
      if (!step || typeof step !== 'object' || Array.isArray(step)) {
        errors.push(q + ': must be an object');
        return;
      }
      if (typeof step.text !== 'string' || !step.text.trim()) {
        errors.push(q + '.text: required non-empty string');
      }
      if (annotationsRequired) {
        if (typeof step.annotation !== 'string' || !step.annotation.trim()) {
          errors.push(q + '.annotation: required non-empty string');
        }
      } else if (step.annotation !== undefined &&
          (typeof step.annotation !== 'string' || !step.annotation.trim())) {
        errors.push(q + '.annotation: must be a non-empty string when present');
      }
    });
  }

  function checkWorkedExample(example, errors, p, isFaded) {
    if (!example || typeof example !== 'object' || Array.isArray(example)) {
      errors.push(p + ': must be an object');
      return;
    }
    if (typeof example.problem !== 'string' || !example.problem.trim()) {
      errors.push(p + '.problem: required non-empty string');
    }
    checkWorkedSteps(example.steps, errors, p, !isFaded);
    if (isFaded && Array.isArray(example.steps) && example.steps.length >= 2) {
      var allBoolean = example.steps.every(function (step) {
        return step && typeof step === 'object' && !Array.isArray(step) &&
          typeof step.withheld === 'boolean';
      });
      example.steps.forEach(function (step, j) {
        if (!step || typeof step !== 'object' || Array.isArray(step)) return;
        if (typeof step.withheld !== 'boolean') {
          errors.push(p + '.steps[' + j + '].withheld: required boolean');
        }
      });
      if (allBoolean) {
        var shown = 0;
        var withheldCount = 0;
        var seenWithheld = false;
        var suffixBroken = false;
        example.steps.forEach(function (step) {
          if (step.withheld) { withheldCount++; seenWithheld = true; }
          else { shown++; if (seenWithheld) suffixBroken = true; }
        });
        if (shown === 0) errors.push(p + '.steps: at least one step must be shown');
        if (withheldCount === 0) errors.push(p + '.steps: at least one step must be withheld');
        if (suffixBroken) errors.push(p + '.steps: withheld steps must form a suffix (once a step is withheld, every later step is withheld)');
      }
    }
    if (typeof example.selfExplanation !== 'string' || !example.selfExplanation.trim()) {
      errors.push(p + '.selfExplanation: required non-empty string');
    }
  }

  function validateWorkedExamples(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    checkWorkedExample(spec.complete, errors, 'complete', false);
    checkWorkedExample(spec.faded, errors, 'faded', true);
    var paired = spec.paired;
    if (!paired || typeof paired !== 'object' || Array.isArray(paired)) {
      errors.push('paired: must be an object');
    } else {
      if (typeof paired.problem !== 'string' || !paired.problem.trim()) {
        errors.push('paired.problem: required non-empty string');
      }
      if (typeof paired.solution !== 'string' || !paired.solution.trim()) {
        errors.push('paired.solution: required non-empty string');
      }
    }
    return errors;
  }

  // Quiz bank validator (SPEC.md "Quiz bank spec", issue #1255): a
  // per-topic cumulative retrieval bank - the diagnostics-mirroring
  // material header plus at least 4 retrieval items. Each item carries
  // a prompt and a teacher-key answer; choices, a misconception code
  // (the topic bank wrongTurn verbatim when present) and an outcome
  // code are optional. Presence and shape only - the validator never
  // checks bank membership.
  function validateQuizBank(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.items) || spec.items.length < 4) {
      errors.push('items: required array of at least 4 retrieval items');
      return errors;
    }
    spec.items.forEach(function (item, i) {
      var p = 'items[' + i + ']';
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(p + ': must be an object');
        return;
      }
      if (typeof item.prompt !== 'string' || !item.prompt.trim()) {
        errors.push(p + '.prompt: required non-empty string');
      }
      if (typeof item.answer !== 'string' || !item.answer.trim()) {
        errors.push(p + '.answer: required non-empty string (teacher key)');
      }
      if (item.choices !== undefined) {
        if (!Array.isArray(item.choices) || item.choices.length < 2) {
          errors.push(p + '.choices: must be an array of at least 2 strings when present');
        } else {
          item.choices.forEach(function (choice, j) {
            if (typeof choice !== 'string' || !choice.trim()) {
              errors.push(p + '.choices[' + j + ']: must be a non-empty string');
            }
          });
        }
      }
      if (item.misconceptionCode !== undefined &&
          (typeof item.misconceptionCode !== 'string' || !item.misconceptionCode.trim())) {
        errors.push(p + '.misconceptionCode: must be a non-empty string when present');
      }
      if (item.outcomeCode !== undefined &&
          (typeof item.outcomeCode !== 'string' || !item.outcomeCode.trim())) {
        errors.push(p + '.outcomeCode: must be a non-empty string when present');
      }
    });
    return errors;
  }

  // Revision validator (SPEC.md "Revision spec", issue #1268): a
  // per-topic revision material - the sibling material header plus
  // flashcards derived from the paired quiz bank and notes, and
  // spaced-practice sets at strictly increasing day offsets. Each
  // flashcard carries a front, a back and a source naming where it was
  // derived from; each practice set carries a positive integer
  // dayOffset and a non-empty items array of {prompt, answer}.
  // Presence and shape only - the validator never checks derivation
  // or bank membership.
  var REVISION_SOURCES = ['quiz-bank', 'definition', 'trap'];
  function validateRevision(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.flashcards) || spec.flashcards.length < 4) {
      errors.push('flashcards: required array of at least 4 flashcards');
    } else {
      spec.flashcards.forEach(function (card, i) {
        var p = 'flashcards[' + i + ']';
        if (!card || typeof card !== 'object' || Array.isArray(card)) {
          errors.push(p + ': must be an object');
          return;
        }
        if (typeof card.front !== 'string' || !card.front.trim()) {
          errors.push(p + '.front: required non-empty string');
        }
        if (typeof card.back !== 'string' || !card.back.trim()) {
          errors.push(p + '.back: required non-empty string');
        }
        if (REVISION_SOURCES.indexOf(card.source) === -1) {
          errors.push(p + '.source: must be one of ' + REVISION_SOURCES.join('|'));
        }
      });
    }
    if (!Array.isArray(spec.practiceSets) || spec.practiceSets.length < 2) {
      errors.push('practiceSets: required array of at least 2 practice sets');
    } else {
      var prevOffset = 0;
      spec.practiceSets.forEach(function (set, i) {
        var p = 'practiceSets[' + i + ']';
        if (!set || typeof set !== 'object' || Array.isArray(set)) {
          errors.push(p + ': must be an object');
          return;
        }
        if (!Number.isInteger(set.dayOffset) || set.dayOffset <= 0) {
          errors.push(p + '.dayOffset: must be a positive integer');
        } else {
          if (set.dayOffset <= prevOffset) {
            errors.push(p + '.dayOffset: must be strictly increasing across practice sets');
          }
          prevOffset = set.dayOffset;
        }
        if (!Array.isArray(set.items) || set.items.length === 0) {
          errors.push(p + '.items: required non-empty array of practice items');
        } else {
          set.items.forEach(function (item, j) {
            var q = p + '.items[' + j + ']';
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
              errors.push(q + ': must be an object');
              return;
            }
            if (typeof item.prompt !== 'string' || !item.prompt.trim()) {
              errors.push(q + '.prompt: required non-empty string');
            }
            if (typeof item.answer !== 'string' || !item.answer.trim()) {
              errors.push(q + '.answer: required non-empty string');
            }
          });
        }
      });
    }
    return errors;
  }

  // Organisers validator (SPEC.md "Organisers spec", issue #1277): a
  // per-topic graphic organisers material - the sibling material
  // header plus at least 2 templates. Each template carries a kind
  // (one of kwl, frayer, venn, flow, concept-map) and a non-empty
  // slots array; each slot carries a label, a non-empty entries array
  // of non-empty strings and an optional studentPrompt. Entries are
  // derived verbatim (a flow template's entries are the unpack stages
  // in order; other templates draw from the paired notes
  // mechanismSteps and definitions) - presence and shape only, the
  // validator never checks derivation.
  var ORGANISER_KINDS = ['kwl', 'frayer', 'venn', 'flow', 'concept-map'];
  function validateOrganisers(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.templates) || spec.templates.length < 2) {
      errors.push('templates: required array of at least 2 templates');
      return errors;
    }
    spec.templates.forEach(function (template, i) {
      var p = 'templates[' + i + ']';
      if (!template || typeof template !== 'object' || Array.isArray(template)) {
        errors.push(p + ': must be an object');
        return;
      }
      if (ORGANISER_KINDS.indexOf(template.kind) === -1) {
        errors.push(p + '.kind: must be one of ' + ORGANISER_KINDS.join('|'));
      }
      if (!Array.isArray(template.slots) || template.slots.length === 0) {
        errors.push(p + '.slots: required non-empty array of slots');
        return;
      }
      template.slots.forEach(function (slot, j) {
        var q = p + '.slots[' + j + ']';
        if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
          errors.push(q + ': must be an object');
          return;
        }
        if (typeof slot.label !== 'string' || !slot.label.trim()) {
          errors.push(q + '.label: required non-empty string');
        }
        if (!Array.isArray(slot.entries) || slot.entries.length === 0) {
          errors.push(q + '.entries: required non-empty array of non-empty strings');
        } else {
          slot.entries.forEach(function (entry, k) {
            if (typeof entry !== 'string' || !entry.trim()) {
              errors.push(q + '.entries[' + k + ']: must be a non-empty string');
            }
          });
        }
        if (slot.studentPrompt !== undefined &&
            (typeof slot.studentPrompt !== 'string' || !slot.studentPrompt.trim())) {
          errors.push(q + '.studentPrompt: must be a non-empty string when present');
        }
      });
    });
    return errors;
  }

  // Glossary validator (SPEC.md "Glossary spec", issue #1283): a
  // standalone per-topic reference pack - the sibling material
  // header plus at least 3 entries. Each entry carries a term, a
  // meaning and an example, all required non-empty strings. Term
  // and meaning are a paired notes definition verbatim and the
  // example is grounded in the paired notes content - presence and
  // shape only, the validator never checks derivation.
  function validateGlossary(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.entries) || spec.entries.length < 3) {
      errors.push('entries: required array of at least 3 entries');
      return errors;
    }
    spec.entries.forEach(function (entry, i) {
      var p = 'entries[' + i + ']';
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(p + ': must be an object');
        return;
      }
      if (typeof entry.term !== 'string' || !entry.term.trim()) {
        errors.push(p + '.term: required non-empty string');
      }
      if (typeof entry.meaning !== 'string' || !entry.meaning.trim()) {
        errors.push(p + '.meaning: required non-empty string');
      }
      if (typeof entry.example !== 'string' || !entry.example.trim()) {
        errors.push(p + '.example: required non-empty string');
      }
    });
    return errors;
  }

  // Feedback validator (SPEC.md "Feedback spec", issue #1295): one
  // combined topic-level material - strengths, model answers,
  // common errors with fix-it tasks, next steps. Presence and
  // shape only; derivation from the paired assessment materials is
  // pinned by the gold test, never by this validator.
  function validateFeedback(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    checkMaterialHeader(spec, errors);
    if (!Array.isArray(spec.strengths) || spec.strengths.length < 1) {
      errors.push('strengths: required array of at least 1 non-empty strings');
    } else {
      spec.strengths.forEach(function (s, i) {
        if (typeof s !== 'string' || !s.trim()) errors.push('strengths[' + i + ']: must be a non-empty string');
      });
    }
    if (!Array.isArray(spec.modelAnswers) || spec.modelAnswers.length < 2) {
      errors.push('modelAnswers: required array of at least 2 entries');
    } else {
      spec.modelAnswers.forEach(function (entry, i) {
        var p = 'modelAnswers[' + i + ']';
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          errors.push(p + ': must be an object');
          return;
        }
        if (typeof entry.question !== 'string' || !entry.question.trim()) {
          errors.push(p + '.question: required non-empty string');
        }
        if (typeof entry.answer !== 'string' || !entry.answer.trim()) {
          errors.push(p + '.answer: required non-empty string');
        }
        if (!Array.isArray(entry.creditPoints)) {
          errors.push(p + '.creditPoints: required array of strings');
        } else {
          entry.creditPoints.forEach(function (cp, j) {
            if (typeof cp !== 'string' || !cp.trim()) {
              errors.push(p + '.creditPoints[' + j + ']: must be a non-empty string');
            }
          });
        }
      });
    }
    if (!Array.isArray(spec.commonErrors) || spec.commonErrors.length < 2) {
      errors.push('commonErrors: required array of at least 2 entries');
    } else {
      spec.commonErrors.forEach(function (entry, i) {
        var p = 'commonErrors[' + i + ']';
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          errors.push(p + ': must be an object');
          return;
        }
        if (typeof entry.misconception !== 'string' || !entry.misconception.trim()) {
          errors.push(p + '.misconception: required non-empty string');
        }
        if (typeof entry.example !== 'string' || !entry.example.trim()) {
          errors.push(p + '.example: required non-empty string');
        }
        if (!entry.fixIt || typeof entry.fixIt !== 'object' || Array.isArray(entry.fixIt)) {
          errors.push(p + '.fixIt: must be an object');
        } else {
          if (typeof entry.fixIt.prompt !== 'string' || !entry.fixIt.prompt.trim()) {
            errors.push(p + '.fixIt.prompt: required non-empty string');
          }
          if (typeof entry.fixIt.corrected !== 'string' || !entry.fixIt.corrected.trim()) {
            errors.push(p + '.fixIt.corrected: required non-empty string');
          }
        }
      });
    }
    if (!Array.isArray(spec.nextSteps) || spec.nextSteps.length < 1) {
      errors.push('nextSteps: required array of at least 1 non-empty strings');
    } else {
      spec.nextSteps.forEach(function (s, i) {
        if (typeof s !== 'string' || !s.trim()) errors.push('nextSteps[' + i + ']: must be a non-empty string');
      });
    }
    return errors;
  }

  // Summative assessment validator (SPEC.md "Summative assessment
  // spec", issue #1259): a unit-level assessment spanning at least 2
  // topics. The blueprint rows carry the outcome / assessment
  // objective / marks / cognitive level grid and their marks sum to
  // totalMarks; every item references a blueprint row by index and
  // the items on a row sum to that row's marks. Item mark schemes go
  // through the Phase A1 checkMarkScheme machinery. The rubric is a
  // field inside the material, and moderation reuses the Phase A3
  // pack metadata states: state approved requires a review record
  // {reviewer, date} on the material.
  function validateSummative(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    if (typeof spec.title !== 'string' || !spec.title.trim()) errors.push('title: required non-empty string');
    if (LEVELS.indexOf(spec.level) === -1) errors.push('level: must be ' + LEVELS.join('|'));
    if (typeof spec.subject !== 'string' || !spec.subject.trim()) errors.push('subject: required non-empty string');
    if (typeof spec.unitTitle !== 'string' || !spec.unitTitle.trim()) errors.push('unitTitle: required non-empty string');
    if (!Array.isArray(spec.topics) || spec.topics.length < 2) {
      errors.push('topics: required array of at least 2 topic slugs');
    } else {
      spec.topics.forEach(function (topic, i) {
        if (typeof topic !== 'string' || !topic.trim()) {
          errors.push('topics[' + i + ']: must be a non-empty string');
        }
      });
    }
    if (!Number.isInteger(spec.durationMinutes) || spec.durationMinutes <= 0) {
      errors.push('durationMinutes: must be a positive integer');
    }
    var totalValid = Number.isInteger(spec.totalMarks) && spec.totalMarks > 0;
    if (!totalValid) errors.push('totalMarks: must be a positive integer');
    var rowMarks = [];
    var rowsValid = true;
    if (!Array.isArray(spec.blueprint) || spec.blueprint.length === 0) {
      errors.push('blueprint: required non-empty array of blueprint rows');
      rowsValid = false;
    } else {
      var blueprintSum = 0;
      spec.blueprint.forEach(function (row, i) {
        var p = 'blueprint[' + i + ']';
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
          errors.push(p + ': must be an object');
          rowsValid = false;
          rowMarks.push(null);
          return;
        }
        if (typeof row.outcomeCode !== 'string' || !row.outcomeCode.trim()) {
          errors.push(p + '.outcomeCode: required non-empty string');
        }
        if (typeof row.assessmentObjective !== 'string' || !row.assessmentObjective.trim()) {
          errors.push(p + '.assessmentObjective: required non-empty string');
        }
        if (typeof row.cognitiveLevel !== 'string' || !row.cognitiveLevel.trim()) {
          errors.push(p + '.cognitiveLevel: required non-empty string');
        }
        if (!Number.isInteger(row.marks) || row.marks <= 0) {
          errors.push(p + '.marks: must be a positive integer');
          rowsValid = false;
          rowMarks.push(null);
        } else {
          blueprintSum += row.marks;
          rowMarks.push(row.marks);
        }
      });
      if (rowsValid && totalValid && blueprintSum !== spec.totalMarks) {
        errors.push('blueprint: row marks sum to ' + blueprintSum + ', not totalMarks ' + spec.totalMarks);
      }
    }
    if (!Array.isArray(spec.items) || spec.items.length === 0) {
      errors.push('items: required non-empty array of assessment items');
    } else {
      var rowItemSums = rowMarks.map(function () { return 0; });
      var rowItemCounts = rowMarks.map(function () { return 0; });
      var itemsValid = true;
      spec.items.forEach(function (item, i) {
        var p = 'items[' + i + ']';
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          errors.push(p + ': must be an object');
          itemsValid = false;
          return;
        }
        if (typeof item.prompt !== 'string' || !item.prompt.trim()) {
          errors.push(p + '.prompt: required non-empty string');
        }
        var rowOk = Number.isInteger(item.blueprintRow) && Array.isArray(spec.blueprint) &&
          item.blueprintRow >= 0 && item.blueprintRow < spec.blueprint.length;
        if (!rowOk) {
          errors.push(p + '.blueprintRow: must be an integer index into blueprint');
          itemsValid = false;
        }
        if (typeof item.commandWord !== 'string' || !item.commandWord.trim()) {
          errors.push(p + '.commandWord: required non-empty string');
        }
        if (!Number.isInteger(item.marks) || item.marks <= 0) {
          errors.push(p + '.marks: must be a positive integer');
          itemsValid = false;
        } else if (rowOk) {
          rowItemSums[item.blueprintRow] += item.marks;
          rowItemCounts[item.blueprintRow] += 1;
        }
        if (item.markScheme === undefined) {
          errors.push(p + '.markScheme: required object with credit points summing to the item marks');
        } else {
          checkMarkScheme(item, errors, p);
        }
      });
      if (itemsValid && rowsValid) {
        rowMarks.forEach(function (marks, r) {
          if (rowItemCounts[r] === 0) {
            errors.push('blueprint[' + r + ']: no items reference this blueprint row');
          } else if (rowItemSums[r] !== marks) {
            errors.push('blueprint[' + r + ']: item marks sum to ' + rowItemSums[r] + ', not the blueprint row marks ' + marks);
          }
        });
      }
    }
    if (!spec.rubric || typeof spec.rubric !== 'object' || Array.isArray(spec.rubric)) {
      errors.push('rubric: required object with at least 1 criterion');
    } else if (!Array.isArray(spec.rubric.criteria) || spec.rubric.criteria.length === 0) {
      errors.push('rubric.criteria: required non-empty array of criteria');
    } else {
      spec.rubric.criteria.forEach(function (criterion, i) {
        var p = 'rubric.criteria[' + i + ']';
        if (!criterion || typeof criterion !== 'object' || Array.isArray(criterion)) {
          errors.push(p + ': must be an object');
          return;
        }
        if (typeof criterion.name !== 'string' || !criterion.name.trim()) {
          errors.push(p + '.name: required non-empty string');
        }
        if (!Array.isArray(criterion.levels) || criterion.levels.length < 2) {
          errors.push(p + '.levels: required array of at least 2 levels');
          return;
        }
        criterion.levels.forEach(function (level, j) {
          var q = p + '.levels[' + j + ']';
          if (!level || typeof level !== 'object' || Array.isArray(level)) {
            errors.push(q + ': must be an object');
            return;
          }
          if (typeof level.label !== 'string' || !level.label.trim()) {
            errors.push(q + '.label: required non-empty string');
          }
          if (typeof level.descriptor !== 'string' || !level.descriptor.trim()) {
            errors.push(q + '.descriptor: required non-empty string');
          }
        });
      });
    }
    if (!spec.moderation || typeof spec.moderation !== 'object' || Array.isArray(spec.moderation)) {
      errors.push('moderation: required object with a state');
    } else if (MODERATION_STATES.indexOf(spec.moderation.state) === -1) {
      errors.push('moderation.state: must be one of ' + MODERATION_STATES.join('|'));
    }
    if (spec.review !== undefined && spec.review !== null) {
      if (!spec.review || typeof spec.review !== 'object' || Array.isArray(spec.review)) {
        errors.push('review: must be null or an object with reviewer and date');
      } else {
        if (typeof spec.review.reviewer !== 'string' || !spec.review.reviewer.trim()) {
          errors.push('review.reviewer: required non-empty string');
        }
        if (typeof spec.review.date !== 'string' || !spec.review.date.trim()) {
          errors.push('review.date: required non-empty string');
        }
      }
    }
    if (spec.moderation && !Array.isArray(spec.moderation) &&
        spec.moderation.state === 'approved' &&
        (!spec.review || typeof spec.review !== 'object' || Array.isArray(spec.review) ||
         typeof spec.review.reviewer !== 'string' || !spec.review.reviewer.trim() ||
         typeof spec.review.date !== 'string' || !spec.review.date.trim())) {
      errors.push('moderation: state approved requires a review record {reviewer, date}');
    }
    return errors;
  }

  // Scheme of work validator (SPEC.md "Scheme of work spec",
  // issue #1290): a unit-level term plan whose sequence orders at
  // least 2 topics in teaching order. Structural rules beyond
  // presence and shape: every entry week lies within the term
  // (1..weeks), and every prerequisite names the topic of an
  // EARLIER entry - no self, forward or duplicate prerequisites.
  // Assessment points reference materials by kind, never by id.
  var ASSESSMENT_POINT_KINDS = ['diagnostics', 'quizBank', 'summative', 'review'];
  function validateScheme(spec) {
    var errors = [];
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return ['spec: must be an object'];
    if (typeof spec.title !== 'string' || !spec.title.trim()) errors.push('title: required non-empty string');
    if (LEVELS.indexOf(spec.level) === -1) errors.push('level: must be ' + LEVELS.join('|'));
    if (typeof spec.subject !== 'string' || !spec.subject.trim()) errors.push('subject: required non-empty string');
    if (typeof spec.unitTitle !== 'string' || !spec.unitTitle.trim()) errors.push('unitTitle: required non-empty string');
    if (typeof spec.term !== 'string' || !spec.term.trim()) errors.push('term: required non-empty string');
    var weeksValid = Number.isInteger(spec.weeks) && spec.weeks > 0;
    if (!weeksValid) errors.push('weeks: must be a positive integer');
    if (!Array.isArray(spec.sequence) || spec.sequence.length < 2) {
      errors.push('sequence: required array of at least 2 entries in teaching order');
    } else {
      var seenTopics = [];
      spec.sequence.forEach(function (entry, i) {
        var p = 'sequence[' + i + ']';
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          errors.push(p + ': must be an object');
          return;
        }
        var topicOk = typeof entry.topic === 'string' && !!entry.topic.trim();
        if (!topicOk) errors.push(p + '.topic: required non-empty string');
        if (!Number.isInteger(entry.week) || entry.week <= 0) {
          errors.push(p + '.week: must be a positive integer');
        } else if (weeksValid && entry.week > spec.weeks) {
          errors.push(p + '.week: must be at most weeks (' + spec.weeks + ')');
        }
        if (!Number.isInteger(entry.lessons) || entry.lessons <= 0) {
          errors.push(p + '.lessons: must be a positive integer');
        }
        if (!Array.isArray(entry.prerequisites)) {
          errors.push(p + '.prerequisites: required array of topic strings');
        } else {
          var seenPrereqs = [];
          entry.prerequisites.forEach(function (prereq, j) {
            var q = p + '.prerequisites[' + j + ']';
            if (typeof prereq !== 'string' || !prereq.trim()) {
              errors.push(q + ': must be a non-empty string');
              return;
            }
            if (seenPrereqs.indexOf(prereq) !== -1) {
              errors.push(q + ': duplicate prerequisite ' + prereq);
              return;
            }
            seenPrereqs.push(prereq);
            if (seenTopics.indexOf(prereq) === -1) {
              errors.push(q + ': prerequisite ' + prereq + ' does not name an earlier entry topic');
            }
          });
        }
        if (!Array.isArray(entry.assessmentPoints)) {
          errors.push(p + '.assessmentPoints: required array of assessment points');
        } else {
          entry.assessmentPoints.forEach(function (point, j) {
            var q = p + '.assessmentPoints[' + j + ']';
            if (!point || typeof point !== 'object' || Array.isArray(point)) {
              errors.push(q + ': must be an object');
              return;
            }
            if (ASSESSMENT_POINT_KINDS.indexOf(point.kind) === -1) {
              errors.push(q + '.kind: must be one of ' + ASSESSMENT_POINT_KINDS.join('|'));
            }
            if (typeof point.title !== 'string' || !point.title.trim()) {
              errors.push(q + '.title: required non-empty string');
            }
          });
        }
        if (topicOk) seenTopics.push(entry.topic);
      });
    }
    return errors;
  }

  // Pack metadata validator (SPEC.md "Lesson pack spec", issue #1221):
  // the transparency block every generated pack manifest carries -- the
  // syllabus mapping recorded as facts, the AI-generated label, the
  // review sign-off (null until signed) and the moderation state.
  function checkCodeList(list, errors, p) {
    if (!Array.isArray(list)) { errors.push(p + ': required array'); return; }
    list.forEach(function (entry, i) {
      var q = p + '[' + i + ']';
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(q + ': must be an object');
        return;
      }
      if (typeof entry.code !== 'string' || !entry.code.trim()) errors.push(q + '.code: required non-empty string');
      if (typeof entry.title !== 'string' || !entry.title.trim()) errors.push(q + '.title: required non-empty string');
    });
  }

  var MODERATION_STATES = ['unreviewed', 'in-moderation', 'approved', 'rejected'];

  function validatePackMetadata(metadata) {
    var errors = [];
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return ['metadata: must be an object'];
    if (metadata.syllabusYear !== null && (!isNum(metadata.syllabusYear) || Math.floor(metadata.syllabusYear) !== metadata.syllabusYear || metadata.syllabusYear <= 0)) {
      errors.push('metadata.syllabusYear: must be null or a positive integer year');
    }
    checkCodeList(metadata.outcomeCodes, errors, 'metadata.outcomeCodes');
    checkCodeList(metadata.assessmentObjectives, errors, 'metadata.assessmentObjectives');
    if (!metadata.aiGenerated || typeof metadata.aiGenerated !== 'object' || Array.isArray(metadata.aiGenerated)) {
      errors.push('metadata.aiGenerated: must be an object');
    } else {
      if (typeof metadata.aiGenerated.label !== 'string' || !metadata.aiGenerated.label.trim()) errors.push('metadata.aiGenerated.label: required non-empty string');
      if (typeof metadata.aiGenerated.model !== 'string' || !metadata.aiGenerated.model.trim()) errors.push('metadata.aiGenerated.model: required non-empty string');
      if (typeof metadata.aiGenerated.generatorVersion !== 'string' || !metadata.aiGenerated.generatorVersion.trim()) errors.push('metadata.aiGenerated.generatorVersion: required non-empty string');
    }
    if (metadata.review !== null) {
      if (!metadata.review || typeof metadata.review !== 'object' || Array.isArray(metadata.review)) {
        errors.push('metadata.review: must be null or an object');
      } else {
        if (typeof metadata.review.reviewer !== 'string' || !metadata.review.reviewer.trim()) errors.push('metadata.review.reviewer: required non-empty string');
        if (typeof metadata.review.reviewDate !== 'string' || !metadata.review.reviewDate.trim()) errors.push('metadata.review.reviewDate: required non-empty string');
      }
    }
    if (!metadata.moderation || typeof metadata.moderation !== 'object' || Array.isArray(metadata.moderation)) {
      errors.push('metadata.moderation: must be an object');
    } else if (MODERATION_STATES.indexOf(metadata.moderation.state) === -1) {
      errors.push('metadata.moderation.state: must be one of ' + MODERATION_STATES.join('|'));
    }
    return errors;
  }

  return { validateSpec: validateSpec, validateSlides: validateSlides, validateWorksheet: validateWorksheet, validateExitTicket: validateExitTicket, validateNotes: validateNotes, validateScript: validateScript, validateLessonPlan: validateLessonPlan, validateScaffolds: validateScaffolds, validateDiagnostics: validateDiagnostics, validateWorkedExamples: validateWorkedExamples, validateQuizBank: validateQuizBank, validateRevision: validateRevision, validateOrganisers: validateOrganisers, validateGlossary: validateGlossary, validateFeedback: validateFeedback, validateSummative: validateSummative, validateScheme: validateScheme, validatePackMetadata: validatePackMetadata, SUBJECTS: SUBJECTS };
});

/* ------------------------------------------------------------------
 * Node CLI entry point (issue #500): `node player/validate.js <spec.json>`
 *
 * Node-only and guarded by `require.main === module`, so requiring this
 * file as a module — or loading it in a browser via the UMD wrapper
 * above — never runs the CLI. The validator itself is untouched.
 * ------------------------------------------------------------------ */
(function validateCli() {
  'use strict';
  // Browser / non-Node runtimes: the UMD wrapper above already exported the API.
  if (typeof require === 'undefined' || typeof module === 'undefined' || !module.exports) return;
  var validateSpec = module.exports.validateSpec;

  function cliUsage() {
    return 'Usage: node player/validate.js <spec.json>\n' +
      'Validate an animath animation spec file against SPEC.md.\n' +
      'Exit codes: 0 = valid spec; 2 = spec has validation errors; 1 = bad\n' +
      'arguments, unreadable file, or invalid JSON.';
  }

  // Pure CLI core: returns { code, output }. Exercised via spawnSync (the
  // child process's coverage merges into the parent report under
  // `node --test --experimental-test-coverage`).
  function cliMain(args, readFileSync) {
    if (args.length !== 1) {
      return { code: 1, output: 'error: expected exactly one <spec.json> argument\n\n' + cliUsage() + '\n' };
    }
    var file = args[0];
    var raw;
    try {
      raw = readFileSync(file, 'utf8');
    } catch (err) {
      return { code: 1, output: 'error: cannot read file "' + file + '"\n' };
    }
    var spec;
    try {
      spec = JSON.parse(raw);
    } catch (err) {
      return { code: 1, output: 'error: "' + file + '" is not valid JSON\n' };
    }
    var errors = validateSpec(spec);
    if (errors.length > 0) {
      return { code: 2, output: errors.join('\n') + '\n' };
    }
    return { code: 0, output: 'ok: "' + file + '" is a valid animath spec\n' };
  }

  // Thin entry point: only when this file is the main Node script.
  // The validator's findings (exit 0/2) go to stdout; usage, argument,
  // file, and JSON errors (exit 1) go to stderr.
  if (require.main !== module) return;
  var result = cliMain(process.argv.slice(2), require('fs').readFileSync);
  (result.code === 1 ? process.stderr : process.stdout).write(result.output);
  process.exit(result.code);
})();
