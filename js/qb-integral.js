/* ============================================================
 * 题库：不定积分（12 个模板）+ 定积分（10 个模板）
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* ---------- 不定积分 ---------- */

  /* I1 基础：∫x^n dx */
  QB.register({
    id: 'indint-I1', type: 'indint', difficulty: 'easy',
    gen: function (rng) {
      var n = ri(3, 6, rng);
      var correct = '\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}+C';
      var d = bo(correct, [n + 'x^{' + (n - 1) + '}+C', '\\frac{x^{' + (n + 1) + '}}{' + n + '}+C', (n + 1) + 'x^{' + (n + 1) + '}+C'], rng);
      return {
        params: { n: n },
        question: '计算 $\\int x^{' + n + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '幂函数积分口诀：指数加 1，除以新指数，别忘加 $C$。',
        steps: [
          { m: '\\int x^{' + n + '}\\,\\mathrm{d}x = \\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '} + C',
            t: '指数 ' + n + ' 加 1 变成 ' + (n + 1) + '，前面除以新的指数 ' + (n + 1) + '，最后加任意常数 $C$。' }
        ],
        pitfall: '不定积分必须带 $+C$；也不要搞成求导（指数减 1）那一套。'
      };
    }
  });

  /* I2 基础：∫e^(kx) dx */
  QB.register({
    id: 'indint-I2', type: 'indint', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '\\frac{e^{' + k + 'x}}{' + k + '}+C';
      var d = bo(correct, ['e^{' + k + 'x}+C', k + 'e^{' + k + 'x}+C', '\\frac{e^{' + k + 'x}}{' + (k * k) + '}+C'], rng);
      return {
        params: { k: k },
        question: '计算 $\\int e^{' + k + 'x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\int e^{ax}\\mathrm{d}x=\\frac{1}{a}e^{ax}+C$。积分是求导的逆运算，系数要除下去。',
        steps: [
          { m: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\left(\\frac{e^{' + k + 'x}}{' + k + '}\\right) = e^{' + k + 'x}',
            t: '验证：$\\frac{e^{' + k + 'x}}{' + k + '}$ 求导，$e^{' + k + 'x}$ 乘内层导数 ' + k + '，再除以 ' + k + '，正好等于 $e^{' + k + 'x}$。' },
          { m: '\\int e^{' + k + 'x}\\,\\mathrm{d}x = \\frac{e^{' + k + 'x}}{' + k + '}+C',
            t: '所以积分结果就是它，再加 $C$。' }
        ],
        pitfall: '求导时"乘 ' + k + '"，积分时就要"除以 ' + k + '"，方向相反。'
      };
    }
  });

  /* I3 基础：∫cos(kx) dx */
  QB.register({
    id: 'indint-I3', type: 'indint', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '\\frac{\\sin(' + k + 'x)}{' + k + '}+C';
      var d = bo(correct, ['-\\frac{\\sin(' + k + 'x)}{' + k + '}+C', k + '\\sin(' + k + 'x)+C', '\\sin(' + k + 'x)+C'], rng);
      return {
        params: { k: k },
        question: '计算 $\\int \\cos(' + k + 'x)\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\int\\cos(ax)\\mathrm{d}x=\\frac{1}{a}\\sin(ax)+C$。注意：$\\cos$ 积分出来是正的 $\\sin$。',
        steps: [
          { m: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin(' + k + 'x) = ' + k + '\\cos(' + k + 'x)',
            t: '先看求导：$\\sin(' + k + 'x)$ 的导数是 $' + k + '\\cos(' + k + 'x)$，多乘了个 ' + k + '。' },
          { m: '\\Rightarrow \\int \\cos(' + k + 'x)\\,\\mathrm{d}x = \\frac{\\sin(' + k + 'x)}{' + k + '}+C',
            t: '积分要把这个 ' + k + ' 除掉，所以答案分母是 ' + k + '。' }
        ],
        pitfall: '积分 $\\cos$ 得 $+\\sin$（不是 $-\\sin$）；系数 ' + k + ' 要除下去。'
      };
    }
  });

  /* I4 基础：∫(a/x) dx */
  QB.register({
    id: 'indint-I4', type: 'indint', difficulty: 'easy',
    gen: function (rng) {
      var a = [2, 3, 5][ri(0, 2, rng)];
      var correct = a + '\\ln|x|+C';
      var d = bo(correct, ['\\frac{1}{' + a + '}\\ln|x|+C', '\\frac{' + a + '}{x}+C', a + 'x+C'], rng);
      return {
        params: { a: a },
        question: '计算 $\\int \\frac{' + a + '}{x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '常数可以提到积分号外面：$\\int\\frac{' + a + '}{x}\\mathrm{d}x=' + a + '\\int\\frac{1}{x}\\mathrm{d}x$。',
        steps: [
          { m: '\\int \\frac{' + a + '}{x}\\,\\mathrm{d}x = ' + a + '\\int \\frac{1}{x}\\,\\mathrm{d}x',
            t: '把常数 ' + a + ' 提到积分号外面。' },
          { m: '= ' + a + '\\ln|x| + C',
            t: '基本公式：$\\int\\frac{1}{x}\\mathrm{d}x=\\ln|x|$，再乘回 ' + a + '。' }
        ],
        pitfall: '$\\frac{1}{x}$ 积分是 $\\ln|x|$（带绝对值），不是 $\\frac{1}{x^2}$ 那类。'
      };
    }
  });

  /* I5 进阶：换元 ∫(ax+b)^n dx */
  QB.register({
    id: 'indint-I5', type: 'indint', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(2, 3, rng), b = ri(1, 2, rng), n = ri(2, 4, rng);
      var inside = a + 'x' + signed(b);
      var correct = '\\frac{(' + inside + ')^{' + (n + 1) + '}}{' + (a * (n + 1)) + '}+C';
      var d = bo(correct, ['\\frac{(' + inside + ')^{' + (n + 1) + '}}{' + (n + 1) + '}+C', '\\frac{' + a + '(' + inside + ')^{' + (n + 1) + '}}{' + (n + 1) + '}+C', '\\frac{(' + inside + ')^{' + (n + 1) + '}}{' + (a * n) + '}+C'], rng);
      return {
        params: { a: a, b: b, n: n },
        question: '计算 $\\int (' + inside + ')^{' + n + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '第一类换元法（凑微分）：令 $u=' + inside + '$，则 $\\mathrm{d}u=' + a + '\\mathrm{d}x$，即 $\\mathrm{d}x=\\frac{1}{' + a + '}\\mathrm{d}u$。',
        steps: [
          { m: 'u = ' + inside + ',\\quad \\mathrm{d}u = ' + a + '\\,\\mathrm{d}x \\Rightarrow \\mathrm{d}x = \\frac{1}{' + a + '}\\mathrm{d}u',
            t: '设新变量 $u$ 等于括号里的整块，把 $\\mathrm{d}x$ 换成 $\\mathrm{d}u$。' },
          { m: '\\int u^{' + n + '}\\cdot\\frac{1}{' + a + '}\\mathrm{d}u = \\frac{1}{' + a + '}\\cdot\\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '}',
            t: '积分变成简单的幂函数积分，前面多一个 $\\frac{1}{' + a + '}$。' },
          { m: '= \\frac{(' + inside + ')^{' + (n + 1) + '}}{' + (a * (n + 1)) + '}+C',
            t: '把 $u$ 换回 $' + inside + '$，系数 $\\frac{1}{' + a + '}\\times\\frac{1}{' + (n + 1) + '}=\\frac{1}{' + (a * (n + 1)) + '}$。' }
        ],
        pitfall: '换元后 $\\mathrm{d}x=\\frac{1}{' + a + '}\\mathrm{d}u$，这个 $\\frac{1}{' + a + '}$ 最容易漏。'
      };
    }
  });

  /* I6 进阶：凑微分 ∫x/(x²+a) dx */
  QB.register({
    id: 'indint-I6', type: 'indint', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 3, rng);
      var correct = '\\frac{1}{2}\\ln(x^2+' + a + ')+C';
      var d = bo(correct, ['\\ln(x^2+' + a + ')+C', '2\\ln(x^2+' + a + ')+C', '\\frac{2x}{x^2+' + a + '}+C'], rng);
      return {
        params: { a: a },
        question: '计算 $\\int \\frac{x}{x^2+' + a + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '发现分子 $x$ 和分母的导数 $2x$ 只差一个系数，用"凑微分"：$\\int\\frac{u\\prime}{u}\\mathrm{d}x=\\ln|u|$。',
        steps: [
          { m: '(x^2+' + a + ')\\prime = 2x',
            t: '先看分母的导数：$2x$。分子是 $x$，正好差一个 2。' },
          { m: '\\int \\frac{x}{x^2+' + a + '}\\mathrm{d}x = \\frac{1}{2}\\int \\frac{2x}{x^2+' + a + '}\\mathrm{d}x',
            t: '分子乘 2 变成分母的导数，积分号外乘 $\\frac{1}{2}$ 补偿。' },
          { m: '= \\frac{1}{2}\\ln(x^2+' + a + ') + C',
            t: '$\\int\\frac{u\\prime}{u}\\mathrm{d}x=\\ln|u|$，这里 $u=x^2+' + a + '>0$。' }
        ],
        pitfall: '前面的系数是 $\\frac{1}{2}$，不是 2。'
      };
    }
  });

  /* I7 进阶：∫sinx·cosx dx */
  QB.register({
    id: 'indint-I7', type: 'indint', difficulty: 'medium',
    gen: function (rng) {
      var correct = '\\frac{1}{2}\\sin^2 x+C';
      var d = bo(correct, ['\\sin^2 x+C', '-\\frac{1}{2}\\sin^2 x+C', '\\frac{1}{2}\\cos^2 x+C'], rng);
      return {
        params: {},
        question: '计算 $\\int \\sin x\\cos x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '凑微分：$\\cos x\\,\\mathrm{d}x = \\mathrm{d}(\\sin x)$。令 $u=\\sin x$，积分变成 $\\int u\\,\\mathrm{d}u$。',
        steps: [
          { m: 'u = \\sin x,\\quad \\mathrm{d}u = \\cos x\\,\\mathrm{d}x',
            t: '注意到 $\\sin x$ 的导数正是 $\\cos x$，把 $\\cos x\\,\\mathrm{d}x$ 打包成 $\\mathrm{d}u$。' },
          { m: '\\int \\sin x\\cos x\\,\\mathrm{d}x = \\int u\\,\\mathrm{d}u = \\frac{u^2}{2}+C',
            t: '变成最简单的幂函数积分。' },
          { m: '= \\frac{1}{2}\\sin^2 x + C',
            t: '把 $u$ 换回 $\\sin x$。（用 $\\sin2x$ 半角公式算出的结果 $\\frac{x}{2}-\\frac{\\sin2x}{4}+C$ 也和它只差一个常数）' }
        ],
        pitfall: '也可以令 $u=\\cos x$，但 $\\mathrm{d}u=-\\sin x\\,\\mathrm{d}x$，符号别搞错。'
      };
    }
  });

  /* I8 困难：分部积分 ∫x e^x dx */
  QB.register({
    id: 'indint-I8', type: 'indint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '(x-1)e^{x}+C';
      var d = bo(correct, ['xe^{x}+C', '(x+1)e^{x}+C', '\\frac{x^2}{2}e^{x}+C'], rng);
      return {
        params: {},
        question: '计算 $\\int x e^{x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '多项式乘指数函数，用分部积分：$\\int u\\,\\mathrm{d}v = uv - \\int v\\,\\mathrm{d}u$。选 $u=x$，$\\mathrm{d}v=e^x\\mathrm{d}x$。',
        steps: [
          { m: 'u = x,\\quad \\mathrm{d}v = e^{x}\\mathrm{d}x \\Rightarrow \\mathrm{d}u = \\mathrm{d}x,\\quad v = e^{x}',
            t: '分部积分的选法：让 $u$ 求导后变简单（$x\\to 1$），$e^x$ 积分不变复杂。' },
          { m: '\\int x e^{x}\\mathrm{d}x = x e^{x} - \\int e^{x}\\mathrm{d}x',
            t: '套公式 $uv-\\int v\\,\\mathrm{d}u$。' },
          { m: '= x e^{x} - e^{x} + C = (x-1)e^{x}+C',
            t: '$\\int e^x\\mathrm{d}x=e^x$，再提公因式。' }
        ],
        pitfall: '分部积分公式中间是减号：$uv$ 减去 $\\int v\\mathrm{d}u$。'
      };
    }
  });

  /* I9 困难：分部积分 ∫x cosx dx */
  QB.register({
    id: 'indint-I9', type: 'indint', difficulty: 'hard',
    gen: function (rng) {
      var correct = 'x\\sin x+\\cos x+C';
      var d = bo(correct, ['x\\sin x-\\cos x+C', 'x\\sin x+C', '\\sin x+C'], rng);
      return {
        params: {},
        question: '计算 $\\int x\\cos x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分部积分：$u=x$，$\\mathrm{d}v=\\cos x\\,\\mathrm{d}x$。',
        steps: [
          { m: 'u = x,\\quad \\mathrm{d}v = \\cos x\\,\\mathrm{d}x \\Rightarrow v = \\sin x',
            t: '$\\cos x$ 积分得 $\\sin x$。' },
          { m: '\\int x\\cos x\\,\\mathrm{d}x = x\\sin x - \\int \\sin x\\,\\mathrm{d}x',
            t: '套公式 $uv-\\int v\\mathrm{d}u$。' },
          { m: '= x\\sin x - (-\\cos x) + C = x\\sin x + \\cos x + C',
            t: '$\\int\\sin x\\,\\mathrm{d}x=-\\cos x$，负负得正。' }
        ],
        pitfall: '$\\int\\sin x\\mathrm{d}x=-\\cos x$ 的负号，和公式里的减号，两个负号相乘得正。'
      };
    }
  });

  /* I10 困难：分部积分 ∫lnx dx */
  QB.register({
    id: 'indint-I10', type: 'indint', difficulty: 'hard',
    gen: function (rng) {
      var correct = 'x\\ln x-x+C';
      var d = bo(correct, ['x\\ln x+C', 'x\\ln x+x+C', '\\frac{(\\ln x)^2}{2}+C'], rng);
      return {
        params: {},
        question: '计算 $\\int \\ln x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '单独的 $\\ln x$ 怎么积？把它看成 $\\ln x \\times 1$，用分部积分：$u=\\ln x$，$\\mathrm{d}v=\\mathrm{d}x$。',
        steps: [
          { m: 'u = \\ln x,\\quad \\mathrm{d}v = \\mathrm{d}x \\Rightarrow \\mathrm{d}u = \\frac{1}{x}\\mathrm{d}x,\\quad v = x',
            t: '选 $u=\\ln x$ 是因为它求导后变成 $\\frac{1}{x}$，和 $v=x$ 相乘正好约成 1。' },
          { m: '\\int \\ln x\\,\\mathrm{d}x = x\\ln x - \\int x\\cdot\\frac{1}{x}\\,\\mathrm{d}x',
            t: '套公式：$uv-\\int v\\mathrm{d}u$。' },
          { m: '= x\\ln x - \\int 1\\,\\mathrm{d}x = x\\ln x - x + C',
            t: '$x\\cdot\\frac{1}{x}=1$，$\\int 1\\mathrm{d}x=x$。' }
        ],
        pitfall: '这个结论可以直接背：$\\int\\ln x\\,\\mathrm{d}x = x\\ln x - x + C$。'
      };
    }
  });

  /* I11 困难：降幂 ∫sin²x dx */
  QB.register({
    id: 'indint-I11', type: 'indint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{x}{2}-\\frac{\\sin 2x}{4}+C';
      var d = bo(correct, ['\\frac{x}{2}+\\frac{\\sin 2x}{4}+C', '-\\frac{\\cos 2x}{2}+C', '\\frac{x}{2}+C'], rng);
      return {
        params: {},
        question: '计算 $\\int \\sin^2 x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '平方没法直接积，先用降幂公式 $\\sin^2 x=\\frac{1-\\cos 2x}{2}$ 变成一次，再积分。',
        steps: [
          { m: '\\sin^2 x = \\frac{1-\\cos 2x}{2}',
            t: '降幂公式（半角公式）：把平方化成一次。' },
          { m: '\\int \\frac{1-\\cos 2x}{2}\\mathrm{d}x = \\frac{x}{2} - \\frac{1}{2}\\int\\cos 2x\\,\\mathrm{d}x',
            t: '拆成两项：第一项直接积，第二项是 $\\cos 2x$。' },
          { m: '= \\frac{x}{2} - \\frac{1}{2}\\cdot\\frac{\\sin 2x}{2} + C = \\frac{x}{2}-\\frac{\\sin 2x}{4}+C',
            t: '$\\int\\cos 2x\\,\\mathrm{d}x=\\frac{\\sin2x}{2}$，再乘外面的 $\\frac{1}{2}$。' }
        ],
        pitfall: '降幂公式分母是 2：$\\sin^2x=\\frac{1-\\cos2x}{2}$。'
      };
    }
  });

  /* I12 进阶：∫e^(ax+b) dx */
  QB.register({
    id: 'indint-I12', type: 'indint', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(2, 3, rng), b = ri(1, 2, rng);
      var inside = a + 'x' + signed(b);
      var correct = '\\frac{e^{' + inside + '}}{' + a + '}+C';
      var d = bo(correct, ['e^{' + inside + '}+C', a + 'e^{' + inside + '}+C', '\\frac{e^{' + inside + '}}{' + (a + b) + '}+C'], rng);
      return {
        params: { a: a, b: b },
        question: '计算 $\\int e^{' + inside + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '凑微分：$\\mathrm{d}(' + inside + ')=' + a + '\\mathrm{d}x$，把指数里整块当 $u$。',
        steps: [
          { m: 'u = ' + inside + ',\\quad \\mathrm{d}u = ' + a + '\\mathrm{d}x',
            t: '令指数部分整体为 $u$。' },
          { m: '\\int e^{u}\\cdot\\frac{1}{' + a + '}\\mathrm{d}u = \\frac{e^{u}}{' + a + '}+C',
            t: '$e^u$ 积分还是 $e^u$，换元带来的 $\\frac{1}{' + a + '}$ 保留。' },
          { m: '= \\frac{e^{' + inside + '}}{' + a + '}+C',
            t: '把 $u$ 换回去。' }
        ],
        pitfall: '别把 $b$ 也除进去，只除以 $x$ 的系数 ' + a + '。'
      };
    }
  });

  /* ---------- 定积分 ---------- */

  /* Df1 基础：∫[0,1] kx^n dx */
  QB.register({
    id: 'defint-Df1', type: 'defint', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var k = ri(2, 3, rng), n = ri(2, 4, rng);
        var correct = frac(k, n + 1);
        var d = bo(correct, [String(k * n), frac(k, n), frac(k, n + 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { k: k, n: n },
          question: '计算 $\\int_0^1 ' + k + 'x^{' + n + '}\\,\\mathrm{d}x$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '牛顿-莱布尼茨公式：先找原函数，再"上限代入减下限代入"。',
          steps: [
            { m: 'F(x) = \\frac{' + k + 'x^{' + (n + 1) + '}}{' + (n + 1) + '}',
              t: '先做不定积分：指数加 1，除以新指数，系数 ' + k + ' 保留。' },
            { m: '\\int_0^1 = F(1)-F(0) = \\frac{' + k + '}{' + (n + 1) + '} - 0 = ' + correct,
              t: '代入上限 1 和下限 0：$1^{' + (n + 1) + '}=1$，$0^{' + (n + 1) + '}=0$。' }
          ],
          pitfall: '先积出来再代上下限，顺序不能反。'
        };
      }
      throw new Error('Df1 retry fail');
    }
  });

  /* Df2 基础：∫[0,a] e^x dx */
  QB.register({
    id: 'defint-Df2', type: 'defint', difficulty: 'easy',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = 'e^{' + a + '}-1';
      var d = bo(correct, ['e^{' + a + '}', 'e^{' + a + '}+1', 'e^{' + a + '}-e'], rng);
      return {
        params: { a: a },
        question: '计算 $\\int_0^{' + a + '} e^{x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$e^x$ 的原函数就是它自己，代入上下限相减。',
        steps: [
          { m: '\\int e^{x}\\mathrm{d}x = e^{x}',
            t: '$e^x$ 积分不变，还是 $e^x$。' },
          { m: '\\left.e^{x}\\right|_0^{' + a + '} = e^{' + a + '} - e^{0} = e^{' + a + '}-1',
            t: '上限代 $' + a + '$ 得 $e^{' + a + '}$，下限代 0 得 $e^0=1$，相减。' }
        ],
        pitfall: '$e^0=1$ 不是 0！'
      };
    }
  });

  /* Df3 基础：∫[0,π] sinx dx */
  QB.register({
    id: 'defint-Df3', type: 'defint', difficulty: 'easy',
    gen: function (rng) {
      var correct = '2';
      var d = bo(correct, ['0', '-2', '\\pi'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^{\\pi} \\sin x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\sin x$ 的原函数是 $-\\cos x$，代入 $\\pi$ 和 0 相减，注意 $\\cos\\pi=-1$。',
        steps: [
          { m: '\\int \\sin x\\,\\mathrm{d}x = -\\cos x',
            t: '$\\sin$ 积分得 $-\\cos$。' },
          { m: '\\left.-\\cos x\\right|_0^{\\pi} = -\\cos\\pi - (-\\cos 0) = -(-1) - (-1)',
            t: '代入上下限：$\\cos\\pi=-1$，$\\cos0=1$。' },
          { m: '= 1 + 1 = 2',
            t: '两个负号变成加号，结果是 2。（几何上就是正弦曲线一个"小山包"的面积）' }
        ],
        pitfall: '$\\cos\\pi=-1$，符号是最容易错的地方。'
      };
    }
  });

  /* Df4 进阶：奇函数对称区间 ∫[-a,a] x³ dx */
  QB.register({
    id: 'defint-Df4', type: 'defint', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(2, 3, rng);
      var correct = '0';
      var d = bo(correct, [frac(a * a * a * a, 2), '-' + frac(a * a * a * a, 2), String(2 * a * a * a)], rng);
      return {
        params: { a: a },
        question: '计算 $\\int_{-' + a + '}^{' + a + '} x^3\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$x^3$ 是奇函数，积分区间 $[-' + a + ',' + a + ']$ 关于原点对称，左边的负面积和右边的正面积正好抵消。',
        steps: [
          { m: 'f(x)=x^3 \\text{ 是奇函数，且区间关于原点对称}',
            t: '奇函数的图像关于原点对称：左半边在 $x$ 轴下方，右半边在上方，形状完全一样。' },
          { m: '\\Rightarrow \\int_{-' + a + '}^{' + a + '} x^3\\mathrm{d}x = 0',
            t: '两半面积一正一负正好抵消，所以积分为 0。（直接算也能验证：$\\frac{x^4}{4}$ 代入 ±' + a + ' 相减得 0）' }
        ],
        pitfall: '对称区间 + 奇函数 = 0，这个结论能省很多计算。'
      };
    }
  });

  /* Df5 进阶：偶函数对称区间 ∫[-a,a] x² dx */
  QB.register({
    id: 'defint-Df5', type: 'defint', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 3, rng);
        var correct = frac(2 * a * a * a, 3);
        var d = bo(correct, ['0', frac(a * a * a, 3), frac(a * a, 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '计算 $\\int_{-' + a + '}^{' + a + '} x^2\\,\\mathrm{d}x$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '$x^2$ 是偶函数，左右两边图像一样，积分等于"右半边 × 2"。',
          steps: [
            { m: 'f(x)=x^2 \\text{ 是偶函数} \\Rightarrow \\int_{-' + a + '}^{' + a + '}x^2\\mathrm{d}x = 2\\int_0^{' + a + '}x^2\\mathrm{d}x',
              t: '偶函数关于 $y$ 轴对称，对称区间积分等于 2 倍半区间。' },
            { m: '= 2\\cdot\\frac{x^3}{3}\\bigg|_0^{' + a + '} = 2\\times\\frac{' + (a * a * a) + '}{3} = ' + correct,
              t: '$x^2$ 的原函数是 $\\frac{x^3}{3}$，代入 0 到 ' + a + ' 再乘 2。' }
          ],
          pitfall: '偶函数是对称区间的 2 倍；奇函数才是 0。'
        };
      }
      throw new Error('Df5 retry fail');
    }
  });

  /* Df6 进阶：换元 ∫[0,1] x e^(x²) dx */
  QB.register({
    id: 'defint-Df6', type: 'defint', difficulty: 'medium',
    gen: function (rng) {
      var correct = '\\frac{e-1}{2}';
      var d = bo(correct, ['e-1', '\\frac{e^2-1}{2}', '\\frac{e}{2}'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^1 x e^{x^2}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '凑微分换元：$u=x^2$，$\\mathrm{d}u=2x\\mathrm{d}x$，积分变成 $\\frac{1}{2}\\int e^u\\mathrm{d}u$。',
        steps: [
          { m: 'u = x^2,\\quad \\mathrm{d}u = 2x\\,\\mathrm{d}x',
            t: '设 $u=x^2$，这样 $x\\mathrm{d}x$ 可以打包成 $\\frac{1}{2}\\mathrm{d}u$。' },
          { m: '\\int_0^1 x e^{x^2}\\mathrm{d}x = \\frac{1}{2}\\int_0^1 e^{u}\\mathrm{d}u = \\frac{1}{2}e^{u}\\bigg|_0^1',
            t: '换元后（这里上下限不变，因为 $x$ 从 0 到 1 时 $u$ 也从 0 到 1）直接积。' },
          { m: '= \\frac{1}{2}(e-1)',
            t: '代入：$e^1-e^0=e-1$，再乘 $\\frac{1}{2}$。' }
        ],
        pitfall: '换元积分定积分时，上下限要么跟着换，要么换回去再代——别混着用。'
      };
    }
  });

  /* Df7 进阶：∫[0,1] 2x/(x²+1) dx */
  QB.register({
    id: 'defint-Df7', type: 'defint', difficulty: 'medium',
    gen: function (rng) {
      var correct = '\\ln 2';
      var d = bo(correct, ['2\\ln 2', '\\ln 2 + 1', '1'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^1 \\frac{2x}{x^2+1}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分子 $2x$ 正好是分母 $x^2+1$ 的导数，这是 $\\int\\frac{u\\prime}{u}\\mathrm{d}x=\\ln|u|$ 的经典形式。',
        steps: [
          { m: '(x^2+1)\\prime = 2x',
            t: '先验证：分子恰好是分母的导数。' },
          { m: '\\int_0^1 \\frac{2x}{x^2+1}\\mathrm{d}x = \\ln(x^2+1)\\big|_0^1',
            t: '直接写出原函数 $\\ln(x^2+1)$。' },
          { m: '= \\ln 2 - \\ln 1 = \\ln 2',
            t: '代入：$\\ln(1+1)-\\ln(0+1)=\\ln2-0=\\ln2$。' }
        ],
        pitfall: '$\\ln 1 = 0$，别写成 1。'
      };
    }
  });

  /* Df8 困难：分部积分 ∫[0,1] x e^x dx */
  QB.register({
    id: 'defint-Df8', type: 'defint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '1';
      var d = bo(correct, ['e-1', 'e', '0'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^1 x e^{x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先分部积分求出原函数 $(x-1)e^x$，再代入上下限。',
        steps: [
          { m: '\\int x e^{x}\\mathrm{d}x = x e^{x} - \\int e^{x}\\mathrm{d}x = (x-1)e^{x}',
            t: '分部积分：$u=x$，$\\mathrm{d}v=e^x\\mathrm{d}x$，得到原函数 $(x-1)e^x$。' },
          { m: '\\int_0^1 x e^{x}\\mathrm{d}x = (x-1)e^{x}\\big|_0^1',
            t: '用牛顿-莱布尼茨公式代入上下限。' },
          { m: '= (1-1)e^{1} - (0-1)e^{0} = 0 - (-1) = 1',
            t: '上限代入得 $0\\times e=0$；下限代入得 $(-1)\\times1=-1$；相减得 1。' }
        ],
        pitfall: '下限代入时 $(0-1)e^0=-1$，减它等于加 1。'
      };
    }
  });

  /* Df9 困难：分部积分 ∫[0,π] x sinx dx */
  QB.register({
    id: 'defint-Df9', type: 'defint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\pi';
      var d = bo(correct, ['0', '\\frac{\\pi}{2}', '2\\pi'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^{\\pi} x\\sin x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分部积分：$u=x$，$\\mathrm{d}v=\\sin x\\mathrm{d}x$，则 $v=-\\cos x$。',
        steps: [
          { m: '\\int x\\sin x\\,\\mathrm{d}x = -x\\cos x + \\int \\cos x\\,\\mathrm{d}x',
            t: '套公式 $uv-\\int v\\mathrm{d}u$：$x(-\\cos x)-\\int(-\\cos x)\\mathrm{d}x$。' },
          { m: '= -x\\cos x + \\sin x',
            t: '$\\int\\cos x\\,\\mathrm{d}x=\\sin x$。' },
          { m: '\\left.(-x\\cos x+\\sin x)\\right|_0^{\\pi} = (-\\pi\\cdot\\cos\\pi + \\sin\\pi) - (0+0) = \\pi',
            t: '代入上下限：$\\cos\\pi=-1$，所以 $-\\pi\\times(-1)=\\pi$，$\\sin\\pi=0$；下限全是 0。' }
        ],
        pitfall: '$\\cos\\pi=-1$，上限那一项是 $+\\pi$ 不是 $-\\pi$。'
      };
    }
  });

  /* Df10 困难：∫[0,1] 1/(1+x²) dx */
  QB.register({
    id: 'defint-Df10', type: 'defint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{\\pi}{4}';
      var d = bo(correct, ['\\frac{\\pi}{2}', '1', '\\pi'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^1 \\frac{1}{1+x^2}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '基本公式：$\\int\\frac{1}{1+x^2}\\mathrm{d}x=\\arctan x$。',
        steps: [
          { m: '(\\arctan x)\\prime = \\frac{1}{1+x^2}',
            t: '回忆一下：$\\arctan x$ 的导数正是 $\\frac{1}{1+x^2}$，所以它的原函数就是 $\\arctan x$。' },
          { m: '\\int_0^1 \\frac{1}{1+x^2}\\mathrm{d}x = \\arctan x\\big|_0^1',
            t: '直接代入上下限。' },
          { m: '= \\arctan 1 - \\arctan 0 = \\frac{\\pi}{4} - 0 = \\frac{\\pi}{4}',
            t: '$\\arctan 1=\\frac{\\pi}{4}$（45°），$\\arctan 0=0$。' }
        ],
        pitfall: '$\\arctan 1 = \\frac{\\pi}{4}$，不是 $\\frac{\\pi}{2}$。'
      };
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
