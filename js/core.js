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

  /* ---------- 题型元数据（semester: 1 大一上 / 2 大一下） ---------- */
  var TYPES = {
    /* 大一上：一元微积分 */
    limit:      { name: '极限与连续',     short: '极限',     icon: '∞',  color: '#6366f1', semester: 1, track: 'gaoshu' },
    derivative: { name: '导数与微分',     short: '导数',     icon: '′',  color: '#0ea5e9', semester: 1, track: 'gaoshu' },
    mvt:        { name: '中值定理与导数应用', short: '中值定理', icon: '↗', color: '#f59e0b', semester: 1, track: 'gaoshu' },
    indint:     { name: '不定积分',       short: '不定积分', icon: '∫',  color: '#10b981', semester: 1, track: 'gaoshu' },
    defint:     { name: '定积分',         short: '定积分',   icon: '∮',  color: '#14b8a6', semester: 1, track: 'gaoshu' },
    defapp:     { name: '定积分的应用',   short: '积分应用', icon: '⌀',  color: '#8b5cf6', semester: 1, track: 'gaoshu' },
    ode:        { name: '微分方程',       short: '微分方程', icon: 'y′', color: '#ef4444', semester: 1, track: 'gaoshu' },
    /* 大一下：多元微积分与级数 */
    vector:     { name: '向量与空间解析几何', short: '向量', icon: '→', color: '#f43f5e', semester: 2, track: 'gaoshu' },
    multivar:   { name: '多元函数微分学', short: '多元微分', icon: '∂', color: '#0d9488', semester: 2, track: 'gaoshu' },
    doubleint:  { name: '重积分',         short: '重积分',   icon: '∬',  color: '#7c3aed', semester: 2, track: 'gaoshu' },
    tripleint:  { name: '三重积分',       short: '三重积分', icon: '∭',  color: '#0891b2', semester: 2, track: 'gaoshu' },
    lineint:    { name: '曲线积分与格林公式', short: '曲线积分', icon: '∮', color: '#c026d3', semester: 2, track: 'gaoshu' },
    series:     { name: '无穷级数',       short: '级数',     icon: '∑',  color: '#ea580c', semester: 2, track: 'gaoshu' },
    ode2:       { name: '二阶常系数微分方程', short: '二阶方程', icon: 'y″', color: '#b91c1c', semester: 2, track: 'gaoshu' },
    /* 北京高考：按卷面题型分类（选择 / 填空 / 解答） */
    gkChoice:   { name: '高考选择题',     short: '选择题',   icon: '①', color: '#2563eb', track: 'gaokao' },
    gkFill:     { name: '高考填空题',     short: '填空题',   icon: '✎',  color: '#0891b2', track: 'gaokao' },
    gkSolve:    { name: '高考解答题',     short: '解答题',   icon: '✍',  color: '#7c3aed', track: 'gaokao' }
  };

  var TRACKS = {
    gaoshu: { name: '高数', desc: '大学高等数学（大一上 / 大一下）' },
    gaokao: { name: '北京高考', desc: '北京高考数学 · 选择/填空/解答' }
  };

  var SEMESTERS = {
    1: { name: '大一上', desc: '一元微积分：极限、导数、积分、微分方程' },
    2: { name: '大一下', desc: '多元微积分与级数：向量、多元微分、重积分、曲线积分、级数、二阶方程' }
  };

  function typesOfSemester(sem) {
    return Object.keys(TYPES).filter(function (t) { return TYPES[t].semester === sem; });
  }

  function typesOfTrack(track) {
    return Object.keys(TYPES).filter(function (t) { return TYPES[t].track === track; });
  }

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
  // opts.forms: 题目形式过滤 ['choice','solution','proof']；空 = 不限
  //   优先级：同难度+同形式 → 同题型任意难度+同形式 → 同题型任意形式
  //   说明：只选"解答/证明"时，解答与证明互相兜底（都是笔答题），绝不掉回选择题
  function generate(opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var avoid = opts.avoid || [];
    var forms = opts.forms || [];
    var onlyWritten = forms.length > 0 && forms.indexOf('choice') < 0;
    function formOk(t) {
      if (!forms.length) return true;
      var f = t.form || 'choice';
      if (forms.indexOf(f) >= 0) return true;
      if (onlyWritten && (f === 'solution' || f === 'proof')) return true; // 解答/证明互相兜底
      return false;
    }

    var pool = templatesOf(opts.typeId, opts.difficulty).filter(formOk);
    if (!pool.length && forms.length) {
      // 该难度没有这种形式的题：到同题型的其它难度里找同形式
      pool = templates.filter(function (t) { return t.type === opts.typeId && formOk(t); });
    }
    if (!pool.length) {
      var order = ['easy', 'medium', 'hard'];
      var idx = order.indexOf(opts.difficulty);
      for (var d = 1; d <= 2; d++) {
        if (idx - d >= 0 && templatesOf(opts.typeId, order[idx - d]).filter(formOk).length) { pool = templatesOf(opts.typeId, order[idx - d]).filter(formOk); break; }
        if (idx + d < order.length && templatesOf(opts.typeId, order[idx + d]).filter(formOk).length) { pool = templatesOf(opts.typeId, order[idx + d]).filter(formOk); break; }
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
    q.tech = tpl.tech || '';
    q.form = tpl.form || 'choice';             // choice 选择题 | solution 解答题 | proof 证明题 | fill 填空题
    q.kind = tpl.kind || (tpl.form === 'fill' ? 'fill'
      : (tpl.form && tpl.form !== 'choice') ? 'solve' : 'choice');
    q.options = q.options || [];
    q.answerIndex = (typeof q.answerIndex === 'number') ? q.answerIndex : -1;
    return q;
  }

  /* ---------- 导出 ---------- */
  return {
    types: TYPES,
    tracks: TRACKS,
    semesters: SEMESTERS,
    typesOfSemester: typesOfSemester,
    typesOfTrack: typesOfTrack,
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
