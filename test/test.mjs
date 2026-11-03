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
require('../js/qb-more.js');
require('../js/qb-more2.js');
require('../js/qb-solve.js');
require('../js/qb-sem2.js');
require('../js/qb-gaokao.js');
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
  'ode-O9': q => (q.params.a === 2 ? '' : '2') + 'x^2+x',

  /* ---- 扩充模板 ---- */
  'limit-L14': q => frac(q.params.a, q.params.b),
  'limit-L15': () => '0',
  'limit-L16': q => frac(q.params.a, q.params.b),
  'limit-L17': q => 'e^{' + (2 * q.params.k) + '}',
  'derivative-D13': q => 'e^{' + q.params.k + 'x}(' + q.params.k + '\\sin x+\\cos x)',
  'derivative-D14': q => '\\frac{' + q.params.k + '}{1+' + (q.params.k * q.params.k) + 'x^2}',
  'derivative-D15': q => String(Math.pow(2, q.params.n)),
  'indint-I13': q => '\\frac{' + q.params.a + 'x^{' + (q.params.n + 1) + '}}{' + (q.params.n + 1) + '}+C',
  'indint-I14': q => '\\frac{1}{3}\\ln(x^3+' + q.params.a + ')+C',
  'indint-I15': q => '\\frac{e^{' + q.params.k + 'x}(' + q.params.k + 'x-1)}{' + (q.params.k * q.params.k) + '}+C',
  'indint-I16': q => '\\frac{\\sin^2(' + q.params.a + 'x)}{' + (2 * q.params.a) + '}+C',
  'defint-Df11': () => '1',
  'defint-Df12': () => '1',
  'defint-Df13': q => frac(q.params.k * q.params.a * q.params.a * q.params.a, 3),
  'defint-Df14': () => '\\frac{1}{2}\\ln 2',
  'mvt-A7': q => '(-' + q.params.a + ',' + q.params.a + ')',
  'mvt-A8': () => '0',
  'defapp-Ap9': () => '1',
  'defapp-Ap10': () => 'e-1',
  'ode-O10': () => 'x^3+C_1x+C_2',
  'ode-O11': () => '\\frac{e^{x}}{2}+Ce^{-x}',
  'ode-O12': q => q.params.a === 1 ? '\\sin x' : '\\sin x' + signed(q.params.a - 1),

  /* ---- 扩充模板 ②（例题拆分/归类） ---- */
  'limit-L18': q => frac(q.params.a, q.params.b),
  'limit-L19': q => String(q.params.a),
  'limit-L20': q => frac(q.params.a, 2),
  'limit-L21': () => '不存在',
  'limit-L22': () => '-\\frac{1}{6}',
  'derivative-D16': q => q.params.k + 'x^{' + (q.params.k - 1) + '}\\ln x+x^{' + (q.params.k - 1) + '}',
  'derivative-D17': q => 'y=' + (2 * q.params.a) + 'x-' + (q.params.a * q.params.a),
  'derivative-D18': () => '-1',
  'derivative-D19': () => '\\sin 2x',
  'mvt-A9': q => String(2 * q.params.a * q.params.a * q.params.a),
  'mvt-A10': () => '1',
  'indint-I17': q => '\\frac{' + q.params.a + 'x^2}{2}+' + q.params.b + 'x+C',
  'indint-I19': q => '\\frac{1}{3}(x^2+' + q.params.a + ')^{3/2}+C',
  'indint-I20': () => '2e^{\\sqrt{x}}+C',
  'indint-I21': () => '\\frac{x}{2}+\\frac{\\sin 2x}{4}+C',
  'indint-I22': () => '(x^2-2x+2)e^{x}+C',
  'defint-Df15': q => frac(q.params.a - 1, q.params.a),
  'defint-Df16': q => String(q.params.a / 2 + q.params.b),
  'defint-Df17': () => '\\frac{2}{3}',
  'defint-Df18': () => '\\frac{\\pi}{4}',
  'defapp-Ap13': () => '\\frac{1}{6}',
  'defapp-Ap14': () => '\\frac{\\pi^2}{2}',
  'ode-O13': q => '\\frac{e^{' + q.params.k + 'x}}{' + q.params.k + '}+C',
  'ode-O14': q => 'x^2' + (() => { const s = q.params.b - q.params.a * q.params.a; return s === 0 ? '' : (s > 0 ? '+' : '') + s; })(),
  'ode-O15': q => 'e^{' + q.params.k + 'x^2}',

  /* ---- 解答题 / 证明题（无选项，点「已完成」看答案） ---- */
  'solve-S1': () => '对任意 $\\varepsilon>0$，取 $\\delta=\\frac{\\varepsilon}{3}$，当 $0<|x-2|<\\delta$ 时，$|(3x-1)-5|=3|x-2|<3\\delta=\\varepsilon$，故 $\\lim\\limits_{x\\to 2}(3x-1)=5$。',
  'solve-S2': () => '令 $f(x)=x^3-3x+1$，它在 $[0,1]$ 上连续，且 $f(0)=1>0$、$f(1)=-1<0$，由零点定理，存在 $\\xi\\in(0,1)$ 使 $f(\\xi)=0$，即方程在 $(0,1)$ 内至少有一个根。',
  'solve-S3': () => '$f$ 在 $[0,1]$ 与 $[1,2]$ 上分别满足罗尔定理条件（连续、可导、端点值相等），故存在 $c_1\\in(0,1)$、$c_2\\in(1,2)$ 使 $f\\prime(c_1)=f\\prime(c_2)=0$，且 $c_1\\neq c_2$。',
  'solve-S4': () => '令 $f(x)=x-\\sin x$，则 $f\\prime(x)=1-\\cos x\\ge 0$，且等号只在孤立点成立，故 $f$ 在 $[0,+\\infty)$ 上严格单调递增；又 $f(0)=0$，所以 $x>0$ 时 $f(x)>0$，即 $\\sin x<x$。',
  'solve-S5': () => '极大值 $f(0)=0$，极小值 $f(2)=-4$。',
  'solve-S6': () => '$y\\prime\\prime=6x$：$x<0$ 时 $y\\prime\\prime<0$，曲线凹向下；$x>0$ 时 $y\\prime\\prime>0$，曲线凹向上；拐点为 $(0,0)$。',
  'solve-S7': () => '$\\int x e^{2x}\\mathrm{d}x = \\frac{e^{2x}}{4}(2x-1)+C$。',
  'solve-S8': () => '令 $u=x^2$，$\\mathrm{d}u=2x\\mathrm{d}x$，则 $\\int_0^1 x e^{x^2}\\mathrm{d}x=\\frac{1}{2}\\int_0^1 e^u\\mathrm{d}u=\\frac{e-1}{2}$。',
  'solve-S9': () => '$\\int_{-a}^{a}f(x)\\mathrm{d}x=\\int_{-a}^{0}f(x)\\mathrm{d}x+\\int_{0}^{a}f(x)\\mathrm{d}x$，对第一个积分令 $x=-t$，得 $\\int_{0}^{a}f(-t)\\mathrm{d}t=-\\int_{0}^{a}f(t)\\mathrm{d}t$，与第二个积分相消，故原积分为 0。',
  'solve-S10': () => '$V=\\pi\\int_0^1(\\sqrt{x})^2\\mathrm{d}x=\\pi\\int_0^1 x\\,\\mathrm{d}x=\\frac{\\pi}{2}$。',
  'solve-S11': () => '$\\int_0^2(2x-x^2)\\mathrm{d}x=\\left[x^2-\\frac{x^3}{3}\\right]_0^2=4-\\frac{8}{3}=\\frac{4}{3}$。',
  'solve-S12': () => '通解 $y=x^2+C$；代入 $y(0)=1$ 得 $C=1$，故 $y=x^2+1$。',
  'solve-S13': () => '积分因子 $e^{x}$，两边同乘得 $(ye^{x})\\prime=e^{2x}$，积分得 $ye^{x}=\\frac{e^{2x}}{2}+C$，故 $y=\\frac{e^{x}}{2}+Ce^{-x}$。',

  /* ---- 大一下：向量与空间解析几何 ---- */
  'vector-V1': q => String(q.params.a1 * q.params.b1 + q.params.a2 * q.params.b2 + q.params.a3 * q.params.b3),
  'vector-V2': q => String(q.params.A * q.params.B * (q.params.deg === 60 ? 0.5 : -0.5)),
  'vector-V3': q => q.params.a + '(x-' + q.params.x0 + ')' + signed(q.params.b) + '(y-' + q.params.y0 + ')' + signed(q.params.c) + '(z-' + q.params.z0 + ')=0',
  'vector-V4': () => '平行（直线不在平面内）',
  'vector-V5': q => frac(Math.abs(q.params.px + 2 * q.params.py + 2 * q.params.pz - q.params.k), 3),

  /* ---- 大一下：多元函数微分学 ---- */
  'multivar-M1': q => String(2 * q.params.a * q.params.b + q.params.b * q.params.b),
  'multivar-M2': () => '(2x+y)\\mathrm{d}x+(x+2y)\\mathrm{d}y',
  'multivar-M3': q => frac(-q.params.a, q.params.c),
  'multivar-M4': q => '(' + q.params.a + ',' + q.params.b + ')',
  'multivar-M5': q => String(q.params.s * q.params.s / 2),
  'multivar-M6': q => Math.pow(q.params.a, q.params.b) + '\\ln ' + q.params.a,

  /* ---- 大一下：重积分 ---- */
  'doubleint-DI1': q => String(q.params.c * q.params.a * q.params.b),
  'doubleint-DI2': q => frac(q.params.a * q.params.a * q.params.b, 2),
  'doubleint-DI3': () => '\\int_0^1\\mathrm{d}y\\int_0^{y}f(x,y)\\,\\mathrm{d}x',
  'doubleint-DI4': q => { const a = q.params.a; return a === 1 ? '\\frac{\\pi}{2}' : (a * a * a * a / 2) + '\\pi'; },
  'doubleint-DI5': () => '(e-1)^2',

  /* ---- 大一下：曲线积分与格林公式 ---- */
  'lineint-L1': q => String(q.params.len),
  'lineint-L2': q => frac(q.params.a * q.params.a, 2),
  'lineint-L3': q => (2 * q.params.a * q.params.a) + '\\pi',
  'lineint-L4': () => '\\frac{\\partial P}{\\partial y}=\\frac{\\partial Q}{\\partial x}',

  /* ---- 大一下：无穷级数 ---- */
  'series-S1': q => frac(1, q.params.qn - 1),
  'series-S2': () => 'p>1',
  'series-S3': () => '1',
  'series-S4': () => '收敛',
  'series-S5': () => '+\\infty',
  'series-S6': () => '(-1,3)',

  /* ---- 大一下：二阶常系数微分方程 ---- */
  'ode2-O21': q => 'C_1e^{' + q.params.r1 + 'x}+C_2e^{' + q.params.r2 + 'x}',
  'ode2-O22': q => '(C_1+C_2x)e^{' + q.params.k + 'x}',
  'ode2-O23': () => 'C_1\\cos x+C_2\\sin x',
  'ode2-O24': () => '(C_1+C_2x)e^{-x}',
  'ode2-O25': () => 'y^*=x',

  /* ---- 大一下：三重积分 ---- */
  'tripleint-TI1': q => String(q.params.c * q.params.a * q.params.b * q.params.d0),
  'tripleint-TI2': () => '2',
  'tripleint-TI3': q => (q.params.a === 1 ? (q.params.h === 2 ? '\\pi' : '\\frac{3}{2}\\pi') : (q.params.h === 2 ? '16\\pi' : '24\\pi')),

  /* ---- 大一下：解答/证明题（无选项） ---- */
  'solve-SV1': () => '设 $\\vec{a}=(a_1,a_2,a_3)$，则 $\\vec{a}\\cdot\\vec{a}=a_1^2+a_2^2+a_3^2=|\\vec{a}|^{2}$，证毕。',
  'solve-SV2': () => '$\\mathrm{d}z=2xy\\,\\mathrm{d}x+x^2\\,\\mathrm{d}y$，在 $(1,2)$ 处 $\\mathrm{d}z=4\\,\\mathrm{d}x+\\mathrm{d}y$。',
  'solve-SV3': () => '$\\int_0^2\\mathrm{d}y\\int_0^1 x\\,\\mathrm{d}x=2\\cdot\\frac{1}{2}=1$。',
  'solve-SV4': () => '参数化 $x=t,\\ y=t$（$0\\le t\\le1$），$\\mathrm{d}s=\\sqrt2\\,\\mathrm{d}t$，故 $\\int_L x\\,\\mathrm{d}s=\\sqrt2\\int_0^1 t\\,\\mathrm{d}t=\\frac{\\sqrt2}{2}$。',
  'solve-SV5': () => '当 $n\\ge2$ 时 $\\frac{1}{n^2}\\le\\frac{1}{n(n-1)}=\\frac{1}{n-1}-\\frac{1}{n}$，而 $\\sum\\frac{1}{n(n-1)}$ 收敛（裂项），由比较判别法原级数收敛。',
  'solve-SV6': () => '特征方程 $r^2-1=0$ 得 $r=\\pm1$，故 $y=C_1e^{x}+C_2e^{-x}$。',

  /* ================= 北京高考 ================= */
  'gk-G1': q => '[' + q.params.c + ',2)',
  'gk-G2': q => {
    const a = q.params.a, b = q.params.b;
    const re = (a - b) / 2, im = (a + b) / 2;
    const h = x => {
      if (!x) return '0';
      const neg = x < 0, ax = Math.abs(x);
      const body = (Math.round(ax) === ax) ? String(ax) : '\\frac{' + (ax * 2) + '}{2}';
      return (neg ? '-' : '') + body;
    };
    if (im === 0) return h(re);
    if (re === 0) return (im > 0 ? '' : '-') + h(Math.abs(im)) + 'i';
    return h(re) + (im > 0 ? '+' : '-') + h(Math.abs(im)) + 'i';
  },
  'gk-G3': q => '[' + q.params.a + ',' + q.params.b + ')',
  'gk-G4': () => 'y=\\frac{1}{x}',
  'gk-G5': q => {
    const n = q.params.n, a = q.params.a;
    const slope = n * Math.pow(a, n - 1), y0 = Math.pow(a, n);
    return 'y=' + slope + 'x' + signed(y0 - slope * a);
  },
  'gk-G6': q => q.params.deg === 15 ? '\\frac{1}{2}' : q.params.deg === 30 ? '\\frac{\\sqrt{2}}{2}' : '\\frac{\\sqrt{3}}{2}',
  'gk-G7': q => {
    const a = q.params.a, b = q.params.b, C0 = q.params.C0;
    const c2 = Math.round((a * a + b * b - 2 * a * b * Math.cos(C0 * Math.PI / 180)) * 100) / 100;
    let out = 1, rest = c2;
    for (let i = 2; i * i <= rest; i++) { while (rest % (i * i) === 0) { out *= i; rest /= (i * i); } }
    return rest === 1 ? String(out) : (out === 1 ? '' : String(out)) + '\\sqrt{' + rest + '}';
  },
  'gk-G8': q => String(q.params.a1 + 9 * q.params.d),
  'gk-G9': q => String(q.params.a1 * (Math.pow(q.params.q, 5) - 1) / (q.params.q - 1)),
  'gk-G10': q => String(q.params.m),
  'gk-G11': q => String(6 * q.params.n * q.params.n),
  'gk-G12': q => frac(Math.sqrt(q.params.a2 - q.params.b2), Math.sqrt(q.params.a2)),
  'gk-G13': q => frac(q.params.r * q.params.w, (q.params.r + q.params.w) * (q.params.r + q.params.w - 1) / 2),
  'gk-G14': q => String(2 * q.params.k),
  'gk-G15': () => '若 $a\\perp\\alpha$，$b\\perp\\alpha$，则 $a\\parallel b$',

  /* ---- 高考填空 ---- */
  'gk-F1': () => 'i',
  'gk-F2': () => '(1,+∞)',
  'gk-F3': q => String(10 * q.params.a1 + 45 * q.params.d),
  'gk-F4': () => '20',
  'gk-F5': () => '2',
  'gk-F6': () => '1',
  'gk-F7': () => '-4/5',
  'gk-F8': () => '-2',
  'gk-F9': () => '1',
  'gk-F10': () => '15',

  /* ---- 高考解答 ---- */
  'gk-GS0': () => '由勾股定理 $c=\\sqrt{a^2+b^2}=\\sqrt{3^2+4^2}=5$。',
  'gk-GS1': () => '由正弦定理 $\\frac{a}{\\sin A}=\\frac{b}{\\sin B}$ 得 $\\sin B=\\frac{b\\sin A}{a}=\\frac{1\\cdot\\frac{\\sqrt3}{2}}{\\sqrt3}=\\frac12$，又 $b<a$ 故 $B$ 为锐角，所以 $B=30^{\\circ}$。',
  'gk-GS2': () => '(1) $a_1+2d=5$，$2a_1+5d=12$，解得 $a_1=1,\\ d=2$；(2) $S_{10}=10a_1+45d=10+90=100$。',
  'gk-GS3': () => '$V=\\frac13\\cdot S_{\\triangle ABD}\\cdot AA_1=\\frac13\\cdot\\frac12\\cdot2\\cdot2\\cdot2=\\frac43$。',
  'gk-GS4': () => '圆心到直线距离 $d=\\frac{1}{\\sqrt2}=\\frac{\\sqrt2}{2}$，弦长 $=2\\sqrt{r^2-d^2}=2\\sqrt{4-\\frac12}=\\sqrt{14}$。',
  'gk-GS5': () => '恰有一人命中 = 甲中乙不中 + 甲不中乙中：$0.6\\times0.5+0.4\\times0.5=0.5$。',
  'gk-GS6': () => '$f\\prime(x)=3x^2-6x=3x(x-2)$，驻点 $x=0,2$；比较端点与驻点：$f(0)=2$，$f(2)=-2$，$f(3)=2$，故最大值为 2。'
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
    const isSolve = tpl.kind === 'solve';
    const isFill = tpl.kind === 'fill';
    // 结构检查
    if (isSolve) {
      if (!q.answer || typeof q.answer !== 'string') { fails.push(tpl.id + ' 解答题缺少答案文本'); }
      if (q.options && q.options.length !== 0) { fails.push(tpl.id + ' 解答题不应有选项'); }
      if (q.kind !== undefined && q.kind !== 'solve') { fails.push(tpl.id + ' 解答题 kind 标记错误'); }
      if (!Array.isArray(q.steps) || q.steps.length < 2) { fails.push(tpl.id + ' 解答题解析步骤不足'); }
    } else if (isFill) {
      if (!q.answer || typeof q.answer !== 'string') { fails.push(tpl.id + ' 填空题缺少答案文本'); }
      if (q.options && q.options.length !== 0) { fails.push(tpl.id + ' 填空题不应有选项'); }
      if (!Array.isArray(q.steps) || q.steps.length < 1) { fails.push(tpl.id + ' 填空题解析步骤不足'); }
    } else {
      if (q.options.length !== 4) { fails.push(tpl.id + ' 选项数不为4'); }
      if (new Set(q.options).size !== 4) { fails.push(tpl.id + ' 选项重复: ' + JSON.stringify(q.options)); }
      if (q.options[q.answerIndex] !== q.answer) { fails.push(tpl.id + ' 答案与下标不符'); }
    }
    // 内容检查
    const blob = JSON.stringify(q);
    if (blob.indexOf('NaN') >= 0 || blob.indexOf('undefined') >= 0) { fails.push(tpl.id + ' 内容含 NaN/undefined'); }
    // 技法标签（tech）传递检查
    if (tpl.tech) {
      const viaGen = QB.generate({ typeId: tpl.type, difficulty: tpl.difficulty, rng: QB.mulberry32(seed + 5000) });
      if (viaGen.tech === undefined) { fails.push(tpl.id + ' 经 generate 后缺少 tech 字段'); }
      if (q.tech === undefined) { /* 直接调用 gen 不含 tech，属正常 */ }
    }
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
check(Object.keys(set.used).length === 10, '10 题应覆盖 10 个题型');
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
check(used3.length === 10, '全部未掌握时第二天10题应覆盖10个题型');
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

