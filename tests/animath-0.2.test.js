/* animath 0.2 — bounded curve / trajectory animation contract (#1648 follow-up).
 * WIP skeleton: the validator, player and export-frames render path for the
 * versioned opt-in animath: '0.2' extension land here. Planned coverage:
 * valid 0.2 specs pass; ~20 malformed cases rejected; 0.1 specs still reject
 * 0.2-only shapes/verbs; draw reveal + move_along_path deterministic frames.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const validate = require('../player/validate.js');

test('animath 0.2 skeleton: validator entry point exists', () => {
  assert.equal(typeof validate.validateSpec, 'function');
});
