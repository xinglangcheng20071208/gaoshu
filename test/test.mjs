/* ============================================================
 * 高数刷题营 - Node 自测脚本
 * 1) 对全部模板大规模生成题目，用独立公式重算答案（验证正确率）
 * 2) 验证 4 个选项互不相同、正确答案在选项中
 * 3) 验证每个题型覆盖三个难度
 * 4) 验证复习调度规则（7天/2天/连续2天）
 * 运行：node test/test.mjs
 * ============================================================ */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const QB = require('../js/core.js');
require('../js/qb-limit.js');
require('../js/qb-derivative.js');
require('../js/qb-app.js');
require('../js/qb-integral.js');
require('../js/qb-extra.js');
const S = require('../js/scheduler.js');

/* ---------- 独立的小工具（与 core.js 分开实现） ---------- */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  if (n === 0) return '0';
  const g = gcd(n, d); n /= g; d /= g;
  const neg = n < 0; n = Math.abs(n); d = Math.abs(d);
  if (d === 1) return (neg ? '-' : '') + n;
  return (neg ? '-' : '') + '\\frac{' + n + '}{' + d + '}';
}
function num(x) { return Number(x.toFixed(5)).toString(); }
function signed(x) { if (x === 0) return ''; return (x > 0 ? '+' : '-') + Math.abs(x); }
function sb(s, x) { return s + signed(x); } // 带符号拼接

