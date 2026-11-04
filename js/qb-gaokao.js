/* ============================================================
 * 北京高考数学题库
 * 按北京卷「卷面题型」分类：选择题（gkChoice）/ 填空题（gkFill）/ 解答题（gkSolve）
 * 每题带知识模块标签（tech），覆盖：集合、复数、函数与导数、三角函数、
 * 解三角形、数列、平面向量、不等式、立体几何、解析几何、概率统计
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions, coefX = QB.coefX, xpow = QB.xpow, powStr = QB.powStr;

  function ok4(o) { return new Set(o).size === 4; }
  function C(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  // 二分之一形式：0.5 → \frac{1}{2}，1.5 → \frac{3}{2}
  function half(x) {
    if (x === 0) return '0';
    var neg = x < 0, ax = Math.abs(x);
    var body = (Math.round(ax) === ax) ? String(ax) : '\\frac{' + (ax * 2) + '}{2}';
    return (neg ? '-' : '') + body;
  }
  function cplx(re, im) {
    if (im === 0) return half(re);
    var imPart = (im > 0 ? '+' : '-') + half(Math.abs(im)) + 'i';
    if (re === 0) return (im > 0 ? '' : '-') + half(Math.abs(im)) + 'i';
    return half(re) + imPart;
  }
  // 根式化简：28 → 2\sqrt{7}；16 → 4
  function sqrtStr(k) {
    var out = 1, rest = k;
    for (var i = 2; i * i <= rest; i++) {
      while (rest % (i * i) === 0) { out *= i; rest /= (i * i); }
    }
    if (rest === 1) return String(out);
    return (out === 1 ? '' : String(out)) + '\\sqrt{' + rest + '}';
  }

  /* ================= 选择题 ================= */

  /* G1 集合交集 */
  QB.register({
    id: 'gk-G1', type: 'gkChoice', difficulty: 'easy', tech: '集合运算',
    gen: function (rng) {
      for (var t = 0; t < 40; t++) {
        var c = ri(0, 1, rng);
        var correct = '[' + c + ',2)';
        var d = bo(correct, ['(' + c + ',2)', '[' + c + ',2]', '(-1,' + c + ']'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { c: c },
          question: '已知集合 $A=\\{x\\mid -1<x<2\\}$，$B=\\{x\\mid x\\ge ' + c + '\\}$，则 $A\\cap B=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '集合交集：两个范围都满足的部分。可画数轴，取"重叠"的一段。',
          steps: [
            { m: 'A=(-1,2),\\quad B=[' + c + ',+\\infty)',
              t: '把两个集合写成区间。' },
            { m: 'A\\cap B = [' + c + ',2)',
              t: '重叠部分：左端取 $B$ 的 ' + c + '（含等号），右端取 $A$ 的 2（不含等号）。' }
          ],
          pitfall: '端点是否含：$x\\ge ' + c + '$ 含 ' + c + '，$x<2$ 不含 2，所以是 $[' + c + ',2)$。'
        };
      }
      throw new Error('G1 retry');
    }
  });

  /* G2 复数除法 */
  QB.register({
    id: 'gk-G2', type: 'gkChoice', difficulty: 'easy', tech: '复数运算',
    gen: function (rng) {
      for (var t = 0; t < 40; t++) {
        var a = ri(1, 2, rng), b = ri(1, 2, rng);
        var re = (a - b) / 2, im = (a + b) / 2;
        var correct = cplx(re, im);
        var d = bo(correct, [cplx((a + b) / 2, (b - a) / 2), cplx((a + b) / 2, (a + b) / 2), cplx((b - a) / 2, (a - b) / 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '复数 $\\frac{' + a + '+' + b + 'i}{1-i}=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '复数除法：分子分母同乘分母的共轭复数 $(1+i)$，把分母变成实数。',
          steps: [
            { m: '\\frac{' + a + '+' + b + 'i}{1-i}\\cdot\\frac{1+i}{1+i} = \\frac{(' + a + '+' + b + 'i)(1+i)}{2}',
              t: '分子分母同乘 $(1+i)$，分母 $(1-i)(1+i)=2$。' },
            { m: '= \\frac{(' + (a - b) + ')+(' + (a + b) + ')i}{2}',
              t: '展开分子：实部 $' + a + '-' + b + '$，虚部 $' + a + '+' + b + '$。' },
            { m: '= ' + correct,
              t: '分别除以 2。' }
          ],
          pitfall: '$i^2=-1$，展开时 $' + b + 'i\\cdot i=-' + b + '$ 是实部的一部分。'
        };
      }
      throw new Error('G2 retry');
    }
  });

  /* G3 定义域 */
  QB.register({
    id: 'gk-G3', type: 'gkChoice', difficulty: 'easy', tech: '函数定义域',
    gen: function (rng) {
      var a = ri(1, 2, rng), b = a + 2;
      var correct = '[' + a + ',' + b + ')';
      var d = bo(correct, ['(' + a + ',' + b + ')', '(' + a + ',' + b + ']', '[' + a + ',' + b + ']'], rng);
      return {
        params: { a: a, b: b },
        question: '函数 $f(x)=\\sqrt{x-' + a + '}+\\ln(' + b + '-x)$ 的定义域是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两根"红线"：根号里 $\\ge0$，对数里 $>0$；两者取交集。',
        steps: [
          { m: 'x-' + a + '\\ge0 \\Rightarrow x\\ge' + a,
            t: '根号内非负。' },
          { m: b + '-x>0 \\Rightarrow x<' + b,
            t: '对数真数为正。' },
          { m: '[' + a + ',' + b + ')',
            t: '取交集：左端含，右端不含。' }
        ],
        pitfall: '对数的真数必须"严格大于 0"，所以右端是开区间。'
      };
    }
  });

  /* G4 单调性判断 */
  QB.register({
    id: 'gk-G4', type: 'gkChoice', difficulty: 'easy', tech: '函数单调性',
    gen: function (rng) {
      var correct = 'y=\\frac{1}{x}';
      var d = bo(correct, ['y=x^{2}', 'y=\\ln x', 'y=e^{x}'], rng);
      return {
        params: {},
        question: '下列函数中，在区间 $(0,+\\infty)$ 上单调递减的是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '逐个判断：$x^2$ 先减后增，$\\ln x$ 与 $e^x$ 都递增，$1/x$ 在正半轴递减。',
        steps: [
          { m: 'y=\\frac{1}{x},\\ x>0:\\ x\\uparrow \\Rightarrow \\frac{1}{x}\\downarrow',
            t: '$x$ 越大，倒数越小。' },
          { m: 'y\\prime=-\\frac{1}{x^2}<0',
            t: '导数为负，严格递减。' }
        ],
        pitfall: '$y=x^2$ 在 $(0,+\\infty)$ 上是递增的，别混成递减。'
      };
    }
  });

  /* G5 导数切线 */
  QB.register({
    id: 'gk-G5', type: 'gkChoice', difficulty: 'medium', tech: '导数几何意义',
    gen: function (rng) {
      var n = [2, 3][ri(0, 1, rng)], a = [1, 2][ri(0, 1, rng)];
      var slope = n * Math.pow(a, n - 1);
      var y0 = Math.pow(a, n);
      var b0 = y0 - slope * a;
      var correct = 'y=' + slope + 'x' + signed(b0);
      var d = bo(correct, ['y=' + slope + 'x' + signed(b0 + 1), 'y=' + slope + 'x' + signed(b0 - 1), 'y=' + slope + 'x'], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { n: n, a: a },
        question: '曲线 $y=x^{' + n + '}$ 在点 $P(' + a + ',' + y0 + ')$ 处的切线方程是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '切线：先求导得到斜率 $k=f\\prime(' + a + ')$，再用点斜式 $y-y_0=k(x-a)$。',
        steps: [
          { m: 'y\\prime=' + coefX(n, n - 1) + ' \\Rightarrow k=' + n + '\\times' + powStr(String(a), n - 1) + '=' + slope,
            t: '求导后代点得斜率。' },
          { m: 'y-' + y0 + '=' + slope + '(x-' + a + ')',
            t: '点斜式。' },
          { m: 'y=' + slope + 'x' + signed(b0),
            t: '化简。' }
        ],
        pitfall: '斜率先求导再代入 $x=' + a + '$，不是把点坐标代进原函数。'
      };
    }
  });

  /* G6 三角化简 */
  QB.register({
    id: 'gk-G6', type: 'gkChoice', difficulty: 'medium', tech: '二倍角公式',
    gen: function (rng) {
      var deg = [15, 30, 45][ri(0, 2, rng)];
      var val = deg === 15 ? '\\frac{1}{2}' : deg === 30 ? '\\frac{\\sqrt{2}}{2}' : '\\frac{\\sqrt{3}}{2}';
      var d = bo(val, ['1', '\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{2}}{2}', '\\frac{1}{2}'].filter(function (x) { return x !== val; }), rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { deg: deg },
        question: '$2\\sin ' + deg + '^{\\circ}\\cos ' + deg + '^{\\circ}=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '二倍角公式：$2\\sin\\alpha\\cos\\alpha=\\sin 2\\alpha$。',
        steps: [
          { m: '2\\sin ' + deg + '^{\\circ}\\cos ' + deg + '^{\\circ} = \\sin ' + (2 * deg) + '^{\\circ}',
            t: '套二倍角公式。' },
          { m: '= ' + val,
            t: '特殊角三角函数值。' }
        ],
        pitfall: '$2\\sin\\alpha\\cos\\alpha$ 是 $\\sin 2\\alpha$，不是 $\\cos 2\\alpha$。'
      };
    }
  });

  /* G7 余弦定理 */
  QB.register({
    id: 'gk-G7', type: 'gkChoice', difficulty: 'medium', tech: '余弦定理',
    gen: function (rng) {
      var cases = [[3, 4, 60], [4, 6, 60], [3, 4, 120], [5, 5, 120]];
      var p = cases[ri(0, cases.length - 1, rng)];
      var a = p[0], b = p[1], C0 = p[2];
      var c2 = a * a + b * b - 2 * a * b * Math.cos(C0 * Math.PI / 180);
      c2 = Math.round(c2 * 100) / 100;
      var correct = sqrtStr(c2);
      var d = bo(correct, [sqrtStr(a * a + b * b), sqrtStr(Math.abs(a * a - b * b) + 1), sqrtStr(a * a + b * b + 2 * a * b)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { a: a, b: b, C0: C0 },
        question: '在 $\\triangle ABC$ 中，$a=' + a + '$，$b=' + b + '$，$C=' + C0 + '^{\\circ}$，则 $c=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '已知两边及夹角求第三边，用余弦定理：$c^2=a^2+b^2-2ab\\cos C$。',
        steps: [
          { m: 'c^2 = ' + a + '^2+' + b + '^2-2\\times' + a + '\\times' + b + '\\times\\cos ' + C0 + '^{\\circ}',
            t: '余弦定理代入。' },
          { m: '= ' + (a * a) + '+' + (b * b) + signed(-2 * a * b * Math.cos(C0 * Math.PI / 180)) + '= ' + c2,
            t: C0 === 60 ? '$\\cos60^{\\circ}=\\frac{1}{2}$。' : '$\\cos120^{\\circ}=-\\frac{1}{2}$，所以中间项变正。' },
          { m: 'c = ' + correct,
            t: '开平方并化简根式。' }
        ],
        pitfall: '$\\cos120^{\\circ}$ 是负数，代入后 $-2ab\\cos C$ 变成 $+ab$，别少算。'
      };
    }
  });

  /* G8 等差数列通项 */
  QB.register({
    id: 'gk-G8', type: 'gkChoice', difficulty: 'easy', tech: '等差数列',
    gen: function (rng) {
      var a1 = ri(1, 3, rng), d0 = ri(2, 3, rng);
      var correct = String(a1 + 9 * d0);
      var d = bo(correct, [String(a1 + 10 * d0), String(a1 + 8 * d0), String(10 * d0)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { a1: a1, d: d0 },
        question: '等差数列 $\\{a_n\\}$ 中，$a_1=' + a1 + '$，公差 $d=' + d0 + '$，则 $a_{10}=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '等差数列通项：$a_n=a_1+(n-1)d$。',
        steps: [
          { m: 'a_{10} = a_1+9d = ' + a1 + '+9\\times' + d0,
            t: '代入通项公式（注意是 9 个公差）。' },
          { m: '= ' + correct,
            t: '计算。' }
        ],
        pitfall: '$a_{10}$ 是 $a_1$ 加 9 个公差，不是 10 个。'
      };
    }
  });

  /* G9 等比数列求和 */
  QB.register({
    id: 'gk-G9', type: 'gkChoice', difficulty: 'medium', tech: '等比数列',
    gen: function (rng) {
      var a1 = ri(1, 2, rng), q = [2, 3][ri(0, 1, rng)];
      var s5 = a1 * (Math.pow(q, 5) - 1) / (q - 1);
      var correct = String(s5);
      var d = bo(correct, [String(s5 - 1), String(a1 * Math.pow(q, 5)), String(a1 * (Math.pow(q, 5) - 1))], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { a1: a1, q: q },
        question: '等比数列 $\\{a_n\\}$ 中，$a_1=' + a1 + '$，公比 $q=' + q + '$，则前 5 项和 $S_5=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '等比数列前 $n$ 项和：$S_n=\\frac{a_1(1-q^n)}{1-q}$（$q\\ne1$）。',
        steps: [
          { m: 'S_5 = \\frac{' + a1 + '(1-' + q + '^5)}{1-' + q + '} = \\frac{' + a1 + '(1-' + Math.pow(q, 5) + ')}{' + (1 - q) + '}',
            t: '代入求和公式。' },
          { m: '= ' + correct,
            t: '计算得 ' + correct + '。' }
        ],
        pitfall: '公式分子是 $1-q^n$ 或 $q^n-1$（分母相应取负），别把 $q^5$ 写成 $5q$。'
      };
    }
  });

  /* G10 向量垂直 */
  QB.register({
    id: 'gk-G10', type: 'gkChoice', difficulty: 'easy', tech: '平面向量',
    gen: function (rng) {
      for (var t = 0; t < 40; t++) {
        var p = ri(1, 2, rng), qv = ri(2, 4, rng);
        if (qv % p !== 0) continue;
        var m = qv / p;
        var correct = String(m);
        var d = bo(correct, [String(-m), String(m + 1), String(m - 1)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { p: p, q: qv, m: m },
          question: '已知向量 $\\vec{a}=(' + p + ',' + qv + ')$，$\\vec{b}=(m,-1)$，若 $\\vec{a}\\perp\\vec{b}$，则 $m=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '两向量垂直 ⇔ 数量积为 0：$\\vec{a}\\cdot\\vec{b}=0$。',
          steps: [
            { m: '\\vec{a}\\cdot\\vec{b} = ' + p + 'm+' + qv + '\\times(-1) = 0',
              t: '代入数量积并令其为 0。' },
            { m: p + 'm=' + qv + ' \\Rightarrow m=' + m,
              t: '解一元一次方程。' }
          ],
          pitfall: '垂直用数量积为 0；平行才是"坐标成比例"。'
        };
      }
      throw new Error('G10 retry');
    }
  });

  /* G11 正方体表面积 */
  QB.register({
    id: 'gk-G11', type: 'gkChoice', difficulty: 'easy', tech: '立体几何',
    gen: function (rng) {
      var n = ri(1, 3, rng);
      var correct = String(6 * n * n);
      var d = bo(correct, [String(n * n * n), String(6 * n), String(12 * n)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { n: n },
        question: '棱长为 ' + n + ' 的正方体的表面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '正方体 6 个面都是正方形，表面积 $=6a^2$。',
        steps: [
          { m: 'S = 6a^2 = 6\\times' + n + '^2',
            t: '代入棱长。' },
          { m: '= ' + correct,
            t: '计算。' }
        ],
        pitfall: '表面积是 $6a^2$（6 个面）；$a^3$ 是体积，$12a$ 是棱长总和。'
      };
    }
  });

  /* G12 椭圆离心率 */
  QB.register({
    id: 'gk-G12', type: 'gkChoice', difficulty: 'medium', tech: '椭圆',
    gen: function (rng) {
      var pairs = [[25, 9, '\\frac{4}{5}', '\\frac{3}{5}'], [25, 16, '\\frac{3}{5}', '\\frac{4}{5}']];
      var p = pairs[ri(0, 1, rng)];
      var a2 = p[0], b2 = p[1], correct = p[2], other = p[3];
      var d = bo(correct, [other, frac(a2 - b2, a2), '\\frac{5}{3}'], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { a2: a2, b2: b2 },
        question: '椭圆 $\\frac{x^2}{' + a2 + '}+\\frac{y^2}{' + b2 + '}=1$ 的离心率是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '椭圆离心率 $e=\\frac{c}{a}$，其中 $c^2=a^2-b^2$。',
        steps: [
          { m: 'a^2=' + a2 + ',\\ b^2=' + b2 + ' \\Rightarrow c^2=' + (a2 - b2),
            t: '$c=\\sqrt{a^2-b^2}$。' },
          { m: 'e=\\frac{c}{a}=' + correct,
            t: '取 $c/a$：$c=' + Math.sqrt(a2 - b2) + '$，$a=' + Math.sqrt(a2) + '$。' }
        ],
        pitfall: '椭圆是 $c^2=a^2-b^2$（双曲线才是 $c^2=a^2+b^2$）。'
      };
    }
  });

  /* G13 古典概型 */
  QB.register({
    id: 'gk-G13', type: 'gkChoice', difficulty: 'medium', tech: '古典概型',
    gen: function (rng) {
      var pairs = [[3, 2], [2, 3], [3, 3]];
      var p = pairs[ri(0, pairs.length - 1, rng)];
      var r = p[0], w = p[1];
      var num = r * w, den = C(r + w, 2);
      var correct = frac(num, den);
      var d = bo(correct, [frac(num, r + w), frac(1, 2), frac(r + w, r * w + 1)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { r: r, w: w },
        question: '袋中有 ' + r + ' 个红球、' + w + ' 个白球，从中任取 2 个，恰好取到 1 个红球的概率是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '古典概型：$P=\\frac{\\text{有利结果数}}{\\text{总结果数}}$；"恰 1 红"= 选 1 红 1 白。',
        steps: [
          { m: '总结果：C_{' + (r + w) + '}^{2} = ' + den,
            t: '从 ' + (r + w) + ' 个球中取 2 个的组合数。' },
          { m: '有利结果：C_{' + r + '}^{1}\\cdot C_{' + w + '}^{1} = ' + (r * w),
            t: '1 红 1 白。' },
          { m: 'P = \\frac{' + (r * w) + '}{' + den + '} = ' + correct,
            t: '相除约分。' }
        ],
        pitfall: '"恰好 1 红"不是"至少 1 红"；别漏掉选白球的那一步组合。'
      };
    }
  });

  /* G14 基本不等式 */
  QB.register({
    id: 'gk-G14', type: 'gkChoice', difficulty: 'medium', tech: '基本不等式',
    gen: function (rng) {
      var k = [2, 3][ri(0, 1, rng)];
      var correct = String(2 * k);
      var d = bo(correct, [String(k * k), String(k), String(2 * k * k)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { k: k },
        question: '已知 $x>0$，则 $x+\\frac{' + (k * k) + '}{x}$ 的最小值是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '基本不等式：$a+b\\ge2\\sqrt{ab}$（$a,b>0$），等号当 $a=b$。',
        steps: [
          { m: 'x+\\frac{' + (k * k) + '}{x} \\ge 2\\sqrt{x\\cdot\\frac{' + (k * k) + '}{x}} = 2\\sqrt{' + (k * k) + '}',
            t: '套用基本不等式。' },
          { m: '= ' + correct + '\\quad(x=' + k + '\\text{ 时取等})',
            t: '等号条件 $x=' + k + '$ 满足 $x>0$。' }
        ],
        pitfall: '等号成立的条件要验证（$x>0$ 且 $x=' + k + '$），否则最小值取不到。'
      };
    }
  });

  /* G15 立体几何命题判断 */
  QB.register({
    id: 'gk-G15', type: 'gkChoice', difficulty: 'hard', tech: '空间位置关系',
    gen: function (rng) {
      var correct = '若 $a\\perp\\alpha$，$b\\perp\\alpha$，则 $a\\parallel b$';
      var d = bo(correct, [
        '若 $a\\parallel\\alpha$，$b\\subset\\alpha$，则 $a\\parallel b$',
        '若 $a\\perp b$，$b\\subset\\alpha$，则 $a\\perp\\alpha$',
        '若 $a\\subset\\alpha$，$b\\parallel\\alpha$，则 $a\\parallel b$'
      ], rng);
      return {
        params: {},
        question: '下列命题中，正确的是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '垂直于同一平面的两条直线平行（线面垂直的性质），其余选项都能找到反例。',
        steps: [
          { m: 'a\\perp\\alpha,\\ b\\perp\\alpha \\Rightarrow a\\parallel b',
            t: '垂直于同一平面的两直线平行，这是定理。' },
          { m: '\\text{反例：}a\\parallel\\alpha,\\ b\\subset\\alpha \\text{ 时 } a,b \\text{ 可能异面}',
            t: '平行于平面的线与平面内的线不一定平行。' }
        ],
        pitfall: '"线平行于面"推不出"线与面内任意线平行"，这是最常见的错误。'
      };
    }
  });

  /* ================= 填空题 ================= */

  /* F1 复数幂 */
  QB.register({
    id: 'gk-F1', type: 'gkFill', difficulty: 'easy', kind: 'fill', form: 'fill', tech: '复数运算',
    gen: function (rng) {
      return {
        params: {},
        question: '计算：$i^{2025}=$ ____（填空）',
        answer: 'i', alt: ['i'],
        idea: '$i$ 的幂以 4 为周期：$i^1=i,\\ i^2=-1,\\ i^3=-i,\\ i^4=1$。',
        steps: [
          { m: '2025 = 4\\times506+1',
            t: '把指数除以 4，看余数。' },
          { m: 'i^{2025} = i^{4\\times506+1} = (i^4)^{506}\\cdot i = i',
            t: '余 1，结果是 $i$。' }
        ],
        pitfall: '余数是 0、1、2、3 分别对应 $1,i,-1,-i$，别记反。'
      };
    }
  });

  /* F2 对数定义域 */
  QB.register({
    id: 'gk-F2', type: 'gkFill', difficulty: 'easy', kind: 'fill', form: 'fill', tech: '函数定义域',
    gen: function (rng) {
      return {
        params: {},
        question: '函数 $f(x)=\\log_2(x-1)$ 的定义域是 ____（填空，用区间表示）',
        answer: '(1,+∞)', alt: ['(1,+\\infty)', '(1，+∞)'],
        idea: '对数的真数必须大于 0。',
        steps: [
          { m: 'x-1>0 \\Rightarrow x>1',
            t: '真数为正。' },
          { m: '(1,+\\infty)',
            t: '写成区间。' }
        ],
        pitfall: '是开区间 $(1,+\\infty)$，$x=1$ 时真数为 0，不合法。'
      };
    }
  });

  /* F3 等差数列求和 */
  QB.register({
    id: 'gk-F3', type: 'gkFill', difficulty: 'easy', kind: 'fill', form: 'fill', tech: '等差数列',
    gen: function (rng) {
      var a1 = ri(1, 2, rng), d0 = ri(1, 2, rng);
      var s10 = 10 * a1 + 45 * d0;
      return {
        params: { a1: a1, d: d0 },
        question: '等差数列 $\\{a_n\\}$ 中，$a_1=' + a1 + '$，$d=' + d0 + '$，则 $S_{10}=$ ____（填空）',
        answer: String(s10),
        idea: '等差数列前 $n$ 项和：$S_n=na_1+\\frac{n(n-1)}{2}d$。',
        steps: [
          { m: 'S_{10} = 10\\times' + a1 + '+\\frac{10\\times9}{2}\\times' + d0,
            t: '代入求和公式。' },
          { m: '= ' + (10 * a1) + '+' + (45 * d0) + '=' + s10,
            t: '计算。' }
        ],
        pitfall: '$\\frac{n(n-1)}{2}$ 当 $n=10$ 时是 45，不是 50。'
      };
    }
  });

  /* F4 二项式系数 */
  QB.register({
    id: 'gk-F4', type: 'gkFill', difficulty: 'medium', kind: 'fill', form: 'fill', tech: '二项式定理',
    gen: function (rng) {
      return {
        params: {},
        question: '$(x+1)^{6}$ 的展开式中，$x^{3}$ 的系数是 ____（填空）',
        answer: '20',
        idea: '二项式定理：$x^3$ 项来自 $C_6^3 x^3\\cdot1^3$。',
        steps: [
          { m: 'C_{6}^{3} = \\frac{6\\times5\\times4}{3\\times2\\times1}',
            t: '取 3 个 $x$、3 个 1 的组合数。' },
          { m: '= 20',
            t: '计算得 20。' }
        ],
        pitfall: '系数是 $C_6^3$，不是 $C_6^2$（$x^3$ 与 $x^2$ 对应不同组合）。'
      };
    }
  });

  /* F5 圆半径 */
  QB.register({
    id: 'gk-F5', type: 'gkFill', difficulty: 'medium', kind: 'fill', form: 'fill', tech: '圆的方程',
    gen: function (rng) {
      return {
        params: {},
        question: '圆 $x^{2}+y^{2}-4x+2y+1=0$ 的半径是 ____（填空）',
        answer: '2',
        idea: '配方成标准式 $(x-a)^2+(y-b)^2=r^2$。',
        steps: [
          { m: '(x-2)^2-4+(y+1)^2-1+1=0',
            t: '分别对 $x$、$y$ 配方。' },
          { m: '(x-2)^2+(y+1)^2=4 \\Rightarrow r=2',
            t: '右边是 $r^2=4$，半径 $r=2$。' }
        ],
        pitfall: '半径是 $\\sqrt{4}=2$，不是 4（右边是 $r^2$）。'
      };
    }
  });

  /* F6 向量数量积 */
  QB.register({
    id: 'gk-F6', type: 'gkFill', difficulty: 'easy', kind: 'fill', form: 'fill', tech: '平面向量',
    gen: function (rng) {
      return {
        params: {},
        question: '已知向量 $\\vec{a}=(1,2)$，$\\vec{b}=(3,-1)$，则 $\\vec{a}\\cdot\\vec{b}=$ ____（填空）',
        answer: '1',
        idea: '数量积：对应坐标相乘再相加。',
        steps: [
          { m: '\\vec{a}\\cdot\\vec{b}=1\\times3+2\\times(-1)',
            t: '代入坐标。' },
          { m: '= 3-2=1',
            t: '计算。' }
        ],
        pitfall: '第二个分量是 $2\\times(-1)=-2$，注意负号。'
      };
    }
  });

  /* F7 同角三角函数 */
  QB.register({
    id: 'gk-F7', type: 'gkFill', difficulty: 'medium', kind: 'fill', form: 'fill', tech: '同角关系',
    gen: function (rng) {
      return {
        params: {},
        question: '已知 $\\sin\\alpha=\\frac{3}{5}$，且 $\\alpha\\in\\left(\\frac{\\pi}{2},\\pi\\right)$，则 $\\cos\\alpha=$ ____（填空）',
        answer: '-4/5', alt: ['-0.8', '-\\frac{4}{5}'],
        idea: '同角关系 $\\sin^2\\alpha+\\cos^2\\alpha=1$；第二象限 $\\cos$ 为负。',
        steps: [
          { m: '\\cos^2\\alpha = 1-\\left(\\frac{3}{5}\\right)^2 = \\frac{16}{25}',
            t: '用平方关系求 $\\cos^2$。' },
          { m: '\\alpha\\in\\left(\\frac{\\pi}{2},\\pi\\right) \\Rightarrow \\cos\\alpha<0 \\Rightarrow \\cos\\alpha=-\\frac{4}{5}',
            t: '第二象限余弦为负。' }
        ],
        pitfall: '第二象限 $\\cos$ 取负值，别只写 $4/5$。'
      };
    }
  });

  /* F8 导数极值 */
  QB.register({
    id: 'gk-F8', type: 'gkFill', difficulty: 'medium', kind: 'fill', form: 'fill', tech: '导数与极值',
    gen: function (rng) {
      return {
        params: {},
        question: '函数 $f(x)=x^{3}-3x$ 的极小值是 ____（填空）',
        answer: '-2',
        idea: '求导 $f\\prime(x)=3x^2-3$，令其为 0 得驻点，判断极小值。',
        steps: [
          { m: 'f\\prime(x)=3x^2-3=0 \\Rightarrow x=\\pm1',
            t: '求驻点。' },
          { m: 'f(1)=1-3=-2,\\quad f(-1)=-1+3=2',
            t: '代回原函数。' },
          { m: '\\text{极小值} = f(1) = -2',
            t: '导数由负变正处取极小。' }
        ],
        pitfall: '极小值是函数值 $f(1)=-2$，不是驻点 $x=1$。'
      };
    }
  });

  /* F9 导数最值（困难） */
  QB.register({
    id: 'gk-F9', type: 'gkFill', difficulty: 'hard', kind: 'fill', form: 'fill', tech: '导数与最值',
    gen: function (rng) {
      return {
        params: {},
        question: '函数 $f(x)=e^{x}-x$ 的最小值是 ____（填空）',
        answer: '1',
        idea: '求导 $f\\prime(x)=e^x-1$，令其为 0 得 $x=0$，判断这是最小值点。',
        steps: [
          { m: 'f\\prime(x)=e^{x}-1=0 \\Rightarrow x=0',
            t: '求驻点。' },
          { m: 'x<0 \\text{ 时 } f\\prime<0,\\ x>0 \\text{ 时 } f\\prime>0',
            t: '导数由负变正，是极小值点，也是全局最小。' },
          { m: 'f(0)=e^{0}-0=1',
            t: '代回原函数得最小值 1。' }
        ],
        pitfall: '$e^0=1$，最小值是函数值 1，不是 0。'
      };
    }
  });

  /* F10 数列递推（困难） */
  QB.register({
    id: 'gk-F10', type: 'gkFill', difficulty: 'hard', kind: 'fill', form: 'fill', tech: '数列递推',
    gen: function (rng) {
      return {
        params: {},
        question: '数列 $\\{a_n\\}$ 满足 $a_1=1$，$a_{n+1}=2a_n+1$，则 $a_4=$ ____（填空）',
        answer: '15',
        idea: '递推式逐项代入：$a_2,a_3,a_4$ 依次算出。',
        steps: [
          { m: 'a_2=2a_1+1=3',
            t: '代入 $n=1$。' },
          { m: 'a_3=2a_2+1=7',
            t: '代入 $n=2$。' },
          { m: 'a_4=2a_3+1=15',
            t: '代入 $n=3$。' }
        ],
        pitfall: '递推是"前一项的 2 倍再加 1"，别漏掉那个 +1。'
      };
    }
  });

  /* ================= 解答题 ================= */

  /* GS0 解直角三角形（基础） */
  QB.register({
    id: 'gk-GS0', type: 'gkSolve', difficulty: 'easy', kind: 'solve', form: 'solution', tech: '勾股定理',
    gen: function (rng) {
      var q = {
        params: {},
        question: '在 $\\triangle ABC$ 中，$C=90^{\\circ}$，$a=3$，$b=4$，求斜边 $c$ 的长。',
        answer: '由勾股定理 $c=\\sqrt{a^2+b^2}=\\sqrt{3^2+4^2}=5$。',
        idea: '直角三角形中，斜边平方等于两直角边平方和。',
        steps: [
          { m: 'c^2=a^2+b^2=9+16=25',
            t: '代入勾股定理。' },
          { m: 'c=5',
            t: '开平方取正值。' }
        ],
        pitfall: '斜边对应的是 $90^{\\circ}$ 角的对边，平方和开根号取正。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });

  /* GS1 解三角形 */
  QB.register({
    id: 'gk-GS1', type: 'gkSolve', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '正弦定理',
    gen: function (rng) {
      var q = {
        params: {},
        question: '在 $\\triangle ABC$ 中，$a=\\sqrt{3}$，$b=1$，$A=60^{\\circ}$，求角 $B$ 的大小。',
        answer: '由正弦定理 $\\frac{a}{\\sin A}=\\frac{b}{\\sin B}$ 得 $\\sin B=\\frac{b\\sin A}{a}=\\frac{1\\cdot\\frac{\\sqrt3}{2}}{\\sqrt3}=\\frac12$，又 $b<a$ 故 $B$ 为锐角，所以 $B=30^{\\circ}$。',
        idea: '已知两边及其中一边的对角，用正弦定理求另一角；注意"大边对大角"判断取舍。',
        steps: [
          { m: '\\frac{a}{\\sin A}=\\frac{b}{\\sin B} \\Rightarrow \\sin B=\\frac{b\\sin A}{a}',
            t: '写出正弦定理并解出 $\\sin B$。' },
          { m: '\\sin B=\\frac{1\\times\\frac{\\sqrt3}{2}}{\\sqrt3}=\\frac12',
            t: '代入数值。' },
          { m: 'b<a \\Rightarrow B<A=60^{\\circ} \\Rightarrow B=30^{\\circ}',
            t: '用"大边对大角"排除 $150^{\\circ}$。' }
        ],
        pitfall: '$\\sin B=\\frac12$ 有两解 $30^{\\circ}$ 或 $150^{\\circ}$，要用"大边对大角"取舍。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });

  /* GS2 数列 */
  QB.register({
    id: 'gk-GS2', type: 'gkSolve', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '等差数列',
    gen: function (rng) {
      var q = {
        params: {},
        question: '等差数列 $\\{a_n\\}$ 中，$a_2+a_5=12$，$a_3=5$。\n(1) 求 $a_1$ 与公差 $d$；\n(2) 求前 10 项和 $S_{10}$。',
        answer: '(1) $a_1+2d=5$，$2a_1+5d=12$，解得 $a_1=1,\\ d=2$；(2) $S_{10}=10a_1+45d=10+90=100$。',
        idea: '把条件都写成 $a_1$ 和 $d$ 的方程，解方程组；求和用 $S_n=na_1+\\frac{n(n-1)}{2}d$。',
        steps: [
          { m: 'a_2+a_5=(a_1+d)+(a_1+4d)=2a_1+5d=12',
            t: '两条件都化成 $a_1,d$。' },
          { m: 'a_3=a_1+2d=5',
            t: '第二个方程。' },
          { m: '2a_1+5d=12,\\ a_1+2d=5 \\Rightarrow d=2,\\ a_1=1',
            t: '解方程组。' },
          { m: 'S_{10}=10\\times1+\\frac{10\\times9}{2}\\times2=10+90=100',
            t: '代入求和公式。' }
        ],
        pitfall: '解方程组时 $a_1$ 和 $d$ 别代错；$S_{10}$ 的公式里系数是 45 倍公差。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });

  /* GS3 立体几何体积 */
  QB.register({
    id: 'gk-GS3', type: 'gkSolve', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '三棱锥体积',
    gen: function (rng) {
      var q = {
        params: {},
        question: '正方体 $ABCD-A_1B_1C_1D_1$ 的棱长为 2，求三棱锥 $A_1-ABD$ 的体积。',
        answer: '$V=\\frac13\\cdot S_{\\triangle ABD}\\cdot AA_1=\\frac13\\cdot\\frac12\\cdot2\\cdot2\\cdot2=\\frac43$。',
        idea: '三棱锥体积 $V=\\frac13Sh$；这里底面 $\\triangle ABD$ 是等腰直角三角形，高是 $AA_1$。',
        steps: [
          { m: 'S_{\\triangle ABD}=\\frac12\\cdot AB\\cdot AD=\\frac12\\cdot2\\cdot2=2',
            t: '底面是直角边为 2 的直角三角形。' },
          { m: 'h=AA_1=2',
            t: '棱 $AA_1$ 垂直于底面。' },
          { m: 'V=\\frac13\\times2\\times2=\\frac43',
            t: '代入体积公式。' }
        ],
        pitfall: '三棱锥体积有 $\\frac13$，不是 $Sh$；高是 $AA_1$ 而不是面对角线。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });

  /* GS4 直线与圆 */
  QB.register({
    id: 'gk-GS4', type: 'gkSolve', difficulty: 'hard', kind: 'solve', form: 'solution', tech: '直线与圆',
    gen: function (rng) {
      var q = {
        params: {},
        question: '已知圆 $O:x^2+y^2=4$，直线 $l:y=x+1$。求直线 $l$ 被圆 $O$ 截得的弦长。',
        answer: '圆心到直线距离 $d=\\frac{1}{\\sqrt2}=\\frac{\\sqrt2}{2}$，弦长 $=2\\sqrt{r^2-d^2}=2\\sqrt{4-\\frac12}=\\sqrt{14}$。',
        idea: '弦长公式：$2\\sqrt{r^2-d^2}$，其中 $d$ 是圆心到直线的距离。',
        steps: [
          { m: 'd=\\frac{|0-0+1|}{\\sqrt{1^2+(-1)^2}}=\\frac{1}{\\sqrt2}=\\frac{\\sqrt2}{2}',
            t: '点到直线距离公式（直线写成 $x-y+1=0$）。' },
          { m: 'L=2\\sqrt{r^2-d^2}=2\\sqrt{4-\\frac12}',
            t: '半弦长 $\\sqrt{r^2-d^2}$，乘 2。' },
          { m: '=2\\cdot\\frac{\\sqrt{14}}{2}=\\sqrt{14}',
            t: '化简。' }
        ],
        pitfall: '距离公式分母是 $\\sqrt{A^2+B^2}=\\sqrt2$；弦长是 $2\\sqrt{r^2-d^2}$ 不是 $\\sqrt{r^2-d^2}$。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });

  /* GS5 概率 */
  QB.register({
    id: 'gk-GS5', type: 'gkSolve', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '相互独立事件',
    gen: function (rng) {
      var q = {
        params: {},
        question: '甲、乙两人投篮，命中率分别为 $0.6$、$0.5$，各投一次。求恰有一人命中的概率。',
        answer: '恰有一人命中 = 甲中乙不中 + 甲不中乙中：$0.6\\times0.5+0.4\\times0.5=0.5$。',
        idea: '"恰有一人"分两种情况，且两种情况互斥，概率相加；各次投篮相互独立。',
        steps: [
          { m: 'P(\\text{甲中乙不中}) = 0.6\\times(1-0.5)=0.3',
            t: '甲中且乙不中。' },
          { m: 'P(\\text{甲不中乙中}) = (1-0.6)\\times0.5=0.2',
            t: '甲不中且乙中。' },
          { m: 'P = 0.3+0.2=0.5',
            t: '两种情况相加。' }
        ],
        pitfall: '别用 $1-P(\\text{都不中})$（那是"至少一人命中"）；"恰有一人"是两种互斥情况之和。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });

  /* GS6 导数最值 */
  QB.register({
    id: 'gk-GS6', type: 'gkSolve', difficulty: 'hard', kind: 'solve', form: 'solution', tech: '导数求最值',
    gen: function (rng) {
      var q = {
        params: {},
        question: '已知函数 $f(x)=x^3-3x^2+2$，求 $f(x)$ 在区间 $[0,3]$ 上的最大值。',
        answer: '$f\\prime(x)=3x^2-6x=3x(x-2)$，驻点 $x=0,2$；比较端点与驻点：$f(0)=2$，$f(2)=-2$，$f(3)=2$，故最大值为 2。',
        idea: '闭区间上的最值：比较所有驻点与端点的函数值，取最大。',
        steps: [
          { m: 'f\\prime(x)=3x^2-6x=3x(x-2) \\Rightarrow x=0,\\ 2',
            t: '求导并找驻点。' },
          { m: 'f(0)=2,\\quad f(2)=8-12+2=-2,\\quad f(3)=27-27+2=2',
            t: '计算候选点的函数值。' },
          { m: '\\max = 2',
            t: '取最大：2（在 $x=0$ 和 $x=3$ 处取到）。' }
        ],
        pitfall: '闭区间最值一定要和端点比较；$x=0$ 是端点也是驻点。'
      };
      q.options = []; q.answerIndex = -1;
      return q;
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
