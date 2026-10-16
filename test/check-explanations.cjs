'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const questions=require('../questions.json');
const explanations=require('../explanations.json');
assert.equal(questions.length,500);
assert.equal(Object.keys(explanations).length,500);
let trade=0,ecom=0;
for(const q of questions){
 const entry=explanations[q.id];
 assert.ok(entry,q.id+' missing explanation');
 assert.equal(typeof entry.core,'string');
 assert.ok(entry.core.trim().length>8,q.id+' core missing');
 assert.ok(Array.isArray(entry.choices)&&entry.choices.length===4,q.id+' choices invalid');
 assert.ok(entry.choices.every(v=>typeof v==='string'&&v.trim().length>3),q.id+' option explanations missing');
 assert.equal(typeof entry.tip,'string');
 assert.ok(!Object.keys(entry).some(k=>['review_note','review_status','basis','source_integrity_note','teacher_warning'].includes(k)),q.id+' teacher metadata exposed');
 const visible=JSON.stringify(entry);
 assert.ok(!/待複核|教師審核|⚠/.test(visible),q.id+' teacher-only notice exposed');
 if(q.source==='trade')trade++;else if(q.source==='ecom')ecom++;else assert.fail('unexpected source '+q.source);
}
assert.equal(trade,400);assert.equal(ecom,100);
console.log('PASS: 500 student explanations aligned with 500 questions, with no teacher review warnings.');
