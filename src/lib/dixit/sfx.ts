let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

export function unlockSfx() {
  const c = audio();
  if (c?.state === "suspended") void c.resume();
}

function tone(
  c: AudioContext,
  start: number,
  freqFrom: number,
  freqTo: number,
  dur: number,
  peak = 0.14,
  type: OscillatorType = "sine",
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playBoing() {
  const c = audio();
  if (!c) return;
  void c.resume();
  const t = c.currentTime;
  tone(c, t, 430, 170, 0.1, 0.15, "sine");
  tone(c, t + 0.08, 210, 120, 0.14, 0.09, "triangle");
}

export function playVictory() {
  const c = audio();
  if (!c) return;
  void c.resume();
  const t0 = c.currentTime + 0.02;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    tone(c, t0 + i * 0.12, f, f * 0.98, 0.32, 0.11, "triangle");
  });
}
