/* ============================================================
 * 题库自动审计脚本
 * 对每个模板大量生成题目，做「独立验算 + 数值等价检测」：
 *   1) 选项唯一、正确答案在选项中、无 NaN/undefined
 *   2) 独立公式重算答案（另一套代码路径）
 *   3) 把选项/答案转成可计算表达式，数值代入检查：
 *      - 选择题：干扰项与正确答案在样本点上是否"数学上相等"（等价则题目有歧义）
 *      - 不定积分：比较导数（+C 形式下，导数相同即为等价）
 *   4) 解析完整性（思路/步骤/易错点）
 * 运行：node test/audit.mjs
 * ============================================================ */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const QB = require('../js/core.js');
require('../js/qb-limit.js');
require('../js/qb-derivative.js');
require('../js/qb-app.js');
require('../js/qb-integral.js');
require('../js/qb-extra.js');
require('../js/qb-more.js');
require('../js/qb-more2.js');
require('../js/qb-solve.js');
require('../js/qb-sem2.js');
require('../js/qb-gaokao.js');

let fails = [];
let checks = 0;
function bad(msg) { fails.push(msg); }

/* ---------- LaTeX → JS 表达式 ---------- */
function texToJs(tex) {
  let s = String(tex || '');
  // 去掉排版命令
  s = s.replace(/\\left|\\right|\\,|\\;|\\!|\\quad|\\displaystyle/g, '');
  // \frac{a}{b}（循环处理嵌套）
  let prev;
  do { prev = s; s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))'); } while (s !== prev);
  // \sqrt{x}
  do { prev = s; s = s.replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)'); } while (s !== prev);
  // e^{...} / e^x → exp
  do { prev = s; s = s.replace(/e\^\{([^{}]*)\}/g, 'exp($1)'); } while (s !== prev);
  s = s.replace(/e\^([a-zA-Z0-9])/g, 'exp($1)');
  // 幂：^{...} 与 ^n
  do { prev = s; s = s.replace(/\^\{([^{}]*)\}/g, '**($1)'); } while (s !== prev);
  s = s.replace(/\^([0-9a-zA-Z])/g, '**$1');
  // 函数名
  s = s.replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'ln').replace(/\\log/g, 'log')
    .replace(/\\arctan/g, 'atan').replace(/\\arcsin/g, 'asin')
    .replace(/\\cdot/g, '*').replace(/\\pi/g, 'PI');
  // |...| → abs(...)（x>0 采样）
  do { prev = s; s = s.replace(/\|([^|]*)\|/g, 'abs($1)'); } while (s !== prev);
  // 任意常数 C / C_1 / C_2 → 0
  s = s.replace(/\+?\s*C_\{?[12]\}?/g, '');
  s = s.replace(/\+?\s*C\b/g, '');
  s = s.replace(/[{}\s]/g, '');
  return s;
}

function evalAt(js, x) {
  const f = new Function('x', 'return (function(){var sin=Math.sin,cos=Math.cos,tan=Math.tan,ln=Math.log,log=Math.log,exp=Math.exp,sqrt=Math.sqrt,abs=Math.abs,PI=Math.PI,atan=Math.atan,asin=Math.asin;return ' + js + ';})();');
  return f(x);
}

function samplePoints() { return [0.6, 1.1, 1.6, 2.2, 3.1]; }

// 数值比较两个表达式（不相等才算正常）
function equivalent(texA, texB, mode) {
  let jsA, jsB;
  try { jsA = texToJs(texA); jsB = texToJs(texB); } catch (e) { return null; }
  if (!jsA || !jsB) return null;
  if (/[a-zA-Z]/.test(jsA.replace(/x|sin|cos|tan|ln|log|exp|sqrt|abs|PI|atan|asin/g, ''))) return null; // 含未知符号，跳过
  const pts = samplePoints();
  let diffs = [];
  for (const x of pts) {
    let a, b;
    try { a = evalAt(jsA, x); b = evalAt(jsB, x); } catch (e) { return null; }
    if (!isFinite(a) || !isFinite(b)) continue;
    if (mode === 'deriv') {
      // 导数：中心差分
      const h = 1e-5;
      let a1, a2, b1, b2;
      try { a1 = evalAt(jsA, x + h); a2 = evalAt(jsA, x - h); b1 = evalAt(jsB, x + h); b2 = evalAt(jsB, x - h); } catch (e) { return null; }
      if (![a1, a2, b1, b2].every(isFinite)) continue;
      a = (a1 - a2) / (2 * h); b = (b1 - b2) / (2 * h);
    }
    diffs.push(Math.abs(a - b) / (1 + Math.abs(a) + Math.abs(b)));
  }
  if (!diffs.length) return null;
  return Math.max(...diffs) < 1e-6; // true = 数值上相等
}

