'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const baseline = require('./speed-baseline.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
for (const [path, expected] of Object.entries(baseline)) {
  assert.equal(hash(fs.readFileSync(path)), expected, 'Existing file changed: ' + path);
}
const speed = fs.readFileSync('speed-training.js', 'utf8');
assert.ok(!speed.includes('ecommerce-quiz-local-v1'), 'Speed UI must not reference regular quiz storage');
const core = fs.readFileSync('speed-core.js', 'utf8');
assert.ok(!core.includes('ecommerce-quiz-local-v1'), 'Core must not reference regular quiz storage');
const entry = fs.readFileSync('speed-entry.js', 'utf8');
assert.ok(entry.includes('mixed.after(button)'), 'Fourth card must appear after third');
assert.ok(!entry.includes('localStorage'), 'Homepage hook must not alter scores');
for (const file of ['speed.html', 'speed-core.js', 'speed-training.js', 'speed-training.css', 'speed-entry.js']) assert.ok(fs.statSync(file).size > 200);
console.log('PASS: existing app.js, question banks, explanations, LC data untouched byte-for-byte; all original source files including index remain byte-identical.');
