'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const C=require('../speed-core.js'),LC=require('../speed-lc.js'),bank=require('../questions.json');
const original=JSON.stringify(bank),byId=new Map(bank.map(q=>[q.id,q]));
assert.deepEqual([...C.LIMITS],[20,15,10,5,3]);
assert.equal(C.STORAGE_KEY,'ecommerce-speed-training-v1');
assert.notEqual(C.STORAGE_KEY,'ecommerce-quiz-local-v1');
assert.equal(C.MIX_VERSION,2);assert.equal(LC.entries.length,25);
assert.equal(new Set(LC.entries.map(h=>h.id)).size,25);
const expected={
 'T56-1':'B','T56-3':'B','T56-4':'C','T56-6':'C','T56-7':'D',
 'T61-1':'A','T61-3':'B','T61-5':'B','T62-8':'D','T62-9':'C',
 'T66-1':'B','T66-2':'A','T67-8':'B','T67-9':'D','T67-10':'B',
 'T71-3':'B','T71-4':'D','T72-8':'B','T72-9':'C','T72-10':'C',
 'T76-3':'D','T76-4':'B','T77-8':'C','T77-9':'D','T77-10':'A'
};
// A-D evidence from original L/C / B/L / invoice pages, not answer text in UI.
const evidence={
 'T56-1':[['IRREVOCABLE','WITHOUT'],['SMILE','SIGHT'],['40A: IRREVOCABLE'],['NEGOTIATION','SIGHT']],
 'T56-3':[['43P: ALLOWED'],['UCP LATEST VERSION'],['FULL INVOICE VALUE'],['POLICY/CERTIFICATE']],
 'T56-4':[['NEGOTIABLE FORM'],['PARIS'],['EUR','CURRENCY OF THE DRAFT'],['INSTITUTE CARGO CLAUSES (A)','INSTITUTE WAR CLAUSES']],
 'T56-6':[['1,200','20.00','800','15.00'],['FULL INVOICE VALUE'],['1,200','20.00','800','15.00'],['FULL INVOICE VALUE']],
 'T56-7':[['WIN LINE LTD.'],['APP (IN TRI.)'],['BEN CO., LTD.'],['BREVIK BRIDGE','S124','Per']],
 'T61-1':[['180 DAYS','NEGOTIATION'],['180 DAYS','TRANSFERABLE'],['WITHOUT CONFIRMATION'],['ANY BANK']],
 'T61-3':[['MAR. 23, 2017','14 DAYS','170331'],['170331','CREDIT VALIDITY'],['170324'],['MAR. 23, 2017']],
 'T61-5':[['INDIA'],['CARGO CLAUSES (A)','WAR CLAUSES'],['110 PCT'],['POLICY/CERTIFICATE']],
 'T62-8':[['ORDER OF ORIENTAL'],['ORDER OF ORIENTAL'],['ORIENTAL BANK OF COMMERCE'],['MOUNT ROAD BRANCH','Consignee']],
 'T62-9':[['CHENNAI PORT, INDIA'],['CHENNAI PORT'],['CHENNAI PORT, INDIA'],['CHENNAI PORT']],
 'T66-1':[['AKBANK'],['DEFERRED PAYMENT','IRREVOCABLE'],['120 DAYS'],['WITHOUT','DEFERRED PAYMENT']],
 'T66-2':[['120 DAYS AFTER SHIPMENT'],['AFTER SHIPMENT'],['AFTER SHIPMENT'],['AFTER SHIPMENT']],
 'T67-8':[['BENEFICIARY AS SHIPPER'],['XYZ TRADING CO., LTD.','NO.123'],['BENEFICIARY AS SHIPPER'],['XYZ TRADING CO., LTD.']],
 'T67-9':[['TO THE ORDER'],['TO THE ORDER'],['TO THE ORDER'],['TO THE ORDER','Consignee']],
 'T67-10':[['ISTANBUL'],['ISTANBUL, TURKEY'],['ISTANBUL'],['ISTANBUL']],
 'T71-3':[['OCT. 22, 2020','7 DAYS'],['OCT. 22, 2020','7 DAYS','201105'],['7 DAYS'],['7 DAYS']],
 'T71-4':[['MILLING MACHINE','1 UNIT','4 UNITS'],['MILLING MACHINE'],['HK-GV3','HK-HV3'],['UNUSED']],
 'T72-8':[['TAIWAN ORIGIN'],['TAIWAN ORIGIN','(4)'],['TAIWAN ORIGIN'],['TAIWAN ORIGIN']],
 'T72-9':[['Sender: TURKIYE'],['Sender: TURKIYE'],['TURKIYE IS BANKASI A.S.','OUR ORDER'],['Sender: TURKIYE']],
 'T72-10':[['PAYABLE AT DESTINATION'],['PAYABLE AT DESTINATION'],['PAYABLE AT DESTINATION','FREIGHT (6)'],['PAYABLE AT DESTINATION']],
 'T76-3':[['MAY ADD'],['TRANSFERABLE'],['BY NEGOTIATION'],['TRANSFERABLE','BY NEGOTIATION']],
 'T76-4':[['JULY 21, 2025','10 DAYS','250730'],['250730','VALIDITY'],['JULY 21, 2025','10 DAYS'],['JULY 22, 2025','250730']],
 'T77-8':[['2020'],['BUSAN','2020'],['CIF BUSAN, KOREA (INCOTERMS 2020)'],['BUSAN']],
 'T77-9':[['OUR ORDER','SHINHAN BANK'],['OUR ORDER','SHINHAN BANK'],['OUR ORDER','SHINHAN BANK'],['OUR ORDER','SHINHAN BANK, SEOUL','Consignee']],
 'T77-10':[['4/4','PREPAID'],['PREPAID'],['4/4'],['PREPAID','4/4']]
};
for(const caseId of ['LC01','LC02','LC03','LC04','LC05'])assert.equal(LC.entries.filter(h=>h.caseId===caseId).length,5);
let verifiedOptions=0;
for(const h of LC.entries){
 const q=byId.get(h.id),text=h.lines.join(' ');assert.ok(C.lcEligible(q),h.id);
 assert.equal('ABCD'[q.answer],expected[h.id]);assert.equal(evidence[h.id].length,4);
 assert.ok(h.pages.every(p=>p>=58&&p<=80));assert.ok(h.lines.length>=1&&h.lines.length<=4);
 assert.ok(h.lines.join('').length<=240,h.id+' long prompt');
 assert.ok(!/正解|答案[：:]|待複核|教師|<img|<iframe|https?:|data:/.test(text),h.id+' contains non-student text');
 for(const refs of evidence[h.id]){for(const part of refs)assert.ok(text.includes(part),h.id+' missing '+part);verifiedOptions++;}
}
assert.equal(verifiedOptions,100);assert.ok(!LC.entries.some(h=>h.id==='T66-4'));
let seen={},covered=new Set();
for(let round=0;round<1000;round++){
 const p=C.selectPaper(bank,seen);assert.equal(p.length,30);assert.equal(new Set(p.map(q=>q.id)).size,30);
 assert.equal(p.filter(q=>q.source==='trade').length,25);assert.equal(p.filter(q=>q.source==='ecom').length,5);
 assert.equal(p.filter(q=>q.speedHint).length,2);assert.equal(p.filter(q=>q.source==='trade'&&!q.speedHint).length,23);
 for(const q of p){
  if(q.contextRequired){assert.ok(C.lcEligible(q));assert.deepEqual(q.speedHint,LC.entries.find(h=>h.id===q.id).lines);}
  else assert.ok(C.eligible(q));
  assert.equal(q.question,byId.get(q.id).question);assert.deepEqual(q.options,byId.get(q.id).options);assert.equal(q.answer,byId.get(q.id).answer);
  covered.add(q.id);seen[q.id]=(seen[q.id]||0)+1;
 }
 if(round===19)assert.equal(covered.size,475);
}
assert.equal(JSON.stringify(bank),original);
assert.throws(()=>C.validateBank(bank.filter(q=>q.id!==LC.entries[0].id)),/精簡提示/);
const q=bank[0];
for(const limit of C.LIMITS){
 const max=limit*1000,clock=new C.QuestionClock(q,limit,10000);assert.equal(clock.remaining(10000),max);
 const r=clock.settle(q.answer,10000+max/4);assert.equal(r.status,'correct');assert.equal(r.elapsedMs,max/4);assert.equal(r.pointsTenths,925);
 assert.equal(clock.settle(q.answer,10000+max/2),null);
 assert.equal(C.scoreAnswer(q,q.answer,max,limit).status,'timeout');assert.equal(C.scoreAnswer(q,q.answer,max-1,limit).status,'correct');
 assert.equal(C.scoreAnswer(q,null,max+1,limit).elapsedMs,max);assert.equal(C.scoreAnswer(q,(q.answer+1)%4,0,limit).pointsTenths,0);
 assert.equal(C.scoreAnswer(q,q.answer,0,limit).pointsTenths,1000);
}
assert.throws(()=>C.scoreAnswer(q,4,0,15));assert.throws(()=>C.scoreAnswer(q,0,Infinity,15));assert.throws(()=>C.scoreAnswer(q,0,1000,7));
const paper=C.selectPaper(bank),results=paper.map(q=>C.scoreAnswer(q,q.answer,500,15));
results[3]=C.scoreAnswer(paper[3],null,15000,15);results[9]=C.scoreAnswer(paper[9],null,15000,15);
const sum=C.summarize(results);assert.equal(sum.correct,28);assert.equal(sum.score,93);assert.equal(sum.timeouts,2);assert.equal(sum.slowestIndex,3);assert.equal(sum.totalMs,44000);
assert.deepEqual(C.loadState('{bad'),C.emptyState());let state=C.emptyState();
for(let i=0;i<13;i++)state=C.addCompleted(state,{id:String(i),time:i,limitSeconds:15,results,summary:sum,questions:paper});
assert.equal(state.history.length,10);const counts=JSON.stringify(state.seen);state=C.addCompleted(state,state.history[0]);assert.equal(JSON.stringify(state.seen),counts);
assert.equal(C.loadState(JSON.stringify(state)).history.length,10);
assert.equal(C.loadState(JSON.stringify({history:[{id:'old',time:1,limitSeconds:15,results,summary:sum}]})).history[0].id,'old');
const html=fs.readFileSync('speed.html','utf8');assert.ok(html.indexOf('speed-lc.js')<html.indexOf('speed-core.js'));
assert.ok(html.includes('20261019-LC2'));
console.log('PASS: 1000 papers with 23+2+5; 25 L/C hints with 100 option checks; timing, scoring, locked answers, old history compatible.');