/* ---------- 测试 6.5：每日练习按自选题型组卷 ---------- */
console.log('\n--- 每日自选题型 ---');
const sel1 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(41), typeIds: ['limit', 'mvt'] });
check(sel1.questions.length === 10, '按题型组卷应生成 10 题');
check(sel1.questions.every(q => q.typeId === 'limit' || q.typeId === 'mvt'), '每日组卷只应包含所选题型');
const sel2 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 6, rng: QB.mulberry32(43), typeIds: ['indint'] });
check(sel2.questions.every(q => q.typeId === 'indint'), '单选题型组卷应全部为该题型');
const sel3 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(45) });
check(Object.keys(sel3.used).length === 10, '未选题型时应保持覆盖 10 个题型');

/* ---------- 测试 6.6：按题型形式组卷（选择题/解答题/证明题） ---------- */
console.log('\n--- 题型形式 ---');
const GS_TYPES = QB.typesOfSemester(1).concat(QB.typesOfSemester(2));   // 高数章节（形式筛选只用于高数）
const form1 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(47), typeIds: GS_TYPES, forms: ['solution', 'proof'] });
check(form1.questions.every(q => q.form === 'solution' || q.form === 'proof'), '只选解答/证明题时不应出现选择题: ' + form1.questions.map(q => q.form).join(','));
const form2 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(49), typeIds: GS_TYPES, forms: ['choice'] });
check(form2.questions.every(q => q.form === 'choice'), '只选选择题时不应出现解答/证明题');
const form3 = S.buildCustom({ typeIds: ['limit', 'mvt'], difficulty: 'medium', count: 6, rng: QB.mulberry32(51), forms: ['proof'] });
check(form3.questions.every(q => q.form !== 'choice'), '专项只选证明题时不应出现选择题: ' + form3.questions.map(q => q.form).join(','));
const form4 = S.buildCustom({ typeIds: ['defapp'], difficulty: 'mixed', count: 5, rng: QB.mulberry32(53), forms: ['solution'] });
check(form4.questions.every(q => q.form === 'solution'), '专项只选解答题时应全部为解答题');
// 只选"证明题"时，没有证明题模板的章节应回退为解答题（笔答题），绝不回退为选择题
const form5 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(55), typeIds: GS_TYPES, forms: ['proof'] });
check(form5.questions.every(q => q.form !== 'choice'), '只选证明题时不应出现选择题（可用解答题兜底）: ' + form5.questions.map(q => q.form).join(','));
const form6 = S.buildCustom({ typeIds: ['indint'], difficulty: 'medium', count: 5, rng: QB.mulberry32(57), forms: ['proof'] });
check(form6.questions.every(q => q.form !== 'choice'), '无证明题模板的章节应回退为解答题而非选择题: ' + form6.questions.map(q => q.form).join(','));

