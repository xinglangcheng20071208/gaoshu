/* ============================================================
 * 本地存储：所有数据保存在浏览器 localStorage
 * state = {
 *   version, settings:{difficulty, theme},
 *   types: { typeId: {status, lastShown, nmDays} },
 *   daily: { dateStr: {date, difficulty, due:[], questions:[], answers:{qid:{chosen,correct,mark}} } },
 *   history: [ {ts,date,typeId,difficulty,tpl,qid,question,answer,chosen,correct,mark} ],
 *   wrongbook: [ {id,date,typeId,difficulty,question,options,answerIndex,answer,idea,steps,pitfall,mark} ]
 * }
 * ============================================================ */
(function (root) {
  'use strict';
  var KEY = 'gaoshu_state_v1';

  function pad(n) { return String(n).padStart(2, '0'); }
  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function defaultState() {
    return {
      version: 1,
      settings: { difficulty: 'medium', theme: 'light' },
      types: {},
      daily: {},
      custom: { settings: { typeIds: [], difficulty: 'mixed', count: 10 }, set: null },
      history: [],
      wrongbook: []
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      var s = JSON.parse(raw);
      if (!s || s.version !== 1) return defaultState();
      // 防御：补齐缺的字段
      if (!s.settings) s.settings = { difficulty: 'medium', theme: 'light' };
      if (!s.types) s.types = {};
      if (!s.daily) s.daily = {};
      if (!s.custom) s.custom = { settings: { typeIds: [], difficulty: 'mixed', count: 10 }, set: null };
      if (!s.custom.settings) s.custom.settings = { typeIds: [], difficulty: 'mixed', count: 10 };
      if (!s.history) s.history = [];
      if (!s.wrongbook) s.wrongbook = [];
      return s;
    } catch (e) {
      return defaultState();
    }
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 存储满时静默 */ }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { }
  }

  root.Store = { KEY: KEY, todayStr: todayStr, defaultState: defaultState, load: load, save: save, reset: reset };
})(typeof self !== 'undefined' ? self : globalThis);
