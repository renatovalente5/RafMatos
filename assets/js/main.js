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
  /* A altura REAL do cabecalho por rolar, escrita em --header-real para o hero
     comecar exactamente onde ele acaba. Nao se pode fixar em CSS: a barra muda
     de altura com a largura do ecra (o lockup do logotipo encolhe abaixo dos
     920px) e com o tamanho de letra do sistema. Medida so no estado NAO rolado
     — se seguisse o estado encolhido, o hero saltava 26px ao primeiro scroll. */
  if (header) {
    var medirCab = function () {
      var eraScrolled = header.classList.contains('is-scrolled');
      if (eraScrolled) header.classList.remove('is-scrolled');
      var h = Math.round(header.getBoundingClientRect().height);
      if (eraScrolled) header.classList.add('is-scrolled');
      doc.documentElement.style.setProperty('--header-real', h + 'px');
    };
    medirCab();
    window.addEventListener('load', medirCab);
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) doc.fonts.ready.then(medirCab);
    var rc; window.addEventListener('resize', function () { clearTimeout(rc); rc = setTimeout(medirCab, 150); }, { passive: true });
  }
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

    /* No telemovel o input cobria a fotografia inteira, e um input[type=range]
       salta para o x do dedo logo no toque. Resultado: qualquer toque na foto —
       incluindo o inicio de um deslize para percorrer a pagina — atirava o
       comparador para outro sitio. Em ecras tacteis o CSS tira os eventos ao
       input e o arrasto passa a ser nosso, e so comeca depois de o gesto se
       revelar horizontal. O input fica no DOM para o teclado e para as
       tecnologias de apoio. */
    if (!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches)) return;
    var x0 = 0, y0 = 0, activo = false, id = null;
    function pos(e) {
      var r = stage.getBoundingClientRect();
      var v = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      range.value = v; set(v);
    }
    stage.addEventListener('pointerdown', function (e) {
      if (!e.isPrimary) return;
      x0 = e.clientX; y0 = e.clientY; activo = false; id = e.pointerId;
    });
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      if (!activo) {
        var dx = Math.abs(e.clientX - x0), dy = Math.abs(e.clientY - y0);
        if (dx < 8 || dx <= dy) return;   /* ainda pode ser scroll: nao tocamos */
        activo = true;
        try { stage.setPointerCapture(id); } catch (err) {}
      }
      e.preventDefault();
      pos(e);
    });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      stage.addEventListener(t, function (e) {
        if (e.pointerId !== id) return;
        try { if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id); } catch (err) {}
        activo = false; id = null;
      });
    });
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
    /* closest() e nao getAttribute() no alvo: o toque cai sempre no <svg> ou no
       <path> de 24px dentro do botao de 52px, e nenhum deles tem data-lb — os
       tres controlos estavam inertes em qualquer largura. */
    lb.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-lb]') : null;
      var a = t ? t.getAttribute('data-lb') : null;
      if (a === 'close' || e.target === lb) closeLB();
      else if (a === 'prev') openLB(cur - 1);
      else if (a === 'next') openLB(cur + 1);
    });
    doc.addEventListener('keydown', function (e) { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') openLB(cur - 1); else if (e.key === 'ArrowRight') openLB(cur + 1); });
  }

  /* ---------- Carrossel de obras: setas + barra de progresso ---------- *
     A faixa ja se percorre sem uma linha de JS — scroll nativo com scroll-snap.
     Isto e so o extra por cima. Por isso as setas e a barra nascem com `hidden`
     no HTML e e daqui que se mostram: quem chegar sem JS nao fica com controlos
     mortos no ecra. */
  (function () {
    var faixa = doc.getElementById('gallery-grid');
    var caixa = faixa && faixa.closest ? faixa.closest('.carrossel') : null;
    if (!faixa || !caixa) return;
    var setas = caixa.querySelectorAll('[data-car]');
    var barra = caixa.querySelector('.carrossel__barra');
    var polegar = barra ? barra.querySelector('.carrossel__polegar') : null;
    var pouco = window.matchMedia('(prefers-reduced-motion:reduce)');
    function comportamento() { return pouco.matches ? 'auto' : 'smooth'; }

    /* Passo = distancia entre o inicio de duas pecas (largura + intervalo),
       MEDIDA e nao calculada: a largura vem de um calc() com --n que muda em
       cada breakpoint, e uma constante em JS ficava desalinhada do CSS ao
       primeiro redimensionamento ou ao primeiro zoom. */
    function passo() {
      var a = faixa.firstElementChild, b = a && a.nextElementSibling;
      if (!a) return faixa.clientWidth;
      var ra = a.getBoundingClientRect();
      return b ? (b.getBoundingClientRect().left - ra.left) : ra.width;
    }
    function limite() { return faixa.scrollWidth - faixa.clientWidth; }
    function andar(dir) { faixa.scrollBy({ left: dir * passo(), behavior: comportamento() }); }
    function ir(x) { faixa.scrollTo({ left: x, behavior: comportamento() }); }

    var pendente = false;
    function estado() {
      pendente = false;
      var max = limite(), x = faixa.scrollLeft;
      /* 2px de tolerancia: as molduras sao uma percentagem, o scrollLeft maximo
         cai quase sempre numa fraccao de pixel e um teste exacto nunca dava o
         fim como fim. */
      var inicio = x <= 2, fim = x >= max - 2;
      setas.forEach(function (b) {
        var morta = b.getAttribute('data-car') === 'next' ? fim : inicio;
        /* Se a seta que TEM O FOCO se desactivar, o foco cai no <body> e o
           utilizador de teclado fica sem sitio nenhum a meio da navegacao.
           Passa-se o foco a outra seta antes de a desligar. */
        if (morta && !b.disabled && b === doc.activeElement) {
          var outra = caixa.querySelector('[data-car="' + (b.getAttribute('data-car') === 'next' ? 'prev' : 'next') + '"]');
          if (outra) outra.focus();
        }
        b.disabled = morta;
      });
      if (barra && polegar) {
        /* Se um dia couberem todas as fotografias no ecra, a barra nao tem nada
           para dizer e desaparece em vez de ficar cheia. */
        var ha = max > 4;
        barra.hidden = !ha;
        if (ha) {
          var frac = faixa.clientWidth / faixa.scrollWidth;
          polegar.style.width = (frac * 100).toFixed(3) + '%';
          polegar.style.transform = 'translateX(' + ((x / max) * (100 / frac - 100)).toFixed(3) + '%)';
        }
      }
    }
    function agendar() { if (!pendente) { pendente = true; window.requestAnimationFrame(estado); } }

    setas.forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () { andar(b.getAttribute('data-car') === 'next' ? 1 : -1); });
    });
    if (barra) barra.hidden = false;
    faixa.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar, { passive: true });

    /* Tocar numa peca CORTADA pelo bordo traz essa peca para dentro, em vez de
       abrir a lightbox. A nesga da direita tem 44px e fica no bordo do ecra, que
       e onde o polegar direito bate por acidente; abrir uma fotografia a ecra
       inteiro a partir de uma fatia que mal se ve parecia um erro do site.
       Vale para os dois lados, e a conta e a mesma nos dois: se a peca nao esta
       inteira dentro da janela, o clique e um pedido para a ver.
       Fase de CAPTURA, para chegar antes do delegado da lightbox — que esta
       ligado a esta mesma faixa e nao se toca. */
    faixa.addEventListener('click', function (e) {
      var f = e.target.closest ? e.target.closest('.gitem') : null;
      if (!f) return;
      var rf = faixa.getBoundingClientRect(), rp = f.getBoundingClientRect();
      /* 4px de tolerancia: as molduras sao uma percentagem e a peca que esta
         "inteira" cai quase sempre a uma fraccao de pixel do bordo. */
      if (Math.min(rp.right, rf.right) - Math.max(rp.left, rf.left) >= rp.width - 4) return;
      e.stopPropagation();
      var cs = window.getComputedStyle(faixa);
      var pad = parseFloat(cs.paddingInlineStart || cs.paddingLeft) || 0;
      faixa.scrollBy({ left: rp.left - rf.left - pad, behavior: comportamento() });
    }, true);

    /* Teclado. A faixa tem tabindex no HTML, por isso ate sem JS o browser ja
       lhe move o scroll com as setas — no Chrome, e MEDIDO, de peca em peca
       (0 -> 329 -> 657). Nao trocamos isso por gosto: trocamos porque o passo
       nativo depende de cada browser implementar o snap por teclado, e porque
       so daqui se consegue calar as setas quando a lightbox esta aberta —
       ela abre a partir de um clique DENTRO da faixa (que assim fica com o
       foco) e usa as mesmas setas para mudar de fotografia. */
    faixa.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k !== 'ArrowRight' && k !== 'ArrowLeft' && k !== 'Home' && k !== 'End') return;
      /* O preventDefault vem ANTES da guarda, e nao depois: a faixa e um
         contentor com scroll E com foco, por isso o browser tambem lhe mexe
         sozinho. Medido: com a lightbox aberta, sair da funcao sem travar o
         evento deixava a faixa andar 329px por tras dela. */
      e.preventDefault();
      if (doc.body.classList.contains('menu-open')) return;
      if (k === 'ArrowRight') andar(1);
      else if (k === 'ArrowLeft') andar(-1);
      else if (k === 'Home') ir(0);
      else ir(limite());
    });

    estado();
    window.addEventListener('load', estado);
  })();

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
    /* Enquanto o banner ocupa o fundo do ecra, assenta em cima da barra legal do
       rodape — identificacao da empresa e Livro de Reclamacoes. Damos ao rodape
       exactamente a altura do banner (medida, nao adivinhada: a 320px ele chega
       aos 250px e um valor fixo ficava sempre curto ou exagerado). */
    function medir() {
      if (!banner || banner.hidden) return;
      doc.documentElement.style.setProperty('--banner-h', banner.offsetHeight + 'px');
    }
    function show() {
      if (!banner) return;
      banner.hidden = false; doc.body.classList.add('tem-banner'); medir();
    }
    function hide() {
      if (!banner) return;
      banner.hidden = true; doc.body.classList.remove('tem-banner');
      doc.documentElement.style.removeProperty('--banner-h');
    }
    var rb; window.addEventListener('resize', function () { clearTimeout(rb); rb = setTimeout(medir, 150); }, { passive: true });
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
