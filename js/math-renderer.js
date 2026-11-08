/* ============================================================
 * 公式渲染模块（KaTeX 优先 / 简易渲染器兜底 / 结果缓存）
 * - 自托管 KaTeX（vendor/katex），断网也能渲染
 * - 若本地 KaTeX 缺失，自动尝试 CDN（unpkg）
 * - 同一条公式只渲染一次（Map 缓存），页面重绘时直接复用 HTML
 * - 单个公式渲染失败不会影响其它公式：自动降级到 simpleTeX / 纯文本
 * ============================================================ */
(function (root) {
  'use strict';

  var cache = Object.create(null);      // 'D|tex' / 'I|tex' → 渲染后的 HTML
  var katexTried = false;
  var CDN_JS = 'https://unpkg.com/katex@0.16.11/dist/katex.min.js';
  var CDN_JS2 = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = function () { cb(true); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  // KaTeX 是否已就绪；没有就尝试从 CDN 补一次（自托管失败时）
  function ensureKatex(cb) {
    if (root.katex) return cb(true);
    if (katexTried) return cb(false);
    katexTried = true;
    loadScript(CDN_JS, function (ok) {
      if (ok && root.katex) return cb(true);
      loadScript(CDN_JS2, function (ok2) { cb(!!(ok2 && root.katex)); });
    });
  }

  // 把含 $...$ 的字符串转成占位 HTML（每段公式一个 .mtex 节点）
  function mathHtml(s, display) {
    s = String(s == null ? '' : s);
    if (s.indexOf('$') >= 0) {
      var parts = s.split('$'), out = '';
      for (var i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
          out += '<span class="mtex' + (display ? ' mtex-d' : '') + '" data-tex="' + esc(parts[i]) + '">' + esc(parts[i]) + '</span>';
        } else {
          out += esc(parts[i]);
        }
      }
      return out;
    }
    if (/[\\^_{]/.test(s)) {
      return '<span class="mtex' + (display ? ' mtex-d' : '') + '" data-tex="' + esc(s) + '">' + esc(s) + '</span>';
    }
    return esc(s);
  }

  // 题干里 $...$ 公式段数
  function segCount(s) {
    return Math.floor(String(s == null ? '' : s).split('$').length / 2);
  }

  // 题干排版：单段公式居中放大；多段公式夹文字按句子内联
  function questionBlock(text) {
    var inline = segCount(text) >= 2;
    var inner = mathHtml(text, !inline).replace(/\n/g, '<br>');
    return '<div class="qc-question' + (inline ? ' q-inline' : '') + '">' + inner + '</div>';
  }

  function renderNode(n) {
    var tex = n.getAttribute('data-tex') || n.textContent;
    var display = n.classList.contains('mtex-d');
    var key = (display ? 'D|' : 'I|') + tex;
    var done = n.dataset.rendered;
    if (done === 'katex' && cache[key]) return;
    if (cache[key]) { n.innerHTML = cache[key]; n.dataset.rendered = 'katex'; return; }
    if (root.katex) {
      try {
        var html = root.katex.renderToString(tex, {
          displayMode: display, throwOnError: true, strict: false, trust: false
        });
        cache[key] = html;
        n.innerHTML = html;
        n.dataset.rendered = 'katex';
        return;
      } catch (e) {
        // 单个公式失败 → 继续走兜底，不影响页面其它公式
      }
    }
    if (root.simpleTeX) {
      try {
        n.textContent = tex;
        root.simpleTeX.render(n);
        n.dataset.rendered = 'fb';
        return;
      } catch (e2) { /* ignore */ }
    }
    n.textContent = tex;
    n.dataset.rendered = 'text';
  }

  function renderAll(scope) {
    var nodes = (scope || document).querySelectorAll('.mtex');
    for (var i = 0; i < nodes.length; i++) renderNode(nodes[i]);
  }

  // 渲染入口：先同步渲染一遍；若 KaTeX 是稍后从 CDN 补上的，再补渲染一次
  function render(scope) {
    renderAll(scope);
    if (!root.katex) {
      ensureKatex(function (ok) {
        if (ok) renderAll(scope);
      });
    }
  }

  root.MathRender = {
    mathHtml: mathHtml,
    render: render,
    renderNode: renderNode,
    segCount: segCount,
    questionBlock: questionBlock,
    ensureKatex: ensureKatex,
    clearCache: function () { cache = Object.create(null); },
    hasKatex: function () { return !!root.katex; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
