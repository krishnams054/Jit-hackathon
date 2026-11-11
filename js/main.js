/**
 * CLOCKIT 2026 - Main Interaction Script
 * Navbar tracking, countdown timer, FAQ accordion, scroll reveals,
 * and ambient cosmic mana ember particle canvas.
 */

(function () {
  // ---- 1. Sticky Navigation & Active Section Tracking ----
  const topBar = document.querySelector('.top-bar-wrapper');
  const navLinks = document.querySelectorAll('.nav-item a');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinksList = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (topBar) {
      if (scrollY > 50) {
        topBar.classList.add('scrolled');
      } else {
        topBar.classList.remove('scrolled');
      }
    }

    // Update active nav link
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 180;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const parent = link.parentElement;
      if (link.getAttribute('href') === `#${currentId}`) {
        parent.classList.add('active');
      } else {
        parent.classList.remove('active');
      }
    });
  }, { passive: true });

  // Mobile nav toggle
  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      navLinksList.classList.toggle('mobile-open');
    });

    navLinksList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinksList.classList.remove('mobile-open');
      });
    });
  }

  // ---- 2. Live Countdown Timer to 25 Nov 2026 ----
  const targetDate = new Date('2026-11-25T09:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      const box = document.querySelector('.hero-countdown-box');
      if (box) box.innerHTML = '<div class="countdown-unit" style="min-width:200px;"><span class="countdown-num">ARENA ACTIVE</span><span class="countdown-label">THE BATTLE HAS BEGUN</span></div>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins = document.getElementById('cd-minutes');
    const elSecs = document.getElementById('cd-seconds');

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMins) elMins.textContent = String(minutes).padStart(2, '0');
    if (elSecs) elSecs.textContent = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // ---- 3. FAQ Accordion Interaction ----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('is-open');
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('is-open');
      } else {
        item.classList.add('is-open');
      }
    });
  });

  // ---- 4. IntersectionObserver Scroll Reveal Animations ----
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  // Immediately reveal all cards to guarantee zero blank spaces on initial render & anchor navigation
  revealElements.forEach(el => el.classList.add('revealed'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '50px 0px 50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ---- 5. Floating Cosmic Mana Embers Particle Background ----
  const pCanvas = document.getElementById('particles-bg');
  if (pCanvas) {
    const ctx = pCanvas.getContext('2d');
    let width = (pCanvas.width = window.innerWidth);
    let height = (pCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = pCanvas.width = window.innerWidth;
      height = pCanvas.height = window.innerHeight;
    }, { passive: true });

    const particleCount = window.innerWidth < 768 ? 25 : 55;
    const particles = [];
    const colors = [
      'rgba(245, 158, 11, ', // Amber
      'rgba(251, 191, 36, ', // Gold
      'rgba(6, 182, 212, ',  // Cyan
      'rgba(139, 92, 246, '  // Violet
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        speedY: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.3,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulseAngle += p.pulseSpeed;

        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulseAngle) * 0.2);

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${currentAlpha})`;
        ctx.shadowColor = `${p.colorBase}0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }
})();
