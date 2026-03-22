// 8-bit sound effects via Web Audio API

let ctx = null;
let muted = false;

export function isMuted() { return muted; }
export function setMuted(v) { muted = v; }

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep(freq, duration, type = "square", vol = 0.08) {
  if (muted) return;
  try {
    const c    = getCtx();
    const osc  = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (_) {}
}

export const sounds = {
  open:     () => { beep(523, 0.08); setTimeout(() => beep(659, 0.08), 60); },
  close:    () => { beep(330, 0.06); setTimeout(() => beep(220, 0.1),  50); },
  focus:    () => beep(440, 0.05),
  minimize: () => beep(294, 0.08),
  error:    () => { beep(220, 0.1); setTimeout(() => beep(196, 0.15), 80); },
};
