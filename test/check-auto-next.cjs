'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('app.js','utf8');
const begin=src.indexOf('  function showQuestion(){');
const end=src.indexOf('  function finish(){',begin);
assert.ok(begin>=0&&end>begin,'showQuestion missing');
const fn=src.slice(begin,end);
const script=[
"let paper=[{id:'Q1',section:'test',question:'question one',options:['a','b','c','d'],answer:2},{id:'Q2',section:'test',question:'question two',options:['a','b','c','d'],answer:1},{id:'Q3',section:'test',question:'question three',options:['a','b','c','d'],answer:0}];",
"let answers=[-1,-1,-1],pos=0,wrongOnly=false,context={display:'test'},state={mode:'trade'};",
"let saved=0,completed=0; const labels={trade:'trade'}; const escapeHTML=s=>String(s); const button=(id,label)=>'<button id=\\\"'+id+'\\\">'+label+'</button>'; const attachmentNote=()=>'';",
"const root={innerHTML:'',buttons:[],controls:{},querySelectorAll(){return this.buttons},querySelector(id){return this.controls[id]||null}};",
"function display(html,quizScreen){ assert.equal(quizScreen,true,'the question screen should use compact mobile layout');root.innerHTML=html;root.buttons=[0,1,2,3].map(n=>({dataset:{option:String(n)},blurred:false,blur(){this.blurred=true},clickHandler:null,addEventListener(name,handler){if(name==='click')this.clickHandler=handler}}));root.controls={'#previous':{disabled:false},'#pause':{}};if(html.includes('id=\\\"next\\\"'))root.controls['#next']={};}",
"function saveDraft(){saved++} function finish(){completed++} function home(){} function setTheme(){}",
fn,
"showQuestion(); assert.ok(root.innerHTML.includes('第 1 / 3 題')); assert.equal(root.controls['#next'],undefined);",
"root.buttons[2].clickHandler();assert.equal(pos,1);assert.equal(answers[0],2);assert.ok(root.innerHTML.includes('第 2 / 3 題'));",
"root.buttons[1].clickHandler();assert.equal(pos,2);assert.equal(answers[1],1);assert.ok(root.innerHTML.includes('第 3 / 3 題'));",
"root.buttons[0].clickHandler();assert.equal(pos,2);assert.equal(answers[2],0);assert.equal(completed,0);",
"root.controls['#previous'].onclick();assert.equal(pos,1);root.buttons[3].clickHandler();assert.equal(answers[1],3);assert.equal(pos,2);",
"root.controls['#next'].onclick();assert.equal(completed,1);assert.ok(saved>=4);",
].join('\n');
vm.runInNewContext(script,{assert});
console.log('PASS: tapping A/B/C/D immediately advances; last question waits for submission; previous answers editable.');
