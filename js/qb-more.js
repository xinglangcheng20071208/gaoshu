/* ============================================================
 * 题库扩充：22 个新模板（举一反三变式，答案程序化生成）
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* ========== 极限 ========== */

  /* L14 基础：sin(ax)/(bx) */
  QB.register({
    id: 'limit-L14', type: 'limit', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng), b = ri(2, 4, rng);
        if (a === b) continue;
        var correct = frac(a, b);
        var d = bo(correct, [frac(b, a), String(a * b), frac(a + b, 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '\\lim_{x\\to 0}\\frac{\\sin(' + a + 'x)}{' + b + 'x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '重要极限变式：把分子分母凑成 $\\frac{\\sin\\Box}{\\Box}$ 的形式，多出来的系数照写。',
          steps: [
            { m: '\\frac{\\sin(' + a + 'x)}{' + b + 'x} = \\frac{' + a + '}{' + b + '}\\cdot\\frac{\\sin(' + a + 'x)}{' + a + 'x}',
              t: '分子凑成 $\\sin(' + a + 'x)$ 除以 $' + a + 'x$（两者一样才是重要极限），外面补上系数 $\\frac{' + a + '}{' + b + '}$。' },
            { m: '\\lim_{x\\to 0}\\frac{\\sin(' + a + 'x)}{' + a + 'x} = 1',
              t: '$x\\to 0$ 时 $' + a + 'x$ 也趋近 0，这一坨就是重要极限，等于 1。' },
            { m: '= \\frac{' + a + '}{' + b + '}',
              t: '所以答案是 $\\frac{' + a + '}{' + b + '}$。' }
          ],
          pitfall: '结果不是 1，是系数之比 $\\frac{' + a + '}{' + b + '}$。'
        };
      }
      throw new Error('L14 retry fail');
    }
  });

  /* L15 进阶：无穷小阶数比较 (1-cos(ax))/(bx) */
  QB.register({
    id: 'limit-L15', type: 'limit', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng), b = ri(2, 4, rng);
        if (a === b) continue;
        var correct = '0';
        var d = bo(correct, [frac(a, b), frac(b, a), String(a * b)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '\\lim_{x\\to 0}\\frac{1-\\cos(' + a + 'x)}{' + b + 'x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '判断"快慢"：$1-\\cos(' + a + 'x)$ 是 $x$ 的**二阶**无穷小，分母只有一阶，分母"跑得慢"，分式还是无穷小。',
          steps: [
            { m: '1-\\cos(' + a + 'x) \\sim \\frac{(' + a + 'x)^2}{2}',
              t: '等价无穷小：$x\\to 0$ 时 $1-\\cos\\Box\\sim\\frac{\\Box^2}{2}$。分子相当于 $\\frac{' + (a * a) + 'x^2}{2}$。' },
            { m: '\\frac{1-\\cos(' + a + 'x)}{' + b + 'x} \\sim \\frac{' + (a * a) + 'x^2/2}{' + b + 'x} = \\frac{' + (a * a) + 'x}{' + (2 * b) + '}',
              t: '代入后约掉一个 $x$，还剩一个 $x$ 在分子上。' },
            { m: '\\frac{' + (a * a) + 'x}{' + (2 * b) + '} \\to 0',
              t: '$x\\to 0$，所以整个式子趋近 0。' }
          ],
          pitfall: '别被 $1-\\cos$ 吓到就直接洛必达；先判断无穷小阶数更快。'
        };
      }
      throw new Error('L15 retry fail');
    }
  });

  /* L16 进阶：等价无穷小 (e^(ax)-1)/(bx) */
  QB.register({
    id: 'limit-L16', type: 'limit', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng), b = ri(2, 4, rng);
        if (a === b) continue;
        var correct = frac(a, b);
        var d = bo(correct, [frac(b, a), String(a * b), '1'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '\\lim_{x\\to 0}\\frac{e^{' + a + 'x}-1}{' + b + 'x}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '等价无穷小：$e^{\\Box}-1\\sim\\Box$（$\\Box\\to 0$）。分子等价于 $' + a + 'x$。',
          steps: [
            { m: 'e^{' + a + 'x}-1 \\sim ' + a + 'x',
              t: '$x\\to 0$ 时 $' + a + 'x\\to 0$，所以 $e^{' + a + 'x}-1$ 和 $' + a + 'x$ 等价。' },
            { m: '\\frac{e^{' + a + 'x}-1}{' + b + 'x} \\sim \\frac{' + a + 'x}{' + b + 'x}',
              t: '把分子替换成等价无穷小。' },
            { m: '= \\frac{' + a + '}{' + b + '}',
              t: '约掉 $x$，答案是 $\\frac{' + a + '}{' + b + '}$。' }
          ],
          pitfall: '等价无穷小替换只适用于乘除，不适用于加减。'
        };
      }
      throw new Error('L16 retry fail');
    }
  });

  /* L17 困难：幂指型 ((x+k)/(x-k))^x */
  QB.register({
    id: 'limit-L17', type: 'limit', difficulty: 'hard',
    gen: function (rng) {
      var k = ri(1, 2, rng);
      var correct = 'e^{' + (2 * k) + '}';
      var d = bo(correct, ['e^{' + k + '}', 'e^{' + (2 * k + 1) + '}', (2 * k) + 'e'], rng);
      return {
        params: { k: k },
        question: '\\lim_{x\\to\\infty}\\left(\\frac{x+' + k + '}{x-' + k + '}\\right)^{x}',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '幂指型化成 $1+$ 无穷小的形式，分别凑两个第二重要极限，分子分母各贡献一个 $e$。',
        steps: [
          { m: '\\frac{x+' + k + '}{x-' + k + '} = \\frac{1+\\frac{' + k + '}{x}}{1-\\frac{' + k + '}{x}}',
            t: '分子分母同时除以 $x$，写成 $1\\pm$ 无穷小的形式。' },
          { m: '\\left(\\frac{x+' + k + '}{x-' + k + '}\\right)^{x} = \\frac{\\left(1+\\frac{' + k + '}{x}\\right)^{x}}{\\left(1-\\frac{' + k + '}{x}\\right)^{x}}',
            t: '指数相同，可以拆成分子分母各自取 $x$ 次方。' },
          { m: '\\to \\frac{e^{' + k + '}}{e^{-' + k + '}} = e^{' + k + '-(-' + k + ')} = e^{' + (2 * k) + '}',
            t: '第二重要极限：$(1+\\frac{a}{x})^x\\to e^a$，$(1-\\frac{' + k + '}{x})^x\\to e^{-' + k + '}$。相除得 $e^{' + (2 * k) + '}$。' }
        ],
        pitfall: '分子分母各出一个 $e$，指数是相减 $' + k + '-(-' + k + ')=' + (2 * k) + '$，不是 $' + k + '$。'
      };
    }
  });

  /* ========== 导数 ========== */

  /* D13 进阶：e^(kx)·sinx 乘积 */
  QB.register({
    id: 'derivative-D13', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(1, 2, rng);
      var correct = 'e^{' + k + 'x}(' + k + '\\sin x+\\cos x)';
      var d = bo(correct, ['e^{' + k + 'x}(' + k + '\\sin x-\\cos x)', 'e^{' + k + 'x}\\cos x', k + 'e^{' + k + 'x}\\sin x'], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\left(e^{' + k + 'x}\\sin x\\right)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '乘法法则：$(uv)\\prime=u\\prime v+uv\\prime$，其中 $e^{' + k + 'x}$ 的导数是 $' + k + 'e^{' + k + 'x}$。',
        steps: [
          { m: '(e^{' + k + 'x})\\prime \\sin x + e^{' + k + 'x}(\\sin x)\\prime',
            t: '前导后不导，加前不导后导。' },
          { m: '= ' + k + 'e^{' + k + 'x}\\sin x + e^{' + k + 'x}\\cos x',
            t: '$e^{' + k + 'x}$ 求导乘 ' + k + '；$\\sin x$ 求导得 $\\cos x$。' },
          { m: '= e^{' + k + 'x}(' + k + '\\sin x+\\cos x)',
            t: '提取公因式 $e^{' + k + 'x}$。' }
        ],
        pitfall: '$e^{' + k + 'x}$ 的导数别忘了乘 ' + k + '。'
      };
    }
  });

  /* D14 进阶：arctan(kx) 求导 */
  QB.register({
    id: 'derivative-D14', type: 'derivative', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '\\frac{' + k + '}{1+' + (k * k) + 'x^2}';
      var d = bo(correct, ['\\frac{1}{1+' + (k * k) + 'x^2}', '\\frac{' + k + '}{1+' + k + 'x^2}', '\\frac{' + k + '}{1+' + (k * k) + 'x^4}'], rng);
      return {
        params: { k: k },
        question: '求导数 $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\arctan(' + k + 'x)$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '基本公式：$(\\arctan x)\\prime=\\frac{1}{1+x^2}$，再套链式法则乘内层导数。',
        steps: [
          { m: '(\\arctan\\Box)\\prime = \\frac{1}{1+\\Box^2}\\cdot\\Box\\prime',
            t: '先按公式求，再乘内层的导数。' },
          { m: '= \\frac{1}{1+(' + k + 'x)^2}\\cdot ' + k + ' = \\frac{' + k + '}{1+' + (k * k) + 'x^2}',
            t: '内层 $' + k + 'x$ 的导数是 ' + k + '；分母 $(' + k + 'x)^2=' + (k * k) + 'x^2$。' }
        ],
        pitfall: '分母里的内层要平方：$(' + k + 'x)^2=' + (k * k) + 'x^2$。'
      };
    }
  });

  /* D15 困难：指数函数高阶导 */
  QB.register({
    id: 'derivative-D15', type: 'derivative', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var n = ri(4, 5, rng);
        var correct = String(Math.pow(2, n));
        var d = bo(correct, [String(2 * n), String(n * Math.pow(2, n - 1)), String(Math.pow(2, n - 1))], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { n: n },
          question: '设 $y=e^{2x}$，则 $y^{(' + n + ')}(' + '0)=' ,
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '$e^{2x}$ 每求一次导就多乘一个 2：$n$ 阶导数是 $2^{n}e^{2x}$，再代入 $x=0$。',
          steps: [
            { m: 'y\\prime = 2e^{2x},\\quad y\\prime\\prime = 2^2e^{2x},\\quad \\cdots',
              t: '每次求导，$e^{2x}$ 都不变，只是前面多乘一个 2。' },
            { m: 'y^{(' + n + ')} = 2^{' + n + '}e^{2x}',
              t: '求 ' + n + ' 次导，就乘了 ' + n + ' 个 2。' },
            { m: 'y^{(' + n + ')}(0) = 2^{' + n + '}\\cdot e^{0} = ' + correct,
              t: '代入 $x=0$：$e^0=1$，所以答案是 $2^{' + n + '}=' + correct + '$。' }
          ],
          pitfall: '高阶导不是乘 ' + n + '，而是 $2$ 的 ' + n + ' 次方。'
        };
      }
      throw new Error('D15 retry fail');
    }
  });

  /* ========== 不定积分 ========== */

  /* I13 基础：带系数幂函数积分 */
  QB.register({
    id: 'indint-I13', type: 'indint', difficulty: 'easy',
    gen: function (rng) {
      var a = ri(2, 3, rng), n = ri(3, 4, rng);
      var correct = '\\frac{' + a + 'x^{' + (n + 1) + '}}{' + (n + 1) + '}+C';
      var d = bo(correct, ['\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}+C', '\\frac{' + a + 'x^{' + (n - 1) + '}}{' + (n - 1) + '}+C', a + '(' + (n + 1) + ')x^{' + (n + 1) + '}+C'], rng);
      return {
        params: { a: a, n: n },
        question: '计算 $\\int ' + a + 'x^{' + n + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '系数 ' + a + ' 保留不动，$x$ 的幂按"指数加 1、除以新指数"来积。',
        steps: [
          { m: '\\int ' + a + 'x^{' + n + '}\\,\\mathrm{d}x = ' + a + '\\int x^{' + n + '}\\,\\mathrm{d}x',
            t: '常数 ' + a + ' 提到积分号外面。' },
          { m: '= ' + a + '\\cdot\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}+C',
            t: '指数 ' + n + ' 加 1 变 ' + (n + 1) + '，除以新指数 ' + (n + 1) + '，系数 ' + a + ' 保留。' }
        ],
        pitfall: '系数 ' + a + ' 别丢，也别把它也平方进去。'
      };
    }
  });

  /* I14 进阶：凑微分 ∫x²/(x³+a) */
  QB.register({
    id: 'indint-I14', type: 'indint', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = '\\frac{1}{3}\\ln(x^3+' + a + ')+C';
      var d = bo(correct, ['\\ln(x^3+' + a + ')+C', '3\\ln(x^3+' + a + ')+C', '\\frac{3x^2}{x^3+' + a + '}+C'], rng);
      return {
        params: { a: a },
        question: '计算 $\\int \\frac{x^2}{x^3+' + a + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分子 $x^2$ 和分母的导数 $3x^2$ 只差系数 3，凑微分：$\\int\\frac{u\\prime}{u}\\mathrm{d}x=\\ln|u|$。',
        steps: [
          { m: '(x^3+' + a + ')\\prime = 3x^2',
            t: '分母的导数是 $3x^2$，分子是 $x^2$，差一个 3。' },
          { m: '\\int \\frac{x^2}{x^3+' + a + '}\\mathrm{d}x = \\frac{1}{3}\\int \\frac{3x^2}{x^3+' + a + '}\\mathrm{d}x',
            t: '分子乘 3 凑成分母的导数，外面乘 $\\frac{1}{3}$ 补偿。' },
          { m: '= \\frac{1}{3}\\ln(x^3+' + a + ') + C',
            t: '直接写出 $\\frac{1}{3}\\ln$ 形式的结果。' }
        ],
        pitfall: '前面的系数是 $\\frac{1}{3}$ 不是 3。'
      };
    }
  });

  /* I15 困难：分部积分 ∫x e^(kx) */
  QB.register({
    id: 'indint-I15', type: 'indint', difficulty: 'hard',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '\\frac{e^{' + k + 'x}(' + k + 'x-1)}{' + (k * k) + '}+C';
      var d = bo(correct, ['\\frac{e^{' + k + 'x}(' + k + 'x+1)}{' + (k * k) + '}+C', '\\frac{x e^{' + k + 'x}}{' + k + '}+C', 'e^{' + k + 'x}(' + k + 'x-1)+C'], rng);
      return {
        params: { k: k },
        question: '计算 $\\int x e^{' + k + 'x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分部积分：$u=x$，$\\mathrm{d}v=e^{' + k + 'x}\\mathrm{d}x$，则 $v=\\frac{e^{' + k + 'x}}{' + k + '}$。',
        steps: [
          { m: 'u = x,\\quad \\mathrm{d}v = e^{' + k + 'x}\\mathrm{d}x \\Rightarrow v = \\frac{e^{' + k + 'x}}{' + k + '}',
            t: '选 $u=x$（求导后变 1），$e^{' + k + 'x}$ 积分得 $\\frac{e^{' + k + 'x}}{' + k + '}$。' },
          { m: '\\int x e^{' + k + 'x}\\mathrm{d}x = x\\cdot\\frac{e^{' + k + 'x}}{' + k + '} - \\int \\frac{e^{' + k + 'x}}{' + k + '}\\mathrm{d}x',
            t: '套公式 $uv-\\int v\\mathrm{d}u$。' },
          { m: '= \\frac{x e^{' + k + 'x}}{' + k + '} - \\frac{e^{' + k + 'x}}{' + (k * k) + '} + C = \\frac{e^{' + k + 'x}(' + k + 'x-1)}{' + (k * k) + '}+C',
            t: '再积一次，通分合并。' }
        ],
        pitfall: '最后一项的分母是 $' + (k * k) + '$（再除以一次 ' + k + '）。'
      };
    }
  });

  /* I16 进阶：∫sin(ax)cos(ax) */
  QB.register({
    id: 'indint-I16', type: 'indint', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(2, 3, rng);
      var correct = '\\frac{\\sin^2(' + a + 'x)}{' + (2 * a) + '}+C';
      var d = bo(correct, ['\\frac{\\sin^2(' + a + 'x)}{' + a + '}+C', '\\frac{\\cos^2(' + a + 'x)}{' + (2 * a) + '}+C', '\\frac{1}{2}\\sin^2(' + a + 'x)+C'], rng);
      return {
        params: { a: a },
        question: '计算 $\\int \\sin(' + a + 'x)\\cos(' + a + 'x)\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '凑微分：令 $u=\\sin(' + a + 'x)$，则 $\\mathrm{d}u=' + a + '\\cos(' + a + 'x)\\mathrm{d}x$。',
        steps: [
          { m: 'u = \\sin(' + a + 'x),\\quad \\mathrm{d}u = ' + a + '\\cos(' + a + 'x)\\,\\mathrm{d}x',
            t: '$\\sin(' + a + 'x)$ 的导数是 $' + a + '\\cos(' + a + 'x)$，正好和题里的 $\\cos$ 配对。' },
          { m: '\\int \\sin(' + a + 'x)\\cos(' + a + 'x)\\,\\mathrm{d}x = \\frac{1}{' + a + '}\\int u\\,\\mathrm{d}u',
            t: '$\\cos(' + a + 'x)\\mathrm{d}x$ 打包成 $\\frac{1}{' + a + '}\\mathrm{d}u$。' },
          { m: '= \\frac{1}{' + a + '}\\cdot\\frac{u^2}{2}+C = \\frac{\\sin^2(' + a + 'x)}{' + (2 * a) + '}+C',
            t: '积分后把 $u$ 换回去，$\\frac{1}{' + a + '}\\times\\frac{1}{2}=\\frac{1}{' + (2 * a) + '}$。' }
        ],
        pitfall: '分母是 $' + (2 * a) + '$（系数 ' + a + ' 和平方的 $\\frac{1}{2}$ 相乘）。'
      };
    }
  });

  /* ========== 定积分 ========== */

  /* Df11 基础：∫[0,π/2] cosx */
  QB.register({
    id: 'defint-Df11', type: 'defint', difficulty: 'easy',
    gen: function (rng) {
      var correct = '1';
      var d = bo(correct, ['0', '2', '\\frac{\\pi}{2}'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^{\\frac{\\pi}{2}} \\cos x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\cos x$ 的原函数是 $\\sin x$，代入 $\\frac{\\pi}{2}$ 和 0 相减。',
        steps: [
          { m: '\\int \\cos x\\,\\mathrm{d}x = \\sin x',
            t: '$\\cos$ 积分得 $\\sin$。' },
          { m: '\\left.\\sin x\\right|_0^{\\pi/2} = \\sin\\frac{\\pi}{2} - \\sin 0',
            t: '代入上下限。' },
          { m: '= 1 - 0 = 1',
            t: '$\\sin\\frac{\\pi}{2}=1$，$\\sin0=0$。' }
        ],
        pitfall: '$\\sin\\frac{\\pi}{2}=1$ 不是 0。'
      };
    }
  });

  /* Df12 进阶：∫[1,e] 1/x */
  QB.register({
    id: 'defint-Df12', type: 'defint', difficulty: 'medium',
    gen: function (rng) {
      var correct = '1';
      var d = bo(correct, ['e', 'e-1', '0'], rng);
      return {
        params: {},
        question: '计算 $\\int_1^{e} \\frac{1}{x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\frac{1}{x}$ 的原函数是 $\\ln|x|$，上下限 $e$ 和 1 代入后正好是 $\\ln e - \\ln 1$。',
        steps: [
          { m: '\\int \\frac{1}{x}\\,\\mathrm{d}x = \\ln|x|',
            t: '基本积分公式。' },
          { m: '\\left.\\ln|x|\\right|_1^{e} = \\ln e - \\ln 1',
            t: '代入上下限（区间内 $x>0$，绝对值可去掉）。' },
          { m: '= 1 - 0 = 1',
            t: '$\\ln e=1$，$\\ln1=0$。' }
        ],
        pitfall: '$\\ln e=1$（以 $e$ 为底的对数）。'
      };
    }
  });

  /* Df13 进阶：∫[0,a] kx² */
  QB.register({
    id: 'defint-Df13', type: 'defint', difficulty: 'medium',
    gen: function (rng) {
      var k = ri(2, 3, rng), a = ri(2, 3, rng);
      var correct = frac(k * a * a * a, 3);
      var d = bo(correct, [frac(k * a * a, 2), String(k * a * a * a), frac(k * a * a * a, 2)], rng);
      return {
        params: { k: k, a: a },
        question: '计算 $\\int_0^{' + a + '} ' + k + 'x^2\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先找原函数 $\\frac{' + k + 'x^3}{3}$，再代入上下限。',
        steps: [
          { m: 'F(x) = \\frac{' + k + 'x^3}{3}',
            t: '$x^2$ 积分得 $\\frac{x^3}{3}$，系数 ' + k + ' 保留。' },
          { m: '\\int_0^{' + a + '} = F(' + a + ') - F(0) = \\frac{' + k + '\\times' + (a * a * a) + '}{3} - 0 = ' + correct,
            t: '代入上限 ' + a + '（$' + a + '^3=' + (a * a * a) + '$），下限代入得 0。' }
        ],
        pitfall: '$x^2$ 的原函数是 $\\frac{x^3}{3}$，指数是 3。'
      };
    }
  });

  /* Df14 困难：∫[0,1] x/(x²+1) */
  QB.register({
    id: 'defint-Df14', type: 'defint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{1}{2}\\ln 2';
      var d = bo(correct, ['\\ln 2', '\\frac{1}{2}', '1'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^1 \\frac{x}{x^2+1}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分子 $x$ 是分母导数的"一半"：凑微分后用 $\\ln$ 公式。',
        steps: [
          { m: '(x^2+1)\\prime = 2x \\Rightarrow x\\,\\mathrm{d}x = \\frac{1}{2}\\mathrm{d}(x^2+1)',
            t: '分母的导数是 $2x$，所以 $x\\mathrm{d}x$ 凑成 $\\frac{1}{2}\\mathrm{d}(x^2+1)$。' },
          { m: '\\int_0^1 \\frac{x}{x^2+1}\\mathrm{d}x = \\frac{1}{2}\\ln(x^2+1)\\bigg|_0^1',
            t: '原函数是 $\\frac{1}{2}\\ln(x^2+1)$。' },
          { m: '= \\frac{1}{2}(\\ln 2 - \\ln 1) = \\frac{1}{2}\\ln 2',
            t: '代入：$\\ln2-0=\\ln2$，再乘 $\\frac{1}{2}$。' }
        ],
        pitfall: '别漏了外面的 $\\frac{1}{2}$。'
      };
    }
  });

  /* ========== 中值定理 ========== */

  /* A7 进阶：单调递减区间 */
  QB.register({
    id: 'mvt-A7', type: 'mvt', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = '(-' + a + ',' + a + ')';
      var d = bo(correct, ['(-\\infty,-' + a + ')', '(' + a + ',+\\infty)', '\\mathbb{R}'], rng);
      return {
        params: { a: a },
        question: '函数 $f(x)=x^3-' + (3 * a * a) + 'x$ 的单调递减区间是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '递减区间看 $f\\prime<0$。先求导因式分解，再解不等式。',
        steps: [
          { m: 'f\\prime(x) = 3x^2-' + (3 * a * a) + ' = 3(x-' + a + ')(x+' + a + ')',
            t: '求导并因式分解。' },
          { m: 'f\\prime(x) < 0 \\Leftrightarrow (x-' + a + ')(x+' + a + ') < 0',
            t: '导数小于 0 就是递减。' },
          { m: '\\Rightarrow -' + a + ' < x < ' + a + ' \\Rightarrow (-' + a + ',' + a + ')',
            t: '两括号异号，$x$ 介于 $-' + a + '$ 和 ' + a + ' 之间。' }
        ],
        pitfall: '递减看 $f\\prime<0$，不是 $f\\prime>0$。'
      };
    }
  });

  /* A8 进阶：三次函数极大值点 */
  QB.register({
    id: 'mvt-A8', type: 'mvt', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 2, rng), b = ri(1, 3, rng);
      var correct = '0';
      var d = bo(correct, [String(2 * a), String(a), String(-a)], rng);
      return {
        params: { a: a, b: b },
        question: '函数 $f(x)=x^3-' + (3 * a) + 'x^2+' + b + '$ 的极大值点 $x$ 是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先求驻点，再用二阶导判断：$f\\prime\\prime<0$ 的是极大值点。',
        steps: [
          { m: 'f\\prime(x) = 3x^2-' + (6 * a) + 'x = 3x(x-' + (2 * a) + ') = 0',
            t: '求导因式分解，驻点是 $x=0$ 和 $x=' + (2 * a) + '$。' },
          { m: 'f\\prime\\prime(x) = 6x-' + (6 * a),
            t: '再求一次导。' },
          { m: 'f\\prime\\prime(0) = -' + (6 * a) + ' < 0 \\Rightarrow \\text{极大值点 } x=0',
            t: '代入 $x=0$ 得 $-' + (6 * a) + '<0$，所以 $x=0$ 是极大值点。（$x=' + (2 * a) + '$ 处二阶导为 $' + (6 * a) + '>0$，是极小值点）' }
        ],
        pitfall: '极大值点是横坐标 $x=0$，不是函数值 $' + b + '$。'
      };
    }
  });

  /* ========== 定积分应用 ========== */

  /* Ap9 进阶：y=1/x 面积 */
  QB.register({
    id: 'defapp-Ap9', type: 'defapp', difficulty: 'medium',
    gen: function (rng) {
      var correct = '1';
      var d = bo(correct, ['e', 'e-1', '\\ln 2'], rng);
      return {
        params: {},
        question: '由曲线 $y=\\frac{1}{x}$、$x$ 轴及直线 $x=1$、$x=e$ 所围成平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '面积等于 $\\frac{1}{x}$ 在 $[1,e]$ 上的定积分。',
        steps: [
          { m: 'S = \\int_1^{e} \\frac{1}{x}\\,\\mathrm{d}x',
            t: '在 $[1,e]$ 上 $\\frac{1}{x}>0$，直接积分。' },
          { m: '= \\ln x\\big|_1^{e} = \\ln e - \\ln 1 = 1',
            t: '$\\frac{1}{x}$ 的原函数是 $\\ln x$，代入得 1。' }
        ],
        pitfall: '$\\ln e=1$。'
      };
    }
  });

  /* Ap10 进阶：y=e^x 面积 */
  QB.register({
    id: 'defapp-Ap10', type: 'defapp', difficulty: 'medium',
    gen: function (rng) {
      var correct = 'e-1';
      var d = bo(correct, ['e', '1', 'e-2'], rng);
      return {
        params: {},
        question: '由曲线 $y=e^{x}$、$x$ 轴及直线 $x=0$、$x=1$ 所围成平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '面积等于 $e^x$ 在 $[0,1]$ 上的定积分。',
        steps: [
          { m: 'S = \\int_0^{1} e^{x}\\,\\mathrm{d}x',
            t: '$e^x>0$，直接积分。' },
          { m: '= e^{x}\\big|_0^{1} = e^{1} - e^{0} = e-1',
            t: '$e^x$ 的原函数是它自己，代入上下限相减。' }
        ],
        pitfall: '$e^0=1$。'
      };
    }
  });

  /* ========== 微分方程 ========== */

  /* O10 进阶：y''=6x 通解 */
  QB.register({
    id: 'ode-O10', type: 'ode', difficulty: 'medium',
    gen: function (rng) {
      var correct = 'x^3+C_1x+C_2';
      var d = bo(correct, ['3x^2+C', 'x^3+C_1x^2+C_2', '6x^2+C_1x+C_2'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime\\prime=6x$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '二阶方程积分两次：每积一次出一个常数。',
        steps: [
          { m: 'y\\prime = \\int 6x\\,\\mathrm{d}x = 3x^2 + C_1',
            t: '第一次积分：$6x$ 积分得 $3x^2$，加常数 $C_1$。' },
          { m: 'y = \\int (3x^2 + C_1)\\,\\mathrm{d}x = x^3 + C_1x + C_2',
            t: '第二次积分：$3x^2$ 积分得 $x^3$，$C_1$ 积分得 $C_1x$，再加新常数 $C_2$。' }
        ],
        pitfall: '二阶方程的通解有两个任意常数。'
      };
    }
  });

  /* O11 困难：一阶线性 y'+y=e^x */
  QB.register({
    id: 'ode-O11', type: 'ode', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{e^{x}}{2}+Ce^{-x}';
      var d = bo(correct, ['\\frac{e^{x}}{2}+Ce^{x}', 'e^{x}+Ce^{-x}', 'Ce^{-x}'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime+y=e^{x}$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '一阶线性方程用积分因子法：$P(x)=1$，积分因子 $e^{\\int\\mathrm{d}x}=e^{x}$，两边同乘。',
        steps: [
          { m: 'e^{x}y\\prime + e^{x}y = e^{2x} \\Rightarrow (ye^{x})\\prime = e^{2x}',
            t: '两边乘积分因子 $e^x$，左边恰好是 $(ye^x)\\prime$。' },
          { m: 'ye^{x} = \\int e^{2x}\\,\\mathrm{d}x = \\frac{e^{2x}}{2} + C',
            t: '两边积分：$e^{2x}$ 积分得 $\\frac{e^{2x}}{2}$。' },
          { m: 'y = \\frac{e^{x}}{2} + Ce^{-x}',
            t: '两边除以 $e^x$（即乘 $e^{-x}$）。' }
        ],
        pitfall: '常数 $C$ 除以 $e^x$ 变成 $Ce^{-x}$，指数是负的。'
      };
    }
  });

  /* O12 进阶：初值问题 y'=cosx, y(π/2)=a */
  QB.register({
    id: 'ode-O12', type: 'ode', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(0, 2, rng);
      var correct = a === 1 ? '\\sin x' : '\\sin x' + signed(a - 1);
      var d = bo(correct, ['\\sin x+C', '\\sin x+' + a, '\\cos x+' + a], rng);
      return {
        params: { a: a },
        question: '求微分方程 $y\\prime=\\cos x$ 满足 $y(\\frac{\\pi}{2})=' + a + '$ 的特解',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先积分得通解 $y=\\sin x+C$，再用初始条件定 $C$。',
        steps: [
          { m: 'y = \\int \\cos x\\,\\mathrm{d}x = \\sin x + C',
            t: '$\\cos x$ 积分得 $\\sin x$。' },
          { m: 'y\\left(\\frac{\\pi}{2}\\right) = \\sin\\frac{\\pi}{2} + C = 1 + C = ' + a,
            t: '代入初始条件：$\\sin\\frac{\\pi}{2}=1$。' },
          { m: 'C = ' + (a - 1) + ' \\Rightarrow y = ' + correct,
            t: '解出 $C=' + (a - 1) + '$，代回通解。' }
        ],
        pitfall: '初始条件是用来定常数 $C$ 的。'
      };
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
