'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=require('../lc-all-cases.json');
const bank=require('../questions.json').filter(q=>q.contextRequired);
assert.equal(bank.length,50);
assert.ok(data.neutralRules);
let count=0;for(const q of bank){const c=data.cases[q.caseId],mapping=c.optionEvidence?.[q.id];assert.deepEqual(Object.keys(mapping||{}),['A','B','C','D'],q.id+' has no complete evidence mapping');
  for(const refs of Object.values(mapping)){assert.ok(refs.length>0,q.id+' empty choice source');
    for(const ref of refs){if(ref.startsWith('@'))assert.ok(c.originalFacts[ref.slice(1)],q.id+ref);
      else if(ref.startsWith('#'))assert.ok(data.neutralRules[ref.slice(1)],q.id+ref);
      else assert.ok(c.creditSections[ref],q.id+ref);
    }count++;}
}
assert.equal(count,200);
const app=fs.readFileSync('app.js','utf8');
assert.ok(app.includes("Object.values(allOptionEvidence).flat()"));
assert.ok(app.includes("neutralEvidenceRules.map(renderField)"));
assert.ok(app.includes("const creditCodes=new Set(config.fields)"));
const p=app.indexOf('  function renderLcReference(q){');
const end=app.indexOf('  function display(',p);
const view=vm.runInNewContext(app.slice(p,end)+'\nrenderLcReference',{lcAll:data,escapeHTML:s=>String(s??''),escapeAttr:s=>String(s??'')});
const t=bank.find(q=>q.id==='T57-10'),out=view(t);
for(const fragment of ['100 CTNS','HAPPY','MARSEILLE','FREIGHT PREPAID'])assert.ok(out.includes(fragment),'Case one 10 source missing: '+fragment);
for(const id of ['T56-6','T56-7','T61-2','T61-7','T71-6','T71-7','T72-9','T76-5','T76-7']){
 const q=bank.find(x=>x.id===id),html=view(q);
 assert.ok(html.includes('原題庫 PDF 第'),id+' original source facts absent');
}
assert.ok(!out.includes('正解：'));
console.log('PASS: 50 LC questions / 200 A-D source mappings, source facts visible without answer leakage.');