/* ---------- 测试 6.8：北京高考板块 ---------- */
console.log('\n--- 北京高考板块 ---');
check(QB.typesOfTrack('gaokao').length === 3, '高考应有 3 种卷面题型，实际 ' + QB.typesOfTrack('gaokao').length);
check(QB.typesOfTrack('gaoshu').length === 14, '高数应有 14 个章节，实际 ' + QB.typesOfTrack('gaoshu').length);
const gkDaily = S.buildGaokaoDaily({ typesState: {}, today: D, difficulty: 'medium', rng: QB.mulberry32(71) });
check(gkDaily.questions.length === 10, '高考每日应 10 题，实际 ' + gkDaily.questions.length);
const gkKinds = gkDaily.questions.map(q => q.kind);
check(gkKinds.filter(k => k === 'choice').length === 6, '高考每日应 6 道选择');
check(gkKinds.filter(k => k === 'fill').length === 3, '高考每日应 3 道填空');
check(gkKinds.filter(k => k === 'solve').length === 1, '高考每日应 1 道解答');
check(gkDaily.questions.every(q => QB.types[q.typeId].track === 'gaokao'), '高考套题只能包含高考题型');
const gkCustom = S.buildCustom({ typeIds: ['gkChoose', 'gkFill'], difficulty: 'mixed', count: 8, rng: QB.mulberry32(73) });
// 注意：typeIds 里混入无效 id 时应被过滤（此处只验证有效题型过滤逻辑）
const gkCustom2 = S.buildCustom({ typeIds: ['gkFill'], difficulty: 'mixed', count: 6, rng: QB.mulberry32(75) });
check(gkCustom2.questions.length === 6 && gkCustom2.questions.every(q => q.typeId === 'gkFill'), '高考专项（填空）应全部为填空题');
// 大一上 7 个章节都至少有一种解答/证明题（保证"只选解答题"时这些章节都有得练）
for (const t of QB.typesOfSemester(1)) {
  const anySolve = QB.templates.some(tpl => tpl.type === t && (tpl.form === 'solution' || tpl.form === 'proof'));
  check(anySolve, '题型 ' + t + ' 缺少解答/证明题模板');
}

