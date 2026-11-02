/* ============================================================
 * 解答题 / 证明题题库（kind: 'solve'）
 * 只给题目，无选项；用户点「已完成」后展示答案与解析
 * ============================================================ */
(function (root) {
  'use strict';
  var QB = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.QuestionBank;

  function mk(q) { return q; }

  /* S1 证明：ε-δ 定义证明极限 */
  QB.register({
    id: 'solve-S1', type: 'limit', difficulty: 'hard', kind: 'solve', form: 'proof', tech: 'ε-δ 定义',
    gen: function (rng) {
      return mk({
        params: {},
        question: '用极限的 $\\varepsilon-\\delta$ 定义证明：$\\lim_{x\\to 2}(3x-1)=5$。',
        options: [], answerIndex: -1,
        answer: '对任意 $\\varepsilon>0$，取 $\\delta=\\frac{\\varepsilon}{3}$，当 $0<|x-2|<\\delta$ 时，$|(3x-1)-5|=3|x-2|<3\\delta=\\varepsilon$，故 $\\lim_{x\\to 2}(3x-1)=5$。',
        idea: 'ε-δ 证明的套路：***任给* ε>0，**自己找一个** δ（通常从要证的式子反推出来），证明当距离小于 δ 时误差小于 ε。',
        steps: [
          { m: '|(3x-1)-5| = |3x-6| = 3|x-2|',
            t: '先把"函数值与极限值的差"整理成和 $|x-2|$ 有关的式子。' },
          { m: '3|x-2| < \\varepsilon \\Leftrightarrow |x-2| < \\frac{\\varepsilon}{3}',
            t: '希望这个差小于 ε，就要求 $|x-2|<\\frac{\\varepsilon}{3}$——于是自然取 $\\delta=\\frac{\\varepsilon}{3}$。' },
          { m: '0<|x-2|<\\delta \\Rightarrow |(3x-1)-5| = 3|x-2| < 3\\delta = \\varepsilon',
            t: '验证：只要 $x$ 与 2 的距离小于 δ，函数值与 5 的差就小于 ε，定义成立。' }
        ],
        pitfall: 'δ 是"由 ε 决定的"，不能写成一个固定的数；证明时要说清"任给 ε，取 δ=…"。'
      });
    }
  });

  /* S2 证明：零点定理 */
  QB.register({
    id: 'solve-S2', type: 'mvt', difficulty: 'medium', kind: 'solve', form: 'proof', tech: '零点定理',
    gen: function (rng) {
      return mk({
        params: {},
        question: '证明：方程 $x^3-3x+1=0$ 在区间 $(0,1)$ 内至少有一个根。',
        options: [], answerIndex: -1,
        answer: '令 $f(x)=x^3-3x+1$，它在 $[0,1]$ 上连续，且 $f(0)=1>0$、$f(1)=-1<0$，由零点定理，存在 $\\xi\\in(0,1)$ 使 $f(\\xi)=0$，即方程在 $(0,1)$ 内至少有一个根。',
        idea: '零点定理：连续函数在区间两端异号，中间一定"穿过" x 轴。只要算出两端函数值、说明一正一负即可。',
        steps: [
          { m: 'f(x)=x^3-3x+1 \\text{ 在 } [0,1] \\text{ 上连续}',
            t: '多项式处处连续，满足零点定理的条件。' },
          { m: 'f(0)=1>0,\\quad f(1)=-1<0',
            t: '算两端函数值：0 处为正，1 处为负。' },
          { m: '\\Rightarrow \\exists\\, \\xi\\in(0,1),\\; f(\\xi)=0',
            t: '一正一负，由零点定理，中间必有零点，即方程至少有一个根。' }
        ],
        pitfall: '零点定理只保证"至少一个"根；若要证"恰好一个"，还要加上单调性（导数恒正/恒负）。'
      });
    }
  });

  /* S3 证明：罗尔定理（两个零点） */
  QB.register({
    id: 'solve-S3', type: 'mvt', difficulty: 'hard', kind: 'solve', form: 'proof', tech: '罗尔定理',
    gen: function (rng) {
      return mk({
        params: {},
        question: '设 $f(x)=x(x-1)(x-2)$，证明：在 $(0,2)$ 内至少存在两个不同的点 $c_1,c_2$，使 $f\\prime(c_1)=f\\prime(c_2)=0$。',
        options: [], answerIndex: -1,
        answer: '$f$ 在 $[0,1]$ 与 $[1,2]$ 上分别满足罗尔定理条件（连续、可导、端点值相等），故存在 $c_1\\in(0,1)$、$c_2\\in(1,2)$ 使 $f\\prime(c_1)=f\\prime(c_2)=0$，且 $c_1\\neq c_2$。',
        idea: '罗尔定理：连续可导、两端值相等 ⇒ 中间至少有一个导数为 0 的点。这里函数在 0、1、2 三处都为 0，可以在相邻两个零点之间各用一次。',
        steps: [
          { m: 'f(0)=f(1)=f(2)=0',
            t: '把函数因式分解好看出来：$x=0,1,2$ 都是零点。' },
          { m: '[0,1]:\\; f(0)=f(1)=0 \\Rightarrow \\exists c_1\\in(0,1),\\; f\\prime(c_1)=0',
            t: '在 $[0,1]$ 上用罗尔定理。' },
          { m: '[1,2]:\\; f(1)=f(2)=0 \\Rightarrow \\exists c_2\\in(1,2),\\; f\\prime(c_2)=0',
            t: '在 $[1,2]$ 上再用一次罗尔定理。' },
          { m: 'c_1\\in(0,1),\\; c_2\\in(1,2) \\Rightarrow c_1\\neq c_2',
            t: '两个点分别落在不同区间，必然不同，得证。' }
        ],
        pitfall: '两个 c 要说明"不同"，用区间不相交来保证；只写"存在两个点"不够严谨。'
      });
    }
  });

  /* S4 证明：单调性证不等式 */
  QB.register({
    id: 'solve-S4', type: 'derivative', difficulty: 'hard', kind: 'solve', form: 'proof', tech: '单调性证不等式',
    gen: function (rng) {
      return mk({
        params: {},
        question: '证明：当 $x>0$ 时，$\\sin x<x$。',
        options: [], answerIndex: -1,
        answer: '令 $f(x)=x-\\sin x$，则 $f\\prime(x)=1-\\cos x\\ge 0$，且等号只在孤立点成立，故 $f$ 在 $[0,+\\infty)$ 上严格单调递增；又 $f(0)=0$，所以 $x>0$ 时 $f(x)>0$，即 $\\sin x<x$。',
        idea: '证不等式常用套路：把两边相减构造辅助函数，证明它单调递增且最小值大于 0。',
        steps: [
          { m: 'f(x)=x-\\sin x',
            t: '构造辅助函数：证明 $f(x)>0$ 就等价于要证的不等式。' },
          { m: 'f\\prime(x)=1-\\cos x\\ge 0',
            t: '求导：$\\cos x\\le 1$，所以导数非负（只在个别点等于 0），函数严格递增。' },
          { m: 'f(0)=0-0=0 \\Rightarrow x>0 \\text{ 时 } f(x)>f(0)=0',
            t: '起点值 $f(0)=0$，严格递增说明之后都大于 0，即 $x-\\sin x>0$。' }
        ],
        pitfall: '必须说明"严格"递增（等号只在孤立点成立），否则只能得到 $\\ge$，证不出严格小于。'
      });
    }
  });

  /* S5 解答：求极值 */
  QB.register({
    id: 'solve-S5', type: 'mvt', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '极值',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求函数 $f(x)=x^3-3x^2$ 的极值。',
        options: [], answerIndex: -1,
        answer: '极大值 $f(0)=0$，极小值 $f(2)=-4$。',
        idea: '求极值三步：①求导找驻点；②用二阶导（或导数符号变化）判断极大/极小；③代回求函数值。',
        steps: [
          { m: 'f\\prime(x)=3x^2-6x=3x(x-2)=0 \\Rightarrow x=0,2',
            t: '求导并因式分解，驻点是 0 和 2。' },
          { m: 'f\\prime\\prime(x)=6x-6',
            t: '再求一次导，用来判断极值类型。' },
          { m: 'f\\prime\\prime(0)=-6<0 \\Rightarrow x=0 \\text{ 极大};\quad f\\prime\\prime(2)=6>0 \\Rightarrow x=2 \\text{ 极小}',
            t: '二阶导为负是极大（开口向下），为正则是极小。' },
          { m: 'f(0)=0,\\quad f(2)=8-12=-4',
            t: '把驻点代回原函数，得到极值。' }
        ],
        pitfall: '极值点是 x 的值，极值是函数值：极大值是 $f(0)=0$，不是 0。'
      });
    }
  });

  /* S6 解答：凹凸与拐点 */
  QB.register({
    id: 'solve-S6', type: 'mvt', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '凹凸与拐点',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求曲线 $y=x^3-3x$ 的凹凸区间与拐点。',
        options: [], answerIndex: -1,
        answer: '$y\\prime\\prime=6x$：$x<0$ 时 $y\\prime\\prime<0$，曲线凹向下；$x>0$ 时 $y\\prime\\prime>0$，曲线凹向上；拐点为 $(0,0)$。',
        idea: '凹凸看二阶导符号：$y\\prime\\prime>0$ 凹向上，$y\\prime\\prime<0$ 凹向下；符号改变的分界点就是拐点。',
        steps: [
          { m: 'y\\prime=3x^2-3,\\quad y\\prime\\prime=6x',
            t: '求两次导。' },
          { m: 'y\\prime\\prime=0 \\Rightarrow x=0',
            t: '二阶导的零点。' },
          { m: 'x<0: y\\prime\\prime<0 \\text{（凹向下）};\quad x>0: y\\prime\\prime>0 \\text{（凹向上）}',
            t: '两侧符号相反，凹凸性在 0 处改变。' },
          { m: '\\text{拐点} \\left(0, y(0)\\right) = (0,0)',
            t: '拐点是曲线上的点：横坐标 0 代回原函数得纵坐标 0。' }
        ],
        pitfall: '拐点要写成坐标 $(0,0)$，不能只写 $x=0$；凹凸性术语按"凹向上/凹向下"描述最不容易混。'
      });
    }
  });

  /* S7 解答：分部积分 */
  QB.register({
    id: 'solve-S7', type: 'indint', difficulty: 'hard', kind: 'solve', form: 'solution', tech: '分部积分',
    gen: function (rng) {
      return mk({
        params: {},
        question: '计算 $\\int x e^{2x}\\,\\mathrm{d}x$（要求写出分部积分过程）。',
        options: [], answerIndex: -1,
        answer: '$\\int x e^{2x}\\mathrm{d}x = \\frac{e^{2x}}{4}(2x-1)+C$。',
        idea: '多项式乘指数函数，用分部积分 $\\int u\\,\\mathrm{d}v=uv-\\int v\\,\\mathrm{d}u$，取 $u=x$、$\\mathrm{d}v=e^{2x}\\mathrm{d}x$。',
        steps: [
          { m: 'u=x,\\quad \\mathrm{d}v=e^{2x}\\mathrm{d}x \\Rightarrow v=\\frac{e^{2x}}{2}',
            t: '$e^{2x}$ 积分得 $\\frac{e^{2x}}{2}$。' },
          { m: '\\int x e^{2x}\\mathrm{d}x = \\frac{x e^{2x}}{2} - \\int \\frac{e^{2x}}{2}\\mathrm{d}x',
            t: '套分部积分公式。' },
          { m: '= \\frac{x e^{2x}}{2} - \\frac{e^{2x}}{4} + C = \\frac{e^{2x}}{4}(2x-1)+C',
            t: '再积一次，通分整理。' }
        ],
        pitfall: '第二项分母是 4（$\\frac{1}{2}\\times\\frac{1}{2}$），最后别忘了 $+C$。'
      });
    }
  });

  /* S8 解答：定积分换元 */
  QB.register({
    id: 'solve-S8', type: 'defint', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '换元法',
    gen: function (rng) {
      return mk({
        params: {},
        question: '计算 $\\int_0^1 x e^{x^2}\\,\\mathrm{d}x$（要求写出换元过程）。',
        options: [], answerIndex: -1,
        answer: '令 $u=x^2$，$\\mathrm{d}u=2x\\mathrm{d}x$，则 $\\int_0^1 x e^{x^2}\\mathrm{d}x=\\frac{1}{2}\\int_0^1 e^u\\mathrm{d}u=\\frac{e-1}{2}$。',
        idea: '看到 $x^2$ 和 $x\\mathrm{d}x$ 就想到换元：$u=x^2$，$\\mathrm{d}u=2x\\mathrm{d}x$，$x\\mathrm{d}x=\\frac{1}{2}\\mathrm{d}u$。',
        steps: [
          { m: 'u=x^2,\\quad \\mathrm{d}u=2x\\,\\mathrm{d}x',
            t: '设换元变量。' },
          { m: 'x\\mathrm{d}x = \\frac{1}{2}\\mathrm{d}u,\\quad 0\\to 0,\\; 1\\to 1',
            t: '上下限在 $x=0$ 和 $x=1$ 时 $u$ 也是 0 和 1，不用变。' },
          { m: '\\int_0^1 x e^{x^2}\\mathrm{d}x = \\frac{1}{2}\\int_0^1 e^u\\mathrm{d}u = \\frac{1}{2}(e-1)',
            t: '换元后积分，代入上下限。' }
        ],
        pitfall: '换元后要把 $x\\mathrm{d}x$ 整体换掉，别漏 $\\frac{1}{2}$。'
      });
    }
  });

  /* S9 证明：奇函数对称区间积分为 0 */
  QB.register({
    id: 'solve-S9', type: 'defint', difficulty: 'hard', kind: 'solve', form: 'proof', tech: '奇偶性',
    gen: function (rng) {
      return mk({
        params: {},
        question: '设 $f(x)$ 在 $[-a,a]$ 上连续且为奇函数，证明 $\\int_{-a}^{a}f(x)\\,\\mathrm{d}x=0$。',
        options: [], answerIndex: -1,
        answer: '$\\int_{-a}^{a}f(x)\\mathrm{d}x=\\int_{-a}^{0}f(x)\\mathrm{d}x+\\int_{0}^{a}f(x)\\mathrm{d}x$，对第一个积分令 $x=-t$，得 $\\int_{0}^{a}f(-t)\\mathrm{d}t=-\\int_{0}^{a}f(t)\\mathrm{d}t$，与第二个积分相消，故原积分为 0。',
        idea: '对称区间先拆成两半，左半边换元 $x=-t$，利用奇函数 $f(-t)=-f(t)$ 把符号提出来，正好与右半边抵消。',
        steps: [
          { m: '\\int_{-a}^{a}f(x)\\mathrm{d}x = \\int_{-a}^{0}f(x)\\mathrm{d}x + \\int_{0}^{a}f(x)\\mathrm{d}x',
            t: '把区间拆成左、右两半。' },
          { m: 'x=-t \\Rightarrow \\int_{-a}^{0}f(x)\\mathrm{d}x = \\int_{a}^{0}f(-t)(-\\mathrm{d}t) = \\int_{0}^{a}f(-t)\\mathrm{d}t',
            t: '左半边作换元 $x=-t$，整理积分方向。' },
          { m: 'f(-t)=-f(t) \\Rightarrow \\int_{0}^{a}f(-t)\\mathrm{d}t = -\\int_{0}^{a}f(t)\\mathrm{d}t',
            t: '奇函数把负号提出来，右半边恰好被抵消。' },
          { m: '= -\\int_0^a f(t)\\mathrm{d}t + \\int_0^a f(t)\\mathrm{d}t = 0',
            t: '两项相消，得证。' }
        ],
        pitfall: '换元时上下限和符号一起变：$x=-t$ 时 $\\mathrm{d}x=-\\mathrm{d}t$，这两处都要处理。'
      });
    }
  });

  /* S10 解答：旋转体体积 */
  QB.register({
    id: 'solve-S10', type: 'defapp', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '旋转体体积',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求曲线 $y=\\sqrt{x}$（$0\\le x\\le 1$）与 $x$ 轴围成的图形绕 $x$ 轴旋转一周所得旋转体的体积（写出积分过程）。',
        options: [], answerIndex: -1,
        answer: '$V=\\pi\\int_0^1(\\sqrt{x})^2\\mathrm{d}x=\\pi\\int_0^1 x\\,\\mathrm{d}x=\\frac{\\pi}{2}$。',
        idea: '圆盘法：$V=\\pi\\int y^2\\mathrm{d}x$。半径是 $y=\\sqrt{x}$，平方后正好是 $x$。',
        steps: [
          { m: 'V = \\pi\\int_0^{1} y^2\\,\\mathrm{d}x = \\pi\\int_0^{1} x\\,\\mathrm{d}x',
            t: '半径为 $\\sqrt{x}$，截面面积 $\\pi x$。' },
          { m: '= \\pi\\cdot\\frac{x^2}{2}\\bigg|_0^1 = \\frac{\\pi}{2}',
            t: '$x$ 的原函数是 $\\frac{x^2}{2}$，代入上下限。' }
        ],
        pitfall: '半径要平方：$(\\sqrt{x})^2=x$，不是 $\\sqrt{x}$。'
      });
    }
  });

  /* S11 解答：两曲线围成面积 */
  QB.register({
    id: 'solve-S11', type: 'defapp', difficulty: 'hard', kind: 'solve', form: 'solution', tech: '两曲线面积',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求由曲线 $y=x^2$ 与直线 $y=2x$ 所围成平面图形的面积（写出积分过程）。',
        options: [], answerIndex: -1,
        answer: '$\\int_0^2(2x-x^2)\\mathrm{d}x=\\left[x^2-\\frac{x^3}{3}\\right]_0^2=4-\\frac{8}{3}=\\frac{4}{3}$。',
        idea: '先求交点定区间，再"上减下"积分：直线在抛物线之上。',
        steps: [
          { m: 'x^2 = 2x \\Rightarrow x=0,2',
            t: '解交点：$x=0$ 和 $x=2$。' },
          { m: 'S = \\int_0^2 (2x-x^2)\\,\\mathrm{d}x',
            t: '在 $(0,2)$ 内 $2x>x^2$，所以上减下是 $2x-x^2$。' },
          { m: '= \\left[x^2-\\frac{x^3}{3}\\right]_0^2 = 4-\\frac{8}{3} = \\frac{4}{3}',
            t: '积分并代入上下限。' }
        ],
        pitfall: '被积函数是"上面的减下面的"，别写成 $x^2-2x$（会得到负数）。'
      });
    }
  });

  /* S12 解答：初值问题 */
  QB.register({
    id: 'solve-S12', type: 'ode', difficulty: 'medium', kind: 'solve', form: 'solution', tech: '初值问题',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求微分方程 $y\\prime=2x$ 满足 $y(0)=1$ 的特解（写出过程）。',
        options: [], answerIndex: -1,
        answer: '通解 $y=x^2+C$；代入 $y(0)=1$ 得 $C=1$，故 $y=x^2+1$。',
        idea: '两步走：先积分得通解，再用初始条件定常数 $C$。',
        steps: [
          { m: 'y = \\int 2x\\,\\mathrm{d}x = x^2+C',
            t: '两边积分得到含任意常数的通解。' },
          { m: 'y(0)=0+C=1 \\Rightarrow C=1',
            t: '把 $x=0$、$y=1$ 代入求 $C$。' },
          { m: 'y = x^2+1',
            t: '代回通解得到特解。' }
        ],
        pitfall: '初始条件是用来求常数 $C$ 的，不是把 $C$ 换成 $x$。'
      });
    }
  });

  /* S13 解答：一阶线性方程 */
  QB.register({
    id: 'solve-S13', type: 'ode', difficulty: 'hard', kind: 'solve', form: 'solution', tech: '一阶线性',
    gen: function (rng) {
      return mk({
        params: {},
        question: '求微分方程 $y\\prime+y=e^{x}$ 的通解（写出过程）。',
        options: [], answerIndex: -1,
        answer: '积分因子 $e^{x}$，两边同乘得 $(ye^{x})\\prime=e^{2x}$，积分得 $ye^{x}=\\frac{e^{2x}}{2}+C$，故 $y=\\frac{e^{x}}{2}+Ce^{-x}$。',
        idea: '一阶线性方程 $y\\prime+P y=Q$ 用积分因子：乘 $e^{\\int P\\mathrm{d}x}$，左边会凑成乘积的导数。',
        steps: [
          { m: 'e^{\\int 1\\,\\mathrm{d}x} = e^{x}',
            t: '$P=1$，积分因子是 $e^{x}$。' },
          { m: 'y\\prime e^{x}+y e^{x} = e^{2x} \\Rightarrow (ye^{x})\\prime = e^{2x}',
            t: '两边同乘 $e^x$，左边正好是 $(ye^x)\\prime$。' },
          { m: 'ye^{x} = \\frac{e^{2x}}{2}+C \\Rightarrow y=\\frac{e^{x}}{2}+Ce^{-x}',
            t: '两边积分，再除以 $e^x$ 得到通解。' }
        ],
        pitfall: '最后除以 $e^x$ 时，常数 $C$ 变成 $Ce^{-x}$，指数是负的。'
      });
    }
  });
})(typeof self !== 'undefined' ? self : globalThis);
