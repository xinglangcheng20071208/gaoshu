# 改进方案与落地记录

> 按影响面排序。✅ = 已实现并上线；🧭 = 设计/代码片段，待你决定是否接入。

## P0. 公式渲染（✅ 已修复根因）

**根因**：站点从 `cdn.jsdelivr.net` 加载 KaTeX。该 CDN 在部分网络下不可达（实测返回 000），一旦失败就退回简易渲染器，表现为公式"乱、错位、缺字"。另外旧代码对每个公式都直接 `katex.render`，没有错误隔离和缓存。

**已做**：
1. **自托管 KaTeX**：`vendor/katex/`（`katex.min.js` + `katex.min.css` + 20 个 woff2 字体，共 0.53MB），`index.html` 改为本地引用，不再依赖任何 CDN。
2. **新渲染模块** `js/math-renderer.js`：
   - 结果缓存（同一条公式只渲染一次）；
   - 单条公式失败自动降级到 `simpleTeX`，再失败降级纯文本，**不影响同页其它公式**；
   - 本地 KaTeX 缺失时自动尝试 unpkg / cdnjs 兜底；
   - 统一的 `mathHtml` / `questionBlock`（单段公式居中、多段公式内联）。
3. **CSS**：`.mtex-d` 超宽公式容器内横向滑动（不撑破页面）、行内公式可换行、深色模式公式跟随文字颜色、解析步骤长公式可滑动。
4. **离线**：新增 `sw.js`（Service Worker）。页面/脚本网络优先（保证更新），断网回退缓存；字体缓存优先。首次访问后**断网也能打开并正常显示公式**。

**移动端验证**：430px 宽实测 `document.scrollWidth = 430 = clientWidth`（无横向溢出）；分数、根式、极限、积分在手机与桌面均正常。

## P1. 数据持久化（✅ 过渡方案已上线；🧭 云同步设计见下）

**已做**：
- `js/backup.js`：
  - 每次启动自动做**当日快照**（保留最近 3 天，`gaoshu_backup_v1`），误重置可一键恢复；
  - **导出** JSON（下载文件）、**导入文件**、**粘贴导入**；
  - **合并导入**：`history` 按 `qid+ts` 去重、`wrongbook` 取更差掌握度并合并"已订正"、`types` 取 `lastShown` 较新者，避免覆盖丢数据。
- UI：「学习记录 → 数据备份」卡片（导出 / 导入文件 / 粘贴导入 / 生成海报 / 复制文案 + 快照恢复）。

**🧭 云同步方案（最小后端）**

数据结构（单表即可，按用户隔离）：

```sql
CREATE TABLE user_state (
  user_id    TEXT PRIMARY KEY,      -- 微信 openid 或自建账号 id
  version    INTEGER NOT NULL,      -- 每次写入 +1，用于乐观锁
  updated_at INTEGER NOT NULL,
  payload    TEXT NOT NULL          -- 直接存前端 JSON（历史/错题本/掌握度）
);
```

接口（Node/Express 示例，约 60 行）：

```js
app.post('/api/login', async (req, res) => {          // 微信 code → openid
  const { code } = req.body;
  const r = await fetch('https://api.weixin.qq.com/sns/jscode2session' +
    `?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`);
  const j = await r.json();
  if (!j.openid) return res.status(401).json({ error: 'login failed' });
  const token = jwt.sign({ uid: j.openid }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

app.get('/api/state', auth, async (req, res) => {
  const row = await db.get('SELECT * FROM user_state WHERE user_id=?', [req.uid]);
  res.json(row ? { version: row.version, payload: JSON.parse(row.payload) } : { version: 0, payload: null });
});

app.put('/api/state', auth, async (req, res) => {
  const { version, payload } = req.body;
  const cur = await db.get('SELECT version FROM user_state WHERE user_id=?', [req.uid]);
  if (cur && cur.version !== version) {
    return res.status(409).json({ error: 'conflict', server: await loadFull(req.uid) });
  }
  await db.run(`INSERT INTO user_state(user_id,version,updated_at,payload)
    VALUES(?,1,?,?) ON CONFLICT(user_id) DO UPDATE SET version=version+1,updated_at=?,payload=?`,
    [req.uid, Date.now(), JSON.stringify(payload), Date.now(), JSON.stringify(payload)]);
  res.json({ ok: true, version: (cur ? cur.version : 0) + 1 });
});
```