/* ---------- 每个模板的独立答案验证器 ---------- */
const V = {
  'limit-L1': q => String(q.params.a - q.params.b),
  'limit-L2': q => String(q.params.a * q.params.c * q.params.c + q.params.b * q.params.c + q.params.d),
  'limit-L3': q => String(q.params.k),
  'limit-L4': q => frac(q.params.k * q.params.k, 2),
  'limit-L5': q => 'e^{' + q.params.a + '}',
  'limit-L6': q => frac(1, 2 * Math.sqrt(q.params.a)),
  'limit-L7': () => '\\frac{1}{2}',
  'limit-L8': () => '\\frac{1}{2}',
  'limit-L9': () => '无穷间断点（第二类）',
  'limit-L10': () => '0',
  'limit-L11': q => frac(q.params.a, q.params.d),
  'limit-L12': q => '\\ln ' + q.params.a,
  'limit-L13': q => String(q.params.a - q.params.b),

  'derivative-D1': q => String(q.params.n * Math.pow(q.params.c, q.params.n - 1)),
  'derivative-D2': q => q.params.k + '\\cos(' + q.params.k + 'x)',
  'derivative-D3': q => q.params.k + 'e^{' + q.params.k + 'x}',
  'derivative-D4': () => '\\frac{1}{x}',
  'derivative-D5': q => '(1+' + q.params.k + 'x)e^{' + q.params.k + 'x}',
  'derivative-D6': q => q.params.a === 1 ? '\\frac{xe^{x}}{(x+1)^2}' : '\\frac{(x+' + (q.params.a - 1) + ')e^{x}}{(x+' + q.params.a + ')^2}',
  'derivative-D7': q => (2 * q.params.k) + 'x\\cos(' + q.params.k + 'x^2)',
  'derivative-D8': q => String(6 * q.params.a * q.params.c + 2 * q.params.b),
  'derivative-D9': q => String(3 * q.params.a * q.params.c * q.params.c),
  'derivative-D10': q => frac(-q.params.a, q.params.b),
  'derivative-D11': () => 'x^{x}(\\ln x+1)',
  'derivative-D12': () => '\\sin x',
  'derivative-DF1': q => (q.params.n * Math.pow(q.params.c, q.params.n - 1) * 0.01).toFixed(2),
  'derivative-DF2': q => q.params.k + 'e^{' + q.params.k + 'x}\\mathrm{d}x',
  'derivative-DF3': q => num(q.params.a + 1 / (2 * q.params.a)),
  'derivative-DF4': q => num(1 + 0.01 * q.params.k),
  'derivative-DF5': q => frac(1, 2 * q.params.a),
  'derivative-DF6': q => num(q.params.a + q.params.b / (2 * q.params.a)),
  'derivative-DF7': q => num(0.01 * q.params.k),

  'mvt-A1': q => '(' + q.params.c + ',+\\infty)',
  'mvt-A2': q => String(q.params.b - q.params.a * q.params.a / 4),
  'mvt-A3': q => String(2 * q.params.a * q.params.a * q.params.a),
  'mvt-A4': q => frac(q.params.a + q.params.b, 2),
  'mvt-A5': q => String(q.params.a),
  'mvt-A6': () => '1',

  'indint-I1': q => '\\frac{x^{' + (q.params.n + 1) + '}}{' + (q.params.n + 1) + '}+C',
  'indint-I2': q => '\\frac{e^{' + q.params.k + 'x}}{' + q.params.k + '}+C',
  'indint-I3': q => '\\frac{\\sin(' + q.params.k + 'x)}{' + q.params.k + '}+C',
  'indint-I4': q => q.params.a + '\\ln|x|+C',
  'indint-I5': q => '\\frac{(' + sb(q.params.a + 'x', q.params.b) + ')^{' + (q.params.n + 1) + '}}{' + (q.params.a * (q.params.n + 1)) + '}+C',
  'indint-I6': q => '\\frac{1}{2}\\ln(x^2+' + q.params.a + ')+C',
  'indint-I7': () => '\\frac{1}{2}\\sin^2 x+C',
  'indint-I8': () => '(x-1)e^{x}+C',
  'indint-I9': () => 'x\\sin x+\\cos x+C',
  'indint-I10': () => 'x\\ln x-x+C',
  'indint-I11': () => '\\frac{x}{2}-\\frac{\\sin 2x}{4}+C',
  'indint-I12': q => '\\frac{e^{' + sb(q.params.a + 'x', q.params.b) + '}}{' + q.params.a + '}+C',

  'defint-Df1': q => frac(q.params.k, q.params.n + 1),
  'defint-Df2': q => 'e^{' + q.params.a + '}-1',
  'defint-Df3': () => '2',
  'defint-Df4': () => '0',
  'defint-Df5': q => frac(2 * q.params.a * q.params.a * q.params.a, 3),
  'defint-Df6': () => '\\frac{e-1}{2}',
  'defint-Df7': () => '\\ln 2',
  'defint-Df8': () => '1',
  'defint-Df9': () => '\\pi',
  'defint-Df10': () => '\\frac{\\pi}{4}',

  'defapp-Ap1': q => frac(q.params.k * q.params.a * q.params.a, 2),
  'defapp-Ap2': q => frac(q.params.a * q.params.a * q.params.a, 3),
  'defapp-Ap3': q => frac(q.params.a * q.params.a * q.params.a, 6),
  'defapp-Ap4': q => '\\frac{' + (q.params.a * q.params.a) + '\\pi}{2}',
  'defapp-Ap5': q => '\\frac{' + (q.params.k * q.params.k * q.params.a * q.params.a * q.params.a) + '\\pi}{3}',
  'defapp-Ap6': q => '\\frac{' + Math.pow(q.params.a, 5) + '\\pi}{5}',
  'defapp-Ap7': () => '2',
  'defapp-Ap8': q => frac(2 * q.params.a * Math.sqrt(q.params.a), 3),

  'ode-O1': q => '\\frac{' + q.params.k + 'x^2}{2}+C',
  'ode-O2': () => 'Ce^{x}',
  'ode-O3': q => 'Ce^{' + q.params.k + 'x}',
  'ode-O4': () => 'Cx',
  'ode-O5': q => 'Ce^{' + q.params.k + 'x^2}',
  'ode-O6': q => (q.params.b === 2 ? '1' : '\\frac{3}{2}') + '+Ce^{-2x}',
  'ode-O7': q => q.params.y0 + 'e^{' + q.params.k + 'x}',
  'ode-O8': () => 'C_1x+C_2',
  'ode-O9': q => (q.params.a === 2 ? '' : '2') + 'x^2+x'
};

/* ---------- 测试 1：模板大规模生成 + 独立答案验证 ---------- */
let fails = [];
let checks = 0;

function check(cond, msg) {
  checks++;
  if (!cond) fails.push(msg);
}

