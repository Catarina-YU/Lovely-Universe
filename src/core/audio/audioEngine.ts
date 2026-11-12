/**
 * Audio do jogo, todo sintetizado com a Web Audio API (sem arquivos de som):
 * uma musica suave e infinita em loop e efeitos curtos. O navegador so libera o som
 * depois de um gesto do usuario, entao tudo comeca em `unlock()`.
 */

export type SfxName = "click" | "prompt" | "starTap" | "locked" | "discover" | "shooting" | "finale" | "meow";

const MUTE_KEY = "nosso-universo:muted:v1";
const MUSIC_VOLUME = 0.45;
const SFX_VOLUME = 0.7;
const BAR_SECONDS = 3.2;
const LOOKAHEAD_SECONDS = 1.2;

interface MusicBar {
  bass: number;
  chord: readonly number[];
}

/** Progressao suave (I - vi - IV - V), notas em numeros MIDI. */
const BARS: readonly MusicBar[] = [
  { bass: 36, chord: [60, 64, 67, 71] },
  { bass: 33, chord: [57, 60, 64, 67] },
  { bass: 41, chord: [53, 57, 60, 64] },
  { bass: 43, chord: [55, 59, 62, 64] },
];
const ARPEGGIO = [0, 1, 2, 3, 2, 1, 2, 1] as const;
const SPARKLE_NOTES = [72, 74, 76, 79, 81] as const;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicTimer: number | null = null;
let nextBarTime = 0;
let barIndex = 0;
let muted = readMuted();
const listeners = new Set<() => void>();

function readMuted(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  /** Ate onde a frequencia desliza (opcional). */
  glideTo?: number;
  bus?: GainNode | null;
}

/** Uma nota com envelope simples (ataque rapido, decaimento suave). */
function tone(freq: number, start: number, duration: number, options: ToneOptions = {}): void {
  if (!context) return;
  const { type = "sine", gain = 0.1, attack = 0.01, release = 0.2, glideTo, bus = sfxBus } = options;
  if (!bus) return;
  const osc = context.createOscillator();
  const env = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.linearRampToValueAtTime(gain, start + attack);
  env.gain.setValueAtTime(gain, start + Math.max(attack, duration - release));
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);
  osc.connect(env).connect(bus);
  osc.start(start);
  osc.stop(start + duration + release + 0.05);
}

/** Miado: um tom que sobe e desce com vibrato leve, mais um harmonico suave. */
function meow(start: number): void {
  if (!context || !sfxBus) return;
  const length = 0.55;
  for (const [type, mult, gain] of [["triangle", 1, 0.16], ["sine", 2, 0.05]] as const) {
    const osc = context.createOscillator();
    const env = context.createGain();
    const vibrato = context.createOscillator();
    const vibratoGain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(480 * mult, start);
    osc.frequency.exponentialRampToValueAtTime(900 * mult, start + 0.16);
    osc.frequency.exponentialRampToValueAtTime(560 * mult, start + length);
    vibrato.frequency.value = 22;
    vibratoGain.gain.value = 18 * mult;
    vibrato.connect(vibratoGain).connect(osc.frequency);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(gain, start + 0.05);
    env.gain.setValueAtTime(gain, start + 0.3);
    env.gain.exponentialRampToValueAtTime(0.0001, start + length + 0.1);
    osc.connect(env).connect(sfxBus);
    osc.start(start);
    vibrato.start(start);
    osc.stop(start + length + 0.15);
    vibrato.stop(start + length + 0.15);
  }
}

