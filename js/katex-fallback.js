/* ============================================================
 * 简易公式渲染器：当 KaTeX（CDN）加载失败时兜底，
 * 把常见 LaTeX 子集渲染成 HTML，保证离线也能看懂题目。
 * ============================================================ */
(function (root) {
  'use strict';

  var MAP = {
    '\\pi': 'π', '\\infty': '∞', '\\ln': 'ln', '\\log': 'log', '\\lim': 'lim',
    '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\cot': 'cot',
    '\\arctan': 'arctan', '\\arcsin': 'arcsin',
    '\\cdot': '·', '\\times': '×', '\\pm': '±', '\\to': '→',
    '\\Rightarrow': '⇒', '\\int': '∫', '\\geq': '≥', '\\leq': '≤', '\\neq': '≠',
    '\\prime': '′', '\\approx': '≈', '\\infty': '∞',
    '\\displaystyle': '', '\\quad': '  ', '\\,': '', '\\;': '', '\\!': '',
    '\\left': '', '\\right': '', '\\[': '', '\\]': '', '\\\\': ' '
  };

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 读取 { ... } 花括号组，返回 [内容, 结束位置]
  function readBrace(s, start) {
    var depth = 0, i = start;
    while (i < s.length) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}') {
        depth--;
        if (depth === 0) return [s.slice(start + 1, i), i + 1];
      }
      i++;
    }
    return ['', start];
  }

  function parse(s) {
    var out = '', i = 0;
    while (i < s.length) {
      var c = s[i];
      if (c === '\\') {
        var m = /^\\([a-zA-Z]+|\W)/.exec(s.slice(i));
        if (m) {
          var cmd = m[1], full = '\\' + cmd;
          if (cmd === 'frac') {
            var rb = readBrace(s, i + 5);
            var rb2 = readBrace(s, rb[1]);
            out += '<span class="fbf"><span class="fbn">' + parse(rb[0]) + '</span><span class="fbd">' + parse(rb2[0]) + '</span></span>';
            i = rb2[1];
          } else if (cmd === 'sqrt') {
            var rq = readBrace(s, i + 5);
            out += '<span class="fbs">√</span><span class="fbsq">' + parse(rq[0]) + '</span>';
            i = rq[1];
          } else if (cmd === 'text' || cmd === 'mathrm') {
            var rt = readBrace(s, i + cmd.length + 1);
            out += esc(rt[0]);
            i = rt[1];
          } else if (cmd === 'mathbb') {
            var rm = readBrace(s, i + 7);
            out += (rm[0] === 'R' ? 'ℝ' : esc(rm[0]));
            i = rm[1];
          } else {
            out += (full in MAP) ? MAP[full] : full;
            i += full.length;
          }
        } else { out += esc(c); i++; }
      } else if (c === '^') {
        if (s[i + 1] === '{') {
          var rp = readBrace(s, i + 2);
          out += '<sup>' + parse(rp[0]) + '</sup>'; i = rp[1];
        } else { out += '<sup>' + esc(s[i + 1] || '') + '</sup>'; i += 2; }
      } else if (c === '_') {
        if (s[i + 1] === '{') {
          var ru = readBrace(s, i + 2);
          out += '<sub>' + parse(ru[0]) + '</sub>'; i = ru[1];
        } else { out += '<sub>' + esc(s[i + 1] || '') + '</sub>'; i += 2; }
      } else if (c === '{' || c === '}' || c === '$') { i++; }
      else { out += esc(c); i++; }
    }
    return out;
  }

  function render(el) {
    el.innerHTML = '<span class="fb">' + parse(el.textContent) + '</span>';
  }

  root.simpleTeX = { render: render, parse: parse };
})(typeof self !== 'undefined' ? self : globalThis);
