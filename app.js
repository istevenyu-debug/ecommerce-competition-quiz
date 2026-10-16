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

  let questions=[],manifest=null,explanations={},caseOne=null,lcAll=null,byId=new Map(),chapters=new Map(),groups=new Map();
  let paper=[],answers=[],pos=0,wrongOnly=false,context=null,finished=null;
  let currentTheme='home';
  const setTheme=source=>{currentTheme=['trade','ecom','mixed'].includes(source)?source:'home';};

  const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function store(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(e){console.warn('無法儲存進度',e);return false;}}
  function escapeAttr(s){return escapeHTML(s);}
  function button(id,title,secondary=false){return '<button type="button" id="'+escapeAttr(id)+'"'+(secondary?' class="secondary"':'')+'>'+escapeHTML(title)+'</button>';}

  // Examine authentic source-document pictures. Mobile supports two-finger
  // pinch zoom and drag; desktop supports wheel zoom and drag.
  function openLcOriginal(id){
    const doc=lcAll&&Object.values(lcAll.cases).flatMap(c=>c.images).find(d=>d.id===id);
    if(!doc)return;
    const overlay=document.createElement('div');
    overlay.className='lc-lightbox';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','原始單據圖片放大檢視');
    overlay.innerHTML='<div class="lc-lightbox-bar"><strong>'+escapeHTML(doc.title)+'</strong>'+
      '<div class="lc-zoom-actions"><button type="button" data-zoom="out">−</button>'+
      '<button type="button" data-zoom="reset">還原</button>'+
      '<button type="button" data-zoom="in">＋</button>'+
      '<button type="button" data-zoom="close">關閉 ✕</button></div></div>'+
      '<div class="lc-pan"><img src="./'+escapeAttr(doc.src)+'" alt="'+escapeAttr(doc.title)+'｜原 PDF 第'+doc.page+'頁" draggable="false"/></div>'+
      '<div class="lc-lightbox-help">雙指縮放、拖曳查看；電腦可使用滾輪或 ＋／−</div>';
    document.body.appendChild(overlay);
    const img=overlay.querySelector('img');
    const pane=overlay.querySelector('.lc-pan');
    const pointers=new Map();
    let scale=1,dx=0,dy=0,pinchDist=null,pinchMid=null;
    const draw=()=>{img.style.transform='translate('+dx+'px,'+dy+'px) scale('+scale+')';};
    const reset=()=>{scale=1;dx=dy=0;draw();};
    const zoom=f=>{scale=Math.max(1,Math.min(6,scale*f));if(scale===1){dx=dy=0;}draw();};
    const close=()=>{document.removeEventListener('keydown',onKey);overlay.remove();};
    const onKey=e=>{if(e.key==='Escape')close();};
    document.addEventListener('keydown',onKey);
    overlay.querySelectorAll('[data-zoom]').forEach(el=>el.onclick=()=>{
      if(el.dataset.zoom==='close')close();
      else if(el.dataset.zoom==='reset')reset();
      else zoom(el.dataset.zoom==='in'?1.4:1/1.4);
    });
    pane.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.22:1/1.22);},{passive:false});
    pane.addEventListener('pointerdown',e=>{
      e.preventDefault();pane.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2){const a=[...pointers.values()];pinchDist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pinchMid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};}
    });
    pane.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId))return;
      e.preventDefault();
      const old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===1){if(scale>1){dx+=e.clientX-old.x;dy+=e.clientY-old.y;}draw();}
      else if(pointers.size===2){
        const p=[...pointers.values()];
        const nextDist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
        const nextMid={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};
        if(pinchDist&&nextDist){scale=Math.max(1,Math.min(6,scale*(nextDist/pinchDist)));}
        if(pinchMid){dx+=nextMid.x-pinchMid.x;dy+=nextMid.y-pinchMid.y;}
        if(scale===1){dx=dy=0;}
        pinchDist=nextDist;pinchMid=nextMid;draw();
      }
    });
    const release=e=>{pointers.delete(e.pointerId);pinchDist=null;pinchMid=null;};
    pane.addEventListener('pointerup',release);
    pane.addEventListener('pointercancel',release);
    pane.addEventListener('dblclick',e=>{e.preventDefault();scale>1?reset():zoom(2);});
    overlay.querySelector('[data-zoom="close"]').focus();
  }
  function bindLcOriginalImages(){
    root.querySelectorAll('[data-lc-image]').forEach(el=>el.onclick=()=>openLcOriginal(el.dataset.lcImage));
  }
  function renderLcReference(q){
    const data=lcAll?.cases?.[q.caseId],config=data?.questions?.[q.id];
    if(!config)return '';
    const fields=[];
    for(const id of config.documentFacts||[]){const fact=data.documentFacts?.[id];if(fact)fields.push({label:fact.label+'｜原 PDF 第 '+fact.page+' 頁',text:fact.text,sourceDate:true});}
    if(config.showBill46A&&data.creditBillClause)
      fields.push({label:'46A｜海運提單完整要求（原文）',text:data.creditBillClause,highlight:true});
    for(const code of config.fields){
      // Avoid showing a second copy of the entire 46A B/L requirement.
      // Other parts of 46A remain relevant to documentary-credit checks.
      const content=data.creditSections[code];
      if(!content)continue;
      fields.push({label:code+'｜信用狀原始條款',text:content});
    }
    const renderField=f=>'<div class="lc-ref-field'+(f.highlight?' lc-bill-highlight':'')+(f.sourceDate?' lc-date-source':'')+'"><strong>'+escapeHTML(f.label)+'</strong>'+
      '<div class="lc-ref-text">'+escapeHTML(f.text)+'</div></div>';
    const renderImage=id=>{
      const d=data.images.find(z=>z.id===id);
      if(!d)return '';
      return '<button type="button" class="lc-original-preview" data-lc-image="'+escapeAttr(d.id)+'" aria-label="放大原始'+escapeAttr(d.title)+'圖片">'+
        '<img src="./'+escapeAttr(d.src)+'" alt="原始題庫第'+d.page+'頁｜'+escapeAttr(d.title)+'" loading="lazy"/>'+
        '<span>原始'+escapeHTML(d.title)+'　・　點擊放大／雙指縮放</span></button>';
    };
    const inlineImages=config.imageMode==='inline'?config.images.map(renderImage).join(''):'';
    const optionalImages=config.imageMode==='optional'?'<details class="lc-optional-images"><summary>需要辨認欄位位置？查看原始單據圖</summary>'+
        '<div class="lc-image-grid">'+config.images.map(renderImage).join('')+'</div></details>':'';
    const creditFull='<details class="lc-original-full"><summary>展開原信用狀相關條款（完整文字）</summary>'+
      Object.entries(data.creditSections).map(([k,text])=>renderField({label:k,text})).join('')+'</details>';
    return '<section class="lc-doc-review" aria-label="信用狀案例'+escapeAttr(q.caseNumber)+'原題附件參考">'+
      '<div class="lc-doc-heading"><strong>案例'+escapeHTML(q.caseNumber)+'｜本題原始參考資料</strong>'+
      '<small>原 PDF 第 '+data.creditPage+' 頁</small></div>'+
      '<p class="lc-doc-hint">'+(config.documentFacts?.length?'本題需要提單實際裝船日期及信用狀期限；可展開原圖核對。':config.imageMode==='inline'?'本題需要辨認單據空格位置，先看原圖；點擊圖片可縮放。':'本題以原信用狀文字判讀為主。')+
      ' 以下保留原文，不預先顯示答案。</p>'+
      (inlineImages?'<div class="lc-image-grid">'+inlineImages+'</div>':'')+
      '<div class="lc-source-fields">'+fields.map(renderField).join('')+'</div>'+
      optionalImages+creditFull+'</section>';
  }

  function display(html, quizScreen=false){
    // Only the live question screen hides the global heading on small screens.
    // Every other page restores the heading without touching local score data.
    root.dataset.theme=currentTheme;
    document.body.classList.toggle('quiz-active',quizScreen);
    root.innerHTML=html;
    bindLcOriginalImages();
    window.scrollTo?.(0,0);
  }
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
    setTheme('home');
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
    setTheme(source);
    state.mode=source;store();
    const items=manifest.chapters.filter(x=>x.source===source);
    const all=items.flatMap(c=>c.questionIds);
    const chapterOneNotice=source==='trade'
      ?'<div class="chapter-card chapter-unavailable" role="note" aria-label="第一章經貿資訊原始題庫未收錄">'+
        '<span class="chapter-title">一、經貿資訊</span>'+
        '<span class="chapter-sub">原始歷屆題庫未收錄本章試題，暫無題目可練習。</span>'+
        '<span class="chapter-sub">此章仍屬考試範圍，不計入目前 400 題與 22 個題組。</span></div>'
      :'';
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
      metrics(summary(all))+'<div class="chapter-grid">'+chapterOneNotice+cards+'</div>'+draftButton());
    root.querySelector('#back').onclick=home;
    root.querySelectorAll('[data-chapter]').forEach(el=>el.onclick=()=>showGroups(el.dataset.chapter));
    bindResume();
  }
  function chapterCaseNotice(c){
    if(c.id!=='T12')return '';
    return '<div class="case-warning"><strong>信用狀五個案例，各10題</strong>'+
      '<p>依原題庫案例一至五分組，總計50題。各題會顯示信用狀條款或需要放大的原始單據；可直接依案例選擇練習。</p></div>';
  }
  function showGroups(chapterId){
    const c=chapters.get(chapterId);
    if(!c){home();return;}
    setTheme(c.source);
    state.mode=c.source;store();
    const sum=summary(c.questionIds);
    const chapterGroups=c.groupIds.map(id=>groups.get(id)).filter(Boolean);
    const chinese=["一","二","三","四","五"];
    const isLC=c.id==='T12';
    const list=chapterGroups.map(g=>{
      const s=summary(g.questionIds);
      const numbers=g.questionIds.map(id=>byId.get(id)?.chapterQuestionNumber).filter(Number.isInteger);
      const from=Math.min(...numbers),to=Math.max(...numbers);
      const caseName=g.caseId?'案例'+chinese[g.caseNumber-1]:'第 '+g.round+' 回';
      const range=g.caseId
        ?'原題第 '+(g.questionPages||[]).join('、')+' 頁 · 附件 '+(g.referencePages||[]).join('、')+' 頁'
        :'本章原題 '+from+'–'+to+' 題'+(g.requiresContext?' · 需案例附件':'');
      return '<div class="group-card"><div class="group-heading"><strong>'+escapeHTML(caseName)+'</strong>'+
        '<span class="chip">'+g.questionCount+' 題</span></div>'+
        '<p class="muted">'+escapeHTML(range)+'</p>'+
        '<p class="group-progress">已刷 '+s.seen+'/'+s.total+' 題　｜　錯題 '+s.wrong+' 題</p>'+
        '<progress aria-label="'+escapeAttr(caseName)+'完成進度" value="'+s.seen+'" max="'+s.total+'"></progress>'+
        '<div class="actions"><button type="button" data-start="'+escapeAttr(g.id)+'">開始'+escapeHTML(caseName)+'（'+g.questionCount+' 題）</button>'+
        '<button type="button" class="secondary" data-wronggroup="'+escapeAttr(g.id)+'"'+(s.wrong===0?' disabled':'')+'>'+escapeHTML(caseName)+'錯題 ('+s.wrong+')</button></div></div>';
    }).join('');
    display(navigation('← 返回章節')+'<p class="eyebrow">'+escapeHTML(labels[c.source])+'</p>'+
      '<h2>'+escapeHTML(c.title)+'</h2>'+
      '<p class="muted">'+(isLC?'本章共5個原始信用狀案例，每案固定10題；案例之間不混題。':'本章 '+c.questionCount+' 題，分為 '+c.groupIds.length+' 回；每回最多30題，不與其他章混題。')+'</p>'+
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
    setTheme('mixed');
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
  function startLcCase(caseId){
    const ids=manifest.chapters.find(c=>c.id==='T12')?.questionIds.filter(id=>byId.get(id)?.caseId===caseId)||[];
    if(ids.length!==10){alert('此信用狀案例題庫尚未備妥');return;}
    const n=Number(caseId.slice(-2));
    beginQuiz(shuffle(ids),{type:'case',source:'trade',chapterId:'T12',display:'信用狀案例 '+n+'｜10 題'},false);
  }
  function startCaseOne(){
    startLcCase('LC01');
  }
  function startGroup(groupId){
    const g=groups.get(groupId);
    if(!g)return;
    beginQuiz(g.caseId?[...g.questionIds]:shuffle(g.questionIds),{type:'group',source:g.source,chapterId:g.chapterId,groupId:g.id,display:g.label},false);
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
    if(lcAll?.cases?.[q.caseId])return renderLcReference(q);
    if(q.caseId==='LC01'&&caseOne){
      const fields=caseOne.documents.flatMap(d=>d.fields.map(x=>({...x,document:d.title})));
      const mapping=new Map(fields.map(x=>[x.id,x]));
      const fieldHtml=x=>'<div class="lc-field'+(x.id==='lc-46A-bl'?' lc-critical-clause':'')+'"><div class="lc-field-title">'+escapeHTML(x.document?x.document+'｜':'')+escapeHTML(x.label)+'</div><div class="lc-field-text">'+escapeHTML(x.text)+'</div></div>';
      // Present original 46A ocean B/L requirements before shipping-order
      // or bill-of-lading fields, not the answer or any teacher-only warnings.
      const citedFields=[...(caseOne.questionFields[q.id]||[])];
      const questionText=[q.question,...q.options].join(' ');
      const needsBLClause=/(?:提單|裝貨單|SHIPPING\s*-?\s*ORDER|BILL\s*OF\s*LADING|B\s*\/\s*L|S\s*\/\s*O)/i.test(questionText)||
        citedFields.some(id=>id.startsWith('bl-'));
      if(needsBLClause&&mapping.has('lc-46A-bl')){
        citedFields.splice(0,citedFields.length,'lc-46A-bl',...citedFields.filter(id=>id!=='lc-46A-bl'));
      }
      const snippets=citedFields.map(id=>mapping.get(id)).filter(Boolean).map(fieldHtml).join('');
      const all=caseOne.documents.map(d=>'<details class="lc-document"><summary>'+escapeHTML(d.title)+'　（原 PDF 第 '+d.page+' 頁）</summary><div class="lc-document-body">'+d.fields.map(fieldHtml).join('')+'</div></details>').join('');
      return '<section class="lc-reference"><div class="lc-reference-heading"><strong>案例一｜本題相關條款與單據欄位</strong></div>'+
      '<p class="lc-ref-hint">保留原文及待填空格；上下滑動閱讀，不會預先顯示正解。</p>'+
      '<div class="lc-excerpts">'+snippets+'</div>'+
      '<details class="lc-full"><summary>展開完整案例資料（信用狀／匯票／發票／提單）</summary>'+
      '<p class="lc-ref-hint">文字轉錄自原 PDF 第 58～60 頁，原始空格版面請對照 PDF。</p>'+all+'</details></section>';
    }
    return '<details class="context"><summary>信用狀案例 '+q.caseNumber+'：查看所需附表頁碼</summary>'+
      '<p>請對照原始《國際貿易大會考題庫》PDF 的第 '+escapeHTML(pages)+' 頁（信用狀、發票、提單等），以及題目所在的第 '+escapeHTML(q.page)+' 頁。</p>'+
      '<p>目前網頁尚未附完整原始附件圖片；需要對照文件才能作答的題目，請先備妥原始 PDF。</p></details>';
  }
  function showQuestion(){
    setTheme(context?.source||state.mode);
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
      '<div class="auto-next-tip">'+(pos===questionCount-1?'最後一題：選完答案後按「交卷」即可計分。':'✓ 自動跳題已開啟：直接點 A、B、C、D，立即進入下一題。')+'</div>'+
      '<div class="actions nav">'+button('previous','上一題',true)+(pos===questionCount-1?button('next','交卷'):(checked>=0?button('next','下一題',true):''))+'</div>'+
      '<div class="actions">'+button('pause','暫存並回首頁',true)+'</div>',true);
    root.querySelectorAll('[data-option]').forEach(el=>{
      el.addEventListener('click',()=>{
        const answeredPosition=pos;
        answers[answeredPosition]=Number(el.dataset.option);
        // Explicitly clear the old tapped button's focus before rendering
        // another question at the same on-screen button coordinates.
        el.blur?.();
        if(answeredPosition<paper.length-1)pos=answeredPosition+1;
        saveDraft();
        showQuestion();
      });
    });
    root.querySelector('#previous').disabled=pos===0;
    root.querySelector('#previous').onclick=()=>{if(pos>0){pos--;saveDraft();showQuestion();}};
    const nextButton=root.querySelector('#next');
    if(nextButton)nextButton.onclick=()=>{
      if(answers[pos]<0){alert('請先選擇答案。');return;}
      if(pos===paper.length-1){
        if(answers.some(a=>a<0)){alert('本卷仍有未作答的題目，請先完成。');return;}
        finish();
      }else {pos++;saveDraft();showQuestion();}
    };
    root.querySelector('#pause').onclick=home;
  }
  function finish(){
    setTheme(context?.source||state.mode);
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
    setTheme(context?.source||state.mode);
    display(navigation('← 返回成績')+'<h2>本卷逐題檢討與詳解</h2>'+
      '<p class="muted">先核對作答與標準答案，再點開「查看詳解」閱讀核心觀念、四個選項的解釋及必記重點。解析為教學輔助說明，以題庫標準答案為準。</p>'+
      paper.map((q,i)=>{
        const ex=explanations[q.id];
        const detail=ex
          ?'<details class="student-explanation"><summary>查看詳解與必記重點</summary>'+
            '<div class="explanation-content"><p><b>核心觀念：</b>'+escapeHTML(ex.core)+'</p>'+
            '<h4>四個選項解析</h4>'+
            ex.choices.map((text,j)=>'<p><b>'+('ABCD'[j])+'：</b>'+escapeHTML(text)+'</p>').join('')+
            (ex.tip?'<p class="memory-tip"><b>必記重點：</b>'+escapeHTML(ex.tip)+'</p>':'')+
            '</div></details>'
          :'<p class="muted">此題目前尚無可顯示的文字詳解。</p>';
        return '<section class="review '+(answers[i]===q.answer?'correct':'incorrect')+'">'+
          '<h3>'+(i+1)+'. '+escapeHTML(q.question)+'</h3>'+attachmentNote(q)+
          '<p>原題：'+escapeHTML(q.id)+'　｜　你的答案：<b>'+('ABCD'[answers[i]]||'—')+
          '</b>　｜　正解：<b>'+('ABCD'[q.answer]||'—')+'</b></p>'+
          q.options.map((choice,j)=>'<p class="'+(j===q.answer?'right':'')+'">'+('ABCD'[j])+'. '+
            escapeHTML(choice)+(j===q.answer?' ✓':'')+'</p>').join('')+
          detail+'</section>';
      }).join('')+
      '<div class="actions">'+button('return','返回題組／首頁')+'</div>');
    root.querySelector('#back').onclick=showResults;
    root.querySelector('#return').onclick=returnFromQuiz;
  }
  function showResults(){
    if(!finished){home();return;}
    setTheme(context?.source||state.mode);
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
    setTheme('home');
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
    if(qs.length!==500||data.chapters.length!==14||data.groups.length!==25)throw Error('題庫數量與章節規劃不一致');
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
    fetch('./chapter-groups.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('無法取得 chapter-groups.json');return r.json();}),
    fetch('./explanations.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('無法取得 explanations.json');return r.json();}),
    fetch('./lc-case1.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('無法取得案例一參考資料');return r.json();}),
    fetch('./lc-all-cases.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('無法取得五個信用狀案例附件');return r.json();})
  ]).then(([qs,data,detail,caseData,allCases])=>{
    questions=qs;manifest=data;validateBank(qs,data);
    if(!detail||Object.keys(detail).length!==qs.length||
      qs.some(q=>!detail[q.id]||typeof detail[q.id].core!=='string'||
      !Array.isArray(detail[q.id].choices)||detail[q.id].choices.length!==4)){
      throw Error('詳解資料與題庫不一致，請重新整理。');
    }
    const lc1=qs.filter(q=>q.caseId==='LC01');
    const fieldIds=new Set(caseData?.documents?.flatMap(d=>d.fields.map(x=>x.id))||[]);
    if(caseData?.caseId!=='LC01'||caseData?.documents?.length!==4||lc1.length!==10||
      lc1.some(q=>!Array.isArray(caseData.questionFields?.[q.id])||
        caseData.questionFields[q.id].some(id=>!fieldIds.has(id))))throw Error('案例一參考資料對應不完整');
    const validCases=new Set(['LC01','LC02','LC03','LC04','LC05']);
    const imageIds=new Set();
    for(const [id,c] of Object.entries(allCases?.cases||{})){
      if(!validCases.has(id)||!c.creditSections?.['46A']||!c.creditBillClause||!Array.isArray(c.images))throw Error('信用狀附件格式錯誤：'+id);
      for(const im of c.images){
        if(imageIds.has(im.id)||!/^assets\/lc\/lc0[1-5]-(draft|invoice|packing|bl)\.jpg$/.test(im.src))throw Error('附件圖檔錯誤');
        imageIds.add(im.id);
      }
    }
    if(Object.keys(allCases?.cases||{}).length!==5||imageIds.size!==12||
      qs.filter(q=>q.contextRequired).some(q=>{
        const c=allCases.cases[q.caseId],config=c?.questions[q.id];
        return !config||!Array.isArray(config.fields)||!['none','inline','optional'].includes(config.imageMode)||
          config.images.some(id=>!c.images.find(im=>im.id===id));
      }))throw Error('50題信用狀資料與原始附件無法完整對應');
    explanations=detail;
    caseOne=caseData;
    lcAll=allCases;
    home();
  }).catch(e=>{
    console.error(e);
    display('<h2>題庫載入失敗</h2><p>'+escapeHTML(e.message)+'</p>'+
      '<p class="muted">請重新整理頁面。如果問題持續，可能是 GitHub Pages 還在更新中。</p>'+
      button('reload','重新載入'));
    root.querySelector('#reload').onclick=()=>window.location.reload();
  });
})();