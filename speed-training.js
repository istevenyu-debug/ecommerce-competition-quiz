(() => {
  'use strict';
  const C = window.SpeedTrainingCore;
  const root = document.getElementById('speed-app');
  const levels = { 20: '穩定練習', 15: '標準訓練', 10: '加速挑戰', 5: '熟題挑戰', 3: '極速反應' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let storageOK = true, state;
  try { state = C.loadState(localStorage.getItem(C.STORAGE_KEY)); }
  catch (_) { state = C.emptyState(); storageOK = false; }
  let bank = [], explanations = {}, paper = [], results = [], limit = state.selectedSeconds;
  let active = false, clock = null, index = 0, currentRun = null, generation = 0;
  let frame = null, timeout = null, transition = null, prepareTimer = null, startedAt = null;
  function save() {
    try { localStorage.setItem(C.STORAGE_KEY, JSON.stringify(state)); storageOK = true; return true; }
    catch (_) { storageOK = false; return false; }
  }
  function stopHandles() {
    if (frame !== null) cancelAnimationFrame(frame);
    clearTimeout(timeout); clearTimeout(transition); clearInterval(prepareTimer);
    frame = timeout = transition = prepareTimer = null;
  }
  function display(html, screen) {
    document.body.dataset.screen = screen;
    root.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function hintHtml(q) {
    if (!Array.isArray(q?.speedHint) || !q.speedHint.length) return '';
    return '<aside class="speed-lc-hint" aria-label="本題L/C精簡資料"><strong>L/C 精簡資料</strong>' +
      q.speedHint.map(line => '<div>' + esc(line) + '</div>').join('') + '</aside>';
  }
  function setup(message = '') {
    active = false; clock = null; generation++; stopHandles();
    const maxMs = limit * 30 * 1000;
    display('<div class="top-row"><span class="eyebrow">第四種模式・獨立成績</span><span class="tag">30 題</span></div>' +
      '<h1>極速訓練</h1><p><b>國貿 25 題（含 L/C 2 題）＋電商 5 題</b></p>' +
      '<p class="muted">先選每題秒數，再挑戰又快又準。也可由 2～3 人共用一部裝置討論選答。</p>' +
      (message ? '<p class="notice error" role="alert">' + esc(message) + '</p>' : '') +
      (!storageOK ? '<p class="notice error">此瀏覽器目前無法儲存紀錄；仍可練習，但離開頁面後成績可能遺失。</p>' : '') +
      '<div class="speed-limits" aria-label="選擇每題限時">' + C.LIMITS.map(s => '<button type="button" data-limit="' + s + '" aria-pressed="' + (s === limit) + '"><strong>' + s + ' 秒</strong><small>' + levels[s] + '</small></button>').join('') + '</div>' +
      '<p id="limit-note" class="muted">已選：每題 ' + limit + ' 秒｜30 題答題時間上限 ' + C.formatTime(maxMs) + '</p>' +
      '<div class="actions"><button id="start-speed" type="button">開始極速訓練</button><button id="speed-history" type="button" class="secondary">近 10 次競速成績</button></div>' +
      '<div class="notice"><b>答對才有速度分</b><br>答對積分＝70＋30×剩餘時間／每題限時；每題最多 100 分，全卷 3,000 分。答錯或逾時皆 0 分。</div>' +
      '<p class="muted">按下答案即鎖定，不可返回修改；逾時自動跳題，最後一題自動交卷。題目顯示即開始倒數，所有詳解在交卷後開放。</p>' +
      '<div class="speed-mode-note">每回固定 23 題一般國貿＋2 題 L/C＋5 題電商。L/C 只抽已核對的短文字題，題目和必要資料一起顯示，不用圖片或整份信用狀。3／5 秒適合熟題反應，不代表長題或計算題都能在此時限完成。每次隨機抽題，同一回不重複；不同秒數模式不直接比較積分。</div>' +
      '<p class="muted">離開此頁或切換到其他 APP 會中止本回，不列成績。這是本機自主訓練，沒有多人連線；模擬積分不代表主辦單位正式計分。前三種練習及原紀錄完全獨立。</p>', 'setup');
    root.querySelectorAll('[data-limit]').forEach(b => b.onclick = () => {
      limit = Number(b.dataset.limit); state.selectedSeconds = limit; save(); setup();
    });
    root.querySelector('#start-speed').onclick = begin;
    root.querySelector('#speed-history').onclick = () => history('all');
  }
  function begin() {
    if (active) return;
    try { paper = C.selectPaper(bank, state.seen); }
    catch (e) { setup(e.message); return; }
    generation++; const token = generation;
    index = 0; results = []; currentRun = null; active = true; clock = null;
    let count = 3;
    display('<div class="preparation"><span class="tag">每題 ' + limit + ' 秒</span><h1>準備開始</h1>' +
      '<div class="countdown-number" id="prepare-count">3</div><p>30 題｜一般國貿 23＋L/C 2＋電商 5</p><p class="muted">按 A／B／C／D 即送出，不可修改</p></div>', 'preparing');
    prepareTimer = setInterval(() => {
      if (!active || generation !== token) return;
      count--;
      if (count > 0) root.querySelector('#prepare-count').textContent = count;
      else { clearInterval(prepareTimer); prepareTimer = null; startedAt = Date.now(); showQuestion(token); }
    }, 1000);
  }
  function showQuestion(token) {
    if (!active || generation !== token) return;
    if (index >= paper.length) { finish(); return; }
    const q = paper[index], questionIndex = index;
    clock = null;
    display('<div class="speed-question-bar"><span><b>第 <span id="question-number">' + (index + 1) + '</span> / 30 題</b><br>' +
      '<span class="muted">' + (q.speedHint ? '國貿 · L/C' : q.source === 'trade' ? '國貿大會考' : '電子商務') + ' · ' + esc(q.id) + '</span></span>' +
      '<span class="speed-clock" id="speed-clock" role="timer" aria-live="off">' + limit.toFixed(1) + ' 秒</span></div>' +
      '<div class="speed-timebar" aria-hidden="true"><span id="timebar-fill"></span></div>' +
      '<h2 class="speed-question" data-question-id="' + esc(q.id) + '">' + esc(q.question) + '</h2>' +
      hintHtml(q) +
      '<div class="speed-options">' + q.options.map((o, i) => '<button disabled type="button" class="speed-option" data-choice="' + i + '"><span class="letter">' + 'ABCD'[i] + '</span><span>' + esc(o) + '</span></button>').join('') + '</div>' +
      '<p class="speed-status" id="speed-status">點選即鎖定・不可返回上一題</p><button id="abort-speed" type="button" class="secondary">中止本回（不計成績）</button>', 'quiz');
    root.querySelectorAll('[data-choice]').forEach(b => b.onclick = e => {
      if (e.detail > 1) return;
      choose(Number(b.dataset.choice), questionIndex);
    });
    root.querySelector('#abort-speed').onclick = () => abort('本回已中止，未加入近 10 次競速成績。');
    frame = requestAnimationFrame(() => {
      if (!active || token !== generation) return;
      clock = new C.QuestionClock(q, limit, performance.now());
      root.querySelectorAll('[data-choice]').forEach(b => { b.disabled = false; });
      tick(token);
      deadline(token, questionIndex);
    });
  }
  function tick(token) {
    if (!active || generation !== token || !clock || clock.result) return;
    const remaining = clock.remaining(performance.now());
    const text = root.querySelector('#speed-clock');
    if (text) {
      text.textContent = (Math.ceil(remaining / 100) / 10).toFixed(1) + ' 秒';
      text.classList.toggle('urgent', remaining <= Math.min(3000, limit * 300));
      root.querySelector('#timebar-fill').style.width = (100 * remaining / (limit * 1000)) + '%';
    }
    if (remaining <= 0) { choose(null, index); return; }
    frame = requestAnimationFrame(() => tick(token));
  }
  function deadline(token, questionIndex) {
    if (!active || generation !== token || !clock || clock.result) return;
    const left = clock.remaining(performance.now());
    if (left <= 0) { choose(null, questionIndex); return; }
    timeout = setTimeout(() => deadline(token, questionIndex), Math.ceil(left));
  }
  function choose(choice, expectedIndex) {
    if (!active || index !== expectedIndex || !clock || clock.result) return;
    const result = clock.settle(choice, performance.now());
    if (!result) return;
    clearTimeout(timeout); if (frame !== null) cancelAnimationFrame(frame);
    results.push(result);
    root.querySelectorAll('[data-choice]').forEach(b => {
      b.disabled = true; b.blur();
      b.classList.toggle('chosen', result.choice === Number(b.dataset.choice));
    });
    root.querySelector('#speed-status').textContent = result.status === 'timeout' ? '逾時未答・準備下一題' : '答案已鎖定・準備下一題';
    if (result.status === 'timeout') {
      root.querySelector('#speed-clock').textContent = '0.0 秒';
      root.querySelector('#timebar-fill').style.width = '0%';
    }
    const token = generation;
    transition = setTimeout(() => {
      if (!active || generation !== token) return;
      index++; showQuestion(token);
    }, 220); // brief locked transition avoids one tap accidentally answering two questions
  }
  function abort(message) {
    active = false; generation++; clock = null; stopHandles(); paper = []; results = [];
    setup(message);
  }
  function finish() {
    if (!active || results.length !== 30) return;
    active = false; generation++; stopHandles(); clock = null;
    const summary = C.summarize(results);
    const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2);
    const snapshot = paper.map(q => ({ id: q.id, source: q.source, question: q.question, options: [...q.options], answer: q.answer,
      ...(q.speedHint ? { caseId: q.caseId, speedHint: [...q.speedHint], speedHintPages: [...q.speedHintPages], speedHintVersion: q.speedHintVersion } : {}) }));
    const details = Object.fromEntries(paper.map(q => [q.id, explanations[q.id]]).filter(([, ex]) => ex));
    currentRun = { id, time: Date.now(), startedAt, limitSeconds: limit, summary,
      results: [...results], questions: snapshot, explanations: details, mixVersion: C.MIX_VERSION };
    try { state = C.loadState(localStorage.getItem(C.STORAGE_KEY)); } catch (_) { /* retain in-memory state */ }
    state.selectedSeconds = limit;
    state = C.addCompleted(state, currentRun);
    save(); showResult(currentRun);
  }
  function recommendation(run) {
    const threshold = { 20: 80, 15: 85, 10: 90, 5: 95 };
    const next = { 20: 15, 15: 10, 10: 5, 5: 3 };
    if (run.limitSeconds === 3) return '3 秒模式重在熟題反應；請仍以正確理解為先。';
    return run.summary.score >= threshold[run.limitSeconds]
      ? '本次已達建議門檻，可挑戰每題 ' + next[run.limitSeconds] + ' 秒；所有秒數都可自由選擇。'
      : '可先在此秒數練到正確率 ' + threshold[run.limitSeconds] + '%，再挑戰下一級。這只是建議，不限制選擇。';
  }
  function showResult(run) {
    const s = run.summary;
    display('<div class="top-row"><span class="eyebrow">極速訓練完成</span><span class="tag">每題 ' + run.limitSeconds + ' 秒</span></div>' +
      '<h1>又快又準，看看這次表現</h1>' +
      '<p class="muted">' + (run.mixVersion === 2 ? '本回：一般國貿 23＋L/C 2＋電商 5' : '舊版紀錄：國貿 25＋電商 5（未固定 L/C 題數）') + '</p>' +
      '<div class="speed-scoreline"><span>正確率成績 <strong>' + s.score + ' 分</strong></span><span>總答題時間 <b>' + C.formatTime(s.totalMs) + '</b></span></div>' +
      '<div class="speed-stats"><div><strong>' + (s.pointsTenths / 10).toFixed(1) + '</strong><small>競速積分／3,000</small></div><div><strong>' + s.correct + '／30</strong><small>答對題數</small></div><div><strong>' + s.timeouts + '</strong><small>逾時題數</small></div></div>' +
      '<p class="muted">平均每題 ' + (s.totalMs / 30 / 1000).toFixed(2) + ' 秒。總答題時間為各題耗時總和，不含準備與換題空檔；不是整場經過時間。</p>' +
      '<p class="notice">' + esc(recommendation(run)) + '</p>' +
      (!storageOK ? '<p class="notice error">本次成績無法寫入瀏覽器。下方檢討仍可使用，請先保留畫面。</p>' : '<p class="muted">已加入獨立的近 10 次競速成績，不影響一般刷題紀錄。</p>') +
      '<div class="actions"><button id="review-speed">逐題耗時與詳解</button><button id="history-speed" class="secondary">近 10 次競速成績</button><button id="again-speed" class="secondary">返回訓練設定</button></div>', 'result');
    root.querySelector('#review-speed').onclick = () => review(run);
    root.querySelector('#history-speed').onclick = () => history('all');
    root.querySelector('#again-speed').onclick = () => setup();
  }
  function review(run) {
    const labels = { correct: '答對', wrong: '答錯', timeout: '逾時未答' };
    const html = run.results.map((r, i) => {
      const q = run.questions?.[i] || bank.find(x => x.id === r.id);
      const ex = run.explanations?.[r.id] || explanations[r.id];
      const slow = i === run.summary.slowestIndex;
      return '<section class="speed-review' + (slow ? ' speed-slowest' : '') + '" data-review-id="' + esc(r.id) + '">' +
        '<div class="top-row"><b>第 ' + (i + 1) + ' 題｜' + esc(r.id) + '</b>' + (slow ? '<span class="slow-label">本回最耗時</span>' : '') + '</div>' +
        '<p><strong>本題耗時 ' + (r.elapsedMs / 1000).toFixed(2) + ' 秒</strong>　｜　競速積分 ' + (r.pointsTenths / 10).toFixed(1) + '</p>' +
        '<p class="result-' + r.status + '">' + labels[r.status] + '　你的答案：' + (r.choice === null ? '未作答' : 'ABCD'[r.choice]) + '　｜　正解：' + 'ABCD'[r.answer] + '</p>' +
        '<h3>' + esc(q?.question || '原題未儲存') + '</h3>' + hintHtml(q) +
        (q?.options || []).map((o, j) => '<p class="' + (j === r.answer ? 'choice-right' : '') + '">' + 'ABCD'[j] + '. ' + esc(o) + '</p>').join('') +
        (ex ? '<details class="speed-explanation"><summary>查看詳解與必記重點</summary><p><b>核心觀念：</b>' + esc(ex.core) + '</p>' +
          ex.choices.map((x, j) => '<p><b>' + 'ABCD'[j] + '：</b>' + esc(x) + '</p>').join('') +
          (ex.tip ? '<p class="memory-tip"><b>必記重點：</b>' + esc(ex.tip) + '</p>' : '') + '</details>' : '<p class="muted">此題目前沒有可顯示的詳解。</p>') + '</section>';
    }).join('');
    display('<div class="top-row"><h1>逐題耗時與詳解</h1><span class="tag">每題 ' + run.limitSeconds + ' 秒</span></div>' +
      '<p class="muted">紅色框線標記耗時最久的一題，與答對／答錯無關；同耗時時以題序最前者標示。逾時題都會另外註記。</p>' + html +
      '<div class="actions"><button id="return-speed-result">返回本次成績</button><button id="return-speed-setup" class="secondary">返回訓練設定</button></div>', 'review');
    root.querySelector('#return-speed-result').onclick = () => showResult(run);
    root.querySelector('#return-speed-setup').onclick = () => setup();
  }
  function history(filter) {
    const rows = state.history.filter(r => filter === 'all' || r.limitSeconds === Number(filter));
    display('<div class="top-row"><h1>近 10 次競速成績</h1><span class="tag">獨立紀錄</span></div>' +
      '<p class="muted">最多保留最近 10 次完整訓練，包含限時模式與每題耗時。不同限時、不同試卷的積分不宜直接排名。</p>' +
      '<label>依限時查看　<select id="history-limit"><option value="all">全部限時</option>' + C.LIMITS.map(s => '<option value="' + s + '"' + (String(s) === filter ? ' selected' : '') + '>' + s + ' 秒</option>').join('') + '</select></label>' +
      (rows.length ? '<div class="table-scroll"><table><thead><tr><th>完成時間</th><th>限時</th><th>正確率成績</th><th>競速積分</th><th>總時間</th><th>檢討</th></tr></thead><tbody>' +
        rows.map(r => '<tr><td>' + esc(new Date(r.time).toLocaleString('zh-TW')) + '</td><td>' + r.limitSeconds + ' 秒<br><small>' + (r.mixVersion === 2 ? '含 L/C 2 題' : '舊版配題') + '</small></td><td>' + r.summary.score + ' 分（' + r.summary.correct + '/30）</td><td>' + (r.summary.pointsTenths / 10).toFixed(1) + '</td><td>' + C.formatTime(r.summary.totalMs) + '</td><td><button class="secondary" data-run="' + esc(r.id) + '">查看</button></td></tr>').join('') + '</tbody></table></div>' : '<p>此模式尚無完整的競速成績。</p>') +
      '<div class="actions"><button id="back-speed-setup">返回極速訓練</button></div><p class="muted">本區不讀取、不覆蓋前三種一般練習的分數、錯題與進度。</p>', 'history');
    root.querySelector('#history-limit').onchange = e => history(e.target.value);
    root.querySelector('#back-speed-setup').onclick = () => setup();
    root.querySelectorAll('[data-run]').forEach(b => b.onclick = () => {
      const run = state.history.find(r => r.id === b.dataset.run); if (run) review(run);
    });
  }
  document.addEventListener('keydown', e => {
    if (!active || !clock || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toUpperCase();
    const choice = /^[ABCD]$/.test(key) ? 'ABCD'.indexOf(key) : /^[1234]$/.test(key) ? Number(key) - 1 : -1;
    if (choice >= 0) { e.preventDefault(); choose(choice, index); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active) abort('已離開作答畫面，本回已中止，不列入成績。請回到此頁重新開始。');
  });
  window.addEventListener('pagehide', () => { if (active) abort('本回已中止，請重新開始。'); });
  Promise.all(['questions.json', 'explanations.json'].map(path => fetch('./' + path, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw Error('無法載入 ' + path); return r.json();
  }))).then(([qs, ex]) => {
    C.validateBank(qs); bank = qs; explanations = ex;
    for (const q of qs.filter(q => C.eligible(q) || C.lcEligible(q))) {
      const item = ex[q.id];
      if (!item || typeof item.core !== 'string' || !Array.isArray(item.choices) || item.choices.length !== 4) throw Error('題庫與詳解未完整載入');
    }
    setup();
  }).catch(e => {
    display('<h1>極速訓練暫時無法載入</h1><p class="notice error">' + esc(e.message) + '</p><button id="reload-speed">重新載入</button><p><a href="./index.html">返回原有刷題首頁</a></p>', 'error');
    root.querySelector('#reload-speed').onclick = () => location.reload();
  });
})();
