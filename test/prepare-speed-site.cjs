'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const baseline = require('./speed-baseline.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
// Append the independent entry hook only to the deploy artifact. All original
// repository sources, including index.html, remain byte-for-byte unchanged.
const target = '_site/index.html';
const source = fs.readFileSync(target, 'utf8');
assert.equal(hash(Buffer.from(source)), baseline['index.html'], 'Unexpected homepage input');
assert.equal(source.split('</body>').length, 2, 'Ambiguous homepage body boundary');
const hook = '<script src="./speed-entry.js?v=20261019-S1" defer></script>\n';
fs.writeFileSync(target, source.replace('</body>', hook + '</body>'));
for (const file of ['speed.html', 'speed-lc.js', 'speed-core.js', 'speed-training.js', 'speed-training.css', 'speed-entry.js']) fs.copyFileSync(file, '_site/' + file);
const output = fs.readFileSync(target, 'utf8');
assert.equal(output.split(hook).length, 2, 'Duplicate fourth entry');
assert.equal(hash(Buffer.from(output.replace(hook, ''))), baseline['index.html']);
console.log('PASS: deployment adds only the fourth speed-training home entry and its independent files.');
