'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('app.js','utf8');
for(const type of ['trade','ecom','mixed']){
 assert.ok(html.includes('#app[data-theme="'+type+'"]'),'missing page theme '+type);
 assert.ok(html.includes('.mode-card[data-source="'+type+'"]')||type==='mixed','missing tile theme '+type);
}
assert.ok(app.includes("root.dataset.theme=currentTheme"),'theme not set when rendering');
assert.ok(app.includes("setTheme(context?.source||state.mode)"),'quiz pages not themed');
assert.ok(html.includes('mobile-quiz-colors-2'),'cache-busting missing');
console.log('PASS: 3 pastel themes and themed quiz/explanation pages.');