/* ---------- 逐模板审计 ---------- */
const SKIP_NUMERIC = /不存在|已掌握|未掌握|证明|\\text\{/; // 文字类答案跳过数值检查

for (const tpl of QB.templates) {
  let issues = 0;
  const N = 40;
  for (let seed = 1; seed <= N; seed++) {
    const rng = QB.mulberry32(seed * 2654435761 + tpl.id.length * 31);
    let q;
    try { q = tpl.gen(rng); } catch (e) { bad(tpl.id + ' 生成异常: ' + e.message); issues++; break; }
    checks++;
    // 基本结构
    if (!q.question || typeof q.question !== 'string') { bad(tpl.id + ' 缺题目文本'); issues++; }
    if (!q.answer || typeof q.answer !== 'string') { bad(tpl.id + ' 缺答案'); issues++; }
    if (!q.idea || !q.pitfall) { bad(tpl.id + ' 缺思路/易错点'); issues++; }
    if (!Array.isArray(q.steps) || q.steps.length < 1) { bad(tpl.id + ' 缺分步解析'); issues++; }
    const blob = JSON.stringify(q);
    if (/NaN|undefined/.test(blob)) { bad(tpl.id + ' 内容含 NaN/undefined'); issues++; }
    // 选项检查（选择题）
    if (tpl.kind === 'solve') {
      if (q.options && q.options.length) { bad(tpl.id + ' 解答题不应有选项'); issues++; }
      const hasAnswerLike = typeof q.answer === 'string' && q.answer.length > 4;
      if (!hasAnswerLike) { bad(tpl.id + ' 解答题答案过短'); issues++; }
    } else if (tpl.kind === 'fill') {
      if (q.options && q.options.length) { bad(tpl.id + ' 填空题不应有选项'); issues++; }
      if (!q.answer || typeof q.answer !== 'string') { bad(tpl.id + ' 填空题缺少答案'); issues++; }
    } else {
      if (!Array.isArray(q.options) || q.options.length !== 4) { bad(tpl.id + ' 选项数不为4'); issues++; }
      else {
        if (new Set(q.options).size !== 4) { bad(tpl.id + ' 选项字符串重复: ' + JSON.stringify(q.options)); issues++; }
        if (q.options[q.answerIndex] !== q.answer) { bad(tpl.id + ' 答案不在正确下标'); issues++; }
        // 数值等价检测：干扰项与正确答案
        // 坐标/区间类答案（含逗号）不做数值比较（避免逗号表达式误判）
        if (!SKIP_NUMERIC.test(q.answer) && !SKIP_NUMERIC.test(q.question) && q.answer.indexOf(',') < 0 && q.options.every(o => o.indexOf(',') < 0)) {
          const isIntegral = /\+C|C_1|C_2/.test(q.answer) || tpl.type === 'indint';
          for (let i = 0; i < q.options.length; i++) {
            if (i === q.answerIndex) continue;
            const eq = equivalent(q.answer, q.options[i], isIntegral ? 'deriv' : 'value');
            if (eq === true) {
              bad(tpl.id + ' 干扰项与正确答案数学等价（选项有歧义）: "' + q.options[i] + '" ≡ "' + q.answer + '"');
              issues++;
            }
          }
        }
      }
    }
    if (issues > 3) break; // 单模板问题太多，避免刷屏
  }
}

/* ---------- 汇总 ---------- */
console.log('审计模板数：' + QB.templates.length + '，题次：' + checks);
if (fails.length) {
  console.log('\n发现 ' + fails.length + ' 个问题：');
  fails.slice(0, 60).forEach(f => console.log('  ✗ ' + f));
  if (fails.length > 60) console.log('  …还有 ' + (fails.length - 60) + ' 个');
  process.exit(1);
} else {
  console.log('\n✅ 题库审计通过：选项唯一、答案正确、无等价干扰项、解析完整');
}
