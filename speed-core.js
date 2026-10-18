/* Standalone speed-training engine. Never accesses regular quiz state. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpeedTrainingCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const LIMITS = Object.freeze([20, 15, 10, 5, 3]);
  const STORAGE_KEY = 'ecommerce-speed-training-v1';
  const VERSION = 1;
  function shuffle(items, random = Math.random) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function eligible(q) {
    return q && !q.contextRequired && !q.caseId && q.chapterId !== 'T12';
  }
  function validateBank(bank) {
    if (!Array.isArray(bank)) throw Error('題庫格式不正確');
    const ids = new Set();
    for (const q of bank) {
      if (!q.id || ids.has(q.id) || !q.question || !Array.isArray(q.options) ||
          q.options.length !== 4 || ![0, 1, 2, 3].includes(q.answer)) {
        throw Error('題庫有缺漏或重複題號');
      }
      ids.add(q.id);
    }
    if (bank.filter(q => q.source === 'trade' && eligible(q)).length < 25 ||
        bank.filter(q => q.source === 'ecom' && eligible(q)).length < 5) {
      throw Error('題庫不足以組成國貿 25 題＋電商 5 題');
    }
    return true;
  }
  function selectPaper(bank, seen = {}, random = Math.random) {
    validateBank(bank);
    const take = (source, n) => shuffle(bank.filter(q => q.source === source && eligible(q)), random)
      .sort((a, b) => (Number(seen[a.id]) || 0) - (Number(seen[b.id]) || 0)).slice(0, n);
    return shuffle([...take('trade', 25), ...take('ecom', 5)], random);
  }
  function scoreAnswer(question, choice, elapsedMs, limitSeconds) {
    if (!LIMITS.includes(limitSeconds) || !Number.isFinite(elapsedMs)) throw Error('計時參數錯誤');
    const limitMs = limitSeconds * 1000;
    const timedOut = choice === null || elapsedMs >= limitMs;
    if (!timedOut && ![0, 1, 2, 3].includes(choice)) throw Error('選項不正確');
    const time = timedOut ? limitMs : Math.max(0, elapsedMs);
    const correct = !timedOut && choice === question.answer;
    const pointsTenths = correct ? Math.round((70 + 30 * (1 - time / limitMs)) * 10) : 0;
    return {
      id: question.id, source: question.source, choice: timedOut ? null : choice,
      answer: question.answer, status: timedOut ? 'timeout' : correct ? 'correct' : 'wrong',
      elapsedMs: Math.round(time), pointsTenths
    };
  }
  class QuestionClock {
    constructor(question, limitSeconds, startedAt) {
      this.question = question; this.limitSeconds = limitSeconds;
      this.startedAt = startedAt; this.result = null;
    }
    remaining(now) { return Math.max(0, this.limitSeconds * 1000 - (now - this.startedAt)); }
    settle(choice, now) {
      if (this.result) return null;
      this.result = scoreAnswer(this.question, choice, Math.max(0, now - this.startedAt), this.limitSeconds);
      return this.result;
    }
  }
  function summarize(results) {
    const total = results.length;
    if (!total) throw Error('尚未作答');
    const correct = results.filter(r => r.status === 'correct').length;
    const timeouts = results.filter(r => r.status === 'timeout').length;
    const totalMs = results.reduce((n, r) => n + r.elapsedMs, 0);
    const pointsTenths = results.reduce((n, r) => n + r.pointsTenths, 0);
    let slowestIndex = 0;
    results.forEach((r, i) => { if (r.elapsedMs > results[slowestIndex].elapsedMs) slowestIndex = i; });
    return { total, correct, wrong: total - correct - timeouts, timeouts,
      score: Math.round(100 * correct / total), totalMs, pointsTenths, slowestIndex };
  }
  function emptyState() { return { version: VERSION, selectedSeconds: 15, seen: {}, history: [] }; }
  function loadState(text) {
    try {
      const s = JSON.parse(text || 'null');
      if (!s || typeof s !== 'object' || Array.isArray(s)) return emptyState();
      return { version: VERSION, selectedSeconds: LIMITS.includes(s.selectedSeconds) ? s.selectedSeconds : 15,
        seen: s.seen && typeof s.seen === 'object' && !Array.isArray(s.seen) ? s.seen : {},
        history: Array.isArray(s.history) ? s.history.filter(r => r && Array.isArray(r.results) &&
          r.results.length === 30 && LIMITS.includes(r.limitSeconds) && Number.isFinite(r.time) && r.summary).slice(0, 10) : [] };
    } catch (_) { return emptyState(); }
  }
  function addCompleted(state, run) {
    if (run.results.length !== 30) throw Error('未完成 30 題，不登記成績');
    const history = [run, ...state.history.filter(r => r.id !== run.id)].slice(0, 10);
    const seen = { ...state.seen };
    if (!state.history.some(r => r.id === run.id)) {
      run.results.forEach(r => { seen[r.id] = (Number(seen[r.id]) || 0) + 1; });
    }
    return { ...state, seen, history };
  }
  function formatTime(ms) {
    const tenths = Math.round(Math.max(0, ms) / 100);
    return String(Math.floor(tenths / 600)).padStart(2, '0') + ':' +
      String(Math.floor(tenths % 600 / 10)).padStart(2, '0') + '.' + (tenths % 10);
  }
  return Object.freeze({ LIMITS, STORAGE_KEY, VERSION, shuffle, eligible, validateBank,
    selectPaper, scoreAnswer, QuestionClock, summarize, emptyState, loadState, addCompleted, formatTime });
});
