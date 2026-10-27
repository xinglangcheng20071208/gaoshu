/* ============================================================
 * 高数刷题营 - 主应用（UI 与交互）
 * ============================================================ */
(function () {
  'use strict';
  var QB = window.QuestionBank, S = window.Scheduler, Store = window.Store;

  var state = Store.load();
  var today = Store.todayStr();
  var view = 'daily';
  var curIdx = 0;                 // 今日练习当前第几题（0-based）
  var customIdx = 0;              // 专项练习当前第几题
  var wrongFilter = 'all';        // 错题本筛选
  var expanded = {};              // 错题本展开状态

  var MARK_META = {
    mastered:     { name: '已掌握', icon: '✓', cls: 'mark-mastered', hint: '7 天后出类似题目', pri: 1 },
    wobbly:       { name: '不熟练', icon: '△', cls: 'mark-wobbly',   hint: '2 天后出类似题目', pri: 2 },
    not_mastered: { name: '未掌握', icon: '✗', cls: 'mark-not',      hint: '连续 2 天出类似题目', pri: 3 }
  };

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // 把含 $...$ 或纯 LaTeX 的字符串转成带 data-tex 的 HTML
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

  // 渲染页面中所有 .mtex（KaTeX 优先，失败用简易渲染器）
  function renderMathIn(root) {
    $$('.mtex', root || document).forEach(function (n) {
      var tex = n.getAttribute('data-tex') || n.textContent;
      if (window.katex) {
        if (n.dataset.rendered === 'katex') return;
        try {
          katex.render(tex, n, {
            throwOnError: false, strict: false,
            displayMode: n.classList.contains('mtex-d')
          });
          n.dataset.rendered = 'katex';
        } catch (e) { n.textContent = tex; }
      } else if (window.simpleTeX) {
        if (n.dataset.rendered === 'fb') return;
        try { simpleTeX.render(n); n.dataset.rendered = 'fb'; } catch (e) { }
      }
    });
  }

  function typeBadge(t, extra) {
    var m = QB.types[t];
    return '<span class="tag tag-type" style="--tc:' + m.color + '">' + esc(m.icon) + ' ' + esc(m.short) + (extra || '') + '</span>';
  }
  function diffBadge(d) {
    var m = QB.difficulties[d];
    return '<span class="tag tag-diff" style="--tc:' + m.color + '">' + esc(m.name) + '</span>';
  }
  function markBadge(mark) {
    if (!mark) return '';
    var m = MARK_META[mark];
    if (!m) return '';
    return '<span class="tag ' + m.cls + '">' + m.icon + ' ' + m.name + '</span>';
  }

  /* ---------- 数据操作 ---------- */
  function save() {
    // 裁剪旧数据，防止 localStorage 超限：每日套装保留最近 30 天，记录保留最近 2000 条
    var keys = Object.keys(state.daily).sort();
    while (keys.length > 30) delete state.daily[keys.shift()];
    if (state.history.length > 2000) state.history = state.history.slice(-2000);
    Store.save(state);
  }

  function ensureDaily() {
    var d = state.daily[today];
    if (!d || d.difficulty !== state.settings.difficulty) {
      d = S.buildDaily({
        typesState: state.types, today: today,
        difficulty: state.settings.difficulty, count: 10
      });
      d.difficulty = state.settings.difficulty; // 关键：给套装盖章难度，避免每次误判重建
      d.answers = {};
      state.daily[today] = d;
      Object.keys(d.used).forEach(function (t) {
        state.types[t] = S.afterShow(state.types[t], today);
      });
      save();
    }
    if (!d.answers) d.answers = {};
    return d;
  }

  // 当前活动套题容器：专项练习视图用专项套，其余视图用今日套
  function curContainer() {
    if (view === 'custom' && state.custom && state.custom.set) return state.custom.set;
    return ensureDaily();
  }
  function curIndex() { return view === 'custom' ? customIdx : curIdx; }
  function setCurIndex(i) { if (view === 'custom') customIdx = i; else curIdx = i; }
  function curSource() { return view === 'custom' ? 'custom' : 'daily'; }
  function renderCurrentPractice() { if (view === 'custom') renderCustom(); else renderDaily(); }

  function findWrong(qid) {
    for (var i = 0; i < state.wrongbook.length; i++) {
      if (state.wrongbook[i].id === qid) return state.wrongbook[i];
    }
    return null;
  }
  function removeWrong(qid) {
    state.wrongbook = state.wrongbook.filter(function (e) { return e.id !== qid; });
  }
  function upsertWrong(q, mark) {
    var e = findWrong(q.qid);
    var pri = MARK_META[mark] ? MARK_META[mark].pri : 0;
    if (e) {
      if ((MARK_META[e.mark] ? MARK_META[e.mark].pri : 0) <= pri) e.mark = mark;
      return;
    }
    state.wrongbook.push({
      id: q.qid, date: today, typeId: q.typeId, difficulty: q.difficulty,
      question: q.question, options: q.options, answerIndex: q.answerIndex,
      answer: q.answer, idea: q.idea, steps: q.steps, pitfall: q.pitfall, mark: mark
    });
  }

  // 标记题型状态（已掌握 / 不熟练 / 未掌握），container 为当前套题（今日或专项）
  function setMark(container, q, mark) {
    var a = container.answers[q.qid] || (container.answers[q.qid] = {});
    a.mark = mark;
    state.types[q.typeId] = S.applyMark(state.types[q.typeId], mark, today);
    if (mark === 'wobbly' || mark === 'not_mastered') {
      upsertWrong(q, mark);
    } else if (mark === 'mastered') {
      removeWrong(q.qid);
    }
    // 同步历史里的标记
    for (var i = state.history.length - 1; i >= 0; i--) {
      if (state.history[i].qid === q.qid) { state.history[i].mark = mark; break; }
    }
    save();
  }

  // 提交答案，source: 'daily' 今日练习 | 'custom' 专项练习
  function submitAnswer(container, q, chosenIdx, source) {
    var a = container.answers[q.qid] || (container.answers[q.qid] = {});
    a.chosen = chosenIdx;
    a.submitted = true;
    a.correct = (chosenIdx === q.answerIndex);
    var h = {
      ts: Date.now(), date: today, source: source || 'daily',
      typeId: q.typeId, difficulty: q.difficulty,
      tpl: q.tpl, qid: q.qid, question: q.question, answer: q.answer,
      chosen: chosenIdx, correct: a.correct, mark: a.mark || ''
    };
    var found = false;
    for (var i = state.history.length - 1; i >= 0; i--) {
      if (state.history[i].qid === q.qid) { state.history[i] = h; found = true; break; }
    }
    if (!found) state.history.push(h);
    if (a.correct) {
      var e = findWrong(q.qid);
      if (e && e.mark === 'wrong') removeWrong(q.qid);
    } else {
      upsertWrong(q, a.mark || 'wrong');
    }
    save();
  }

  /* ---------- 头部 / 导航 ---------- */
  function renderShell() {
    var tabs = [
      { id: 'daily', name: '今日练习' },
      { id: 'custom', name: '专项练习' },
      { id: 'wrong', name: '错题本', badge: state.wrongbook.length },
      { id: 'records', name: '学习记录' },
      { id: 'mastery', name: '掌握度' }
    ];
    var html = tabs.map(function (t) {
      return '<button class="tab' + (view === t.id ? ' active' : '') + '" data-view="' + t.id + '">' +
        esc(t.name) +
        (t.badge ? '<span class="badge">' + t.badge + '</span>' : '') +
        '</button>';
    }).join('');
    $('#tabs').innerHTML = html;
    $('#themeBtn').textContent = state.settings.theme === 'dark' ? '☀️' : '🌙';
    document.body.setAttribute('data-theme', state.settings.theme);
  }

  function switchView(v) {
    view = v;
    if (v === 'daily') curIdx = 0;
    if (v === 'custom') customIdx = 0;
    render();
  }

  /* ---------- 今日练习 ---------- */
  function renderDaily() {
    var d = ensureDaily();
    var answered = Object.keys(d.answers).filter(function (qid) {
      return d.answers[qid].submitted === true;
    }).length;
    var allDone = answered >= d.questions.length;

    var dueHtml = d.due.length ? d.due.map(function (u) {
      var m = QB.types[u.typeId];
      return '<span class="chip" style="--tc:' + m.color + '">' + esc(m.short) + '<i>' + esc(u.reason) + '</i></span>';
    }).join('') : '<span class="chip">全部题型首次接触</span>';

    var diffs = ['easy', 'medium', 'hard'].map(function (dd) {
      var m = QB.difficulties[dd];
      return '<button class="seg' + (state.settings.difficulty === dd ? ' active' : '') + '" data-diff="' + dd + '" style="--tc:' + m.color + '" title="' + esc(m.desc) + '">' + esc(m.name) + '</button>';
    }).join('');

    var html = '';
    html += '<div class="daily-meta card">';
    html += '<div class="dm-row1"><span class="dm-date">📅 ' + today + '</span><div class="dm-diff">难度：<span class="segs">' + diffs + '</span></div></div>';
    html += '<div class="dm-row2"><span class="dm-prog">今日进度 <b>' + answered + '</b>/' + d.questions.length + '</span><div class="pbar"><div class="pbar-in" style="width:' + Math.round(answered / d.questions.length * 100) + '%"></div></div></div>';
    html += '<div class="dm-row3"><span class="dm-plan">今日复习计划</span><div class="dm-chips">' + dueHtml + '</div></div>';
    html += '</div>';

    if (allDone) {
      html += renderSummary(d, { title: '🎉 今日练习完成' });
    } else {
      html += renderQuestionCard(d, curIdx);
      html += renderNav(d, curIdx);
    }
    $('#app').innerHTML = html;
    renderMathIn($('#app'));
  }

  function renderSummary(d, opts) {
    opts = opts || {};
    var score = 0;
    var marks = { mastered: 0, wobbly: 0, not_mastered: 0 };
    d.questions.forEach(function (q) {
      var a = d.answers[q.qid] || {};
      if (a.correct) score++;
      if (a.mark && marks[a.mark] !== undefined) marks[a.mark]++;
    });
    var pct = Math.round(score / d.questions.length * 100);
    var msg = pct === 100 ? '全对！太强了，明天的题会更有挑战 🌟'
      : pct >= 80 ? '很棒！错题已进错题本，记得看一眼解析 📘'
      : pct >= 60 ? '不错！把"未掌握"的题明天再来一轮 💪'
      : '别灰心！把每题解析看懂，明天同类题还会再出现 ✊';
    var html = '<div class="summary card">';
    html += '<h2>' + (opts.title || '练习完成') + '</h2>';
    html += '<div class="score"><b>' + score + '</b><span>/' + d.questions.length + ' 正确率 ' + pct + '%</span></div>';
    html += '<p class="sum-msg">' + msg + '</p>';
    html += '<div class="sum-marks">' +
      '<span class="tag mark-mastered">✓ 已掌握 ×' + marks.mastered + ' <i>7 天后见</i></span>' +
      '<span class="tag mark-wobbly">△ 不熟练 ×' + marks.wobbly + ' <i>2 天后见</i></span>' +
      '<span class="tag mark-not">✗ 未掌握 ×' + marks.not_mastered + ' <i>明天继续</i></span>' +
      '</div>';
    html += '<div class="sum-list">' + d.questions.map(function (q) {
      var a = d.answers[q.qid] || {};
      return '<div class="sum-item' + (a.correct ? ' ok' : ' no') + '" data-go="' + d.questions.indexOf(q) + '">' +
        '<span class="sum-no">' + (d.questions.indexOf(q) + 1) + '</span>' +
        '<span class="sum-type">' + esc(QB.types[q.typeId].short) + '</span>' +
        '<span class="sum-icon">' + (a.correct ? '✓' : '✗') + '</span>' +
        (a.mark ? '<span class="sum-mark">' + esc(MARK_META[a.mark].name) + '</span>' : '') +
        '</div>';
    }).join('') + '</div>';
    html += '<div class="sum-btns">' + (opts.extraBtns || '') + '<button class="btn" data-view-go="wrong">打开错题本</button><button class="btn ghost" data-view-go="records">查看学习记录</button></div>';
    html += '</div>';
    return html;
  }

  function renderQuestionCard(d, idx) {
    var q = d.questions[idx];
    var a = d.answers[q.qid] || {};
    var answered = a.submitted === true;   // 只有点过"提交答案"才算已作答

    // 三个状态标记（按需求放在题目上方）
    var marksHtml = '<div class="mark-row">' + ['mastered', 'wobbly', 'not_mastered'].map(function (mk) {
      var m = MARK_META[mk];
      return '<button class="mark-btn ' + m.cls + (a.mark === mk ? ' active' : '') + '" data-mark="' + mk + '" data-qid="' + q.qid + '" title="' + esc(m.hint) + '">' +
        '<span class="mk-icon">' + m.icon + '</span>' + m.name +
        '<span class="mk-hint">' + esc(m.hint) + '</span></button>';
    }).join('') + '</div>';

    var html = '<div class="qcard card">';
    html += '<div class="qc-head">' +
      '<span class="qc-no">第 ' + (idx + 1) + '/' + d.questions.length + ' 题</span>' +
      typeBadge(q.typeId) + diffBadge(q.difficulty) +
      '<span class="chip chip-reason">' + esc(q.dueReason) + '</span></div>';
    html += marksHtml;
    html += '<div class="qc-question">' + mathHtml(q.question, true) + '</div>';
    html += '<div class="qc-options">' + ['A', 'B', 'C', 'D'].map(function (L, i) {
      var cls = 'opt';
      if (answered) {
        if (i === q.answerIndex) cls += ' opt-right';
        else if (i === a.chosen) cls += ' opt-wrong';
        else cls += ' opt-dim';
      }
      var chosenCls = (!answered && a.chosen === i) ? ' chosen' : '';
      return '<button class="' + cls + chosenCls + '" data-pick="' + i + '" data-qid="' + q.qid + '" ' + (answered ? 'disabled' : '') + '>' +
        '<span class="opt-letter">' + L + '</span><span class="opt-body">' + mathHtml(q.options[i], false) + '</span></button>';
    }).join('') + '</div>';

    if (answered) {
      html += '<div class="qc-feedback ' + (a.correct ? 'fb-ok' : 'fb-no') + '">';
      html += a.correct ? '✅ 回答正确！' : '❌ 回答错误';
      html += '<div class="fb-answer">正确答案：' + mathHtml(q.answer, true) + '</div>';
      html += '</div>';
      html += '<div class="qc-solution">';
      html += '<div class="sol-title">💡 解题思路与过程</div>';
      html += '<div class="sol-idea">' + mathHtml(q.idea, false) + '</div>';
      html += '<ol class="sol-steps">' + q.steps.map(function (st) {
        return '<li><div class="sol-m">' + mathHtml(st.m, true) + '</div><div class="sol-t">' + mathHtml(st.t, false) + '</div></li>';
      }).join('') + '</ol>';
      html += '<div class="sol-pit">⚠️ 易错点：' + mathHtml(q.pitfall, false) + '</div>';
      html += '</div>';
    } else {
      html += '<div class="qc-actions"><button class="btn primary" data-submit data-qid="' + q.qid + '" ' + (a.chosen === undefined ? 'disabled' : '') + '>提交答案</button></div>';
    }
    html += '</div>';
    return html;
  }

  function renderNav(d, idx) {
    return '<div class="qnav">' +
      '<button class="btn ghost" data-prev ' + (idx === 0 ? 'disabled' : '') + '>← 上一题</button>' +
      '<div class="dots">' + d.questions.map(function (q, i) {
        var a = d.answers[q.qid] || {};
        var cls = 'dot';
        if (i === idx) cls += ' cur';
        if (a.submitted === true) cls += (a.correct ? ' ok' : ' no');
        return '<button class="' + cls + '" data-go="' + i + '">' + (i + 1) + '</button>';
      }).join('') + '</div>' +
      '<button class="btn ghost" data-next ' + (idx === d.questions.length - 1 ? 'disabled' : '') + '>下一题 →</button>' +
      '</div>';
  }

  /* ---------- 专项练习 ---------- */
  var CUSTOM_DIFFS = {
    mixed: { name: '混合', color: '#6366f1', desc: '三种难度随机出现' },
    easy: QB.difficulties.easy, medium: QB.difficulties.medium, hard: QB.difficulties.hard
  };

  function renderCustom() {
    var c = state.custom;
    if (!c || !c.set) { renderCustomConfig(); return; }
    var set = c.set;
    var s = c.settings;
    var answered = Object.keys(set.answers).filter(function (qid) {
      return set.answers[qid].submitted === true;
    }).length;
    var allDone = answered >= set.questions.length;

    var typeLabels = s.typeIds.length ? s.typeIds.map(function (t) { return QB.types[t].short; }).join('、') : '全部题型';
    var diffLabel = CUSTOM_DIFFS[s.difficulty] ? CUSTOM_DIFFS[s.difficulty].name : '混合';

    var html = '<div class="daily-meta card">';
    html += '<div class="dm-row1"><span class="dm-date">🎯 专项练习</span>' +
      '<button class="btn small ghost" data-crestart>重新选题</button></div>';
    html += '<div class="dm-row2"><span class="dm-prog">已做 <b>' + answered + '</b>/' + set.questions.length + '</span>' +
      '<div class="pbar"><div class="pbar-in" style="width:' + Math.round(answered / set.questions.length * 100) + '%"></div></div></div>';
    html += '<div class="dm-row3"><span class="dm-plan">题型与难度</span><div class="dm-chips">' +
      '<span class="chip" style="--tc:#6366f1">' + esc(typeLabels) + '</span>' +
      '<span class="chip" style="--tc:' + CUSTOM_DIFFS[s.difficulty].color + '">' + esc(diffLabel) + '</span></div></div>';
    html += '</div>';

    if (allDone) {
      html += renderSummary(set, {
        title: '🎯 专项练习完成',
        extraBtns: '<button class="btn ghost" data-crestart>再来一套</button>'
      });
    } else {
      html += renderQuestionCard(set, customIdx);
      html += renderNav(set, customIdx);
    }
    $('#app').innerHTML = html;
    renderMathIn($('#app'));
  }

  function renderCustomConfig() {
    var s = state.custom.settings;

    var typesHtml = Object.keys(QB.types).map(function (t) {
      var m = QB.types[t];
      var on = s.typeIds.indexOf(t) >= 0;
      return '<button class="ctype' + (on ? ' on' : '') + '" data-ctype="' + t + '" style="--tc:' + m.color + '">' +
        '<span class="ct-icon">' + esc(m.icon) + '</span>' +
        '<span class="ct-name">' + esc(m.name) + '</span>' +
        '<span class="ct-check">' + (on ? '✓' : '') + '</span></button>';
    }).join('');

    var diffsHtml = Object.keys(CUSTOM_DIFFS).map(function (dd) {
      var m = CUSTOM_DIFFS[dd];
      return '<button class="seg' + (s.difficulty === dd ? ' active' : '') + '" data-cdiff="' + dd + '" style="--tc:' + m.color + '" title="' + esc(m.desc) + '">' + esc(m.name) + '</button>';
    }).join('');

    var countsHtml = [5, 10, 15, 20].map(function (n) {
      return '<button class="seg' + (s.count === n ? ' active' : '') + '" data-ccount="' + n + '" style="--tc:#6366f1">' + n + ' 题</button>';
    }).join('');

    var html = '<div class="cfg card">';
    html += '<div class="cfg-title">🎯 专项练习</div>';
    html += '<div class="cfg-desc">勾选想练的章节（可多选），选好难度和题量后开始。专项练习独立于每日 10 题，标记的掌握状态同样影响复习计划与错题本。</div>';

    html += '<div class="cfg-block"><div class="cfg-label">📖 选择题型（已选 ' + s.typeIds.length + '/7）</div>';
    html += '<div class="ctype-grid">' + typesHtml + '</div></div>';

    html += '<div class="cfg-block"><div class="cfg-label">🎚️ 题目难度</div><div class="segs">' + diffsHtml + '</div></div>';
    html += '<div class="cfg-block"><div class="cfg-label">🔢 题量</div><div class="segs">' + countsHtml + '</div></div>';

    html += '<button class="btn cfg-start" data-cstart ' + (s.typeIds.length ? '' : 'disabled') + '>开始练习（' + s.count + ' 题）</button>';
    html += '</div>';
    $('#app').innerHTML = html;
  }

  /* ---------- 错题本 ---------- */
  function renderWrong() {
    var items = state.wrongbook.slice().reverse();
    var filters = ['all', 'not_mastered', 'wobbly', 'wrong'].map(function (f) {
      var name = { all: '全部', not_mastered: '未掌握', wobbly: '不熟练', wrong: '答错' }[f];
      return '<button class="seg' + (wrongFilter === f ? ' active' : '') + '" data-wf="' + f + '">' + name + '</button>';
    }).join('');

    var html = '<div class="wrong-head card"><div class="wh-title">📕 错题本</div>' +
      '<div class="wh-desc">这里收集你标记为 <b>不熟练</b>、<b>未掌握</b> 的题，以及<b>答错</b>的题。标记「已掌握」后会自动移出。</div>' +
      '<div class="segs">' + filters + '</div></div>';

    var shown = items.filter(function (e) { return wrongFilter === 'all' || e.mark === wrongFilter; });
    if (!shown.length) {
      html += '<div class="empty card">🎈 还没有错题。答错或标记「不熟练/未掌握」的题会自动出现在这里。</div>';
    } else {
      html += shown.map(function (e) {
        var m = QB.types[e.typeId];
        var isOpen = expanded[e.id];
        return '<div class="wcard card">' +
          '<div class="wc-head">' + typeBadge(e.typeId) + diffBadge(e.difficulty) + markBadge(e.mark) +
          '<span class="wc-date">' + e.date + '</span></div>' +
          '<div class="wc-q">' + mathHtml(e.question, true) + '</div>' +
          '<div class="wc-a">答案：' + mathHtml(e.answer, true) + '</div>' +
          (isOpen ?
            '<div class="wc-sol"><div class="sol-idea">' + mathHtml(e.idea, false) + '</div>' +
            '<ol class="sol-steps">' + e.steps.map(function (st) {
              return '<li><div class="sol-m">' + mathHtml(st.m, true) + '</div><div class="sol-t">' + mathHtml(st.t, false) + '</div></li>';
            }).join('') + '</ol>' +
            '<div class="sol-pit">⚠️ ' + mathHtml(e.pitfall, false) + '</div></div>' : '') +
          '<div class="wc-btns">' +
          '<button class="btn small" data-wtoggle="' + e.id + '">' + (isOpen ? '收起解析' : '看解析') + '</button>' +
          '<button class="btn small ok" data-wmaster="' + e.id + '">✓ 已掌握并移除</button>' +
          '<button class="btn small ghost" data-wdel="' + e.id + '">移除</button>' +
          '</div></div>';
      }).join('');
    }
    $('#app').innerHTML = html;
    renderMathIn($('#app'));
  }

  /* ---------- 学习记录 ---------- */
  function renderRecords() {
    var hist = state.history.slice().reverse();
    var total = hist.length;
    var correct = hist.filter(function (h) { return h.correct; }).length;
    var pct = total ? Math.round(correct / total * 100) : 0;

    // 连续学习天数
    var days = {};
    state.history.forEach(function (h) { days[h.date] = 1; });
    var ds = Object.keys(days).sort().reverse();
    var streak = 0;
    var cur = today;
    if (!days[cur]) { // 今天没做但昨天做了，从昨天数
      var y = new Date(); y.setDate(y.getDate() - 1);
      if (days[Store.todayStr(y)]) cur = Store.todayStr(y);
    }
    while (days[cur]) { streak++; var dd = S.parseDate(cur); dd.setDate(dd.getDate() - 1); cur = Store.todayStr(dd); }

    var todayCount = state.history.filter(function (h) { return h.date === today; }).length;

    var html = '<div class="stats card">' +
      '<div class="st"><b>' + total + '</b><span>累计做题</span></div>' +
      '<div class="st"><b>' + pct + '%</b><span>正确率</span></div>' +
      '<div class="st"><b>' + streak + '</b><span>连续学习天数</span></div>' +
      '<div class="st"><b>' + todayCount + '</b><span>今日已做</span></div>' +
      '</div>';

    // 各题型统计
    html += '<div class="type-stats card"><div class="ts-title">各章节掌握情况</div>';
    Object.keys(QB.types).forEach(function (t) {
      var m = QB.types[t];
      var hs = state.history.filter(function (h) { return h.typeId === t; });
      var c = hs.filter(function (h) { return h.correct; }).length;
      var tp = hs.length ? Math.round(c / hs.length * 100) : null;
      var ts = state.types[t];
      var nd = S.nextDue(ts, today);
      html += '<div class="ts-row">' +
        '<span class="ts-name" style="--tc:' + m.color + '">' + esc(m.icon) + ' ' + esc(m.name) + '</span>' +
        (ts && ts.status ? '<span class="tag ' + MARK_META[ts.status].cls + '">' + esc(MARK_META[ts.status].name) + '</span>' : '<span class="tag tag-none">未标记</span>') +
        '<span class="ts-cnt">' + (tp === null ? '未练过' : '做 ' + hs.length + ' 题 · 正确率 ' + tp + '%') + '</span>' +
        '<span class="ts-next">' + (nd.date ? nd.date : '—') + '</span>' +
        '</div>';
    });
    html += '</div>';

    // 历史列表
    html += '<div class="hist card"><div class="ts-title">做题记录（最近 ' + Math.min(hist.length, 50) + ' 条）</div>';
    if (!hist.length) {
      html += '<div class="empty-in">还没有记录，去完成今天的 10 题吧！</div>';
    } else {
      html += '<div class="hist-list">' + hist.slice(0, 50).map(function (h) {
        return '<div class="hist-item">' +
          '<span class="h-date">' + h.date + '</span>' +
          '<span class="h-src">' + (h.source === 'custom' ? '专项' : '每日') + '</span>' +
          '<span class="h-type" style="--tc:' + QB.types[h.typeId].color + '">' + esc(QB.types[h.typeId].short) + '</span>' +
          '<span class="h-diff" style="--tc:' + QB.difficulties[h.difficulty].color + '">' + esc(QB.difficulties[h.difficulty].name) + '</span>' +
          '<span class="h-q">' + mathHtml(h.question, false) + '</span>' +
          '<span class="h-res ' + (h.correct ? 'ok' : 'no') + '">' + (h.correct ? '✓' : '✗') + '</span>' +
          (h.mark ? markBadge(h.mark) : '') +
          '</div>';
      }).join('') + '</div>';
    }
    html += '</div>';

    $('#app').innerHTML = html;
    renderMathIn($('#app'));
  }

  /* ---------- 掌握度 ---------- */
  function renderMastery() {
    var html = '<div class="mas-head card"><div class="ts-title">🧭 掌握度总览</div>' +
      '<div class="mas-rules"><b>复习节奏：</b>' +
      '<span class="tag mark-mastered">已掌握 → 7 天后出类似题</span>' +
      '<span class="tag mark-wobbly">不熟练 → 2 天后出类似题</span>' +
      '<span class="tag mark-not">未掌握 → 连续 2 天出类似题</span>' +
      '</div></div>';

    html += '<div class="mas-grid">' + Object.keys(QB.types).map(function (t) {
      var m = QB.types[t];
      var hs = state.history.filter(function (h) { return h.typeId === t; });
      var c = hs.filter(function (h) { return h.correct; }).length;
      var tp = hs.length ? Math.round(c / hs.length * 100) : null;
      var ts = state.types[t];
      var nd = S.nextDue(ts, today);
      var nb = state.wrongbook.filter(function (e) { return e.typeId === t; }).length;
      var pctW = hs.length ? Math.min(100, Math.round(c / Math.max(hs.length, 1) * 100)) : 0;
      return '<div class="mas-card card" style="--tc:' + m.color + '">' +
        '<div class="mc-top"><span class="mc-icon">' + esc(m.icon) + '</span>' +
        '<div class="mc-info"><div class="mc-name">' + esc(m.name) + '</div>' +
        '<div class="mc-sub">' + (ts && ts.status ? esc(MARK_META[ts.status].name) : '未标记') + '</div></div>' +
        '<span class="mc-acc">' + (tp === null ? '—' : tp + '%') + '</span></div>' +
        '<div class="pbar"><div class="pbar-in" style="width:' + pctW + '%"></div></div>' +
        '<div class="mc-foot"><span>已做 ' + hs.length + ' 题</span><span>错题本 ' + nb + '</span></div>' +
        '<div class="mc-next">下次复习：<b>' + (nd.date || '待安排') + '</b><i>' + esc(nd.reason) + '</i></div>' +
        '</div>';
    }).join('') + '</div>';

    html += '<div class="mas-tip card">💡 提示：在「今日练习」或「专项练习」的每道题上方标记状态，系统会自动按节奏安排同类题。标记「已掌握」的题 7 天后回来，帮你对抗遗忘曲线。</div>';
    $('#app').innerHTML = html;
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    // 主题切换
    $('#themeBtn').addEventListener('click', function () {
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      save();
      renderShell();
    });

    // Tab 切换
    $('#tabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-view]');
      if (btn) switchView(btn.getAttribute('data-view'));
    });

    // 全局事件委托
    $('#app').addEventListener('click', function (e) {
      var t = e.target;

      // 难度切换（今日练习）
      var seg = t.closest('[data-diff]');
      if (seg) {
        state.settings.difficulty = seg.getAttribute('data-diff');
        save();
        curIdx = 0;
        renderDaily();
        return;
      }

      // 专项练习：勾选题型
      var cty = t.closest('[data-ctype]');
      if (cty) {
        var tid = cty.getAttribute('data-ctype');
        var cs = state.custom.settings;
        var ci = cs.typeIds.indexOf(tid);
        if (ci >= 0) cs.typeIds.splice(ci, 1); else cs.typeIds.push(tid);
        save();
        renderCustom();
        return;
      }
      // 专项练习：难度
      var cdf = t.closest('[data-cdiff]');
      if (cdf) {
        state.custom.settings.difficulty = cdf.getAttribute('data-cdiff');
        save();
        renderCustom();
        return;
      }
      // 专项练习：题量
      var cct = t.closest('[data-ccount]');
      if (cct) {
        state.custom.settings.count = parseInt(cct.getAttribute('data-ccount'), 10);
        save();
        renderCustom();
        return;
      }
      // 专项练习：开始
      var cst = t.closest('[data-cstart]');
      if (cst && !cst.disabled) {
        var cs2 = state.custom.settings;
        if (cs2.typeIds.length) {
          var built = S.buildCustom({ typeIds: cs2.typeIds, difficulty: cs2.difficulty, count: cs2.count });
          state.custom.set = { date: today, questions: built.questions, answers: {} };
          customIdx = 0;
          save();
          renderCustom();
        }
        return;
      }
      // 专项练习：重新选题
      var crs = t.closest('[data-crestart]');
      if (crs) {
        state.custom.set = null;
        customIdx = 0;
        save();
        renderCustom();
        return;
      }

      // 选择选项
      var opt = t.closest('[data-pick]');
      if (opt && !opt.disabled) {
        var qid = opt.getAttribute('data-qid');
        var d = curContainer();
        var q = d.questions.filter(function (x) { return x.qid === qid; })[0];
        var a = d.answers[qid] || (d.answers[qid] = {});
        a.chosen = parseInt(opt.getAttribute('data-pick'), 10);
        save();
        renderCurrentPractice();
        return;
      }

      // 提交
      var sub = t.closest('[data-submit]');
      if (sub && !sub.disabled) {
        var qid2 = sub.getAttribute('data-qid');
        var d2 = curContainer();
        var q2 = d2.questions.filter(function (x) { return x.qid === qid2; })[0];
        var a2 = d2.answers[qid2] || {};
        if (a2.chosen !== undefined) {
          submitAnswer(d2, q2, a2.chosen, curSource());
          renderCurrentPractice();
        }
        return;
      }

      // 状态标记（已掌握/不熟练/未掌握）
      var mk = t.closest('[data-mark]');
      if (mk) {
        var qid3 = mk.getAttribute('data-qid');
        var d3 = curContainer();
        var q3 = d3.questions.filter(function (x) { return x.qid === qid3; })[0];
        setMark(d3, q3, mk.getAttribute('data-mark'));
        renderCurrentPractice();
        return;
      }

      // 上一题/下一题/跳转
      if (t.closest('[data-prev]')) { if (curIndex() > 0) { setCurIndex(curIndex() - 1); renderCurrentPractice(); } return; }
      if (t.closest('[data-next]')) {
        var d4 = curContainer();
        if (curIndex() < d4.questions.length - 1) { setCurIndex(curIndex() + 1); renderCurrentPractice(); }
        return;
      }
      var go = t.closest('[data-go]');
      if (go) { setCurIndex(parseInt(go.getAttribute('data-go'), 10)); renderCurrentPractice(); return; }

      // 视图跳转按钮
      var vgo = t.closest('[data-view-go]');
      if (vgo) { switchView(vgo.getAttribute('data-view-go')); return; }

      // 错题本操作
      var wf = t.closest('[data-wf]');
      if (wf) { wrongFilter = wf.getAttribute('data-wf'); renderWrong(); return; }
      var wt = t.closest('[data-wtoggle]');
      if (wt) {
        var id = wt.getAttribute('data-wtoggle');
        expanded[id] = !expanded[id];
        renderWrong();
        return;
      }
      var wm = t.closest('[data-wmaster]');
      if (wm) {
        var id2 = wm.getAttribute('data-wmaster');
        var e2 = findWrong(id2);
        if (e2) {
          state.types[e2.typeId] = S.applyMark(state.types[e2.typeId], 'mastered', today);
          removeWrong(id2);
          save();
          renderWrong();
        }
        return;
      }
      var wd = t.closest('[data-wdel]');
      if (wd) {
        removeWrong(wd.getAttribute('data-wdel'));
        save();
        renderWrong();
        return;
      }
    });

    // 重置
    $('#resetBtn').addEventListener('click', function () {
      if (window.confirm('确定要清空所有做题记录、错题本和掌握度状态吗？此操作不可恢复。')) {
        Store.reset();
        state = Store.load();
        view = 'daily';
        curIdx = 0;
        render();
      }
    });
  }

  /* ---------- 渲染入口 ---------- */
  function render() {
    renderShell();
    if (view === 'daily') renderDaily();
    else if (view === 'custom') renderCustom();
    else if (view === 'wrong') renderWrong();
    else if (view === 'records') renderRecords();
    else renderMastery();
  }

  function init() {
    bindEvents();
    render();
    // 跨天自动刷新
    setInterval(function () {
      if (Store.todayStr() !== today) window.location.reload();
    }, 30000);
  }

  window.__initApp = init;
  window.__rerenderAll = function () { renderMathIn(document); };
  window.__appDebug = { state: function () { return state; }, ensureDaily: ensureDaily, today: today };
})(typeof window !== 'undefined' ? window : globalThis);
