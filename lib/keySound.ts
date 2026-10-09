/**
 * Tiny synthesized keypress sounds for navbar shortcuts (keys 1–5).
 * No audio assets: pure Web Audio, created lazily inside the keydown
 * handler so browser autoplay policies are satisfied (user gesture).
 *
 * Each key plays a soft ascending pentatonic pluck (C5 D5 E5 G5 A5) —
 * consonant in any order — layered with a short click transient for
 * that tactile mechanical feel. Quiet by design (~120ms).
 */

let ctx: AudioContext | null = null;

const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0];

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // No global gate here: every caller is an explicit user keypress,
  // which itself satisfies browser autoplay policies.
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  opts: { at?: number; dur?: number; vol?: number; type?: OscillatorType } = {}
) {
  const { at = 0, dur = 0.14, vol = 0.14, type = "sine" } = opts;
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/**
 * Theme toggle chime: brightens going light (E5→A5),
 * deepens going dark (A5→E5).
 */
export function playThemeToggle(toLight: boolean) {
  const ac = getContext();
  if (!ac) return;
  try {
    const seq = toLight ? [659.25, 880.0] : [880.0, 659.25];
    seq.forEach((f, i) => tone(ac, f, { at: i * 0.07, dur: 0.12, vol: 0.22 }));
  } catch {
    // stay silent, never break the toggle.
  }
}

/** Log in: gentle double-blip greeting. */
export function playLoginKey() {
  const ac = getContext();
  if (!ac) return;
  try {
    [0, 0.09].forEach((at) =>
      tone(ac, 587.33, { at, dur: 0.1, vol: 0.22, type: "triangle" })
    );
  } catch {
    // stay silent, never break navigation.
  }
}

/** Start test: quick ascending launch triad (C5–E5–G5). */
export function playStartKey() {
  const ac = getContext();
  if (!ac) return;
  try {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      tone(ac, f, { at: i * 0.06, dur: 0.13, vol: 0.24 })
    );
  } catch {
    // stay silent, never break navigation.
  }
}
export function playNavKey(index: number) {
  const ac = getContext();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    const freq = NOTES[index] ?? NOTES[2];

    // Warm pluck (sine + octave shimmer, fast decay)
    const osc = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    oscGain.gain.setValueAtTime(0.0001, t);
    oscGain.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(oscGain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.16);

    // Click transient (short high blip for tactile feel)
    const click = ac.createOscillator();
    const clickGain = ac.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(freq * 4, t);
    clickGain.gain.setValueAtTime(0.0001, t);
    clickGain.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    click.connect(clickGain).connect(ac.destination);
    click.start(t);
    click.stop(t + 0.04);
  } catch {
    // Audio unavailable — stay silent, never break navigation.
  }
}

/**
 * Resume the shared AudioContext after a real user gesture.
 * Autoplay policies start it suspended; call once on pointerdown/keydown.
 */
export function unlockAudio() {
  getContext();
}

/** Soft keystroke tick for the auto-playing demo (skipped while suspended). */
export function playDemoTick(step: number) {
  const ac = getContext();
  if (!ac) return;
  if (ac.state !== "running") {
    // First interaction can arrive while suspended: resume, then replay once.
    ac.resume().then(() => playDemoTick(step)).catch(() => {});
    return;
  }
  try {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1900 + (step % 5) * 130, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  } catch {
    // stay silent.
  }
}

/** Dull thud for demo mistypes. */
export function playDemoError() {
  const ac = getContext();
  if (!ac) return;
  if (ac.state !== "running") {
    ac.resume().then(() => playDemoError()).catch(() => {});
    return;
  }
  try {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(170, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  } catch {
    // stay silent.
  }
}
