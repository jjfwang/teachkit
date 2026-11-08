/* animath player v0.1 + v0.2 — dependency-free SVG renderer for animation specs.
 * v0.2 (issue #1648 follow-up) adds the opt-in bounded curve / trajectory
 * extension (axes, function_plot, polyline_trace, draw, move_along_path);
 * 0.1 specs render exactly as before.
 *
 * Usage (browser):
 *   var player = AnimathPlayer.mount(document.getElementById('stage'), spec);
 *   player.play(); player.pause(); player.restart();
 *   player.nextScene(); player.prevScene();
 *   player.seekScene(i, ms); player.setSpeed(1.5);
 *   player.on('scene', function (i) { ... });
 *   player.destroy();
 *
 * Node: require()able for smoke tests (no DOM touched until mount()).
 *
 * mount() validates the spec with player/validate.js and throws a clear Error
 * (naming the failing field) on an invalid spec, before any DOM work.
 */
(function (global) {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var FADE_MS = 300;

  function el(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    }
    return n;
  }

  function textNode(x, y, content, opts) {
    var n = el('text', {
      x: x, y: y,
      'font-size': opts.size || 28,
      fill: opts.color || '#1a1a1a',
      'text-anchor': opts.align || 'start',
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    n.textContent = content;
    return n;
  }

  // Pure (no-DOM) helpers, exported so Node tests can exercise them.

  // True when a KaTeX API object is available for rendering. Takes the
  // candidate object as a parameter instead of reading the global directly.
  function katexAvailable(katex) {
    return !!(katex && typeof katex.renderToString === 'function');
  }

  // Best-effort unicode approximation of a LaTeX string, for the fallback
  // path when KaTeX is unavailable (CDN failed, offline, file://).
  //
  // Issue #463: the old regex chain used [^{}]* for \frac and \sqrt
  // arguments, so any nested braces garbled the output and leaked command
  // names (e.g. "frac12\ textg12\ textg/mol"). The fallback now parses
  // balanced braces, renders \text{...} as its inner content, treats
  // backslash-space as a space, keeps the single-command replacements, and
  // strips unknown commands entirely — no command name may leak.

  // Read a balanced {...} group starting at index `open` (pointing at
  // '{'). Returns [inner, end] where end is the index just past the
  // matching '}', or null when the braces never balance. Pure, DOM-free.
  function readGroup(s, open) {
    var depth = 0, i = open, n = s.length;
    while (i < n) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}') {
        depth--;
        if (depth === 0) return [s.slice(open + 1, i), i + 1];
      }
      i++;
    }
    return null;
  }

  // Single-command replacements on the fallback path: the same set the old
  // regex chain replaced, applied during the scanner pass below.
  var LATEX_SINGLE = {
    times: '\u00D7', div: '\u00F7', pm: '\u00B1', cdot: '\u00B7',
    leq: '\u2264', geq: '\u2265', neq: '\u2260', approx: '\u2248',
    pi: '\u03C0', theta: '\u03B8'
  };

  // Recursive resolver: consumes one LaTeX string and returns plain text.
  // \frac and \sqrt take balanced-brace arguments (nested braces work),
  // \text renders its inner content, backslash-space is a plain space,
  // ^2/^3 (braced or bare) become superscript unicode, and unknown
  // commands are stripped entirely. Pure string work, DOM-free.
  function resolveLatex(s) {
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\') {
        var name = /^[a-zA-Z]+/.exec(s.slice(i + 1));
        if (name) {
          var cmd = name[0], j = i + 1 + cmd.length;
          var single = LATEX_SINGLE[cmd];
          if (single !== undefined) { out += single; i = j; continue; }
          if (cmd === 'text' || cmd === 'frac' || cmd === 'sqrt') {
            var g1 = s[j] === '{' ? readGroup(s, j) : null;
            if (!g1) { i = j; continue; }  // unbalanced: drop the command
            if (cmd === 'text') { out += resolveLatex(g1[0]); i = g1[1]; continue; }
            if (cmd === 'sqrt') { out += '\u221A(' + resolveLatex(g1[0]) + ')'; i = g1[1]; continue; }
            var g2 = s[g1[1]] === '{' ? readGroup(s, g1[1]) : null;
            if (!g2) { i = g1[1]; continue; }  // unbalanced: drop the command
            out += resolveLatex(g1[0]) + '/' + resolveLatex(g2[0]);
            i = g2[1]; continue;
          }
          i = j; continue;  // unknown command: stripped, name never leaks
        }
        // Backslash followed by a non-letter: '\ ' is a space; any other
        // control symbol drops the backslash and keeps the character.
        if (s[i + 1] === ' ') { out += ' '; i += 2; }
        else i += 1;
        continue;
      }
      if (c === '^') {
        var grp = s[i + 1] === '{' ? readGroup(s, i + 1) : null;
        var exp = grp ? grp[0] : s[i + 1];
        if (exp === '2') { out += '\u00B2'; i = grp ? grp[1] : i + 2; continue; }
        if (exp === '3') { out += '\u00B3'; i = grp ? grp[1] : i + 2; continue; }
        out += c; i++; continue;
      }
      if (c === '{' || c === '}') { i++; continue; }  // stray braces dropped
      out += c; i++;
    }
    return out;
  }

  function latexFallbackText(tex) {
    return resolveLatex(String(tex));
  }

  // Pure sizing math for the latex foreignObject box: given the measured
  // content size (CSS px) and the width available on the stage, returns the
  // foreignObject width/height plus the inner scale factor. The equation
  // keeps its natural size when it fits, and scales down (never up) when it
  // would overflow. DOM-free so Node tests can cover every line.
  function latexFit(contentW, contentH, availW) {
    var w = Math.max(1, Math.ceil(contentW));
    var h = Math.max(1, Math.ceil(contentH));
    var avail = Math.max(1, Math.ceil(availW));
    if (w <= avail) return { width: w, height: h, scale: 1 };
    var s = avail / w;
    return { width: avail, height: Math.max(1, Math.ceil(h * s)), scale: s };
  }

  // Content-fits a laid-out latex foreignObject: measures the rendered
  // equation, sizes the box to the content via latexFit, and applies a
  // top-left-origin scale when the equation would overflow the available
  // width. No-op when there is no measurable equation div (the KaTeX-missing
  // fallback renders a plain text node, and a detached node has no layout).
  // The sizing math lives in latexFit (pure, tested); this only applies it.
  function fitLatex(node, availW) {
    var div = node && node.firstChild;
    if (!div || typeof div.getBoundingClientRect !== 'function') return;
    var rect = div.getBoundingClientRect();
    var fit = latexFit(rect.width, rect.height, availW);
    node.setAttribute('width', fit.width);
    node.setAttribute('height', fit.height);
    if (fit.scale !== 1) {
      div.style.transform = 'scale(' + fit.scale + ')';
      div.style.transformOrigin = 'left top';
    }
  }

  // The scene's human-facing caption, trimmed; '' when the scene has none.
  // DOM-free; stripLabels(), stripAria(), and mount() all read captions
  // through this so labels, aria-labels, and tests share one caption source.
  function fullCaption(scene) {
    var c = scene && scene.caption;
    if (c === undefined || c === null) return '';
    return String(c).trim();
  }

  // One filmstrip label per scene: 1-based index plus the scene caption,
  // e.g. "3 · Odd powers: one end falls". Captions longer than 28 chars are
  // truncated with an ellipsis; a missing/empty caption falls back to the
  // scene id, then to the 0-based index. The id is a fallback only — the
  // filmstrip is for students, not for internal identifiers.
  var STRIP_LABEL_MAX = 28;
  function stripLabels(scenes) {
    return (scenes || []).map(function (scene, i) {
      var text = fullCaption(scene);
      if (!text) {
        text = (scene && scene.id !== undefined && scene.id !== null &&
          String(scene.id) !== '') ? String(scene.id) : String(i);
      } else if (text.length > STRIP_LABEL_MAX) {
        text = text.slice(0, STRIP_LABEL_MAX) + '…';
      }
      return (i + 1) + ' · ' + text;
    });
  }

  // aria-label for one filmstrip button: carries the FULL (untruncated)
  // caption so screen-reader users navigate by content, not by internal id.
  function stripAria(index, scene) {
    var fc = fullCaption(scene);
    return 'Go to scene ' + (index + 1) + (fc ? ': ' + fc : '');
  }

  // The control chrome's button affordances, in order. DOM-free: mount()
  // builds the .ap-controls markup from this, and Node tests assert the
  // chrome's affordances through it without a DOM. Glyphs are HTML entities
  // because the markup is injected via innerHTML, matching the previous
  // hardcoded buttons exactly; the restart glyph is the standard
  // replay/restart arrow.
  function controlButtons() {
    return [
      { action: 'prev', title: 'Previous scene', glyph: '|&#9664;' },
      { action: 'play', title: 'Play/Pause', glyph: '&#9654;' },
      { action: 'next', title: 'Next scene', glyph: '&#9654;|' },
      { action: 'restart', title: 'Restart from the beginning', glyph: '&#8635;' }
    ];
  }

  // The one-line keyboard-shortcut hint shown in the control chrome.
  // DOM-free: mount() inserts this text into the controls row; Node tests
  // assert the wording through it. keyAction itself is untouched (issue #151)
  // — this only makes the already-tested shortcuts discoverable.
  function shortcutHint() {
    return 'Space: play/pause \u00B7 \u2190/\u2192: scenes';
  }

  // Map a keyboard event to a player action. DOM-free: takes an event-like
  // {key, target} so Node tests can call it directly. Returns one of
  // 'toggle' | 'prev' | 'next', or null for unmapped keys and for keys
  // pressed while typing in an input/textarea/select.
  function keyAction(eventLike) {
    var t = eventLike && eventLike.target;
    if (t && t.tagName) {
      var tag = String(t.tagName).toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return null;
    }
    var key = eventLike && eventLike.key;
    if (key === ' ' || key === 'Spacebar') return 'toggle';
    if (key === 'ArrowLeft') return 'prev';
    if (key === 'ArrowRight') return 'next';
    return null;
  }

  // Pure prefers-reduced-motion check: takes a matchMedia-like function so
  // tests can inject a fake. The call site inside mount() guards
  // matchMedia's existence; server/odd environments must never throw.
  function prefersReducedMotion(matcher) {
    if (typeof matcher !== 'function') return false;
    try {
      var m = matcher('(prefers-reduced-motion: reduce)');
      return !!(m && m.matches);
    } catch (e) {
      return false;
    }
  }

  // Pure sector path builder — the SVG `d` for a pie slice / angle arc /
  // mensuration sector. Angles in degrees, 0 = east, positive clockwise
  // (canvas y-down). DOM-free so Node tests can assert the exact path string.
  function ptOnCircle(cx, cy, r, angleDeg) {
    var a = angleDeg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  // Trim float noise: round to 3 decimals, collapse -0 to '0'.
  function fmtNum(n) {
    var r = Math.round(n * 1000) / 1000;
    return r === 0 ? '0' : String(r);
  }

  function sectorPath(shape) {
    var cx = shape.cx, cy = shape.cy, r = shape.r;
    var delta = ((shape.endAngle - shape.startAngle) % 360 + 360) % 360;
    var start = ptOnCircle(cx, cy, r, shape.startAngle);
    var d = 'M' + fmtNum(cx) + ',' + fmtNum(cy) +
            ' L' + fmtNum(start[0]) + ',' + fmtNum(start[1]);
    if (delta === 0) {
      // Full circle: a single arc cannot close on its own start point, so
      // emit two 180-degree arcs back to the start.
      var mid = ptOnCircle(cx, cy, r, shape.startAngle + 180);
      d += ' A' + fmtNum(r) + ',' + fmtNum(r) + ' 0 1 1 ' +
           fmtNum(mid[0]) + ',' + fmtNum(mid[1]) +
           ' A' + fmtNum(r) + ',' + fmtNum(r) + ' 0 1 1 ' +
           fmtNum(start[0]) + ',' + fmtNum(start[1]);
    } else {
      var end = ptOnCircle(cx, cy, r, shape.endAngle);
      d += ' A' + fmtNum(r) + ',' + fmtNum(r) + ' 0 ' +
           (delta > 180 ? '1' : '0') + ' 1 ' +
           fmtNum(end[0]) + ',' + fmtNum(end[1]);
    }
    return d + ' Z';
  }

  // Dash style for line and arrow (issue #156): absent, null, or empty =
  // solid, so return undefined and el() sets no stroke-dasharray attribute;
  // otherwise the pattern string passes through to SVG verbatim. For arrows
  // the dash applies to the shaft only — the head stays solid. Factored out
  // so it can be unit-tested without a DOM.
  function dashAttr(shape) {
    if (shape.dash === undefined || shape.dash === null || shape.dash === '') return undefined;
    return shape.dash;
  }

  // Tapered arrow shaft (issue #164): a quadrilateral from the tail point to
  // the arrowhead base, width wt at the tail interpolated to wh at the head
  // end — Sankey-style flow arrows. The caller passes the head size so the
  // shaft ends exactly where drawShape's arrowhead begins. Pure, exported
  // for Node tests.
  function taperShaft(shape, wt, wh, headSize) {
    var dx = shape.x2 - shape.x1, dy = shape.y2 - shape.y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux = len === 0 ? 1 : dx / len, uy = len === 0 ? 0 : dy / len;
    var nx = -uy, ny = ux;
    var bl = len - headSize < 0 ? 0 : len - headSize;
    var bx = shape.x1 + ux * bl, by = shape.y1 + uy * bl;
    return (shape.x1 + nx * wt / 2) + ',' + (shape.y1 + ny * wt / 2) + ' ' +
           (bx + nx * wh / 2) + ',' + (by + ny * wh / 2) + ' ' +
           (bx - nx * wh / 2) + ',' + (by - ny * wh / 2) + ' ' +
           (shape.x1 - nx * wt / 2) + ',' + (shape.y1 - ny * wt / 2);
  }

  // --- animath 0.2 curve / trajectory helpers (issue #1648 follow-up) ---
  // All pure and DOM-free; the player, export-frames, and Node tests share
  // them through player.internals so the three render paths cannot drift.
  // Shapes are self-contained: a function_plot carries its own domain /
  // range / viewport (no cross-shape axes reference to resolve), and a
  // polyline_trace carries canvas-coord points like polygon.

  // Easing for draw / move_along_path (SPEC.md "Animation spec v0.2"):
  // linear, ease-in (p^2), ease-out (1-(1-p)^2), ease-in-out. Progress is
  // clamped to 0..1; an unknown name falls back to linear (the validator
  // rejects unknown names first, so this is defensive only).
  function applyEasing(name, p) {
    var q = p < 0 ? 0 : (p > 1 ? 1 : p);
    if (name === 'ease-in') return q * q;
    if (name === 'ease-out') return 1 - (1 - q) * (1 - q);
    if (name === 'ease-in-out') {
      return q < 0.5 ? 2 * q * q : 1 - (-2 * q + 2) * (-2 * q + 2) / 2;
    }
    return q;
  }

  // Sample a polynomial function_plot into canvas-coord [x, y] points:
  // samples (default 100) evenly spaced over domain, y = sum c[k] * x^k,
  // mapped through viewport (canvas y-down, so range.max sits at the top).
  function samplePolynomial(shape) {
    var n = shape.samples || 100;
    var d = shape.domain, r = shape.range, v = shape.viewport;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0 : i / (n - 1);
      var xv = d.min + (d.max - d.min) * t;
      var yv = 0;
      for (var k = 0; k < shape.coefficients.length; k++) {
        yv += shape.coefficients[k] * Math.pow(xv, k);
      }
      pts.push([
        v.x + v.w * (xv - d.min) / (d.max - d.min),
        v.y + v.h * (r.max - yv) / (r.max - r.min)
      ]);
    }
    return pts;
  }

  // Canvas-coord sample points for a path shape: the sampled polynomial
  // for function_plot, a copy of the authored points for polyline_trace,
  // [] for anything else (the validator keeps other kinds out).
  function pathPoints(shape) {
    if (!shape) return [];
    if (shape.kind === 'function_plot') return samplePolynomial(shape);
    if (shape.kind === 'polyline_trace') {
      return (shape.points || []).map(function (p) { return [p[0], p[1]]; });
    }
    return [];
  }

  // Total arc length of a polyline (0 for fewer than 2 points).
  function polylineLength(points) {
    var total = 0;
    for (var i = 1; i < points.length; i++) {
      var dx = points[i][0] - points[i - 1][0];
      var dy = points[i][1] - points[i - 1][1];
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
  }

  // Point at arc-length progress (0..1) along a polyline: progress 0 is
  // the first point, 1 the last, anything else linearly interpolated
  // along the segment that contains that arc length. Deterministic given
  // the points, so draw and move_along_path agree on the path.
  function pointAtProgress(points, progress) {
    if (!points.length) return [0, 0];
    if (points.length === 1 || progress <= 0) return [points[0][0], points[0][1]];
    if (progress >= 1) {
      var last = points[points.length - 1];
      return [last[0], last[1]];
    }
    var total = polylineLength(points);
    var target = total * progress;
    var acc = 0;
    for (var i = 1; i < points.length; i++) {
      var dx = points[i][0] - points[i - 1][0];
      var dy = points[i][1] - points[i - 1][1];
      var seg = Math.sqrt(dx * dx + dy * dy);
      if (acc + seg >= target) {
        var f = seg === 0 ? 0 : (target - acc) / seg;
        return [points[i - 1][0] + dx * f, points[i - 1][1] + dy * f];
      }
      acc += seg;
    }
    var end = points[points.length - 1];
    return [end[0], end[1]];
  }

  // The leading portion of a polyline up to arc-length fraction frac:
  // whole segments plus one interpolated endpoint. frac <= 0 yields a
  // single point (an 'M x,y' path draws nothing), frac >= 1 the full
  // polyline — so a draw reveal at progress 0 shows nothing of the path
  // and at progress 1 shows all of it.
  function partialPolyline(points, frac) {
    if (!points.length) return [];
    if (frac <= 0) return [[points[0][0], points[0][1]]];
    if (frac >= 1) return points.map(function (p) { return [p[0], p[1]]; });
    var end = pointAtProgress(points, frac);
    var total = polylineLength(points);
    var target = total * frac;
    var acc = 0;
    var out = [[points[0][0], points[0][1]]];
    for (var i = 1; i < points.length; i++) {
      var dx = points[i][0] - points[i - 1][0];
      var dy = points[i][1] - points[i - 1][1];
      var seg = Math.sqrt(dx * dx + dy * dy);
      if (acc + seg >= target) { out.push(end); return out; }
      acc += seg;
      out.push([points[i][0], points[i][1]]);
    }
    out.push(end);
    return out;
  }

  // SVG path data for a polyline: 'M x,y L x,y ...' (a single point is
  // just 'M x,y', which draws nothing). Numbers go through fmtNum so the
  // player and export-frames emit identical path strings.
  function polylinePath(points) {
    if (!points.length) return '';
    var d = 'M' + fmtNum(points[0][0]) + ',' + fmtNum(points[0][1]);
    for (var i = 1; i < points.length; i++) {
      d += ' L' + fmtNum(points[i][0]) + ',' + fmtNum(points[i][1]);
    }
    return d;
  }

  // Marker position for move_along_path: the path point at arc-length
  // progress, expressed in the marker shape's own position fields
  // (cx/cy for circle, x/y for text/rect/latex). Pure; applyPos applies it.
  function markerPos(shape, points, progress) {
    var pt = pointAtProgress(points, progress);
    if (shape.kind === 'circle') return { cx: pt[0], cy: pt[1] };
    return { x: pt[0], y: pt[1] };
  }

  // Axes geometry (SPEC.md "Animation spec v0.2"): the frame rect, the
  // zero axes (clamped into the frame when 0 is outside the range), and
  // the tick positions/labels. Shared by drawShape and export-frames so
  // the live player and the exported frames agree exactly. Tick step
  // defaults to one fifth of the domain/range span.
  function axesGeometry(shape) {
    var mapX = function (v) {
      return shape.x + shape.w * (v - shape.xRange.min) / (shape.xRange.max - shape.xRange.min);
    };
    var mapY = function (v) {
      return shape.y + shape.h * (shape.yRange.max - v) / (shape.yRange.max - shape.yRange.min);
    };
    function ticks(min, max, step) {
      var out = [];
      var first = Math.ceil(min / step) * step;
      for (var v = first; v <= max + 1e-9; v += step) {
        // Round off float accumulation (e.g. 0.30000000000000004).
        out.push(Math.round(v * 1000) / 1000);
      }
      return out;
    }
    var xStep = shape.tickStep || (shape.xRange.max - shape.xRange.min) / 5;
    var yStep = shape.tickStep || (shape.yRange.max - shape.yRange.min) / 5;
    return {
      mapX: mapX, mapY: mapY,
      xAxisY: Math.max(shape.y, Math.min(shape.y + shape.h, mapY(0))),
      yAxisX: Math.max(shape.x, Math.min(shape.x + shape.w, mapX(0))),
      xTicks: ticks(shape.xRange.min, shape.xRange.max, xStep),
      yTicks: ticks(shape.yRange.min, shape.yRange.max, yStep)
    };
  }

  // "Explain me this" tooltips (issue #173): an optional plain-text
  // `explain` field on any shape becomes a hover / tap / keyboard-focus
  // tooltip in the player. Pure helpers so Node tests can exercise the
  // mapping without a DOM; mount() only wires events and positions the
  // tooltip element (browser-only, verified by reading the diff).
  //
  // Returns the authored tooltip text, or '' when the shape carries none
  // (missing, non-string, empty, or whitespace-only — all inert).
  function explainText(shape) {
    var e = shape && shape.explain;
    return (typeof e === 'string' && e.trim()) ? e : '';
  }

  // Tooltip anchor: given a stage-relative pointer position and the stage
  // size, returns the tooltip's top-left corner so the tooltip (max-width
  // 240px) lands near the pointer without leaving the stage. Pure and
  // DOM-free; mount() converts pointer coords to stage-relative first.
  var TIP_DX = 12, TIP_DY = 16, TIP_MAXW = 240, TIP_EST_H = 110, TIP_M = 8;
  function tipPoint(px, py, stageW, stageH) {
    var x = px + TIP_DX, y = py + TIP_DY;
    var maxX = Math.max(TIP_M, stageW - TIP_MAXW - TIP_M);
    var maxY = Math.max(TIP_M, stageH - TIP_EST_H - TIP_M);
    return {
      x: Math.max(TIP_M, Math.min(x, maxX)),
      y: Math.max(TIP_M, Math.min(y, maxY))
    };
  }

  function drawShape(shape) {
    var n;
    switch (shape.kind) {
      case 'text': {
        n = textNode(shape.x, shape.y, shape.text, shape);
        break;
      }
      case 'latex': {
        if (katexAvailable(global.katex)) {
          var html = global.katex.renderToString(shape.tex, { throwOnError: false });
          // Placeholder 1x1 box: fitLatex measures the laid-out equation
          // after insertion and sizes the foreignObject to the content.
          // max-content lets the equation lay out at its natural width so
          // the measurement is the full unclipped equation.
          n = el('foreignObject', { x: shape.x, y: shape.y, width: 1, height: 1 });
          var div = document.createElement('div');
          div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
          div.style.fontSize = (shape.size || 28) + 'px';
          div.style.color = shape.color || '#1a1a1a';
          div.style.fontFamily = 'system-ui, -apple-system, sans-serif';
          div.style.width = 'max-content';
          div.innerHTML = html;
          n.appendChild(div);
        } else {
          n = textNode(shape.x, shape.y, latexFallbackText(shape.tex), shape);
        }
        break;
      }
      case 'rect':
        n = el('rect', {
          x: shape.x, y: shape.y, width: shape.w, height: shape.h, rx: shape.rx || 0,
          fill: shape.fill || 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 2
        });
        break;
      case 'circle':
        n = el('circle', {
          cx: shape.cx, cy: shape.cy, r: shape.r,
          fill: shape.fill || 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 2
        });
        break;
      case 'line':
        n = el('line', {
          x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2,
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.width || 3,
          'stroke-linecap': 'round',
          'stroke-dasharray': dashAttr(shape)
        });
        break;
      case 'arrow': {
        n = el('g', {});
        var stroke = shape.stroke || '#1a1a1a';
        var w = shape.width || 3;
        // Issue #164: optional widths [tailWidth, headWidth] renders the
        // shaft as a tapered polygon (Sankey-style flow arrows); the
        // arrowhead scales with the head-end width. Without widths the
        // existing stroke-line shaft path runs unchanged (byte-identical).
        var hasTaper = isWidths(shape.widths);
        var wt = hasTaper ? shape.widths[0] : w;
        var wh = hasTaper ? shape.widths[1] : w;
        var hs = 10 + wh * 2;
        if (hasTaper) {
          // dash is ignored on a tapered shaft: stroke-dasharray cannot
          // apply to a filled polygon (documented in SPEC.md).
          n.appendChild(el('polygon', {
            points: taperShaft(shape, wt, wh, hs), fill: stroke
          }));
        } else {
          n.appendChild(el('line', {
            x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2,
            stroke: stroke, 'stroke-width': w, 'stroke-linecap': 'round',
            'stroke-dasharray': dashAttr(shape)
          }));
        }
        var ang = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        var p1x = shape.x2 - hs * Math.cos(ang - 0.42);
        var p1y = shape.y2 - hs * Math.sin(ang - 0.42);
        var p2x = shape.x2 - hs * Math.cos(ang + 0.42);
        var p2y = shape.y2 - hs * Math.sin(ang + 0.42);
        n.appendChild(el('polygon', {
          points: shape.x2 + ',' + shape.y2 + ' ' + p1x + ',' + p1y + ' ' + p2x + ',' + p2y,
          fill: stroke
        }));
        break;
      }
      case 'polygon': {
        var pts = shape.points.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
        n = el('polygon', {
          points: pts,
          fill: shape.fill || 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 2,
          'stroke-linejoin': 'round'
        });
        break;
      }
      case 'sector':
        n = el('path', {
          d: sectorPath(shape),
          fill: shape.fill || 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 2
        });
        break;
      case 'axes':
      case 'coordinate_system': {
        // Bounded math domain: frame rect, zero axes (clamped into the
        // frame when 0 is outside the range), tick marks + labels from
        // axesGeometry. coordinate_system renders identically to axes.
        var g = axesGeometry(shape);
        n = el('g', {});
        n.appendChild(el('rect', {
          x: shape.x, y: shape.y, width: shape.w, height: shape.h,
          fill: shape.fill || 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 2
        }));
        n.appendChild(el('line', {
          x1: shape.x, y1: g.xAxisY, x2: shape.x + shape.w, y2: g.xAxisY,
          stroke: shape.stroke || '#1a1a1a', 'stroke-width': shape.strokeWidth || 2
        }));
        n.appendChild(el('line', {
          x1: g.yAxisX, y1: shape.y, x2: g.yAxisX, y2: shape.y + shape.h,
          stroke: shape.stroke || '#1a1a1a', 'stroke-width': shape.strokeWidth || 2
        }));
        g.xTicks.forEach(function (v) {
          var tx = g.mapX(v);
          n.appendChild(el('line', {
            x1: tx, y1: g.xAxisY - 5, x2: tx, y2: g.xAxisY + 5,
            stroke: shape.stroke || '#1a1a1a', 'stroke-width': 2
          }));
          n.appendChild(textNode(tx, g.xAxisY + 22, fmtNum(v),
            { size: 16, color: '#1a1a1a', align: 'middle' }));
        });
        g.yTicks.forEach(function (v) {
          var ty = g.mapY(v);
          n.appendChild(el('line', {
            x1: g.yAxisX - 5, y1: ty, x2: g.yAxisX + 5, y2: ty,
            stroke: shape.stroke || '#1a1a1a', 'stroke-width': 2
          }));
          n.appendChild(textNode(g.yAxisX - 10, ty + 6, fmtNum(v),
            { size: 16, color: '#1a1a1a', align: 'end' }));
        });
        if (shape.xLabel) {
          n.appendChild(textNode(shape.x + shape.w - 4, g.xAxisY - 10, shape.xLabel,
            { size: 18, color: '#1a1a1a', align: 'end' }));
        }
        if (shape.yLabel) {
          n.appendChild(textNode(g.yAxisX + 10, shape.y + 16, shape.yLabel,
            { size: 18, color: '#1a1a1a', align: 'start' }));
        }
        break;
      }
      case 'function_plot':
        n = el('path', {
          d: polylinePath(samplePolynomial(shape)),
          fill: 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 3,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round'
        });
        break;
      case 'polyline_trace':
        n = el('path', {
          d: polylinePath(pathPoints(shape)),
          fill: 'none',
          stroke: shape.stroke || '#1a1a1a',
          'stroke-width': shape.strokeWidth || 3,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round'
        });
        break;
      default:
        throw new Error('unknown shape kind: ' + shape.kind);
    }
    n.setAttribute('data-shape-id', shape.id);
    n.style.opacity = '0';
    n.style.transition = 'opacity ' + FADE_MS + 'ms ease';
    return n;
  }

  // Position and size fields per shape kind, for move interpolation.
  var POS_FIELDS = {
    text: ['x', 'y'],
    latex: ['x', 'y'],
    rect: ['x', 'y', 'w', 'h'],
    circle: ['cx', 'cy', 'r'],
    line: ['x1', 'y1', 'x2', 'y2'],
    arrow: ['x1', 'y1', 'x2', 'y2', 'widths'],
    polygon: ['points']
  };

  function isNum(x) { return typeof x === 'number' && isFinite(x); }

  // Width profile for tapered arrows (issue #164): [tailWidth, headWidth],
  // exactly two positive numbers. Pure; mirrors validate.js' check.
  function isWidths(x) {
    return Array.isArray(x) && x.length === 2 && isNum(x[0]) && x[0] > 0 && isNum(x[1]) && x[1] > 0;
  }

  // Polygon move: `points` is not a scalar field — interpolate each [x,y]
  // pair pointwise. Guarded on equal, well-formed arrays; the validator
  // enforces this first, so on malformed input this returns undefined and
  // interpFields simply skips the field instead of throwing.
  function interpPoints(fromPts, toPts, p) {
    if (!Array.isArray(fromPts) || !Array.isArray(toPts) || fromPts.length !== toPts.length) return undefined;
    var out = [];
    for (var i = 0; i < toPts.length; i++) {
      var a = fromPts[i], b = toPts[i];
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== 2 || b.length !== 2 ||
          !isNum(a[0]) || !isNum(a[1]) || !isNum(b[0]) || !isNum(b[1])) return undefined;
      out.push([a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]);
    }
    return out;
  }

  // Width-profile move (issue #164): `widths` is not a scalar field —
  // interpolate the [tail, head] pair componentwise. Guarded like points:
  // malformed input returns undefined and interpFields skips the field
  // instead of throwing. Widths must be positive (SPEC.md) to interpolate.
  function interpPair(fromPair, toPair, p) {
    if (!Array.isArray(fromPair) || !Array.isArray(toPair) ||
        fromPair.length !== 2 || toPair.length !== 2 ||
        !isNum(fromPair[0]) || fromPair[0] <= 0 || !isNum(fromPair[1]) || fromPair[1] <= 0 ||
        !isNum(toPair[0]) || toPair[0] <= 0 || !isNum(toPair[1]) || toPair[1] <= 0) return undefined;
    return [fromPair[0] + (toPair[0] - fromPair[0]) * p,
            fromPair[1] + (toPair[1] - fromPair[1]) * p];
  }

  // Pure per-field interpolation of a move tween: pos[f] = from[f] +
  // (to[f] - from[f]) * p for every field present in `to` that also has a
  // starting value in `from`. Factored out of the tween loop so it can be
  // tested without a DOM; the tween loop calls it on every frame.
  function interpFields(from, to, p) {
    var pos = {};
    for (var f in to) {
      if (f === 'points') {
        var pts = interpPoints(from.points, to.points, p);
        if (pts !== undefined) pos.points = pts;
      } else if (f === 'widths') {
        // Arrow taper animation (issue #164): componentwise interpolation of
        // the [tailWidth, headWidth] pair. If the shown shape declared no
        // widths, there is no start value — the taper snaps in at move end.
        var wts = interpPair(from.widths, to.widths, p);
        if (wts !== undefined) pos.widths = wts;
      } else if (from[f] !== undefined) {
        pos[f] = from[f] + (to[f] - from[f]) * p;
      }
    }
    return pos;
  }

  // SVG attribute names differ from spec field names for rect size:
  // drawShape maps shape.w/shape.h to width/height, so applyPos must too —
  // setting raw 'w'/'h' attributes is a rendering no-op. Other fields name
  // their attribute directly (circle r is unaffected).
  var FIELD_ATTR = { w: 'width', h: 'height' };

  function applyPos(node, shape, pos) {
    var fields = POS_FIELDS[shape.kind];
    if (!fields) return;
    fields.forEach(function (f) {
      if (pos[f] === undefined) return;
      // Arrow taper (issue #164): widths is not an SVG attribute — the
      // arrowhead rebuild below re-renders the shaft with the new widths.
      if (f === 'widths') return;
      if (f === 'points') {
        // polygon: serialize the [x,y] pairs to the SVG points attribute,
        // mirroring drawShape's polygon case. Guarded so a malformed
        // pos.points is a no-op rather than a throw.
        if (Array.isArray(pos.points)) {
          node.setAttribute('points', pos.points.map(function (p) { return p[0] + ',' + p[1]; }).join(' '));
        }
        return;
      }
      node.setAttribute(FIELD_ATTR[f] || f, pos[f]);
    });
    if (shape.kind === 'arrow') {
      // Rebuild the arrowhead at the new tip.
      while (node.firstChild) node.removeChild(node.firstChild);
      var rebuilt = drawShape({
        id: shape.id, kind: 'arrow',
        x1: pos.x1 !== undefined ? pos.x1 : shape.x1,
        y1: pos.y1 !== undefined ? pos.y1 : shape.y1,
        x2: pos.x2 !== undefined ? pos.x2 : shape.x2,
        y2: pos.y2 !== undefined ? pos.y2 : shape.y2,
        stroke: shape.stroke, width: shape.width, dash: shape.dash,
        widths: pos.widths !== undefined ? pos.widths : shape.widths
      });
      rebuilt.style.opacity = '1';
      rebuilt.style.transition = 'none';
      while (rebuilt.firstChild) node.appendChild(rebuilt.firstChild);
    }
  }

  function currentPos(shape) {
    var fields = POS_FIELDS[shape.kind] || [];
    var pos = {};
    fields.forEach(function (f) {
      if (shape[f] !== undefined) pos[f] = shape[f];
    });
    return pos;
  }

  function mount(container, spec) {
    // Fail fast on a malformed spec: resolve the validator from the captured
    // global (every browser page loads validate.js before player.js) or from
    // the Node module, then reject invalid specs naming the failing field.
    var validateFn = global.AnimathValidate ? global.AnimathValidate.validateSpec : null;
    if (!validateFn && typeof require === 'function') {
      validateFn = require('./validate.js').validateSpec;
    }
    if (!validateFn) {
      throw new Error('animath player: player/validate.js is missing — ' +
        'include it before player.js so specs can be validated');
    }
    var specErrors = validateFn(spec);
    if (specErrors.length) {
      throw new Error('invalid animath spec: ' + specErrors.join('; '));
    }

    var W = spec.canvas.width, H = spec.canvas.height;

    container.innerHTML = '';
    container.className = (container.className + ' animath-player').trim();

    var header = document.createElement('div');
    header.className = 'ap-header';
    header.textContent = spec.title;
    container.appendChild(header);

    var captionBar = document.createElement('div');
    captionBar.className = 'ap-caption';
    container.appendChild(captionBar);

    var stage = document.createElement('div');
    stage.className = 'ap-stage';
    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      width: '100%',
      preserveAspectRatio: 'xMidYMid meet'
    });
    stage.appendChild(svg);
    container.appendChild(stage);

    // Explain-me-this tooltip (issue #173): one absolutely-positioned div
    // per player, shown when the pointer hovers, a touch taps, or keyboard
    // focus lands on a shape carrying `explain`. pointer-events: none keeps
    // it from intercepting clicks; it lives inside .ap-stage (position:
    // relative) so it never covers the caption bar above or the controls
    // below, and it hides whenever the scene changes or the target shape
    // is hidden.
    var tip = document.createElement('div');
    tip.className = 'ap-tooltip';
    tip.setAttribute('role', 'tooltip');
    stage.appendChild(tip);

    function hideTip() { tip.style.display = 'none'; }

    // clientX/clientY are client coords; convert to stage-relative and
    // clamp via the pure tipPoint() helper so the tooltip stays in stage.
    function showTip(text, clientX, clientY) {
      var rect = stage.getBoundingClientRect();
      var p = tipPoint(clientX - rect.left, clientY - rect.top, rect.width, rect.height);
      tip.textContent = text;
      tip.style.left = p.x + 'px';
      tip.style.top = p.y + 'px';
      tip.style.display = 'block';
    }

    // Keyboard focus has no pointer: anchor on the shape's own bbox.
    function showTipForNode(node, text) {
      var rect = stage.getBoundingClientRect();
      var nb = node.getBoundingClientRect();
      showTip(text, nb.left + nb.width / 2, nb.top + nb.height / 2);
    }

    // Wire a shape carrying explain text as a tooltip target: focusable
    // (tabindex + img role + aria-label) only because it has something to
    // say; shapes without explain text get none of this and stay inert.
    function wireExplain(node, shape) {
      var text = explainText(shape);
      if (!text) return;
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', text);
      node.addEventListener('mouseenter', function (e) { showTip(text, e.clientX, e.clientY); });
      node.addEventListener('mouseleave', hideTip);
      // Touch has no hover, so a tap shows the tooltip too; a mouse click
      // showing it is harmless (hover already did).
      node.addEventListener('click', function (e) { showTip(text, e.clientX, e.clientY); });
      node.addEventListener('focus', function () { showTipForNode(node, text); });
      node.addEventListener('blur', hideTip);
    }

    var narration = document.createElement('div');
    narration.className = 'ap-narration';
    container.appendChild(narration);

    var controls = document.createElement('div');
    controls.className = 'ap-controls';
    controls.innerHTML =
      controlButtons().map(function (b) {
        return '<button data-a="' + b.action + '" title="' + b.title + '">' +
          b.glyph + '</button>';
      }).join('') +
      '<input data-a="scrub" type="range" min="0" max="1000" value="0">' +
      '<span data-a="tlabel">0:00 / 0:00</span>' +
      '<select data-a="speed"><option value="0.5">0.5x</option>' +
      '<option value="1" selected>1x</option><option value="1.5">1.5x</option>' +
      '<option value="2">2x</option></select>' +
      '<span class="ap-kbd-hint" data-a="hint">' + shortcutHint() + '</span>';
    container.appendChild(controls);

    var btnPlay = controls.querySelector('[data-a="play"]');
    var scrub = controls.querySelector('[data-a="scrub"]');
    var tlabel = controls.querySelector('[data-a="tlabel"]');
    var speedSel = controls.querySelector('[data-a="speed"]');

    // Filmstrip nav: one button per scene. Each button jumps through the
    // same goScene closure the prev/next controls use.
    var strip = document.createElement('div');
    strip.className = 'ap-filmstrip';
    var stripBtns = stripLabels(spec.scenes).map(function (label, i) {
      var b = document.createElement('button');
      b.setAttribute('data-scene', String(i));
      b.setAttribute('aria-label', stripAria(i, spec.scenes[i]));
      b.textContent = label;
      b.addEventListener('click', function () { goScene(i, 0); });
      strip.appendChild(b);
      return b;
    });
    container.appendChild(strip);

    var state = {
      sceneIdx: 0,
      sceneTime: 0,       // ms into current scene
      playing: false,
      speed: 1,
      raf: 0,
      lastTick: 0,
      fired: {},          // step index -> true (per scene render)
      tweens: [],         // active move interpolations
      draws: [],          // active draw (progressive reveal) interpolations
      movers: [],         // active move_along_path interpolations
      pulses: [],         // active emphasize animations
      shapes: {},         // id -> {node, shape}
      listeners: { scene: [] }
    };

    function fmt(ms) {
      var s = Math.floor(ms / 1000);
      return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    }

    // Honor prefers-reduced-motion: render every path instantly (no tween /
    // fade / pulse animation) when the OS setting is on. matchMedia is
    // feature-guarded; Node test runs never call mount() so it is simply
    // absent there. Narration/caption text and all timing are untouched.
    var reducedMotion = prefersReducedMotion(typeof matchMedia === 'function' ? matchMedia : null);

    function emitScene() {
      state.listeners.scene.forEach(function (fn) { fn(state.sceneIdx); });
    }

    function clearScene() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      hideTip();
      state.shapes = {};
      state.fired = {};
      state.tweens = [];
      state.draws = [];
      state.movers = [];
      state.pulses = [];
    }

    function fireStep(step, instant) {
      var dur = step.dur_ms || 900;
      switch (step.do) {
        case 'show': {
          var node = drawShape(step.shape);
          svg.appendChild(node);
          wireExplain(node, step.shape);
          if (step.shape.kind === 'latex' && node.tagName === 'foreignObject') {
            // Content-fit the equation box now that it is laid out: long
            // equations no longer clip at the old fixed 480x240 box, and
            // oversized ones scale down to the available stage width.
            fitLatex(node, W - step.shape.x);
          }
          state.shapes[step.shape.id] = { node: node, shape: step.shape };
          if (instant) {
            node.style.transition = 'none';
            node.style.opacity = '1';
          } else {
            requestAnimationFrame(function () { node.style.opacity = '1'; });
          }
          break;
        }
        case 'hide': {
          var rec = state.shapes[step.target];
          if (!rec) break;
          hideTip();
          if (instant) {
            if (rec.node.parentNode) rec.node.parentNode.removeChild(rec.node);
          } else {
            rec.node.style.opacity = '0';
            setTimeout(function () {
              if (rec.node.parentNode) rec.node.parentNode.removeChild(rec.node);
            }, FADE_MS + 50);
          }
          delete state.shapes[step.target];
          break;
        }
        case 'move': {
          var mrec = state.shapes[step.target];
          if (!mrec || !POS_FIELDS[mrec.shape.kind]) break;
          if (instant) {
            applyPos(mrec.node, mrec.shape, step.to);
            mrec.shape = Object.assign({}, mrec.shape, step.to);
          } else {
            state.tweens.push({
              rec: mrec, from: currentPos(mrec.shape), to: step.to,
              start: state.sceneTime, dur: step.dur_ms || 800
            });
          }
          break;
        }
        case 'emphasize': {
          var erec = state.shapes[step.target];
          if (!erec) break;
          if (!instant) {
            state.pulses.push({ rec: erec, start: state.sceneTime, dur: dur });
          }
          break;
        }
        case 'draw': {
          // animath 0.2: progressive reveal of a path shape along its
          // sampled arc length. Instant (seek / scrub / reduced motion)
          // renders the final state: the path up to toProgress.
          var drec = state.shapes[step.target];
          if (!drec) break;
          var dpts = pathPoints(drec.shape);
          if (instant) {
            drec.node.setAttribute('d', polylinePath(partialPolyline(dpts, step.toProgress)));
          } else {
            // Start at fromProgress immediately: until the first tick the
            // node would otherwise show the full path for one frame.
            drec.node.setAttribute('d', polylinePath(partialPolyline(dpts, step.fromProgress)));
            state.draws.push({
              rec: drec, pts: dpts,
              from: step.fromProgress, to: step.toProgress,
              start: state.sceneTime, dur: step.dur_ms || 800,
              easing: step.easing || 'linear'
            });
          }
          break;
        }
        case 'move_along_path': {
          // animath 0.2: a marker shape travels along a path shape; the
          // marker position is the path point at the eased arc-length
          // progress. Instant renders the final state (toProgress).
          var mvRec = state.shapes[step.marker];
          var pathRec = state.shapes[step.path];
          if (!mvRec || !pathRec) break;
          var mpts = pathPoints(pathRec.shape);
          if (instant) {
            var finalPos = markerPos(mvRec.shape, mpts, step.toProgress);
            applyPos(mvRec.node, mvRec.shape, finalPos);
            mvRec.shape = Object.assign({}, mvRec.shape, finalPos);
          } else {
            state.movers.push({
              rec: mvRec, pts: mpts,
              from: step.fromProgress, to: step.toProgress,
              start: state.sceneTime, dur: step.dur_ms || 800,
              easing: step.easing || 'linear'
            });
          }
          break;
        }
        case 'caption': {
          captionBar.textContent = step.text;
          break;
        }
      }
    }

    function renderSceneAt(i, ms, instant) {
      clearScene();
      var scene = spec.scenes[i];
      captionBar.textContent = scene.caption;
      narration.textContent = scene.narration;
      state.sceneTime = ms;
      scene.steps.forEach(function (step, si) {
        if (step.at_ms <= ms) {
          fireStep(step, instant !== false);
          state.fired[si] = true;
        }
      });
      updateChrome();
    }

    // Mark only the current scene's filmstrip button as active. Called
    // from updateChrome() so play, pause, scrub, goScene, and keyboard
    // all keep the highlight in sync.
    function updateStrip() {
      stripBtns.forEach(function (b, i) {
        if (i === state.sceneIdx) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }

    function updateChrome() {
      var scene = spec.scenes[state.sceneIdx];
      scrub.value = String(Math.round((state.sceneTime / scene.duration_ms) * 1000));
      tlabel.textContent = fmt(state.sceneTime) + ' / ' + fmt(scene.duration_ms);
      btnPlay.innerHTML = state.playing ? '&#10074;&#10074;' : '&#9654;';
      updateStrip();
    }

    function tick(now) {
      if (!state.playing) return;
      var dt = (now - state.lastTick) * state.speed;
      state.lastTick = now;
      var scene = spec.scenes[state.sceneIdx];
      state.sceneTime += dt;

      // Fire due steps.
      scene.steps.forEach(function (step, si) {
        if (!state.fired[si] && step.at_ms <= state.sceneTime) {
          fireStep(step, reducedMotion);
          state.fired[si] = true;
        }
      });

      // Advance tweens.
      state.tweens = state.tweens.filter(function (tw) {
        var p = (state.sceneTime - tw.start) / tw.dur;
        if (p >= 1) {
          applyPos(tw.rec.node, tw.rec.shape, tw.to);
          tw.rec.shape = Object.assign({}, tw.rec.shape, tw.to);
          return false;
        }
        var pos = interpFields(tw.from, tw.to, p);
        applyPos(tw.rec.node, tw.rec.shape, pos);
        return true;
      });

      // Advance draw reveals (animath 0.2): the revealed fraction is the
      // eased interpolation from fromProgress to toProgress, measured
      // along the sampled arc length — deterministic given sceneTime.
      state.draws = state.draws.filter(function (dr) {
        var p = (state.sceneTime - dr.start) / dr.dur;
        if (p >= 1) {
          dr.rec.node.setAttribute('d', polylinePath(partialPolyline(dr.pts, dr.to)));
          return false;
        }
        var frac = dr.from + (dr.to - dr.from) * applyEasing(dr.easing, p);
        dr.rec.node.setAttribute('d', polylinePath(partialPolyline(dr.pts, frac)));
        return true;
      });

      // Advance move_along_path markers (animath 0.2): same eased
      // progress math as the draw reveal, so a marker riding a drawn
      // path stays exactly on the revealed tip.
      state.movers = state.movers.filter(function (mv) {
        var p = (state.sceneTime - mv.start) / mv.dur;
        var prog = mv.from + (mv.to - mv.from) * applyEasing(mv.easing, Math.min(1, p));
        var mpos = markerPos(mv.rec.shape, mv.pts, prog);
        if (p >= 1) {
          applyPos(mv.rec.node, mv.rec.shape, mpos);
          mv.rec.shape = Object.assign({}, mv.rec.shape, mpos);
          return false;
        }
        applyPos(mv.rec.node, mv.rec.shape, mpos);
        return true;
      });

      // Advance pulses.
      state.pulses = state.pulses.filter(function (pu) {
        var p = (state.sceneTime - pu.start) / pu.dur;
        if (p >= 1) {
          pu.rec.node.style.transform = '';
          return false;
        }
        var s = 1 + 0.18 * Math.sin(p * Math.PI);
        pu.rec.node.style.transformBox = 'fill-box';
        pu.rec.node.style.transformOrigin = 'center';
        pu.rec.node.style.transform = 'scale(' + s.toFixed(3) + ')';
        return true;
      });

      if (state.sceneTime >= scene.duration_ms) {
        if (state.sceneIdx < spec.scenes.length - 1) {
          goScene(state.sceneIdx + 1, 0);
          // Keep autoplay running across the scene boundary. goScene() pauses
          // (manual jumps must stay paused), so re-arm playback here directly
          // instead of play() — tick() already schedules the next frame below,
          // and a second requestAnimationFrame would double the loop to 2x.
          state.playing = true;
          state.lastTick = now;
        } else {
          pause();
          renderSceneAt(state.sceneIdx, scene.duration_ms, true);
        }
      }
      updateChrome();
      state.raf = requestAnimationFrame(tick);
    }

    function play() {
      if (state.playing) return;
      var scene = spec.scenes[state.sceneIdx];
      if (state.sceneTime >= scene.duration_ms) {
        if (state.sceneIdx < spec.scenes.length - 1) goScene(state.sceneIdx + 1, 0);
        else renderSceneAt(state.sceneIdx, 0, reducedMotion);
      }
      state.playing = true;
      state.lastTick = performance.now();
      state.raf = requestAnimationFrame(tick);
      updateChrome();
    }

    function pause() {
      state.playing = false;
      if (state.raf) cancelAnimationFrame(state.raf);
      updateChrome();
    }

    function goScene(i, ms) {
      pause();
      state.sceneIdx = Math.max(0, Math.min(spec.scenes.length - 1, i));
      renderSceneAt(state.sceneIdx, ms || 0, reducedMotion);
      emitScene();
    }

    // Wire controls.
    btnPlay.addEventListener('click', function () {
      if (state.playing) pause(); else play();
    });
    controls.querySelector('[data-a="prev"]').addEventListener('click', function () {
      goScene(state.sceneIdx - 1, 0);
    });
    controls.querySelector('[data-a="next"]').addEventListener('click', function () {
      goScene(state.sceneIdx + 1, 0);
    });
    controls.querySelector('[data-a="restart"]').addEventListener('click', function () {
      goScene(0, 0);
      play();
    });
    scrub.addEventListener('input', function () {
      var scene = spec.scenes[state.sceneIdx];
      var scrubbed = Number(scrub.value);
      pause();
      renderSceneAt(state.sceneIdx, (scrubbed / 1000) * scene.duration_ms, true);
    });
    speedSel.addEventListener('change', function () {
      state.speed = Number(speedSel.value);
    });

    // Keyboard shortcuts. The container is focusable (tabindex="0") so the
    // keys work after clicking anywhere in the player; preventDefault()
    // stops Space from scrolling the page or re-activating a focused
    // control button, so each keydown produces exactly one action.
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', function (e) {
      var action = keyAction(e);
      if (!action) return;
      e.preventDefault();
      if (action === 'toggle') { if (state.playing) pause(); else play(); }
      else if (action === 'prev') goScene(state.sceneIdx - 1, 0);
      else if (action === 'next') goScene(state.sceneIdx + 1, 0);
    });

    renderSceneAt(0, 0, reducedMotion);

    return {
      spec: spec,
      play: play,
      pause: pause,
      restart: function () { goScene(0, 0); play(); },
      nextScene: function () { goScene(state.sceneIdx + 1, 0); },
      prevScene: function () { goScene(state.sceneIdx - 1, 0); },
      seekScene: function (i, ms) { goScene(i, ms || 0); },
      setSpeed: function (x) { state.speed = x; speedSel.value = String(x); },
      on: function (evt, fn) {
        if (state.listeners[evt]) state.listeners[evt].push(fn);
      },
      destroy: function () {
        pause();
        container.innerHTML = '';
      }
    };
  }

  // Public API surface (issue #707): exactly { mount, version, internals }.
  // Everything else is an internal helper, reachable at player.internals.
  var internals = { katexAvailable: katexAvailable, latexFallbackText: latexFallbackText, latexFit: latexFit, fitLatex: fitLatex, stripLabels: stripLabels, stripAria: stripAria, fullCaption: fullCaption, keyAction: keyAction, controlButtons: controlButtons, shortcutHint: shortcutHint, prefersReducedMotion: prefersReducedMotion, interpFields: interpFields, applyPos: applyPos, sectorPath: sectorPath, dashAttr: dashAttr, taperShaft: taperShaft, isWidths: isWidths, explainText: explainText, tipPoint: tipPoint, applyEasing: applyEasing, samplePolynomial: samplePolynomial, pathPoints: pathPoints, polylineLength: polylineLength, pointAtProgress: pointAtProgress, partialPolyline: partialPolyline, polylinePath: polylinePath, markerPos: markerPos, axesGeometry: axesGeometry };
  var api = { mount: mount, version: '0.2.0', internals: internals };
  global.AnimathPlayer = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
