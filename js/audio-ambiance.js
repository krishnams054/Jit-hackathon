/**
 * CLOCKIT 2026 - Cyber-Fantasy Procedural Audio Synthesizer
 * Built using pure Web Audio API. Procedurally generates an ethereal
 * cosmic anime RPG ambient drone and harp arpeggio. Zero external assets needed!
 */

(function () {
  let audioCtx = null;
  let isPlaying = false;
  let masterGain = null;
  let intervalId = null;

  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }

  // Pentatonic cyber-fantasy notes (MIDI frequencies)
  // D minor / Dorian / Cyber anime RPG scale: D, F, G, A, C, D
  const FREQS = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 440.00, 523.25];

  function playPadChord() {
    if (!audioCtx || !isPlaying) return;

    // Create 3 gentle sine/triangle oscillators for a warm cosmic pad
    const chord = [FREQS[0], FREQS[2], FREQS[3]];
    chord.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq * 0.5, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06 / chord.length, audioCtx.currentTime + 3);
      gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(audioCtx.currentTime + 8.5);
    });
  }

  function playChime() {
    if (!audioCtx || !isPlaying) return;

    const note = FREQS[Math.floor(Math.random() * FREQS.length)];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const pan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.4);

    if (pan) {
      pan.pan.setValueAtTime((Math.random() - 0.5) * 0.8, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(masterGain);
    } else {
      osc.connect(gain);
      gain.connect(masterGain);
    }

    osc.start();
    osc.stop(audioCtx.currentTime + 2.5);
  }

  function toggleSound() {
    initAudio();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
      masterGain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 1.5);
      soundBtn.classList.add('playing');
      soundBtn.innerHTML = '<span>🔊</span>';
      soundBtn.setAttribute('title', 'Mute cyber ambiance');

      playPadChord();
      playChime();

      intervalId = setInterval(() => {
        if (!isPlaying) return;
        if (Math.random() > 0.4) playPadChord();
        playChime();
      }, 3500);
    } else {
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      soundBtn.classList.remove('playing');
      soundBtn.innerHTML = '<span>🔇</span>';
      soundBtn.setAttribute('title', 'Play cyber ambiance');

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  }

  soundBtn.addEventListener('click', toggleSound);
})();