const c2 = S.buildCustom({ typeIds: ['limit'], difficulty: 'mixed', count: 60, rng: QB.mulberry32(23) });
const diffSet = new Set(c2.questions.map(q => q.difficulty));
check(diffSet.has('easy') && diffSet.has('medium') && diffSet.has('hard'), '混合难度应覆盖三种难度: ' + [...diffSet].join(','));

const c3 = S.buildCustom({ typeIds: [], difficulty: 'medium', count: 10, rng: QB.mulberry32(31) });
check(Object.keys(c3.used).length === 10, '未选题型时应默认覆盖 10 个题型');

const c4 = S.buildCustom({ typeIds: ['defapp'], difficulty: 'mixed', count: 8, rng: QB.mulberry32(37) });
check(c4.questions.every(q => q.typeId === 'defapp'), '单选题型专项应全部为该题型');

/* ---------- 测试 6.7：学期选择 ---------- */
console.log('\n--- 学期选择 ---');
check(QB.typesOfSemester(1).length === 7, '大一上应有 7 个章节，实际 ' + QB.typesOfSemester(1).length);
check(QB.typesOfSemester(2).length === 7, '大一下应有 7 个章节，实际 ' + QB.typesOfSemester(2).length);
const sem2 = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(61), typeIds: QB.typesOfSemester(2) });
check(sem2.questions.every(q => QB.typesOfSemester(2).indexOf(q.typeId) >= 0), '按大一下组卷应只包含大一下章节: ' + sem2.questions.map(q => q.typeId).join(','));
check(Object.keys(sem2.used).length === 7, '大一下 10 题应覆盖 7 个章节，实际 ' + Object.keys(sem2.used).length);
const sem2c = S.buildCustom({ typeIds: QB.typesOfSemester(2), difficulty: 'mixed', count: 12, rng: QB.mulberry32(63) });
check(sem2c.questions.every(q => QB.typesOfSemester(2).indexOf(q.typeId) >= 0), '专项（大一下）组卷应只包含大一下章节');
// 大一下每章都覆盖三个难度
for (const t of QB.typesOfSemester(2)) {
  const ds = ['easy', 'medium', 'hard'].map(dd => QB.templatesOf(t, dd).length);
  check(ds.every(n => n >= 1), '大一下章节 ' + t + ' 难度覆盖不全: ' + ds.join('/'));
}

