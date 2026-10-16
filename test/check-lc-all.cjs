'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const qs=require('../questions.json');
const data=require('../lc-all-cases.json');
const source=fs.readFileSync('app.js','utf8');
const wf=fs.readFileSync('.github/workflows/pages.yml','utf8');
assert.equal(Object.keys(data.cases).length,5);
const lc=qs.filter(q=>q.contextRequired);
assert.equal(lc.length,50);
let imageCount=0,inline=0,optional=0,none=0;
const paths=new Set();
for(const [caseId,c] of Object.entries(data.cases)){
 assert.equal(Object.keys(c.questions).length,10,caseId);
 assert.ok(c.creditSections['46A'].length>400,caseId+' source 46A incomplete');
 assert.ok(c.creditBillClause.includes('BILL'),caseId+' missing original 46A B/L requirement');
 const caseQs=lc.filter(q=>q.caseId===caseId);
 assert.equal(caseQs.length,10,caseId);
 const imageIDs=new Set(c.images.map(d=>d.id));
 for(const img of c.images){
  imageCount++;
  assert.equal(img.src,'assets/lc/'+img.id+'.jpg');
  assert.ok(fs.existsSync(img.src),'Original PDF document missing: '+img.src);
  const bin=fs.readFileSync(img.src);
  assert.ok(bin.length>25000,'Source image too small: '+img.id);
  assert.ok(bin[0]===0xff&&bin[1]===0xd8,'Source image is not JPEG: '+img.id);
  assert.ok(!paths.has(img.src));paths.add(img.src);
 }
 for(const q of caseQs){
  const cfg=c.questions[q.id];
  assert.ok(cfg,q.id+' has no LC evidence map');
  assert.ok(['none','inline','optional'].includes(cfg.imageMode));
  assert.ok(cfg.fields.length>=2,q.id+' missing references');
  assert.ok(cfg.fields.every(k=>c.creditSections[k]),q.id+' missing LC source segment');
  assert.ok(cfg.images.every(id=>imageIDs.has(id)),q.id+' unknown original image');
  if(cfg.imageMode==='inline')inline++;
  if(cfg.imageMode==='optional')optional++;
  if(cfg.imageMode==='none')none++;
  if(cfg.imageMode!=='none')assert.ok(cfg.images.length>0,q.id+' image mode without source');
  if(cfg.showBill46A)assert.ok(cfg.fields.includes('46A'),q.id+' missing 46A');
 }
}
assert.equal(inline+optional+none,50);
assert.equal(imageCount,12);
assert.ok(none>=20,'text-only questions should be the majority');
assert.ok(source.includes('function renderLcReference(q)'), 'LC viewer unavailable');
assert.ok(source.includes("if(lcAll?.cases?.[q.caseId])return renderLcReference(q);"),'LC dispatch unavailable');
assert.ok(source.includes("data-lc-image"),'No enlarge action');
assert.ok(source.includes("pointermove"),'Mobile drag and pinch missing');
assert.ok(source.includes("lc-original-full"),'Full LC text missing');
assert.ok(wf.includes('cp assets/lc/*.jpg _site/assets/lc/'),'Images not published');
console.log('PASS: 5 source cases, 50 question display maps, 12 original PDF document images; '+none+' text, '+optional+' optional images, '+inline+' image first.');
