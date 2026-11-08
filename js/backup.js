/* ============================================================
 * 数据备份 / 导出 / 导入 / 自动快照
 * - 每次启动自动做一份每日快照（保留最近 3 天），误重置后可恢复
 * - 导出：下载 JSON 文件（换设备/清缓存前备份）
 * - 导入：文件导入或粘贴文本；支持「合并」模式（保留两边做题记录）
 * ============================================================ */
(function (root) {
  'use strict';
  var KEY = 'gaoshu_state_v1';
  var BK = 'gaoshu_backup_v1';
  var MAX = 3;
  var MARK_PRI = { mastered: 1, wobbly: 2, not_mastered: 3, wrong: 4 };

  function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function saveState(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); return true; } catch (e) { return false; }
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------- 自动快照 ---------- */
  function snapshots() {
    try { return JSON.parse(localStorage.getItem(BK) || '[]'); } catch (e) { return []; }
  }
  function autoSnapshot() {
    var st = loadState();
    if (!st || !st.version) return;
    var list = snapshots();
    var today = todayStr();
    if (list.length && list[0].date === today) {
      list[0].data = st;
      list[0].ts = Date.now();
    } else {
      list.unshift({ date: today, ts: Date.now(), data: st });
    }
    list = list.slice(0, MAX);
    try { localStorage.setItem(BK, JSON.stringify(list)); } catch (e) { /* 容量不足时忽略 */ }
  }
  function snapshotInfo() {
    return snapshots().map(function (s) {
      return { date: s.date, ts: s.ts, questions: (s.data.history || []).length, wrong: (s.data.wrongbook || []).length };
    });
  }
  function restoreSnapshot(idx) {
    var list = snapshots();
    var s = list[idx];
    if (!s || !s.data) return false;
    // 恢复前先把当前状态存成快照，避免二次误操作
    var cur = loadState();
    if (cur) {
      var keep = { date: todayStr() + '-before-restore', ts: Date.now(), data: cur };
      list.splice(idx, 0, keep);
      try { localStorage.setItem(BK, JSON.stringify(list.slice(0, MAX + 1))); } catch (e) { }
    }
    return saveState(s.data);
  }

  /* ---------- 导出 / 下载 ---------- */
  function exportObject() {
    return {
      app: 'gaoshu',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: loadState()
    };
  }
  function exportText() {
    return JSON.stringify(exportObject(), null, 2);
  }
  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || ('gaoshu-backup-' + todayStr() + '.json');
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  /* ---------- 合并策略 ---------- */
  function mergeStates(local, incoming) {
    var out = JSON.parse(JSON.stringify(local || {}));
    var inc = incoming || {};
    // 1) history：按 qid+ts 去重，合并后按时间排序
    var seen = Object.create(null);
    out.history = out.history || [];
    out.history.forEach(function (h) { seen[(h.qid || '') + '|' + (h.ts || h.date)] = true; });
    (inc.history || []).forEach(function (h) {
      var k = (h.qid || '') + '|' + (h.ts || h.date);
      if (!seen[k]) { seen[k] = true; out.history.push(h); }
    });
    out.history.sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    if (out.history.length > 2000) out.history = out.history.slice(-2000);
    // 2) wrongbook：同 id 取掌握度更差（更需要复习）的标记，corrected 任一为真即真
    var wb = Object.create(null);
    (out.wrongbook || []).forEach(function (e) { wb[e.id] = e; });
    (inc.wrongbook || []).forEach(function (e) {
      var cur = wb[e.id];
      if (!cur) { wb[e.id] = e; return; }
      if ((MARK_PRI[e.mark] || 0) > (MARK_PRI[cur.mark] || 0)) cur.mark = e.mark;
      cur.corrected = !!(cur.corrected || e.corrected);
    });
    out.wrongbook = Object.keys(wb).map(function (k) { return wb[k]; });
    // 3) types：lastShown 更新的状态优先
    out.types = out.types || {};
    Object.keys(inc.types || {}).forEach(function (t) {
      var x = out.types[t], y = inc.types[t];
      if (!x) { out.types[t] = y; return; }
      if ((y.lastShown || '') > (x.lastShown || '')) out.types[t] = y;
    });
    // 4) settings：主题/难度保留本地，其余（板块、学期等）以导入为准
    out.settings = Object.assign({}, inc.settings || {}, {
      theme: (out.settings || {}).theme || (inc.settings || {}).theme || 'light'
    });
    // 5) daily：保留本地今天的套题（避免刚做一半被覆盖）
    out.daily = out.daily || {};
    Object.keys(inc.daily || {}).forEach(function (k) { if (!out.daily[k]) out.daily[k] = inc.daily[k]; });
    // 6) custom / redo：本地优先
    out.custom = out.custom || { settings: { typeIds: [], difficulty: 'mixed', count: 10, forms: [] }, set: null };
    return out;
  }

  /* ---------- 导入 ---------- */
  function parseImport(text) {
    var obj;
    try { obj = JSON.parse(String(text || '')); } catch (e) { return { ok: false, error: '不是合法的 JSON 文本' }; }
    if (!obj || obj.app !== 'gaoshu' || !obj.state || !obj.state.version) {
      return { ok: false, error: '不是本网站的备份文件（缺少 app/state 字段）' };
    }
    return { ok: true, state: obj.state };
  }
  function importState(st, mode) {
    if (!st || !st.version) return false;
    if (mode === 'merge') {
      var local = loadState();
      return saveState(local ? mergeStates(local, st) : st);
    }
    return saveState(st);
  }

  root.Backup = {
    autoSnapshot: autoSnapshot,
    snapshotInfo: snapshotInfo,
    restoreSnapshot: restoreSnapshot,
    exportText: exportText,
    download: download,
    parseImport: parseImport,
    importState: importState,
    mergeStates: mergeStates,
    loadState: loadState
  };
})(typeof window !== 'undefined' ? window : globalThis);
