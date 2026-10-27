/* ============================================================
 * 题库：极限与连续（13 个模板，答案全部由参数程序化生成）
 * 每道题：question(题目) / options(4选1) / answer(正确答案)
 *        / idea(思路) / steps(分步过程，含大白话解释) / pitfall(易错点)
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* L1 基础：因式分解约分求极限 */
  QB.register({
    id: 'limit-L1', type: 'limit', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 4, rng), b = ri(-4, 4, rng);
        if (b === 0 || b === a) continue;
        var p = -(a + b), q = a * b;
        var correct = String(a - b);
        var d = bo(correct, [String(a + b), String(b), String(b - a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '\\lim_{x\\to ' + a + '}\\frac{x^2' + signed(p) + 'x' + signed(q) + '}{x' + signed(-a) + '}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '看到 $\\frac{0}{0}$ 型别慌：先把分子因式分解，分子分母同时约掉相同的因式，再代入就出结果。',
          steps: [
            { m: 'x^2' + signed(p) + 'x' + signed(q) + ' = (x' + signed(-a) + ')(x' + signed(-b) + ')',
              t: '先看分子。常数项 ' + q + ' 正好可以拆成 (' + a + ') × (' + b + ')，所以分子能写成两个括号相乘。' },
            { m: '\\frac{(x' + signed(-a) + ')(x' + signed(-b) + ')}{x' + signed(-a) + '} = x' + signed(-b),
              t: '分子分母里都有 $x' + signed(-a) + '$，约掉。注意：$x$ 只是"趋近" ' + a + '，并不是等于 ' + a + '，所以可以放心约。' },
            { m: 'x \\to ' + a + ' \\;\\Rightarrow\\; x' + signed(-b) + ' \\to ' + correct,
              t: '约完之后直接把 $x=' + a + '$ 代进去，$' + a + signed(-b) + '=' + correct + '$，答案就是 ' + correct + '。' }
          ],
          pitfall: '千万别一上来就把 $x=' + a + '$ 代入，会得到 $\\frac{0}{0}$；要先约分再代入。'
        };
      }
      throw new Error('L1 retry fail');
    }
  });

  /* L2 基础：多项式直接代入 */
  QB.register({
    id: 'limit-L2', type: 'limit', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 2, rng), b = ri(-3, 3, rng), c = ri(1, 3, rng), d0 = ri(-3, 3, rng);
        var correct = String(a * c * c + b * c + d0);
        var d = bo(correct, [String(2 * a * c + b), String(a * c * c + b * c), String(a * c * c + b * c + d0 + 1)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b, c: c, d: d0 },
          question: '\\lim_{x\\to ' + c + '}\\left(' + (a === 1 ? '' : a) + 'x^2' + signed(b) + 'x' + signed(d0) + '\\right)',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '多项式在定义域内处处连续，求极限最简单：直接把 $x$ 的值代进去。',
          steps: [
            { m: '\\lim_{x\\to ' + c + '}\\left(' + (a === 1 ? '' : a) + 'x^2' + signed(b) + 'x' + signed(d0) + '\\right) = ' + a + '\\cdot ' + c + '^2' + signed(b * c) + signed(d0),
              t: '把 $x=' + c + '$ 逐项代入：$' + (a === 1 ? '' : a) + '\\times ' + c + '^2$，再加上 $' + b + '\\times ' + c + '$ 和常数 ' + d0 + '。' },
            { m: '= ' + (a * c * c) + signed(b * c) + signed(d0) + ' = ' + correct,
              t: '按先乘方、再乘除、最后加减的顺序算出来。' }
          ],
          pitfall: '这是求极限，不是求导！不要用导数公式（$2ax+b$）来算。'
        };
      }
      throw new Error('L2 retry fail');
    }
  });

  /* L3 基础：重要极限 sin(kx)/x */
  QB.register({
    id: 'limit-L3', type: 'limit', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var k = ri(2, 5, rng);
        var correct = String(k);
        var d = bo(correct, ['1', String(k + 1), String(k - 1)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { k: k },
          question: '\\lim_{x\\to 0}\\frac{\\sin(' + k + 'x)}{x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '第一重要极限：$\\lim\\frac{\\sin\\Box}{\\Box}=1$（方框里是同一个趋近 0 的量）。分母缺什么就补什么。',
          steps: [
            { m: '\\frac{\\sin(' + k + 'x)}{x} = \\frac{\\sin(' + k + 'x)}{' + k + 'x}\\cdot ' + k,
              t: '让分母和 $\\sin$ 里面的东西一样：分母乘 ' + k + '，同时整体再乘 ' + k + ' 补回来。' },
            { m: '\\lim_{x\\to 0}\\frac{\\sin(' + k + 'x)}{' + k + 'x} = 1',
              t: '当 $x\\to 0$ 时，$' + k + 'x$ 也趋近 0，所以这一坨就是重要极限，等于 1。' },
            { m: '= 1 \\times ' + k + ' = ' + k,
              t: '外面还乘着一个 ' + k + '，所以答案是 ' + k + '。' }
          ],
          pitfall: '直接代入会得 $\\frac{0}{0}$；也不要漏掉外面乘的系数 ' + k + '。'
        };
      }
      throw new Error('L3 retry fail');
    }
  });

  /* L4 进阶：半角公式 (1-cos(kx))/x² */
  QB.register({
    id: 'limit-L4', type: 'limit', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var k = ri(2, 3, rng);
        var correct = frac(k * k, 2);
        var d = bo(correct, [frac(k, 2), String(k * k), String(2 * k)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { k: k },
          question: '\\lim_{x\\to 0}\\frac{1-\\cos(' + k + 'x)}{x^2}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '分子是 $1-\\cos$，想到半角公式把它变成 $\\sin^2$，就能用重要极限了。',
          steps: [
            { m: '1-\\cos(' + k + 'x) = 2\\sin^2\\frac{' + k + 'x}{2}',
              t: '半角公式：$1-\\cos\\alpha = 2\\sin^2\\frac{\\alpha}{2}$。这里 $\\alpha=' + k + 'x$。' },
            { m: '\\frac{1-\\cos(' + k + 'x)}{x^2} = 2\\cdot\\frac{\\sin\\frac{' + k + 'x}{2}}{x}\\cdot\\frac{\\sin\\frac{' + k + 'x}{2}}{x}',
              t: '把 $\\sin^2$ 拆成两个 $\\sin$ 相乘，2 提到前面。' },
            { m: '= 2\\cdot\\frac{' + k + '}{2}\\cdot\\frac{' + k + '}{2} = \\frac{' + k * k + '}{2}',
              t: '每个 $\\frac{\\sin\\frac{' + k + 'x}{2}}{x}$ 都等于 $\\frac{' + k + '}{2}$（重要极限乘上系数），乘起来就是 $\\frac{' + k * k + '}{2}$。' }
          ],
          pitfall: '半角公式是 $2\\sin^2\\frac{\\alpha}{2}$，前面这个 2 千万别漏。'
        };
      }
      throw new Error('L4 retry fail');
    }
  });

  /* L5 进阶：重要极限 (1+1/x)^(ax) */
  QB.register({
    id: 'limit-L5', type: 'limit', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng);
        var correct = 'e^{' + a + '}';
        var d = bo(correct, ['e^{' + (a - 1) + '}', 'e^{' + (a + 1) + '}', 'e^{' + (2 * a) + '}'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^{' + a + 'x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '第二重要极限：$\\lim_{x\\to\\infty}(1+\\frac{1}{x})^x = e$。指数上多一个 ' + a + '，结果就是 $e$ 的 ' + a + ' 次方。',
          steps: [
            { m: '\\left(1+\\frac{1}{x}\\right)^{' + a + 'x} = \\left[\\left(1+\\frac{1}{x}\\right)^{x}\\right]^{' + a + '}',
              t: '指数上的 $' + a + 'x$ 拆成 $x\\times' + a + '$，用幂的运算法则 $(\\Box^{x})^{' + a + '}$ 提出去。' },
            { m: '\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^{x} = e',
              t: '中括号里面就是第二重要极限，等于 $e$。' },
            { m: '\\Rightarrow e^{' + a + '}',
              t: '所以整体等于 $e^{' + a + '}$，答案就是 $e^{' + a + '}$。' }
          ],
          pitfall: '答案是 $e^{' + a + '}$，不是 $' + a + 'e$，也不是 $e^{' + a + '+1}$。'
        };
      }
      throw new Error('L5 retry fail');
    }
  });

  /* L6 进阶：根式有理化 */
  QB.register({
    id: 'limit-L6', type: 'limit', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = [4, 9][ri(0, 1, rng)];
        var s = Math.sqrt(a);
        var correct = frac(1, 2 * s);
        var d = bo(correct, [String(2 * s), String(s), frac(1, 2 * a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '\\lim_{x\\to 0}\\frac{\\sqrt{' + a + '+x}-\\sqrt{' + a + '}}{x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '分子是两个根号相减（$\\frac{0}{0}$ 型），用"分子有理化"：分子分母同乘共轭式 $\\sqrt{' + a + '+x}+\\sqrt{' + a + '}$。',
          steps: [
            { m: '\\frac{(\\sqrt{' + a + '+x}-\\sqrt{' + a + '})(\\sqrt{' + a + '+x}+\\sqrt{' + a + '})}{x(\\sqrt{' + a + '+x}+\\sqrt{' + a + '})}',
              t: '分子分母同时乘以 $\\sqrt{' + a + '+x}+\\sqrt{' + a + '}$（这叫共轭式），分数的值不变。' },
            { m: '= \\frac{(' + a + '+x)-' + a + '}{x(\\sqrt{' + a + '+x}+\\sqrt{' + a + '})} = \\frac{x}{x(\\sqrt{' + a + '+x}+\\sqrt{' + a + '})}',
              t: '分子用平方差公式：$(u-v)(u+v)=u^2-v^2$，两个根号的平方就是里面的数。' },
            { m: '= \\frac{1}{\\sqrt{' + a + '+x}+\\sqrt{' + a + '}} \\to \\frac{1}{2\\sqrt{' + a + '}} = ' + correct,
              t: '约掉 $x$，再让 $x\\to 0$：根号里就剩 ' + a + '，分母是 $2\\sqrt{' + a + '}$，所以答案是 ' + correct + '。' }
          ],
          pitfall: '分子有理化要"同乘共轭式"，分子分母都要乘，不是只乘分子。'
        };
      }
      throw new Error('L6 retry fail');
    }
  });

  /* L7 困难：tan x - sin x 除以 x³ */
  QB.register({
    id: 'limit-L7', type: 'limit', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{1}{2}';
      var d = bo(correct, ['0', '1', '\\frac{1}{3}'], rng);
      return {
        params: {},
        question: '\\lim_{x\\to 0}\\frac{\\tan x-\\sin x}{x^3}',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '见到 $\\tan x$ 先化成 $\\frac{\\sin x}{\\cos x}$，把 $\\sin x$ 提出来，剩下 $1-\\cos x$，就能用两个重要极限了。',
        steps: [
          { m: '\\tan x-\\sin x = \\sin x\\left(\\frac{1}{\\cos x}-1\\right) = \\sin x\\cdot\\frac{1-\\cos x}{\\cos x}',
            t: '把 $\\tan x$ 写成 $\\frac{\\sin x}{\\cos x}$，提取公因式 $\\sin x$。' },
          { m: '\\frac{\\tan x-\\sin x}{x^3} = \\frac{\\sin x}{x}\\cdot\\frac{1-\\cos x}{x^2}\\cdot\\frac{1}{\\cos x}',
            t: '拆成三块，每一块都是我们熟悉的极限。' },
          { m: '\\to 1 \\cdot \\frac{1}{2} \\cdot 1 = \\frac{1}{2}',
            t: '$\\frac{\\sin x}{x}\\to 1$，$\\frac{1-\\cos x}{x^2}\\to\\frac{1}{2}$，$\\frac{1}{\\cos x}\\to 1$，乘起来得 $\\frac{1}{2}$。' }
        ],
        pitfall: '如果直接用洛必达要连导三次，特别容易错；先恒等变形更省事。'
      };
    }
  });

  /* L8 困难：洛必达 (e^x-1-x)/x² */
  QB.register({
    id: 'limit-L8', type: 'limit', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{1}{2}';
      var d = bo(correct, ['0', '1', '2'], rng);
      return {
        params: {},
        question: '\\lim_{x\\to 0}\\frac{e^{x}-1-x}{x^2}',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\frac{0}{0}$ 型，用洛必达法则：分子分母分别求导。用完一次要检查是不是还是 $\\frac{0}{0}$，是就再来一次。',
        steps: [
          { m: '\\xrightarrow{\\text{洛必达}} \\lim_{x\\to 0}\\frac{e^{x}-1}{2x}',
            t: '第一次求导：分子 $(e^x-1-x)\\prime=e^x-1$，分母 $(x^2)\\prime=2x$。代入还是 $\\frac{0}{0}$，继续。' },
          { m: '\\xrightarrow{\\text{再洛必达}} \\lim_{x\\to 0}\\frac{e^{x}}{2}',
            t: '第二次求导：分子变成 $e^x$，分母变成 2。这次可以代入了。' },
          { m: '= \\frac{1}{2}',
            t: '$x\\to 0$ 时 $e^0=1$，所以结果是 $\\frac{1}{2}$。' }
        ],
        pitfall: '第一次洛必达后分母是 $2x$，别忘了这个 2；代入前一定确认不再是 $\\frac{0}{0}$。'
      };
    }
  });

  /* L9 基础：间断点类型概念题 */
  QB.register({
    id: 'limit-L9', type: 'limit', difficulty: 'easy',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = '无穷间断点（第二类）';
      var d = bo(correct, ['可去间断点（第一类）', '跳跃间断点（第一类）', '连续点（不是间断点）'], rng);
      return {
        params: { a: a },
        question: '函数 $f(x)=\\frac{1}{x-' + a + '}$ 在 $x=' + a + '$ 处的间断点类型是（　）',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '判断间断点类型，就看 $x$ 趋近该点时函数值的走向：无限增大就是无穷间断点。',
        steps: [
          { m: 'x \\to ' + a + ' \\Rightarrow x-' + a + ' \\to 0,\\quad f(x)=\\frac{1}{x-' + a + '} \\to \\infty',
            t: '当 $x$ 靠近 ' + a + ' 时，分母 $x-' + a + '$ 越来越接近 0，分子是 1，整个分式的绝对值越来越大、没有上限。' },
          { m: '\\Rightarrow \\text{无穷间断点（第二类）}',
            t: '函数值趋于无穷大，所以叫"无穷间断点"，属于第二类间断点。' }
        ],
        pitfall: '分母为 0 不一定都是无穷间断点：如果分子分母能约分（如 $\\frac{x^2-1}{x-1}$），那是可去间断点。'
      };
    }
  });

  /* L10 基础：无穷小 × 有界量 */
  QB.register({
    id: 'limit-L10', type: 'limit', difficulty: 'easy',
    gen: function (rng) {
      var correct = '0';
      var d = bo(correct, ['1', '不存在', '\\frac{1}{2}'], rng);
      return {
        params: {},
        question: '\\lim_{x\\to 0} x\\sin\\frac{1}{x}',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '无穷小量乘以有界量，结果还是无穷小。$x$ 是无穷小，$\\sin\\frac{1}{x}$ 是有界量。',
        steps: [
          { m: '\\left|\\sin\\frac{1}{x}\\right| \\leq 1',
            t: '不管 $x$ 怎么变，正弦函数的取值永远在 $-1$ 和 1 之间，这是"有界"。' },
          { m: 'x \\to 0',
            t: '$x$ 趋近 0，是无穷小量。' },
          { m: '\\text{无穷小} \\times \\text{有界} = \\text{无穷小} \\Rightarrow 0',
            t: '一个趋近 0 的数乘以一个"蹦来蹦去但不超过 ±1"的数，结果还是趋近 0。' }
        ],
        pitfall: '$\\sin\\frac{1}{x}$ 本身在 $x\\to 0$ 时极限不存在，但乘上无穷小 $x$ 之后整体极限存在且为 0。'
      };
    }
  });

  /* L11 进阶：x→∞ 多项式之比 */
  QB.register({
    id: 'limit-L11', type: 'limit', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 5, rng), dd = ri(2, 5, rng), b = ri(-2, 2, rng), e = ri(-2, 2, rng), c0 = ri(1, 3, rng);
        if (b === 0) continue;
        var correct = frac(a, dd);
        var d = bo(correct, [frac(a + 1, dd), frac(a, dd + 1), frac(a + b, dd)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, d: dd, b: b, e: e, c: c0 },
          question: '\\lim_{x\\to\\infty}\\frac{' + (a === 1 ? '' : a) + 'x^2' + signed(b) + 'x' + signed(c0) + '}{' + (dd === 1 ? '' : dd) + 'x^2' + signed(e) + '}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '$x\\to\\infty$ 的多项式之比，分子分母同时除以最高次项 $x^2$，其余项都趋于 0，只剩最高次系数之比。',
          steps: [
            { m: '\\frac{' + a + '+' + b + '/x+' + c0 + '/x^2}{' + dd + '+' + e + '/x}',
              t: '分子分母同时除以 $x^2$（最高次），每一项都降次。' },
            { m: '\\frac{1}{x}\\to 0,\\quad \\frac{1}{x^2}\\to 0',
              t: '当 $x$ 无穷大时，$\\frac{1}{x}$、$\\frac{1}{x^2}$ 都趋近 0，全部扔掉。' },
            { m: '= \\frac{' + a + '}{' + dd + '} = ' + correct,
              t: '只剩下最高次项的系数相除。' }
          ],
          pitfall: '只看 $x^2$ 的系数之比，别把一次项系数也算进去。'
        };
      }
      throw new Error('L11 retry fail');
    }
  });

  /* L12 困难：等价无穷小 (a^x-1)/x */
  QB.register({
    id: 'limit-L12', type: 'limit', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(3, 4, rng);
        var correct = '\\ln ' + a;
        var d = bo(correct, [String(a), String(a - 1), '1'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '\\lim_{x\\to 0}\\frac{' + a + '^{x}-1}{x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '把 ' + a + ' 的 x 次方化成 $e$ 的幂：$' + a + '^x = e^{x\\ln ' + a + '}$，再用重要极限 $\\frac{e^{\\Box}-1}{\\Box}\\to 1$。',
          steps: [
            { m: a + '^{x} = e^{x\\ln ' + a + '}',
              t: '指数换底公式：任何正数的幂都能写成 $e$ 的幂。' },
            { m: '\\frac{' + a + '^{x}-1}{x} = \\frac{e^{x\\ln ' + a + '}-1}{x} = \\frac{e^{x\\ln ' + a + '}-1}{x\\ln ' + a + '}\\cdot\\ln ' + a,
              t: '把分母 $x$ 凑成 $x\\ln ' + a + '$（和 $e$ 的指数一样），外面乘回 $\\ln ' + a + '$ 补偿。' },
            { m: '\\to 1\\cdot\\ln ' + a + ' = \\ln ' + a,
              t: '$\\frac{e^{\\Box}-1}{\\Box}\\to 1$（当 $\\Box\\to 0$），所以答案是 $\\ln ' + a + '$。' }
          ],
          pitfall: '结论可记：$x\\to 0$ 时 $a^x-1\\sim x\\ln a$（等价无穷小），答案不是 ' + a + '。'
        };
      }
      throw new Error('L12 retry fail');
    }
  });

  /* L13 困难：拆分后各用重要极限 */
  QB.register({
    id: 'limit-L13', type: 'limit', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 4, rng), b = ri(1, 4, rng);
        if (a === b) continue;
        var correct = String(a - b);
        var d = bo(correct, [String(a + b), '0', String(b - a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '\\lim_{x\\to 0}\\frac{\\sin(' + a + 'x)-\\sin(' + b + 'x)}{x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '分子是两个正弦相减，直接用极限四则运算法则拆成两个极限，每个都是重要极限的变形。',
          steps: [
            { m: '= \\lim_{x\\to 0}\\frac{\\sin(' + a + 'x)}{x} - \\lim_{x\\to 0}\\frac{\\sin(' + b + 'x)}{x}',
              t: '先拆成两个极限（两个极限都存在，所以可以拆）。' },
            { m: '\\frac{\\sin(' + a + 'x)}{x} = ' + a + '\\cdot\\frac{\\sin(' + a + 'x)}{' + a + 'x} \\to ' + a,
              t: '第一个：凑重要极限，结果是 ' + a + '。' },
            { m: '\\to ' + a + ' - ' + b + ' = ' + correct,
              t: '同理第二个是 ' + b + '，相减得 ' + correct + '。' }
          ],
          pitfall: '$\\sin(a+b)$ 不能拆成 $\\sin a + \\sin b$！但"极限的和"可以拆成"和的极限"。'
        };
      }
      throw new Error('L13 retry fail');
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
