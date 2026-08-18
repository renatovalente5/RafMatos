/* =============================================================
   RAF MATOS — main.js
   Header que encolhe · menu mobile full-screen · scrollspy · reveals ·
   formulário→WhatsApp · consentimento de cookies + Google Maps
   ============================================================= */
(function () {
  'use strict';
  var doc = document;

  /* ---------- Header: encolher no scroll (logo grande ↔ pequeno) ---------- */
  var header = doc.querySelector('[data-header]');
  if (header) {
    var scrolled = false, ticking = false;
    var onScroll = function () {
      var s = window.scrollY > 20;
      if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile (ecrã inteiro) ---------- */
  var menu = doc.getElementById('mobile-menu');
  var openBtn = doc.querySelector('[data-menu-open]');
  var lastFocus = null;
  function focusables() { return menu ? menu.querySelectorAll('a[href],button:not([disabled])') : []; }
  function openMenu() {
    if (!menu) return;
    lastFocus = doc.activeElement;
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
    openBtn && openBtn.setAttribute('aria-expanded', 'true');
    doc.body.classList.add('menu-open');
    var f = focusables(); if (f.length) setTimeout(function () { f[0].focus(); }, 60);
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
    openBtn && openBtn.setAttribute('aria-expanded', 'false');
    doc.body.classList.remove('menu-open');
    if (lastFocus) lastFocus.focus();
  }
  if (openBtn) openBtn.addEventListener('click', openMenu);
  doc.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  menu && menu.querySelectorAll('[data-menu-link]').forEach(function (a) { a.addEventListener('click', closeMenu); });
  doc.addEventListener('keydown', function (e) {
    if (!menu || !menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'Tab') {
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var mq = window.matchMedia('(min-width:921px)');
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
    if (menu && mq.matches && menu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- Scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__links a'));
  var sections = navLinks.map(function (a) { var hr = a.getAttribute('href') || ''; return hr.charAt(0) === '#' ? doc.querySelector(hr) : null; }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = doc.querySelectorAll('[data-reveal]');
  function revealAll() { reveals.forEach(function (el) { el.classList.add('is-in'); }); }
  function inView(el) { var r = el.getBoundingClientRect(); return r.top < (window.innerHeight || 0) && r.bottom > 0; }
  if ('IntersectionObserver' in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
    var showInView = function () { reveals.forEach(function (el) { if (inView(el)) el.classList.add('is-in'); }); };
    showInView();
    window.addEventListener('load', function () { showInView(); setTimeout(revealAll, 4000); });
  } else { revealAll(); }

  /* ---------- Formulário de orçamento → WhatsApp ---------- */
  var qf = doc.getElementById('quote-form');
  if (qf) {
    qf.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (qf.nome.value || '').trim();
      if (!nome) { qf.nome.setAttribute('aria-invalid', 'true'); qf.nome.focus(); return; }
      qf.nome.removeAttribute('aria-invalid');
      var consent = doc.getElementById('f-consent');
      if (consent && !consent.checked) { consent.focus(); return; }
      var contacto = (qf.contacto.value || '').trim();
      var servico = qf.servico.value || '';
      var msg = (qf.mensagem.value || '').trim();
      var t = 'Olá! Sou ' + nome + '.';
      if (servico) t += ' Preciso de: ' + servico + '.';
      if (msg) t += ' ' + msg;
      if (contacto) t += ' O meu contacto: ' + contacto + '.';
      t += ' Podem dar-me um orçamento?';
      window.open('https://wa.me/351937605547?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });
  }

  /* ---------- Slider Antes & Depois ---------- */
  doc.querySelectorAll('.ba').forEach(function (ba) {
    var stage = ba.querySelector('.ba__stage'), range = ba.querySelector('.ba__range');
    if (!stage || !range) return;
    function set(v) { stage.style.setProperty('--pos', v + '%'); }
    range.addEventListener('input', function () { set(range.value); });
    set(range.value || 50);
  });

  /* ---------- Galeria de obras + lightbox ---------- */
  var ggrid = doc.getElementById('gallery-grid');
  var lb = doc.getElementById('lightbox');
  if (ggrid && lb) {
    var items = Array.prototype.slice.call(ggrid.querySelectorAll('.gitem')).map(function (fig) {
      var img = fig.querySelector('img'); var cap = fig.querySelector('figcaption');
      return { src: img ? img.getAttribute('src') : '', alt: img ? img.alt : '', cap: cap ? cap.textContent : '' };
    });
    var lbImg = lb.querySelector('.lightbox__img'), lbCap = lb.querySelector('.lightbox__cap'), cur = 0;
    function openLB(i) { cur = (i + items.length) % items.length; lbImg.src = items[cur].src; lbImg.alt = items[cur].alt; lbCap.textContent = items[cur].cap; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); doc.body.classList.add('menu-open'); }
    function closeLB() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); doc.body.classList.remove('menu-open'); }
    ggrid.addEventListener('click', function (e) { var f = e.target.closest('.gitem'); if (!f) return; openLB(items.findIndex(function (it) { return it.src === f.querySelector('img').getAttribute('src'); })); });
    lb.addEventListener('click', function (e) { var a = e.target.getAttribute && e.target.getAttribute('data-lb'); if (a === 'close' || e.target === lb) closeLB(); else if (a === 'prev') openLB(cur - 1); else if (a === 'next') openLB(cur + 1); });
    doc.addEventListener('keydown', function (e) { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') openLB(cur - 1); else if (e.key === 'ArrowRight') openLB(cur + 1); });
  }

  /* ---------- "Ver mais" (encurtar secções no telemóvel) ---------- */
  (function () {
    var mq = window.matchMedia('(max-width:600px)');
    function apply() {
      doc.querySelectorAll('[data-collapse]').forEach(function (grid) {
        var max = parseInt(grid.getAttribute('data-collapse'), 10) || 4;
        var wrap = grid.parentNode.querySelector('.more-wrap');
        var btn = wrap ? wrap.querySelector('[data-more]') : null;
        var items = Array.prototype.slice.call(grid.children);
        var expanded = grid.classList.contains('is-expanded');
        if (mq.matches && items.length > max) {
          if (wrap) wrap.hidden = false;
          items.forEach(function (el, i) {
            var show = expanded || i < max;
            el.style.display = show ? '' : 'none';
            if (show) el.classList.add('is-in');
          });
          if (btn) btn.textContent = expanded ? 'Ver menos' : 'Ver mais';
        } else {
          if (wrap) wrap.hidden = true;
          items.forEach(function (el) { el.style.display = ''; });
        }
      });
    }
    doc.querySelectorAll('[data-more]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var grid = doc.querySelector(btn.getAttribute('data-more'));
        if (!grid) return;
        grid.classList.toggle('is-expanded');
        apply();
      });
    });
    apply();
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(apply);
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(apply, 150); }, { passive: true });
  })();

  /* ---------- Cookies + Google Maps (consentimento) ---------- */
  (function () {
    var KEY = 'rm-consent';
    var banner = doc.getElementById('cookie-banner');
    var mapBox = doc.getElementById('map-box');
    function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    function loadMap() {
      if (!mapBox || mapBox.querySelector('iframe')) return;
      var f = doc.createElement('iframe');
      f.src = mapBox.getAttribute('data-embed');
      f.title = 'Mapa Google — Raf Matos, Vila Nova de Gaia';
      f.loading = 'lazy'; f.setAttribute('referrerpolicy', 'no-referrer'); f.setAttribute('allowfullscreen', '');
      f.style.cssText = 'width:100%;height:100%;border:0;display:block';
      mapBox.innerHTML = ''; mapBox.appendChild(f);
    }
    /* Guardado ANTES de o iframe entrar: e a fachada a que voltamos se o
       visitante mudar de ideias. Sem isto, retirar o consentimento so tinha
       efeito no proximo carregamento — e o mapa continuava a falar com a
       Google entretanto. */
    var fachada = mapBox ? mapBox.innerHTML : '';
    function unloadMap() { if (mapBox && mapBox.querySelector('iframe')) mapBox.innerHTML = fachada; }
    function show() { if (banner) banner.hidden = false; }
    function hide() { if (banner) banner.hidden = true; }
    var cur = get();
    if (cur === 'accepted') loadMap();
    else if (cur !== 'rejected') show();
    if (banner) banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]'); if (!b) return;
      var v = b.getAttribute('data-consent'); set(v); hide();
      if (v === 'accepted') loadMap(); else unloadMap();
    });
    /* Delegado no contentor, e nao ligado ao botao: o innerHTML do mapBox e
       substituido nos dois sentidos e um listener preso ao botao morria ai. */
    if (mapBox) mapBox.addEventListener('click', function (e) {
      if (!e.target.closest('[data-map-load]')) return;
      if (get() === 'accepted') loadMap(); else show();
    });
    /* RGPD art. 7.º/3: retirar o consentimento tem de ser tao facil como
       da-lo. O link do rodape reabre o banner; as paginas legais nao tem
       banner, por isso mandam para a inicial com ?cookies=1. */
    doc.querySelectorAll('[data-cookie-manage]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); show(); }); });
    if (banner && /[?&]cookies=1(&|$)/.test(location.search)) {
      show();
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
    }
  })();

  /* ---------- Ano no footer ---------- */
  var y = doc.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