for (const tpl of QB.templates) {
  const verify = V[tpl.id];
  if (!verify) { fails.push('缺少验证器: ' + tpl.id); continue; }
  let tplOk = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const rng = QB.mulberry32(seed * 7919 + tpl.id.length * 131);
    let q;
    try {
      q = tpl.gen(rng);          // 直接调用目标模板，保证测的就是这个模板
      q.qid = 't' + seed;
      q.tpl = tpl.id;
      q.typeId = tpl.type;
      q.difficulty = q.difficulty || tpl.difficulty;
    }
    catch (e) { fails.push(tpl.id + ' 生成抛异常: ' + e.message); break; }
    tplOk++;
    // 结构检查
    if (q.options.length !== 4) { fails.push(tpl.id + ' 选项数不为4'); }
    if (new Set(q.options).size !== 4) { fails.push(tpl.id + ' 选项重复: ' + JSON.stringify(q.options)); }
    if (q.options[q.answerIndex] !== q.answer) { fails.push(tpl.id + ' 答案与下标不符'); }
    // 内容检查
    const blob = JSON.stringify(q);
    if (blob.indexOf('NaN') >= 0 || blob.indexOf('undefined') >= 0) { fails.push(tpl.id + ' 内容含 NaN/undefined'); }
    // 独立验证答案
    const expected = verify(q);
    if (expected !== q.answer) {
      fails.push(tpl.id + ' 答案错误: 生成"' + q.answer + '" 独立重算"' + expected + '"');
    }
    // 解析完整性
    if (!q.idea || !q.pitfall || !Array.isArray(q.steps) || q.steps.length < 1) {
      fails.push(tpl.id + ' 缺少思路/步骤/易错点');
    } else {
      q.steps.forEach((st, i) => {
        if (!st || typeof st.m !== 'string' || !st.m || typeof st.t !== 'string' || !st.t) {
          fails.push(tpl.id + ' 第' + (i + 1) + '步缺少数学式或白话解释');
        }
      });
    }
  }
  console.log('  ' + tpl.id.padEnd(18) + ' 难度:' + tpl.difficulty.padEnd(7) + ' 生成 ' + tplOk + ' 道全部校验');
}
console.log('题目生成校验完成：' + QB.templates.length + ' 个模板');

/* ---------- 测试 2：难度覆盖 ---------- */
console.log('\n--- 难度覆盖 ---');
let coverFail = 0;
for (const t of Object.keys(QB.types)) {
  const line = ['easy', 'medium', 'hard'].map(d => QB.templatesOf(t, d).length).join('/');
  const ok = QB.templatesOf(t, 'easy').length >= 1 && QB.templatesOf(t, 'medium').length >= 1 && QB.templatesOf(t, 'hard').length >= 1;
  if (!ok) { coverFail++; fails.push('题型 ' + t + ' 难度覆盖不全（基础/进阶/困难=' + line + '）'); }
  console.log('  ' + t.padEnd(12) + ' 基础/进阶/困难 = ' + line + (ok ? ' ✓' : ' ✗'));
}

/* ---------- 测试 3：调度器规则 ---------- */
console.log('\n--- 调度规则 ---');
const D = '2026-10-27';
const d1 = S.addDays(D, 1), d2 = S.addDays(D, 2), d3 = S.addDays(D, 3), d6 = S.addDays(D, 6), d7 = S.addDays(D, 7);

// 未掌握：连续 2 天
let ts = S.applyMark({}, 'not_mastered', D);
check(ts.nmDays === 1, '未掌握标记后 nmDays 应为 1');
check(S.dueInfo(ts, d1).due === true, '未掌握第2天应到期');
ts = S.afterShow(ts, d1);
check(S.dueInfo(ts, d2).due === false, '未掌握连续2天后第3天不应再连续');
check(S.dueInfo(ts, d3).due === true, '未掌握之后按2天节奏，第4天应到期');

// 不熟练：2 天
ts = S.applyMark({}, 'wobbly', D);
check(S.dueInfo(ts, d1).due === false, '不熟练第2天不应到期');
check(S.dueInfo(ts, d2).due === true, '不熟练第3天应到期（间隔2天）');

// 已掌握：7 天
ts = S.applyMark({}, 'mastered', D);
check(S.dueInfo(ts, d6).due === false, '已掌握第7天不应到期');
check(S.dueInfo(ts, d7).due === true, '已掌握第8天应到期（间隔7天）');

