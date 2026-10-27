/* ============================================================
 * 复习调度器（纯逻辑，可注入日期，方便 Node 自测）
 * 规则：
 *   已掌握 mastered   → 7 天后再次出现类似题目
 *   不熟练 wobbly     → 2 天后再次出现类似题目
 *   未掌握 not_mastered → 连续 2 天出现（标记当天算第 1 天，次日第 2 天），
 *                          之后按"不熟练"节奏（每 2 天）继续巩固
 * ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = factory(require('./core.js')); }
  else { root.Scheduler = factory(root.QuestionBank); }
})(typeof self !== 'undefined' ? self : globalThis, function (QB) {
  'use strict';

  var DAY = 86400000;

  function parseDate(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toDateStr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(aStr, bStr) {
    return Math.round((parseDate(bStr).getTime() - parseDate(aStr).getTime()) / DAY);
  }
  function addDays(str, n) {
    var d = parseDate(str); d.setDate(d.getDate() + n); return toDateStr(d);
  }

  // 某题型今天是否到期 + 优先级（越大越优先）
  function dueInfo(typeState, today) {
    if (!typeState || !typeState.status || !typeState.lastShown) {
      return { due: true, pri: 3, reason: '新题型·首次接触' };
    }
    var days = daysBetween(typeState.lastShown, today);
    if (typeState.status === 'not_mastered') {
      var nm = typeState.nmDays || 0;
      if (nm < 2) return { due: true, pri: 4, reason: '未掌握·连续巩固第' + (nm + 1) + '天' };
      if (days >= 2) return { due: true, pri: 2, reason: '未掌握·间隔巩固' };
      return { due: false, pri: 0 };
    }
    if (typeState.status === 'wobbly') {
      if (days >= 2) return { due: true, pri: 2, reason: '不熟练·2天后再练' };
      return { due: false, pri: 0 };
    }
    // mastered
    if (days >= 7) return { due: true, pri: 1, reason: '已掌握·7天后再练' };
    return { due: false, pri: 0 };
  }

  function dueList(typesState, today) {
    var out = [];
    Object.keys(QB.types).forEach(function (t) {
      var info = dueInfo(typesState[t], today);
      if (info.due) {
        info.typeId = t;
        info.days = (typesState[t] && typesState[t].lastShown) ? daysBetween(typesState[t].lastShown, today) : 99;
        out.push(info);
      }
    });
    out.sort(function (x, y) {
      return y.pri - x.pri || y.days - x.days || x.typeId.localeCompare(y.typeId);
    });
    return out;
  }

  // 题型被加入当天练习后，更新其状态（不修改原对象）
  function afterShow(typeState, today) {
    var s = Object.assign({}, typeState || {});
    s.lastShown = today;
    if (s.status === 'not_mastered') {
      s.nmDays = Math.min((s.nmDays || 0) + 1, 2);
    }
    return s;
  }

  // 用户标记题型后的状态
  function applyMark(typeState, mark, today) {
    var s = Object.assign({}, typeState || {});
    s.status = mark;               // 'mastered' | 'wobbly' | 'not_mastered'
    s.lastShown = today;
    s.nmDays = (mark === 'not_mastered') ? 1 : 0;
    return s;
  }

  // 生成今天的一套题
  function buildDaily(opts) {
    var typesState = opts.typesState || {};
    var today = opts.today;
    var difficulty = opts.difficulty || 'medium';
    var count = opts.count || 10;
    var rng = opts.rng || Math.random;

    var due = dueList(typesState, today);
    var order = due.map(function (d) { return d.typeId; });
    Object.keys(QB.types).forEach(function (t) {
      if (order.indexOf(t) < 0) order.push(t);
    });

    var questions = [];
    var used = {};
    var qi = 0;
    var guard = 0;
    while (questions.length < count && guard < 200) {
      guard++;
      var typeId = order[qi % order.length];
      qi++;
      used[typeId] = (used[typeId] || 0) + 1;
      var q = QB.generate({ typeId: typeId, difficulty: difficulty, rng: rng });
      q.dailyIndex = questions.length + 1;
      var dueItem = null;
      for (var i = 0; i < due.length; i++) { if (due[i].typeId === typeId) { dueItem = due[i]; break; } }
      q.dueReason = dueItem ? dueItem.reason : '补充练习';
      questions.push(q);
    }
    return { date: today, questions: questions, used: used, due: due };
  }

  // 专项练习组卷：仅从指定题型出题；difficulty 为 'mixed' 时各难度随机
  function buildCustom(opts) {
    var typeIds = (opts.typeIds || []).filter(function (t) { return QB.types[t]; });
    var difficulty = opts.difficulty || 'mixed';
    var count = opts.count || 10;
    var rng = opts.rng || Math.random;
    var order = typeIds.length ? typeIds.slice() : Object.keys(QB.types);
    var questions = [];
    var used = {};
    var qi = 0, guard = 0;
    while (questions.length < count && guard < 300) {
      guard++;
      var typeId = order[qi % order.length];
      qi++;
      used[typeId] = (used[typeId] || 0) + 1;
      var q = QB.generate({ typeId: typeId, difficulty: difficulty === 'mixed' ? null : difficulty, rng: rng });
      q.dailyIndex = questions.length + 1;
      q.dueReason = '专项练习';
      questions.push(q);
    }
    return { questions: questions, used: used };
  }

  // 某题型下次到期日期（用于 UI 展示；null 表示无计划）
  function nextDue(typeState, today) {
    if (!typeState || !typeState.status || !typeState.lastShown) return { date: null, reason: '还未练过' };
    if (typeState.status === 'mastered') {
      return { date: addDays(typeState.lastShown, 7), reason: '已掌握·7天后再练' };
    }
    if (typeState.status === 'wobbly') {
      return { date: addDays(typeState.lastShown, 2), reason: '不熟练·2天后再练' };
    }
    var nm = typeState.nmDays || 0;
    if (nm < 2) return { date: addDays(typeState.lastShown, 1), reason: '未掌握·连续巩固' };
    return { date: addDays(typeState.lastShown, 2), reason: '未掌握·间隔巩固' };
  }

  return {
    DAY: DAY,
    parseDate: parseDate, toDateStr: toDateStr, daysBetween: daysBetween, addDays: addDays,
    dueInfo: dueInfo, dueList: dueList, afterShow: afterShow, applyMark: applyMark,
    buildDaily: buildDaily, buildCustom: buildCustom, nextDue: nextDue
  };
});
