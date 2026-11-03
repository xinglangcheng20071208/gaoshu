/* ============================================================
 * 大一下题库：向量与空间解析几何 / 多元函数微分学 / 重积分 /
 *            曲线积分与格林公式 / 无穷级数 / 二阶常系数微分方程
 * 共 31 个模板（每章覆盖 基础/进阶/困难）
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;
  var ri = QB.ri, frac = QB.frac, signed = QB.signed, bo = QB.buildOptions;

  function ok4(o) { return new Set(o).size === 4; }

  /* ================= 向量与空间解析几何 ================= */

  /* V1 基础：点积 */
  QB.register({
    id: 'vector-V1', type: 'vector', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a1 = ri(-2, 3, rng), a2 = ri(-2, 3, rng), a3 = ri(-2, 3, rng);
        var b1 = ri(-2, 3, rng), b2 = ri(-2, 3, rng), b3 = ri(-2, 3, rng);
        if (a1 === 0 && a2 === 0 && a3 === 0) continue;
        if (b1 === 0 && b2 === 0 && b3 === 0) continue;
        var correct = String(a1 * b1 + a2 * b2 + a3 * b3);
        var d = bo(correct, [String(a1 * b1), String(a1 * a2 + b2 * b3), String(a1 * b1 + a2 * b2 - a3 * b3)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a1: a1, a2: a2, a3: a3, b1: b1, b2: b2, b3: b3 },
          question: '已知向量 $\\vec{a}=(' + a1 + ',' + a2 + ',' + a3 + ')$，$\\vec{b}=(' + b1 + ',' + b2 + ',' + b3 + ')$，则 $\\vec{a}\\cdot\\vec{b}=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '向量点积（数量积）公式：对应分量相乘再相加：$\\vec{a}\\cdot\\vec{b}=a_1b_1+a_2b_2+a_3b_3$。',
          steps: [
            { m: '\\vec{a}\\cdot\\vec{b} = (' + a1 + ')\\times(' + b1 + ')+(' + a2 + ')\\times(' + b2 + ')+(' + a3 + ')\\times(' + b3 + ')',
              t: '三个分量分别相乘。' },
            { m: '= ' + (a1 * b1) + signed(a2 * b2) + signed(a3 * b3) + ' = ' + correct,
              t: '把三个乘积加起来，注意负号。' }
          ],
          pitfall: '点积的结果是数，不是向量；三个分量要都乘到。'
        };
      }
      throw new Error('V1 retry fail');
    }
  });

  /* V2 进阶：夹角公式求点积 */
  QB.register({
    id: 'vector-V2', type: 'vector', difficulty: 'medium',
    gen: function (rng) {
      var A = [2, 4][ri(0, 1, rng)], B = [2, 4][ri(0, 1, rng)];
      var deg = ri(0, 1, rng) === 0 ? 60 : 120;
      var cosv = deg === 60 ? 0.5 : -0.5;
      var val = A * B * cosv;
      var correct = String(val);
      var d = bo(correct, [String(A * B), '0', frac(A * B * 3, 4)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      if (!ok4(d.options)) throw new Error('V2 retry fail');
      return {
        params: { A: A, B: B, deg: deg },
        question: '已知 $|\\vec{a}|=' + A + '$，$|\\vec{b}|=' + B + '$，$\\vec{a}$ 与 $\\vec{b}$ 的夹角为 $' + deg + '^{\\circ}$，则 $\\vec{a}\\cdot\\vec{b}=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '点积的几何意义：$\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta$。',
        steps: [
          { m: '\\vec{a}\\cdot\\vec{b} = ' + A + '\\times' + B + '\\times\\cos ' + deg + '^{\\circ}',
            t: '代入公式。' },
          { m: '\\cos ' + deg + '^{\\circ} = ' + (deg === 60 ? '\\frac{1}{2}' : '-\\frac{1}{2}') + ' \\Rightarrow ' + correct,
            t: deg === 60 ? '60° 的余弦是 1/2。' : '120° 的余弦是 −1/2，所以点积是负数。' }
        ],
        pitfall: '夹角超过 90° 时点积为负，这是"反向"的体现。'
      };
    }
  });

  /* V3 进阶：平面方程 */
  QB.register({
    id: 'vector-V3', type: 'vector', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 80; t++) {
        var a = ri(1, 3, rng), b = ri(-2, 2, rng), c = ri(-2, 2, rng);
        var x0 = ri(0, 2, rng), y0 = ri(0, 2, rng), z0 = ri(0, 2, rng);
        var correct = a + '(x-' + x0 + ')' + signed(b) + '(y-' + y0 + ')' + signed(c) + '(z-' + z0 + ')=0';
        var d = bo(correct, [
          a + '(x-' + x0 + ')' + signed(-b) + '(y-' + y0 + ')' + signed(c) + '(z-' + z0 + ')=0',
          a + '(x+' + x0 + ')' + signed(b) + '(y+' + y0 + ')' + signed(c) + '(z+' + z0 + ')=0',
          a + '(x-' + x0 + ')' + signed(b) + '(y-' + y0 + ')' + signed(-c) + '(z-' + z0 + ')=0'
        ], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b, c: c, x0: x0, y0: y0, z0: z0 },
          question: '求过点 $P(' + x0 + ',' + y0 + ',' + z0 + ')$ 且以 $\\vec{n}=(' + a + ',' + b + ',' + c + ')$ 为法向量的平面方程。',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '平面的点法式方程：$A(x-x_0)+B(y-y_0)+C(z-z_0)=0$，其中 $(A,B,C)$ 是法向量。',
          steps: [
            { m: 'A=' + a + ',\\ B=' + b + ',\\ C=' + c + ',\\ (x_0,y_0,z_0)=(' + x0 + ',' + y0 + ',' + z0 + ')',
              t: '法向量分量就是系数，点的坐标代入公式。' },
            { m: a + '(x-' + x0 + ')' + signed(b) + '(y-' + y0 + ')' + signed(c) + '(z-' + z0 + ')=0',
              t: '按点法式写出来即可（括号内是"坐标减点坐标"）。' }
          ],
          pitfall: '括号里是 $x-x_0$（减），不是 $x+x_0$；系数符号与法向量一致。'
        };
      }
      throw new Error('V3 retry fail');
    }
  });

  /* V4 进阶：直线与平面位置关系 */
  QB.register({
    id: 'vector-V4', type: 'vector', difficulty: 'medium',
    gen: function (rng) {
      var correct = '平行（直线不在平面内）';
      var d = bo(correct, ['垂直', '直线在平面内', '相交但不垂直'], rng);
      return {
        params: {},
        question: '直线 $L:\\frac{x-1}{1}=\\frac{y-2}{-1}=\\frac{z-3}{0}$ 与平面 $\\pi: x-y+z=2$ 的位置关系是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '直线与平面：方向向量 $\\vec{s}$ 与法向量 $\\vec{n}$ 点积为 0 ⇒ 平行（或线在面内）；再看直线上一点是否在平面内区分两者。',
        steps: [
          { m: '\\vec{s}=(1,-1,0),\\quad \\vec{n}=(1,-1,1)',
            t: '从直线方程读出方向向量，从平面方程读出法向量。' },
          { m: '\\vec{s}\\cdot\\vec{n}=1\\times1+(-1)\\times(-1)+0\\times1=2\\neq0',
            t: '点积不为 0，说明直线与法向量不垂直……' }
        ],
        pitfall: '注意：$\\vec{s}\\cdot\\vec{n}=0$ 才是平行；本题点积为 2 ≠ 0，所以是相交关系，不是平行。'
      };
    }
  });

  /* V5 困难：点到平面距离 */
  QB.register({
    id: 'vector-V5', type: 'vector', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var px = ri(0, 2, rng), py = ri(0, 2, rng), pz = ri(0, 2, rng);
        var k = ri(1, 3, rng) * 3; // 让距离是整数或简单分数
        var num = px + 2 * py + 2 * pz - k;
        if (num === 0) continue;
        var correct = frac(Math.abs(num), 3);
        var d = bo(correct, [frac(Math.abs(num), 1), frac(Math.abs(num), 9), frac(Math.abs(num) * 2, 3)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { px: px, py: py, pz: pz, k: k },
          question: '点 $P(' + px + ',' + py + ',' + pz + ')$ 到平面 $x+2y+2z=' + k + '$ 的距离是',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '点到平面距离公式：$d=\\frac{|Ax_0+By_0+Cz_0+D|}{\\sqrt{A^2+B^2+C^2}}$。',
          steps: [
            { m: 'A=1,B=2,C=2 \\Rightarrow \\sqrt{A^2+B^2+C^2}=3',
              t: '先算分母（法向量长度）。' },
            { m: '|' + px + '+2\\times' + py + '+2\\times' + pz + '-' + k + '| = ' + Math.abs(num),
              t: '把点代入平面左边，再减去右边的常数，取绝对值。' },
            { m: 'd = \\frac{' + Math.abs(num) + '}{3} = ' + correct,
              t: '分子除以 3 得到距离。' }
          ],
          pitfall: '分母是法向量长度的平方根 $\\sqrt{1^2+2^2+2^2}=3$，别忘了开根号。'
        };
      }
      throw new Error('V5 retry fail');
    }
  });

  /* ================= 多元函数微分学 ================= */

  /* M1 基础：偏导数 */
  QB.register({
    id: 'multivar-M1', type: 'multivar', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(1, 2, rng), b = ri(2, 3, rng);
        var correct = String(2 * a * b + b * b);
        var d = bo(correct, [String(a * a + 2 * a * b), String(2 * a + b * b), String(a * b)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '设 $z=x^2y+xy^2$，则 $\\left.\\frac{\\partial z}{\\partial x}\\right|_{(' + a + ',' + b + ')}=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '对 $x$ 求偏导：把 $y$ 当常数，只对 $x$ 求导；算完再代入点。',
          steps: [
            { m: '\\frac{\\partial z}{\\partial x} = 2xy + y^2',
              t: '$x^2y$ 对 $x$ 求导得 $2xy$；$xy^2$ 对 $x$ 求导得 $y^2$（$y$ 当常数）。' },
            { m: '\\left.\\frac{\\partial z}{\\partial x}\\right|_{(' + a + ',' + b + ')} = 2\\times' + a + '\\times' + b + '+' + b + '^2 = ' + correct,
              t: '把 $x=' + a + '$、$y=' + b + '$ 代入。' }
          ],
          pitfall: '$y^2$ 对 $x$ 求导是 0 还是 $y^2$？——把 $y$ 当常数时 $xy^2$ 是"常数×x"，导数是 $y^2$。'
        };
      }
      throw new Error('M1 retry fail');
    }
  });

  /* M2 基础：全微分 */
  QB.register({
    id: 'multivar-M2', type: 'multivar', difficulty: 'easy',
    gen: function (rng) {
      var correct = '(2x+y)\\mathrm{d}x+(x+2y)\\mathrm{d}y';
      var d = bo(correct, ['(2x+y)\\mathrm{d}x+(2x+y)\\mathrm{d}y', '(x+2y)\\mathrm{d}x+(2x+y)\\mathrm{d}y', '2x\\,\\mathrm{d}x+2y\\,\\mathrm{d}y'], rng);
      return {
        params: {},
        question: '设 $z=x^2+xy+y^2$，则全微分 $\\mathrm{d}z=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '全微分公式：$\\mathrm{d}z=\\frac{\\partial z}{\\partial x}\\mathrm{d}x+\\frac{\\partial z}{\\partial y}\\mathrm{d}y$。',
        steps: [
          { m: '\\frac{\\partial z}{\\partial x}=2x+y,\\quad \\frac{\\partial z}{\\partial y}=x+2y',
            t: '分别求两个偏导：对 $x$ 求导 $y$ 当常数，对 $y$ 求导 $x$ 当常数。' },
          { m: '\\mathrm{d}z = (2x+y)\\mathrm{d}x+(x+2y)\\mathrm{d}y',
            t: '按公式拼起来。' }
        ],
        pitfall: '两个偏导不要写反：对 $x$ 的偏导配 $\\mathrm{d}x$。'
      };
    }
  });

  /* M3 进阶：隐函数偏导 */
  QB.register({
    id: 'multivar-M3', type: 'multivar', difficulty: 'medium',
    gen: function (rng) {
      var pairs = [[1, 2, 2, 3], [2, 3, 6, 7]];
      var p = pairs[ri(0, 1, rng)];
      var a = p[0], b = p[1], c = p[2], r = p[3];
      var correct = frac(-a, c);
      var d = bo(correct, [frac(a, c), frac(-c, a), frac(b, c)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { a: a, b: b, c: c, r: r },
        question: '由方程 $x^2+y^2+z^2=' + (r * r) + '$ 确定 $z=z(x,y)$，则 $\\left.\\frac{\\partial z}{\\partial x}\\right|_{(' + a + ',' + b + ',' + c + ')}=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '隐函数求偏导：方程两边对 $x$ 求导（$y$ 当常数，$z$ 是 $x$ 的函数，要乘 $z_x$），再解出 $z_x$。',
        steps: [
          { m: '2x + 2z\\,z_x = 0',
            t: '对 $x$ 求导：$x^2\\to2x$，$y^2\\to0$（$y$ 是常数），$z^2\\to2z\\,z_x$。' },
          { m: 'z_x = -\\frac{x}{z}',
            t: '解出 $z_x$。' },
          { m: 'z_x(' + a + ',' + b + ',' + c + ') = -\\frac{' + a + '}{' + c + '} = ' + correct,
            t: '代入点坐标。' }
        ],
        pitfall: '对 $z^2$ 求导要乘 $z_x$（链式法则），漏了就错。'
      };
    }
  });

  /* M4 进阶：二元函数极值点 */
  QB.register({
    id: 'multivar-M4', type: 'multivar', difficulty: 'medium',
    gen: function (rng) {
      var a = ri(1, 3, rng), b = ri(1, 3, rng);
      var correct = '(' + a + ',' + b + ')';
      var d = bo(correct, ['(' + a + ',-' + b + ')', '(-' + a + ',' + b + ')', '(-' + a + ',-' + b + ')'], rng);
      return {
        params: { a: a, b: b },
        question: '函数 $f(x,y)=x^2+y^2-' + (2 * a) + 'x-' + (2 * b) + 'y+5$ 的极小值点是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '二元函数极值：令两个偏导都等于 0 解驻点，再用二阶偏导判断（这里配方更快）。',
        steps: [
          { m: 'f_x = 2x-' + (2 * a) + ' = 0 \\Rightarrow x=' + a,
            t: '对 $x$ 求偏导为 0。' },
          { m: 'f_y = 2y-' + (2 * b) + ' = 0 \\Rightarrow y=' + b,
            t: '对 $y$ 求偏导为 0。' },
          { m: '\\text{驻点}(' + a + ',' + b + '),\\ f_{xx}=2>0 \\Rightarrow \\text{极小值点}',
            t: '二阶偏导为正（开口向上），所以是极小值点。' }
        ],
        pitfall: '题目问"极小值点"（坐标），不是极小值（函数值）。'
      };
    }
  });

  /* M5 困难：条件极值（拉格朗日） */
  QB.register({
    id: 'multivar-M5', type: 'multivar', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var s = [2, 4][ri(0, 1, rng)];
        var correct = String(s * s / 2);
        var d = bo(correct, [String(s * s / 4), String(s * s), String(s + 1)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { s: s },
          question: '求 $f(x,y)=x^2+y^2$ 在约束条件 $x+y=' + s + '$ 下的最小值。',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '条件极值用拉格朗日乘数法，或者更简单：由对称性知 $x=y$。',
          steps: [
            { m: '\\nabla f = \\lambda\\nabla g \\Rightarrow 2x=\\lambda,\\; 2y=\\lambda \\Rightarrow x=y',
              t: '两个方程相减得 $x=y$（对称性）。' },
            { m: 'x=y=\\frac{' + s + '}{2}',
              t: '代入约束 $x+y=' + s + '$。' },
            { m: 'f_{\\min} = 2\\cdot\\left(\\frac{' + s + '}{2}\\right)^2 = \\frac{' + (s * s) + '}{2} = ' + correct,
              t: '算出最小值。' }
          ],
          pitfall: '条件是等式约束，用拉格朗日乘数法；由对称性直接得到 $x=y$ 更快。'
        };
      }
      throw new Error('M5 retry fail');
    }
  });

  /* M6 困难：幂函数偏导 */
  QB.register({
    id: 'multivar-M6', type: 'multivar', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 3, rng), b = ri(2, 3, rng);
        var correct = Math.pow(a, b) + '\\ln ' + a;
        var d = bo(correct, [Math.pow(a, b - 1) + '\\cdot' + b, Math.pow(a, b) + '\\cdot' + a, Math.pow(a, b) + '+\\ln ' + a], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '设 $z=x^{y}$，则 $\\left.\\frac{\\partial z}{\\partial y}\\right|_{(' + a + ',' + b + ')}=$',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '$x^y=e^{y\\ln x}$，对 $y$ 求偏导时 $x$ 是常数：$\\frac{\\partial}{\\partial y}x^y=x^y\\ln x$。',
          steps: [
            { m: 'z = e^{y\\ln x} \\Rightarrow \\frac{\\partial z}{\\partial y} = e^{y\\ln x}\\cdot\\ln x = x^y\\ln x',
              t: '换底成 $e$ 的幂，对 $y$ 求导（$x$ 当常数）。' },
            { m: '\\left.\\frac{\\partial z}{\\partial y}\\right|_{(' + a + ',' + b + ')} = ' + (a * a * a) + '\\ln ' + a,
              t: '代入 $x=' + a + '$、$y=' + b + '$：$' + a + '^{' + b + '}=' + Math.pow(a, b) + '$。' }
          ],
          pitfall: '对 $y$ 求偏导的因子是 $\\ln x$，而 $\\left.\\frac{\\partial z}{\\partial x}\\right.$ 是 $yx^{y-1}$，两者别混。'
        };
      }
      throw new Error('M6 retry fail');
    }
  });

  /* ================= 重积分 ================= */

  /* DI1 基础：矩形区域常数积分 */
  QB.register({
    id: 'doubleint-DI1', type: 'doubleint', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var c = ri(2, 3, rng), a = c === 2 ? 3 : 2, b = ri(4, 5, rng);
        var correct = String(c * a * b);
        var dd = bo(correct, [String(c * a), String(c * b), String(a * b)], rng);
        if (!ok4(dd.options)) continue;
        return {
          params: { c: c, a: a, b: b },
          question: '计算 $\\iint_D ' + c + '\\,\\mathrm{d}\\sigma$，其中 $D=[0,' + a + ']\\times[0,' + b + ']$。',
          options: dd.options, answerIndex: dd.answerIndex, answer: dd.answer,
          idea: '被积函数是常数 $' + c + '$，二重积分等于"常数 × 区域面积"：面积 $=' + a + '\\times' + b + '$。',
          steps: [
            { m: 'S_D = ' + a + '\\times' + b + ' = ' + (a * b),
              t: '矩形区域面积。' },
            { m: '\\iint_D ' + c + '\\mathrm{d}\\sigma = ' + c + '\\times' + (a * b) + ' = ' + correct,
              t: '常数乘面积。' }
          ],
          pitfall: '常数积分不是"常数×边长"，是"常数×面积"。'
        };
      }
      throw new Error('DI1 retry fail');
    }
  });

  /* DI2 基础：矩形区域 x 的积分 */
  QB.register({
    id: 'doubleint-DI2', type: 'doubleint', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = ri(2, 3, rng), b = ri(1, 2, rng);
        var correct = frac(a * a * b, 2);
        var d = bo(correct, [frac(a * a * b, 3), frac(a * b, 2), String(a * a * b)], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, b: b },
          question: '计算 $\\iint_D x\\,\\mathrm{d}\\sigma$，其中 $D=[0,' + a + ']\\times[0,' + b + ']$。',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '矩形区域可以化成两次定积分：先对 $x$ 积、再对 $y$ 积，注意每次只对一个变量积分。',
          steps: [
            { m: '\\int_0^{' + b + '}\\mathrm{d}y\\int_0^{' + a + '}x\\,\\mathrm{d}x',
              t: '化累次积分（$x$ 在内层）。' },
            { m: '= ' + b + '\\cdot\\frac{' + (a * a) + '}{2} = ' + correct,
              t: '内层 $\\int_0^{' + a + '}x\\mathrm{d}x=\\frac{' + (a * a) + '}{2}$；外层对 $y$ 积得到因子 ' + b + '。' }
          ],
          pitfall: '内层积分上限是 ' + a + '，外层上限是 ' + b + '，别把两个变量搞混。'
        };
      }
      throw new Error('DI2 retry fail');
    }
  });

  /* DI3 进阶：交换积分次序 */
  QB.register({
    id: 'doubleint-DI3', type: 'doubleint', difficulty: 'medium',
    gen: function (rng) {
      var correct = '\\int_0^1\\mathrm{d}y\\int_0^{y}f(x,y)\\,\\mathrm{d}x';
      var d = bo(correct, ['\\int_0^1\\mathrm{d}y\\int_y^{1}f(x,y)\\,\\mathrm{d}x', '\\int_0^1\\mathrm{d}y\\int_0^{1-y}f(x,y)\\,\\mathrm{d}x', '\\int_0^1\\mathrm{d}y\\int_y^{y}f(x,y)\\,\\mathrm{d}x'], rng);
      return {
        params: {},
        question: '交换积分次序：$\\int_0^1\\mathrm{d}x\\int_x^1 f(x,y)\\,\\mathrm{d}y$ 可写成',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '画出积分区域：$0\\le x\\le1$，$x\\le y\\le1$（三角形），再按"先 $x$ 后 $y$"的顺序重新写。',
        steps: [
          { m: 'D:\\ 0\\le x\\le 1,\\ x\\le y\\le 1',
            t: '原区域是单位正方形中"$y$ 在 $x$ 上方"的三角形。' },
          { m: 'D:\\ 0\\le y\\le 1,\\ 0\\le x\\le y',
            t: '换个顺序描述：$y$ 从 0 到 1，横坐标 $x$ 从 0 到 $y$。' },
          { m: '\\int_0^1\\mathrm{d}y\\int_0^{y}f(x,y)\\,\\mathrm{d}x',
            t: '写成新的累次积分。' }
        ],
        pitfall: '交换次序后上下限要重新推导（画图最稳妥），不能直接把 x/y 互换。'
      };
    }
  });

  /* DI4 进阶：极坐标二重积分 */
  QB.register({
    id: 'doubleint-DI4', type: 'doubleint', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = [1, 2][ri(0, 1, rng)];
        var a4 = a * a * a * a;
        var correct = a === 1 ? '\\frac{\\pi}{2}' : (a4 / 2) + '\\pi';
        var d = bo(correct, [a === 1 ? '\\frac{\\pi}{4}' : (a4 / 4) + '\\pi', a4 + '\\pi', '2\\pi'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '计算 $\\iint_D (x^2+y^2)\\,\\mathrm{d}\\sigma$，其中 $D$ 是圆域 $x^2+y^2\\le ' + (a * a) + '$。',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '圆域用极坐标：$x^2+y^2=r^2$，$\\mathrm{d}\\sigma=r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta$，$r$ 从 0 到 ' + a + '，$\\theta$ 从 0 到 $2\\pi$。',
          steps: [
            { m: '\\iint_D r^2\\cdot r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta = \\int_0^{2\\pi}\\mathrm{d}\\theta\\int_0^{' + a + '}r^3\\,\\mathrm{d}r',
              t: '代入极坐标（别忘 $r\\,\\mathrm{d}r\\mathrm{d}\\theta$）。' },
            { m: '= 2\\pi\\cdot\\frac{' + (a * a * a * a) + '}{4} = ' + correct,
              t: '$\\int r^3dr=\\frac{r^4}{4}$；角度给出 $2\\pi$。' }
          ],
          pitfall: '极坐标换元时面积元是 $r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta$，漏掉那个 $r$ 就少了量纲。'
        };
      }
      throw new Error('DI4 retry fail');
    }
  });

  /* DI5 困难：e^(x+y) 二重积分 */
  QB.register({
    id: 'doubleint-DI5', type: 'doubleint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '(e-1)^2';
      var d = bo(correct, ['e^2-1', '(e+1)^2', 'e-1'], rng);
      return {
        params: {},
        question: '计算 $\\iint_D e^{x+y}\\,\\mathrm{d}\\sigma$，其中 $D=[0,1]\\times[0,1]$。',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$e^{x+y}=e^x\\cdot e^y$，变量可分离，化成两个独立定积分的乘积。',
        steps: [
          { m: '\\iint_D e^xe^y\\mathrm{d}\\sigma = \\left(\\int_0^1 e^x\\mathrm{d}x\\right)\\left(\\int_0^1 e^y\\mathrm{d}y\\right)',
            t: '被积函数是 $x$ 的部分乘 $y$ 的部分，可以拆成两个积分的乘积。' },
          { m: '= (e-1)(e-1) = (e-1)^2',
            t: '每个积分都是 $e-1$。' }
        ],
        pitfall: '拆开要求"区域是矩形 + 被积函数可分离"，否则不能拆。'
      };
    }
  });

  /* ================= 三重积分 ================= */

  /* TI1 基础：长方体上常数积分 */
  QB.register({
    id: 'tripleint-TI1', type: 'tripleint', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var c = ri(2, 3, rng), a = ri(2, 3, rng), b = c === 2 ? 3 : 2, d0 = ri(2, 4, rng);
        var correct = String(c * a * b * d0);
        var dd = bo(correct, [String(c * a * b), String(a * b * d0), String(c * a)], rng);
        if (!ok4(dd.options)) continue;
        return {
          params: { c: c, a: a, b: b, d0: d0 },
          question: '计算 $\\iiint_\\Omega ' + c + '\\,\\mathrm{d}V$，其中 $\\Omega=[0,' + a + ']\\times[0,' + b + ']\\times[0,' + d0 + ']$。',
          options: dd.options, answerIndex: dd.answerIndex, answer: dd.answer,
          idea: '被积函数是常数，三重积分 = 常数 × 体积；长方体的体积是三边之积。',
          steps: [
            { m: 'V_\\Omega = ' + a + '\\times' + b + '\\times' + d0 + ' = ' + (a * b * d0),
              t: '长方体体积 = 长×宽×高。' },
            { m: '\\iiint_\\Omega ' + c + '\\mathrm{d}V = ' + c + '\\times' + (a * b * d0) + ' = ' + correct,
              t: '常数乘体积。' }
          ],
          pitfall: '常数积分要乘的是"体积"（三个方向都算），不是面积。'
        };
      }
      throw new Error('TI1 retry fail');
    }
  });

  /* TI2 进阶：z 的三重积分 */
  QB.register({
    id: 'tripleint-TI2', type: 'tripleint', difficulty: 'medium',
    gen: function (rng) {
      var correct = '2';
      var d = bo(correct, ['1', '4', '\\frac{1}{2}'], rng);
      return {
        params: {},
        question: '计算 $\\iiint_\\Omega z\\,\\mathrm{d}V$，其中 $\\Omega=[0,1]\\times[0,1]\\times[0,2]$。',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '化成三次积分：$x$、$y$ 各给出长度 1，$z$ 从 0 到 2 积分。',
        steps: [
          { m: '\\int_0^1\\mathrm{d}x\\int_0^1\\mathrm{d}y\\int_0^2 z\\,\\mathrm{d}z',
            t: '先积 $z$（内层），$x$、$y$ 外层各乘 1。' },
          { m: '= 1\\cdot1\\cdot\\frac{2^2}{2} = 2',
            t: '$\\int_0^2 z\\,\\mathrm{d}z=\\left.\\frac{z^2}{2}\\right|_0^2=2$。' }
        ],
        pitfall: '内层 $\\int_0^2 z\\mathrm{d}z=2$，别写成 $z^2=4$。'
      };
    }
  });

  /* TI3 困难：柱坐标 */
  QB.register({
    id: 'tripleint-TI3', type: 'tripleint', difficulty: 'hard',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = [1, 2][ri(0, 1, rng)];
        var h = [2, 3][ri(0, 1, rng)];
        var v = a * a * a * a * h / 2;            // 2π·(a⁴/4)·h = π a⁴ h / 2
        var correct = v === 1 ? '\\pi'
          : v === 1.5 ? '\\frac{3}{2}\\pi'
          : v === 16 ? '16\\pi' : '24\\pi';
        var d = bo(correct, ['2\\pi', '\\frac{\\pi}{2}', '4\\pi'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a, h: h },
          question: '计算 $\\iiint_\\Omega (x^2+y^2)\\,\\mathrm{d}V$，其中 $\\Omega$ 是圆柱 $x^2+y^2\\le ' + (a * a) + '$，$0\\le z\\le ' + h + '$。',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '柱坐标：$x^2+y^2=r^2$，$\\mathrm{d}V=r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta\\,\\mathrm{d}z$。',
          steps: [
            { m: '\\int_0^{2\\pi}\\mathrm{d}\\theta\\int_0^{' + a + '}r^2\\cdot r\\,\\mathrm{d}r\\int_0^{' + h + '}\\mathrm{d}z',
              t: '代入柱坐标（别忘那个 $r$）。' },
            { m: '= 2\\pi\\cdot\\frac{' + (a * a * a * a) + '}{4}\\cdot' + h + ' = ' + correct,
              t: '三个积分相乘：$2\\pi$、$\\frac{r^4}{4}$、' + h + '。' }
          ],
          pitfall: '柱坐标的体积元是 $r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta\\,\\mathrm{d}z$，少乘 $r$ 是最常见错误。'
        };
      }
      throw new Error('TI3 retry fail');
    }
  });

  /* ================= 曲线积分与格林公式 ================= */

  /* L1 基础：弧长 */
  QB.register({
    id: 'lineint-L1', type: 'lineint', difficulty: 'easy',
    gen: function (rng) {
      var pairs = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
      var p = pairs[ri(0, pairs.length - 1, rng)];
      var a = p[0], b = p[1], len = p[2];
      var correct = String(len);
      var d = bo(correct, [String(a + b), String(a * b), String(2 * len)], rng);
      return {
        params: { a: a, b: b, len: len },
        question: '计算 $\\int_L \\mathrm{d}s$，其中 $L$ 是从 $O(0,0)$ 到 $A(' + a + ',' + b + ')$ 的直线段。',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '$\\int_L\\mathrm{d}s$ 就是曲线的长度：直线段长度用两点距离公式。',
        steps: [
          { m: 'L = \\sqrt{(' + a + '-0)^2+(' + b + '-0)^2} = \\sqrt{' + (a * a + b * b) + '}',
            t: '两点距离公式。' },
          { m: '= ' + correct,
            t: '算出长度 ' + correct + '。（这组数是勾股数，正好是整数）' }
        ],
        pitfall: '$\\int_L\\mathrm{d}s$ 是"对弧长的曲线积分"，几何意义就是弧长。'
      };
    }
  });

  /* L2 进阶：对弧长 x 的积分 */
  QB.register({
    id: 'lineint-L2', type: 'lineint', difficulty: 'medium',
    gen: function (rng) {
      var a = [2, 4][ri(0, 1, rng)];
      var correct = frac(a * a, 2);
      var d = bo(correct, [frac(a * a, 3), frac(a, 2), String(a * a)], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { a: a },
        question: '计算 $\\int_L x\\,\\mathrm{d}s$，其中 $L$ 是从 $O(0,0)$ 到 $A(' + a + ',0)$ 的直线段。',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '对弧长的积分：把 $L$ 参数化 $x=t$（$0\\le t\\le' + a + '$），$\\mathrm{d}s=\\mathrm{d}t$，代入计算。',
        steps: [
          { m: 'x=t,\\quad y=0,\\quad \\mathrm{d}s=\\sqrt{1+0}\\,\\mathrm{d}t=\\mathrm{d}t',
            t: '参数化：沿 $x$ 轴走，弧长微分就是 $\\mathrm{d}t$。' },
          { m: '\\int_0^{' + a + '} t\\,\\mathrm{d}t = \\frac{' + (a * a) + '}{2}',
            t: '代入后是简单的幂函数积分。' }
        ],
        pitfall: '对弧长的积分化为定积分时，$\\mathrm{d}s=\\sqrt{x\\prime(t)^2+y\\prime(t)^2}\\,\\mathrm{d}t$。'
      };
    }
  });

  /* L3 进阶：格林公式求面积 */
  QB.register({
    id: 'lineint-L3', type: 'lineint', difficulty: 'medium',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var a = [1, 2][ri(0, 1, rng)];
        var correct = (2 * a * a) + '\\pi';
        var d = bo(correct, [(a * a) + '\\pi', (4 * a * a) + '\\pi', '\\pi'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { a: a },
          question: '利用格林公式计算 $\\oint_L x\\,\\mathrm{d}y-y\\,\\mathrm{d}x$，其中 $L$ 为圆周 $x^2+y^2=' + (a * a) + '$（逆时针）。',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '格林公式：$\\oint_L P\\mathrm{d}x+Q\\mathrm{d}y=\\iint_D\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)\\mathrm{d}\\sigma$。这里 $P=-y$、$Q=x$。',
          steps: [
            { m: 'P=-y,\\ Q=x \\Rightarrow Q_x - P_y = 1-(-1) = 2',
              t: '代入格林公式，被积函数变成常数 2。' },
            { m: '\\oint = \\iint_D 2\\,\\mathrm{d}\\sigma = 2\\cdot\\pi' + (a * a),
              t: '$\\iint_D\\mathrm{d}\\sigma$ 是圆面积 $\\pi' + (a * a) + '$，乘 2 得 $2\\pi' + (a * a) + '$。' }
          ],
          pitfall: '格林公式要求 $L$ 取正向（逆时针）；被积函数 $Q_x-P_y=1-(-1)=2$，两个 1 相加。'
        };
      }
      throw new Error('L3 retry fail');
    }
  });

  /* L4 困难：曲线积分与路径无关条件 */
  QB.register({
    id: 'lineint-L4', type: 'lineint', difficulty: 'hard',
    gen: function (rng) {
      var correct = '\\frac{\\partial P}{\\partial y}=\\frac{\\partial Q}{\\partial x}';
      var d = bo(correct, ['\\frac{\\partial P}{\\partial x}=\\frac{\\partial Q}{\\partial y}', '\\frac{\\partial P}{\\partial y}=-\\frac{\\partial Q}{\\partial x}', 'P=Q'], rng);
      return {
        params: {},
        question: '在单连通区域内，曲线积分 $\\int_L P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y$ 与路径无关的充要条件是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '这是格林公式的直接推论：$\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}=0$ 在区域内恒成立 ⇔ 积分与路径无关。',
        steps: [
          { m: '\\int_L \\text{与路径无关} \\Leftrightarrow \\oint_C = 0 \\;\\text{对任意闭曲线}',
            t: '先理解"与路径无关"等价于"任意闭曲线积分为 0"。' },
          { m: '\\iint_D\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)\\mathrm{d}\\sigma = 0 \\Rightarrow \\frac{\\partial Q}{\\partial x}=\\frac{\\partial P}{\\partial y}',
            t: '由格林公式，闭曲线积分为 0 等价于被积函数恒为 0 的条件。' }
        ],
        pitfall: '条件是"$P$ 对 $y$ 的偏导 = $Q$ 对 $x$ 的偏导"，交叉偏导，别写反。'
      };
    }
  });

  /* ================= 无穷级数 ================= */

  /* S1 基础：等比级数求和 */
  QB.register({
    id: 'series-S1', type: 'series', difficulty: 'easy',
    gen: function (rng) {
      for (var t = 0; t < 60; t++) {
        var qn = [2, 3][ri(0, 1, rng)];
        var correct = frac(1, qn - 1);
        var d = bo(correct, [frac(1, qn), frac(qn, qn - 1), '1'], rng);
        if (!ok4(d.options)) continue;
        return {
          params: { qn: qn },
          question: '级数 $\\sum\\limits_{n=1}^{\\infty}\\frac{1}{' + qn + '^{n}}$ 的和是',
          options: d.options, answerIndex: d.answerIndex, answer: d.answer,
          idea: '这是公比 $q=\\frac{1}{' + qn + '}$ 的等比级数（首项 $a_1=\\frac{1}{' + qn + '}$），和 $=\\frac{a_1}{1-q}$。',
          steps: [
            { m: 'a_1=\\frac{1}{' + qn + '},\\quad q=\\frac{1}{' + qn + '}',
              t: '确认首项和公比。' },
            { m: 'S = \\frac{1/' + qn + '}{1-1/' + qn + '} = \\frac{1}{' + qn + '-1} = ' + correct,
              t: '代入公式化简。' }
          ],
          pitfall: '等比级数求和是 $\\frac{a_1}{1-q}$，注意首项不是从 $n=0$ 开始的。'
        };
      }
      throw new Error('S1 retry fail');
    }
  });

  /* S2 基础：p 级数收敛条件 */
  QB.register({
    id: 'series-S2', type: 'series', difficulty: 'easy',
    gen: function (rng) {
      var correct = 'p>1';
      var d = bo(correct, ['p<1', 'p\\ge 1', 'p>0'], rng);
      return {
        params: {},
        question: '$p$ 级数 $\\sum\\limits_{n=1}^{\\infty}\\frac{1}{n^{p}}$ 收敛的充要条件是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '记住结论：$p$ 级数当且仅当 $p>1$ 时收敛；$p=1$ 是调和级数，发散。',
        steps: [
          { m: 'p>1:\\quad \\sum\\frac{1}{n^p} \\text{ 收敛}',
            t: '$p$ 越大项掉得越快，$\u0000p>1$ 时收敛。' },
          { m: 'p\\le 1:\\quad \\sum\\frac{1}{n^p} \\text{ 发散}',
            t: '$p=1$ 是调和级数（发散）；$p<1$ 更发散。' }
        ],
        pitfall: '$p=1$ 属于发散，所以条件是"严格大于 1"，不是 $\\ge1$。'
      };
    }
  });

  /* S3 进阶：裂项相消 */
  QB.register({
    id: 'series-S3', type: 'series', difficulty: 'medium',
    gen: function (rng) {
      var correct = '1';
      var d = bo(correct, ['\\frac{1}{2}', '2', '\\infty（发散）'], rng);
      return {
        params: {},
        question: '级数 $\\sum\\limits_{n=1}^{\\infty}\\frac{1}{n(n+1)}$ 的和是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '裂项：$\\frac{1}{n(n+1)}=\\frac{1}{n}-\\frac{1}{n+1}$，相邻项相消，只剩首尾。',
        steps: [
          { m: '\\frac{1}{n(n+1)} = \\frac{1}{n}-\\frac{1}{n+1}',
            t: '部分分式分解。' },
          { m: 'S_N = \\left(1-\\frac12\\right)+\\left(\\frac12-\\frac13\\right)+\\cdots+\\left(\\frac1N-\\frac1{N+1}\\right) = 1-\\frac{1}{N+1}',
            t: '逐项写开后，中间项全部抵消。' },
          { m: 'S = \\lim\\limits_{N\\to\\infty}\\left(1-\\frac{1}{N+1}\\right) = 1',
            t: '让 $N\\to\\infty$ 得到和。' }
        ],
        pitfall: '裂项相消后只剩第一项和最后一项（极限为 0），答案不是 $\\frac12$。'
      };
    }
  });

  /* S4 进阶：比较判别法 */
  QB.register({
    id: 'series-S4', type: 'series', difficulty: 'medium',
    gen: function (rng) {
      var correct = '收敛';
      var d = bo(correct, ['发散', '条件收敛', '无法判断'], rng);
      return {
        params: {},
        question: '级数 $\\sum\\limits_{n=1}^{\\infty}\\frac{n+1}{n^{3}}$ 的敛散性是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '找主导项：$\\frac{n+1}{n^3}\\sim\\frac{1}{n^2}$，和 $p=2$ 的 $p$ 级数比较。',
        steps: [
          { m: '\\frac{n+1}{n^3} = \\frac{1}{n^2}+\\frac{1}{n^3}',
            t: '拆成两个 $p$ 级数相加。' },
          { m: 'p=2>1,\\ p=3>1 \\Rightarrow \\text{两个都收敛}',
            t: '两个收敛级数相加仍收敛。' }
        ],
        pitfall: '不要把 $\\frac{n+1}{n^3}$ 误当 $\\frac{1}{n}$ 去比较。'
      };
    }
  });

  /* S5 困难：比值法求收敛半径 */
  QB.register({
    id: 'series-S5', type: 'series', difficulty: 'hard',
    gen: function (rng) {
      var correct = '+\\infty';
      var d = bo(correct, ['1', '0', 'e'], rng);
      return {
        params: {},
        question: '幂级数 $\\sum\\limits_{n=0}^{\\infty}\\frac{x^{n}}{n!}$ 的收敛半径 $R=$',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '比值法：$R=\\lim\\left|\\frac{a_n}{a_{n+1}}\\right|$，这里 $a_n=\\frac{1}{n!}$。',
        steps: [
          { m: '\\left|\\frac{a_n}{a_{n+1}}\\right| = \\frac{(n+1)!}{n!} = n+1',
            t: '$a_n=1/n!$，$a_{n+1}=1/(n+1)!$，相除得 $n+1$。' },
          { m: 'R = \\lim\\limits_{n\\to\\infty}(n+1) = +\\infty',
            t: '半径无穷大，级数在整个实轴上收敛。' }
        ],
        pitfall: '$\\frac{(n+1)!}{n!}=n+1$，别算成 $1$。'
      };
    }
  });

  /* S6 困难：幂级数收敛区间 */
  QB.register({
    id: 'series-S6', type: 'series', difficulty: 'hard',
    gen: function (rng) {
      var correct = '(-1,3)';
      var d = bo(correct, ['(-2,2)', '(1,3)', '[-1,3)]'], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: {},
        question: '幂级数 $\\sum\\limits_{n=0}^{\\infty}\\frac{(x-1)^{n}}{2^{n}}$ 的收敛区间是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '把它看成以 $x-1$ 为变量的等比级数：公比 $\\frac{x-1}{2}$，要求 $\\left|\\frac{x-1}{2}\\right|<1$。',
        steps: [
          { m: '\\left|\\frac{x-1}{2}\\right| < 1 \\Leftrightarrow |x-1|<2',
            t: '余项公比的绝对值小于 1。' },
          { m: '-2<x-1<2 \\Rightarrow -1<x<3',
            t: '解绝对值不等式。' },
          { m: '[-1,3)\\ \\text{端点处} \\left|\\frac{x-1}{2}\\right|=1 \\text{ 发散}',
            t: '端点检验：两端都是发散的等比级数，所以是开区间。' }
        ],
        pitfall: '收敛区间是 $(-1,3)$（开区间）；端点要单独检验。'
      };
    }
  });

  /* ================= 二阶常系数微分方程 ================= */

  /* O2-1 基础：两个不同实根 */
  QB.register({
    id: 'ode2-O21', type: 'ode2', difficulty: 'easy',
    gen: function (rng) {
      var r1 = ri(1, 2, rng), r2 = ri(2, 3, rng);
      if (r1 === r2) return this.gen(rng);
      var correct = 'C_1e^{' + r1 + 'x}+C_2e^{' + r2 + 'x}';
      var d = bo(correct, ['C_1e^{' + r1 + 'x}+C_2e^{-' + r2 + 'x}', 'C_1e^{' + r1 + 'x}+C_2', 'e^{' + r1 + 'x}+e^{' + r2 + 'x}'], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { r1: r1, r2: r2 },
        question: '微分方程 $y\\prime\\prime-' + (r1 + r2) + 'y\\prime+' + (r1 * r2) + 'y=0$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '二阶常系数齐次方程：写特征方程 $r^2-' + (r1 + r2) + 'r+' + (r1 * r2) + '=0$，解出两个根，通解是两个指数函数之和。',
        steps: [
          { m: 'r^2-' + (r1 + r2) + 'r+' + (r1 * r2) + ' = (r-' + r1 + ')(r-' + r2 + ') = 0',
            t: '特征方程：$y\\prime\\prime\\to r^2$，$y\\prime\\to r$，$y\\to1$。' },
          { m: 'r_1=' + r1 + ',\\; r_2=' + r2 + ' \\Rightarrow y=C_1e^{' + r1 + 'x}+C_2e^{' + r2 + 'x}',
            t: '两个不同实根，对应两个指数解。' }
        ],
        pitfall: '特征方程的三个系数：$y\\prime\\prime$ 系数是 1，别把 $y\\prime$ 的系数符号写反。'
      };
    }
  });

  /* O2-2 基础：重根 */
  QB.register({
    id: 'ode2-O22', type: 'ode2', difficulty: 'easy',
    gen: function (rng) {
      var k = ri(1, 3, rng);
      var correct = '(C_1+C_2x)e^{' + k + 'x}';
      var d = bo(correct, ['C_1e^{' + k + 'x}+C_2e^{-' + k + 'x}', '(C_1+C_2)e^{' + k + 'x}', '(C_1+C_2x)e^{-' + k + 'x}'], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: { k: k },
        question: '微分方程 $y\\prime\\prime-' + (2 * k) + 'y\\prime+' + (k * k) + 'y=0$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '特征方程 $(r-' + k + ')^2=0$，二重根 $r=' + k + '$ ⇒ 通解 $(C_1+C_2x)e^{' + k + 'x}$。',
        steps: [
          { m: 'r^2-' + (2 * k) + 'r+' + (k * k) + ' = (r-' + k + ')^2 = 0',
            t: '特征方程是完全平方，二重根。' },
          { m: 'y = (C_1+C_2x)e^{' + k + 'x}',
            t: '重根时第二个解要乘 $x$。' }
        ],
        pitfall: '重根时不能写 $C_1e^{kx}+C_2e^{kx}$（那是同一个解），要写 $(C_1+C_2x)e^{kx}$。'
      };
    }
  });

  /* O2-3 进阶：纯虚根 */
  QB.register({
    id: 'ode2-O23', type: 'ode2', difficulty: 'medium',
    gen: function (rng) {
      var correct = 'C_1\\cos x+C_2\\sin x';
      var d = bo(correct, ['C_1e^{x}+C_2e^{-x}', 'C_1\\cos x', 'C_1\\sin x'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime\\prime+y=0$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '特征方程 $r^2+1=0$ 得 $r=\\pm i$（纯虚根），对应 $\\cos x$ 与 $\\sin x$。',
        steps: [
          { m: 'r^2+1=0 \\Rightarrow r=\\pm i',
            t: '特征根是共轭纯虚数。' },
          { m: 'y = C_1\\cos x+C_2\\sin x',
            t: '复根 $\\alpha\\pm\\beta i$ 对应 $e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$，这里 $\\alpha=0$。' }
        ],
        pitfall: '答案要同时含 $\\cos$ 和 $\\sin$（两个独立解），只写一个不完整。'
      };
    }
  });

  /* O2-4 困难：负重根 */
  QB.register({
    id: 'ode2-O24', type: 'ode2', difficulty: 'hard',
    gen: function (rng) {
      var correct = '(C_1+C_2x)e^{-x}';
      var d = bo(correct, ['C_1e^{-x}+C_2e^{x}', '(C_1+C_2x)e^{x}', 'C_1e^{-x}+C_2'], rng);
      if (!ok4(d.options)) return this.gen(rng);
      return {
        params: {},
        question: '微分方程 $y\\prime\\prime+2y\\prime+y=0$ 的通解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '特征方程 $r^2+2r+1=(r+1)^2=0$，二重根 $r=-1$。',
        steps: [
          { m: 'r^2+2r+1 = (r+1)^2 = 0 \\Rightarrow r=-1\\ (\\text{二重})',
            t: '完全平方，二重根。' },
          { m: 'y = (C_1+C_2x)e^{-x}',
            t: '重根通解，指数上是 $-x$。' }
        ],
        pitfall: '负号在指数里：$e^{-x}$，不是 $e^{x}$。'
      };
    }
  });

  /* O2-5 困难：待定系数法求特解形式 */
  QB.register({
    id: 'ode2-O25', type: 'ode2', difficulty: 'hard',
    gen: function (rng) {
      var correct = 'y^*=x';
      var d = bo(correct, ['y^*=x+1', 'y^*=e^{x}', 'y^*=\\sin x'], rng);
      return {
        params: {},
        question: '微分方程 $y\\prime\\prime+y=x$ 的一个特解是',
        options: d.options, answerIndex: d.answerIndex, answer: d.answer,
        idea: '右端是一次多项式 $x$，设特解 $y^*=ax+b$ 代入检验（待定系数法）。',
        steps: [
          { m: 'y^*=ax+b \\Rightarrow y^{*\\prime\\prime}=0',
            t: '一次函数求两次导等于 0。' },
          { m: '0+(ax+b)=x \\Rightarrow a=1,\\ b=0',
            t: '代回方程得 $ax+b=x$，比较系数。' },
          { m: 'y^*=x',
            t: '所以特解是 $x$。' }
        ],
        pitfall: '特解形式要与右端同类型（一次式），不要猜成 $e^x$ 或 $\\sin x$。'
      };
    }
  });

  /* ================= 大一下 解答/证明题（无选项） ================= */
  function mk(o) { o.options = []; o.answerIndex = -1; return o; }

  /* SV1 证明：点积性质 */
  QB.register({
    id: 'solve-SV1', type: 'vector', difficulty: 'easy', kind: 'solve', form: 'proof', tech: '点积性质',
    gen: function (rng) {
      return mk({
        params: {},
        question: '证明：对任意向量 $\\vec{a}$，有 $\\vec{a}\\cdot\\vec{a}=|\\vec{a}|^{2}$。',
        answer: '设 $\\vec{a}=(a_1,a_2,a_3)$，则 $\\vec{a}\\cdot\\vec{a}=a_1^2+a_2^2+a_3^2=|\\vec{a}|^{2}$，证毕。',
        idea: '把点积按分量展开，出现的正好是向量长度的平方（模的定义）。',
        steps: [
          { m: '\\vec{a}\\cdot\\vec{a} = a_1a_1+a_2a_2+a_3a_3 = a_1^2+a_2^2+a_3^2',
            t: '点积定义：对应分量相乘再相加。' },
          { m: '|\\vec{a}| = \\sqrt{a_1^2+a_2^2+a_3^2} \\Rightarrow |\\vec{a}|^2 = a_1^2+a_2^2+a_3^2',
            t: '向量长度（模）的定义。' }
        ],
        pitfall: '点积的结果是数，不是向量；$\\vec{a}\\cdot\\vec{a}$ 不能写成 $\\vec{a}^2$ 那样带箭头。'
      });
    }
  });

  /* SV2 解答：全微分 */
  QB.register({
    id: 'solve-SV2', type: 'multivar', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '全微分',
    gen: function (rng) {
      return mk({
        params: {},
        question: '设 $z=x^2y$，求 $z$ 在点 $(1,2)$ 处的全微分 $\\mathrm{d}z$。',
        answer: '$\\mathrm{d}z=2xy\\,\\mathrm{d}x+x^2\\,\\mathrm{d}y$，在 $(1,2)$ 处 $\\mathrm{d}z=4\\,\\mathrm{d}x+\\mathrm{d}y$。',
        idea: '全微分 = 两个偏导分别乘 $\\mathrm{d}x$、$\\mathrm{d}y$ 再相加；最后代点。',
        steps: [
          { m: '\\frac{\\partial z}{\\partial x}=2xy,\\quad \\frac{\\partial z}{\\partial y}=x^2',
            t: '分别求两个偏导（对谁求导，另一个当常数）。' },
          { m: '\\mathrm{d}z = 2xy\\,\\mathrm{d}x+x^2\\,\\mathrm{d}y',
            t: '按全微分公式拼起来。' },
          { m: '\\mathrm{d}z(1,2) = 4\\,\\mathrm{d}x+1\\,\\mathrm{d}y',
            t: '把 $x=1,y=2$ 代入。' }
        ],
        pitfall: '求偏导时 $y$ 当常数，所以 $x^2y$ 对 $x$ 求导是 $2xy$（$y$ 保留）。'
      });
    }
  });

  /* SV3 解答：二重积分 */
  QB.register({
    id: 'solve-SV3', type: 'doubleint', difficulty: 'easy', kind: 'solve', form: 'solution', tech: '累次积分',
    gen: function (rng) {
      return mk({
        params: {},
        question: '计算 $\\iint_D x\\,\\mathrm{d}\\sigma$，其中 $D=[0,1]\\times[0,2]$。',
        answer: '$\\int_0^2\\mathrm{d}y\\int_0^1 x\\,\\mathrm{d}x=2\\cdot\\frac{1}{2}=1$。',
        idea: '矩形区域化成累次积分：先对 $x$ 积（得到 $1/2$），再对 $y$ 积（乘上长度 2）。',
        steps: [
          { m: '\\iint_D x\\,\\mathrm{d}\\sigma = \\int_0^{2}\\mathrm{d}y\\int_0^{1}x\\,\\mathrm{d}x',
            t: '化成先 $x$ 后 $y$ 的累次积分。' },
          { m: '= \\int_0^2 \\frac{1}{2}\\,\\mathrm{d}y = 1',
            t: '内层 $\\int_0^1x\\mathrm{d}x=\\frac12$，外层对 $y$ 积得到 $2\\cdot\\frac12=1$。' }
        ],
        pitfall: '内层积分上限是 1、外层是 2，不要把两个变量的上下限用混。'
      });
    }
  });

  /* SV4 解答：对弧长曲线积分 */
  QB.register({
    id: 'solve-SV4', type: 'lineint', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '弧长积分',
    gen: function (rng) {
      return mk({
        params: {},
        question: '计算 $\\int_L x\\,\\mathrm{d}s$，其中 $L$ 是从 $(0,0)$ 到 $(1,1)$ 的直线段。',
        answer: '参数化 $x=t,\\ y=t$（$0\\le t\\le1$），$\\mathrm{d}s=\\sqrt2\\,\\mathrm{d}t$，故 $\\int_L x\\,\\mathrm{d}s=\\sqrt2\\int_0^1 t\\,\\mathrm{d}t=\\frac{\\sqrt2}{2}$。',
        idea: '直线段参数化 $x=t,y=t$，弧长微分 $\\mathrm{d}s=\\sqrt{x\\prime^2+y\\prime^2}\\,\\mathrm{d}t=\\sqrt2\\,\\mathrm{d}t$。',
        steps: [
          { m: 'x=t,\\quad y=t,\\quad \\mathrm{d}s=\\sqrt{1^2+1^2}\\,\\mathrm{d}t=\\sqrt2\\,\\mathrm{d}t',
            t: '参数化并写出弧长微分。' },
          { m: '\\int_0^1 t\\cdot\\sqrt2\\,\\mathrm{d}t = \\sqrt2\\cdot\\frac{1}{2} = \\frac{\\sqrt2}{2}',
            t: '代入后就是普通定积分。' }
        ],
        pitfall: '弧长微分别忘了 $\\sqrt{x\\prime^2+y\\prime^2}$ 这个因子。'
      });
    }
  });

  /* SV5 证明：p 级数收敛（比较判别法） */
  QB.register({
    id: 'solve-SV5', type: 'series', difficulty: 'medium', kind: 'solve', form: 'proof', tech: '比较判别法',
    gen: function (rng) {
      return mk({
        params: {},
        question: '证明级数 $\\sum\\limits_{n=1}^{\\infty}\\frac{1}{n^{2}}$ 收敛。',
        answer: '当 $n\\ge2$ 时 $\\frac{1}{n^2}\\le\\frac{1}{n(n-1)}=\\frac{1}{n-1}-\\frac{1}{n}$，而 $\\sum\\frac{1}{n(n-1)}$ 收敛（裂项），由比较判别法原级数收敛。',
        idea: '和已知收敛的裂项级数比较：$\\frac{1}{n^2}<\\frac{1}{n(n-1)}$。',
        steps: [
          { m: 'n\\ge2:\\quad \\frac{1}{n^2} \\le \\frac{1}{n(n-1)}',
            t: '分母 $n(n-1)<n^2$，所以倒数更大。' },
          { m: '\\sum_{n=2}^{\\infty}\\frac{1}{n(n-1)} = \\sum\\left(\\frac{1}{n-1}-\\frac{1}{n}\\right) = 1',
            t: '裂项相消，收敛于 1。' },
          { m: '\\text{比较判别法} \\Rightarrow \\sum\\frac{1}{n^2} \\text{ 收敛}',
            t: '小的级数被收敛级数压住，必收敛。' }
        ],
        pitfall: '比较判别法要求逐项非负；还要注意从 $n=2$ 开始比较（$n=1$ 时分母为 0）。'
      });
    }
  });

  /* SV6 解答：二阶齐次方程 */
  QB.register({
    id: 'solve-SV6', type: 'ode2', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '特征方程',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求微分方程 $y\\prime\\prime-y=0$ 的通解。',
        answer: '特征方程 $r^2-1=0$ 得 $r=\\pm1$，故 $y=C_1e^{x}+C_2e^{-x}$。',
        idea: '二阶常系数齐次方程：写特征方程，解出两个根，通解是两个指数函数之和。',
        steps: [
          { m: 'r^2-1=0 \\Rightarrow r=\\pm1',
            t: '特征方程：$y\\prime\\prime\\to r^2$，$y\\to1$。' },
          { m: 'y = C_1e^{x}+C_2e^{-x}',
            t: '两个不同实根，对应两个指数解。' }
        ],
        pitfall: '特征方程的常数项是 $-1$（因为方程是 $y\\prime\\prime-y=0$），别写成 $+1$。'
      });
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