/* ---------- 测试 7：举一反三去重 ---------- */
console.log('\n--- 举一反三去重 ---');
// 7.1 生成器 avoid：避开指定原题标签后，生成的一定不是原题
//     （纯固定题模板——参数为空——本身无法生成"不同题"，跳过）
let avoidOk = true;
for (const tpl of QB.templates) {
  const pool = QB.templatesOf(tpl.type, tpl.difficulty);
  const hasVariation = pool.some(t => {
    try { return Object.keys(t.gen(QB.mulberry32(777)).params || {}).length > 0; } catch (e) { return false; }
  });
  if (!hasVariation) continue;
  const rng0 = QB.mulberry32(555);
  const q0 = tpl.gen(rng0);
  q0.qid = 'x'; q0.tpl = tpl.id; q0.typeId = tpl.type;
  q0.sig = QB.sigOf(tpl.id, q0.params);
  for (let i = 0; i < 8; i++) {
    const qv = QB.generate({ typeId: tpl.type, difficulty: tpl.difficulty, rng: QB.mulberry32(600 + i * 97), avoid: [q0.sig] });
    if (qv.sig === q0.sig) { avoidOk = false; fails.push(tpl.id + ' avoid 后仍生成原题 ' + q0.sig); break; }
  }
}
check(avoidOk, '全部模板 avoid 原题标签后都能生成不同变式题');

