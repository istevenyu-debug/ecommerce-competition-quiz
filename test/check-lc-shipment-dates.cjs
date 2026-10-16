'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=require('../lc-all-cases.json');
const questions=require('../questions.json');
const src=fs.readFileSync('app.js','utf8');
const specs=[['T61-3','LC02','MAR. 23, 2017',65],['T71-3','LC04','OCT. 22, 2020',75],['T71-5','LC04','OCT. 22, 2020',75],['T76-4','LC05','JULY 21, 2025',80]];
for(const [qid,cid,date,page] of specs){const c=data.cases[cid],q=c.questions[qid];assert.ok(q.documentFacts.includes('blShippedOnBoard'));assert.equal(c.documentFacts.blShippedOnBoard.text,date);assert.equal(c.documentFacts.blShippedOnBoard.page,page);assert.equal(q.imageMode,'optional');assert.ok(q.images.includes(c.documentFacts.blShippedOnBoard.imageId));}
assert.equal(data.cases.LC05.documentFacts.blIssued.text,'TAICHUNG / JULY 22, 2025');
assert.notEqual(data.cases.LC05.documentFacts.blIssued.text,data.cases.LC05.documentFacts.blShippedOnBoard.text);
const start=src.indexOf('  function renderLcReference(q){'),end=src.indexOf('  function display(',start);
assert.ok(start>=0&&end>start);
const render=vm.runInNewContext(src.slice(start,end)+'\nrenderLcReference',{lcAll:data,escapeHTML:s=>String(s??'')});
for(const [qid,cid,date] of specs){const q=questions.find(z=>z.id===qid),out=render(q);assert.ok(out.includes(date),qid+' missing date');assert.ok(out.includes('Shipped on Board Date'),qid+' missing on-board label');assert.ok(out.includes('查看原始單據圖'),qid+' missing source image');assert.ok(out.includes('48｜信用狀原始條款'),qid+' missing presentation period');}
console.log('PASS: four LC questions include verified on-board dates and optional original B/L image.');
