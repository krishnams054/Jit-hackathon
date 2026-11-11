/**
 * CLOCKIT 2026 - Global Full-Website Scroll-Driven 240-Frame Flight Engine
 * 
 * Key Features:
 * 1. Global Page Coverage: Scrubs smoothly across the entire website from starting Hero to ending Footer.
 * 2. High-Performance rAF Scrubbing: Direct 1:1 synchronization with native window scroll.
 * 3. Zero Blank Flashes: Draws directly over previous frame, never clearing to black.
 * 4. Parallel Wave Preloading: High-priority poster 0 & end-frame 239, with async decoding for remaining frames.
 * 5. Dynamic Flight Airspace HUD: Reflects live descent percentage and domain coordinates.
 */

(function () {
  'use strict';

  const TOTAL_FRAMES = 240;
  const CANVAS_SELECTOR = '#scroll-frame-canvas';
  const HUD_PILL_SELECTOR = '#flight-hud-pill';
  const HUD_TEXT_SELECTOR = '#flight-hud-text';

  const canvas = document.querySelector(CANVAS_SELECTOR);
  const hudPill = document.querySelector(HUD_PILL_SELECTOR);
  const hudText = document.querySelector(HUD_TEXT_SELECTOR);

  if (!canvas) {
    console.warn('[ScrollEngine] Canvas element not found.');
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: false });

  // Frame Cache & State
  const frames = new Array(TOTAL_FRAMES);
  const isLoaded = new Uint8Array(TOTAL_FRAMES);
  let loadedCount = 0;

  let targetProgress = 0;
  let currentProgress = 0;
  let currentTargetFrame = 0;
  let lastDrawnFrameIdx = -1;
  let isRenderPending = false;

  let viewWidth = 0;
  let viewHeight = 0;
  let dpr = 1;

  function pad(num) {
    return String(num).padStart(5, '0');
  }

  function getFramePath(i) {
    return `frame_${pad(i)}.jpg`;
  }

  // Find the exact frame or closest available loaded frame (never null once frame 0 loads)
  function getBestLoadedFrame(targetIdx) {
    if (isLoaded[targetIdx] && frames[targetIdx]) {
      return { img: frames[targetIdx], idx: targetIdx };
    }
    // Search outward symmetrically
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const left = targetIdx - offset;
      if (left >= 0 && isLoaded[left] && frames[left]) {
        return { img: frames[left], idx: left };
      }
      const right = targetIdx + offset;
      if (right < TOTAL_FRAMES && isLoaded[right] && frames[right]) {
        return { img: frames[right], idx: right };
      }
    }
    return null;
  }

  // Handle High-DPI canvas resizing
  function resizeCanvas() {
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(viewWidth * dpr);
    canvas.height = Math.round(viewHeight * dpr);
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;

    lastDrawnFrameIdx = -1;
    drawCurrentFrame(true);
  }

  // Draw frame on canvas - Full-bleed cover mode on desktop and mobile, zero blank guarantee
  function drawCurrentFrame(forceRedraw) {
    const frameData = getBestLoadedFrame(currentTargetFrame);
    if (!frameData) return;

    if (!forceRedraw && frameData.idx === lastDrawnFrameIdx) return;

    const img = frameData.img;
    const imgW = img.naturalWidth || 1280;
    const imgH = img.naturalHeight || 720;
    const imgRatio = imgW / imgH;
    const screenRatio = viewWidth / viewHeight;

    ctx.save();
    ctx.scale(dpr, dpr);

    let drawW, drawH, drawX, drawY;

    // Full-bleed cover mode centered on the citadel monolith
    if (screenRatio > imgRatio) {
      drawW = viewWidth;
      drawH = viewWidth / imgRatio;
      drawX = 0;
      drawY = (viewHeight - drawH) * 0.35;
    } else {
      drawH = viewHeight;
      drawW = viewHeight * imgRatio;
      drawX = (viewWidth - drawW) * 0.5;
      drawY = 0;
    }

    // Paint directly over previous frame (never clears to black, zero blank flashes)
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    lastDrawnFrameIdx = frameData.idx;
  }

  // Calculate current scroll progress across the ENTIRE website from start to end
  function getScrollProgress() {
    const docH = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    if (docH <= 0) return 0;
    const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
    return Math.min(1, Math.max(0, scrolled / docH));
  }

  // Update Flight Airspace HUD pill
  function updateFlightHUD(progress) {
    if (!hudPill || !hudText) return;
    if (progress > 0.005) {
      hudPill.classList.add('is-active');
      const pct = Math.round(progress * 100);
      let title = 'CITADEL DESCENT';
      if (pct < 15) title = 'ARENA APPROACH';
      else if (pct < 32) title = 'THE BATTLEGROUND';
      else if (pct < 50) title = 'THE TREASURY';
      else if (pct < 68) title = 'QUEST CODEX';
      else if (pct < 85) title = 'RAID TIMELINE';
      else title = 'MONOLITHIC GATEWAY';
      hudText.textContent = `${title} // ${pct}%`;
    } else {
      hudPill.classList.remove('is-active');
    }
  }

  // Animation Loop: Continuous and instantaneous scrub
  function renderLoop() {
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0002) {
      currentProgress += diff * 0.45;
    } else {
      currentProgress = targetProgress;
    }

    currentTargetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));
    drawCurrentFrame(false);
    updateFlightHUD(currentProgress);

    if (Math.abs(targetProgress - currentProgress) > 0.0002) {
      requestAnimationFrame(renderLoop);
    } else {
      isRenderPending = false;
    }
  }

  function scheduleRender() {
    targetProgress = getScrollProgress();
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(renderLoop);
    }
  }

  // Fast Parallel Frame Preloader
  function loadFrame(i) {
    if (isLoaded[i]) return;
    const img = new Image();
    img.decoding = 'async'; // Decodes off the main UI thread
    img.src = getFramePath(i);
    img.onload = () => {
      frames[i] = img;
      isLoaded[i] = 1;
      loadedCount++;

      // If this newly arrived frame is near the currently requested frame, redraw immediately
      if (Math.abs(i - currentTargetFrame) <= 2) {
        drawCurrentFrame(true);
      }
    };
  }

  function startAggressivePreloading() {
    // 1. Load Frame 0 (hero) immediately with highest priority
    const poster = new Image();
    poster.decoding = 'sync';
    poster.src = getFramePath(0);
    poster.onload = () => {
      frames[0] = poster;
      isLoaded[0] = 1;
      loadedCount++;
      resizeCanvas();

      const initProg = getScrollProgress();
      currentTargetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(initProg * (TOTAL_FRAMES - 1))));
      drawCurrentFrame(true);
      updateFlightHUD(initProg);

      // 2. Preload end-frame 239 for seamless boundary transition
      const endPoster = new Image();
      endPoster.decoding = 'async';
      endPoster.src = getFramePath(TOTAL_FRAMES - 1);
      endPoster.onload = () => {
        frames[TOTAL_FRAMES - 1] = endPoster;
        isLoaded[TOTAL_FRAMES - 1] = 1;
      };

      // 3. Load remaining keyframes in prioritized waves
      // Wave A: Keyframes every 2nd frame (0, 2, 4, 6... 238) for full scrub coverage
      for (let i = 2; i < TOTAL_FRAMES - 1; i += 2) {
        loadFrame(i);
      }

      // Wave B: In-between odd frames (1, 3, 5, 7... 237) for full 240-frame density
      setTimeout(() => {
        for (let i = 1; i < TOTAL_FRAMES - 1; i += 2) {
          loadFrame(i);
        }
      }, 40);
    };
    poster.onerror = () => {
      console.error('[ScrollEngine] Poster frame 0 failed to load');
    };
  }

  // Event Listeners
  window.addEventListener('scroll', scheduleRender, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    scheduleRender();
  }, { passive: true });
  window.addEventListener('hashchange', scheduleRender, { passive: true });

  startAggressivePreloading();
  scheduleRender();
})();
