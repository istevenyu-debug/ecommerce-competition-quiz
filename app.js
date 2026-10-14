'use strict';
(() => {
  const root = document.getElementById('app');
  const labels = {trade:'國貿大會考', ecom:'電子商務與跨境電商', mixed:'兩者綜合'};
  const key = 'ecommerce-quiz-local-v1';
  const empty = {seen:{}, wrong:{}, history:[], includeCases:false, mode:'trade', draft:null};
  let state;
  try { state = Object.assign({}, empty, JSON.parse(localStorage.getItem(key) || '{}')); }
  catch { state = Object.assign({}, empty); }
  state.seen = state.seen || {};
  state.wrong = state.wrong || {};
  state.history = Array.isArray(state.history) ? state.history : [];
  let questions = [], mode = labels[state.mode] ? state.mode : 'trade', paper = [], answers = [], index = 0, wrongOnly = false;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mix = items => {const a = [...items]; for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a;};
  const eligible = m => questions.filter(q => (m==='mixed' || q.source===m) && (state.includeCases || !q.contextRequired));
  function persist() {try {localStorage.setItem(key, JSON.stringify(state));return true;} catch {return false;}}
  function button(id, text, secondary=false) {return '<button type="button" id="'+id+'"'+(secondary?' class="secondary"':'')+'>'+esc(text)+'</button>';}
  function pick(m, n) {
    const candidates = eligible(m);
    const fresh = mix(candidates.filter(q => !state.seen[q.id]));
    const used = mix(candidates.filter(q => state.seen[q.id]));
    used.sort((a,b)=>(state.seen[a.id]||0)-(state.seen[b.id]||0));
    return [...fresh, ...used].slice(0,n);
  }
  function switchMode(next) {mode=next;state.mode=next;persist();home();}
  function home() {
    const available=eligible(mode);
    const covered=available.filter(q=>state.seen[q.id]).length;
    const mistakes=available.filter(q=>state.wrong[q.id]).length;
    const allCases=questions.filter(q=>q.contextRequired).length;
    root.innerHTML = '<div class="topline"><span class="eyebrow">練習首頁</span><span class="chip">免登入・本機紀錄</span></div>'
      +'<h2>選擇刷題模式</h2>'
      +'<label for="choose-mode">題庫分類</label>'
      +'<select id="choose-mode">'+Object.entries(labels).map(([k,v])=>'<option value="'+k+'"'+(mode===k?' selected':'')+'>'+v+'</option>').join('')+'</select>'
      +'<div class="metrics"><div><strong>'+covered+' / '+available.length+'</strong><small>已刷題數</small></div><div><strong>'+mistakes+'</strong><small>待練錯題</small></div><div><strong>'+state.history.length+'</strong><small>最近成績筆數</small></div></div>'
      +'<progress max="'+(available.length||1)+'" value="'+covered+'"></progress><p class="muted">新題優先，直到目前選擇的全部題目都至少練過一次。</p>'
      +'<div class="actions">'+button('new-test','開始 30 題')+button('wrong-test','錯題練習 ('+mistakes+')',true)+button('history','近 10 次練習成績',true)+'</div>'
      +(state.draft?'<p class="notice">'+button('continue','繼續上次未完成的練習',true)+'</p>':'')
      +'<div class="setting"><label><input id="include-case" type="checkbox" '+(state.includeCases?'checked':'')+'>包含信用狀案例題（需搭配原始 PDF 附表）</label>'
      +'<p class="muted">原始國貿題庫有 '+allCases+' 道案例題需要參考信用狀、發票或提單。未勾選時先練習可獨立作答的題目；勾選後也會納入抽題。</p></div>'
      +'<p class="footnote">正式成績只儲存在目前瀏覽器，最多保留最近 10 筆。換裝置或清除網站資料可能遺失紀錄；錯題練習不列入成績。</p>';
    root.querySelector('#choose-mode').onchange = e => switchMode(e.target.value);
    root.querySelector('#include-case').onchange = e => {state.includeCases=e.target.checked;persist();home();};
    root.querySelector('#new-test').onclick=()=>start(false);
    root.querySelector('#wrong-test').onclick=()=>start(true);
    root.querySelector('#history').onclick=showHistory;
    const resume=root.querySelector('#continue');
    if (resume) resume.onclick=resumeDraft;
  }
  function start(wrong) {
    const available = wrong ? mix(eligible(mode).filter(q=>state.wrong[q.id])).slice(0,30)
      : mode==='mixed' ? mix([...pick('trade',15), ...pick('ecom',15)]) : pick(mode,30);
    if (!available.length) {alert(wrong?'目前沒有待複習的錯題。':'題庫還沒有可練習的題目。');return;}
    if (!wrong && available.length!==30) {alert('目前不足 30 題，無法開始正式練習。');return;}
    paper=available;answers=Array(paper.length).fill(-1);index=0;wrongOnly=wrong;
    draft();showQuestion();
  }
  function draft() {
    state.draft={mode, ids:paper.map(q=>q.id), answers, index, wrongOnly, includeCases:state.includeCases};
    persist();
  }
  function resumeDraft() {
    const d=state.draft;
    if (!d) return;
    const byId=new Map(questions.map(q=>[q.id,q]));
    paper=d.ids.map(id=>byId.get(id)).filter(Boolean);
    if(paper.length!==d.ids.length) {state.draft=null;persist();alert('題庫已更新，請開始新一卷。');home();return;}
    answers=d.answers;index=Math.max(0,Math.min(d.index,paper.length-1));wrongOnly=d.wrongOnly;mode=d.mode;
    state.includeCases=!!d.includeCases;showQuestion();
  }
  function contextNotice(q) {
    if(!q.contextRequired) return '';
    return '<details class="context"><summary>本題需要信用狀／單據附表，請先查看</summary>'
      +'<p>請搭配您原始的《國際貿易大會考題庫》PDF 第 '+esc(q.page)+' 頁附近的附件（信用狀、發票、匯票或提單）。'
      +'目前網站未收錄可完整獨立閱讀的附件，若手邊沒有 PDF，可先在首頁取消「包含信用狀案例題」。</p></details>';
  }
  function showQuestion() {
    const q=paper[index];
    const chosen=answers[index];
    root.innerHTML='<div class="topline"><span class="eyebrow">'+esc(labels[mode])+'</span><span class="chip">'+(wrongOnly?'錯題複習':'正式練習')+'</span></div>'
      +'<p class="muted">第 '+(index+1)+' / '+paper.length+' 題 · 原題 '+esc(q.id)+'</p>'
      +'<progress max="'+paper.length+'" value="'+(index+1)+'"></progress>'
      +'<p class="category">'+esc(q.section||'')+'</p>'
      +contextNotice(q)+'<h2 class="question">'+esc(q.question)+'</h2>'
      +q.options.map((o,j)=>'<button type="button" class="option'+(chosen===j?' selected':'')+'" data-choice="'+j+'"><span class="letter">'+('ABCD'[j])+'</span><span>'+esc(o)+'</span></button>').join('')
      +'<div class="actions nav">'+button('previous','上一題',true)+button('next',index===paper.length-1?'交卷':'下一題')+'</div>'
      +'<div class="actions nav">'+button('exit','暫存並回首頁',true)+'</div>';
    root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{answers[index]=Number(b.dataset.choice);draft();showQuestion();});
    root.querySelector('#previous').disabled=index===0;
    root.querySelector('#previous').onclick=()=>{if(index>0){index--;draft();showQuestion();}};
    root.querySelector('#next').onclick=()=>{
      if(answers[index]<0) {alert('請先選擇答案。');return;}
      if(index===paper.length-1) finish();
      else {index++;draft();showQuestion();}
    };
    root.querySelector('#exit').onclick=home;
  }
  function finish() {
    let correct=0;
    paper.forEach((q,i)=>{
      state.seen[q.id]=(Number(state.seen[q.id])||0)+1;
      if(answers[i]===q.answer) {correct++;delete state.wrong[q.id];}
      else state.wrong[q.id]=true;
    });
    const score=Math.round(correct*100/paper.length);
    if(!wrongOnly) {
      state.history.unshift({time:Date.now(),mode:labels[mode],score,correct,total:paper.length});
      state.history=state.history.slice(0,10);
    }
    state.draft=null;
    persist();
    root.innerHTML='<div class="topline"><span class="eyebrow">完成練習</span><span class="chip">'+(wrongOnly?'錯題複習':'正式成績')+'</span></div>'
      +'<h2>本次得分 <span class="score">'+score+'</span> 分</h2>'
      +'<p>答對 '+correct+' / '+paper.length+' 題。'+(wrongOnly?'錯題練習不計入近 10 次成績。':'已儲存在此瀏覽器的近 10 次成績中。')+'</p>'
      +'<div class="actions">'+button('review','逐題檢討')+button('home','回到首頁',true)+'</div>';
    root.querySelector('#review').onclick=review;
    root.querySelector('#home').onclick=home;
  }
  function review() {
    root.innerHTML='<h2>本卷答案檢討</h2>'
      +'<p class="muted">依照題庫提供的正確答案與四個選項檢討；原始題庫未提供完整的逐題解析。</p>'
      +paper.map((q,i)=>'<section class="review '+(answers[i]===q.answer?'correct':'incorrect')+'">'
        +'<h3>'+(i+1)+'. '+esc(q.question)+'</h3>'+contextNotice(q)
        +'<p>你的答案：<b>'+('ABCD'[answers[i]]||'—')+'</b>　正確答案：<b>'+('ABCD'[q.answer]||'—')+'</b></p>'
        +q.options.map((o,j)=>'<p class="'+(j===q.answer?'right':'')+'">'+('ABCD'[j])+'. '+esc(o)+(j===q.answer?' ✓':'')+'</p>').join('')+'</section>').join('')
      +button('home','回首頁',true);
    root.querySelector('#home').onclick=home;
  }
  function showHistory() {
    root.innerHTML='<h2>近 10 次練習成績</h2>'
      +(state.history.length?'<div class="table-scroll"><table><thead><tr><th>練習時間</th><th>題庫模式</th><th>成績</th></tr></thead><tbody>'
        +state.history.slice(0,10).map(r=>'<tr><td>'+new Date(r.time).toLocaleString('zh-TW')+'</td><td>'+esc(r.mode)+'</td><td><b>'+r.score+' 分</b> ('+r.correct+'/'+r.total+')</td></tr>').join('')
        +'</tbody></table></div>':'<p>目前尚無正式練習成績。</p>')
      +'<p class="muted">錯題練習不列入，紀錄只保存在這台裝置的這個瀏覽器。</p>'+button('home','返回首頁');
    root.querySelector('#home').onclick=home;
  }
  fetch('./questions.json', {cache:'no-store'}).then(r=>{if(!r.ok) throw Error('無法讀取題庫 questions.json');return r.json();})
    .then(qs=>{if(!Array.isArray(qs)||qs.some(q=>!q.id||!q.question||q.options?.length!==4||![0,1,2,3].includes(q.answer))) throw Error('題庫資料格式不正確');questions=qs;home();})
    .catch(e=>{root.innerHTML='<h2>題庫載入失敗</h2><p>'+esc(e.message)+'</p><button id="again">重新載入</button>';root.querySelector('#again').onclick=()=>location.reload();});
})();