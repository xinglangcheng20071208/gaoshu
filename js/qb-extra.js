/* ============================================================
 * 题库：定积分的应用（8 个模板）+ 微分方程（9 个模板）
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* ---------- 定积分的应用 ---------- */

  /* Ap1 基础：直线下方面积 */
  QB.register({
    id: 'defapp-Ap1', type: 'defapp', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var k = ri(2, 3, rng), a = ri(2, 3, rng);
        var correct = frac(k * a * a, 2);
        var d = bo(correct, [String(k * a * a), frac(k * a, 2), frac(k * k * a, 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { k: k, a: a },
          question: '由直线 $y=' + k + 'x$、$x$ 轴及直线 $x=' + a + '$ 所围成平面图形的面积是',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '图形是一个直角三角形：底边 ' + a + '，高 $' + k + '\\times' + a + '=' + (k * a) + '$。也可以用定积分 $\\int_0^{' + a + '}' + k + 'x\\,\\mathrm{d}x$。',
          steps: [
            { m: 'S = \\int_0^{' + a + '} ' + k + 'x\\,\\mathrm{d}x',
              t: '面积等于函数在区间上的定积分。' },
            { m: '= ' + k + '\\cdot\\frac{x^2}{2}\\bigg|_0^{' + a + '} = ' + k + '\\times\\frac{' + (a * a) + '}{2} = ' + correct,
              t: '$x$ 的原函数是 $\\frac{x^2}{2}$，代入上限 ' + a + ' 再乘 ' + k + '。（和三角形面积公式 $\\frac{1}{2}\\times' + a + '\\times' + (k * a) + '$ 一致）' }
          ],
          pitfall: '三角形面积要乘 $\\frac{1}{2}$。'
        };
      }
      throw new Error('Ap1 retry fail');
    }
  });

  /* Ap2 基础：抛物线下方面积 */
  QB.register({
    id: 'defapp-Ap2', type: 'defapp', difficulty: 'easy',
    gen: function (rng) {
      var a = ri(2, 3, rng);
      var correct = frac(a * a * a, 3);
      var d = bo(correct, [String(a * a * a), frac(a * a, 3), frac(a * a * a, 2)], rng);
      return {
        params: { a: a },
        question: '由曲线 $y=x^2$、$x$ 轴及直线 $x=' + a + '$ 所围成平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '面积 = 函数在 $[0,' + a + ']$ 上的定积分。',
        steps: [
          { m: 'S = \\int_0^{' + a + '} x^2\\,\\mathrm{d}x',
            t: '曲线在 $x$ 轴上方，面积直接积分。' },
          { m: '= \\frac{x^3}{3}\\bigg|_0^{' + a + '} = \\frac{' + (a * a * a) + '}{3} - 0 = ' + correct,
            t: '$x^2$ 的原函数是 $\\frac{x^3}{3}$，代入上下限。' }
        ],
        pitfall: '$x^2$ 积分是 $\\frac{x^3}{3}$，除以的是 3。'
      };
    }
  });

  /* Ap3 进阶：两条曲线围成面积 y=x² 与 y=ax */
  QB.register({
    id: 'defapp-Ap3', type: 'defapp', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(2, 3, rng);
      var correct = frac(a * a * a, 6);
      var d = bo(correct, [frac(a * a * a, 2), frac(a * a * a, 3), String(a * a * a)], rng);
      return {
        params: { a: a },
        question: '由抛物线 $y=x^2$ 与直线 $y=' + a + 'x$ 所围成平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两条曲线围成的面积 = $\\int$（上面的曲线 − 下面的曲线）。先求交点确定上下限。',
        steps: [
          { m: 'x^2 = ' + a + 'x \\Rightarrow x = 0 \\text{ 或 } x = ' + a,
            t: '先求交点：解方程 $x^2=' + a + 'x$，得 $x=0$ 和 $x=' + a + '$。' },
          { m: 'S = \\int_0^{' + a + '} (' + a + 'x - x^2)\\,\\mathrm{d}x',
            t: '在 $(0,' + a + ')$ 内直线 $' + a + 'x$ 在抛物线 $x^2$ 上方，所以被积函数是 $' + a + 'x-x^2$。' },
          { m: '= \\left(\\frac{' + a + 'x^2}{2}-\\frac{x^3}{3}\\right)\\bigg|_0^{' + a + '} = \\frac{' + (a * a * a) + '}{2}-\\frac{' + (a * a * a) + '}{3} = ' + correct,
            t: '积分并代入：$\\frac{a^3}{2}-\\frac{a^3}{3}=\\frac{a^3}{6}$。' }
        ],
        pitfall: '是"上面的减下面的"，别写成 $x^2-' + a + 'x$。'
      };
    }
  });

  /* Ap4 进阶：旋转体体积 y=√x 绕 x 轴 */
  QB.register({
    id: 'defapp-Ap4', type: 'defapp', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(3, 4, rng);
      var correct = '\\frac{' + (a * a) + '\\pi}{2}';
      var d = bo(correct, [String(a * a) + '\\pi', '\\frac{' + a + '\\pi}{2}', '\\frac{' + (a * a) + '\\pi}{4}'], rng);
      return {
        params: { a: a },
        question: '由曲线 $y=\\sqrt{x}$、直线 $x=' + a + '$ 及 $x$ 轴围成的图形绕 $x$ 轴旋转一周所得旋转体的体积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '绕 $x$ 轴旋转用圆盘法：$V=\\pi\\int y^2\\mathrm{d}x$。每个截面的面积是 $\\pi y^2$。',
        steps: [
          { m: 'V = \\pi\\int_0^{' + a + '} y^2\\,\\mathrm{d}x = \\pi\\int_0^{' + a + '} x\\,\\mathrm{d}x',
            t: '圆盘法：旋转半径是 $y=\\sqrt{x}$，截面圆面积 $\\pi y^2=\\pi x$，再沿 $x$ 轴积分。' },
          { m: '= \\pi\\cdot\\frac{x^2}{2}\\bigg|_0^{' + a + '} = \\pi\\times\\frac{' + (a * a) + '}{2}',
            t: '$x$ 的原函数是 $\\frac{x^2}{2}$。' },
          { m: '= \\frac{' + (a * a) + '\\pi}{2}',
            t: '结果是 $\\frac{' + (a * a) + '\\pi}{2}$。（这正好是一个圆锥的体积：底面半径 $\\sqrt{' + a + '}$，高 ' + a + '）' }
        ],
        pitfall: '截面半径是 $y$ 不是 $y^2$；面积公式里 $\\pi$ 不能丢。'
      };
    }
  });

  /* Ap5 进阶：旋转体体积 y=kx 绕 x 轴 */
  QB.register({
    id: 'defapp-Ap5', type: 'defapp', difficulty: 'medium',
    gen: function (rng) {
      var k = 2, a = ri(2, 3, rng);
      var correct = '\\frac{' + (k * k * a * a * a) + '\\pi}{3}';
      var d = bo(correct, ['\\frac{' + (k * a * a * a) + '\\pi}{3}', String(k * k * a * a * a) + '\\pi', '\\frac{' + (k * k * a * a * a) + '\\pi}{2}'], rng);
      return {
        params: { k: k, a: a },
        question: '由直线 $y=' + k + 'x$、直线 $x=' + a + '$ 及 $x$ 轴围成的图形绕 $x$ 轴旋转一周所得旋转体的体积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '圆盘法：$V=\\pi\\int_0^{' + a + '}(' + k + 'x)^2\\mathrm{d}x$。注意半径要平方。',
        steps: [
          { m: 'V = \\pi\\int_0^{' + a + '} (' + k + 'x)^2\\,\\mathrm{d}x = \\pi\\int_0^{' + a + '} ' + (k * k) + 'x^2\\,\\mathrm{d}x',
            t: '截面半径是 $' + k + 'x$，面积 $\\pi\\times(' + k + 'x)^2=\\pi\\times' + (k * k) + 'x^2$。' },
          { m: '= \\pi\\cdot' + (k * k) + '\\cdot\\frac{x^3}{3}\\bigg|_0^{' + a + '} = \\pi\\times' + (k * k) + '\\times\\frac{' + (a * a * a) + '}{3}',
            t: '积分 $x^2$ 得 $\\frac{x^3}{3}$，代入上限。' },
          { m: '= \\frac{' + (k * k * a * a * a) + '\\pi}{3}',
            t: '系数相乘得到最终结果。' }
        ],
        pitfall: '半径是 $' + k + 'x$，平方后系数是 $' + (k * k) + '$，别丢了。'
      };
    }
  });

  /* Ap6 困难：旋转体体积 y=x² 绕 x 轴 */
  QB.register({
    id: 'defapp-Ap6', type: 'defapp', difficulty: 'hard',
    gen: function (rng) {
      var a = ri(2, 3, rng);
      var correct = '\\frac{' + (a * a * a * a * a) + '\\pi}{5}';
      var d = bo(correct, ['\\frac{' + (a * a * a * a) + '\\pi}{2}', '\\frac{' + (a * a * a * a * a) + '\\pi}{3}', '\\frac{' + (a * a * a * a * a) + '\\pi}{2}'], rng);
      return {
        params: { a: a },
        question: '由曲线 $y=x^2$、直线 $x=' + a + '$ 及 $x$ 轴围成的图形绕 $x$ 轴旋转一周所得旋转体的体积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '圆盘法：$V=\\pi\\int_0^{' + a + '} y^2\\mathrm{d}x=\\pi\\int_0^{' + a + '} x^4\\mathrm{d}x$。',
        steps: [
          { m: 'V = \\pi\\int_0^{' + a + '} (x^2)^2\\,\\mathrm{d}x = \\pi\\int_0^{' + a + '} x^4\\,\\mathrm{d}x',
            t: '截面半径是 $y=x^2$，面积 $\\pi(x^2)^2=\\pi x^4$。' },
          { m: '= \\pi\\cdot\\frac{x^5}{5}\\bigg|_0^{' + a + '} = \\pi\\times\\frac{' + (a * a * a * a * a) + '}{5}',
            t: '$x^4$ 的原函数是 $\\frac{x^5}{5}$。' },
          { m: '= \\frac{' + (a * a * a * a * a) + '\\pi}{5}',
            t: '代入上下限得到结果。' }
        ],
        pitfall: '$(x^2)^2=x^4$ 而不是 $x^{2\\times2}=x^4$…小心指数运算是相乘：$2\\times2=4$。'
      };
    }
  });

  /* Ap7 进阶：y=sinx 与 x 轴面积 */
  QB.register({
    id: 'defapp-Ap7', type: 'defapp', difficulty: 'medium',
    gen: function (rng) {
      var correct = '2';
      var d = bo(correct, ['\\pi', '1', '0'], rng);
      return {
        params: {},
        question: '由曲线 $y=\\sin x$ 与 $x$ 轴在区间 $[0,\\pi]$ 上围成的平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\sin x$ 在 $[0,\\pi]$ 上非负，面积直接积分。',
        steps: [
          { m: 'S = \\int_0^{\\pi} \\sin x\\,\\mathrm{d}x',
            t: '在 $[0,\\pi]$ 上 $\\sin x\\ge0$，图像都在 $x$ 轴上方，直接积分。' },
          { m: '= -\\cos x\\big|_0^{\\pi} = -\\cos\\pi + \\cos 0 = 1+1 = 2',
            t: '$\\sin$ 的原函数是 $-\\cos$，代入上下限。' }
        ],
        pitfall: '如果区间包含 $\\sin x$ 为负的部分，面积要分段加绝对值。'
      };
    }
  });

  /* Ap8 困难：y=√x 下方面积 */
  QB.register({
    id: 'defapp-Ap8', type: 'defapp', difficulty: 'hard',
    gen: function (rng) {
      var a = [4, 9][ri(0, 1, rng)];
      var s = Math.sqrt(a);
      var correct = frac(2 * a * s, 3);
      var d = bo(correct, [frac(a * s, 3), frac(2 * a * a, 3), String(a * s)], rng);
      return {
        params: { a: a },
        question: '由曲线 $y=\\sqrt{x}$、$x$ 轴及直线 $x=' + a + '$ 所围成平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '把 $\\sqrt{x}$ 写成 $x^{1/2}$ 再积分：$\\int x^{1/2}\\mathrm{d}x=\\frac{2}{3}x^{3/2}$。',
        steps: [
          { m: 'S = \\int_0^{' + a + '} x^{1/2}\\,\\mathrm{d}x',
            t: '$\\sqrt{x}=x^{1/2}$，幂函数积分：指数加 1 变 $\\frac{3}{2}$，除以 $\\frac{3}{2}$ 等于乘 $\\frac{2}{3}$。' },
          { m: '= \\frac{2}{3}x^{3/2}\\bigg|_0^{' + a + '} = \\frac{2}{3}\\times' + a + '^{3/2}',
            t: '代入上限：$' + a + '^{3/2}=' + a + '\\sqrt{' + a + '}=' + (a * s) + '$。' },
          { m: '= \\frac{2}{3}\\times' + (a * s) + ' = ' + correct,
            t: '算出来是 ' + correct + '。' }
        ],
        pitfall: '指数是 $\\frac{3}{2}$，系数是 $\\frac{2}{3}$，两者互为倒数。'
      };
    }
  });

  /* ---------- 微分方程 ---------- */

  /* O1 基础：y'=kx 直接积分 */
  QB.register({
    id: 'ode-O1', type: 'ode', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '\\frac{' + k + 'x^2}{2}+C';
      var d = bo(correct, [k + 'x^2+C', k + 'x+C', '\\frac{' + k + 'x^2}{2}'], rng);
      return {
        params: { k: k },
        question: '微分方程 $y\\prime=' + k + 'x$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '最简单的微分方程：两边同时对 $x$ 积分就得到通解。',
        steps: [
          { m: 'y = \\int ' + k + 'x\\,\\mathrm{d}x',
            t: '两边积分：$y\\prime$ 积分回 $y$，右边积分。' },
          { m: '= \\frac{' + k + 'x^2}{2} + C',
            t: '$' + k + 'x$ 积分：系数 ' + k + ' 保留，$x$ 积分得 $\\frac{x^2}{2}$，再加任意常数 $C$。' }
        ],
        pitfall: '通解必须带任意常数 $C$。'
      };
    }
  });

  /* O2 基础：y'=y 通解 */
  QB.register({
    id: 'ode-O2', type: 'ode', difficulty: 'easy',
    gen: function (rng) {
      var correct = 'Ce^{x}';
      var d = bo(correct, ['e^{x}', 'C+e^{x}', 'xe^{x}'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime=y$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分离变量：$\\frac{\\mathrm{d}y}{y}=\\mathrm{d}x$，两边积分。',
        steps: [
          { m: '\\frac{\\mathrm{d}y}{y} = \\mathrm{d}x',
            t: '把 $y$ 的都挪到左边，$x$ 的挪到右边（分离变量）。' },
          { m: '\\ln|y| = x + C_1',
            t: '两边积分：$\\int\\frac{1}{y}\\mathrm{d}y=\\ln|y|$，$\\int\\mathrm{d}x=x$。' },
          { m: 'y = Ce^{x}',
            t: '两边取 $e$ 的幂：$|y|=e^{x+C_1}=e^{C_1}e^x$，把常数写成 $C$。' }
        ],
        pitfall: '通解是 $Ce^x$（含任意常数）；$e^x$ 只是 $C=1$ 时的一个特解。'
      };
    }
  });

  /* O3 进阶：y'=ky 通解 */
  QB.register({
    id: 'ode-O3', type: 'ode', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = 'Ce^{' + k + 'x}';
      var d = bo(correct, ['Ce^{x}', 'e^{' + k + 'x}', 'Ce^{x/' + k + '}'], rng);
      return {
        params: { k: k },
        question: '微分方程 $y\\prime=' + k + 'y$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分离变量：$\\frac{\\mathrm{d}y}{y}=' + k + '\\mathrm{d}x$，两边积分，指数上是 $' + k + 'x$。',
        steps: [
          { m: '\\frac{\\mathrm{d}y}{y} = ' + k + '\\,\\mathrm{d}x',
            t: '分离变量。' },
          { m: '\\ln|y| = ' + k + 'x + C_1',
            t: '两边积分：右边 $' + k + 'x$ 积分是 $' + k + 'x$。' },
          { m: 'y = Ce^{' + k + 'x}',
            t: '取指数：$|y|=e^{' + k + 'x+C_1}$，写成 $Ce^{' + k + 'x}$。' }
        ],
        pitfall: '指数上是 $' + k + 'x$（系数 ' + k + ' 在指数里），不是 $Ce^{' + k + '}$。'
      };
    }
  });

  /* O4 进阶：y'=y/x 通解 */
  QB.register({
    id: 'ode-O4', type: 'ode', difficulty: 'medium',
    gen: function (rng) {
      var correct = 'Cx';
      var d = bo(correct, ['Ce^{x}', '\\frac{C}{x}', 'C+x'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime=\\frac{y}{x}$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分离变量：$\\frac{\\mathrm{d}y}{y}=\\frac{\\mathrm{d}x}{x}$，两边积分得 $\\ln|y|=\\ln|x|+C_1$。',
        steps: [
          { m: '\\frac{\\mathrm{d}y}{y} = \\frac{\\mathrm{d}x}{x}',
            t: '分离变量：$y$ 归左边，$x$ 归右边。' },
          { m: '\\ln|y| = \\ln|x| + C_1',
            t: '两边积分：$\\frac{1}{y}$ 积分是 $\\ln|y|$，$\\frac{1}{x}$ 积分是 $\\ln|x|$。' },
          { m: 'y = Cx',
            t: '取指数：$|y|=e^{C_1}|x|$，即 $y=Cx$。' }
        ],
        pitfall: '$\\ln|y|=\\ln|x|$ 直接推出 $y=x$ 只对了一半，别忘了任意常数。'
      };
    }
  });

  /* O5 进阶：y'=2kxy 通解 */
  QB.register({
    id: 'ode-O5', type: 'ode', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(1, 2, rng);
      var correct = 'Ce^{' + k + 'x^2}';
      var d = bo(correct, ['Ce^{' + (2 * k) + 'x}', 'Ce^{' + k + 'x}', k + 'Cx^2'], rng);
      return {
        params: { k: k },
        question: '微分方程 $y\\prime=' + (2 * k) + 'xy$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分离变量：$\\frac{\\mathrm{d}y}{y}=' + (2 * k) + 'x\\,\\mathrm{d}x$。右边积分时注意 $x$ 积分成 $\\frac{x^2}{2}$。',
        steps: [
          { m: '\\frac{\\mathrm{d}y}{y} = ' + (2 * k) + 'x\\,\\mathrm{d}x',
            t: '分离变量。' },
          { m: '\\ln|y| = ' + (2 * k) + '\\cdot\\frac{x^2}{2} + C_1 = ' + k + 'x^2 + C_1',
            t: '右边积分：$' + (2 * k) + 'x$ 积分得 $' + (2 * k) + '\\times\\frac{x^2}{2}=' + k + 'x^2$。' },
          { m: 'y = Ce^{' + k + 'x^2}',
            t: '取指数得通解，指数上是 $' + k + 'x^2$。' }
        ],
        pitfall: '右边的 $' + (2 * k) + '\\times\\frac{x^2}{2}$ 要化简成 $' + k + 'x^2$，别直接写成 $' + (2 * k) + 'x^2$。'
      };
    }
  });

  /* O6 困难：一阶线性 y'+ay=b */
  QB.register({
    id: 'ode-O6', type: 'ode', difficulty: 'hard',
    gen: function (rng) {
      var b = ri(2, 3, rng);
      var a = 2;
      var head = (b === 2) ? '1' : '\\frac{3}{2}';
      var correct = head + '+Ce^{-2x}';
      var d = bo(correct, [head + '+Ce^{2x}', String(b) + '+Ce^{-2x}', 'Ce^{-2x}'], rng);
      return {
        params: { a: a, b: b },
        question: '微分方程 $y\\prime+2y=' + b + '$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '一阶线性方程 $y\\prime+P(x)y=Q(x)$ 用积分因子法：乘 $e^{\\int P\\mathrm{d}x}=e^{2x}$。',
        steps: [
          { m: 'e^{\\int 2\\mathrm{d}x} = e^{2x}',
            t: '先算积分因子：$P(x)=2$，$e^{\\int2\\mathrm{d}x}=e^{2x}$。' },
          { m: 'y\\prime e^{2x} + 2y e^{2x} = ' + b + 'e^{2x} \\Rightarrow (ye^{2x})\\prime = ' + b + 'e^{2x}',
            t: '方程两边同乘 $e^{2x}$，左边正好凑成乘积的导数 $(ye^{2x})\\prime$。' },
          { m: 'ye^{2x} = \\frac{' + b + '}{2}e^{2x} + C \\Rightarrow y = \\frac{' + b + '}{2} + Ce^{-2x}',
            t: '两边积分，再两边除以 $e^{2x}$（即乘 $e^{-2x}$），得到通解。' }
        ],
        pitfall: '积分后两边除以 $e^{2x}$，常数项 $C$ 变成 $Ce^{-2x}$，指数是负的。'
      };
    }
  });

  /* O7 困难：初值问题 y'=ky, y(0)=y0 */
  QB.register({
    id: 'ode-O7', type: 'ode', difficulty: 'hard',
    gen: function (rng) {
      var k = ri(2, 3, rng), y0 = ri(2, 3, rng);
      var correct = y0 + 'e^{' + k + 'x}';
      var d = bo(correct, ['Ce^{' + k + 'x}', y0 + 'e^{x}', y0 + '+e^{' + k + 'x}'], rng);
      return {
        params: { k: k, y0: y0 },
        question: '求微分方程 $y\\prime=' + k + 'y$ 满足初始条件 $y(0)=' + y0 + '$ 的特解',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先求通解 $y=Ce^{' + k + 'x}$，再用初始条件确定常数 $C$。',
        steps: [
          { m: 'y = Ce^{' + k + 'x}',
            t: '分离变量得到通解。' },
          { m: 'y(0) = Ce^{0} = C = ' + y0,
            t: '代入 $x=0$：$e^0=1$，所以 $C=' + y0 + '$。' },
          { m: 'y = ' + y0 + 'e^{' + k + 'x}',
            t: '把 $C=' + y0 + '$ 代回通解，得到特解。' }
        ],
        pitfall: '初始条件是定 $C$ 用的，不是把 $C$ 换成 $x$。'
      };
    }
  });

  /* O8 进阶：y''=0 通解 */
  QB.register({
    id: 'ode-O8', type: 'ode', difficulty: 'medium',
    gen: function (rng) {
      var correct = 'C_1x+C_2';
      var d = bo(correct, ['Cx', 'C_1x^2+C_2', 'C_1+C_2'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime\\prime=0$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '二阶方程积分两次，每积一次出一个常数。',
        steps: [
          { m: 'y\\prime = C_1',
            t: '第一次积分：谁的导数是 0？常数。所以 $y\\prime=C_1$。' },
          { m: 'y = C_1x + C_2',
            t: '第二次积分：$C_1$ 积分得 $C_1x$，再加新常数 $C_2$。' }
        ],
        pitfall: '二阶方程的通解要有两个独立的任意常数。'
      };
    }
  });

  /* O9 困难：初值问题 y''=a, y'(0)=1, y(0)=0 */
  QB.register({
    id: 'ode-O9', type: 'ode', difficulty: 'hard',
    gen: function (rng) {
      var a = [2, 4][ri(0, 1, rng)];
      var half = a / 2;
      var correct = (half === 1 ? '' : half) + 'x^2+x';
      var d = bo(correct, [correct + '+1', (half === 1 ? '' : half) + 'x^2', correct + '-1'], rng);
      return {
        params: { a: a },
        question: '求微分方程 $y\\prime\\prime=' + a + '$ 满足 $y\\prime(0)=1$、$y(0)=0$ 的特解',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '积分两次，每次积分产生一个常数，用两个初始条件逐个确定。',
        steps: [
          { m: 'y\\prime = ' + a + 'x + C_1',
            t: '第一次积分：$' + a + '$ 积分得 $' + a + 'x$，加常数 $C_1$。' },
          { m: 'y\\prime(0) = ' + a + '\\times0 + C_1 = 1 \\Rightarrow C_1 = 1',
            t: '用第一个初始条件：$x=0$ 时代入 $y\\prime=1$，解出 $C_1=1$。' },
          { m: 'y = ' + half + 'x^2 + x + C_2,\\quad y(0) = C_2 = 0 \\Rightarrow y = ' + correct,
            t: '再积分：$' + a + 'x+1$ 积分得 $' + half + 'x^2+x$，加 $C_2$；用 $y(0)=0$ 得 $C_2=0$。' }
        ],
        pitfall: '两个初始条件分别确定两个常数，别只用一个。'
      };
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
