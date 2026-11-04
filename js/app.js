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
  var redoIdx = 0;                // 错题重做当前第几题
  var wrongFilter = 'all';        // 错题本筛选
  var expanded = {};              // 错题本展开状态
  var redoSelect = {};            // 错题本勾选待重做的题 {entryId: true}

  var MARK_META = {
    mastered:     { name: '已掌握', icon: '✓', cls: 'mark-mastered', hint: '7 天后出类似题目', pri: 1 },
    wobbly:       { name: '不熟练', icon: '△', cls: 'mark-wobbly',   hint: '1 天后出类似题目', pri: 2 },
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

  // 题干里 $...$ 公式的段数
  function mathSegCount(s) {
    var parts = String(s == null ? '' : s).split('$');
    return Math.floor(parts.length / 2);
  }
  // 题干排版：
  //   只有一段公式（或纯公式）→ 居中放大（适合"$\int ...$"这类）
  //   多段公式夹着文字   → 按句子内联排版、自动换行（适合"利用 $...$，估算 $...$"）
  function questionBlock(text) {
    var inline = mathSegCount(text) >= 2;
    var inner = mathHtml(text, !inline).replace(/\n/g, '<br>');
    return '<div class="qc-question' + (inline ? ' q-inline' : '') + '">' + inner + '</div>';
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

  // 题型形式（选择题 / 解答题 / 证明题）
  var FORM_META = {
    choice: { name: '选择题', color: '#6366f1' },
    solution: { name: '解答题', color: '#0ea5e9' },
    proof: { name: '证明题', color: '#8b5cf6' }
  };
  function effForms(arr) {
    var f = (arr || []).filter(function (x) { return FORM_META[x]; });
    return f.length ? f : ['choice', 'solution', 'proof'];
  }

  function track() { return state.settings.track === 'gaokao' ? 'gaokao' : 'gaoshu'; }
  function isGk() { return track() === 'gaokao'; }
  function dailyKey() { return isGk() ? today + '|gk' : today; }
  function trackTypes() {
    return isGk() ? QB.typesOfTrack('gaokao') : QB.typesOfSemester(state.settings.semester);
  }

  function effDailyTypes() {
    var sel = (state.settings.dailyTypes || []).filter(function (t) {
      return QB.types[t] && (isGk() ? QB.types[t].track === 'gaokao' : QB.types[t].track !== 'gaokao');
    });
    if (sel.length) return sel;
    return trackTypes();
  }

  function ensureDaily() {
    var key = dailyKey();
    var d = state.daily[key];
    var effTypes = effDailyTypes();
    var sel = effTypes.slice().sort().join(',');
    var curSel = d && d.typeIds ? d.typeIds : '';
    var formsSel = isGk() ? 'gk-plan' : effForms(state.settings.dailyForms).slice().sort().join(',');
    var curForms = d && d.forms ? d.forms : '';
    var sem = isGk() ? 0 : state.settings.semester;
    if (!d || d.difficulty !== state.settings.difficulty || curSel !== sel || curForms !== formsSel || d.semester !== sem || d.track !== track()) {
      // 举一反三：避开每个题型上一次做过的原题（同模板同参数）
      var avoidMap = {};
      Object.keys(state.types).forEach(function (t) {
        if (state.types[t] && state.types[t].lastSig) avoidMap[t] = [state.types[t].lastSig];
      });
      if (isGk()) {
        d = S.buildGaokaoDaily({
          typesState: state.types, today: today,
          difficulty: state.settings.difficulty, avoidMap: avoidMap
        });
      } else {
        d = S.buildDaily({
          typesState: state.types, today: today,
          difficulty: state.settings.difficulty, count: 10, avoidMap: avoidMap,
          typeIds: effTypes,
          forms: effForms(state.settings.dailyForms)
        });
      }
      d.difficulty = state.settings.difficulty; // 关键：给套装盖章难度，避免每次误判重建
      d.typeIds = sel;                          // 记录组卷所用题型，用于判断是否需要重建
      d.forms = formsSel;                       // 记录组卷所用形式
      d.semester = sem;                         // 记录组卷所用学期
      d.track = track();
      d.answers = {};
      state.daily[key] = d;
      Object.keys(d.used).forEach(function (t) {
        state.types[t] = S.afterShow(state.types[t], today);
      });
      Object.keys(d.lastSigs).forEach(function (t) {
        state.types[t] = state.types[t] || {};
        state.types[t].lastSig = d.lastSigs[t];
      });
      save();
    }
    if (!d.answers) d.answers = {};
    return d;
  }

  // 是否处于错题重做会话
  function inRedo() {
    return view === 'wrong' && state.redo && state.redo.questions && state.redo.questions.length > 0;
  }

  // 当前活动套题容器：错题重做会话 / 专项套 / 今日套
  function curContainer() {
    if (inRedo()) return state.redo;
    if (view === 'custom' && state.custom && state.custom.set) return state.custom.set;
    return ensureDaily();
  }
  function curIndex() { return inRedo() ? redoIdx : (view === 'custom' ? customIdx : curIdx); }
  function setCurIndex(i) {
    if (inRedo()) redoIdx = i;
    else if (view === 'custom') customIdx = i;
    else curIdx = i;
  }
  function curSource() { return inRedo() ? 'redo' : (view === 'custom' ? 'custom' : 'daily'); }
  function renderCurrentPractice() {
    if (inRedo()) renderRedoPractice();
    else if (view === 'custom') renderCustom();
    else renderDaily();
  }

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
      // 补记题目签名（老数据没有），供"举一反三"重做使用
      if (!e.sig && q.sig) e.sig = q.sig;
      if (!e.tpl && q.tpl) e.tpl = q.tpl;
      return;
    }
    state.wrongbook.push({
      id: q.qid, date: today, typeId: q.typeId, difficulty: q.difficulty,
      form: q.form || 'choice',
      question: q.question, options: q.options, answerIndex: q.answerIndex,
      answer: q.answer, idea: q.idea, steps: q.steps, pitfall: q.pitfall,
      mark: mark, sig: q.sig, tpl: q.tpl
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
      // 错题重做：做对的题在错题本中打"已订正"标记（保留在错题本里）
      if (source === 'redo' && container.sourceIds) {
        var qi = container.questions.indexOf(q);
        var srcId = container.sourceIds[qi];
        var se = findWrong(srcId);
        if (se) se.corrected = true;
      }
    } else {
      upsertWrong(q, a.mark || 'wrong');
    }
    save();
  }

  /* ---------- 填空题：判分 ---------- */
  function normAns(s) {
    return String(s == null ? '' : s).trim()
      .replace(/\s+/g, '')
      .replace(/[−–—]/g, '-')
      .replace(/（/g, '(').replace(/）/g, ')')
      .replace(/，/g, ',')
      .replace(/\\infty/g, '∞')
      .replace(/π/g, 'pi');
  }
  function numOf(s) {
    s = normAns(s).replace(/\$/g, '');
    if (/^[-+]?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    var m = s.match(/^([-+]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (m) return parseFloat(m[1]) / parseFloat(m[2]);
    return null;
  }
  function checkFill(q, raw) {
    var guess = normAns(raw);
    if (!guess) return null;
    var targets = [q.answer].concat(q.alt || []);
    for (var i = 0; i < targets.length; i++) {
      var t = normAns(targets[i]).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\$/g, '');
      if (guess === t) return true;
      var gn = numOf(guess), tn = numOf(t);
      if (gn !== null && tn !== null && Math.abs(gn - tn) < 1e-6) return true;
    }
    return false;
  }
  function submitFill(container, q, raw, source) {
    var a = container.answers[q.qid] || (container.answers[q.qid] = {});
    a.filled = String(raw || '').trim();
    a.submitted = true;
    a.correct = checkFill(q, a.filled) === true;
    var h = {
      ts: Date.now(), date: today, source: source || 'daily', kind: 'fill',
      typeId: q.typeId, difficulty: q.difficulty, tpl: q.tpl, qid: q.qid,
      question: q.question, answer: q.answer, chosen: a.filled, correct: a.correct, mark: a.mark || ''
    };
    var found = false;
    for (var i = state.history.length - 1; i >= 0; i--) {
      if (state.history[i].qid === q.qid) { state.history[i] = h; found = true; break; }
    }
    if (!found) state.history.push(h);
    if (a.correct) {
      var e = findWrong(q.qid);
      if (e && e.mark === 'wrong') removeWrong(q.qid);
      if (source === 'redo' && container.sourceIds) {
        var qi = container.questions.indexOf(q);
        var se = findWrong(container.sourceIds[qi]);
        if (se) se.corrected = true;
      }
    } else {
      upsertWrong(q, a.mark || 'wrong');
    }
    save();
  }

  // 解答题/证明题：点击「已完成」→ 记录 + 标记已查看答案（不参与正确率统计）
  function markSolved(container, q, source) {
    var a = container.answers[q.qid] || (container.answers[q.qid] = {});
    a.submitted = true;
    a.revealed = true;
    a.correct = null;
    var h = {
      ts: Date.now(), date: today, source: source || 'daily', kind: 'solve',
      typeId: q.typeId, difficulty: q.difficulty,
      tpl: q.tpl, qid: q.qid, question: q.question, answer: q.answer,
      chosen: null, correct: null, mark: a.mark || ''
    };
    var found = false;
    for (var i = state.history.length - 1; i >= 0; i--) {
      if (state.history[i].qid === q.qid) { state.history[i] = h; found = true; break; }
    }
    if (!found) state.history.push(h);
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
    $$('#trackSeg [data-track]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-track') === track());
    });
    var activeTab = $('#tabs .tab.active');
    if (activeTab) { /* 保持滚动位置 */ }
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

    var dueTypes = effDailyTypes();
    var dueList2 = (d.due || []).filter(function (u) { return dueTypes.indexOf(u.typeId) >= 0; });
    var dueHtml = dueList2.length ? dueList2.map(function (u) {
      var m = QB.types[u.typeId];
      return '<span class="chip" style="--tc:' + m.color + '">' + esc(m.short) + '<i>' + esc(u.reason) + '</i></span>';
    }).join('') : '<span class="chip">全部题型首次接触</span>';

    var diffs = ['easy', 'medium', 'hard'].map(function (dd) {
      var m = QB.difficulties[dd];
      return '<button class="seg' + (state.settings.difficulty === dd ? ' active' : '') + '" data-diff="' + dd + '" style="--tc:' + m.color + '" title="' + esc(m.desc) + '">' + esc(m.name) + '</button>';
    }).join('');

    var sel = state.settings.dailyTypes || [];
    var semTypes = trackTypes();
    var typeChips = semTypes.map(function (t) {
      var m = QB.types[t];
      var on = sel.indexOf(t) >= 0;
      return '<button class="seg' + (on ? ' active' : '') + '" data-dtype="' + t + '" style="--tc:' + m.color + '" title="' + esc(m.name) + '">' + esc(m.short) + '</button>';
    }).join('');

    var semChips = ['1', '2'].map(function (s) {
      var m = QB.semesters[s];
      var on = String(state.settings.semester) === s;
      return '<button class="seg' + (on ? ' active' : '') + '" data-sem="' + s + '" style="--tc:#6366f1" title="' + esc(m.desc) + '">' + esc(m.name) + '</button>';
    }).join('');

    var forms = effForms(state.settings.dailyForms);
    var formChips = ['choice', 'solution', 'proof'].map(function (f) {
      var m = FORM_META[f];
      var on = forms.indexOf(f) >= 0;
      return '<button class="seg' + (on ? ' active' : '') + '" data-dform="' + f + '" style="--tc:' + m.color + '">' + m.name + '</button>';
    }).join('');

    var html = '';
    html += '<div class="daily-meta card">';
    html += '<div class="dm-row1"><span class="dm-date">📅 ' + today + '</span><div class="dm-diff">难度：<span class="segs">' + diffs + '</span></div></div>';
    html += '<div class="dm-row2"><span class="dm-prog">今日进度 <b>' + answered + '</b>/' + d.questions.length + '</span><div class="pbar"><div class="pbar-in" style="width:' + Math.round(answered / d.questions.length * 100) + '%"></div></div></div>';
    if (isGk()) {
      html += '<div class="dm-row3"><span class="dm-plan">卷面题型</span><div class="dm-chips">' + typeChips +
        '<button class="seg' + (sel.length === 0 ? ' active' : '') + '" data-dtype="" style="--tc:var(--muted)">全部</button></div></div>';
      html += '<div class="dm-row3"><span class="dm-plan">今日复习计划</span><div class="dm-chips">' + dueHtml + '</div></div>';
    } else {
      html += '<div class="dm-row3"><span class="dm-plan">学期</span><div class="dm-chips">' + semChips + '</div></div>';
      html += '<div class="dm-row3"><span class="dm-plan">自选题型</span><div class="dm-chips">' + typeChips +
        '<button class="seg' + (sel.length === 0 ? ' active' : '') + '" data-dtype="" style="--tc:var(--muted)">全部</button></div></div>';
      html += '<div class="dm-row3"><span class="dm-plan">题型形式</span><div class="dm-chips">' + formChips + '</div></div>';
      html += '<div class="dm-row3"><span class="dm-plan">今日复习计划</span><div class="dm-chips">' + dueHtml + '</div></div>';
    }
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
    var choiceTotal = 0;
    var fillTotal = 0;
    var fillScore = 0;
    var solveTotal = 0;
    var solveDone = 0;
    var marks = { mastered: 0, wobbly: 0, not_mastered: 0 };
    d.questions.forEach(function (q) {
      var a = d.answers[q.qid] || {};
      if (q.kind === 'solve') {
        solveTotal++;
        if (a.submitted === true) solveDone++;
      } else if (q.kind === 'fill') {
        fillTotal++;
        if (a.correct) { score++; fillScore++; }
      } else {
        choiceTotal++;
        if (a.correct) score++;
      }
      if (a.mark && marks[a.mark] !== undefined) marks[a.mark]++;
    });
    var gradeTotal = choiceTotal + fillTotal;
    var pct = gradeTotal ? Math.round(score / gradeTotal * 100) : 0;
    var msg = gradeTotal === 0
      ? '解答/证明题已完成，记得对照解析检查每步推理 📘'
      : pct === 100 ? '全对！太强了，明天的题会更有挑战 🌟'
      : pct >= 80 ? '很棒！错题已进错题本，记得看一眼解析 📘'
      : pct >= 60 ? '不错！把"未掌握"的题明天再来一轮 💪'
      : '别灰心！把每题解析看懂，明天同类题还会再出现 ✊';
    var html = '<div class="summary card">';
    html += '<h2>' + (opts.title || '练习完成') + '</h2>';
    if (gradeTotal) {
      var parts = [];
      if (choiceTotal) parts.push(choiceTotal + ' 道选择题' + (fillTotal ? '' : ''));
      if (fillTotal) parts.push(fillTotal + ' 道填空题');
      html += '<div class="score"><b>' + score + '</b><span>/' + gradeTotal + ' 客观题正确率 ' + pct + '%（' + parts.join(' + ') + '）</span></div>';
    }
    if (solveTotal) {
      html += '<div class="sum-solve">📝 解答/证明题：已完成 <b>' + solveDone + '</b>/' + solveTotal + '</div>';
    }
    html += '<p class="sum-msg">' + msg + '</p>';
    html += '<div class="sum-marks">' +
      '<span class="tag mark-mastered">✓ 已掌握 ×' + marks.mastered + ' <i>7 天后见</i></span>' +
      '<span class="tag mark-wobbly">△ 不熟练 ×' + marks.wobbly + ' <i>1 天后见</i></span>' +
      '<span class="tag mark-not">✗ 未掌握 ×' + marks.not_mastered + ' <i>明天继续</i></span>' +
      '</div>';
    html += '<div class="sum-list">' + d.questions.map(function (q) {
      var a = d.answers[q.qid] || {};
      var isSolve = q.kind === 'solve';
      var cls = isSolve ? (a.submitted ? ' done' : '') : (a.correct ? ' ok' : ' no');
      var icon = isSolve ? (a.submitted ? '📝' : '·') : (a.correct ? '✓' : '✗');
      return '<div class="sum-item' + cls + '" data-go="' + d.questions.indexOf(q) + '">' +
        '<span class="sum-no">' + (d.questions.indexOf(q) + 1) + '</span>' +
        '<span class="sum-type">' + esc(QB.types[q.typeId].short) + '</span>' +
        '<span class="sum-icon">' + icon + '</span>' +
        (a.mark ? '<span class="sum-mark">' + esc(MARK_META[a.mark].name) + '</span>' : '') +
        '</div>';
    }).join('') + '</div>';
    html += '<div class="sum-btns">' + (opts.extraBtns || '') + '<button class="btn" data-view-go="wrong">打开错题本</button><button class="btn ghost" data-view-go="records">查看学习记录</button></div>';
    html += '</div>';
    return html;
  }

  // 选择题的解析块（思路/分步/易错点）
  function solutionBlock(q) {
    var html = '<div class="qc-solution">';
    html += '<div class="sol-title">💡 解题思路与过程</div>';
    html += '<div class="sol-idea">' + mathHtml(q.idea, false) + '</div>';
    html += '<ol class="sol-steps">' + q.steps.map(function (st) {
      return '<li><div class="sol-m">' + mathHtml(st.m, true) + '</div><div class="sol-t">' + mathHtml(st.t, false) + '</div></li>';
    }).join('') + '</ol>';
    html += '<div class="sol-pit">⚠️ 易错点：' + mathHtml(q.pitfall, false) + '</div>';
    html += '</div>';
    return html;
  }

  function renderQuestionCard(d, idx) {
    var q = d.questions[idx];
    var a = d.answers[q.qid] || {};
    var answered = a.submitted === true;   // 只有点过"提交答案"才算已作答
    var isSolve = q.kind === 'solve';      // 解答题/证明题

    // 三个状态标记（放在"提交答案"按钮下面）
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
      (q.kind === 'fill' ? '<span class="chip chip-fill">填空题</span>' : '') +
      (isSolve ? '<span class="chip chip-solve">' + (q.form === 'proof' ? '证明题' : '解答题') + '</span>' : '') +
      (q.tech ? '<span class="chip chip-tech" title="本题考察的知识点">' + esc(q.tech) + '</span>' : '') +
      '<span class="chip chip-reason">' + esc(q.dueReason) + '</span></div>';
    html += questionBlock(q.question);

    if (isSolve) {
      // 解答题/证明题：不给选项，只给「已完成」按钮
      if (answered) {
        html += '<div class="qc-feedback fb-solve">📖 已完成 · 参考答案如下</div>';
        html += '<div class="qc-solve-answer"><div class="sa-label">参考答案</div><div class="sa-body">' + mathHtml(q.answer, false) + '</div></div>';
        html += solutionBlock(q);
      } else {
        html += '<div class="solve-hint">📝 这是一道解答/证明题：请先在纸上独立完成，再点下面的按钮对照答案。</div>';
        html += '<div class="qc-actions"><button class="btn primary" data-solvedone data-qid="' + q.qid + '">✓ 已完成（查看答案与解析）</button></div>';
      }
      html += marksHtml;
      html += '</div>';
      return html;
    }

    if (q.kind === 'fill') {
      // 填空题：输入答案后判对错
      if (answered) {
        var ok = a.correct === true;
        html += '<div class="qc-fill-ans"><span class="fa-label">你的答案</span><span class="fa-val">' + esc(a.filled || '') + '</span></div>';
        html += '<div class="qc-feedback ' + (ok ? 'fb-ok' : 'fb-no') + '">';
        html += ok ? '✅ 回答正确！' : '❌ 回答错误';
        html += '<div class="fb-answer">正确答案：' + mathHtml(q.answer, true) + '</div>';
        html += '</div>';
        html += solutionBlock(q);
      } else {
        html += '<div class="qc-fill"><input id="fillInput" class="fill-input" type="text" inputmode="text" autocomplete="off" placeholder="在这里输入你的答案" value="' + esc(a.filled || '') + '">' +
          '<button class="btn primary" data-fillsubmit data-qid="' + q.qid + '">提交答案</button></div>';
        html += '<div class="fill-tip">💡 填空题直接输入答案（数字、分数、区间等），按回车或点按钮提交。</div>';
      }
      html += marksHtml;
      html += '</div>';
      return html;
    }

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
      html += solutionBlock(q);
    } else {
      html += '<div class="qc-actions"><button class="btn primary" data-submit data-qid="' + q.qid + '" ' + (a.chosen === undefined ? 'disabled' : '') + '>提交答案</button></div>';
    }
    html += marksHtml;
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
        if (a.submitted === true) cls += (q.kind === 'solve' ? ' done' : (a.correct ? ' ok' : ' no'));
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

    var typeLabels = s.typeIds.length ? s.typeIds.map(function (t) { return QB.types[t].short; }).join('、') : (isGk() ? '全部卷面题型' : '全部题型');
    var diffLabel = CUSTOM_DIFFS[s.difficulty] ? CUSTOM_DIFFS[s.difficulty].name : '混合';
    var formLabels = effForms(s.forms).map(function (f) { return FORM_META[f].name; }).join('、');

    var html = '<div class="daily-meta card">';
    html += '<div class="dm-row1"><span class="dm-date">🎯 专项练习</span>' +
      '<button class="btn small ghost" data-crestart>重新选题</button></div>';
    html += '<div class="dm-row2"><span class="dm-prog">已做 <b>' + answered + '</b>/' + set.questions.length + '</span>' +
      '<div class="pbar"><div class="pbar-in" style="width:' + Math.round(answered / set.questions.length * 100) + '%"></div></div></div>';
    html += '<div class="dm-row3"><span class="dm-plan">题型与难度</span><div class="dm-chips">' +
      '<span class="chip" style="--tc:#6366f1">' + esc(typeLabels) + '</span>' +
      (isGk() ? '' : '<span class="chip" style="--tc:#0ea5e9">' + esc(formLabels) + '</span>') +
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
    var semTypes = trackTypes();

    var typesHtml = semTypes.map(function (t) {
      var m = QB.types[t];
      var on = s.typeIds.indexOf(t) >= 0;
      return '<button class="ctype' + (on ? ' on' : '') + '" data-ctype="' + t + '" style="--tc:' + m.color + '">' +
        '<span class="ct-icon">' + esc(m.icon) + '</span>' +
        '<span class="ct-name">' + esc(m.name) + '</span>' +
        '<span class="ct-check">' + (on ? '✓' : '') + '</span></button>';
    }).join('');

    var csemChips = ['1', '2'].map(function (sv) {
      var m = QB.semesters[sv];
      var on = String(state.settings.semester) === sv;
      return '<button class="seg' + (on ? ' active' : '') + '" data-csem="' + sv + '" style="--tc:#6366f1" title="' + esc(m.desc) + '">' + esc(m.name) + '</button>';
    }).join('');

    var diffsHtml = Object.keys(CUSTOM_DIFFS).map(function (dd) {
      var m = CUSTOM_DIFFS[dd];
      return '<button class="seg' + (s.difficulty === dd ? ' active' : '') + '" data-cdiff="' + dd + '" style="--tc:' + m.color + '" title="' + esc(m.desc) + '">' + esc(m.name) + '</button>';
    }).join('');

    var countsHtml = [5, 10, 15, 20].map(function (n) {
      return '<button class="seg' + (s.count === n ? ' active' : '') + '" data-ccount="' + n + '" style="--tc:#6366f1">' + n + ' 题</button>';
    }).join('');

    var cforms = effForms(s.forms);
    var cformChips = ['choice', 'solution', 'proof'].map(function (f) {
      var m = FORM_META[f];
      var on = cforms.indexOf(f) >= 0;
      return '<button class="seg' + (on ? ' active' : '') + '" data-cform="' + f + '" style="--tc:' + m.color + '">' + m.name + '</button>';
    }).join('');

    var html = '<div class="cfg card">';
    html += '<div class="cfg-title">🎯 专项练习</div>';
    if (isGk()) {
      html += '<div class="cfg-desc">勾选想练的<b>卷面题型</b>（选择题 / 填空题 / 解答题，可多选），选好难度和题量后开始。专项练习独立于每日 10 题，标记的掌握状态同样影响错题本与掌握度。</div>';
      html += '<div class="cfg-block"><div class="cfg-label">📖 卷面题型（已选 ' + s.typeIds.length + '/' + semTypes.length + '）</div>';
      html += '<div class="ctype-grid">' + typesHtml + '</div></div>';
      html += '<div class="cfg-block"><div class="cfg-label">🎚️ 题目难度</div><div class="segs">' + diffsHtml + '</div></div>';
      html += '<div class="cfg-block"><div class="cfg-label">🔢 题量</div><div class="segs">' + countsHtml + '</div></div>';
      html += '<button class="btn cfg-start" data-cstart>开始练习（' + s.count + ' 题，' + (s.typeIds.length ? '已选题型' : '全部卷面题型') + '）</button>';
      html += '</div>';
      $('#app').innerHTML = html;
      return;
    }
    html += '<div class="cfg-desc">先选<b>学期</b>，再勾选想练的章节（可多选）、题型形式（选择题/解答题/证明题），选好难度和题量后开始。专项练习独立于每日 10 题，标记的掌握状态同样影响复习计划与错题本。</div>';

    html += '<div class="cfg-block"><div class="cfg-label">🎓 学期</div><div class="segs">' + csemChips + '</div></div>';
    html += '<div class="cfg-block"><div class="cfg-label">📖 选择题型（已选 ' + s.typeIds.length + '/' + semTypes.length + '）</div>';
    html += '<div class="ctype-grid">' + typesHtml + '</div></div>';

    html += '<div class="cfg-block"><div class="cfg-label">🧩 题型形式（可多选）</div><div class="segs">' + cformChips + '</div></div>';
    html += '<div class="cfg-block"><div class="cfg-label">🎚️ 题目难度</div><div class="segs">' + diffsHtml + '</div></div>';
    html += '<div class="cfg-block"><div class="cfg-label">🔢 题量</div><div class="segs">' + countsHtml + '</div></div>';

    html += '<button class="btn cfg-start" data-cstart>开始练习（' + s.count + ' 题，' + (s.typeIds.length ? '已选章节' : '本学期全部章节') + '）</button>';
    html += '</div>';
    $('#app').innerHTML = html;
  }

  /* ---------- 错题本 ---------- */
  function renderWrong() {
    if (inRedo()) { renderRedoPractice(); return; }
    var items = state.wrongbook.slice().reverse();
    var filters = ['all', 'not_mastered', 'wobbly', 'wrong'].map(function (f) {
      var name = { all: '全部', not_mastered: '未掌握', wobbly: '不熟练', wrong: '答错' }[f];
      return '<button class="seg' + (wrongFilter === f ? ' active' : '') + '" data-wf="' + f + '">' + name + '</button>';
    }).join('');

    var selCount = Object.keys(redoSelect).length;

    var html = '<div class="wrong-head card"><div class="wh-title">📕 错题本</div>' +
      '<div class="wh-desc">勾选题后点「重做所选」，会按<b>同样的题型换数字</b>出"举一反三"新题（绝不原题重复）；重做<b>做对</b>的题会盖上 ✅已订正 标记，仍保留在这里。</div>' +
      '<div class="segs">' + filters + '</div></div>';

    var shown = items.filter(function (e) { return wrongFilter === 'all' || e.mark === wrongFilter; });
    if (!shown.length) {
      html += '<div class="empty card">🎈 还没有错题。答错或标记「不熟练/未掌握」的题会自动出现在这里。</div>';
    } else {
      // 选择工具条
      html += '<div class="wselect-bar card">' +
        '<button class="btn small ghost" data-wselectall>' + (selCount === shown.length && shown.length ? '取消全选' : '全选') + '</button>' +
        '<span class="wsel-info">已选 <b>' + selCount + '</b> 题</span>' +
        '<button class="btn small" data-wredo ' + (selCount ? '' : 'disabled') + '>🔄 重做所选（举一反三）</button>' +
        '</div>';

      html += shown.map(function (e) {
        var m = QB.types[e.typeId];
        var isOpen = expanded[e.id];
        var checked = !!redoSelect[e.id];
        return '<div class="wcard card' + (checked ? ' wcard-sel' : '') + '">' +
          '<div class="wc-head">' +
          '<label class="wcheck"><input type="checkbox" data-wcheck="' + e.id + '" ' + (checked ? 'checked' : '') + '><span class="wcheck-box"></span></label>' +
          typeBadge(e.typeId) + diffBadge(e.difficulty) + markBadge(e.mark) +
          (e.corrected ? '<span class="tag mark-corrected">✅ 已订正</span>' : '') +
          '<span class="wc-date">' + e.date + '</span></div>' +
          '<div class="wc-q' + (mathSegCount(e.question) >= 2 ? ' q-inline' : '') + '">' +
          mathHtml(e.question, mathSegCount(e.question) < 2).replace(/\n/g, '<br>') + '</div>' +
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

  /* ---------- 错题重做会话（举一反三） ---------- */
  function renderRedoPractice() {
    var set = state.redo;
    var answered = Object.keys(set.answers).filter(function (qid) {
      return set.answers[qid].submitted === true;
    }).length;
    var allDone = answered >= set.questions.length;
    var correctedCount = 0;
    set.sourceIds.forEach(function (sid) {
      var se = findWrong(sid);
      if (se && se.corrected) correctedCount++;
    });

    var html = '<div class="daily-meta card">';
    html += '<div class="dm-row1"><span class="dm-date">🔄 错题重做 · 举一反三</span>' +
      '<button class="btn small ghost" data-redoexit>返回错题本</button></div>';
    html += '<div class="dm-row2"><span class="dm-prog">已做 <b>' + answered + '</b>/' + set.questions.length + ' · 已订正 <b>' + correctedCount + '</b></span>' +
      '<div class="pbar"><div class="pbar-in" style="width:' + Math.round(answered / set.questions.length * 100) + '%"></div></div></div>';
    html += '<div class="dm-row3"><span class="dm-plan">出题规则</span><div class="dm-chips">' +
      '<span class="chip" style="--tc:#6366f1">同题型 · 换数字 · 非原题</span></div></div>';
    html += '</div>';

    if (allDone) {
      html += renderSummary(set, {
        title: '🔄 错题重做完成',
        extraBtns: '<button class="btn ghost" data-redoexit>返回错题本</button>'
      });
    } else {
      html += renderQuestionCard(set, redoIdx);
      html += renderNav(set, redoIdx);
    }
    $('#app').innerHTML = html;
    renderMathIn($('#app'));
  }

  /* ---------- 学习记录 ---------- */
  function renderRecords() {
    var hist = state.history.slice().reverse();
    var total = hist.length;
    var gradeable = hist.filter(function (h) { return h.correct !== null && h.correct !== undefined; });
    var correct = gradeable.filter(function (h) { return h.correct; }).length;
    var pct = gradeable.length ? Math.round(correct / gradeable.length * 100) : 0;
    var solveCount = hist.filter(function (h) { return h.correct === null; }).length;

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
      '<div class="st"><b>' + pct + '%</b><span>选择题正确率</span></div>' +
      '<div class="st"><b>' + streak + '</b><span>连续学习天数</span></div>' +
      '<div class="st"><b>' + todayCount + '</b><span>今日已做</span></div>' +
      '</div>';
    if (solveCount) {
      html += '<div class="stats-note card">📝 其中解答/证明题 <b>' + solveCount + '</b> 道（按「已完成」记录，不计入选择题正确率）</div>';
    }

    // 各题型统计（按当前板块/学期）
    html += '<div class="type-stats card"><div class="ts-title">各章节掌握情况（' + esc(isGk() ? QB.tracks.gaokao.name : QB.semesters[state.settings.semester].name) + '）</div>';
    trackTypes().forEach(function (t) {
      var m = QB.types[t];
      var hs = state.history.filter(function (h) { return h.typeId === t; });
      var gr = hs.filter(function (h) { return h.correct !== null && h.correct !== undefined; });
      var c = gr.filter(function (h) { return h.correct; }).length;
      var tp = gr.length ? Math.round(c / gr.length * 100) : null;
      var sv = hs.length - gr.length;
      var ts = state.types[t];
      var nd = S.nextDue(ts, today);
      var cntTxt = tp === null
        ? (sv ? '解答题 ' + sv + ' 道' : '未练过')
        : '做 ' + hs.length + ' 题 · 正确率 ' + tp + '%' + (sv ? '（含解答 ' + sv + '）' : '');
      html += '<div class="ts-row">' +
        '<span class="ts-name" style="--tc:' + m.color + '">' + esc(m.icon) + ' ' + esc(m.name) + '</span>' +
        (ts && ts.status ? '<span class="tag ' + MARK_META[ts.status].cls + '">' + esc(MARK_META[ts.status].name) + '</span>' : '<span class="tag tag-none">未标记</span>') +
        '<span class="ts-cnt">' + cntTxt + '</span>' +
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
          '<span class="h-src">' + (h.source === 'custom' ? '专项' : (h.source === 'redo' ? '错题重做' : '每日')) + '</span>' +
          '<span class="h-type" style="--tc:' + QB.types[h.typeId].color + '">' + esc(QB.types[h.typeId].short) + '</span>' +
          '<span class="h-diff" style="--tc:' + QB.difficulties[h.difficulty].color + '">' + esc(QB.difficulties[h.difficulty].name) + '</span>' +
          '<span class="h-q">' + mathHtml(h.question, false) + '</span>' +
          '<span class="h-res ' + (h.correct === null ? 'done' : (h.correct ? 'ok' : 'no')) + '">' +
          (h.correct === null ? '📝已完成' : (h.correct ? '✓' : '✗')) + '</span>' +
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
    var semName = isGk() ? QB.tracks.gaokao.name : QB.semesters[state.settings.semester].name;
    var html = '<div class="mas-head card"><div class="ts-title">🧭 掌握度总览（' + esc(semName) + '）</div>' +
      '<div class="mas-rules"><b>复习节奏：</b>' +
      '<span class="tag mark-mastered">已掌握 → 7 天后出类似题</span>' +
      '<span class="tag mark-wobbly">不熟练 → 1 天后出类似题</span>' +
      '<span class="tag mark-not">未掌握 → 连续 2 天出类似题</span>' +
      '</div></div>';

    html += '<div class="mas-grid">' + trackTypes().map(function (t) {
      var m = QB.types[t];
      var hs = state.history.filter(function (h) { return h.typeId === t; });
      var gr = hs.filter(function (h) { return h.correct !== null && h.correct !== undefined; });
      var c = gr.filter(function (h) { return h.correct; }).length;
      var tp = gr.length ? Math.round(c / gr.length * 100) : null;
      var sv = hs.length - gr.length;
      var ts = state.types[t];
      var nd = S.nextDue(ts, today);
      var nb = state.wrongbook.filter(function (e) { return e.typeId === t; }).length;
      var pctW = gr.length ? Math.min(100, Math.round(c / Math.max(gr.length, 1) * 100)) : 0;
      return '<div class="mas-card card" style="--tc:' + m.color + '">' +
        '<div class="mc-top"><span class="mc-icon">' + esc(m.icon) + '</span>' +
        '<div class="mc-info"><div class="mc-name">' + esc(m.name) + '</div>' +
        '<div class="mc-sub">' + (ts && ts.status ? esc(MARK_META[ts.status].name) : '未标记') + '</div></div>' +
        '<span class="mc-acc">' + (tp === null ? '—' : tp + '%') + '</span></div>' +
        '<div class="pbar"><div class="pbar-in" style="width:' + pctW + '%"></div></div>' +
        '<div class="mc-foot"><span>已做 ' + hs.length + ' 题' + (sv ? '（解答 ' + sv + '）' : '') + '</span><span>错题本 ' + nb + '</span></div>' +
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

    // 板块切换：高数 / 北京高考
    var segEl = $('#trackSeg');
    if (segEl) {
      segEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-track]');
        if (!btn) return;
        var tr = btn.getAttribute('data-track');
        if (tr === (state.settings.track || 'gaoshu')) return;
        var dc = state.daily[dailyKey()];
        var answeredNow = dc && dc.answers ? Object.keys(dc.answers).filter(function (k) {
          return dc.answers[k].submitted === true;
        }).length : 0;
        if (answeredNow > 0 && !window.confirm('切换板块会换成另一套题（已完成 ' + answeredNow + ' 题的记录会保留在错题本/记录里）。继续吗？')) {
          return;
        }
        state.settings.track = tr;
        state.settings.dailyTypes = [];
        state.custom.set = null;
        view = 'daily';
        curIdx = 0;
        save();
        render();
      });
    }

    // 填空题：回车提交
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var inp = document.getElementById('fillInput');
      if (!inp || document.activeElement !== inp) return;
      var fs = document.querySelector('[data-fillsubmit]');
      if (fs) { e.preventDefault(); fs.click(); }
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

      // 今日练习：切换学期
      var semBtn = t.closest('[data-sem]');
      if (semBtn) {
        var sv = parseInt(semBtn.getAttribute('data-sem'), 10);
        if (sv === state.settings.semester) return;
        var dsS = state.daily[dailyKey()];
        var answeredS = dsS && dsS.answers ? Object.keys(dsS.answers).filter(function (k) {
          return dsS.answers[k].submitted === true;
        }).length : 0;
        if (answeredS > 0 && !window.confirm('切换学期会重新生成今天的题（已完成 ' + answeredS + ' 题会清空进度）。确定吗？')) {
          return;
        }
        state.settings.semester = sv;
        state.settings.dailyTypes = [];   // 学期切换后题型选择重置为该学期全部
        save();
        curIdx = 0;
        renderDaily();
        return;
      }

      // 今日练习：自选题型（混搭）
      var dty = t.closest('[data-dtype]');
      if (dty) {
        var tv = dty.getAttribute('data-dtype');
        var cur = state.settings.dailyTypes || [];
        var next;
        if (tv === '') next = [];                 // 「全部」按钮：清空选择
        else if (cur.indexOf(tv) >= 0) next = cur.filter(function (x) { return x !== tv; });
        else next = cur.concat([tv]);
        // 若今天已有作答，更改题型会重新组卷，提醒用户
        var ds = state.daily[dailyKey()];
        var answeredNow = ds && ds.answers ? Object.keys(ds.answers).filter(function (k) {
          return ds.answers[k].submitted === true;
        }).length : 0;
        if (answeredNow > 0 && !window.confirm('更改题型会按新题型重新生成今天的 ' + ds.questions.length + ' 道题（已完成 ' + answeredNow + ' 题会清空进度）。确定吗？')) {
          return;
        }
        state.settings.dailyTypes = next;
        save();
        curIdx = 0;
        renderDaily();
        return;
      }

      // 今日练习：选择题型形式（选择题/解答题/证明题）
      var dfo = t.closest('[data-dform]');
      if (dfo) {
        var fv = dfo.getAttribute('data-dform');
        var curF = effForms(state.settings.dailyForms);
        var nextF = curF.indexOf(fv) >= 0 ? curF.filter(function (x) { return x !== fv; }) : curF.concat([fv]);
        if (!nextF.length) nextF = [fv];               // 至少保留一种形式
        var normalized = nextF.length === 3 ? [] : nextF; // 三种全选 = 不限
        var dsF = state.daily[dailyKey()];
        var answeredF = dsF && dsF.answers ? Object.keys(dsF.answers).filter(function (k) {
          return dsF.answers[k].submitted === true;
        }).length : 0;
        if (answeredF > 0 && !window.confirm('切换题型形式会重新生成今天的 ' + dsF.questions.length + ' 道题（已完成 ' + answeredF + ' 题会清空进度）。确定吗？')) {
          return;
        }
        state.settings.dailyForms = normalized;
        save();
        curIdx = 0;
        renderDaily();
        return;
      }

      // 专项练习：切换学期
      var csem = t.closest('[data-csem]');
      if (csem) {
        var csv = parseInt(csem.getAttribute('data-csem'), 10);
        if (csv === state.settings.semester) return;
        state.settings.semester = csv;
        state.custom.settings.typeIds = [];   // 换学期后清空章节选择（避免残留旧章节）
        state.custom.set = null;
        save();
        renderCustom();
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
      // 专项练习：题型形式
      var cfo = t.closest('[data-cform]');
      if (cfo) {
        var cfv = cfo.getAttribute('data-cform');
        var cf = effForms(state.custom.settings.forms);
        var nf = cf.indexOf(cfv) >= 0 ? cf.filter(function (x) { return x !== cfv; }) : cf.concat([cfv]);
        if (!nf.length) nf = [cfv];
        state.custom.settings.forms = nf.length === 3 ? [] : nf;
        save();
        renderCustom();
        return;
      }
      // 专项练习：开始
      var cst = t.closest('[data-cstart]');
      if (cst) {
        var cs2 = state.custom.settings;
        var effTypes2 = (cs2.typeIds || []).filter(function (t) {
          return QB.types[t] && (isGk() ? QB.types[t].track === 'gaokao' : QB.types[t].track !== 'gaokao');
        });
        if (!effTypes2.length) effTypes2 = trackTypes();
        var avoidMap2 = {};
        effTypes2.forEach(function (tt) {
          if (state.types[tt] && state.types[tt].lastSig) avoidMap2[tt] = [state.types[tt].lastSig];
        });
        var built = S.buildCustom({
          typeIds: effTypes2, difficulty: cs2.difficulty, count: cs2.count,
          forms: isGk() ? [] : effForms(cs2.forms), avoidMap: avoidMap2
        });
        state.custom.set = { date: today, questions: built.questions, answers: {} };
        Object.keys(built.lastSigs).forEach(function (tt) {
          state.types[tt] = state.types[tt] || {};
          state.types[tt].lastSig = built.lastSigs[tt];
        });
        customIdx = 0;
        save();
        renderCustom();
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

      // 填空题：提交答案
      var fsub = t.closest('[data-fillsubmit]');
      if (fsub) {
        var qidF = fsub.getAttribute('data-qid');
        var dF = curContainer();
        var qF = dF.questions.filter(function (x) { return x.qid === qidF; })[0];
        var inp = document.getElementById('fillInput');
        var raw = inp ? inp.value : '';
        if (String(raw).trim() === '') { if (inp) inp.focus(); return; }
        submitFill(dF, qF, raw, curSource());
        renderCurrentPractice();
        return;
      }

      // 解答题/证明题：点击「已完成」→ 揭示答案与解析
      var sd = t.closest('[data-solvedone]');
      if (sd) {
        var qidS = sd.getAttribute('data-qid');
        var dS = curContainer();
        var qS = dS.questions.filter(function (x) { return x.qid === qidS; })[0];
        markSolved(dS, qS, curSource());
        renderCurrentPractice();
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
          delete redoSelect[id2];
          save();
          renderWrong();
        }
        return;
      }
      var wd = t.closest('[data-wdel]');
      if (wd) {
        var did = wd.getAttribute('data-wdel');
        removeWrong(did);
        delete redoSelect[did];
        save();
        renderWrong();
        return;
      }
      // 勾选错题（准备重做）
      var wck = t.closest('[data-wcheck]');
      if (wck) {
        var cid = wck.getAttribute('data-wcheck');
        if (wck.checked) redoSelect[cid] = true; else delete redoSelect[cid];
        renderWrong();
        return;
      }
      // 全选/取消全选（当前筛选范围内）
      var wsa = t.closest('[data-wselectall]');
      if (wsa) {
        var shownIds = state.wrongbook.filter(function (e) {
          return wrongFilter === 'all' || e.mark === wrongFilter;
        }).map(function (e) { return e.id; });
        var allOn = shownIds.length && shownIds.every(function (i) { return redoSelect[i]; });
        if (allOn) {
          shownIds.forEach(function (i) { delete redoSelect[i]; });
        } else {
          shownIds.forEach(function (i) { redoSelect[i] = true; });
        }
        renderWrong();
        return;
      }
      // 开始重做：按原题题型换参数生成"举一反三"新题
      var wrd = t.closest('[data-wredo]');
      if (wrd && !wrd.disabled) {
        var selIds = Object.keys(redoSelect).filter(function (i) { return redoSelect[i]; });
        if (selIds.length) {
          var redoQs = [];
          var redoSrc = [];
          selIds.forEach(function (sid) {
            var entry = findWrong(sid);
            if (!entry) return;
            var q = QB.generate({
              typeId: entry.typeId,
              difficulty: entry.difficulty,
              forms: entry.form ? [entry.form] : [],   // 保持原题形式（选择题错题→重做选择题）
              avoid: entry.sig ? [entry.sig] : []
            });
            q.dueReason = '错题变式';
            redoQs.push(q);
            redoSrc.push(sid);
          });
          state.redo = { questions: redoQs, answers: {}, sourceIds: redoSrc };
          redoIdx = 0;
          save();
          renderRedoPractice();
        }
        return;
      }
      // 退出重做会话
      var rex = t.closest('[data-redoexit]');
      if (rex) {
        state.redo = null;
        redoIdx = 0;
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
    // 支持 ?track=gaokao 直接进入北京高考板块（便于分享/书签）
    try {
      var mt = /[?&]track=(gaoshu|gaokao)/.exec(location.search);
      if (mt && mt[1] !== (state.settings.track || 'gaoshu')) {
        state.settings.track = mt[1];
        state.settings.dailyTypes = [];
        state.custom.set = null;
        save();
      }
    } catch (e) { }
    bindEvents();
    render();
    // 跨天自动刷新
    setInterval(function () {
      if (Store.todayStr() !== today) window.location.reload();
    }, 30000);
  }

  window.__initApp = init;
  window.__rerenderAll = function () { renderMathIn(document); };
  window.__appDebug = {
    state: function () { return state; },
    ensureDaily: ensureDaily,
    today: today,
    // 测试辅助：用给定题目替换今日套题（用于验证解答题流程）
    setDailyQuestions: function (qs) {
      state.daily[dailyKey()] = {
        date: today, difficulty: state.settings.difficulty,
        typeIds: effDailyTypes().slice().sort().join(','),
        semester: state.settings.semester,
        track: track(),
        forms: isGk() ? 'gk-plan' : effForms(state.settings.dailyForms).slice().sort().join(','),
        questions: qs, answers: {}, due: [], used: {}
      };
      save();
      if (view === 'daily') renderDaily();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
