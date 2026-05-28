/* PASOUL POP UP STORE LP — B案 — Vanilla JS */

/* ── Countdown ── */
(function () {
  var target = new Date('2026-07-09T10:00:00+09:00').getTime();
  var els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var diff = Math.max(0, target - Date.now());
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if (els.d) els.d.textContent = pad(d);
    if (els.h) els.h.textContent = pad(h);
    if (els.m) els.m.textContent = pad(m);
    if (els.s) els.s.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ── Mobile menu ── */
(function () {
  var overlay = document.getElementById('menu-overlay');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');

  function openMenu() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  /* Close on overlay background click */
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeMenu();
    });
  }

  /* Close on nav link click */
  var navLinks = document.querySelectorAll('.menu-drawer__link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });
})();

/* ── Scroll reveal ── */
(function () {
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
        el.style.transitionDelay = delay + 's';
        el.classList.add('is-visible');
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(function (el) { io.observe(el); });
})();

/* ── FAQ accordion ── */
(function () {
  var items = document.querySelectorAll('.faq-item');

  items.forEach(function (item) {
    var btn = item.querySelector('.faq-item__q');
    var answer = item.querySelector('.faq-item__a');
    if (!btn || !answer) return;

    /* Set initial state for the first item (open by default) */
    if (item.classList.contains('faq-item--open')) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.style.padding = '0 4px 16px';
    }

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('faq-item--open');

      /* Close all */
      items.forEach(function (it) {
        it.classList.remove('faq-item--open');
        var a = it.querySelector('.faq-item__a');
        var b = it.querySelector('.faq-item__q');
        if (a) { a.style.maxHeight = '0'; a.style.padding = '0 4px 0'; }
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      /* Open clicked if it was closed */
      if (!isOpen) {
        item.classList.add('faq-item--open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.padding = '0 4px 16px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ── Share button ── */
(function () {
  var btn = document.getElementById('share-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({
        title: 'PASOUL POP UP STORE',
        text: 'ゲーミングPCも、ノートPCも、触って選べる7日間。アクロスモール新鎌ヶ谷で期間限定オープン！',
        url: window.location.href,
      }).catch(function () {});
    } else {
      var dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.value = window.location.href;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      alert('URLをコピーしました');
    }
  });
})();
