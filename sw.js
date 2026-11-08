/* ============================================================
 * Service Worker：离线可用（首次访问后缓存站点资源）
 * 策略：
 *   - 页面/脚本/样式：网络优先（保证更新及时），断网时回退缓存
 *   - 其它静态资源（字体、图片）：缓存优先
 * 发布新版本时把 VERSION 改一下即可清掉旧缓存
 * ============================================================ */
var VERSION = 'gaoshu-v2026-11-08';
var CORE = [
  './', './index.html', './css/style.css',
  './vendor/katex/katex.min.css', './vendor/katex/katex.min.js',
  './js/katex-fallback.js', './js/math-renderer.js', './js/core.js',
  './js/qb-limit.js', './js/qb-derivative.js', './js/qb-app.js',
  './js/qb-integral.js', './js/qb-extra.js', './js/qb-more.js',
  './js/qb-more2.js', './js/qb-solve.js', './js/qb-sem2.js',
  './js/qb-gaokao.js', './js/scheduler.js', './js/store.js',
  './js/backup.js', './js/share.js', './js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // 外链不接管

  var isDoc = req.mode === 'navigate';
  var isCode = /\.(js|css)$/i.test(url.pathname);
  if (isDoc || isCode) {
    // 网络优先：确保拿到最新代码；断网时用缓存
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
    );
  } else {
    // 缓存优先：字体/图片等
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
  }
});
