'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const api=require('../lc-front-summary.js');
const bank=require('../questions.json');
assert.equal(api.validate(bank),true);
const lc=bank.filter(q=>q.chapterId==='T12');
let count=0,choices=0;
for(const q of lc){
 const ps=api.points[q.id],html=api.render(q.id);
 assert.ok(ps.length===4||ps.length===5,q.id+' requires 4–5 visible points');
 count+=ps.length;
 assert.equal((html.match(/<li data-point=/g)||[]).length,ps.length);
 assert.ok(!/<details|<img|<iframe/i.test(html),q.id+' front sources must be visible plain text');
 for(const a of 'ABCD'){
  assert.ok(ps.some(p=>p.covers.includes(a)),q.id+'/'+a+' source not mapped');
  choices++;
 }
 for(const p of ps){
  assert.ok(p.source&&p.title&&p.text);
  assert.ok(p.text.length<=300,q.id+' point too long');
  assert.ok(!/正解[為是：:]|答案[為是：:]|選項[ABCD].*(?:正確|錯誤)|待複核|⚠/.test(p.text),q.id+' teacher/answer disclosure');
  if(p.source.includes('RULE:'))assert.ok(html.includes('規則摘要非附件原文'));
 }
}
assert.equal(lc.length,50);assert.equal(choices,200);assert.equal(count,212);
const required={
 'T56-6':['1,200','20.00','800','15.00','FULL INVOICE VALUE'],
 'T56-7':['Per','BREVIK BRIDGE','S124','WIN LINE','BEN CO.','APP (IN TRI.)'],
 'T57-9':['WELL COMMERCIAL','SMILE','BEN CO.','CIF MARSEILLE','APP CO.','NOTIFY APPLICANT'],
 'T57-10':['HAPPY CO.','BEN CO.','MARSEILLE','FREIGHT PREPAID','100 CTNS.','THREE (3)'],
 'T61-2':['ORIENTAL BANK','TAICHUNG COMMERCIAL BANK','TRANSFER IS RESTRICTED','SUPERSTRONG'],
 'T61-3':['MAR. 23, 2017','14 DAYS','170331','170324'],
 'T61-7':['SUPERSTRONG','QUEEN','001E-033','TAICHUNG','INCOTERMS 2010','不是 (5)'],
 'T66-3':['DEFERRED PAYMENT','COMPETENT','PACKING LIST','4 ORIGINALS PLUS 4 COPIES'],
 'T66-4':['120 PERCENT','AKBANK','21 DAYS','NOT ALLOWED'],
 'T66-5':['BLANK ENDORSED','SIGNED','71B','OPERATIVE INSTRUMENT','NO MAIL CONFIRMATION WILL FOLLOW'],
 'T71-3':['OCT. 22, 2020','7 DAYS','201105','201029'],
 'T71-5':['200925','OCT. 22','FAXED','FOUR (4)'],
 'T71-6':['KMARIN ATLANTICA','06Y7AW1MB','AMBARLI PORT'],
 'T71-7':['FOB','TAICHUNG','INCOTERMS 2020'],
 'T72-9':['TURKIYE IS BANKASI','MEGA','HIRICH','OUR ORDER'],
 'T76-4':['JULY 21, 2025','JULY 22, 2025','10 DAYS','250730'],
 'T76-5':['FIRST','SECOND','KOREA','CHAMBER OF COMMERCE'],
 'T76-6':['TO (1)','Tom Lee','SHINHAN','GLORY','SUNSHINE','BANK OF TAIWAN'],
 'T76-7':['EVER CAST','0089-091N','TAICHUNG','GI-254468','TAIWAN ORIGIN'],
 'T77-10':['Number of Original B/Ls','4/4','FREIGHT PREPAID']
};
for(const [id,tokens] of Object.entries(required)){
 const text=api.points[id].map(p=>p.source+' '+p.text).join(' ');
 for(const token of tokens)assert.ok(text.includes(token),id+' missing visible evidence: '+token);
}
assert.equal(api.render('E001'),'');
assert.equal(api.render('T03-1'),'');
const script=fs.readFileSync('lc-front-summary.js','utf8');
assert.ok(!/localStorage|sessionStorage|fetch\(/.test(script),'Summary hook must never touch scores or network');
assert.ok(script.includes('block.replaceChildren(fragment.firstElementChild,heading,...originalNodes)'));
console.log('PASS: 50 LC questions, 212 visible source points, all 200 option-source mappings; rules labelled; no answer or score changes.');
