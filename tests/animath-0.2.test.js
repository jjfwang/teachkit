/* animath 0.2 — bounded curve / trajectory animation contract (#1648 follow-up).
 * Validator accept/reject matrix, pure path helpers, export-frames
 * determinism, and live-player draw / move_along_path behaviour.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const validate = require('../player/validate.js');
const player = require('../player/player.js');
const xf = require('../player/export-frames.js');

const I = player.internals;

function loadFixture() {
  return JSON.parse(fs.readFileSync(
    path.join(__dirname, 'fixtures', 'animath-0.2-quadratic.json'), 'utf8'));
}

// --- validator: the valid fixture passes, 0.1 keeps 0.1 semantics ---

test('animath 0.2: fixture quadratic spec validates clean', () => {
  assert.deepEqual(validate.validateSpec(loadFixture()), []);
});

test('animath 0.2: 0.2 spec may use 0.1 shapes and verbs', () => {
  var spec = loadFixture();
  spec.scenes[0].steps.push(
    { at_ms: 400, do: 'show', shape: { id: 'lab', kind: 'text', x: 100, y: 500, text: 'x squared' } },
    { at_ms: 500, do: 'move', target: 'lab', to: { x: 120 }, dur_ms: 500 },
    { at_ms: 600, do: 'emphasize', target: 'lab' },
    { at_ms: 700, do: 'caption', text: 'Done' });
  assert.deepEqual(validate.validateSpec(spec), []);
});

test('animath 0.2: coordinate_system is an accepted alias of axes', () => {
  var spec = loadFixture();
  spec.scenes[0].steps[0].shape.kind = 'coordinate_system';
  assert.deepEqual(validate.validateSpec(spec), []);
});

test('animath 0.2: 0.1 spec rejects every 0.2-only shape and verb', () => {
  var spec = loadFixture();
  spec.animath = '0.1';
  var errs = validate.validateSpec(spec);
  assert.ok(errs.some(function (e) { return /shape\.kind: must be one of text\|rect\|circle\|line\|arrow\|polygon\|latex\|sector/.test(e); }),
    'axes / function_plot rejected in 0.1, got: ' + errs.join('; '));
  assert.ok(errs.some(function (e) { return /\.do: must be show\|hide\|move\|emphasize\|caption/.test(e); }),
    'draw / move_along_path rejected in 0.1, got: ' + errs.join('; '));
});

test('animath 0.2: unknown version rejected', () => {
  var spec = loadFixture();
  spec.animath = '0.3';
  assert.ok(validate.validateSpec(spec).some(function (e) { return /animath: must be/.test(e); }));
});

// --- validator: malformed-case matrix ---
// Each entry mutates a clone of the valid fixture and must produce at
// least one error matching the pattern.

var BAD_CASES = [
  ['non-finite coefficient (Infinity)', function (s) { s.scenes[0].steps[1].shape.coefficients = [0, 0, Infinity]; }, /coefficients\[2\]/],
  ['NaN coefficient', function (s) { s.scenes[0].steps[1].shape.coefficients = [0, NaN, 1]; }, /coefficients\[1\]/],
  ['degree over bound (7 coefficients)', function (s) { s.scenes[0].steps[1].shape.coefficients = [0, 0, 0, 0, 0, 0, 1]; }, /coefficients: required array of 1\.\.6/],
  ['empty coefficients', function (s) { s.scenes[0].steps[1].shape.coefficients = []; }, /coefficients: required array/],
  ['coefficient over bound', function (s) { s.scenes[0].steps[1].shape.coefficients = [0, 0, 2000000]; }, /coefficients\[2\]/],
  ['unknown function family', function (s) { s.scenes[0].steps[1].shape.family = 'exponential'; }, /family: must be "polynomial"/],
  ['samples below bound', function (s) { s.scenes[0].steps[1].shape.samples = 1; }, /samples: must be an integer from 2 to 200/],
  ['samples over bound', function (s) { s.scenes[0].steps[1].shape.samples = 201; }, /samples: must be an integer from 2 to 200/],
  ['domain min not less than max', function (s) { s.scenes[0].steps[1].shape.domain = { min: 3, max: 3 }; }, /domain: min must be less than max/],
  ['range missing', function (s) { delete s.scenes[0].steps[1].shape.range; }, /range: required \{min,max\}/],
  ['range max out of bound', function (s) { s.scenes[0].steps[1].shape.range = { min: 0, max: 2000000 }; }, /range\.max: required number within/],
  ['viewport width zero', function (s) { s.scenes[0].steps[1].shape.viewport.w = 0; }, /viewport\.w: required positive number/],
  ['viewport missing', function (s) { delete s.scenes[0].steps[1].shape.viewport; }, /viewport: required \{x,y,w,h\}/],
  ['axes xRange min not less than max', function (s) { s.scenes[0].steps[0].shape.xRange = { min: 5, max: -5 }; }, /xRange: min must be less than max/],
  ['axes yRange missing', function (s) { delete s.scenes[0].steps[0].shape.yRange; }, /yRange: required \{min,max\}/],
  ['axes x non-numeric', function (s) { s.scenes[0].steps[0].shape.x = '80'; }, /\.x: required number/],
  ['axes x out of bound', function (s) { s.scenes[0].steps[0].shape.x = 2000000; }, /\.x: must be within/],
  ['axes width zero', function (s) { s.scenes[0].steps[0].shape.w = 0; }, /\.w: required positive number/],
  ['axes tickStep zero', function (s) { s.scenes[0].steps[0].shape.tickStep = 0; }, /tickStep: must be a positive number/],
  ['axes tickStep implies too many x ticks', function (s) { s.scenes[0].steps[0].shape.tickStep = 0.000001; }, /xRange\/tickStep: implies more than 200 ticks/],
  ['axes tickStep implies too many y ticks', function (s) {
    s.scenes[0].steps[0].shape.xRange = { min: 0, max: 1 };
    s.scenes[0].steps[0].shape.tickStep = 0.01;
  }, /yRange\/tickStep: implies more than 200 ticks/],
  ['axes xLabel non-string', function (s) { s.scenes[0].steps[0].shape.xLabel = 5; }, /xLabel: must be a string/],
  ['answer-bearing field on function_plot', function (s) { s.scenes[0].steps[1].shape.answer = '9'; }, /answer-bearing fields are not allowed/],
  ['draw targeting unshown shape', function (s) { s.scenes[0].steps[3].target = 'nope'; }, /must be shown earlier in the same scene/],
  ['draw targeting missing id', function (s) { delete s.scenes[0].steps[3].target; }, /target: required shape id/],
  ['draw targeting a non-path shape', function (s) { s.scenes[0].steps[3].target = 'ax'; }, /is not a path/],
  ['draw fromProgress over toProgress', function (s) { s.scenes[0].steps[3].fromProgress = 0.8; s.scenes[0].steps[3].toProgress = 0.2; }, /fromProgress: must not exceed toProgress/],
  ['draw toProgress out of range', function (s) { s.scenes[0].steps[3].toProgress = 1.5; }, /toProgress: required number 0\.\.1/],
  ['draw fromProgress out of range', function (s) { s.scenes[0].steps[3].fromProgress = -0.1; }, /fromProgress: required number 0\.\.1/],
  ['draw unknown easing', function (s) { s.scenes[0].steps[3].easing = 'bounce'; }, /easing: must be linear\|ease-in\|ease-out\|ease-in-out/],
  ['draw duration below bound', function (s) { s.scenes[0].steps[3].dur_ms = 50; }, /dur_ms: required number 100\.\.12000/],
  ['draw duration missing', function (s) { delete s.scenes[0].steps[3].dur_ms; }, /dur_ms: required number 100\.\.12000/],
  ['move_along_path marker unshown', function (s) { s.scenes[0].steps[4].marker = 'ghost'; }, /marker: "ghost" must be shown earlier/],
  ['move_along_path marker missing', function (s) { delete s.scenes[0].steps[4].marker; }, /marker: required shape id/],
  ['move_along_path marker wrong kind', function (s) { s.scenes[0].steps[4].marker = 'ax'; }, /cannot be a move_along_path marker/],
  ['move_along_path path unshown', function (s) { s.scenes[0].steps[4].path = 'ghost'; }, /path: "ghost" must be shown earlier/],
  ['move_along_path path wrong kind', function (s) { s.scenes[0].steps[4].path = 'dot'; }, /is not a path/],
  ['move_along_path path missing', function (s) { delete s.scenes[0].steps[4].path; }, /path: required shape id/],
  ['move of a function_plot rejected (not moveable)', function (s) {
    s.scenes[0].steps.push({ at_ms: 400, do: 'move', target: 'plot', to: { x: 1 }, dur_ms: 500 });
  }, /is not moveable in v0/]
];

BAD_CASES.forEach(function (entry) {
  test('animath 0.2 validator rejects: ' + entry[0], () => {
    var spec = loadFixture();
    entry[1](spec);
    var errs = validate.validateSpec(spec);
    assert.ok(errs.length > 0, 'expected at least one error for: ' + entry[0]);
    assert.ok(errs.some(function (e) { return entry[2].test(e); }),
      'expected /' + entry[2].source + '/, got: ' + errs.join('; '));
  });
});

test('animath 0.2 validator: exactly 200 ticks per axis passes', () => {
  var spec = loadFixture();
  spec.scenes[0].steps[0].shape.xRange = { min: 0, max: 199 };
  spec.scenes[0].steps[0].shape.tickStep = 1;
  assert.deepEqual(validate.validateSpec(spec), [], 'range 0..199 with tickStep 1 is 200 ticks, the bound itself');
});

test('animath 0.2 validator: 201 ticks per axis fails', () => {
  var spec = loadFixture();
  spec.scenes[0].steps[0].shape.xRange = { min: 0, max: 200 };
  spec.scenes[0].steps[0].shape.tickStep = 1;
  var errs = validate.validateSpec(spec);
  assert.ok(errs.some(function (e) { return /xRange\/tickStep: implies more than 200 ticks \(max 200 per axis\)/.test(e); }),
    'range 0..200 with tickStep 1 is 201 ticks, got: ' + errs.join('; '));
});

test('animath 0.2 validator: axes without tickStep uses the default step', () => {
  var spec = loadFixture();
  delete spec.scenes[0].steps[0].shape.tickStep;
  assert.deepEqual(validate.validateSpec(spec), [], 'default step (span/5) implies 5 ticks, always within the bound');
});

test('animath 0.2 validator rejects polyline_trace point problems', () => {
  function withTrace(mut) {
    var spec = loadFixture();
    spec.scenes[0].steps[1].shape = {
      id: 'trace', kind: 'polyline_trace',
      points: [[0, 0], [100, 100], [200, 50]]
    };
    spec.scenes[0].steps[3] = { at_ms: 300, do: 'draw', target: 'trace', fromProgress: 0, toProgress: 1, dur_ms: 1000 };
    spec.scenes[0].steps[4] = { at_ms: 300, do: 'move_along_path', marker: 'dot', path: 'trace', fromProgress: 0, toProgress: 1, dur_ms: 1000 };
    mut(spec);
    return validate.validateSpec(spec);
  }
  assert.deepEqual(withTrace(function () {}), [], 'valid polyline_trace passes');
  assert.ok(withTrace(function (s) { s.scenes[0].steps[1].shape.points = [[0, 0]]; })
    .some(function (e) { return /points: required array of 2\.\.200/.test(e); }), '1 point rejected');
  var many = [];
  for (var i = 0; i < 201; i++) many.push([i, i]);
  assert.ok(withTrace(function (s) { s.scenes[0].steps[1].shape.points = many; })
    .some(function (e) { return /points: required array of 2\.\.200/.test(e); }), '201 points rejected');
  assert.ok(withTrace(function (s) { s.scenes[0].steps[1].shape.points = [[0, 0], [NaN, 1]]; })
    .some(function (e) { return /points: required array of 2\.\.200/.test(e); }), 'NaN point rejected');
  assert.ok(withTrace(function (s) { s.scenes[0].steps[1].shape.points = [[0, 0], [2000000, 1]]; })
    .some(function (e) { return /points: required array of 2\.\.200/.test(e); }), 'out-of-range point rejected');
  assert.ok(withTrace(function (s) { s.scenes[0].steps[1].shape.correct = true; })
    .some(function (e) { return /answer-bearing fields are not allowed/.test(e); }), 'correct on polyline_trace rejected');
});

// --- pure path helpers ---

test('animath 0.2 helpers: applyEasing', () => {
  assert.equal(I.applyEasing('linear', 0.5), 0.5);
  assert.equal(I.applyEasing('ease-in', 0.5), 0.25);
  assert.equal(I.applyEasing('ease-out', 0.5), 0.75);
  assert.equal(I.applyEasing('ease-in-out', 0.25), 0.125);
  assert.equal(I.applyEasing('ease-in-out', 0.75), 0.875);
  assert.equal(I.applyEasing('linear', 0), 0);
  assert.equal(I.applyEasing('ease-in-out', 1), 1);
  assert.equal(I.applyEasing('nope', 0.5), 0.5, 'unknown easing falls back to linear');
  assert.equal(I.applyEasing('linear', -2), 0, 'progress clamped below');
  assert.equal(I.applyEasing('linear', 2), 1, 'progress clamped above');
});

test('animath 0.2 helpers: samplePolynomial maps y = x^2 through the viewport', () => {
  var plot = loadFixture().scenes[0].steps[1].shape;
  var pts = I.samplePolynomial(plot);
  assert.equal(pts.length, 61, 'samples honoured');
  assert.deepEqual(pts[0], [80, 60], 'x=-3, y=9 maps to the viewport top-left');
  assert.deepEqual(pts[60], [880, 60], 'x=3, y=9 maps to the viewport top-right');
  assert.deepEqual(pts[30], [480, 460], 'x=0, y=0 maps to the viewport bottom-centre');
  var def = I.samplePolynomial({ kind: 'function_plot', family: 'polynomial', coefficients: [1],
    domain: { min: 0, max: 1 }, range: { min: 0, max: 1 }, viewport: { x: 0, y: 0, w: 10, h: 10 } });
  assert.equal(def.length, 100, 'samples default to 100');
  var one = I.samplePolynomial({ kind: 'function_plot', family: 'polynomial', coefficients: [2],
    domain: { min: 0, max: 1 }, range: { min: 0, max: 1 }, viewport: { x: 0, y: 0, w: 10, h: 10 }, samples: 1 });
  assert.equal(one.length, 1, 'single-sample edge handled');
});

test('animath 0.2 helpers: pathPoints', () => {
  var plot = loadFixture().scenes[0].steps[1].shape;
  assert.equal(I.pathPoints(plot).length, 61);
  var trace = { kind: 'polyline_trace', points: [[0, 0], [3, 4]] };
  var got = I.pathPoints(trace);
  assert.deepEqual(got, [[0, 0], [3, 4]]);
  got[0][0] = 99;
  assert.deepEqual(trace.points[0], [0, 0], 'trace points are copied, not aliased');
  assert.deepEqual(I.pathPoints({ kind: 'circle' }), [], 'non-path kind yields no points');
  assert.deepEqual(I.pathPoints(null), [], 'null shape yields no points');
});

test('animath 0.2 helpers: polylineLength / pointAtProgress / partialPolyline / polylinePath', () => {
  var line = [[0, 0], [3, 4], [6, 4]];
  assert.equal(I.polylineLength(line), 8);
  assert.equal(I.polylineLength([]), 0);
  assert.equal(I.polylineLength([[1, 1]]), 0);
  assert.deepEqual(I.pointAtProgress(line, 0), [0, 0]);
  assert.deepEqual(I.pointAtProgress(line, 1), [6, 4]);
  var half = I.pointAtProgress(line, 0.5);
  assert.ok(Math.abs(half[0] - 2.4) < 1e-9 && Math.abs(half[1] - 3.2) < 1e-9,
    'half the arc length lands 4/5 along the first segment, got ' + JSON.stringify(half));
  assert.deepEqual(I.pointAtProgress([], 0.5), [0, 0]);
  assert.deepEqual(I.pointAtProgress([[7, 8]], 0.5), [7, 8]);
  assert.deepEqual(I.pointAtProgress([[0, 0], [5, 0]], NaN), [5, 0],
    'NaN progress falls through to the last point instead of throwing');
  assert.deepEqual(I.partialPolyline(line, 0), [[0, 0]], 'progress 0 shows a single point (nothing visible)');
  assert.deepEqual(I.partialPolyline(line, 1), line, 'progress 1 shows all of it');
  var halfReveal = I.partialPolyline(line, 0.5);
  assert.equal(halfReveal.length, 2, 'half reveal ends at the interpolated point');
  assert.ok(Math.abs(halfReveal[1][0] - 2.4) < 1e-9 && Math.abs(halfReveal[1][1] - 3.2) < 1e-9,
    'half reveal ends at the interpolated point, got ' + JSON.stringify(halfReveal));
  assert.deepEqual(I.partialPolyline([], 0.5), []);
  assert.deepEqual(I.partialPolyline([[0, 0], [5, 0]], NaN), [[0, 0], [5, 0], [5, 0]],
    'NaN fraction falls through to the full path instead of throwing');
  assert.equal(I.polylinePath(line), 'M0,0 L3,4 L6,4');
  assert.equal(I.polylinePath([[2, 3]]), 'M2,3');
  assert.equal(I.polylinePath([]), '');
});

test('animath 0.2 helpers: markerPos uses the marker kind fields', () => {
  var pts = [[0, 0], [10, 0]];
  assert.deepEqual(I.markerPos({ kind: 'circle' }, pts, 0.5), { cx: 5, cy: 0 });
  assert.deepEqual(I.markerPos({ kind: 'text' }, pts, 0.5), { x: 5, y: 0 });
  assert.deepEqual(I.markerPos({ kind: 'rect' }, pts, 1), { x: 10, y: 0 });
  assert.deepEqual(I.markerPos({ kind: 'latex' }, pts, 0), { x: 0, y: 0 });
});

test('animath 0.2 helpers: axesGeometry maps and clamps', () => {
  var ax = loadFixture().scenes[0].steps[0].shape;
  var g = I.axesGeometry(ax);
  assert.equal(g.mapX(-5), 80);
  assert.equal(g.mapX(5), 880);
  assert.equal(g.mapY(10), 60);
  assert.equal(g.mapY(-2), 460);
  assert.ok(Math.abs(g.xAxisY - (60 + 400 * (10 - 0) / 12)) < 1e-9, 'x-axis sits at y=0');
  assert.equal(g.yAxisX, 480, 'y-axis sits at x=0');
  assert.deepEqual(g.xTicks, [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
  assert.deepEqual(g.yTicks, [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  var above = I.axesGeometry({ x: 0, y: 0, w: 100, h: 100,
    xRange: { min: 1, max: 5 }, yRange: { min: 1, max: 5 } });
  assert.equal(above.xAxisY, 100, 'zero below the y-range clamps the x-axis to the bottom edge');
  assert.equal(above.yAxisX, 0, 'zero below the x-range clamps the y-axis to the left edge');
  var def = I.axesGeometry({ x: 0, y: 0, w: 100, h: 100,
    xRange: { min: 0, max: 10 }, yRange: { min: 0, max: 10 } });
  assert.deepEqual(def.xTicks, [0, 2, 4, 6, 8, 10], 'tick step defaults to a fifth of the span');
});

// --- export-frames: shape markup, determinism, reveal, marker, seek ---

test('animath 0.2 export-frames: axes and path markup mirror the player', () => {
  var spec = loadFixture();
  var ax = spec.scenes[0].steps[0].shape;
  var axSvg = xf.shapeMarkup(ax);
  assert.ok(axSvg.indexOf('<g data-shape-id="ax">') === 0, 'axes render as a group');
  assert.ok(axSvg.indexOf('>-5</text>') !== -1, 'x tick labels present');
  assert.ok(axSvg.indexOf('>10</text>') !== -1, 'y tick labels present');
  assert.ok(axSvg.indexOf('>x</text>') !== -1, 'x label present');
  var plot = spec.scenes[0].steps[1].shape;
  var plotSvg = xf.shapeMarkup(plot);
  assert.ok(plotSvg.indexOf('<path d="M80,60') === 0, 'function_plot renders the sampled path');
  assert.ok(plotSvg.indexOf('stroke="#315FD6"') !== -1, 'stroke honoured');
  var traceSvg = xf.shapeMarkup({ id: 't', kind: 'polyline_trace', points: [[0, 0], [3, 4]] });
  assert.equal(traceSvg, '<path d="M0,0 L3,4" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" data-shape-id="t"/>');
  var csSvg = xf.shapeMarkup(Object.assign({}, ax, { kind: 'coordinate_system', id: 'cs' }));
  assert.ok(csSvg.indexOf('<g data-shape-id="cs">') === 0, 'coordinate_system renders like axes');
});

test('animath 0.2 export-frames: repeated renderFrame is byte-identical', () => {
  var spec = loadFixture();
  [300, 800, 1300, 2300, 5000].forEach(function (ms) {
    assert.equal(xf.renderFrame(spec, 0, ms), xf.renderFrame(spec, 0, ms),
      'frame at ' + ms + 'ms must be deterministic');
  });
});

function plotSegmentCount(frame) {
  var m = frame.match(/d="([^"]*)"[^>]*data-shape-id="plot"/) ||
    frame.match(/data-shape-id="plot"[^>]*d="([^"]*)"/);
  assert.ok(m, 'plot path present in frame');
  return (m[1].match(/ L/g) || []).length;
}

test('animath 0.2 export-frames: draw reveal is monotonic, 0 shows nothing, 1 shows all', () => {
  var spec = loadFixture();
  assert.equal(plotSegmentCount(xf.renderFrame(spec, 0, 300)), 0, 'draw start: no line segments yet');
  var mid = plotSegmentCount(xf.renderFrame(spec, 0, 1300));
  assert.ok(mid > 0 && mid < 60, 'mid-draw shows a strict prefix, got ' + mid + ' segments');
  assert.equal(plotSegmentCount(xf.renderFrame(spec, 0, 2300)), 60, 'draw end: all 60 segments of the 61-sample path');
  assert.ok(plotSegmentCount(xf.renderFrame(spec, 0, 800)) < mid &&
    mid < plotSegmentCount(xf.renderFrame(spec, 0, 1800)), 'reveal grows monotonically');
});

test('animath 0.2 export-frames: move_along_path marker matches the sampled path', () => {
  var spec = loadFixture();
  var plot = spec.scenes[0].steps[1].shape;
  var pts = I.pathPoints(plot);
  [300, 800, 1300, 1800, 2300].forEach(function (ms) {
    var shapes = xf.sceneShapes(spec, 0, ms);
    var dot = shapes.filter(function (s) { return s.id === 'dot'; })[0];
    var prog = Math.min(1, (ms - 300) / 2000);
    var want = I.pointAtProgress(pts, prog);
    assert.ok(Math.abs(dot.cx - want[0]) < 1e-9 && Math.abs(dot.cy - want[1]) < 1e-9,
      'marker at ' + ms + 'ms must sit on the path at progress ' + prog);
  });
});

test('animath 0.2 export-frames: seek reconstructs state and never mutates the spec', () => {
  var spec = loadFixture();
  var before = JSON.stringify(spec);
  var late = xf.renderFrame(spec, 0, 2300);
  var early = xf.renderFrame(spec, 0, 300);
  assert.equal(xf.renderFrame(spec, 0, 300), early, 'render at t1 then t0 equals fresh t0');
  assert.notEqual(late, early, 'late and early frames differ');
  assert.equal(JSON.stringify(spec), before, 'spec untouched by replay');
  var shapesLate = xf.sceneShapes(spec, 0, 2300);
  var shapesEarly = xf.sceneShapes(spec, 0, 300);
  assert.equal(xf.sceneShapes(spec, 0, 300).length, shapesEarly.length, 'replay is repeatable');
  assert.ok(shapesLate.length >= shapesEarly.length, 'later frame shows at least as much');
});

test('animath 0.2 export-frames: easing changes the revealed fraction', () => {
  var spec = loadFixture();
  spec.scenes[0].steps[3].easing = 'ease-in';
  spec.scenes[0].steps[4].easing = 'ease-in';
  var linear = loadFixture();
  assert.ok(plotSegmentCount(xf.renderFrame(spec, 0, 1300)) <
    plotSegmentCount(xf.renderFrame(linear, 0, 1300)),
    'ease-in reveals less than linear at the midpoint');
});

test('animath 0.2 export-frames: draw / move_along_path on a hidden shape are no-ops', () => {
  var spec = loadFixture();
  spec.scenes[0].steps.push({ at_ms: 400, do: 'hide', target: 'plot' });
  spec.scenes[0].steps.push({ at_ms: 500, do: 'draw', target: 'plot', fromProgress: 0, toProgress: 1, dur_ms: 500 });
  spec.scenes[0].steps.push({ at_ms: 500, do: 'move_along_path', marker: 'dot', path: 'plot', fromProgress: 0, toProgress: 1, dur_ms: 500 });
  assert.deepEqual(validate.validateSpec(spec), [], 'hide-then-draw still validates');
  var shapes = xf.sceneShapes(spec, 0, 600);
  assert.equal(shapes.filter(function (s) { return s.id === 'plot'; }).length, 0,
    'hidden path stays hidden; the draw is a no-op, not a crash');
});

// --- live player: mount with a minimal fake DOM ---

function fakeEl(tag) {
  var children = [];
  var stubs = {};
  var el = {
    tagName: String(tag || 'div').toUpperCase(),
    children: children,
    style: {},
    attributes: {},
    textContent: '',
    innerHTML: '',
    className: '',
    value: '0',
    setAttribute: function (k, v) { this.attributes[k] = String(v); },
    getAttribute: function (k) { return this.attributes[k]; },
    removeAttribute: function (k) { delete this.attributes[k]; },
    appendChild: function (c) { children.push(c); c.parentNode = el; return c; },
    removeChild: function (c) {
      var i = children.indexOf(c);
      if (i !== -1) children.splice(i, 1);
      c.parentNode = null;
      return c;
    },
    addEventListener: function () {},
    querySelector: function (sel) {
      if (!stubs[sel]) stubs[sel] = fakeEl('stub');
      return stubs[sel];
    },
    getBoundingClientRect: function () { return { left: 0, top: 0, width: 960, height: 540 }; }
  };
  Object.defineProperty(el, 'firstChild', {
    get: function () { return children[0] || null; }
  });
  Object.defineProperty(el, 'parentNode', {
    get: function () { return el._parent || null; },
    set: function (v) { el._parent = v; }
  });
  return el;
}

function installFakeDom(opts) {
  opts = opts || {};
  var created = [];
  var rafQueue = [];
  var rafById = {};
  var rafId = 0;
  var now = 1000;
  var prev = {
    document: global.document,
    raf: global.requestAnimationFrame,
    caf: global.cancelAnimationFrame,
    perf: global.performance,
    matchMedia: global.matchMedia
  };
  global.document = {
    createElement: function (tag) { var e = fakeEl(tag); created.push(e); return e; },
    createElementNS: function (ns, tag) { var e = fakeEl(tag); created.push(e); return e; }
  };
  global.requestAnimationFrame = function (cb) {
    rafId += 1; rafById[rafId] = cb; rafQueue.push(rafId); return rafId;
  };
  global.cancelAnimationFrame = function (id) {
    delete rafById[id];
    rafQueue = rafQueue.filter(function (x) { return x !== id; });
  };
  global.performance = { now: function () { return now; } };
  if (opts.reducedMotion !== undefined) {
    global.matchMedia = function () { return { matches: !!opts.reducedMotion }; };
  }
  return {
    created: created,
    pump: function (advance) {
      now += advance;
      var ids = rafQueue;
      rafQueue = [];
      ids.forEach(function (id) {
        var cb = rafById[id];
        delete rafById[id];
        if (cb) cb(now);
      });
    },
    restore: function () {
      global.document = prev.document;
      global.requestAnimationFrame = prev.raf;
      global.cancelAnimationFrame = prev.caf;
      global.performance = prev.perf;
      if (prev.matchMedia === undefined) delete global.matchMedia;
      else global.matchMedia = prev.matchMedia;
    }
  };
}

function findShapeEl(created, id) {
  var found = created.filter(function (e) {
    return e.attributes && e.attributes['data-shape-id'] === id;
  });
  return found[found.length - 1];
}

test('animath 0.2 player: live draw reveal + marker travel, then seek to the end', () => {
  var dom = installFakeDom();
  try {
    var spec = loadFixture();
    var p = player.mount(fakeEl('div'), spec);
    p.play();
    // Pump past the draw start (300ms) to mid-draw (~1300ms scene time).
    for (var k = 0; k < 13; k++) dom.pump(100);
    var midD = findShapeEl(dom.created, 'plot').attributes.d;
    var midL = (midD.match(/ L/g) || []).length;
    assert.ok(midL > 0 && midL < 60, 'mid-draw path is a strict prefix, got ' + midL + ' segments');
    var midDot = findShapeEl(dom.created, 'dot');
    assert.ok(Number(midDot.attributes.cx) > 80 && Number(midDot.attributes.cx) < 880,
      'marker partway along the path mid-draw');
    // Pump to the end of the draw (2300ms scene time).
    for (var j = 0; j < 10; j++) dom.pump(100);
    var fullD = findShapeEl(dom.created, 'plot').attributes.d;
    assert.equal((fullD.match(/ L/g) || []).length, 60, 'draw completes to the full path');
    var endDot = findShapeEl(dom.created, 'dot');
    assert.equal(Number(endDot.attributes.cx), 880, 'marker ends at the path end (x=3)');
    assert.equal(Number(endDot.attributes.cy), 60, 'marker ends at the path end (y=9)');
    p.destroy();
  } finally {
    dom.restore();
  }
});

test('animath 0.2 player: reduced motion renders the final state instantly on seek', () => {
  var dom = installFakeDom({ reducedMotion: true });
  try {
    var spec = loadFixture();
    var p = player.mount(fakeEl('div'), spec);
    p.seekScene(0, 8000);
    var d = findShapeEl(dom.created, 'plot').attributes.d;
    assert.equal((d.match(/ L/g) || []).length, 60, 'reduced-motion seek shows the full path at once');
    var dot = findShapeEl(dom.created, 'dot');
    assert.equal(Number(dot.attributes.cx), 880, 'reduced-motion seek puts the marker at the path end');
    assert.equal(Number(dot.attributes.cy), 60);
    p.destroy();
  } finally {
    dom.restore();
  }
});

test('animath 0.2 player: polyline_trace draws as a path, like function_plot', () => {
  var dom = installFakeDom();
  try {
    var spec = loadFixture();
    spec.scenes[0].steps[1].shape = {
      id: 'trace', kind: 'polyline_trace',
      points: [[100, 400], [300, 200], [500, 400]], stroke: '#315FD6'
    };
    spec.scenes[0].steps[3] = { at_ms: 300, do: 'draw', target: 'trace', fromProgress: 0, toProgress: 1, dur_ms: 1000 };
    spec.scenes[0].steps[4] = { at_ms: 300, do: 'move_along_path', marker: 'dot', path: 'trace', fromProgress: 0, toProgress: 1, dur_ms: 1000 };
    assert.deepEqual(validate.validateSpec(spec), []);
    var p = player.mount(fakeEl('div'), spec);
    p.play();
    dom.pump(100);
    var traceEl = findShapeEl(dom.created, 'trace');
    assert.equal(traceEl.attributes.d, 'M100,400 L300,200 L500,400', 'trace renders as a path');
    for (var k = 0; k < 12; k++) dom.pump(100);
    assert.equal(traceEl.attributes.d, 'M100,400 L300,200 L500,400', 'trace draw completes');
    var dot = findShapeEl(dom.created, 'dot');
    assert.equal(Number(dot.attributes.cx), 500, 'marker ends at the trace end');
    assert.equal(Number(dot.attributes.cy), 400);
    p.destroy();
  } finally {
    dom.restore();
  }
});

test('animath 0.2 player: draw on a hidden path is a no-op, not a crash', () => {
  var dom = installFakeDom();
  try {
    var spec = loadFixture();
    spec.scenes[0].steps.push({ at_ms: 400, do: 'hide', target: 'plot' });
    spec.scenes[0].steps.push({ at_ms: 500, do: 'draw', target: 'plot', fromProgress: 0, toProgress: 1, dur_ms: 500 });
    spec.scenes[0].steps.push({ at_ms: 500, do: 'move_along_path', marker: 'dot', path: 'plot', fromProgress: 0, toProgress: 1, dur_ms: 500 });
    var p = player.mount(fakeEl('div'), spec);
    p.play();
    for (var k = 0; k < 10; k++) dom.pump(100);
    p.destroy();
  } finally {
    dom.restore();
  }
});
