/**
 * CLOCKIT 2026 - Scroll World Integration Adapter
 * Configures the 6-stage journey for CLOCKIT 2026, seamlessly
 * mounted as the primary landing page experience.
 */

(function () {
  const SCENE_FRAMES = {
    genesis: 'frame_00000.jpg',
    arena: 'frame_00048.jpg',
    vault: 'frame_00096.jpg',
    codex: 'frame_00144.jpg',
    council: 'frame_00192.jpg',
    portal: 'frame_00239.jpg'
  };

  const scrollWorldConfig = {
    hint: 'SCROLL TO FLY THROUGH THE CLOCKIT REALMS',
    diveScroll: 1.5,
    connScroll: 0.9,
    crossfade: 0.14,
    atmosphere: true,
    sections: [
      {
        id: 'realm-genesis',
        label: '01 // GENESIS',
        still: SCENE_FRAMES.genesis,
        accent: '#f59e0b',
        scroll: 1.2,
        linger: 0.2,
        // Free of all side text clutter - 100% visible bright video
        eyebrow: '',
        title: '',
        ribbon: '',
        subheading: '',
        catchphrase: '',
        body: '',
        tags: []
      },
      {
        id: 'realm-arena',
        label: '02 // ARENA',
        still: SCENE_FRAMES.arena,
        accent: '#06b6d4',
        scroll: 1.5,
        linger: 0.4,
        eyebrow: 'REALM II — BATTLEGROUND',
        title: 'THE ARENA: JITD LIBRARY',
        subheading: 'The Battle Begins — 25 – 26 Nov 2026',
        body: 'Equipped with gigabit fiber, uninterrupted dual-grid power, immersive rest pods, and continuous fuel to power your 24-hour sprint in Davanagere.',
        tags: ['25–26 Nov 2026', 'JITD Library', 'Davanagere', 'Gigabit Mesh']
      },
      {
        id: 'realm-vault',
        label: '03 // VAULT',
        still: SCENE_FRAMES.vault,
        accent: '#fbbf24',
        scroll: 1.6,
        linger: 0.5,
        eyebrow: 'REALM III — THE TREASURY',
        title: 'TOTAL PRIZE POOL: ₹ 30000',
        subheading: '1st: ₹ 15,000 | 2nd: ₹ 10,000 | 3rd: ₹ 5,000',
        body: 'Grand Champion receives ₹15,000 + National Trophy + Direct Salutix AI Mentorship. Runner-Up receives ₹10,000, and 2nd Runner-Up receives ₹5,000.',
        tags: ['1st: ₹15,000', '2nd: ₹10,000', '3rd: ₹5,000', 'Total: ₹30,000']
      },
      {
        id: 'realm-codex',
        label: '04 // CODEX',
        still: SCENE_FRAMES.codex,
        accent: '#8b5cf6',
        scroll: 1.5,
        linger: 0.4,
        eyebrow: 'REALM IV — QUEST PATHS',
        title: '5 HACKATHON TRACKS',
        subheading: 'Autonomous AI, Web3, CyberSec, IoT, Wildcard',
        body: 'Forge your legacy in Autonomous AI Agents, Cryptographic Web3, Zero-Trust CyberSec, IoT Smart Campus, or Open Wildcard Innovation.',
        tags: ['AI Agents', 'Web3 Guilds', 'CyberSec', 'Smart Campus', 'Wildcard']
      },
      {
        id: 'realm-council',
        label: '05 // COUNCIL',
        still: SCENE_FRAMES.council,
        accent: '#10b981',
        scroll: 1.5,
        linger: 0.45,
        eyebrow: 'REALM V — ARCH-MAGES',
        title: 'GUILD MASTERS & LEADERSHIP',
        subheading: 'Academic Leadership & Student Conveners',
        body: 'Organizers: Dr. Latha B M (CS&E) | Dr. H S Saraswathi (IS&E) | Dr. Azizkhan F Pathan (AI&ML). Student Coordinators: Jayesh Suthar (6361747047), Aript Patil (9945985494), Kishore K (9663084464). Faculty Coordinators: Mrs. Archana KN, Ms. Vaishnavi CS, Mr. Pavan Kumar T H.',
        tags: ['Dr. Latha B M', 'Jayesh Suthar: 6361747047', 'Aript Patil: 9945985494', 'Kishore K: 9663084464']
      },
      {
        id: 'realm-portal',
        label: '06 // PORTAL',
        still: SCENE_FRAMES.portal,
        accent: '#f59e0b',
        scroll: 1.7,
        linger: 0.35,
        eyebrow: 'REALM VI — THE FINAL GATE',
        title: 'CLAIM YOUR BATTLE PASS',
        subheading: 'Squads of 2 to 4 Adventurers',
        body: 'Squad registration is open with zero entry fee. Secure your squad entry, download your adventurer battle pass, and enter the arena.',
        tags: ['Free Registration', 'Food & Energy Kit', 'Official Pass'],
        cta: {
          primary: { label: '⚔️ REGISTER SQUAD NOW', href: '#register' },
          secondary: { label: '📜 EXPLORE DETAILED CODEX', href: '#badges' }
        }
      }
    ],
    connectors: []
  };

  window.initScrollWorldFlight = function () {
    const mountEl = document.getElementById('scroll-world-mount');
    if (!mountEl) return;

    if (typeof mountScrollWorld === 'function') {
      mountEl.innerHTML = '';
      mountScrollWorld(mountEl, scrollWorldConfig);
      console.log('Successfully mounted scroll-world engine for CLOCKIT 2026!');
      startCountdownSync();
    } else {
      console.error('mountScrollWorld is not loaded.');
    }
  };

  function startCountdownSync() {
    const targetDate = new Date('2026-11-25T09:00:00+05:30').getTime();
    function tick() {
      const timerEl = document.getElementById('sw-cd-timer');
      if (!timerEl) return;
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        timerEl.textContent = 'ARENA ACTIVE';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      timerEl.textContent = `${days}D : ${String(hours).padStart(2, '0')}H : ${String(minutes).padStart(2, '0')}M : ${String(seconds).padStart(2, '0')}S`;
    }
    setInterval(tick, 1000);
    tick();
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (typeof mountScrollWorld === 'function') {
      window.initScrollWorldFlight();
    } else {
      setTimeout(() => {
        if (typeof mountScrollWorld === 'function') window.initScrollWorldFlight();
      }, 300);
    }
  });
})();
