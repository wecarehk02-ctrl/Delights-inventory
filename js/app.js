/* app.js — shell: tab navigation, QR deep-link handling, bootstrap */
(function (root) {
  'use strict';
  var UI = root.UI, Store = root.Store, el = UI.el;

  var ORDER = ['dashboard', 'products', 'customers', 'orders', 'inventory', 'delivery', 'labels', 'invoices', 'queue', 'sieve', 'settings'];

  var App = {
    current: 'dashboard',
    go: function (id) {
      if (!root.Modules[id]) return;
      App.current = id;
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
      App.renderNav();
      var main = document.getElementById('inv-main');
      main.scrollTop = 0;
      root.Modules[id].render(main);
    },
    renderNav: function () {
      var nav = document.getElementById('inv-nav');
      if (!nav) return;
      nav.innerHTML = '';
      ORDER.forEach(function (id) {
        var m = root.Modules[id];
        if (!m) return;
        var active = App.current === id;
        nav.appendChild(el('button', {
          class: 'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ' +
            (active ? 'bg-indigo text-rice-paper' : 'text-indigo/80 hover:bg-indigo/10'),
          onclick: function () { App.go(id); closeMobileNav(); }
        }, [el('span', { class: 'text-lg', text: m.icon }), el('span', { text: m.label })]));
      });
      if (App.hasAppPassword && App.hasAppPassword()) {
        nav.appendChild(el('button', {
          class: 'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 mt-2 border-t border-indigo/10',
          onclick: function () { App.lock(); }
        }, [el('span', { class: 'text-lg', text: '🔒' }), el('span', { text: '鎖定 / 登出' })]));
      }
    }
  };

  function closeMobileNav() {
    var side = document.getElementById('inv-side');
    if (side && window.innerWidth < 768) side.classList.add('-translate-x-full');
  }

  function handleHash() {
    var h = (location.hash || '').replace('#', '');
    // QR deep link: #lot=DLH-L-xxxx
    if (h.indexOf('lot=') === 0) {
      var qrId = decodeURIComponent(h.slice(4));
      App.go('labels');
      setTimeout(function () { root.Modules.labels.showLotView(qrId); }, 100);
      return;
    }
    if (h && root.Modules[h]) App.go(h);
    else {
      var path = (location.pathname || '').replace(/^\/+|\/+$/g, '').split('/').pop();
      if (path && root.Modules[path]) App.go(path);
      else App.go('dashboard');
    }
  }

  function afterData() {
    App.renderNav();
    handleHash();
    window.addEventListener('hashchange', function () {
      var h = (location.hash || '').replace('#', '');
      if (h.indexOf('lot=') === 0) handleHash();
    });
    // re-render current view when cloud sync brings in changes
    Store.subscribe(function (c) { if (c === '*') { try { root.Modules[App.current].render(document.getElementById('inv-main')); } catch (e) {} } });
    var toggle = document.getElementById('inv-nav-toggle');
    var side = document.getElementById('inv-side');
    if (toggle && side) toggle.addEventListener('click', function () { side.classList.toggle('-translate-x-full'); });
  }

  // ---- App-level login gate (local mode) ---------------------------------
  // Cloud mode is gated by Supabase auth. In local mode, if a system password
  // is set (設定 → 系統登入密碼), require it before the app renders.
  var appUnlocked = false;
  function appAuthNeeded() {
    var s = Store.settings();
    return !!s.appPasswordHash && !appUnlocked;
  }
  function showAppLogin(onOk) {
    var s = Store.settings();
    var overlay = el('div', { class: 'fixed inset-0 z-[95] bg-indigo flex items-center justify-center p-6' });
    var form = el('div', { class: 'bg-rice-paper w-full max-w-sm p-8 shadow-2xl rounded-2xl' }, [
      el('div', { class: 'font-serif text-2xl text-indigo mb-1', text: '帝樂倉存系統' }),
      el('p', { class: 'text-sm text-indigo/60 mb-6', text: '請輸入系統密碼登入' }),
      UI.field({ key: 'pw', label: '密碼', type: 'password' }),
      el('div', { class: 'mt-6' })
    ]);
    var wrap = form.lastChild;
    var btn = el('button', { class: UI.btnClass('primary') + ' w-full justify-center', text: '登入' });
    var errP = el('p', { class: 'text-sm text-red-600 mt-2 min-h-[1.2em]' });
    wrap.appendChild(btn); wrap.appendChild(errP);
    overlay.appendChild(form);
    document.body.appendChild(overlay);
    function submit() {
      var pw = UI.readForm(form).pw || '';
      if (UI.simpleHash(pw) === s.appPasswordHash) { appUnlocked = true; overlay.remove(); onOk(); }
      else { errP.textContent = '密碼錯誤'; }
    }
    btn.addEventListener('click', submit);
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    setTimeout(function () { var i = form.querySelector('input'); if (i) i.focus(); }, 60);
  }
  App.lock = function () { appUnlocked = false; location.reload(); };
  App.hasAppPassword = function () { return !!Store.settings().appPasswordHash; };

  function boot() {
    // QR self-test (fails loudly if the vendored generator is broken)
    try { root.DELIGHTS_QR.selfTest(); } catch (e) { console.error(e); }
    App.renderNav();
    // Cloud (Supabase) mode if configured & enabled; otherwise pure local.
    if (root.Cloud && root.Cloud.isEnabled()) {
      root.Cloud.start(function () { afterData(); });
    } else {
      Store.ensureSeed();
      if (appAuthNeeded()) showAppLogin(afterData);
      else afterData();
    }
  }

  root.App = App;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(typeof window !== 'undefined' ? window : this);
