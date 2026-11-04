/* ============================================================
 * 题库扩充 ②：由网上经典例题拆分/归类而来（25 个新模板）
 * 每题带「技法标签」tech（有原题标签则沿用，无标签则按考点归类）
 * 答案全部由参数程序化生成
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions, coefX = QB.coefX, xpow = QB.xpow, powStr = QB.powStr;

  function ok4(o) { return new Set(o).size === 4; }

  /* ========== 极限 ========== */

  /* L18 基础：tan(ax)/sin(bx) —— 等价无穷小 */
  QB.register({
    id: 'limit-L18', type: 'limit', difficulty: 'easy', tech: '等价无穷小',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng), b = ri(2, 4, rng);
        if (a === b) continue;
        var correct = frac(a, b);
        var d = bo(correct, [frac(b, a), String(a * b), frac(a + b, 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '\\lim\\limits_{x\\to 0}\\frac{\\tan(' + a + 'x)}{\\sin(' + b + 'x)}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '等价无穷小代换：$x\\to 0$ 时 $\\tan\\Box\\sim\\Box$、$\\sin\\Box\\sim\\Box$，直接替换后约分。',
          steps: [
            { m: '\\tan(' + a + 'x)\\sim ' + a + 'x,\\quad \\sin(' + b + 'x)\\sim ' + b + 'x',
              t: '两个都是"一格无穷小"：角上的量趋近 0 时，$\\tan$、$\\sin$ 都和角本身等价。' },
            { m: '\\frac{\\tan(' + a + 'x)}{\\sin(' + b + 'x)} \\sim \\frac{' + a + 'x}{' + b + 'x}',
              t: '把分子分母分别替换成等价无穷小。' },
            { m: '= \\frac{' + a + '}{' + b + '}',
              t: '约掉 $x$，答案是系数之比 $\\frac{' + a + '}{' + b + '}$。' }
          ],
          pitfall: '等价无穷小替换只适用于乘除结构；遇到加减要先变形。'
        };
      }
      throw new Error('L18 retry fail');
    }
  });

  /* L19 基础：(x^a-1)/(x-1) —— 因式分解 */
  QB.register({
    id: 'limit-L19', type: 'limit', difficulty: 'easy', tech: '因式分解',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(3, 4, rng);
        var correct = String(a);
        var d = bo(correct, ['1', String(a - 1), String(a * a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '\\lim\\limits_{x\\to 1}\\frac{x^{' + a + '}-1}{x-1}',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '分子在 $x=1$ 处为 0，说明它含因子 $x-1$：用公式 $x^n-1=(x-1)(x^{n-1}+x^{n-2}+\\cdots+1)$ 拆开约分。',
          steps: [
            { m: 'x^{' + a + '}-1 = (x-1)(' + xpow(a - 1) + '+' + xpow(a - 2) + '+\\cdots+1)',
              t: '因式分解公式：$n$ 次方减 1 一定能提出 $(x-1)$。' },
            { m: '\\frac{x^{' + a + '}-1}{x-1} = ' + xpow(a - 1) + '+\\cdots+1',
              t: '约掉 $(x-1)$，剩下的括号里共有 ' + a + ' 个 1 次项。' },
            { m: 'x\\to 1 \\Rightarrow 1+1+\\cdots+1 = ' + a,
              t: '把 $x=1$ 代入，每一个 1 都等于 1，共 ' + a + ' 个，结果是 ' + a + '。' }
          ],
          pitfall: '这是 $\\frac{0}{0}$ 型，不能直接代入 0；要约分后再代入。'
        };
      }
      throw new Error('L19 retry fail');
    }
  });

  /* L20 进阶：√(x²+ax)-x —— 有理化 */
  QB.register({
    id: 'limit-L20', type: 'limit', difficulty: 'medium', tech: '有理化',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 6, rng);
        if (a % 2 !== 0) continue;
        var correct = frac(a, 2);
        var d = bo(correct, [String(a), String(2 * a), frac(a * a, 2)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '\\lim\\limits_{x\\to\\infty}\\left(\\sqrt{x^2+' + a + 'x}-x\\right)',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '$\\infty-\\infty$ 型：分子有理化，把根号差变成"除以根号和"，再分子分母同除以 $x$。',
          steps: [
            { m: '\\sqrt{x^2+' + a + 'x}-x = \\frac{(x^2+' + a + 'x)-x^2}{\\sqrt{x^2+' + a + 'x}+x}',
              t: '分子分母同乘共轭式 $\\sqrt{x^2+' + a + 'x}+x$，用平方差把根号消掉。' },
            { m: '= \\frac{' + a + 'x}{\\sqrt{x^2+' + a + 'x}+x}',
              t: '分子变成 $' + a + 'x$。' },
            { m: '= \\frac{' + a + '}{\\sqrt{1+\\frac{' + a + '}{x}}+1} \\to \\frac{' + a + '}{2}',
              t: '分子分母同除以 $x$：$\\frac{\\sqrt{x^2+ax}}{x}=\\sqrt{1+\\frac{a}{x}}\\to 1$，所以分母趋于 2。' }
          ],
          pitfall: '不能直接把 $x$ 提出来算成 $\\infty$；有理化后分母是 $\\sim 2x$，结果是 $\\frac{' + a + '}{2}$。'
        };
      }
      throw new Error('L20 retry fail');
    }
  });

  /* L21 进阶：左右极限 x|x|/x² */
  QB.register({
    id: 'limit-L21', type: 'limit', difficulty: 'medium', tech: '左右极限',
    gen: function (rng) {
      var correct = '不存在';
      var d = bo(correct, ['1', '-1', '0'], rng);
      return {
        params: {},
        question: '\\lim\\limits_{x\\to 0}\\frac{x|x|}{x^2}',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '含绝对值的极限先看左右极限：$x>0$ 时 $|x|=x$，$x<0$ 时 $|x|=-x$，两侧结果不同就是"极限不存在"。',
        steps: [
          { m: 'x>0:\\quad \\frac{x\\cdot x}{x^2} = 1',
            t: '从右边趋近 0 时，$|x|=x$，约分后恒等于 1。' },
          { m: 'x<0:\\quad \\frac{x\\cdot(-x)}{x^2} = -1',
            t: '从左边趋近 0 时，$|x|=-x$，约分后恒等于 −1。' },
          { m: '1 \\neq -1 \\Rightarrow \\text{极限不存在}',
            t: '左极限 −1、右极限 1，两者不相等，所以整体极限不存在。' }
          ],
          pitfall: '见到绝对值就要分左右；不要想当然约分后等于 1。'
      };
    }
  });

  /* L22 困难：(sinx-x)/x³ —— 洛必达/泰勒 */
  QB.register({
    id: 'limit-L22', type: 'limit', difficulty: 'hard', tech: '洛必达/泰勒',
    gen: function (rng) {
      var correct = '-\\frac{1}{6}';
      var d = bo(correct, ['0', '\\frac{1}{6}', '1'], rng);
      return {
        params: {},
        question: '\\lim\\limits_{x\\to 0}\\frac{\\sin x-x}{x^3}',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\frac{0}{0}$ 型。要么用洛必达连导三次，要么用泰勒展开 $\\sin x = x-\\frac{x^3}{6}+\\cdots$ 一眼看出答案。',
        steps: [
          { m: '\\sin x = x-\\frac{x^3}{6}+o(x^3)',
            t: '泰勒展开：$\\sin x$ 比 $x$ 少一点点，少的量正好是 $\\frac{x^3}{6}$ 级别。' },
          { m: '\\frac{\\sin x-x}{x^3} = \\frac{-\\frac{x^3}{6}+o(x^3)}{x^3}',
            t: '代入后分子是 $x$ 的三阶小量，分子分母同阶。' },
          { m: '\\to -\\frac{1}{6}',
            t: '所以极限是 $-\\frac{1}{6}$。（用洛必达连导三次也得到同样结果）' }
          ],
          pitfall: '答案是负数！$\\sin x < x$（$x>0$ 时），所以是 $-\\frac{1}{6}$ 不是 $\\frac{1}{6}$。'
      };
    }
  });

  /* ========== 导数 ========== */

  /* D16 进阶：x^k ln x */
  QB.register({
    id: 'derivative-D16', type: 'derivative', difficulty: 'medium', tech: '乘积法则',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = coefX(k, k - 1) + '\\ln x+' + xpow(k - 1);
      var d = bo(correct, [coefX(k, k - 1) + '\\ln x', xpow(k - 1) + '\\ln x', coefX(k, k - 1)], rng);
      return {
        params: { k: k },
        question: '设 $y=x^{' + k + '}\\ln x$，求 $\\frac{\\mathrm{d}y}{\\mathrm{d}x}$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '乘积求导：$(uv)\\prime = u\\prime v+uv\\prime$，注意 $(\\ln x)\\prime=\\frac{1}{x}$。',
        steps: [
          { m: '(x^{' + k + '})\\prime\\ln x + x^{' + k + '}(\\ln x)\\prime',
            t: '前导后不导，加前不导后导。' },
          { m: '= ' + coefX(k, k - 1) + '\\ln x + x^{' + k + '}\\cdot\\frac{1}{x}',
            t: '$x^{' + k + '}$ 求导得 $' + coefX(k, k - 1) + '$；$\\ln x$ 求导得 $\\frac{1}{x}$。' },
          { m: '= ' + coefX(k, k - 1) + '\\ln x + ' + xpow(k - 1),
            t: '第二项 $x^{' + k + '}\\cdot\\frac{1}{x}=' + xpow(k - 1) + '$，合并。' }
        ],
        pitfall: '$x^{' + k + '}\\cdot\\frac{1}{x}$ 是 $' + xpow(k - 1) + '$，不是 $x^{' + (k + 1) + '}$。'
      };
    }
  });

  /* D17 进阶：切线方程 */
  QB.register({
    id: 'derivative-D17', type: 'derivative', difficulty: 'medium', tech: '切线方程',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 3, rng);
        var correct = 'y=' + (2 * a) + 'x-' + (a * a);
        var d = bo(correct, ['y=' + a + 'x-' + (a * a), 'y=' + (2 * a) + 'x+' + (a * a), 'y=' + (2 * a) + 'x'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '曲线 $y=x^2$ 在点 $x=' + a + '$ 处的切线方程是',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '切线 = 点 + 斜率：斜率是导数值 $y\\prime(' + a + ')$，再用点斜式写方程。',
          steps: [
            { m: 'y\\prime = 2x \\Rightarrow k = y\\prime(' + a + ') = ' + (2 * a),
              t: '先求导，得到切线斜率。' },
            { m: '\\text{切点}(' + a + ',' + (a * a) + ')',
              t: '切点在曲线上：把 $x=' + a + '$ 代入 $y=x^2$ 得 $y=' + (a * a) + '$。' },
            { m: 'y-' + (a * a) + '=' + (2 * a) + '(x-' + a + ') \\Rightarrow y=' + (2 * a) + 'x-' + (a * a),
              t: '点斜式展开，得到切线方程 $y=' + (2 * a) + 'x-' + (a * a) + '$。' }
          ],
          pitfall: '斜率是 $' + (2 * a) + '$（导数值），不是 $' + a + '$；常数项是 $-' + (a * a) + '$。'
        };
      }
      throw new Error('D17 retry fail');
    }
  });

  /* D18 困难：隐函数 x²+xy+y²=3 在 (1,1) */
  QB.register({
    id: 'derivative-D18', type: 'derivative', difficulty: 'hard', tech: '隐函数求导',
    gen: function (rng) {
      var correct = '-1';
      var d = bo(correct, ['1', '-\\frac{1}{2}', '2'], rng);
      return {
        params: {},
        question: '由方程 $x^2+xy+y^2=3$ 确定的隐函数 $y=y(x)$，在点 $(1,1)$ 处的导数 $\\frac{\\mathrm{d}y}{\\mathrm{d}x}=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两边对 $x$ 求导：$x$ 正常求，$y$ 当 $x$ 的函数（乘 $y\\prime$），中间的 $xy$ 用乘法法则。',
        steps: [
          { m: '2x + (y+xy\\prime) + 2yy\\prime = 0',
            t: '逐项求导：$x^2\\to 2x$；$xy$ 用乘法法则得 $y+xy\\prime$；$y^2$ 得 $2yy\\prime$。' },
          { m: 'y\\prime(x+2y) = -(2x+y) \\Rightarrow y\\prime = -\\frac{2x+y}{x+2y}',
            t: '合并含 $y\\prime$ 的项，解出 $y\\prime$。' },
          { m: 'y\\prime(1,1) = -\\frac{3}{3} = -1',
            t: '把 $x=1$、$y=1$ 代入。' }
          ],
          pitfall: '对 $xy$ 求导别漏项：$(xy)\\prime = y+xy\\prime$。'
      };
    }
  });

  /* D19 进阶：sin²x 求导 */
  QB.register({
    id: 'derivative-D19', type: 'derivative', difficulty: 'medium', tech: '复合函数',
    gen: function (rng) {
      var correct = '\\sin 2x';
      var d = bo(correct, ['\\cos 2x', '2\\cos 2x', '\\sin^2 x'], rng);
      return {
        params: {},
        question: '设 $y=\\sin^2 x$，求 $\\frac{\\mathrm{d}y}{\\mathrm{d}x}$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\sin^2 x=(\\sin x)^2$ 是复合函数：外层平方求导得 $2\\sin x$，再乘内层 $(\\sin x)\\prime$。',
        steps: [
          { m: '(\\sin^2 x)\\prime = 2\\sin x\\cdot(\\sin x)\\prime',
            t: '外层平方求导，里面留 $\\sin x$，再乘内层导数。' },
          { m: '= 2\\sin x\\cos x',
            t: '$(\\sin x)\\prime=\\cos x$。' },
          { m: '= \\sin 2x',
            t: '用倍角公式 $2\\sin x\\cos x=\\sin 2x$，答案最简洁的形式是 $\\sin 2x$。' }
        ],
        pitfall: '别把 $\\sin^2 x$ 的导数写成 $2\\sin x$（漏乘 $\\cos x$）或 $\\cos 2x$（多一个符号问题）。'
      };
    }
  });

  /* ========== 中值定理与导数应用 ========== */

  /* A9 进阶：对称区间上三次函数最值 */
  QB.register({
    id: 'mvt-A9', type: 'mvt', difficulty: 'medium', tech: '闭区间最值',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = String(2 * a * a * a);
      var d = bo(correct, ['0', String(-2 * a * a * a), String(a * a * a)], rng);
      return {
        params: { a: a },
        question: '函数 $f(x)=x^3-' + (3 * a * a) + 'x$ 在 $[-' + (2 * a) + ',' + (2 * a) + ']$ 上的最大值是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '闭区间最值三步：①求驻点；②算驻点与两端点的函数值；③取最大。奇函数的结构让计算变简单。',
        steps: [
          { m: 'f\\prime = 3x^2-' + (3 * a * a) + ' = 0 \\Rightarrow x = \\pm ' + a,
            t: '驻点是 $\\pm ' + a + '$，都在区间 $[-' + (2 * a) + ',' + (2 * a) + ']$ 内。' },
          { m: 'f(-' + (2 * a) + ')=' + (-2 * a * a * a) + ',\\; f(-' + a + ')=' + (2 * a * a * a) + ',\\; f(' + a + ')=' + (-2 * a * a * a) + ',\\; f(' + (2 * a) + ')=' + (2 * a * a * a),
            t: '四个候选点的函数值：两个端点和两个驻点。' },
          { m: '\\max = ' + correct,
            t: '最大值是 $' + correct + '$（在 $x=-' + a + '$ 和 $x=' + (2 * a) + '$ 处同时取到）。' }
        ],
        pitfall: '端点函数值和驻点函数值都要算，最大值可能出现在端点。'
      };
    }
  });

  /* A10 困难：拐点个数 */
  QB.register({
    id: 'mvt-A10', type: 'mvt', difficulty: 'hard', tech: '拐点判定',
    gen: function (rng) {
      var correct = '1';
      var d = bo(correct, ['0', '2', '3'], rng);
      return {
        params: {},
        question: '曲线 $y=x^3-3x^2$ 的拐点个数是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '拐点 = 凹凸性改变的点：找 $y\\prime\\prime=0$ 且两侧变号的位置。',
        steps: [
          { m: 'y\\prime = 3x^2-6x,\\quad y\\prime\\prime = 6x-6',
            t: '求两次导。' },
          { m: 'y\\prime\\prime = 0 \\Rightarrow x = 1',
            t: '二阶导只有一个零点。' },
          { m: 'x<1 \\text{ 时 } y\\prime\\prime<0,\\; x>1 \\text{ 时 } y\\prime\\prime>0 \\Rightarrow \\text{拐点 1 个}',
            t: '两侧二阶导符号相反，凹凸性确实改变，所以拐点共 1 个。' }
          ],
          pitfall: '二阶导为零只说明"可能"是拐点，必须检查两侧是否变号。'
      };
    }
  });

  /* ========== 不定积分 ========== */

  /* I17 基础：∫(ax+b)dx */
  QB.register({
    id: 'indint-I17', type: 'indint', difficulty: 'easy', tech: '基本积分公式',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 3, rng), b = ri(1, 2, rng);
        var correct = '\\frac{' + a + 'x^2}{2}+' + b + 'x+C';
        var d = bo(correct, [a + 'x^2+' + b + 'x+C', '\\frac{' + a + 'x^2}{2}+C', '\\frac{' + a + 'x^2}{2}+' + b + 'x'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '计算 $\\int\\left(' + a + 'x+' + b + '\\right)\\,\\mathrm{d}x$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '逐项积分：常数系数保留，幂函数"指数加 1 除以新指数"，最后加 $C$。',
          steps: [
            { m: '\\int ' + a + 'x\\,\\mathrm{d}x = \\frac{' + a + 'x^2}{2}',
              t: '$x$ 积分得 $\\frac{x^2}{2}$，系数 ' + a + ' 保留。' },
            { m: '\\int ' + b + '\\,\\mathrm{d}x = ' + b + 'x',
              t: '常数积分就是常数 × $x$。' },
            { m: '= \\frac{' + a + 'x^2}{2}+' + b + 'x+C',
              t: '两项相加，别忘任意常数 $C$。' }
          ],
          pitfall: '不定积分必须带 $+C$；系数 ' + a + ' 不要弄丢。'
        };
      }
      throw new Error('I17 retry fail');
    }
  });

  /* I19 进阶：∫x√(x²+a)dx —— 凑微分 */
  QB.register({
    id: 'indint-I19', type: 'indint', difficulty: 'medium', tech: '凑微分',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = '\\frac{1}{3}(x^2+' + a + ')^{3/2}+C';
      var d = bo(correct, ['\\frac{2}{3}(x^2+' + a + ')^{3/2}+C', '\\frac{1}{3}(x^2+' + a + ')^{1/2}+C', '\\frac{1}{2}(x^2+' + a + ')^2+C'], rng);
      return {
        params: { a: a },
        question: '计算 $\\int x\\sqrt{x^2+' + a + '}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '令 $u=x^2+' + a + '$，则 $\\mathrm{d}u=2x\\,\\mathrm{d}x$，根号变成 $\\sqrt{u}$，套幂函数积分公式。',
        steps: [
          { m: 'u = x^2+' + a + ',\\quad \\mathrm{d}u = 2x\\,\\mathrm{d}x \\Rightarrow x\\,\\mathrm{d}x = \\frac{1}{2}\\mathrm{d}u',
            t: '把 $x\\,\\mathrm{d}x$ 打包成 $\\frac{1}{2}\\mathrm{d}u$。' },
          { m: '\\int \\sqrt{u}\\cdot\\frac{1}{2}\\mathrm{d}u = \\frac{1}{2}\\cdot\\frac{2}{3}u^{3/2}',
            t: '$\\int u^{1/2}\\mathrm{d}u=\\frac{2}{3}u^{3/2}$，再乘 $\\frac{1}{2}$。' },
          { m: '= \\frac{1}{3}(x^2+' + a + ')^{3/2}+C',
            t: '把 $u$ 换回去，系数 $\\frac{1}{2}\\times\\frac{2}{3}=\\frac{1}{3}$。' }
        ],
        pitfall: '指数是 $\\frac{3}{2}$，外面系数是 $\\frac{1}{3}$（$\\frac{1}{2}\\times\\frac{2}{3}$）。'
      };
    }
  });

  /* I20 困难：∫e^{√x}/√x dx —— 换元 */
  QB.register({
    id: 'indint-I20', type: 'indint', difficulty: 'hard', tech: '换元法',
    gen: function (rng) {
      var correct = '2e^{\\sqrt{x}}+C';
      var d = bo(correct, ['e^{\\sqrt{x}}+C', '2\\sqrt{x}e^{\\sqrt{x}}+C', '\\frac{e^{\\sqrt{x}}}{2}+C'], rng);
      return {
        params: {},
        question: '计算 $\\int \\frac{e^{\\sqrt{x}}}{\\sqrt{x}}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '根号很碍事，令 $u=\\sqrt{x}$，则 $\\mathrm{d}u=\\frac{1}{2\\sqrt{x}}\\mathrm{d}x$，正好凑出题目里的 $\\frac{1}{\\sqrt{x}}\\mathrm{d}x$。',
        steps: [
          { m: 'u = \\sqrt{x},\\quad \\mathrm{d}u = \\frac{1}{2\\sqrt{x}}\\mathrm{d}x',
            t: '$\\sqrt{x}$ 的导数是 $\\frac{1}{2\\sqrt{x}}$。' },
          { m: '\\int e^{\\sqrt{x}}\\cdot\\frac{1}{\\sqrt{x}}\\mathrm{d}x = 2\\int e^{u}\\,\\mathrm{d}u',
            t: '因为 $\\frac{1}{\\sqrt{x}}\\mathrm{d}x = 2\\,\\mathrm{d}u$，换元后变成简单的指数积分。' },
          { m: '= 2e^{u}+C = 2e^{\\sqrt{x}}+C',
            t: '$\\int e^u\\mathrm{d}u=e^u$，换回 $u=\\sqrt{x}$。' }
        ],
        pitfall: '换元后自变量换成 $u$，系数 2 来自 $\\mathrm{d}x=2\\sqrt{x}\\,\\mathrm{d}u$，别丢。'
      };
    }
  });

  /* I21 进阶：∫cos²x dx —— 降幂 */
  QB.register({
    id: 'indint-I21', type: 'indint', difficulty: 'medium', tech: '降幂公式',
    gen: function (rng) {
      var correct = '\\frac{x}{2}+\\frac{\\sin 2x}{4}+C';
      var d = bo(correct, ['\\frac{x}{2}-\\frac{\\sin 2x}{4}+C', '\\frac{\\sin^3 x}{3}+C', '\\frac{x}{2}+C'], rng);
      return {
        params: {},
        question: '计算 $\\int \\cos^2 x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '平方项不能直接积，先用降幂公式 $\\cos^2 x=\\frac{1+\\cos 2x}{2}$ 化成一次，再逐项积分。',
        steps: [
          { m: '\\cos^2 x = \\frac{1+\\cos 2x}{2}',
            t: '降幂公式（二倍角）。' },
          { m: '\\int \\frac{1+\\cos 2x}{2}\\mathrm{d}x = \\frac{x}{2}+\\frac{1}{2}\\cdot\\frac{\\sin 2x}{2}',
            t: '拆成两项：$\\frac{1}{2}$ 积分得 $\\frac{x}{2}$；$\\cos 2x$ 积分得 $\\frac{\\sin 2x}{2}$。' },
          { m: '= \\frac{x}{2}+\\frac{\\sin 2x}{4}+C',
            t: '合并系数，加 $C$。' }
        ],
        pitfall: '$\\int\\cos 2x\\mathrm{d}x=\\frac{\\sin 2x}{2}$，外面还有一个 $\\frac{1}{2}$，合起来是 $\\frac{1}{4}$。'
      };
    }
  });

  /* I22 困难：∫x²e^x dx —— 分部积分两次 */
  QB.register({
    id: 'indint-I22', type: 'indint', difficulty: 'hard', tech: '分部积分',
    gen: function (rng) {
      var correct = '(x^2-2x+2)e^{x}+C';
      var d = bo(correct, ['(x^2+2x+2)e^{x}+C', '(x^2-2x)e^{x}+C', '\\frac{x^3}{3}e^{x}+C'], rng);
      return {
        params: {},
        question: '计算 $\\int x^2 e^{x}\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '多项式乘指数：分部积分两次，每次把多项式的次数降一。',
        steps: [
          { m: '\\int x^2e^x\\mathrm{d}x = x^2e^x - 2\\int xe^x\\mathrm{d}x',
            t: '第一次分部：$u=x^2$，$\\mathrm{d}v=e^x\\mathrm{d}x$。' },
          { m: '\\int xe^x\\mathrm{d}x = (x-1)e^x',
            t: '第二次分部：$\\int xe^x\\mathrm{d}x=xe^x-e^x$。' },
          { m: '= x^2e^x - 2(x-1)e^x + C = (x^2-2x+2)e^x+C',
            t: '代入合并，整理成 $ (x^2-2x+2)e^x $。' }
        ],
        pitfall: '两次分部后合并同类项：$x^2-2x+2$，中间项的符号容易错。'
      };
    }
  });

  /* ========== 定积分 ========== */

  /* Df15 基础：∫[1,a] 1/x² */
  QB.register({
    id: 'defint-Df15', type: 'defint', difficulty: 'easy', tech: '牛顿-莱布尼茨',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng);
        var correct = frac(a - 1, a);
        var d = bo(correct, [frac(1, a), '1', frac(a + 1, a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '计算 $\\int_1^{' + a + '} \\frac{1}{x^2}\\,\\mathrm{d}x$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '$\\frac{1}{x^2}=x^{-2}$，原函数是 $-\\frac{1}{x}$，代入上下限相减。',
          steps: [
            { m: '\\int x^{-2}\\mathrm{d}x = -\\frac{1}{x}',
              t: '指数加 1 变 −1，除以 −1。' },
            { m: '\\left[-\\frac{1}{x}\\right]_1^{' + a + '} = -\\frac{1}{' + a + '}-(-1)',
              t: '上限代入得 $-\\frac{1}{' + a + '}$，下限代入得 −1，相减。' },
            { m: '= 1-\\frac{1}{' + a + '} = ' + correct,
              t: '结果是 $1-\\frac{1}{' + a + '}=\\frac{' + (a - 1) + '}{' + a + '}$。' }
          ],
          pitfall: '下限代入是 $-\\frac{1}{1}=-1$，减去它等于加 1，别把符号弄错。'
        };
      }
      throw new Error('Df15 retry fail');
    }
  });

  /* Df16 进阶：∫[0,1](ax+b) —— 定积分计算 */
  QB.register({
    id: 'defint-Df16', type: 'defint', difficulty: 'medium', tech: '定积分计算',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 4, rng), b = ri(1, 3, rng);
        var correct = String(a / 2 + b);
        var d = bo(correct, [String(a / 2), String(b), String(a + b)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '计算 $\\int_0^1\\left(' + a + 'x+' + b + '\\right)\\,\\mathrm{d}x$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '先求原函数再代上下限：$\\int_0^1$ 只要算 $F(1)-F(0)$。',
          steps: [
            { m: 'F(x) = \\frac{' + a + 'x^2}{2}+' + b + 'x',
              t: '逐项积分得到原函数。' },
            { m: 'F(1)-F(0) = \\left(\\frac{' + a + '}{2}+' + b + '\\right)-0',
              t: '代入 1 和 0。' },
            { m: '= ' + correct,
              t: '$\\frac{' + a + '}{2}+' + b + '=' + correct + '$。' }
          ],
          pitfall: '定积分结果是数，不是函数：不需要加 $C$。'
        };
      }
      throw new Error('Df16 retry fail');
    }
  });

  /* Df17 进阶：奇偶性 ∫[-1,1](x³+x²) */
  QB.register({
    id: 'defint-Df17', type: 'defint', difficulty: 'medium', tech: '奇偶性',
    gen: function (rng) {
      var correct = '\\frac{2}{3}';
      var d = bo(correct, ['0', '2', '\\frac{4}{3}'], rng);
      return {
        params: {},
        question: '计算 $\\int_{-1}^{1}\\left(x^3+x^2\\right)\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '对称区间先看奇偶：$x^3$ 是奇函数（积分为 0），$x^2$ 是偶函数（等于 2 倍半区间）。',
        steps: [
          { m: '\\int_{-1}^{1}x^3\\mathrm{d}x = 0',
            t: '奇函数在对称区间上积分为 0。' },
          { m: '\\int_{-1}^{1}x^2\\mathrm{d}x = 2\\int_0^{1}x^2\\mathrm{d}x = 2\\cdot\\frac{1}{3}',
            t: '偶函数对称区间 = 2 倍半区间，$\\int_0^1x^2=\\frac{1}{3}$。' },
          { m: '= 0+\\frac{2}{3} = \\frac{2}{3}',
            t: '两项相加得 $\\frac{2}{3}$。' }
          ],
          pitfall: '只有奇函数在对称区间才是 0；偶函数是 2 倍，不是 0。'
      };
    }
  });

  /* Df18 困难：∫[0,π/2] sin²x —— 降幂 */
  QB.register({
    id: 'defint-Df18', type: 'defint', difficulty: 'hard', tech: '降幂积分',
    gen: function (rng) {
      var correct = '\\frac{\\pi}{4}';
      var d = bo(correct, ['\\frac{\\pi}{2}', '\\frac{1}{2}', '1'], rng);
      return {
        params: {},
        question: '计算 $\\int_0^{\\frac{\\pi}{2}}\\sin^2 x\\,\\mathrm{d}x$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '平方项先降幂：$\\sin^2x=\\frac{1-\\cos 2x}{2}$，再积分。',
        steps: [
          { m: '\\int_0^{\\pi/2}\\frac{1-\\cos 2x}{2}\\mathrm{d}x',
            t: '降幂后拆成两项。' },
          { m: '= \\frac{1}{2}\\left[x-\\frac{\\sin 2x}{2}\\right]_0^{\\pi/2}',
            t: '$1$ 积分得 $x$，$\\cos 2x$ 积分得 $\\frac{\\sin 2x}{2}$。' },
          { m: '= \\frac{1}{2}\\left(\\frac{\\pi}{2}-0\\right) = \\frac{\\pi}{4}',
            t: '代入：$\\sin\\pi=0$，$\\sin0=0$，只剩 $\\frac{\\pi}{2}$，再乘 $\\frac{1}{2}$。' }
        ],
        pitfall: '$\\sin 2x$ 在 $\\frac{\\pi}{2}$ 处等于 $\\sin\\pi=0$，别记成 1。'
      };
    }
  });

  /* ========== 定积分应用 ========== */

  /* Ap13 进阶：√x 与 x 围成面积 */
  QB.register({
    id: 'defapp-Ap13', type: 'defapp', difficulty: 'medium', tech: '两曲线面积',
    gen: function (rng) {
      var correct = '\\frac{1}{6}';
      var d = bo(correct, ['\\frac{1}{3}', '\\frac{1}{2}', '\\frac{2}{3}'], rng);
      return {
        params: {},
        question: '由曲线 $y=\\sqrt{x}$ 与直线 $y=x$ 所围成平面图形的面积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '先求两线交点确定区间，再"上减下"积分：$\\int(\\sqrt{x}-x)\\mathrm{d}x$。',
        steps: [
          { m: '\\sqrt{x}=x \\Rightarrow x=0,1',
            t: '交点：$x=0$ 和 $x=1$。' },
          { m: 'S = \\int_0^1\\left(\\sqrt{x}-x\\right)\\mathrm{d}x',
            t: '在 $(0,1)$ 内 $\\sqrt{x}>x$（比如 $x=\\frac{1}{4}$ 时 $\\frac{1}{2}>\\frac{1}{4}$），所以上减下。' },
          { m: '= \\left[\\frac{2}{3}x^{3/2}-\\frac{x^2}{2}\\right]_0^1 = \\frac{2}{3}-\\frac{1}{2} = \\frac{1}{6}',
            t: '积分代入得 $\\frac{2}{3}-\\frac{1}{2}=\\frac{1}{6}$。' }
        ],
        pitfall: '$\\int\\sqrt{x}= \\frac{2}{3}x^{3/2}$，别记成 $\\frac{1}{2\\sqrt{x}}$（那是导数）。'
      };
    }
  });

  /* Ap14 困难：sin x 绕 x 轴体积 */
  QB.register({
    id: 'defapp-Ap14', type: 'defapp', difficulty: 'hard', tech: '旋转体体积',
    gen: function (rng) {
      var correct = '\\frac{\\pi^2}{2}';
      var d = bo(correct, ['\\frac{\\pi}{2}', '\\pi^2', '2\\pi'], rng);
      return {
        params: {},
        question: '由曲线 $y=\\sin x$（$0\\le x\\le\\pi$）与 $x$ 轴围成的图形绕 $x$ 轴旋转一周所得旋转体的体积是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '圆盘法：$V=\\pi\\int y^2\\mathrm{d}x$，代入 $y=\\sin x$ 得 $\\pi\\int\\sin^2x\\,\\mathrm{d}x$。',
        steps: [
          { m: 'V = \\pi\\int_0^{\\pi}\\sin^2x\\,\\mathrm{d}x',
            t: '半径是 $\\sin x$，截面圆面积 $\\pi\\sin^2x$。' },
          { m: '\\int_0^{\\pi}\\sin^2x\\mathrm{d}x = \\frac{\\pi}{2}',
            t: '降幂后积分：$\\int_0^{\\pi}\\frac{1-\\cos2x}{2}=\\frac{\\pi}{2}$。' },
          { m: 'V = \\pi\\cdot\\frac{\\pi}{2} = \\frac{\\pi^2}{2}',
            t: '乘上外面的 $\\pi$，得到 $\\frac{\\pi^2}{2}$。' }
        ],
        pitfall: '最后还要乘一个 $\\pi$（来自圆盘面积），答案是 $\\pi^2$ 相关，不是 $\\pi$ 的一次方。'
      };
    }
  });

  /* ========== 微分方程 ========== */

  /* O13 基础：y'=e^(kx) 通解 */
  QB.register({
    id: 'ode-O13', type: 'ode', difficulty: 'easy', tech: '直接积分',
    gen: function (rng) {
      var k = ri(2, 3, rng);
      var correct = '\\frac{e^{' + k + 'x}}{' + k + '}+C';
      var d = bo(correct, ['e^{' + k + 'x}+C', k + 'e^{' + k + 'x}+C', '\\frac{e^{' + k + 'x}}{' + (k * k) + '}+C'], rng);
      return {
        params: { k: k },
        question: '微分方程 $y\\prime=e^{' + k + 'x}$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两边直接积分：$y=\\int e^{' + k + 'x}\\mathrm{d}x$，指数内层系数要除下去。',
        steps: [
          { m: 'y = \\int e^{' + k + 'x}\\mathrm{d}x',
            t: '右边积分。' },
          { m: '= \\frac{e^{' + k + 'x}}{' + k + '}+C',
            t: '$e^{' + k + 'x}$ 积分得 $\\frac{e^{' + k + 'x}}{' + k + '}$，再加 $C$。' }
        ],
        pitfall: '内层系数 ' + k + ' 要除下去，别忘 $C$。'
      };
    }
  });

  /* O14 进阶：初值问题 y'=2x, y(a)=b */
  QB.register({
    id: 'ode-O14', type: 'ode', difficulty: 'medium', tech: '初值问题',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 2, rng), b = ri(1, 3, rng);
        if (b - a * a < 0) continue;
        var shift = b - a * a;
        var correct = 'x^2' + (shift === 0 ? '' : (shift > 0 ? '+' : '') + shift);
        var d = bo(correct, ['x^2', 'x^2+' + b, 'x^2-' + (a * a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '求微分方程 $y\\prime=2x$ 满足 $y(' + a + ')=' + b + '$ 的特解',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '先积分得通解 $y=x^2+C$，再用初始条件定 $C$。',
          steps: [
            { m: 'y = x^2+C',
              t: '直接积分。' },
            { m: 'y(' + a + ') = ' + (a * a) + '+C = ' + b + ' \\Rightarrow C = ' + shift,
              t: '代入 $x=' + a + '$：$' + (a * a) + '+C=' + b + '$，解出 $C=' + shift + '$。' },
            { m: 'y = ' + correct,
              t: '代回通解得到特解。' }
          ],
          pitfall: '初始条件是把 $x$ 和 $y$ 的具体值代入求 $C$，不是把 $C$ 当变量。'
        };
      }
      throw new Error('O14 retry fail');
    }
  });

  /* O15 困难：y'=2kxy, y(0)=1 */
  QB.register({
    id: 'ode-O15', type: 'ode', difficulty: 'hard', tech: '分离变量',
    gen: function (rng) {
      var k = ri(1, 2, rng);
      var correct = 'e^{' + k + 'x^2}';
      var d = bo(correct, ['Ce^{' + k + 'x^2}', 'e^{' + (2 * k) + 'x}', 'e^{' + k + 'x}'], rng);
      return {
        params: { k: k },
        question: '求微分方程 $y\\prime=' + (2 * k) + 'xy$ 满足 $y(0)=1$ 的特解',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '分离变量：$\\frac{\\mathrm{d}y}{y}=' + (2 * k) + 'x\\,\\mathrm{d}x$，积分后用 $y(0)=1$ 定常数。',
        steps: [
          { m: '\\frac{\\mathrm{d}y}{y} = ' + (2 * k) + 'x\\,\\mathrm{d}x \\Rightarrow \\ln|y| = ' + k + 'x^2+C_1',
            t: '分离变量并积分：$' + (2 * k) + 'x$ 积分是 $' + k + 'x^2$。' },
          { m: 'y = Ce^{' + k + 'x^2}',
            t: '取指数得通解。' },
          { m: 'y(0) = C = 1 \\Rightarrow y = e^{' + k + 'x^2}',
            t: '代入 $x=0$：$e^0=1$，所以 $C=1$。' }
        ],
        pitfall: '通解带常数 $C$，代入初始条件后才是特解 $e^{' + k + 'x^2}$。'
      };
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
