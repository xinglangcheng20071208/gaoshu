/* ============================================================
 * 学习进度分享（生成海报 PNG / 复制分享文案）
 * 纯前端 Canvas 绘制，不依赖任何外部库，可离线使用
 * ============================================================ */
(function (root) {
  'use strict';
  var SITE_URL = 'https://xinglangcheng20071208.github.io/gaoshu/';

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 86400000);
  }

  // 从 state 计算展示用统计
  function computeStats(st) {
    st = st || {};
    var hist = st.history || [];
    var gradeable = hist.filter(function (h) { return h.correct !== null && h.correct !== undefined; });
    var correct = gradeable.filter(function (h) { return h.correct; }).length;
    var pct = gradeable.length ? Math.round(correct / gradeable.length * 100) : 0;
    var days = {};
    hist.forEach(function (h) { if (h.date) days[h.date] = (days[h.date] || 0) + 1; });
    var dates = Object.keys(days).sort();
    // 连续打卡（从今天或昨天往前数）
    var streak = 0;
    var cursor = new Date();
    var cursorStr = todayStr();
    if (!days[cursorStr]) {
      cursor.setDate(cursor.getDate() - 1);
      cursorStr = todayStr2(cursor);
      if (!days[cursorStr]) cursorStr = null;
    }
    while (cursorStr && days[cursorStr]) {
      streak++;
      var d = new Date(cursorStr.split('-')[0], +cursorStr.split('-')[1] - 1, +cursorStr.split('-')[2]);
      d.setDate(d.getDate() - 1);
      cursorStr = todayStr2(d);
    }
    // 掌握章节（已掌握且 7 天内到期）
    var mastered = 0;
    Object.keys(st.types || {}).forEach(function (t) { if ((st.types[t] || {}).status === 'mastered') mastered++; });
    return {
      total: hist.length,
      gradeable: gradeable.length,
      correct: correct,
      pct: pct,
      streak: streak,
      activeDays: dates.length,
      mastered: mastered,
      wrong: (st.wrongbook || []).length
    };
  }
  function todayStr2(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------- Canvas 海报 ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPoster(st, opts) {
    opts = opts || {};
    var s = computeStats(st);
    var W = 720, H = 1000;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');

    // 背景渐变
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#4f46e5');
    g.addColorStop(0.55, '#6366f1');
    g.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 右上光斑
    var rg = ctx.createRadialGradient(W - 80, 90, 10, W - 80, 90, 260);
    rg.addColorStop(0, 'rgba(255,255,255,.35)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, 400);

    // 标题
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 46px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('高数刷题营', 60, 120);
    ctx.font = '24px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(opts.trackName || '高数 · 北京高考 · 每天 10 题', 60, 162);

    // 主数字卡
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    roundRect(ctx, 60, 210, W - 120, 260, 28);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 96px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(String(s.total), 96, 350);
    ctx.font = '24px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText('累计刷题（道）', 100, 396);
    ctx.font = 'bold 40px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(s.pct + '%', 430, 330);
    ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText('客观题正确率', 430, 366);

    // 三宫格
    var items = [
      { v: s.streak + ' 天', k: '连续打卡' },
      { v: s.mastered + ' 章', k: '已掌握' },
      { v: s.activeDays + ' 天', k: '累计学习' }
    ];
    items.forEach(function (it, i) {
      var x = 60 + i * ((W - 120 - 20 * 2) / 3 + 20);
      var w = (W - 120 - 40) / 3;
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      roundRect(ctx, x, 500, w, 150, 22);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 38px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(it.v, x + 24, 566);
      ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillText(it.k, x + 24, 606);
    });

    // 进度条：章节掌握
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    var label = '已掌握章节 ' + s.mastered + ' 个 · 错题待复习 ' + s.wrong + ' 道';
    ctx.fillText(label, 60, 720);

    // 鼓励语
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    var cheer = s.streak >= 7 ? '连续打卡 ' + s.streak + ' 天，坚持就是最大的天赋！'
      : s.total >= 100 ? '已经刷了 ' + s.total + ' 道题，继续保持！'
      : '每天 10 题，稳步上岸！';
    ctx.fillText(cheer, 60, 790);

    // 底部链接
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = '22px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(SITE_URL, 60, 900);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.font = '20px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('打开链接开始刷题 · 数据保存在本机', 60, 936);

    return c;
  }

  function downloadPoster(st, opts) {
    var c = drawPoster(st, opts);
    return new Promise(function (resolve) {
      c.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'gaoshu-poster-' + todayStr() + '.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); resolve(true); }, 400);
      }, 'image/png');
    });
  }

  function shareText(st) {
    var s = computeStats(st);
    return '我在「高数刷题营」累计刷了 ' + s.total + ' 道题，客观题正确率 ' + s.pct +
      '%，连续打卡 ' + s.streak + ' 天，已掌握 ' + s.mastered + ' 个章节。\n每天 10 题，智能复习，一起上岸！\n' + SITE_URL;
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t).then(function () { return true; }).catch(function () { return legacyCopy(t); });
    }
    return Promise.resolve(legacyCopy(t));
  }
  function legacyCopy(t) {
    try {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  root.Share = {
    computeStats: computeStats,
    drawPoster: drawPoster,
    downloadPoster: downloadPoster,
    shareText: shareText,
    copyText: copyText,
    SITE_URL: SITE_URL
  };
})(typeof window !== 'undefined' ? window : globalThis);
