/* animath player demo sample-picker tests — zero dependencies, Node built-in
 * test runner. Run: node --test "tests/*.test.js"
 *
 * Guards the drift fixed by #1071: player/demo.html hard-codes its sample
 * picker options while samples/index.json is the sample catalogue, and the
 * two silently diverged (69 options vs 72 indexed samples — the three
 * Primary Geography samples from #644 were unselectable in the demo).
 * These fs assertions pin the picker option set to the index exactly, so a
 * future sample added to the index without a picker entry (or a picker
 * entry pointing at a non-indexed file) fails the suite.
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function pickerOptions() {
  const html = fs.readFileSync(path.join(ROOT, 'player', 'demo.html'), 'utf8');
  const sel = html.match(/<select id="specsel">([\s\S]*?)<\/select>/);
  assert.ok(sel, 'player/demo.html must contain the specsel select');
  const options = [];
  const re = /<option value="([^"]+)">([^<]*)<\/option>/g;
  let m;
  while ((m = re.exec(sel[1])) !== null) options.push({ value: m[1], label: m[2] });
  return options;
}

function indexedSamples() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', 'index.json'), 'utf8'));
}

test('demo picker offers exactly the samples in samples/index.json', () => {
  const picked = pickerOptions().map((o) => o.value.replace(/^\.\.\/samples\//, ''));
  const indexed = indexedSamples();
  assert.deepStrictEqual([...picked].sort(), [...indexed].sort(),
    'picker option values must equal the indexed sample files exactly');
});

test('demo picker has no duplicate options', () => {
  const values = pickerOptions().map((o) => o.value);
  assert.strictEqual(new Set(values).size, values.length,
    'picker must not repeat an option value');
});

test('demo picker includes the three Primary Geography samples in the existing label style', () => {
  const byValue = new Map(pickerOptions().map((o) => [o.value, o.label]));
  const expected = new Map([
    ['../samples/primary-geog-erosion.json', 'Primary geography — erosion'],
    ['../samples/primary-geog-plate-tectonics.json', 'Primary geography — plate tectonics'],
    ['../samples/primary-geog-weather-climate.json', 'Primary geography — weather and climate']
  ]);
  for (const [value, label] of expected) {
    assert.strictEqual(byValue.get(value), label,
      'picker must offer ' + value + ' labelled "' + label + '"');
  }
});
