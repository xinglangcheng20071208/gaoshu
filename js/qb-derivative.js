/* ============================================================
 * 题库：导数与微分（19 个模板：求导 12 + 微分 7）
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, num = QB.num, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* D1 基础：幂函数求导并代入 */
  QB.register({
    id: 'derivative-D1', type: 'derivative', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var n = ri(3, 6, rng), c = ri(2, 3, rng);
        var correct = String(n * Math.pow(c, n - 1));
        var d = bo(correct, [String(Math.pow(c, n)), String(n * Math.pow(c, n)), String((n - 1) * Math.pow(c, n - 1))], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { n: n, c: c },
          question: '设 $f(x)=x^{' + n + '}$，求 $f\\prime(' + c + ')$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '幂函数求导口诀：指数搬下来当系数，指数减 1。先求导，再代入 $x$ 的值。',
          steps: [
            { m: 'f\\prime(x) = ' + n + 'x^{' + (n - 1) + '}',
              t: '指数 ' + n + ' 搬到前面当系数，新的指数是 ' + (n - 1) + '。' },
            { m: 'f\\prime(' + c + ') = ' + n + '\\cdot ' + c + '^{' + (n - 1) + '} = ' + n + '\\times ' + Math.pow(c, n - 1) + ' = ' + correct,
              t: '把 $x=' + c + '$ 代进去：先算 $' + c + '^{' + (n - 1) + '}=' + Math.pow(c, n - 1) + '$，再乘 ' + n + '。' }
          ],
          pitfall: '顺序不能反：先求导再代入。先代入再"求导"得 0，是错的。'
        };
      }
      throw new Error('D1 retry fail');
    }
  });

  /* D2 基础：sin(kx) 求导 */
  QB.register({
    id: 'derivative-D2', type: 'derivative', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = k + '\\cos(' + k + 'x)';
      var d = bo(correct, ['\\cos(' + k + 'x)', '-' + k + '\\cos(' + k + 'x)', k + '\\sin(' + k + 'x)'], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin(' + k + 'x)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '复合函数求导：外层 $\\sin$ 求导得 $\\cos$，再乘内层 $' + k + 'x$ 的导数 $' + k + '$。',
        steps: [
          { m: '(\\sin\\Box)\\prime = \\cos\\Box\\cdot\\Box\\prime',
            t: '链式法则：先对最外层的 $\\sin$ 求导（得到 $\\cos$，里面不变），再乘上里面的导数。' },
          { m: '= \\cos(' + k + 'x)\\cdot(' + k + 'x)\\prime = ' + k + '\\cos(' + k + 'x)',
            t: '内层 $' + k + 'x$ 的导数是 ' + k + '，所以最终结果是 ' + k + ' 乘 $\\cos(' + k + 'x)$。' }
        ],
        pitfall: '最常犯的错：忘记乘内层的导数 ' + k + '。'
      };
    }
  });

  /* D3 基础：e^(kx) 求导 */
  QB.register({
    id: 'derivative-D3', type: 'derivative', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = k + 'e^{' + k + 'x}';
      var d = bo(correct, ['e^{' + k + 'x}', k + 'e^{x}', k * k + 'e^{' + k + 'x}'], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}e^{' + k + 'x}$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$e$ 的幂求导有个好记的性质：$e^{\\Box}$ 求导等于它自己，再乘内层的导数。',
        steps: [
          { m: '(e^{\\Box})\\prime = e^{\\Box}\\cdot\\Box\\prime',
            t: '指数函数 $e^u$ 的导数是它本身 $e^u$，再乘 $u$ 的导数。' },
          { m: '= e^{' + k + 'x}\\cdot ' + k + ' = ' + k + 'e^{' + k + 'x}',
            t: '内层 $' + k + 'x$ 的导数是 ' + k + '。' }
        ],
        pitfall: '$e^{' + k + 'x}$ 求导不是 $e^{' + k + 'x}$（漏系数），也不是 $' + k + 'e^x$。'
      };
    }
  });

  /* D4 基础：ln(kx) 求导 */
  QB.register({
    id: 'derivative-D4', type: 'derivative', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 5, rng);
      var correct = '\\frac{1}{x}';
      var d = bo(correct, ['\\frac{1}{' + k + 'x}', '\\frac{' + k + '}{x}', '\\ln ' + k], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\ln(' + k + 'x)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先用对数性质拆开：$\\ln(' + k + 'x)=\\ln ' + k + '+\\ln x$。常数的导数是 0。',
        steps: [
          { m: '\\ln(' + k + 'x) = \\ln ' + k + ' + \\ln x',
            t: '对数性质：积的对数等于对数之和。' },
          { m: '(\\ln ' + k + ')\\prime = 0,\\quad (\\ln x)\\prime = \\frac{1}{x}',
            t: '$\\ln ' + k + '$ 是常数，导数为 0；$\\ln x$ 的导数是 $\\frac{1}{x}$。' },
          { m: '= \\frac{1}{x}',
            t: '所以答案是 $\\frac{1}{x}$。（用链式法则算也一致：$\\frac{1}{' + k + 'x}\\cdot ' + k + '=\\frac{1}{x}$）' }
        ],
        pitfall: '用链式法则时别忘了乘内层导数 ' + k + '——它会把分母里的 ' + k + ' 约掉。'
      };
    }
  });

  /* D5 进阶：乘积求导 x·e^(kx) */
  QB.register({
    id: 'derivative-D5', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '(1+' + k + 'x)e^{' + k + 'x}';
      var d = bo(correct, [k + 'xe^{' + k + 'x}', '(1+x)e^{' + k + 'x}', '(1+' + k + ')e^{' + k + 'x}'], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\left(xe^{' + k + 'x}\\right)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两个函数相乘，用乘法法则：$(uv)\\prime = u\\prime v + uv\\prime$。',
        steps: [
          { m: '(x e^{' + k + 'x})\\prime = (x)\\prime e^{' + k + 'x} + x(e^{' + k + 'x})\\prime',
            t: '乘法法则：前导后不导，加前不导后导。' },
          { m: '= e^{' + k + 'x} + x\\cdot ' + k + 'e^{' + k + 'x}',
            t: '第一项：$x$ 的导数是 1；第二项：$e^{' + k + 'x}$ 的导数是 $' + k + 'e^{' + k + 'x}$。' },
          { m: '= (1+' + k + 'x)e^{' + k + 'x}',
            t: '两项都有 $e^{' + k + 'x}$，提出来合并。' }
        ],
        pitfall: '乘法法则不能写成 $(uv)\\prime=u\\prime v\\prime$，那是错的。'
      };
    }
  });

  /* D6 进阶：商的求导 e^x/(x+a) */
  QB.register({
    id: 'derivative-D6', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var numTop = (a === 1) ? 'x' : '(x+' + (a - 1) + ')';
      var correct = '\\frac{' + numTop + 'e^{x}}{(x+' + a + ')^2}';
      var d = bo(correct, ['\\frac{e^{x}}{(x+' + a + ')^2}', '\\frac{(x+' + (a + 1) + ')e^{x}}{(x+' + a + ')^2}', '-\\frac{e^{x}}{(x+' + a + ')^2}'], rng);
      return {
        params: { a: a },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\frac{e^{x}}{x+' + a + '}$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '除法用商法则：$\\left(\\frac{u}{v}\\right)\\prime = \\frac{u\\prime v - uv\\prime}{v^2}$。',
        steps: [
          { m: '\\frac{(e^{x})\\prime(x+' + a + ')-e^{x}(x+' + a + ')\\prime}{(x+' + a + ')^2}',
            t: '套商法则：分子是"上面求导乘下面，减上面乘下面求导"，分母平方。' },
          { m: '= \\frac{e^{x}(x+' + a + ')-e^{x}\\cdot 1}{(x+' + a + ')^2}',
            t: '$e^x$ 的导数还是 $e^x$；$(x+' + a + ')$ 的导数是 1。' },
          { m: '= \\frac{(x+' + (a - 1) + ')e^{x}}{(x+' + a + ')^2}',
            t: '分子提取公因式 $e^x$：$x+' + a + '-1=x+' + (a - 1) + '$。' }
        ],
        pitfall: '商法则的分子是 $u\\prime v - uv\\prime$，减号前后别写反。'
      };
    }
  });

  /* D7 进阶：复合函数 sin(kx²) */
  QB.register({
    id: 'derivative-D7', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = (2 * k) + 'x\\cos(' + k + 'x^2)';
      var d = bo(correct, ['\\cos(' + k + 'x^2)', (2 * k) + 'x\\cos(x^2)', '2x\\cos(' + k + 'x^2)'], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin(' + k + 'x^2)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两层复合：外层 $\\sin$，内层 $' + k + 'x^2$。从外往里一层层求导再相乘。',
        steps: [
          { m: '\\cos(' + k + 'x^2)\\cdot(' + k + 'x^2)\\prime',
            t: '外层 $\\sin\\to\\cos$，里面保持 $' + k + 'x^2$ 不动，再乘内层导数。' },
          { m: '= \\cos(' + k + 'x^2)\\cdot ' + (2 * k) + 'x = ' + correct,
            t: '$' + k + 'x^2$ 的导数：$' + k + '\\times 2x=' + (2 * k) + 'x$。' }
        ],
        pitfall: '内层是 $x^2$ 不是 $x$，它的导数是 $2x$，别漏。'
      };
    }
  });

  /* D8 进阶：二阶导数值 */
  QB.register({
    id: 'derivative-D8', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 2, rng), b = ri(1, 2, rng), c = ri(1, 2, rng);
        var correct = String(6 * a * c + 2 * b);
        var d = bo(correct, [String(3 * a * c * c + 2 * b * c), String(6 * a * c), String(2 * b)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b, c: c },
          question: '设 $f(x)=' + (a === 1 ? '' : a) + 'x^3+' + b + 'x^2$，求 $f\\prime\\prime(' + c + ')$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '二阶导就是"导数的导数"：先求一阶导，再对结果求一次导，最后代入。',
          steps: [
            { m: 'f\\prime(x) = ' + (3 * a) + 'x^2+' + (2 * b) + 'x',
              t: '第一次求导：$x^3\\to 3x^2$（前面还有系数 ' + a + '），$x^2\\to 2x$（前面还有系数 ' + b + '）。' },
            { m: 'f\\prime\\prime(x) = ' + (6 * a) + 'x+' + (2 * b),
              t: '再对 $f\\prime$ 求导：$' + (3 * a) + 'x^2\\to' + (6 * a) + 'x$，$' + (2 * b) + 'x\\to' + (2 * b) + '$。' },
            { m: 'f\\prime\\prime(' + c + ') = ' + (6 * a) + '\\times' + c + '+' + (2 * b) + ' = ' + correct,
              t: '代入 $x=' + c + '$ 算出结果。' }
          ],
          pitfall: '只求一次导就代入，得到的是一阶导数值，不是二阶。'
        };
      }
      throw new Error('D8 retry fail');
    }
  });

  /* D9 进阶：切线斜率 */
  QB.register({
    id: 'derivative-D9', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 2, rng), c = ri(2, 3, rng);
        var correct = String(3 * a * c * c);
        var d = bo(correct, [String(a * c * c * c), String(3 * a * c), String(3 * a * c * c * c)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, c: c },
          question: '曲线 $y=' + (a === 1 ? '' : a) + 'x^3$ 在点 $x=' + c + '$ 处的切线斜率为',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '切线的斜率就是该点处的导数值。先求导，再代入。',
          steps: [
            { m: 'y\\prime = ' + (3 * a) + 'x^2',
              t: '导数的几何意义：曲线在某点的切线斜率等于该点的导数值。先求导。' },
            { m: 'y\\prime(' + c + ') = ' + (3 * a) + '\\cdot ' + c + '^2 = ' + (3 * a) + '\\times' + (c * c) + ' = ' + correct,
              t: '代入 $x=' + c + '$。' }
          ],
          pitfall: '斜率是导数值 $' + correct + '$，不是函数值 $' + (a * c * c * c) + '$。'
        };
      }
      throw new Error('D9 retry fail');
    }
  });

  /* D10 困难：隐函数求导 */
  QB.register({
    id: 'derivative-D10', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      var pairs = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5]];
      var p = pairs[ri(0, pairs.length - 1, rng)];
      var a = p[0], b = p[1];
      var correct = frac(-a, b);
      var d = bo(correct, [frac(a, b), frac(-b, a), frac(b, a)], rng);
      return {
        params: { a: a, b: b },
        question: '由方程 $x^2+y^2=' + (a * a + b * b) + '$ 确定的隐函数 $y=y(x)$ 在点 $(' + a + ',' + b + ')$ 处的导数 $\\frac{\\mathrm{d}y}{\\mathrm{d}x}=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '隐函数求导：方程两边同时对 $x$ 求导，注意 $y$ 是 $x$ 的函数，$y^2$ 要用链式法则。',
        steps: [
          { m: '2x + 2y\\cdot y\\prime = 0',
            t: '两边对 $x$ 求导：$x^2$ 得 $2x$；$y^2$ 是复合函数，得 $2y$ 乘 $y\\prime$（因为 $y$ 本身是 $x$ 的函数）；右边常数 0 求导是 0。' },
          { m: 'y\\prime = -\\frac{x}{y}',
            t: '移项解出 $y\\prime$：$2y\\cdot y\\prime = -2x$，两边除以 $2y$。' },
          { m: 'y\\prime\\big|_{(' + a + ',' + b + ')} = -\\frac{' + a + '}{' + b + '} = ' + correct,
            t: '把点 $(' + a + ',' + b + ')$ 代入 $x$ 和 $y$。' }
        ],
        pitfall: '对 $y^2$ 求导时一定要乘 $y\\prime$；别忘了结果要代入具体的点。'
      };
    }
  });

  /* D11 困难：对数求导 x^x */
  QB.register({
    id: 'derivative-D11', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      var correct = 'x^{x}(\\ln x+1)';
      var d = bo(correct, ['x^{x}', 'x^{x}\\ln x', 'x\\cdot x^{x-1}'], rng);
      return {
        params: {},
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}x^{x}\\;(x>0)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '底数和指数都有 $x$，既不是纯幂函数也不是纯指数函数。套路：两边取对数，再求导。',
        steps: [
          { m: '\\ln y = \\ln(x^{x}) = x\\ln x',
            t: '令 $y=x^x$，两边取自然对数，把指数上的 $x$ 放下来。' },
          { m: '\\frac{y\\prime}{y} = (x\\ln x)\\prime = \\ln x + x\\cdot\\frac{1}{x} = \\ln x + 1',
            t: '两边对 $x$ 求导。左边 $\\ln y$ 是复合函数，得 $\\frac{y\\prime}{y}$；右边用乘法法则。' },
          { m: 'y\\prime = y(\\ln x+1) = x^{x}(\\ln x+1)',
            t: '两边同乘 $y$，再把 $y$ 换回 $x^x$。' }
        ],
        pitfall: '不能当幂函数求（$x\\cdot x^{x-1}$），也不能当指数函数求（$x^x\\ln x$），必须取对数。'
      };
    }
  });

  /* D12 困难：正弦高阶导规律 */
  QB.register({
    id: 'derivative-D12', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\sin x';
      var d = bo(correct, ['\\cos x', '-\\sin x', '-\\cos x'], rng);
      return {
        params: {},
        question: '设 $y=\\sin x$，则 $y^{(100)}=$（100 阶导数）',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '正弦求导是"循环"的：每求 4 次导就回到原样。100 能被 4 整除，所以回到 $\\sin x$。',
        steps: [
          { m: '(\\sin x)\\prime = \\cos x = \\sin\\left(x+\\frac{\\pi}{2}\\right)',
            t: '规律：每求一次导，相当于把 $x$ 加上 $\\frac{\\pi}{2}$。' },
          { m: '(\\sin x)^{(n)} = \\sin\\left(x+\\frac{n\\pi}{2}\\right)',
            t: '所以 100 阶导数就是 $\\sin\\left(x+\\frac{100\\pi}{2}\\right)=\\sin(x+50\\pi)$。' },
          { m: '\\sin(x+50\\pi) = \\sin x',
            t: '$50\\pi$ 是 $\\pi$ 的偶数倍，正好绕整数圈，正弦回到原样。' }
        ],
        pitfall: '也可以直接数：4 次一循环，100÷4=25 整循环，得 $\\sin x$。'
      };
    }
  });

  /* DF1 基础：微分 dy 的数值计算 */
  QB.register({
    id: 'derivative-DF1', type: 'derivative', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var n = ri(2, 3, rng), c = ri(2, 4, rng);
        var correct = (n * Math.pow(c, n - 1) * 0.01).toFixed(2);
        var d = bo(correct, [(n * Math.pow(c, n - 1) * 0.1).toFixed(2), (Math.pow(c, n - 1) * 0.01).toFixed(2), (n * Math.pow(c, n - 1) * 0.01 + Math.pow(c, n) * 0.01).toFixed(2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { n: n, c: c },
          question: '设 $y=x^{' + n + '}$，当 $x=' + c + '$、$\\mathrm{d}x=0.01$ 时，微分 $\\mathrm{d}y=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '微分的公式：$\\mathrm{d}y = f\\prime(x)\\,\\mathrm{d}x$。先求导，再乘以 $\\mathrm{d}x$。',
          steps: [
            { m: 'y\\prime = ' + n + 'x^{' + (n - 1) + '}',
              t: '先求导数：指数搬下来，指数减 1。' },
            { m: '\\mathrm{d}y = ' + n + 'x^{' + (n - 1) + '}\\,\\mathrm{d}x',
              t: '微分 = 导数 × $\\mathrm{d}x$。' },
            { m: '\\mathrm{d}y\\big|_{x=' + c + '} = ' + n + '\\cdot ' + c + '^{' + (n - 1) + '}\\times 0.01 = ' + n + '\\times' + Math.pow(c, n - 1) + '\\times 0.01 = ' + correct,
              t: '代入 $x=' + c + '$ 和 $\\mathrm{d}x=0.01$ 计算。' }
          ],
          pitfall: '$\\mathrm{d}y$ 是"导数 × $\\mathrm{d}x$"，不是直接代入函数值。'
        };
      }
      throw new Error('DF1 retry fail');
    }
  });

  /* DF2 基础：微分 dy 的表达式 */
  QB.register({
    id: 'derivative-DF2', type: 'derivative', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = k + 'e^{' + k + 'x}\\mathrm{d}x';
      var d = bo(correct, ['e^{' + k + 'x}\\mathrm{d}x', k + 'e^{' + k + 'x}', k + 'e^{x}\\mathrm{d}x'], rng);
      return {
        params: { k: k },
        question: '设 $y=e^{' + k + 'x}$，则微分 $\\mathrm{d}y=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\mathrm{d}y = y\\prime\\,\\mathrm{d}x$：求出导数，在末尾乘上 $\\mathrm{d}x$。',
        steps: [
          { m: 'y\\prime = ' + k + 'e^{' + k + 'x}',
            t: '$e^{' + k + 'x}$ 的导数是 $' + k + 'e^{' + k + 'x}$。' },
          { m: '\\mathrm{d}y = y\\prime\\,\\mathrm{d}x = ' + k + 'e^{' + k + 'x}\\mathrm{d}x',
            t: '微分 = 导数 × $\\mathrm{d}x$，注意末尾的 $\\mathrm{d}x$ 不能丢。' }
        ],
        pitfall: '忘记写 $\\mathrm{d}x$ 是高频错误。'
      };
    }
  });

  /* DF3 进阶：微分近似 √(a²+1) */
  QB.register({
    id: 'derivative-DF3', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = [10, 20, 50][ri(0, 2, rng)];
        var correct = num(a + 1 / (2 * a));
        var d = bo(correct, [String(a + 0.5), num(a + 1 / a), String(a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '利用微分近似计算 $\\sqrt{' + (a * a) + '+1}\\approx$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '近似公式：$f(x_0+\\Delta x)\\approx f(x_0)+f\\prime(x_0)\\Delta x$。取 $f(x)=\\sqrt{x}$，$x_0=' + (a * a) + '$，$\\Delta x=1$。',
          steps: [
            { m: 'f(x)=\\sqrt{x},\\quad f\\prime(x)=\\frac{1}{2\\sqrt{x}}',
              t: '把要算的东西看成 $f(' + (a * a) + '+1)$，在 $x_0=' + (a * a) + '$ 附近用切线近似曲线。' },
            { m: '\\sqrt{' + (a * a) + '+1} \\approx \\sqrt{' + (a * a) + '} + \\frac{1}{2\\sqrt{' + (a * a) + '}}\\times 1 = ' + a + ' + \\frac{1}{' + (2 * a) + '}',
              t: '代入近似公式：函数值 ' + a + ' 加上"导数 × 增量"。' },
            { m: '= ' + correct,
              t: '算出来是 ' + correct + '。（精确值约 ' + Math.sqrt(a * a + 1).toFixed(4) + '，非常接近）' }
          ],
          pitfall: '近似公式里是 $f\\prime(x_0)\\Delta x$，别忘了乘增量 $\\Delta x=1$。'
        };
      }
      throw new Error('DF3 retry fail');
    }
  });

  /* DF4 进阶：微分近似 e^(0.01k) */
  QB.register({
    id: 'derivative-DF4', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var k = [2, 3, 5][ri(0, 2, rng)];
        var correct = num(1 + 0.01 * k);
        var d = bo(correct, [num(1 + 0.1 * k), num(1 + 0.001 * k), '1.01'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { k: k },
          question: '利用 $e^{x}\\approx 1+x$（$|x|$ 很小时），估算 $e^{0.0' + k + '}\\approx$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '当 $x$ 很小的时候，$e^x\\approx 1+x$。这里的 $x$ 就是 $0.0' + k + '$。',
          steps: [
            { m: 'e^{x} \\approx 1 + x \\quad (x \\to 0)',
              t: '这是微分近似的直接结论：$f(0+x)\\approx f(0)+f\\prime(0)x=1+1\\cdot x$。' },
            { m: 'e^{0.0' + k + '} \\approx 1 + 0.0' + k + ' = ' + correct,
              t: '把 $x=0.0' + k + '$ 代入。' }
          ],
          pitfall: '只有 $|x|$ 很小时才准；$e^{2}$ 可不能近似成 3。'
        };
      }
      throw new Error('DF4 retry fail');
    }
  });

  /* DF5 困难：√x 在 x=a² 处的微分 */
  QB.register({
    id: 'derivative-DF5', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(3, 5, rng);
        var correct = frac(1, 2 * a);
        var d = bo(correct, [frac(1, a), frac(1, 2 * a * a), frac(2, a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '设 $y=\\sqrt{x}$，当 $x=' + (a * a) + '$、$\\mathrm{d}x=1$ 时，微分 $\\mathrm{d}y=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '先求导：$(\\sqrt{x})\\prime=\\frac{1}{2\\sqrt{x}}$，再代入 $x=' + (a * a) + '$，最后乘 $\\mathrm{d}x$。',
          steps: [
            { m: 'y\\prime = \\frac{1}{2\\sqrt{x}}',
              t: '根号求导：$\\sqrt{x}=x^{1/2}$，导数 $=\\frac{1}{2}x^{-1/2}=\\frac{1}{2\\sqrt{x}}$。' },
            { m: 'y\\prime(' + (a * a) + ') = \\frac{1}{2\\sqrt{' + (a * a) + '}} = \\frac{1}{2\\times' + a + '} = \\frac{1}{' + (2 * a) + '}',
              t: '代入 $x=' + (a * a) + '$：$\\sqrt{' + (a * a) + '}=' + a + '$。' },
            { m: '\\mathrm{d}y = \\frac{1}{' + (2 * a) + '}\\times 1 = ' + correct,
              t: '$\\mathrm{d}x=1$，所以微分就等于导数值本身。' }
          ],
          pitfall: '$(\\sqrt{x})\\prime$ 是 $\\frac{1}{2\\sqrt{x}}$，别记成 $\\frac{1}{\\sqrt{x}}$。'
        };
      }
      throw new Error('DF5 retry fail');
    }
  });

  /* DF6 困难：微分近似 √(a²+b) */
  QB.register({
    id: 'derivative-DF6', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var p = [[2, 1], [4, 1], [4, 2], [5, 1]][ri(0, 3, rng)];
        var a = p[0], b = p[1];
        var correct = num(a + b / (2 * a));
        var d = bo(correct, [num(a + b / a), String(a + b), num(a + b / (2 * a * a))], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '利用微分近似计算 $\\sqrt{' + (a * a) + '+' + b + '}\\approx$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '取 $f(x)=\\sqrt{x}$，$x_0=' + (a * a) + '$，$\\Delta x=' + b + '$，套近似公式 $f(x_0+\\Delta x)\\approx f(x_0)+f\\prime(x_0)\\Delta x$。',
          steps: [
            { m: 'f\\prime(x) = \\frac{1}{2\\sqrt{x}}',
              t: '根号函数的导数是 $\\frac{1}{2\\sqrt{x}}$。' },
            { m: '\\sqrt{' + (a * a) + '+' + b + '} \\approx ' + a + ' + \\frac{1}{2\\times ' + a + '}\\times ' + b + ' = ' + a + ' + \\frac{' + b + '}{' + (2 * a) + '}',
              t: '代入：起点函数值 $\\sqrt{' + (a * a) + '}=' + a + '$，加上"导数 × 增量 ' + b + '$"。' },
            { m: '= ' + correct,
              t: '算出来是 ' + correct + '。（精确值约 ' + Math.sqrt(a * a + b).toFixed(4) + '）' }
          ],
          pitfall: '增量是 $' + b + '$，别写成别的数；导数要取在 $x_0=' + (a * a) + '$ 处。'
        };
      }
      throw new Error('DF6 retry fail');
    }
  });

  /* DF7 困难：微分近似 ln(1+x) */
  QB.register({
    id: 'derivative-DF7', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var k = [1, 2, 3, 5][ri(0, 3, rng)];
        var correct = num(0.01 * k);
        var d = bo(correct, [num(0.1 * k), num(0.001 * k), num(0.01 * k + 0.01)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { k: k },
          question: '利用 $\\ln(1+x)\\approx x$（$|x|$ 很小时），估算 $\\ln 1.0' + k + '\\approx$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '当 $x$ 很小时 $\\ln(1+x)\\approx x$。把 $1.0' + k + '$ 看成 $1+0.0' + k + '$。',
          steps: [
            { m: '\\ln(1+x) \\approx x \\quad (x \\to 0)',
              t: '这是微分近似的结论：$f(0+x)\\approx f(0)+f\\prime(0)x = 0+\\frac{1}{1}\\cdot x=x$。' },
            { m: '\\ln 1.0' + k + ' = \\ln(1+0.0' + k + ') \\approx 0.0' + k,
              t: '把 $x=0.0' + k + '$ 代入。' }
          ],
          pitfall: '近似只对 $|x|$ 很小成立，$\\ln 2$ 可不能近似成 1。'
        };
      }
      throw new Error('DF7 retry fail');
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
