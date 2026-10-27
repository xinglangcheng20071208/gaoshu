/* ============================================================
 * 题库：微分中值定理与导数应用（6 个模板）
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* A1 基础：单调区间 */
  QB.register({
    id: 'mvt-A1', type: 'mvt', difficulty: 'easy',
    gen: function (rng) {
      var c = ri(1, 3, rng);
      var correct = '(' + c + ',+\\infty)';
      var d = bo(correct, ['(-\\infty,' + c + ')', '(-\\infty,0)', '\\mathbb{R}'], rng);
      return {
        params: { c: c },
        question: '函数 $f(x)=x^2-' + (2 * c) + 'x$ 的单调递增区间是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '判断单调性：求导，看导数的正负。导数大于 0 的区间就是递增区间。',
        steps: [
          { m: 'f\\prime(x) = 2x-' + (2 * c) + ' = 2(x-' + c + ')',
            t: '先求导，并把 2 提出来。' },
          { m: 'f\\prime(x) > 0 \\Leftrightarrow x-' + c + ' > 0 \\Leftrightarrow x > ' + c,
            t: '导数大于 0 就是递增。$2(x-' + c + ')>0$ 等价于 $x>' + c + '$。' },
          { m: '\\Rightarrow (' + c + ',+\\infty)',
            t: '所以递增区间是 $(' + c + ',+\\infty)$。' }
        ],
        pitfall: '递增区间看 $f\\prime>0$；等于 0 的点一般不单独算进区间。'
      };
    }
  });

  /* A2 基础：二次函数极小值 */
  QB.register({
    id: 'mvt-A2', type: 'mvt', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = [2, 4][ri(0, 1, rng)], b = [3, 5, 7][ri(0, 2, rng)];
        var correct = String(b - a * a / 4);
        var d = bo(correct, [frac(a, 2), String(b), String(b + a * a / 4)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '函数 $f(x)=x^2-' + a + 'x+' + b + '$ 的极小值是',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '开口向上的抛物线有极小值。求导找驻点，代入算出函数值。',
          steps: [
            { m: 'f\\prime(x) = 2x-' + a + ' = 0 \\Rightarrow x = ' + frac(a, 2),
              t: '令导数等于 0，找到驻点 $x=' + frac(a, 2) + '$。' },
            { m: 'f\\prime\\prime(x) = 2 > 0',
              t: '二阶导大于 0，说明这里是极小值点。' },
            { m: 'f\\left(' + frac(a, 2) + '\\right) = \\left(' + frac(a, 2) + '\\right)^2 - ' + a + '\\times' + frac(a, 2) + '+' + b + ' = ' + correct,
              t: '把驻点代回原函数：$\\frac{' + (a * a) + '}{4}-\\frac{' + (a * a) + '}{2}+' + b + '=' + b + '-\\frac{' + (a * a) + '}{4}=' + correct + '$。' }
          ],
          pitfall: '极小值是最小的函数值 ' + correct + '；$x=' + frac(a, 2) + '$ 是"极值点"（横坐标），不是极值。'
        };
      }
      throw new Error('A2 retry fail');
    }
  });

  /* A3 进阶：闭区间最值 */
  QB.register({
    id: 'mvt-A3', type: 'mvt', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 2, rng);
      var correct = String(2 * a * a * a);
      var d = bo(correct, ['0', String(-2 * a * a * a), String(a * a * a)], rng);
      return {
        params: { a: a },
        question: '函数 $f(x)=x^3-' + (3 * a * a) + 'x$ 在闭区间 $[0,' + (2 * a) + ']$ 上的最大值是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '闭区间上求最值三步走：①求导找驻点；②算出驻点和两个端点的函数值；③比较大小。',
        steps: [
          { m: 'f\\prime(x) = 3x^2-' + (3 * a * a) + ' = 3(x-' + a + ')(x+' + a + ') = 0',
            t: '求导并因式分解，驻点是 $x=' + a + '$ 和 $x=-' + a + '$，其中只有 $x=' + a + '$ 在区间 $[0,' + (2 * a) + ']$ 内。' },
          { m: 'f(0)=0,\\quad f(' + a + ')=' + (a * a * a) + '-' + (3 * a * a * a) + '=' + (-2 * a * a * a) + ',\\quad f(' + (2 * a) + ')=' + (8 * a * a * a) + '-' + (6 * a * a * a) + '=' + (2 * a * a * a),
            t: '算出所有"候选点"的函数值：两个端点加一个驻点。' },
          { m: '\\max = ' + correct,
            t: '三个数里最大的是 ' + (2 * a * a * a) + '，所以最大值是 ' + correct + '。' }
        ],
        pitfall: '闭区间求最值必须比较驻点和端点，只看驻点会漏掉端点的更大值。'
      };
    }
  });

  /* A4 进阶：拉格朗日中值定理 */
  QB.register({
    id: 'mvt-A4', type: 'mvt', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var p = [[1, 3], [2, 4], [1, 4], [2, 3], [3, 4]][ri(0, 4, rng)];
        var a = p[0], b = p[1];
        var correct = frac(a + b, 2);
        var d = bo(correct, [frac(b - a, 2), String(a + b), String(b - a)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '函数 $f(x)=x^2$ 在区间 $[' + a + ',' + b + ']$ 上满足拉格朗日中值定理，则定理中的 $\\xi=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '拉格朗日中值定理：存在 $\\xi$，使 $f\\prime(\\xi)=\\frac{f(b)-f(a)}{b-a}$。把两端算出来列方程。',
          steps: [
            { m: '\\frac{f(' + b + ')-f(' + a + ')}{' + b + '-' + a + '} = \\frac{' + (b * b) + '-' + (a * a) + '}{' + (b - a) + '} = ' + (a + b),
              t: '先算"两端点连线的斜率"：$\\frac{b^2-a^2}{b-a}=a+b$。' },
            { m: 'f\\prime(x) = 2x',
              t: '再算导数：$f\\prime(x)=2x$。' },
            { m: '2\\xi = ' + (a + b) + ' \\Rightarrow \\xi = ' + correct,
              t: '令两者相等：$2\\xi=' + (a + b) + '$，解出 $\\xi$。' }
          ],
          pitfall: '$\\frac{b^2-a^2}{b-a}$ 用平方差化简为 $a+b$，不要算成 $b-a$。'
        };
      }
      throw new Error('A4 retry fail');
    }
  });

  /* A5 困难：拐点 */
  QB.register({
    id: 'mvt-A5', type: 'mvt', difficulty: 'hard',
    gen: function (rng) {
      var a = ri(1, 3, rng);
      var correct = String(a);
      var d = bo(correct, [String(-a), '0', String(2 * a)], rng);
      return {
        params: { a: a },
        question: '曲线 $y=x^3-' + (3 * a) + 'x^2$ 的拐点横坐标是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '拐点是凹凸性改变的地方：先求二阶导，令它等于 0，再确认两侧符号变化。',
        steps: [
          { m: 'y\\prime = 3x^2-' + (6 * a) + 'x',
            t: '第一步：求一阶导。' },
          { m: 'y\\prime\\prime = 6x-' + (6 * a) + ' = 6(x-' + a + ')',
            t: '第二步：再求一次导，得到二阶导。' },
          { m: 'y\\prime\\prime = 0 \\Rightarrow x = ' + a + ',\\quad \\text{两侧 } y\\prime\\prime \\text{ 变号}',
            t: '令二阶导等于 0 得 $x=' + a + '$。当 $x<' + a + '$ 时 $y\\prime\\prime<0$（凹向下），$x>' + a + '$ 时 $y\\prime\\prime>0$（凹向上），凹凸性改变，所以是拐点。' }
        ],
        pitfall: '$y\\prime\\prime=0$ 只是候选点，还要检查两侧是否变号（像 $y=x^4$ 在 0 处就不变号）。'
      };
    }
  });

  /* A6 困难：零点定理 + 单调性判断实根个数 */
  QB.register({
    id: 'mvt-A6', type: 'mvt', difficulty: 'hard',
    gen: function (rng) {
      var a = ri(2, 3, rng);
      var correct = '1';
      var d = bo(correct, ['0', '2', '3'], rng);
      return {
        params: { a: a },
        question: '方程 $x^3-' + (3 * a * a) + 'x+1=0$ 在区间 $(0,1)$ 内实根的个数是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '两步判断：①零点定理说"至少有一个"；②导数恒负说"最多有一个"。合起来恰好一个。',
        steps: [
          { m: 'f(0)=1>0,\\quad f(1)=1-' + (3 * a * a) + '+1=' + (2 - 3 * a * a) + '<0',
            t: '设 $f(x)=x^3-' + (3 * a * a) + 'x+1$。两端点函数值一正一负，由零点定理，$(0,1)$ 内至少有一个根。' },
          { m: 'f\\prime(x) = 3x^2-' + (3 * a * a) + ' < 0 \\;\\text{在 } (0,1) \\text{ 上}',
            t: '在 $(0,1)$ 内 $x^2<1\\le' + (a * a) + '$，所以 $3x^2-' + (3 * a * a) + '<0$，函数严格递减。' },
          { m: '\\Rightarrow \\text{恰有 1 个根}',
            t: '严格递减的函数与 $x$ 轴最多交一次，所以至多一个根；合起来恰好一个。' }
        ],
        pitfall: '零点定理只保证"至少一个"；要证明"恰好一个"还得加上单调性。'
      };
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