前端同步（合并使用与 `backup.js` 相同的 `mergeStates`，因此**离线产生的数据不会丢**）：

```js
async function syncUp() {
  const local = Store.load();
  const { version } = JSON.parse(localStorage.getItem('gaoshu_sync') || '{"version":0}');
  const res = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ version, payload: local }) });
  if (res.status === 409) {
    const { server } = await res.json();               // 冲突：合并后重试一次
    const merged = Backup.mergeStates(local, server.payload);
    await fetch('/api/state', { method: 'PUT', headers, body: JSON.stringify({ version: server.version, payload: merged }) });
  }
}
```

**冲突策略**：以"合并"而不是"覆盖"为准；`history` 去重、`wrongbook` 取更差掌握度、`types` 取最新 `lastShown`。这样两台设备都能保留自己的做题记录。

## P2. UI/UX（✅ 已做一批）

- **完成反馈**：结算页彩带动画（canvas，无依赖）+ 得分卡 + 分享按钮。
- **掌握度可视化**：正确率环形图、章节正确率条形图、近 30 天打卡热力图、近 14 天正确率折线（纯 SVG）。
- **成就徽章**：8 个徽章（初次刷题/连续 3、7 天/百题/正确率 80%/掌握 5、10 章/三百题），掌握度页展示。
- **移动端**：按钮最小 44px、标记卡 64px、进度点 34px、行内公式可换行、长公式容器内滑动。
- **深色模式**：公式颜色、卡片边框、文字对比度统一。
- **新用户引导**：首次访问显示 3 步说明卡（可关闭，记忆状态）。

## P3. 学习体验（✅ 部分）

- **跟课刷题**：今日练习页新增"跟课刷题"一行，点章节即生成该章 10 题（进入专项练习）。
- **错题变式差异**：错题重做的变式题会显示"🔀 变式题（同题型换数字）：a：2 → 3"，明确告诉学生改了什么。
- **统计**：连续打卡、累计学习天数、正确率趋势已在记录页可视化。

## P4. 内容扩充（🧭 指南）

新增一个模板只需在 `js/qb-*.js` 里 `QB.register`，并给 `test/test.mjs` 加一个独立验证器、给 `test/audit.mjs` 自动纳入审计：

```js
QB.register({
  id: 'solve-S14', type: 'defint', difficulty: 'hard', kind: 'solve', form: 'proof', tech: '变上限积分',
  gen: function (rng) {
    return { params: {}, question: '证明 $F(x)=\\int_0^x f(t)dt$ 在 $[a,b]$ 上连续。',
      options: [], answerIndex: -1, answer: '……', idea: '……',
      steps: [{ m: '...', t: '...' }, { m: '...', t: '...' }], pitfall: '……' };
  }
});
```

扩充节奏建议：每次 5 题（3 选择 + 1 填空 + 1 解答），跑 `node test/test.mjs` 与 `node test/audit.mjs`，审计会检查答案独立性、选项唯一性、干扰项等价性、题干格式（如 `x^2x`、`0x`、字体依赖符号）。

## P5. 传播与留存（✅ 部分）

- **分享**：生成 720×1000 学习海报（累计题数、正确率、连续打卡、掌握章节 + 站点链接），可保存发朋友圈/小红书；另有"复制分享文案"。
- **成就**：见 P2。
- 🧭 进一步：微信 JS-SDK 分享卡片（需公众号 + 签名服务）、小红书图片模板多样化。

## P6. 代码质量（✅ 已做 + 🧭 建议）

- ✅ 渲染逻辑从 `app.js` 拆到 `js/math-renderer.js`；备份与分享拆到 `js/backup.js`、`js/share.js`。
- ✅ 公式渲染结果缓存，重复渲染不再重复解析（性能提升明显）。
- 🧭 下一步：`app.js` 仍有 ~1700 行，可按视图拆成 `views/daily.js`、`views/custom.js`、`views/wrong.js`、`views/records.js`、`views/mastery.js`，用简单注册表合并；组件样式可迁移到 CSS 变量主题层。
- 🧭 测试可补：Service Worker 缓存命中断言、导出→导入 round-trip、430/360/320px 三档截图回归。
