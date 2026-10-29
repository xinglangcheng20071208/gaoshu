/* ============================================================
 * 高数刷题营 - 核心模块（题库注册表 + 数学工具）
 * UMD：浏览器挂到 window.QuestionBank，Node 里 require 使用
 * ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = factory(); }
  else { root.QuestionBank = factory(); }
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  /* ---------- 数学工具 ---------- */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a || 1;
  }

  // 分数 → LaTeX（自动约分、处理符号）
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    if (n === 0) return '0';
    var g = gcd(n, d);
    n = n / g; d = d / g;
    var neg = n < 0;
    n = Math.abs(n); d = Math.abs(d);
    if (d === 1) return (neg ? '-' : '') + n;
    return (neg ? '-' : '') + '\\frac{' + n + '}{' + d + '}';
  }

  // 带符号整数项：3 → '+3'，-2 → '-2'，0 → ''
  function signed(x) {
    if (x === 0) return '';
    return (x > 0 ? '+' : '-') + Math.abs(x);
  }

  // 小数展示：四舍五入到 5 位小数并去掉尾部 0
  function num(x) {
    var s = Number(x.toFixed(5)).toString();
    return s;
  }

  /* ---------- 随机工具 ---------- */
  function ri(a, b, rng) { // [a, b] 随机整数
    return a + Math.floor((rng || Math.random)() * (b - a + 1));
  }
  function pick(arr, rng) {
    return arr[Math.floor((rng || Math.random)() * arr.length)];
  }
  // 可复现随机数（测试用）
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- 题型元数据 ---------- */
  var TYPES = {
    limit:      { name: '极限与连续',     short: '极限',     icon: '∞',  color: '#6366f1' },
    derivative: { name: '导数与微分',     short: '导数',     icon: '′',  color: '#0ea5e9' },
    mvt:        { name: '中值定理与导数应用', short: '中值定理', icon: '↗', color: '#f59e0b' },
    indint:     { name: '不定积分',       short: '不定积分', icon: '∫',  color: '#10b981' },
    defint:     { name: '定积分',         short: '定积分',   icon: '∮',  color: '#14b8a6' },
    defapp:     { name: '定积分的应用',   short: '积分应用', icon: '⌀',  color: '#8b5cf6' },
    ode:        { name: '微分方程',       short: '微分方程', icon: 'y′', color: '#ef4444' }
  };

  var DIFFICULTIES = {
    easy:   { name: '基础', color: '#10b981', desc: '一步公式，直接套用' },
    medium: { name: '进阶', color: '#f59e0b', desc: '两步变形，稍加思考' },
    hard:   { name: '困难', color: '#ef4444', desc: '多步综合，挑战自我' }
  };

  /* ---------- 题库注册表 ---------- */
  var templates = []; // {id, type, difficulty, gen(rng)}

  function register(t) { templates.push(t); }
  function templatesOf(typeId, difficulty) {
    return templates.filter(function (t) {
      return t.type === typeId && (!difficulty || t.difficulty === difficulty);
    });
  }

  // 组装选项：correct + distractors，随机插入并记录下标
  function buildOptions(correct, distractors, rng) {
    var idx = Math.floor((rng || Math.random)() * (distractors.length + 1));
    var opts = distractors.slice(0, idx).concat([correct], distractors.slice(idx));
    return { options: opts, answerIndex: idx, answer: correct };
  }

  // 题目标签：同模板 + 同参数 = 同一道题；用于"举一反三"去重
  function sigOf(tplId, params) {
    return tplId + '|' + JSON.stringify(params || {});
  }

  // 生成一道题：typeId + difficulty；该难度无模板时就近取其它难度
  // opts.avoid: 题目标签数组，生成的题自动避开这些"原题"（换模板或换参数）
  function generate(opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var avoid = opts.avoid || [];
    var pool = templatesOf(opts.typeId, opts.difficulty);
    if (!pool.length) {
      var order = ['easy', 'medium', 'hard'];
      var idx = order.indexOf(opts.difficulty);
      for (var d = 1; d <= 2; d++) {
        if (idx - d >= 0 && templatesOf(opts.typeId, order[idx - d]).length) { pool = templatesOf(opts.typeId, order[idx - d]); break; }
        if (idx + d < order.length && templatesOf(opts.typeId, order[idx + d]).length) { pool = templatesOf(opts.typeId, order[idx + d]); break; }
      }
    }
    if (!pool.length) pool = templatesOf(opts.typeId);
    var q = null, sig = null, attempts = 0;
    do {
      var tpl = pick(pool, rng);
      q = tpl.gen(rng);
      sig = sigOf(tpl.id, q.params);
      attempts++;
    } while (attempts < 15 && avoid.indexOf(sig) >= 0);
    q.qid = uid();
    q.tpl = tpl.id;
    q.typeId = tpl.type;
    q.difficulty = q.difficulty || tpl.difficulty;
    q.sig = sig;
    return q;
  }

  /* ---------- 导出 ---------- */
  return {
    types: TYPES,
    difficulties: DIFFICULTIES,
    templates: templates,
    register: register,
    templatesOf: templatesOf,
    generate: generate,
    buildOptions: buildOptions,
    sigOf: sigOf,
    gcd: gcd, frac: frac, signed: signed, num: num,
    ri: ri, pick: pick, mulberry32: mulberry32, uid: uid
  };
});