// 7.2 每日组卷：本套内题目标签不重复
const setDaily = S.buildDaily({ typesState: {}, today: D, difficulty: 'medium', count: 10, rng: QB.mulberry32(88) });
check(new Set(setDaily.questions.map(q => q.sig)).size === 10, '每日10题本套内不应有原题重复');

// 7.3 每日组卷：avoidMap 上次标签 → 该题型新题与上次不同
const avoidMapT = {};
Object.keys(setDaily.lastSigs).forEach(t => { avoidMapT[t] = [setDaily.lastSigs[t]]; });
const setNext = S.buildDaily({ typesState: {}, today: d1, difficulty: 'medium', count: 10, rng: QB.mulberry32(99), avoidMap: avoidMapT });
let crossDayOk = true;
Object.keys(setNext.lastSigs).forEach(t => {
  if (avoidMapT[t] && setNext.lastSigs[t] === avoidMapT[t][0]) {
    crossDayOk = false;
    fails.push(t + ' 跨天仍重复上次原题 ' + avoidMapT[t][0]);
  }
});
check(crossDayOk, '跨天组卷避免与上次原题重复');

// 7.4 错题重做场景：从错题标签生成变式，题型一致但题目不同
const wrongQ = setDaily.questions[0];
const redoQ = QB.generate({ typeId: wrongQ.typeId, difficulty: wrongQ.difficulty, rng: QB.mulberry32(77), avoid: [wrongQ.sig] });
check(redoQ.typeId === wrongQ.typeId, '错题变式题型应与原错题一致');
check(redoQ.sig !== wrongQ.sig, '错题变式不应是原题');
check(redoQ.question !== wrongQ.question, '错题变式题目文本应与原题不同');

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
  console.log('✅ 全部通过：' + QB.templates.length + ' 个模板答案正确率 100%，选项唯一，难度覆盖完整，调度与举一反三去重符合预期');
}
