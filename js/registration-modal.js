/**
 * CLOCKIT 2026 - Registration Modal & Dynamic Squad Pass Generator
 * Handles modal open/close, dynamic member slots, form validation,
 * QR code scanner laser effect, confetti celebration, and pass creation.
 */

(function () {
  const backdrop = document.getElementById('reg-modal-backdrop');
  const closeBtn = document.getElementById('reg-modal-close');
  const regForm = document.getElementById('clockit-reg-form');
  const successState = document.getElementById('reg-success-state');
  const membersCountSelect = document.getElementById('num-members-select');
  const dynamicMembersContainer = document.getElementById('dynamic-members-container');

  // Trigger buttons
  const openButtons = document.querySelectorAll('.js-open-reg-modal, a[href="#register"]');

  function openModal() {
    if (!backdrop) return;
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (backdrop) {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal();
    });
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Dynamic Member Input Generation based on Squad Size
  if (membersCountSelect && dynamicMembersContainer) {
    function updateMemberFields() {
      const count = parseInt(membersCountSelect.value, 10) || 2;
      dynamicMembersContainer.innerHTML = '';

      for (let i = 2; i <= count; i++) {
        const row = document.createElement('div');
        row.className = 'form-row';
        row.innerHTML = `
          <div class="form-group">
            <label class="form-label">Member ${i} Name</label>
            <input type="text" class="form-input member-name-input" name="member_${i}_name" placeholder="Adventurer ${i} Full Name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Member ${i} Email / Role</label>
            <input type="text" class="form-input" name="member_${i}_detail" placeholder="Email or Role (e.g. AI / Frontend / Backend)" required>
          </div>
        `;
        dynamicMembersContainer.appendChild(row);
      }
    }

    membersCountSelect.addEventListener('change', updateMemberFields);
    updateMemberFields();
  }

  // Handle Form Submission
  if (regForm) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();

      const teamName = document.getElementById('team-name-input').value.trim();
      const leaderName = document.getElementById('leader-name-input').value.trim();
      const email = document.getElementById('leader-email-input').value.trim();
      const phone = document.getElementById('leader-phone-input').value.trim();
      const college = document.getElementById('college-name-input').value.trim();
      const track = document.getElementById('track-select').value;
      const numMembers = membersCountSelect ? membersCountSelect.value : '4';

      if (!teamName || !leaderName || !email || !phone || !college) {
        alert('Please fill in all mandatory squad credentials.');
        return;
      }

      // Generate unique battle ticket ID
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const passId = `CLK26-${randomCode}`;

      // Populate Success Battle Pass Ticket
      document.getElementById('ticket-pass-id').textContent = passId;
      document.getElementById('ticket-team-name').textContent = teamName;
      document.getElementById('ticket-leader-name').textContent = leaderName;
      document.getElementById('ticket-college-name').textContent = college;
      document.getElementById('ticket-track-name').textContent = track;
      document.getElementById('ticket-squad-size').textContent = `${numMembers} Adventurers`;

      // Switch to success state
      regForm.style.display = 'none';
      if (successState) {
        successState.classList.add('active');
        launchConfetti();
      }
    });
  }

  // Action to register another team
  const resetBtn = document.getElementById('btn-reset-reg');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (regForm) {
        regForm.reset();
        regForm.style.display = 'flex';
      }
      if (successState) {
        successState.classList.remove('active');
      }
    });
  }

  // Print / Save Battle Pass Action
  const printBtn = document.getElementById('btn-print-pass');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Confetti Particle Burst for Celebration
  function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '3000';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#f59e0b', '#fbbf24', '#06b6d4', '#8b5cf6', '#10b981', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let start = performance.now();
    function animate(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98;
        p.rotation += p.vr;
        p.alpha -= 0.009;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive && elapsed < 3500) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(animate);
  }

  // Expose global open method
  window.openRegistrationModal = openModal;
})();
