/**
 * CLOCKIT 2026 - Hero Canvas Animated Video Loop
 * Plays 240 cyber-fantasy RPG monolithic tower frames with smooth 24 FPS loop,
 * chunked progressive preloading, full brightness/contrast, and HUD controls.
 */

(function () {
  const TOTAL_FRAMES = 240;
  const FPS = 24;
  const FRAME_INTERVAL = 1000 / FPS;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  // HUD elements
  const playBtn = document.getElementById('hud-play-btn');
  const progressFill = document.getElementById('hud-progress-fill');
  const frameCounter = document.getElementById('hud-frame-counter');

  const frames = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let currentFrameIndex = 0;
  let isPlaying = true;
  let lastFrameTime = performance.now();
  let animFrameId = null;

  // Parallax offsets
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  let currentParallaxX = 0;
  let currentParallaxY = 0;

  function getFramePath(index) {
    const padded = String(index).padStart(5, '0');
    return `frame_${padded}.jpg`;
  }

  // Preload first frame immediately for instant display
  const posterImg = new Image();
  posterImg.src = getFramePath(0);
  posterImg.onload = () => {
    frames[0] = posterImg;
    loadedCount++;
    resize();
    renderFrame(0);
    startProgressiveLoading();
  };

  // Progressive loader in chunks of 16 frames
  function startProgressiveLoading() {
    const CHUNK_SIZE = 16;
    let nextIndex = 1;

    function loadNextBatch() {
      if (nextIndex >= TOTAL_FRAMES) return;
      const promises = [];
      const end = Math.min(nextIndex + CHUNK_SIZE, TOTAL_FRAMES);

      for (let i = nextIndex; i < end; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        const p = new Promise(resolve => {
          img.onload = () => {
            frames[i] = img;
            loadedCount++;
            resolve();
          };
          img.onerror = resolve;
        });
        promises.push(p);
      }

      nextIndex = end;
      Promise.all(promises).then(() => {
        if (nextIndex < TOTAL_FRAMES) {
          setTimeout(loadNextBatch, 25);
        }
      });
    }

    loadNextBatch();
  }

  // Render a specific frame with crisp cover aspect ratio
  function renderFrame(index) {
    let img = frames[index];
    if (!img) {
      for (let offset = 1; offset < 30; offset++) {
        if (frames[(index - offset + TOTAL_FRAMES) % TOTAL_FRAMES]) {
          img = frames[(index - offset + TOTAL_FRAMES) % TOTAL_FRAMES];
          break;
        }
      }
    }
    if (!img && frames[0]) img = frames[0];
    if (!img) return;

    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;

    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = w;
      drawHeight = w / imgRatio;
      offsetX = 0;
      offsetY = (h - drawHeight) * 0.44; // focus horizon
    } else {
      drawHeight = h;
      drawWidth = h * imgRatio;
      offsetX = (w - drawWidth) * 0.5;
      offsetY = 0;
    }

    // Smooth subtle parallax
    currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
    currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

    ctx.save();
    // Render clean, bright frame without darkening filters
    ctx.drawImage(
      img,
      offsetX + currentParallaxX,
      offsetY + currentParallaxY,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    // Update HUD progress and counter
    if (progressFill) {
      const pct = ((index + 1) / TOTAL_FRAMES) * 100;
      progressFill.style.width = pct + '%';
    }
    if (frameCounter) {
      frameCounter.textContent = `${String(index + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`;
    }
  }

  // Animation Loop (Continuous 24 FPS)
  function tick(now) {
    if (isPlaying) {
      const elapsed = now - lastFrameTime;
      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTime = now - (elapsed % FRAME_INTERVAL);
        currentFrameIndex = (currentFrameIndex + 1) % TOTAL_FRAMES;
        renderFrame(currentFrameIndex);
      }
    }
    animFrameId = requestAnimationFrame(tick);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = (rect.width || window.innerWidth) * dpr;
    canvas.height = (rect.height || window.innerHeight) * dpr;
    renderFrame(currentFrameIndex);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  animFrameId = requestAnimationFrame(tick);

  // Subtle parallax interaction on mouse move
  window.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = -nx * 15;
    targetParallaxY = -ny * 10;
  }, { passive: true });

  // Play/Pause button
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying ? '<span>⏸</span>' : '<span>▶</span>';
      playBtn.setAttribute('title', isPlaying ? 'Pause loop' : 'Play loop');
    });
  }

  // Clickable Scrubbing Bar
  const progressBar = document.querySelector('.hud-progress-bar');
  if (progressBar) {
    progressBar.addEventListener('click', e => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      currentFrameIndex = Math.floor(pct * (TOTAL_FRAMES - 1));
      renderFrame(currentFrameIndex);
    });
  }

  window.CLOCKIT_HERO = {
    play: () => { isPlaying = true; if (playBtn) playBtn.innerHTML = '<span>⏸</span>'; },
    pause: () => { isPlaying = false; if (playBtn) playBtn.innerHTML = '<span>▶</span>'; },
    seek: (frame) => {
      currentFrameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frame));
      renderFrame(currentFrameIndex);
    }
  };
})();
