'use strict';
(() => {
  const root = document.getElementById('app');
  const STORAGE_KEY = 'ecommerce-quiz-local-v1'; // Keep existing students' progress and last 10 scores.
  const labels = {trade:'國貿大會考',ecom:'電子商務與跨境電商',mixed:'兩者綜合'};
  const initial = {seen:{},wrong:{},history:[],includeCases:false,mode:'trade',draft:null};
  let state;
  try {state=Object.assign({},initial,JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'));}
  catch (_) {state=Object.assign({},initial);}
  if (!state.seen || typeof state.seen!=='object') state.seen={};
  if (!state.wrong || typeof state.wrong!=='object') state.wrong={};
  if (!Array.isArray(state.history)) state.history=[];
  state.history=state.history.slice(0,10);

  let questions=[],manifest=null,byId=new Map(),chapters=new Map(),groups=new Map();
  let paper=[],answers=[],pos=0,wrongOnly=false,context=null,finished=null;

  const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function store(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(e){console.warn('無法儲存進度',e);return false;}}
  function escapeAttr(s){return escapeHTML(s);}
  function button(id,title,secondary=false){return '<button type="button" id="'+escapeAttr(id)+'"'+(secondary?' class="secondary"':'')+'>'+escapeHTML(title)+'</button>';}
  function display(html){root.innerHTML=html;window.scrollTo?.(0,0);}
  function summary(ids){
    const total=ids.length,seen=ids.filter(id=>Number(state.seen[id])>0).length,wrong=ids.filter(id=>state.wrong[id]).length;
    return {total,seen,wrong};
  }
  function metrics(s){
    return '<div class="metrics"><div><strong>'+s.seen+' / '+s.total+'</strong><small>已刷題數</small></div>'+
      '<div><strong>'+s.wrong+'</strong><small>待練錯題</small></div>'+
      '<div><strong>'+state.history.length+'</strong><small>近10次成績</small></div></div>'+
      '<progress aria-label="已練題目進度" value="'+s.seen+'" max="'+(s.total||1)+'"></progress>';
  }
  function navigation(backLabel){
    return '<div class="topline">'+button('back',backLabel,true)+'<span class="chip">免登入・本機紀錄</span></div>';
  }
  function draftButton(){
    if(!state.draft?.ids?.length)return '';
    return '<div class="resume-box"><strong>有一份尚未交卷的練習</strong><p class="muted">上次作答會保留，直到您交卷或開始另一份題組。</p>'+button('resume','繼續上次的練習')+'</div>';
  }
  function bindResume(){
    const el=root.querySelector('#resume');
    if(el)el.onclick=resumeDraft;
  }
  function note(){
    return '<p class="footnote">正式成績與錯題、完成進度只存在這台裝置的這個瀏覽器。換裝置或清除網站資料可能遺失紀錄；錯題練習不計入近10次成績。</p>';
  }
  function home(){
    const grand=summary(questions.map(q=>q.id));
    const tiles=manifest.sources.map(src=>{
      const ids=questions.filter(q=>q.source===src.id).map(q=>q.id),s=summary(ids);
      return '<button class="mode-card" data-source="'+escapeAttr(src.id)+'"><span class="mode-title">'+escapeHTML(src.title)+'</span>'+
        '<span class="mode-meta">'+src.chapterCount+' 章 · '+src.questionCount+' 題</span>'+
        '<span class="mode-detail">已刷 '+s.seen+' 題　待練錯題 '+s.wrong+' 題</span>'+
        '<span class="mode-arrow" aria-hidden="true">›</span></button>';
    }).join('');
    display('<div class="topline"><span class="eyebrow">刷題首頁</span><span class="chip">題庫 500 題</span></div>'+
      '<h2>請選擇練習類別</h2>'+tiles+
      '<button class="mode-card mixed" id="mixed"><span class="mode-title">兩者綜合模擬</span>'+
      '<span class="mode-meta">國貿 15 題＋電商 15 題，共 30 題</span>'+
      '<span class="mode-detail">各題庫分開追蹤，不會在同卷重複題目</span><span class="mode-arrow" aria-hidden="true">›</span></button>'+
      '<h3 class="section-title">全部題庫完成進度</h3>'+metrics(grand)+
      '<div class="actions">'+button('history','近 10 次練習成績',true)+'</div>'+draftButton()+note());
    root.querySelectorAll('[data-source]').forEach(el=>el.onclick=()=>showChapters(el.dataset.source));
    root.querySelector('#mixed').onclick=showMixed;
    root.querySelector('#history').onclick=showHistory;
    bindResume();
  }
  function showChapters(source){
    const sourceMeta=manifest.sources.find(x=>x.id===source);
    if(!sourceMeta){home();return;}
    state.mode=source;store();
    const items=manifest.chapters.filter(x=>x.source===source);
    const all=items.flatMap(c=>c.questionIds);
    const cards=items.map(c=>{
      const s=summary(c.questionIds);
      return '<button class="chapter-card" data-chapter="'+escapeAttr(c.id)+'">'+
        '<span class="chapter-title">'+escapeHTML(c.title)+'</span>'+
        '<span class="chapter-sub">'+c.questionCount+' 題 · '+c.groupIds.length+' 回 · 已刷 '+s.seen+'/'+s.total+' · 錯題 '+s.wrong+'</span>'+
        '<span class="thin-track"><span class="thin-progress" style="width:'+(s.total?Math.round(100*s.seen/s.total):0)+'%"></span></span>'+
        '<span class="mode-arrow" aria-hidden="true">›</span></button>';
    }).join('');
    display(navigation('← 首頁')+'<h2>'+escapeHTML(sourceMeta.title)+'</h2>'+
      '<p class="muted">請選擇要練習的章節。同一章的題目會分在自己的題組，不與其他章混題。</p>'+
      metrics(summary(all))+'<div class="chapter-grid">'+cards+'</div>'+draftButton());
    root.querySelector('#back').onclick=home;
    root.querySelectorAll('[data-chapter]').forEach(el=>el.onclick=()=>showGroups(el.dataset.chapter));
    bindResume();
  }
  function chapterCaseNotice(c){
    if(c.id!=='T12')return '';
    return '<div class="case-warning"><strong>信用狀案例題提醒</strong><p>本章共 5 個案例、50 題；每個案例 10 題。題目涉及信用狀及附表中的發票、提單或匯票，'+
      '網站尚未收錄完整單據附件。開始練習前請備妥原始國貿大會考 PDF 第 58–80 頁，避免無法判讀。</p></div>';
  }
  function showGroups(chapterId){
    const c=chapters.get(chapterId);
    if(!c){home();return;}
    state.mode=c.source;store();
    const sum=summary(c.questionIds);
    const chapterGroups=c.groupIds.map(id=>groups.get(id)).filter(Boolean);
    const list=chapterGroups.map(g=>{
      const s=summary(g.questionIds);
      const numbers=g.questionIds.map(id=>byId.get(id)?.chapterQuestionNumber).filter(Number.isInteger);
      const from=Math.min(...numbers),to=Math.max(...numbers);
      return '<div class="group-card"><div class="group-heading"><strong>第 '+g.round+' 回</strong><span class="chip">'+g.questionCount+' 題</span></div>'+
        '<p class="muted">本章原題 '+from+'–'+to+' 題'+(g.requiresContext?' · 需案例附件':'')+'</p>'+
        '<p class="group-progress">已刷 '+s.seen+'/'+s.total+' 題　｜　錯題 '+s.wrong+' 題</p>'+
        '<progress aria-label="第'+g.round+'回完成進度" value="'+s.seen+'" max="'+s.total+'"></progress>'+
        '<div class="actions"><button type="button" data-start="'+escapeAttr(g.id)+'">開始第 '+g.round+' 回（'+g.questionCount+' 題）</button>'+
        '<button type="button" class="secondary" data-wronggroup="'+escapeAttr(g.id)+'"'+(s.wrong===0?' disabled':'')+'>本回錯題 ('+s.wrong+')</button></div></div>';
    }).join('');
    display(navigation('← 返回章節')+
      '<p class="eyebrow">'+escapeHTML(labels[c.source])+'</p>'+
      '<h2>'+escapeHTML(c.title)+'</h2>'+
      '<p class="muted">本章 '+c.questionCount+' 題，分為 '+c.groupIds.length+' 回；每回最多 30 題、不足照實際題數，題目不跨章也不重複。</p>'+
      metrics(sum)+chapterCaseNotice(c)+
      '<div class="chapter-tools">'+button('chapter-wrong','本章錯題練習（'+sum.wrong+' 題）',true)+'</div>'+
      list+draftButton()+note());
    root.querySelector('#back').onclick=()=>showChapters(c.source);
    root.querySelector('#chapter-wrong').disabled=sum.wrong===0;
    root.querySelector('#chapter-wrong').onclick=()=>startWrongChapter(chapterId);
    root.querySelectorAll('[data-start]').forEach(el=>el.onclick=()=>startGroup(el.dataset.start));
    root.querySelectorAll('[data-wronggroup]').forEach(el=>el.onclick=()=>startWrongGroup(el.dataset.wronggroup));
    bindResume();
  }
  function eligibleMixed(source){
    return questions.filter(q=>q.source===source&&(state.includeCases||!q.contextRequired));
  }
  function takeUnseen(source,count){
    const eligible=eligibleMixed(source);
    const fresh=shuffle(eligible.filter(q=>!Number(state.seen[q.id])));
    const practiced=shuffle(eligible.filter(q=>Number(state.seen[q.id])>0)).sort(
      (a,b)=>(Number(state.seen[a.id])||0)-(Number(state.seen[b.id])||0));
    return [...fresh,...practiced].slice(0,count);
  }
  function showMixed(){
    state.mode='mixed';store();
    const trade=eligibleMixed('trade'),ecom=eligibleMixed('ecom');
    const all=[...trade,...ecom],s=summary(all);
    display(navigation('← 首頁')+'<p class="eyebrow">跨領域練習</p>'+
      '<h2>兩者綜合模擬（30 題）</h2>'+
      '<div class="mix-balance"><div><strong>國貿大會考</strong><span>15 題</span></div>'+
      '<div><strong>電子商務與跨境電商</strong><span>15 題</span></div></div>'+
      '<p class="muted">國貿與電商各優先抽未刷題，各 15 題；同一卷不重複。所有作答會同步計入各章的完成進度與錯題。</p>'+
      metrics(s)+
      '<div class="setting"><label><input type="checkbox" id="include-cases"'+(state.includeCases?' checked':'')+
      '> 綜合卷納入信用狀案例題</label>'+
      '<p class="muted">預設不納入：信用狀案例需要原始 PDF 第 58–80 頁的單據附件。第十二章專練則可直接選擇完整 50 題。</p></div>'+
      '<div class="actions">'+button('start','開始綜合 30 題')+
      button('wrong','綜合錯題練習（'+s.wrong+' 題）',true)+'</div>'+
      draftButton()+note());
    root.querySelector('#back').onclick=home;
    root.querySelector('#start').onclick=()=>startMixed(false);
    root.querySelector('#wrong').disabled=s.wrong===0;
    root.querySelector('#wrong').onclick=()=>startMixed(true);
    root.querySelector('#include-cases').onchange=e=>{state.includeCases=e.target.checked;store();showMixed();};
    bindResume();
  }
  function beginQuiz(ids,quizContext,isWrong=false){
    if(!ids.length){alert('目前沒有可練習的題目。');return;}
    const chosen=ids.map(id=>byId.get(id));
    if(chosen.some(q=>!q)||new Set(ids).size!==ids.length){
      alert('題庫出卷時發現重複或缺漏題號，請聯絡老師。');return;
    }
    if(state.draft?.ids?.length&&!window.confirm('目前還有尚未交卷的練習。確定放棄舊卷並開始新題組嗎？'))return;
    paper=chosen;answers=Array(paper.length).fill(-1);pos=0;context=quizContext;wrongOnly=isWrong;finished=null;
    state.mode=context.source==='mixed'?'mixed':context.source;
    saveDraft();showQuestion();
  }
  function startGroup(groupId){
    const g=groups.get(groupId);
    if(!g)return;
    beginQuiz(shuffle(g.questionIds),{type:'group',source:g.source,chapterId:g.chapterId,groupId:g.id,display:g.label},false);
  }
  function startWrongGroup(groupId){
    const g=groups.get(groupId);if(!g)return;
    const missed=shuffle(g.questionIds.filter(id=>state.wrong[id])).slice(0,30);
    beginQuiz(missed,{type:'group',source:g.source,chapterId:g.chapterId,groupId:g.id,display:g.label+'｜錯題練習'},true);
  }
  function startWrongChapter(chapterId){
    const c=chapters.get(chapterId);if(!c)return;
    const missed=shuffle(c.questionIds.filter(id=>state.wrong[id])).slice(0,30);
    beginQuiz(missed,{type:'chapterWrong',source:c.source,chapterId:c.id,display:c.title+'｜錯題練習'},true);
  }
  function startMixed(isWrong){
    let picked;
    if(isWrong){
      const trade=shuffle(eligibleMixed('trade').filter(q=>state.wrong[q.id])).slice(0,15);
      const ecom=shuffle(eligibleMixed('ecom').filter(q=>state.wrong[q.id])).slice(0,15);
      picked=[...trade,...ecom];
      const included=new Set(picked.map(q=>q.id));
      const remaining=shuffle([...eligibleMixed('trade'),...eligibleMixed('ecom')].filter(q=>state.wrong[q.id]&&!included.has(q.id)));
      picked=picked.concat(remaining.slice(0,30-picked.length));
    }else picked=[...takeUnseen('trade',15),...takeUnseen('ecom',15)];
    if(!isWrong&&picked.length!==30){alert('題數不足，無法組成完整的綜合卷。');return;}
    beginQuiz(shuffle(picked).map(q=>q.id),
      {type:'mixed',source:'mixed',display:isWrong?'兩者綜合｜錯題練習':'兩者綜合模擬（國貿15＋電商15）'},isWrong);
  }
  function saveDraft(){
    state.draft={mode:state.mode,ids:paper.map(q=>q.id),answers:[...answers],index:pos,wrongOnly,context,includeCases:state.includeCases};
    store();
  }
  function resumeDraft(){
    const draft=state.draft;
    if(!draft||!Array.isArray(draft.ids)||!draft.ids.length){home();return;}
    const restored=draft.ids.map(id=>byId.get(id));
    if(restored.some(q=>!q)){
      state.draft=null;store();alert('舊練習的題目已失效，請重新出卷。');home();return;
    }
    paper=restored;
    answers=Array.from({length:paper.length},(_,i)=>Number.isInteger(draft.answers?.[i])?draft.answers[i]:-1);
    pos=Math.min(Math.max(Number(draft.index)||0,0),paper.length-1);
    wrongOnly=!!draft.wrongOnly;
    const mode=labels[draft.mode]?draft.mode:'mixed';
    context=draft.context||{type:'legacy',source:mode,display:labels[mode]+'｜舊版未完成練習'};
    state.mode=mode;
    if(typeof draft.includeCases==='boolean')state.includeCases=draft.includeCases;
    finished=null;saveDraft();showQuestion();
  }
  function attachmentNote(q){
    if(!q.contextRequired)return '';
    const pages=(q.referencePages||[]).join('、');
    return '<details class="context"><summary>信用狀案例 '+q.caseNumber+'：查看所需附表頁碼</summary>'+
      '<p>請對照原始《國際貿易大會考題庫》PDF 的第 '+escapeHTML(pages)+' 頁（信用狀、發票、提單等），以及題目所在的第 '+escapeHTML(q.page)+' 頁。</p>'+
      '<p>目前網頁尚未附完整原始附件圖片；需要對照文件才能作答的題目，請先備妥原始 PDF。</p></details>';
  }
  function showQuestion(){
    const q=paper[pos],checked=answers[pos];
    const questionCount=paper.length,answered=answers.filter(a=>a>=0).length;
    display('<div class="topline"><span class="eyebrow">'+escapeHTML(context?.display||labels[state.mode])+'</span>'+
      '<span class="chip">'+(wrongOnly?'錯題練習':'正式練習')+'</span></div>'+
      '<p class="muted">第 '+(pos+1)+' / '+questionCount+' 題　｜　已作答 '+answered+'/'+questionCount+'　｜　原題 '+escapeHTML(q.id)+'</p>'+
      '<progress aria-label="作答位置" value="'+(pos+1)+'" max="'+questionCount+'"></progress>'+
      '<p class="category">'+escapeHTML(q.section)+'</p>'+
      attachmentNote(q)+'<h2 class="question">'+escapeHTML(q.question)+'</h2>'+
      q.options.map((o,j)=>'<button type="button" class="option'+(checked===j?' selected':'')+'" data-option="'+j+'" aria-pressed="'+(checked===j?'true':'false')+'">'+
        '<span class="letter">'+('ABCD'[j])+'</span><span>'+escapeHTML(o)+'</span></button>').join('')+
      '<p class="muted">'+(pos===questionCount-1?'最後一題：選好答案後請按「交卷」。':'點選答案會直接跳至下一題，按「上一題」可修改作答。')+'</p>'+ 
      '<div class="actions nav">'+button('previous','上一題',true)+button('next',pos===questionCount-1?'交卷':'下一題')+'</div>'+
      '<div class="actions">'+button('pause','暫存並回首頁',true)+'</div>');
    root.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>{
      answers[pos]=Number(el.dataset.option);
      if(pos < paper.length-1) pos++; // Answering advances immediately, last answer waits for explicit submission.
      saveDraft();showQuestion();
    });
    root.querySelector('#previous').disabled=pos===0;
    root.querySelector('#previous').onclick=()=>{if(pos>0){pos--;saveDraft();showQuestion();}};
    root.querySelector('#next').onclick=()=>{
      if(answers[pos]<0){alert('請先選擇答案。');return;}
      if(pos===paper.length-1){
        if(answers.some(a=>a<0)){alert('本卷仍有未作答的題目，請先完成。');return;}
        finish();
      }else {pos++;saveDraft();showQuestion();}
    };
    root.querySelector('#pause').onclick=home;
  }
  function finish(){
    let correct=0;
    paper.forEach((q,i)=>{
      state.seen[q.id]=(Number(state.seen[q.id])||0)+1;
      if(answers[i]===q.answer){correct++;delete state.wrong[q.id];}
      else state.wrong[q.id]=true;
    });
    const total=paper.length,score=Math.round(100*correct/total);
    finished={correct,total,score};
    if(!wrongOnly){
      state.history.unshift({
        time:Date.now(),
        mode:labels[context.source]||labels[state.mode]||'章節練習',
        group:context.type==='group'?context.display:context.type==='mixed'?'綜合模擬':'舊版練習',
        groupId:context.groupId||null,
        chapterId:context.chapterId||null,
        score,correct,total
      });
      state.history=state.history.slice(0,10);
    }
    state.draft=null;
    store();
    display('<div class="topline"><span class="eyebrow">'+escapeHTML(context?.display||'完成練習')+'</span><span class="chip">'+(wrongOnly?'錯題練習':'正式成績')+'</span></div>'+
      '<h2>本次得分 <span class="score">'+score+'</span> 分</h2>'+
      '<p>答對 '+correct+' / '+total+' 題（'+(total-correct)+' 題答錯）。'+
      (wrongOnly?'這次錯題練習不列入近10次正式成績。':'本次成績已儲存在這台裝置的近10次紀錄。')+'</p>'+
      '<div class="actions">'+button('review','逐題檢討')+button('return','返回題組／首頁',true)+'</div>');
    root.querySelector('#review').onclick=review;
    root.querySelector('#return').onclick=returnFromQuiz;
  }
  function review(){
    if(!finished){home();return;}
    display(navigation('← 返回成績')+'<h2>本卷答案檢討</h2>'+
      '<p class="muted">每題列出作答與題庫正確答案；原始題庫未提供完整逐選項詳解。信用狀題請一併參考案例附表。</p>'+
      paper.map((q,i)=>'<section class="review '+(answers[i]===q.answer?'correct':'incorrect')+'">'+
        '<h3>'+(i+1)+'. '+escapeHTML(q.question)+'</h3>'+attachmentNote(q)+
        '<p>原題：'+escapeHTML(q.id)+'　｜　你的答案：<b>'+('ABCD'[answers[i]]||'—')+'</b>　｜　正解：<b>'+('ABCD'[q.answer]||'—')+'</b></p>'+
        q.options.map((choice,j)=>'<p class="'+(j===q.answer?'right':'')+'">'+('ABCD'[j])+'. '+escapeHTML(choice)+(j===q.answer?' ✓':'')+'</p>').join('')+
        '</section>').join('')+'<div class="actions">'+button('return','返回題組／首頁')+'</div>');
    root.querySelector('#back').onclick=showResults;
    root.querySelector('#return').onclick=returnFromQuiz;
  }
  function showResults(){
    if(!finished){home();return;}
    display('<h2>本卷已完成</h2><p>得分：<strong>'+finished.score+'</strong> 分（'+finished.correct+'/'+finished.total+' 題）</p>'+
      '<div class="actions">'+button('review','再次查看檢討')+button('return','回到題組',true)+'</div>');
    root.querySelector('#review').onclick=review;
    root.querySelector('#return').onclick=returnFromQuiz;
  }
  function returnFromQuiz(){
    if(context?.chapterId){showGroups(context.chapterId);}
    else if(context?.type==='mixed'){showMixed();}
    else home();
  }
  function showHistory(){
    const rows=state.history.slice(0,10);
    display(navigation('← 首頁')+'<h2>近 10 次練習成績</h2>'+
      (rows.length?
        '<div class="table-scroll"><table><thead><tr><th>時間</th><th>練習章節／題組</th><th>成績</th></tr></thead><tbody>'+
        rows.map(r=>{
          const label=r.group||r.mode||'一般練習';
          return '<tr><td>'+escapeHTML(new Date(r.time).toLocaleString('zh-TW'))+'</td>'+
            '<td>'+escapeHTML(label)+'</td><td><strong>'+escapeHTML(r.score)+' 分</strong> ('+
            escapeHTML(r.correct)+'/'+escapeHTML(r.total)+')</td></tr>';
        }).join('')+'</tbody></table></div>':
        '<p>目前尚無正式練習成績。</p>')+
      '<p class="muted">含以前版本的正式練習成績；錯題練習不計入，最多保留 10 筆。</p>'+note());
    root.querySelector('#back').onclick=home;
  }

  function validateBank(qs,data){
    if(!Array.isArray(qs)||!data||!Array.isArray(data.chapters)||!Array.isArray(data.groups))throw Error('題庫或章節分組格式錯誤');
    if(qs.length!==500||data.chapters.length!==14||data.groups.length!==22)throw Error('題庫數量與章節規劃不一致');
    const ids=new Set();
    for(const q of qs){
      if(!q.id||ids.has(q.id)||!q.question||q.options?.length!==4||![0,1,2,3].includes(q.answer))throw Error('題庫題號或選項格式錯誤：'+(q.id||'?'));
      ids.add(q.id);byId.set(q.id,q);
    }
    for(const c of data.chapters){
      if(chapters.has(c.id)||!Array.isArray(c.groupIds)||!Array.isArray(c.questionIds)||c.questionCount!==c.questionIds.length)throw Error('章節定義不完整：'+c.id);
      chapters.set(c.id,c);
    }
    const allGroupIds=[];
    for(const g of data.groups){
      if(groups.has(g.id)||!Array.isArray(g.questionIds)||g.questionIds.length!==g.questionCount||g.questionCount>30||g.questionCount<1)throw Error('題組格式錯誤：'+g.id);
      if(!chapters.has(g.chapterId))throw Error('未知章節：'+g.chapterId);
      for(const id of g.questionIds){
        if(!byId.has(id)||byId.get(id).groupId!==g.id||byId.get(id).chapterId!==g.chapterId)throw Error('題組與原題對應錯誤：'+id);
        allGroupIds.push(id);
      }
      groups.set(g.id,g);
    }
    if(allGroupIds.length!==qs.length||new Set(allGroupIds).size!==qs.length)throw Error('題組有漏題或重複題');
    for(const c of data.chapters){
      const groupIds=c.groupIds.flatMap(id=>groups.get(id)?.questionIds||[]);
      if(groupIds.length!==c.questionIds.length||groupIds.some((id,i)=>!c.questionIds.includes(id)))throw Error('章節題目與題組不一致：'+c.id);
    }
  }

  Promise.all([
    fetch('./questions.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('無法取得 questions.json');return r.json();}),
    fetch('./chapter-groups.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('無法取得 chapter-groups.json');return r.json();})
  ]).then(([qs,data])=>{
    questions=qs;manifest=data;validateBank(qs,data);
    home();
  }).catch(e=>{
    console.error(e);
    display('<h2>題庫載入失敗</h2><p>'+escapeHTML(e.message)+'</p>'+
      '<p class="muted">請重新整理頁面。如果問題持續，可能是 GitHub Pages 還在更新中。</p>'+
      button('reload','重新載入'));
    root.querySelector('#reload').onclick=()=>window.location.reload();
  });
})();