// 新题型
check(S.dueInfo(undefined, D).due === true, '未练过题型应到期');
check(S.dueInfo(undefined, D).reason === '新题型·首次接触', '新题型原因文案');

/* ---------- 测试 4：每日组卷 ---------- */
console.log('\n--- 每日组卷 ---');
const set = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(42) });
check(set.questions.length === 10, '每日应生成10题');
check(new Set(set.questions.map(q => q.qid)).size === 10, '同套题 qid 不应重复');
check(Object.keys(set.used).length === 7, '应覆盖全部7个题型');
check(set.questions.every(q => q.difficulty === 'medium'), '所有题难度应为所选难度');

// 未掌握优先
const ts2 = {};
ts2.limit = S.applyMark({}, 'not_mastered', D);
const set2 = S.buildDaily({ typesState: ts2, today: d1, difficulty: 'easy', count: 10, rng: QB.mulberry32(7) });
const firstTypes = set2.questions.slice(0, 2).map(q => q.typeId);
check(firstTypes.indexOf('limit') >= 0, '未掌握题型应排在前两位（连续巩固）: ' + firstTypes.join(','));

// 难度与模板一致
let diffOk = true;
for (const q of set2.questions) {
  const tpl = QB.templates.filter(t => t.id === q.tpl)[0];
  if (tpl.difficulty !== 'easy') diffOk = false;
}
check(diffOk, 'easy 组卷中每题模板难度应均为 easy');

/* ---------- 测试 5：跨天连续性 ---------- */
console.log('\n--- 跨天连续 ---');
const full = {};
for (const t of Object.keys(QB.types)) full[t] = S.applyMark({}, 'not_mastered', D);
const set3 = S.buildDaily({ typesState: full, today: d1, difficulty: 'hard', count: 10, rng: QB.mulberry32(9) });
const used3 = Object.keys(set3.used);
check(used3.length === 7, '全部未掌握时第二天10题应覆盖7个题型');
for (const t of used3) {
  const after = S.afterShow(full[t], d1);
  check(after.nmDays === 2, t + ' 连续第2天后 nmDays 应为 2');
}

/* ---------- 测试 6：专项练习组卷 ---------- */
console.log('\n--- 专项练习组卷 ---');
const c1 = S.buildCustom({ typeIds: ['limit', 'ode'], difficulty: 'easy', count: 6, rng: QB.mulberry32(11) });
check(c1.questions.length === 6, '专项应生成指定数量题目');
check(c1.questions.every(q => q.typeId === 'limit' || q.typeId === 'ode'), '专项只应包含所选题型');
check(c1.questions.every(q => q.difficulty === 'easy'), '指定难度时所有题应为该难度');
check(new Set(c1.questions.map(q => q.qid)).size === 6, '专项套题 qid 不应重复');

const c2 = S.buildCustom({ typeIds: ['limit'], difficulty: 'mixed', count: 60, rng: QB.mulberry32(23) });
const diffSet = new Set(c2.questions.map(q => q.difficulty));
check(diffSet.has('easy') && diffSet.has('medium') && diffSet.has('hard'), '混合难度应覆盖三种难度: ' + [...diffSet].join(','));

const c3 = S.buildCustom({ typeIds: [], difficulty: 'medium', count: 10, rng: QB.mulberry32(31) });
check(Object.keys(c3.used).length === 7, '未选题型时应默认覆盖全部题型');

const c4 = S.buildCustom({ typeIds: ['defapp'], difficulty: 'mixed', count: 8, rng: QB.mulberry32(37) });
check(c4.questions.every(q => q.typeId === 'defapp'), '单选题型专项应全部为该题型');

/* ---------- 汇总 ---------- */
console.log('\n========== 测试汇总 ==========');
console.log('总检查项：' + checks);
console.log('失败项：' + fails.length);
if (fails.length) {
  console.log('\n失败明细：');
  fails.slice(0, 50).forEach(f => console.log('  ✗ ' + f));
  if (fails.length > 50) console.log('  …还有 ' + (fails.length - 50) + ' 条');
  process.exit(1);
} else {
  console.log('✅ 全部通过：77 个模板答案正确率 100%，选项唯一，难度覆盖完整，调度规则符合预期');
}
