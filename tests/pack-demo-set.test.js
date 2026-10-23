/* Pack-demo set-pin tests — zero dependencies, Node built-in test runner.
 * Run: node --test "tests/*.test.js"
 *
 * Guards the drift class behind issue #1073: tests/pack-demo.test.js checks
 * player/pack-demo.html pack by pack (per-pack loader blocks, stage-array
 * width), but nothing pinned the SET of packs on the page to the gold
 * lesson-pack set on disk, so a future gold pack without a demo block — or
 * a dropped demo block — would stay green (ten separate demo-surface
 * follow-up issues, most recently #1069, closed that gap one pack at a
 * time; #1071 pinned the same drift for the player demo picker).
 * These fs assertions derive the gold file set from
 * samples/decks|worksheets|tickets|notes|scripts/ on disk and pin the page
 * to it exactly.
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const GOLD_DIRS = ['decks', 'worksheets', 'tickets', 'notes', 'scripts'];

function goldFiles() {
  const files = [];
  for (const dir of GOLD_DIRS) {
    for (const name of fs.readdirSync(path.join(ROOT, 'samples', dir))) {
      if (name.endsWith('.json')) files.push(dir + '/' + name);
    }
  }
  return files.sort();
}

function packDemoHtml() {
  return fs.readFileSync(path.join(ROOT, 'player', 'pack-demo.html'), 'utf8');
}

function goldRefsIn(html) {
  const refs = [];
  const re = /\.\.\/samples\/(decks|worksheets|tickets|notes|scripts)\/([A-Za-z0-9._-]+\.json)/g;
  let m;
  while ((m = re.exec(html)) !== null) refs.push(m[1] + '/' + m[2]);
  return refs;
}

function manifestIdsIn(html) {
  const ids = [];
  const re = /id="([^"]*-manifest)"/g;
  let m;
  while ((m = re.exec(html)) !== null) ids.push(m[1]);
  return ids;
}

test('pack demo references every gold file exactly once and no phantom gold file', () => {
  const expected = goldFiles();
  const refs = goldRefsIn(packDemoHtml());
  assert.deepStrictEqual([...refs].sort(), expected,
    'pack-demo.html gold references must equal the gold files on disk exactly');
  assert.strictEqual(new Set(refs).size, refs.length,
    'pack-demo.html must not reference the same gold file twice');
});

/* Clean-up (ii) of epic #1204 (issue #1306): four gold packs join to their
 * animations only by differing filenames, so a filename-equality join
 * silently misses them. Their manifest headers pin the pairing explicitly
 * ("deck <pack> · animation <file>"); every other pack joins by the
 * same-name convention. These assertions derive the full pack-to-animation
 * map from the manifest surface so a future differing-filename pack added
 * without a manifest entry fails here. */
const DIFFERING_PAIRS = {
  'primary-math-decimals': 'primary-math-decimals-place-value.json',
  'primary-math-percentage': 'primary-math-percentage-of-quantity.json',
  'primary-math-ratio': 'primary-math-ratio-sharing.json',
  'primary-science-photosynthesis': 'primary-science-photosynthesis-intro.json',
};

function explicitAnimationPins(html) {
  const pins = {};
  const re = /· deck ([A-Za-z0-9._-]+) · animation ([A-Za-z0-9._-]+\.json)/g;
  let m;
  while ((m = re.exec(html)) !== null) pins[m[1]] = m[2];
  return pins;
}

function packBases() {
  return fs.readdirSync(path.join(ROOT, 'samples', 'decks'))
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -'.json'.length))
    .sort();
}

test('pack manifest pins the four differing-filename pack-to-animation pairs explicitly', () => {
  assert.deepStrictEqual(explicitAnimationPins(packDemoHtml()), DIFFERING_PAIRS,
    'the four differing-filename pairs must be named in the manifest headers, and no other pack may carry an animation pin');
});

test('every gold pack resolves through the manifest to an existing animation file', () => {
  const pins = explicitAnimationPins(packDemoHtml());
  for (const base of packBases()) {
    const anim = pins[base] || base + '.json';
    assert.ok(fs.existsSync(path.join(ROOT, 'samples', anim)),
      'gold pack ' + base + ' resolves to missing animation ' + anim +
      ' — a differing-filename pack needs an explicit animation pin in its manifest header');
  }
});

test('no animation with a gold pack is left unjoined by the manifest pairs', () => {
  const pins = explicitAnimationPins(packDemoHtml());
  const joined = new Set(packBases().map((base) => pins[base] || base + '.json'));
  const animations = fs.readdirSync(path.join(ROOT, 'samples'))
    .filter((name) => name.endsWith('.json') && name !== 'index.json');
  const unjoined = animations.filter((name) => !joined.has(name)).sort();
  assert.deepStrictEqual(unjoined, [],
    'every indexed animation is joined to a gold pack');
});

test('pack demo carries exactly one unique manifest header per gold pack', () => {
  const packCount = goldFiles().filter((f) => f.startsWith('decks/')).length;
  const ids = manifestIdsIn(packDemoHtml());
  assert.strictEqual(ids.length, packCount,
    'pack-demo.html must carry one manifest header per gold pack (deck)');
  assert.strictEqual(new Set(ids).size, ids.length,
    'pack-demo.html manifest headers must be unique');
});
