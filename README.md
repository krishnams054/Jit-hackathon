# CLOCKIT 2026 — 24 Hours National Level Hackathon Landing Page

A fully responsive, ultra-modern, production-ready landing page for **CLOCKIT 2026**, built with a **Cyber-Fantasy RPG Anime** aesthetic, deep cosmic gradients (`#060913`), glowing amber/gold accents (`#f59e0b`), and neon elemental highlights (`#06b6d4`, `#8b5cf6`, `#10b981`).

Powered by [oso95/scroll-world](https://github.com/oso95/scroll-world.git) for continuous scroll-driven camera flight animations.

---

## 🌟 Key Features & Sections

### 1. Header & Institutional Branding
- **Top Institutional Bar:**
  - Left: **JGI | JAIN INSTITUTE OF TECHNOLOGY, DAVANAGERE** with gold crest styling.
  - Right: SALUTIX AI - with real-time glowing cyan status pulse.
- **Hero Title & Typography:**
  - Monumental stone-carved **"CLOCKIT"** title with 3D bevel relief, layered drop shadows, and glowing gold runes (Google Font `Cinzel Decorative`).
  - Futuristic bold **"2026"** sub-year with neon cyan flare (`Orbitron`).
  - High-tier RPG quest ribbon: **"BUILD ◆ BATTLE ◆ CONQUER"**.
  - Subheading: **"24 HOURS NATIONAL LEVEL HACKATHON"**.
  - Catchphrase: **"DREAM IT. BUILD IT. CONQUER IT. CODE BEYOND LIMITS."**.
- **Live Countdown Timer:**
  - Real-time countdown to **November 25, 2026 at 09:00 AM IST** (Days, Hours, Minutes, Seconds) with glowing cyber-HUD cards.

### 2. Visual Theme & Animated Video Loop Background
- **Hero Canvas Sequence Player (`js/hero-canvas.js`):**
  - Seamlessly streams and cycles the 240 cyber-fantasy RPG monolithic tower frames (`frame_00000.jpg` to `frame_00239.jpg`) at silky smooth 24 FPS with `requestAnimationFrame`.
  - Zero-FOUC instant loading of frame 0 followed by non-blocking chunked progressive preloading.
  - Deep cosmic radial vignette & scanline grid overlay to ensure 100% foreground readability.
  - Interactive HUD controls: Play/Pause toggle, clickable frame scrubbing bar, and frame counter.
  - Subtle mouse-tracking 3D parallax depth effect.

### 3. Key Event Details & Floating Badges
- Angular border frames styled with `clip-path: polygon(...)`:
  - **Date / Time:** The Battle Begins — **25 – 26 Nov 2026** (24 Hours Non-Stop).
  - **Venue:** **JITD Library**, Jain Institute of Technology, Davanagere.
  - **Scale & Mode:** National Level Arena (Open to all colleges, squads of 2 to 4 adventurers).

### 4. Prize Pool Podium (₹30,000 Total Pool)
- **Grand Highlight Box:** **TOTAL PRIZE POOL: ₹ 30000** with gold shimmer sheen animation and particle sparkles.
- **3-Tier RPG Podium:**
  - **1st Place // Golden Relic:** **₹ 15,000** + National Champion Trophy + VIP Mentorship + Exclusive Swags.
  - **Runner-Up // Silver Blade:** **₹ 10,000** + Silver Champion Trophy + Merit Certificate + Swag Box.
  - **2nd Runner-Up // Bronze Shield:** **₹ 5,000** + Bronze Trophy + Merit Certificate.
- **Bonus Perks:** Participation Certificates for all, free 24-hr meals & midnight coffee, mentorship from Salutix AI engineers.

### 5. Scroll-World 3D Realm Expedition
- Cloned and integrated directly from `https://github.com/oso95/scroll-world.git`.
- Features `mountScrollWorld` with customized cyber-fantasy RPG theme (`--sw-bg: #060913`, `--sw-accent: #f59e0b`):
  - **01 // Genesis:** 24-Hour Crucible & Awakening
  - **02 // Arena:** JITD Library Battleground & Infrastructure
  - **03 // Vault:** ₹30,000 Bounty Pool & Relics
  - **04 // Codex:** 5 Hackathon Quest Tracks
  - **05 // Council:** Department Leadership & Coordinators
  - **06 // Portal:** Final Squad Battle Pass Registration Gate
- Includes right-hand side interactive route indicator rail, top scrollbar progress, and drifting cosmic particles.

### 6. Interactive Registration Section & Modal Popup
- Prominent **"REGISTER NOW"** button with neon amber hover pulse.
- Sleek glassmorphism popup modal (`backdrop-filter: blur(18px)`):
  - Form fields: Team Name, Team Leader Name, Email, Phone Number, College Name, Number of Members (2 to 4).
  - Dynamic member fields generated automatically according to squad size.
  - Embedded **Scan to Register QR Code** placeholder block with animated red/cyan laser sweep.
  - Interactive submission validation.
  - **Success State:** Generates an official holographic **"CLOCKIT 2026 ADVENTURER BATTLE PASS"** with unique squad ticket ID (e.g. `CLK26-X892A`), team details, celebration confetti burst, and printable action.

### 7. Coordinators & Leadership Section
- **Student Coordinators:**
  - **Jayesh Suthar** | `+91 6361747047` (Direct Call & WhatsApp actions)
- **Department Leaders:**
  - **HOD - Computer Science & Engineering:** Dr. Latha B.M.
  - **HOD - Information Science (CSE), IS**
  - **HOD - Artificial Intelligence: IS, and AI**

### 8. Cyber-Fantasy Procedural Audio Synthesizer
- Built using the pure Web Audio API (`js/audio-ambiance.js`).
- Procedurally synthesizes a warm cosmic anime RPG ambient pad drone and pentatonic chimes on demand.
- Zero external audio files required, zero latency, toggled by the sound button in the top bar.

---

## 🚀 How to Run Locally

You can open `index.html` directly in any modern web browser, or serve it using any static HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node / npx
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## 📁 Project Structure

```
├── index.html                   # Main production landing page
├── css/
│   └── style.css                # Cyber-fantasy RPG styling, animations, responsive layouts
├── js/
│   ├── hero-canvas.js           # 240-frame sequence player with progressive preloading & HUD
│   ├── scroll-world-engine.js   # Extended scroll-world engine with container offset & theme support
│   ├── scroll-world-adapter.js  # 6-stage journey configuration for CLOCKIT 2026
│   ├── registration-modal.js    # Modal logic, dynamic members, QR laser, confetti & pass generator
│   ├── audio-ambiance.js        # Web Audio API procedural synthesizer
│   └── main.js                  # Sticky nav, countdown timer, FAQ accordion & particles
├── scroll-world/                # Cloned repository from https://github.com/oso95/scroll-world.git
└── frame_00000.jpg ...          # 240 video frames of the cyber-fantasy monolithic towers
```

