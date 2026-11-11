/**
 * CLOCKIT 2026 - Scroll-World Cyber-Fantasy Engine
 * Extended from oso95/scroll-world (MIT License).
 * Features:
 * 1. Landing page initial mount with 0-offset top viewport alignment.
 * 2. 240-frame continuous scrub canvas driving the camera flight through the diorama.
 * 3. Exact clean white serif typography matching reference Image 2.
 * 4. Interactive route rail, progress bar, and floating story cards.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.mountScrollWorld = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  function mountScrollWorld(container, config) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const smallMQ = window.matchMedia('(max-width: 860px)');
    const isMobile = () => coarse || smallMQ.matches;
    const SECTIONS = config.sections || [];
    const CONNECTORS = config.connectors || [];
    const CONNECTORS_M = config.connectorsMobile || [];
    const DIVE_W = config.diveScroll || 1.4;
    const CONN_W = config.connScroll || 0.9;
    const CROSSFADE = (config.crossfade != null) ? config.crossfade : 0.14;
    const N = SECTIONS.length;
    if (!N) return;

    injectCSS();
    container.classList.add('sw-root');

    // Build segment chain
    const SEGMENTS = [];
    SECTIONS.forEach((s, i) => {
      const dive = {
        kind: 'dive', si: i, clip: s.clip, clipM: s.clipMobile,
        still: s.still, stillM: s.stillMobile,
        accent: s.accent || '#f59e0b',
        w: s.scroll || DIVE_W,
        linger: s.linger || 0
      };
      SEGMENTS.push(dive);
      s._seg = dive;

      if (i < N - 1 && CONNECTORS[i]) {
        SEGMENTS.push({
          kind: 'conn', si: i, clip: CONNECTORS[i], clipM: CONNECTORS_M[i],
          still: SECTIONS[i + 1].still, stillM: SECTIONS[i + 1].stillMobile,
          accent: SECTIONS[i + 1].accent || '#06b6d4',
          w: CONN_W
        });
      }
    });
    const NSEG = SEGMENTS.length;

    // Build DOM inside container
    const sky = el('div', 'sw-sky');
    if (config.atmosphere !== false) {
      sky.appendChild(el('div', 'sw-sky__grad'));
      sky.appendChild(el('div', 'sw-sky__glow'));
    }
    const particles = el('div', 'sw-particles'); sky.appendChild(particles);

    const scrollbar = el('div', 'sw-scrollbar');
    const scrollbarFill = el('span'); scrollbar.appendChild(scrollbarFill);

    const stage = el('div', 'sw-stage');

    // Continuous 240-Frame Scrub Canvas
    const scrubCanvas = el('canvas', 'sw-stage__canvas');
    scrubCanvas.style.position = 'absolute';
    scrubCanvas.style.inset = '0';
    scrubCanvas.style.width = '100%';
    scrubCanvas.style.height = '100%';
    scrubCanvas.style.objectFit = 'cover';
    scrubCanvas.style.zIndex = '0';
    stage.appendChild(scrubCanvas);
    const scrubCtx = scrubCanvas.getContext('2d', { alpha: false });

    const TOTAL_FRAMES = 240;
    const scrubFrames = new Array(TOTAL_FRAMES);
    let loadedFrameCount = 0;

    function getFrameSrc(idx) {
      return `frame_${String(idx).padStart(5, '0')}.jpg`;
    }

    // Load Frame 0 immediately for zero delay
    const img0 = new Image();
    img0.src = getFrameSrc(0);
    img0.onload = () => {
      scrubFrames[0] = img0;
      loadedFrameCount++;
      resizeScrubCanvas();
      drawScrubFrame(0);
      loadFramesBatch();
    };

    function loadFramesBatch() {
      let next = 1;
      function step() {
        if (next >= TOTAL_FRAMES) return;
        const end = Math.min(next + 16, TOTAL_FRAMES);
        const p = [];
        for (let i = next; i < end; i++) {
          const img = new Image();
          img.src = getFrameSrc(i);
          p.push(new Promise(res => {
            img.onload = () => { scrubFrames[i] = img; loadedFrameCount++; res(); };
            img.onerror = res;
          }));
        }
        next = end;
        Promise.all(p).then(() => {
          if (next < TOTAL_FRAMES) setTimeout(step, 20);
        });
      }
      step();
    }

    function resizeScrubCanvas() {
      const rect = scrubCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scrubCanvas.width = (rect.width || window.innerWidth) * dpr;
      scrubCanvas.height = (rect.height || window.innerHeight) * dpr;
    }

    function drawScrubFrame(frameIndex) {
      let img = scrubFrames[frameIndex];
      if (!img) {
        for (let off = 1; off < 30; off++) {
          if (scrubFrames[frameIndex - off]) { img = scrubFrames[frameIndex - off]; break; }
          if (scrubFrames[frameIndex + off]) { img = scrubFrames[frameIndex + off]; break; }
        }
      }
      if (!img && scrubFrames[0]) img = scrubFrames[0];
      if (!img) return;

      const w = scrubCanvas.width;
      const h = scrubCanvas.height;
      if (!w || !h) return;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;

      let dw, dh, ox, oy;
      if (canvasRatio > imgRatio) {
        dw = w;
        dh = w / imgRatio;
        ox = 0;
        oy = (h - dh) * 0.44;
      } else {
        dh = h;
        dw = h * imgRatio;
        ox = (w - dw) * 0.5;
        oy = 0;
      }
      scrubCtx.drawImage(img, ox, oy, dw, dh);
    }

    const copylayer = el('div', 'sw-copylayer');
    const route = el('div', 'sw-route');
    route.style.transition = 'opacity 0.3s ease';
    const hint = el('div', 'sw-hint');
    hint.style.display = 'none'; // Keep video 100% unobstructed as requested
    const track = el('div', 'sw-track');

    const fixedElements = [sky, scrollbar, stage, copylayer, route, hint];
    fixedElements.forEach(n => {
      n.style.transition = 'opacity 0.35s ease';
      container.appendChild(n);
    });
    container.appendChild(track);

    // Segment scenes for fallback/crossfade stills
    SEGMENTS.forEach(s => {
      const scene = el('div', 'sw-scene'); scene.style.setProperty('--sw-accent', s.accent || '');
      const img = el('img', 'sw-scene__still'); img.alt = 'CLOCKIT Realm'; img.decoding = 'async'; img.loading = 'lazy';
      const poster = (isMobile() && s.stillM) ? s.stillM : s.still;
      if (poster) img.src = poster;
      scene.appendChild(img); stage.appendChild(scene);
      s.el = scene; s.img = img; s.video = null; s.hasClip = false;
      s.loading = false; s.ready = false; s.cur = 0; s.target = 0; s.visible = false;
    });

    // Copy & Route Cards
    const copies = [], dots = [];
    SECTIONS.forEach((s, i) => {
      const c = el('article', 'sw-copy'); c.style.setProperty('--sw-accent', s.accent || '');
      c.innerHTML =
        `<span class="sw-copy__num">${pad(i + 1)} / ${pad(N)}</span>` +
        (s.eyebrow ? `<span class="sw-copy__eyebrow">${esc(s.eyebrow)}</span>` : '') +
        (s.title ? `<h2 class="sw-copy__title">${esc(s.title)}</h2>` : '') +
        (s.ribbon ? `<div class="sw-copy__ribbon">${esc(s.ribbon)}</div>` : '') +
        (s.subheading ? `<div class="sw-copy__subheading">${esc(s.subheading)}</div>` : '') +
        (s.catchphrase ? `<div class="sw-copy__catchphrase">${esc(s.catchphrase)}</div>` : '') +
        (s.body ? `<p class="sw-copy__body">${esc(s.body)}</p>` : '') +
        (s.extraHtml || '') +
        (s.tags && s.tags.length ? `<ul class="sw-copy__tags">${s.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '') +
        (s.cta ? `<div class="sw-copy__cta">${ctaBtns(s.cta)}</div>` : '');
      copylayer.appendChild(c); copies.push(c);

      const dot = el('button', 'sw-route__dot'); dot.style.setProperty('--sw-accent', s.accent || '');
      dot.innerHTML = `<span class="sw-route__label">${esc(s.label || '')}</span><i></i>`;
      dot.addEventListener('click', () => jumpTo(i)); route.appendChild(dot); dots.push(dot);
    });

    // Math & Layout
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
    const lingerEase = (x, L) => { L = clamp(L); const c = x - 0.5; return (1 - L) * x + L * (4 * c * c * c + 0.5); };

    let vh = window.innerHeight, stageX = 0, totalW = 0, activeIndex = -1, ticking = false;
    let laidOutW = window.innerWidth;
    let containerTop = 0;

    function layout() {
      vh = window.innerHeight;
      laidOutW = window.innerWidth;
      stageX = window.innerWidth > 860 ? 4 : 0;
      resizeScrubCanvas();

      const rect = container.getBoundingClientRect();
      containerTop = rect.top + (window.scrollY || window.pageYOffset);

      let off = 0;
      SEGMENTS.forEach(s => { s.start = off * vh; off += s.w; s.end = off * vh; });
      totalW = off;
      track.style.height = (totalW * vh + vh) + 'px';
      read();
    }

    function jumpTo(i) {
      const seg = SECTIONS[i]._seg;
      const targetY = containerTop + seg.start + (seg.end - seg.start) * 0.5;
      window.scrollTo({ top: targetY, behavior: reduce ? 'auto' : 'smooth' });
    }

    function read() {
      const scrollY = window.scrollY || window.pageYOffset;
      const yRel = scrollY - containerTop;
      const totalHeight = totalW * vh + vh;

      // Active only when scrolled into the scroll-world container
      const isInSection = (yRel >= -20 && yRel <= totalHeight + 20);
      const targetOpacity = isInSection ? '1' : '0';
      const pointerState = isInSection ? 'auto' : 'none';

      fixedElements.forEach(n => {
        n.style.opacity = targetOpacity;
        n.style.pointerEvents = (n === route || n === hint) ? pointerState : 'none';
      });

      if (!isInSection && yRel > totalHeight) {
        ticking = false;
        return;
      }

      // Scrub frame based on scroll progress
      const globalProgress = clamp(yRel / (totalW * vh), 0, 1);
      const currentTargetFrame = Math.floor(globalProgress * (TOTAL_FRAMES - 1));
      drawScrubFrame(currentTargetFrame);

      const fade = CROSSFADE * vh;
      let ci = 0;
      for (let i = 0; i < NSEG; i++) if (yRel >= SEGMENTS[i].start) ci = i;

      for (let i = 0; i < NSEG; i++) {
        const s = SEGMENTS[i];
        const local = clamp((yRel - s.start) / (s.end - s.start), 0, 1);
        s.target = s.linger ? lingerEase(local, s.linger) : local;
        let outside = 0;
        if (yRel < s.start) outside = s.start - yRel; else if (yRel > s.end) outside = yRel - s.end;
        const op = smooth(1 - outside / fade);
        s.el.style.opacity = op;
        s.visible = op > 0.001;
      }

      for (let i = 0; i < N; i++) {
        const seg = SECTIONS[i]._seg;
        const pr = clamp((yRel - seg.start) / (seg.end - seg.start), 0, 1);
        const before = yRel < seg.start, after = yRel > seg.end;
        let cop;
        if (i === 0) cop = after ? 0 : smooth(1 - pr / 0.65); // greets immediately on landing!
        else if (i === N - 1) cop = before ? 0 : smooth(pr / 0.4);
        else cop = (before || after) ? 0 : smooth(1 - Math.abs(pr - 0.5) / 0.5);

        const c = copies[i];
        c.style.opacity = cop;
        c.style.transform = reduce ? 'none' : `translateY(${(0.5 - pr) * 4}vh)`;
        c.style.pointerEvents = cop > 0.4 ? 'auto' : 'none';
      }

      const cur = SEGMENTS[ci];
      const near = clamp(cur.kind === 'dive' ? cur.si
        : (((yRel - cur.start) / (cur.end - cur.start)) > 0.5 ? cur.si + 1 : cur.si), 0, N - 1);
      if (near !== activeIndex) {
        activeIndex = near;
        dots.forEach((d, k) => d.classList.toggle('is-active', k === near));
        container.style.setProperty('--sw-accent', SECTIONS[near].accent || '');
      }
      route.style.opacity = (near === 0) ? '0' : '1';

      scrollbarFill.style.transform = `scaleX(${clamp(yRel / (totalW * vh))})`;
      hint.style.opacity = clamp(1 - yRel / (0.4 * vh));
      if (particles) particles.style.transform = `translate3d(0, ${-yRel * 0.05}px, 0)`;
      ticking = false;
    }

    seedParticles(particles, reduce || coarse);
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(read); } }, { passive: true });

    function onResize() {
      if (coarse && window.innerWidth === laidOutW) return;
      layout();
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', layout);
    window.addEventListener('load', layout);
    layout();

    // Helpers
    function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }
    function pad(n) { return String(n).padStart(2, '0'); }
    function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
    function ctaBtns(cta) {
      let h = '';
      if (cta.primary) {
        h += `<a class="sw-btn sw-btn--primary js-open-reg-modal" href="${esc(cta.primary.href || '#register')}">${esc(cta.primary.label)}</a>`;
      }
      if (cta.secondary) {
        h += `<a class="sw-btn sw-btn--ghost" href="${esc(cta.secondary.href || '#badges')}">${esc(cta.secondary.label)}</a>`;
      }
      return h;
    }
  }

  function seedParticles(host, reduce) {
    if (!host || reduce) return;
    const kinds = ['dot', 'dot', 'ring'];
    const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
    for (let k = 0; k < 20; k++) {
      const s = document.createElement('span');
      s.className = 'sw-pt sw-pt--' + kinds[k % kinds.length];
      s.style.left = seeds[k % seeds.length] + 'vw';
      s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + 'vh';
      s.style.setProperty('--sw-sc', (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
      const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = (-(seeds[(k * 2) % seeds.length] % dur)) + 's';
      host.appendChild(s);
    }
  }

  function injectCSS() {
    if (document.getElementById('sw-css')) return;
    const css = `
    .sw-root{--sw-bg:#060913;--sw-ink:#f8fafc;--sw-ink-soft:#cbd5e1;--sw-accent:#f59e0b;
      --sw-font-display:'Cinzel Decorative','Cinzel',serif;
      --sw-font-body:'Inter',system-ui,sans-serif;
      color:var(--sw-ink);font-family:var(--sw-font-body);}
    .sw-sky{position:fixed;inset:0;z-index:2;overflow:hidden;pointer-events:none;background:var(--sw-bg);}
    .sw-sky__grad{position:absolute;inset:-10%;background:linear-gradient(178deg,rgba(6,9,19,0.7) 0%,rgba(6,9,19,0.92) 55%,#060913 100%);}
    .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,rgba(245,158,11,0.12),transparent 70%);}
    .sw-particles{position:absolute;inset:-6% -2%;will-change:transform;}
    .sw-pt{position:absolute;width:12px;height:12px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite;}
    .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%;}
    .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,var(--sw-accent),#fbbf24 82%);box-shadow:0 0 10px var(--sw-accent);}
    .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 65%,transparent);box-shadow:0 0 8px var(--sw-accent);}
    @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.6}88%{opacity:.5}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
    .sw-scrollbar{position:fixed;top:0;left:0;right:0;height:3px;z-index:100;background:rgba(245,158,11,0.15);}
    .sw-scrollbar span{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,var(--sw-accent),#06b6d4);}
    .sw-stage{position:fixed;inset:0;z-index:5;pointer-events:none;}
    .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity;}
    .sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 44%;filter:none;}
    .sw-copylayer{position:fixed;inset:0;z-index:20;pointer-events:none;}
    .sw-copylayer::before{display:none !important;}
    .sw-copy{
      position:absolute;
      left:clamp(24px,6.5vw,84px);
      top:50%;
      transform:translateY(-50%);
      width:min(520px,90vw);
      opacity:0;
      will-change:opacity,transform;
      background:rgba(6,9,19,0.82);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      border:1px solid rgba(245,158,11,0.35);
      border-radius:10px;
      padding:28px 32px;
      box-shadow:0 18px 45px rgba(0,0,0,0.7),0 0 25px rgba(245,158,11,0.15);
    }
    .sw-copy:empty{display:none !important;}
    .sw-copy__num{font-family:'Orbitron',monospace;font-size:.82rem;letter-spacing:.22em;color:#06b6d4;font-weight:700;}
    .sw-copy__eyebrow{display:block;margin-top:14px;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.26em;text-transform:uppercase;color:var(--sw-accent);}
    
    /* Exact Clean White Serif Heading from Reference Image 2 */
    .sw-copy__title{
      font-family:'Cinzel Decorative','Cinzel',serif;
      font-weight:700;
      color:#ffffff !important;
      font-size:clamp(2.4rem,5.2vw,4.4rem);
      line-height:1.06;
      margin:12px 0 0;
      letter-spacing:.02em;
      text-shadow:0 4px 20px rgba(0,0,0,0.85), 0 0 35px rgba(245,158,11,0.22);
    }
    
    .sw-copy__ribbon{
      display:inline-block;
      margin-top:14px;
      font-family:'Orbitron',sans-serif;
      font-size:.78rem;
      font-weight:800;
      letter-spacing:.28em;
      color:#fbbf24;
      background:rgba(245,158,11,0.12);
      border:1px solid rgba(245,158,11,0.35);
      padding:4px 14px;
      border-radius:4px;
    }
    .sw-copy__subheading{
      margin-top:12px;
      font-family:'Orbitron',sans-serif;
      font-size:clamp(.82rem,1.2vw,1.1rem);
      font-weight:700;
      letter-spacing:.18em;
      color:#f1f5f9;
      text-transform:uppercase;
    }
    .sw-copy__catchphrase{
      margin-top:8px;
      font-family:'Cinzel',serif;
      font-size:.88rem;
      font-weight:700;
      letter-spacing:.14em;
      color:#38bdf8;
    }
    .sw-copy__body{
      margin-top:16px;
      font-size:clamp(.98rem,1.22vw,1.14rem);
      line-height:1.62;
      color:#cbd5e1;
      max-width:48ch;
      text-shadow:0 2px 10px rgba(0,0,0,0.9);
    }
    .sw-copy__tags{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0;padding:0;}
    .sw-copy__tags li{
      font-family:'Orbitron',sans-serif;
      font-size:.72rem;
      font-weight:700;
      letter-spacing:0.08em;
      color:#fbbf24;
      padding:6px 14px;
      border-radius:4px;
      background:rgba(245,158,11,0.12);
      border:1px solid rgba(245,158,11,0.35);
    }
    .sw-copy__cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px;pointer-events:auto;}
    .sw-btn{
      text-decoration:none;
      font-family:'Orbitron',sans-serif;
      font-weight:800;
      font-size:.88rem;
      letter-spacing:0.12em;
      padding:14px 28px;
      border-radius:4px;
      transition:all .25s;
      clip-path:polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px));
    }
    .sw-btn--primary{
      color:#03050a;
      background:linear-gradient(135deg,#f59e0b,#fbbf24);
      box-shadow:0 0 20px rgba(245,158,11,0.45);
    }
    .sw-btn--primary:hover{transform:translateY(-2px);box-shadow:0 0 32px rgba(245,158,11,0.75);}
    .sw-btn--ghost{
      color:#06b6d4;
      border:1.5px solid rgba(6,182,212,0.5);
      background:rgba(6,182,212,0.08);
    }
    .sw-btn--ghost:hover{background:rgba(6,182,212,0.22);transform:translateY(-2px);color:#fff;}
    
    /* Route Rail on the Right (from Reference Image 2) */
    .sw-route{
      position:fixed;
      right:clamp(16px,2.8vw,36px);
      top:50%;
      z-index:80;
      transform:translateY(-50%);
      display:flex;
      flex-direction:column;
      gap:22px;
      padding:18px 10px;
    }
    .sw-route::before{
      content:"";
      position:absolute;
      left:50%;
      top:22px;
      bottom:22px;
      width:2px;
      transform:translateX(-50%);
      background:var(--sw-accent);
      opacity:.35;
    }
    .sw-route__dot{
      position:relative;
      border:0;
      background:transparent;
      cursor:pointer;
      width:18px;
      height:18px;
      display:grid;
      place-items:center;
    }
    .sw-route__dot i{
      width:10px;
      height:10px;
      border-radius:50%;
      background:rgba(245,158,11,0.4);
      border:1.5px solid rgba(245,158,11,0.8);
      transition:all .3s;
    }
    .sw-route__dot:hover i{transform:scale(1.3);background:var(--sw-accent);}
    .sw-route__dot.is-active i{
      background:var(--sw-accent);
      transform:scale(1.5);
      box-shadow:0 0 16px var(--sw-accent);
    }
    .sw-route__label{
      position:absolute;
      right:28px;
      top:50%;
      transform:translateY(-50%) translateX(6px);
      white-space:nowrap;
      font-family:'Orbitron',sans-serif;
      font-size:.76rem;
      font-weight:700;
      letter-spacing:0.1em;
      color:#fff;
      background:rgba(13,19,33,0.92);
      backdrop-filter:blur(10px);
      padding:6px 14px;
      border-radius:4px;
      opacity:0;
      pointer-events:none;
      transition:all .25s;
      border:1px solid rgba(245,158,11,0.35);
    }
    .sw-route__dot:hover .sw-route__label, .sw-route__dot.is-active .sw-route__label{
      opacity:1;
      transform:translateY(-50%) translateX(0);
    }
    
    /* Bottom Scroll Hint */
    .sw-hint{
      position:fixed;
      left:50%;
      bottom:24px;
      z-index:70;
      transform:translateX(-50%);
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:8px;
      font-family:'Orbitron',sans-serif;
      font-size:.72rem;
      letter-spacing:.22em;
      text-transform:uppercase;
      color:rgba(255,255,255,0.65);
      transition:opacity .3s;
    }
    .sw-hint i{
      width:22px;
      height:32px;
      border-radius:12px;
      border:2px solid rgba(245,158,11,0.4);
      position:relative;
    }
    .sw-hint i::after{
      content:"";
      position:absolute;
      left:50%;
      top:6px;
      width:4px;
      height:7px;
      border-radius:2px;
      background:var(--sw-accent);
      transform:translateX(-50%);
      animation:sw-wheel 1.7s ease-in-out infinite;
    }
    @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:16px}}
    .sw-track{position:relative;z-index:1;width:100%;pointer-events:none;}
    
    @media (max-width:860px){
      .sw-copylayer::before{width:100%;height:68%;top:auto;bottom:0;background:linear-gradient(0deg,#060913 14%,rgba(6,9,19,0.9) 60%,transparent 100%);}
      .sw-copy{left:20px;right:20px;top:auto;bottom:clamp(56px,11vh,90px);transform:none;width:auto;max-width:540px;}
      .sw-copy__title{font-size:clamp(1.9rem,7.5vw,2.7rem);}
      .sw-route{display:none;}
    }
    `;
    const style = document.createElement('style'); style.id = 'sw-css';
    style.textContent = '@layer sw {\n' + css + '\n}';
    document.head.appendChild(style);
  }

  return mountScrollWorld;
}));
