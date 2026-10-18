/* Add only the fourth home card. Do not edit app.js, regular routes or storage. */
(() => {
  'use strict';
  const root = document.getElementById('app');
  if (!root) return;
  function attach() {
    const mixed = root.querySelector('#mixed.mode-card');
    if (!mixed || root.querySelector('#speed-training-entry')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'speed-training-entry';
    button.className = 'mode-card speed-training-entry';
    button.style.background = '#fff5e9';
    button.style.borderColor = '#e9cba5';
    button.innerHTML = '<span class="mode-title">極速訓練</span>' +
      '<span class="mode-meta">國貿 25 題＋電商 5 題・每回 30 題</span>' +
      '<span class="mode-detail">自選 20／15／10／5／3 秒・獨立競速積分與紀錄</span>' +
      '<span class="mode-arrow" aria-hidden="true">›</span>';
    button.onclick = () => { location.href = new URL('./speed.html', document.baseURI).href; };
    mixed.after(button);
  }
  new MutationObserver(attach).observe(root, { childList: true });
  attach();
})();
