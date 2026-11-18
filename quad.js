/* ============================================================
   QUAD — shared behavior (plain JS, no framework, no build).
   1) inject sticky nav + footer (avoids duplicating in 12 pages)
   2) scroll motion: count-up, dorm-row reveal, crest stroke-draw,
      divider crest travelers along their SVG path (native SVG API).
   Page opts in via <body data-page="home" data-theme="dark">.
   ============================================================ */
(function () {
  'use strict';

  var NAV_LINKS = [
    { key: 'home',   label: 'home',       href: 'index.html' },
    { key: 'dorms',  label: 'dorms',      href: 'index.html#dorms' },
    { key: 'rooms',  label: 'rooms',      href: 'room-single.html' },
    { key: 'vibe',   label: 'vibe check', href: 'vibe-check.html' },
    { key: 'lore',   label: 'the lore',   href: 'lore.html' }
  ];
  var BOOK = { label: 'book now', href: 'book.html' };
  var DORM_MENU = [
    { label: 'Pulse',  href: 'pulse.html',  color: '#FF3D00' },
    { label: 'Social', href: 'social.html', color: '#FF2E88' },
    { label: 'Focus',  href: 'focus.html',  color: '#3D5AFE' },
    { label: 'Nest',   href: 'nest.html',   color: '#E2725B' }
  ];
  var NOTE = 'QUAD Student Living, Northaven. A fictional brand — but the vibes are real. Crafted by WEBDEVCAVEMAN.';

  function buildNav(page, light) {
    var nav = document.createElement('nav');
    nav.className = 'quad-nav' + (light ? ' quad-nav--light' : '');
    nav.setAttribute('aria-label', 'main');

    var brand = document.createElement('a');
    brand.className = 'quad-nav__brand';
    brand.href = 'index.html';
    brand.textContent = 'QUAD';
    nav.appendChild(brand);

    var row = document.createElement('div');
    row.className = 'quad-nav__links';
    row.setAttribute('data-navlinks', '');
    NAV_LINKS.forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      if (l.key === page) { a.classList.add('is-active'); a.setAttribute('aria-current', 'page'); }

      if (l.key === 'dorms') {
        a.classList.add('quad-nav__toplink');
        a.setAttribute('aria-haspopup', 'true');
        var item = document.createElement('div');
        item.className = 'quad-nav__item';
        var menu = document.createElement('div');
        menu.className = 'quad-nav__menu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'dorms');
        DORM_MENU.forEach(function (d) {
          var m = document.createElement('a');
          m.className = 'quad-nav__menuitem';
          m.href = d.href;
          m.setAttribute('role', 'menuitem');
          var dot = document.createElement('span');
          dot.className = 'shield';
          dot.style.color = d.color;
          m.appendChild(dot);
          m.appendChild(document.createTextNode(d.label));
          menu.appendChild(m);
        });
        item.appendChild(a);
        item.appendChild(menu);
        row.appendChild(item);
      } else {
        row.appendChild(a);
      }
    });
    var book = document.createElement('a');
    book.className = 'quad-nav__book';
    book.href = BOOK.href;
    book.textContent = BOOK.label;
    if (page === 'book') book.setAttribute('aria-current', 'page');
    row.appendChild(book);
    nav.appendChild(row);

    // mobile toggle web component (defined in quad-nav.js)
    var toggle = document.createElement('quad-nav-toggle');
    toggle.setAttribute('theme', light ? 'light' : 'dark');
    toggle.setAttribute('accent', light ? '#E2725B' : '#FFD600');
    nav.appendChild(toggle);

    return nav;
  }

  function buildFooter(light) {
    var f = document.createElement('footer');
    f.className = 'quad-footer' + (light ? ' quad-footer--light' : '');
    var brand = document.createElement('span');
    brand.className = 'quad-footer__brand';
    brand.textContent = 'QUAD';
    var note = document.createElement('p');
    note.className = 'quad-footer__note';
    note.textContent = NOTE;
    f.appendChild(brand); f.appendChild(note);
    return f;
  }

  function injectChrome() {
    var page = document.body.getAttribute('data-page') || '';
    var light = document.body.getAttribute('data-theme') === 'light';
    // nav goes first in body; footer last — unless page already placed markers
    var navSlot = document.querySelector('[data-quad-nav]');
    var footSlot = document.querySelector('[data-quad-footer]');
    var nav = buildNav(page, light);
    var foot = buildFooter(light);
    if (navSlot) navSlot.replaceWith(nav); else document.body.insertBefore(nav, document.body.firstChild);
    if (footSlot) footSlot.replaceWith(foot); else document.body.appendChild(foot);
  }

  /* ---------- motion ---------- */
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll-based "enters view" — robust where IntersectionObserver notifications
  // are unreliable (some automation/synthetic scrolls skip IO recomputation).
  function inViewRatio(el) {
    var r = el.getBoundingClientRect();
    var vh = innerHeight || document.documentElement.clientHeight;
    if (r.bottom <= 0 || r.top >= vh || r.height === 0) return 0;
    var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return visible / Math.min(r.height, vh);
  }
  function onView(els, ratio, cb) {
    var pending = [].slice.call(els);
    if (!pending.length) return;
    function check() {
      pending = pending.filter(function (el) {
        if (inViewRatio(el) >= ratio) { cb(el); return false; }
        return true;
      });
      if (!pending.length) { removeEventListener('scroll', check); removeEventListener('resize', check); }
    }
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
  }

  function countUp() {
    onView(document.querySelectorAll('[data-countup]'), 0.6, function (el) {
      var target = +el.getAttribute('data-countup');
      if (REDUCED) { el.textContent = target; return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 2)) * target); // easeOutQuad
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function dormReveal() {
    var rows = document.querySelectorAll('.dormrow');
    if (!rows.length) return;
    // pre-measure crest stroke lengths so CSS can hide them before reveal
    if (!REDUCED) {
      document.querySelectorAll('[data-crest] .stroke').forEach(function (s) {
        try { s.style.setProperty('--len', s.getTotalLength()); } catch (e) {}
      });
    }
    onView(rows, 0.25, function (row) {
      row.classList.add('revealed');
      var crest = row.querySelector('[data-crest]');
      if (crest && !REDUCED) crest.classList.add('drawn');
    });
  }

  function dividerTravelers() {
    if (REDUCED) return;
    var dividers = [].slice.call(document.querySelectorAll('.divider')).map(function (el) {
      var path = el.querySelector('[data-motion]');
      var img = el.querySelector('.divider__traveler');
      if (!path || !img) return null;
      var vb = (path.ownerSVGElement.getAttribute('viewBox') || '0 0 1440 120').split(/\s+/).map(Number);
      return { el: el, path: path, img: img, len: path.getTotalLength(), vw: vb[2], vh: vb[3] };
    }).filter(Boolean);
    if (!dividers.length) return;

    var ticking = false;
    function update() {
      ticking = false;
      var vh = innerHeight;
      dividers.forEach(function (d) {
        var r = d.el.getBoundingClientRect();
        // progress: 0 when divider top hits viewport bottom, 1 when divider bottom leaves top
        var p = (vh - r.top) / (vh + r.height);
        if (p < 0 || p > 1) { d.img.style.opacity = '0'; return; }
        var pt = d.path.getPointAtLength(p * d.len);
        var x = pt.x * (r.width / d.vw);
        var y = pt.y * (r.height / d.vh);
        d.img.style.opacity = '1';
        d.img.style.transform = 'translate(' + (x - 15) + 'px,' + (y - 16) + 'px)';
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
  }

  /* ---------- dorm-page motion (guarded; no-ops elsewhere) ---------- */
  function heroVideo() {
    if (!REDUCED) return;
    var v = document.querySelector('[data-heroloop]');
    if (v) { v.pause(); v.removeAttribute('autoplay'); v.removeAttribute('src'); v.load(); }
  }

  function scrolly() {
    var sec = document.querySelector('.scrolly');
    if (!sec) return;
    var imgs = sec.querySelectorAll('.scrolly__media img');
    var blocks = sec.querySelectorAll('.beat-block');
    var btns = sec.querySelectorAll('.beat-btn');
    var cur = -1;
    function apply(b) {
      if (b === cur) return; cur = b;
      imgs.forEach(function (el, i) { el.classList.toggle('on', i === b); });
      blocks.forEach(function (el, i) { el.classList.toggle('on', i === b); });
      btns.forEach(function (el, i) { el.classList.toggle('on', i === b); });
    }
    function onScroll() {
      var r = sec.getBoundingClientRect(), span = r.height - innerHeight;
      var p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      apply(Math.min(2, Math.floor(p * 3)));
    }
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
        scrollTo({ top: top + span * (i / 3 + 0.12), behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function features() {
    var grid = document.querySelector('.features');
    if (!grid) return;
    var items = grid.querySelectorAll('.feature');
    onView([grid], 0.3, function () {
      items.forEach(function (it, i) { setTimeout(function () { it.classList.add('lit'); }, REDUCED ? 0 : i * 100); });
    });
  }

  function roomSwitcher() {
    var root = document.querySelector('[data-room]');
    if (!root) return;
    var DORMS = {
      pulse:  { lead: '#FF3D00', motto: 'NO REST DAYS',       name: 'PULSE' },
      social: { lead: '#FF2E88', motto: "EVERYONE'S INVITED", name: 'SOCIAL' },
      focus:  { lead: '#3D5AFE', motto: 'LOCK IN',            name: 'FOCUS' },
      nest:   { lead: '#E2725B', motto: 'STAY SOFT',          name: 'NEST' }
    };
    var worldEl = root.querySelector('[data-rworld]'), vibeEl = root.querySelector('[data-rvibe]');
    var stroke = document.querySelector('[data-rstrokepath]'), trav = document.querySelector('[data-rtravel]');
    function apply(k) {
      var d = DORMS[k]; if (!d) return;
      try { localStorage.setItem('quad-room-dorm', k); } catch (e) {}
      var r = document.documentElement;
      r.setAttribute('data-room-dorm', k);
      r.style.setProperty('--room-lead', d.lead);
      root.querySelectorAll('[data-rtab]').forEach(function (t) {
        t.setAttribute('aria-pressed', t.dataset.rtab === k ? 'true' : 'false');
      });
      if (worldEl) worldEl.textContent = d.name;
      if (vibeEl) vibeEl.textContent = d.motto;
      if (stroke) stroke.setAttribute('stroke', d.lead);
      if (trav) trav.src = 'assets/crests/crest-' + k + '-mono.svg?v=4';
    }
    root.querySelectorAll('[data-rtab]').forEach(function (t) {
      t.addEventListener('click', function () { apply(t.dataset.rtab); });
    });
    var saved = null; try { saved = localStorage.getItem('quad-room-dorm'); } catch (e) {}
    apply((saved && DORMS[saved]) ? saved : (document.documentElement.getAttribute('data-room-dorm') || 'pulse'));
  }

  function loreReveal() {
    var secs = document.querySelectorAll('[data-lore]');
    if (!secs.length) return;
    function onScroll() {
      secs.forEach(function (sec) {
        var r = sec.getBoundingClientRect(), span = r.height - innerHeight;
        var p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
        var lines = sec.querySelectorAll('[data-line]');
        var vis = Math.min(lines.length, Math.floor(p * (lines.length + 1)) + (p > 0.02 ? 1 : 0));
        lines.forEach(function (el, i) { el.classList.toggle('shown', i < Math.max(1, vis)); });
        if (!REDUCED) { var img = sec.querySelector('[data-parallax]'); if (img) img.style.transform = 'translateY(' + ((p - 0.5) * -6) + '%)'; }
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    injectChrome();
    if (!REDUCED) document.documentElement.classList.add('js-motion');
    countUp();
    dormReveal();
    dividerTravelers();
    heroVideo();
    scrolly();
    features();
    roomSwitcher();
    loreReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
