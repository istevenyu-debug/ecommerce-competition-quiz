'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const qs=require('../questions.json').filter(q=>q.caseId==='LC01');
const c=require('../lc-case1.json');
const app=fs.readFileSync('app.js','utf8');
const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
assert.equal(qs.length,10);
assert.equal(c.caseId,'LC01');
assert.deepEqual(c.documents.map(d=>d.page),[58,59,59,60]);
const fieldIds=new Set(c.documents.flatMap(d=>d.fields.map(f=>f.id)));
assert.equal(fieldIds.size,c.documents.reduce((n,d)=>n+d.fields.length,0));
for(const q of qs){const fields=c.questionFields[q.id];assert.ok(Array.isArray(fields)&&fields.length>=2,q.id);for(const id of fields)assert.ok(fieldIds.has(id),id);}
assert.ok(c.documents[0].fields.find(f=>f.id==='lc-46A-packing').text.includes('IN DUPLICATE'));
assert.ok(c.documents[2].fields.find(f=>f.id==='invoice-5').text.includes('(5) ________'));
assert.ok(c.documents[3].fields.find(f=>f.id==='bl-13').text.includes('(13)'));
assert.ok(app.includes('function startCaseOne()'));
assert.ok(app.includes("q.caseId==='LC01'&&caseOne"));
assert.ok(app.includes('lc-excerpts'));
assert.ok(workflow.includes('lc-case1.json .nojekyll _site/'));
const vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const begin=source.indexOf('  function attachmentNote(q){');
const end=source.indexOf('  function showQuestion(){',begin);
assert.ok(begin!==-1&&end>begin);
const context={caseOne:c,escapeHTML:s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))};
const note=vm.runInNewContext(source.slice(begin,end)+'; attachmentNote',context);
const qsById=Object.fromEntries(require('../questions.json').filter(q=>q.caseId==='LC01').map(q=>[q.id,q]));
const snippets=q=>{
  const html=note(q);
  assert.ok(html.includes('<div class="lc-excerpts">'));
  return html.split('<div class="lc-excerpts">')[1].split('</div><details class="lc-full">')[0];
};
for(const id of ['T56-7','T57-9','T57-10']){
 const excerpt=snippets(qsById[id]);
 const originalClause=c.documents[0].fields.find(f=>f.id==='lc-46A-bl').text;
 assert.ok(excerpt.includes(originalClause),id+' missing FULL 46A original clause');
 assert.equal(excerpt.split('46A｜Ocean Bill of Lading').length-1,1,id+' 46A is duplicated');
 assert.ok(excerpt.indexOf('46A｜Ocean Bill of Lading')<excerpt.indexOf('｜空格'),id+' 46A must precede form blanks');
 assert.ok(excerpt.includes('FREIGHT PREPAID AND NOTIFY APPLICANT'),id+' missing key B/L requirements');
}
const sOrder={...qsById['T56-1'],question:'SHIPPING ORDER (S/O) 應依哪些單據規定填寫？'};
assert.ok(snippets(sOrder).includes('46A｜Ocean Bill of Lading'),'S/O question must show B/L clause');
assert.ok(!snippets(qsById['T56-1']).includes('46A｜Ocean Bill of Lading'),'unrelated question should not show B/L clause');
console.log('PASS: complete source 46A ocean B/L clause shown first for Shipping Order and Bill of Lading questions.');