function scheduleBar(start: number): void {
  const bar = BARS[barIndex % BARS.length];
  barIndex += 1;
  const eighth = BAR_SECONDS / 8;

  // grave e acorde em "pad" (entra devagar, sai devagar)
  tone(hz(bar.bass), start, BAR_SECONDS - 0.2, { gain: 0.07, attack: 0.4, release: 0.8, bus: musicBus });
  for (const note of bar.chord.slice(0, 3)) {
    tone(hz(note), start, BAR_SECONDS - 0.1, { gain: 0.022, attack: 0.9, release: 1.2, bus: musicBus });
  }
  // arpejo delicado
  ARPEGGIO.forEach((step, i) => {
    tone(hz(bar.chord[step] + 12), start + i * eighth, 0.25, {
      type: "triangle",
      gain: 0.05,
      attack: 0.01,
      release: 0.5,
      bus: musicBus,
    });
  });
  // brilhinhos aleatorios, como estrelas
  for (const slot of [3, 7]) {
    if (Math.random() < 0.45) {
      const note = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)];
      tone(hz(note), start + slot * eighth + eighth / 2, 0.2, { gain: 0.03, release: 0.9, bus: musicBus });
    }
  }
}

function pumpMusic(): void {
  if (!context) return;
  while (nextBarTime < context.currentTime + LOOKAHEAD_SECONDS) {
    scheduleBar(nextBarTime);
    nextBarTime += BAR_SECONDS;
  }
}

function applyMute(): void {
  if (!context || !master) return;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.08);
}

function startMusic(): void {
  if (!context || !musicBus || musicTimer !== null) return;
  musicBus.gain.setValueAtTime(0.0001, context.currentTime);
  musicBus.gain.linearRampToValueAtTime(MUSIC_VOLUME, context.currentTime + 4);
  nextBarTime = context.currentTime + 0.2;
  pumpMusic();
  musicTimer = window.setInterval(pumpMusic, 250);
}

/** Cria o contexto de audio (precisa de um gesto do usuario) e comeca a musica. */
export function unlock(): void {
  if (typeof window === "undefined") return;
  if (!context) {
    context = new window.AudioContext();
    master = context.createGain();
    musicBus = context.createGain();
    sfxBus = context.createGain();
    sfxBus.gain.value = SFX_VOLUME;
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(context.destination);
    applyMute();
    document.addEventListener("visibilitychange", () => {
      if (!context) return;
      if (document.hidden) void context.suspend();
      else void context.resume();
    });
  }
  if (context.state === "suspended") void context.resume();
  startMusic();
}

export function playSfx(name: SfxName): void {
  if (!context || muted || context.state !== "running") return;
  const t = context.currentTime;
  switch (name) {
    case "click":
      tone(880, t, 0.04, { type: "square", gain: 0.05, release: 0.05 });
      tone(1320, t + 0.045, 0.05, { type: "square", gain: 0.04, release: 0.06 });
      break;
    case "prompt":
      tone(660, t, 0.07, { type: "triangle", gain: 0.08, release: 0.1 });
      tone(990, t + 0.09, 0.09, { type: "triangle", gain: 0.08, release: 0.15 });
      break;
    case "starTap":
      [784, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.07, 0.12, { gain: 0.1, release: 0.5 }));
      break;
    case "locked":
      tone(220, t, 0.1, { type: "triangle", gain: 0.09, glideTo: 170, release: 0.12 });
      break;
    case "discover":
      [72, 76, 79, 84, 88].forEach((m, i) =>
        tone(hz(m), t + i * 0.09, 0.18, { type: "triangle", gain: 0.09, release: 0.6 }),
      );
      break;
    case "shooting":
      tone(2400, t, 1.2, { gain: 0.04, glideTo: 500, release: 0.3 });
      [0.15, 0.4, 0.7].forEach((d) => tone(hz(96), t + d, 0.05, { gain: 0.03, release: 0.4 }));
      break;
    case "meow":
      meow(t);
      break;
    case "finale":
      [60, 64, 67, 72, 76].forEach((m, i) =>
        tone(hz(m), t + i * 0.12, 2.6, { gain: 0.05, attack: 0.5, release: 2 }),
      );
      break;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* sem armazenamento: vale so nesta sessao */
  }
  applyMute();
  listeners.forEach((listener) => listener());
}

/** Para `useSyncExternalStore`. */
export function subscribeMuted(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
