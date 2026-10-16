'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const questions=JSON.parse(fs.readFileSync('questions.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('chapter-groups.json','utf8'));
assert.equal(questions.length,500);
assert.equal(questions.filter(q=>q.source==='trade').length,400);
assert.equal(questions.filter(q=>q.source==='ecom').length,100);
assert.equal(manifest.chapters.length,14);
assert.equal(manifest.groups.length,25);
const map=new Map(questions.map(q=>[q.id,q]));
assert.equal(map.size,500,'duplicate question IDs');
const seenIds=[];
for(const g of manifest.groups){
 assert.ok(g.questionCount>0&&g.questionCount<=30,g.id+' must contain 1-30 questions');
 assert.equal(g.questionCount,g.questionIds.length);
 assert.equal(new Set(g.questionIds).size,g.questionCount,'duplicate IDs in '+g.id);
 for(const id of g.questionIds){
  const q=map.get(id);
  assert.ok(q,'missing '+id);
  assert.equal(q.groupId,g.id);
  assert.equal(q.chapterId,g.chapterId);
  seenIds.push(id);
 }
}
assert.equal(seenIds.length,500);
assert.equal(new Set(seenIds).size,500,'questions repeated across groups');
for(const c of manifest.chapters){
 const g=manifest.groups.filter(x=>x.chapterId===c.id);
 assert.deepEqual(g.map(x=>x.id),c.groupIds);
 assert.equal(g.reduce((n,x)=>n+x.questionCount,0),c.questionCount);
 assert.equal(new Set(c.questionIds).size,c.questionCount);
 assert.deepEqual([...new Set(g.flatMap(x=>x.questionIds))].sort(),[...c.questionIds].sort());
}
for(const [id,size] of Object.entries({'T04-R1':20,'T05-R2':10,'T06-R2':10,'T10-R1':15,'T11-R2':25,'T12-LC01':10,'T12-LC02':10,'T12-LC03':10,'T12-LC04':10,'T12-LC05':10,'E01-R2':15,'E02-R1':20,'E03-R2':5})){
 assert.equal(manifest.groups.find(g=>g.id===id)?.questionCount,size,id);
}
const cases=questions.filter(q=>q.contextRequired);
assert.equal(cases.length,50);
assert.equal(new Set(cases.map(q=>q.caseId)).size,5);
for(const q of questions){
 assert.equal(q.options.length,4);
 assert.ok([0,1,2,3].includes(q.answer));
 assert.ok(q.question&&q.chapterId&&q.groupId);
}
const five=manifest.groups.filter(g=>g.chapterId==='T12');
assert.deepEqual(five.map(g=>g.caseId),['LC01','LC02','LC03','LC04','LC05']);
assert.deepEqual(five.map(g=>g.questionCount),[10,10,10,10,10]);
for(const g of five){
  assert.equal(new Set(g.questionIds.map(id=>map.get(id).caseId)).size,1);
  assert.equal(map.get(g.questionIds[0]).caseId,g.caseId);
  assert.deepEqual(g.questionIds.map(id=>map.get(id).groupQuestionNumber),[1,2,3,4,5,6,7,8,9,10]);
}
console.log('PASS: 500 questions / 14 chapters / 25 non-overlapping groups, with five distinct original 10-question LC cases.');
