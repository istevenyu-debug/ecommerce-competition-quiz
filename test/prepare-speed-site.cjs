'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const baseline = require('./speed-baseline.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
// Source homepage and all existing quiz/speed files remain byte-identical.
// Only the release artifact receives the two independently scoped entry hooks.
const target = '_site/index.html';
const source = fs.readFileSync(target, 'utf8');
assert.equal(hash(Buffer.from(source)), baseline['index.html'], 'Unexpected homepage input');
assert.equal(source.split('</body>').length, 2, 'Ambiguous homepage body boundary');
const speedHook = '<script src="./speed-entry.js?v=20261019-S1" defer></script>\n';
const lcHook = '<script src="./lc-front-summary.js?v=20261019-LC45" defer></script>\n';
const hook = speedHook + lcHook;
fs.writeFileSync(target, source.replace('</body>', hook + '</body>'));
for (const file of ['speed.html', 'speed-lc.js', 'speed-core.js', 'speed-training.js', 'speed-training.css', 'speed-entry.js', 'lc-front-summary.js']) fs.copyFileSync(file, '_site/' + file);
const output = fs.readFileSync(target, 'utf8');
assert.equal(output.split(speedHook).length, 2, 'Duplicate fourth entry');
assert.equal(output.split(lcHook).length, 2, 'Duplicate LC summary hook');
assert.equal(hash(Buffer.from(output.replace(hook, ''))), baseline['index.html']);
assert.ok(!fs.readFileSync('_site/speed.html','utf8').includes('lc-front-summary'), 'Speed mode must remain independent');
console.log('PASS: fourth speed entry unchanged; chapter-12 summary hook is isolated from speed mode.');
