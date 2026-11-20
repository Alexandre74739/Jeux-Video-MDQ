// Sons synthétisés avec Web Audio : aucun fichier à télécharger, fonctionne hors-ligne.
import { load, save } from "./storage";

let ctx: AudioContext | null = null;
let muted = false;
if (typeof window !== "undefined") muted = load("muted", false);

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  save("muted", m);
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; vol?: number; slide?: number; delay?: number } = {}) {
  const c = ac();
  const t = c.currentTime + (opts.delay ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t);
  if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * opts.slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.18, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, vol = 0.2, delay = 0, freq = 1200) {
  const c = ac();
  const t = c.currentTime + delay;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(c.destination);
  s.start(t);
}

const SFX = {
  pick: () => tone(520, 0.08, { type: "triangle", vol: 0.12, slide: 1.4 }),
  snap: () => { tone(880, 0.06, { type: "square", vol: 0.06 }); tone(1320, 0.08, { type: "triangle", vol: 0.1, delay: 0.04 }); },
  trash: () => noise(0.25, 0.15, 0, 2500),
  step: () => tone(300 + Math.random() * 60, 0.07, { type: "triangle", vol: 0.12, slide: 0.7 }),
  turn: () => tone(440, 0.07, { type: "sine", vol: 0.1, slide: 1.3 }),
  gem: () => [988, 1319, 1568, 1976].forEach((f, i) => tone(f, 0.14, { type: "triangle", vol: 0.12, delay: i * 0.06 })),
  crack: () => { noise(0.2, 0.35, 0, 900); tone(140, 0.15, { type: "square", vol: 0.08, slide: 0.5 }); },
  plank: () => { tone(220, 0.1, { type: "square", vol: 0.08 }); tone(330, 0.12, { type: "triangle", vol: 0.1, delay: 0.08 }); },
  bump: () => tone(160, 0.25, { type: "square", vol: 0.1, slide: 0.5 }),
  splash: () => { noise(0.5, 0.3, 0, 1800); tone(600, 0.4, { type: "sine", vol: 0.1, slide: 0.3 }); },
  fail: () => [392, 330, 262].forEach((f, i) => tone(f, 0.22, { type: "triangle", vol: 0.12, delay: i * 0.16 })),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.14, { type: "square", vol: 0.07, delay: i * 0.1 })),
  star: (i = 0) => tone(880 * Math.pow(1.26, i), 0.25, { type: "triangle", vol: 0.15, slide: 1.5 }),
  click: () => tone(660, 0.05, { type: "triangle", vol: 0.08 }),
  badge: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.2, { type: "triangle", vol: 0.12, delay: i * 0.08 })),
  // sons pour les jeux des enfants
  pop: () => tone(400, 0.1, { type: "sine", vol: 0.2, slide: 2.2 }),
  coin: () => { tone(988, 0.08, { type: "square", vol: 0.07 }); tone(1319, 0.25, { type: "square", vol: 0.07, delay: 0.08 }); },
  jump: () => tone(300, 0.25, { type: "square", vol: 0.07, slide: 2.5 }),
  boing: () => tone(180, 0.4, { type: "sine", vol: 0.2, slide: 2 }),
  magic: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.12, { type: "sine", vol: 0.1, delay: i * 0.05 })),
  laser: () => tone(1600, 0.25, { type: "sawtooth", vol: 0.06, slide: 0.2 }),
};

export type SfxName = keyof typeof SFX;

export function sfx(name: SfxName, arg?: number) {
  if (muted || typeof window === "undefined") return;
  try { (SFX[name] as (a?: number) => void)(arg); } catch { /* audio indisponible */ }
}

// ---------------------------------------------------------------- VOIX
// Synthèse vocale du navigateur. On choisit en priorité une voix française masculine
// et « naturelle » (ex. Microsoft Henri / Rémy Online (Natural) dans Edge), avec un
// repli automatique sur une voix installée sur le PC si la voix en ligne échoue (hors-ligne).

export type VoicePrefs = { uri: string; rate: number; pitch: number; auto: boolean };
const DEFAULT_VOICE: VoicePrefs = { uri: "", rate: 1.1, pitch: 0.95, auto: false };
let voicePrefs: VoicePrefs = DEFAULT_VOICE;
if (typeof window !== "undefined") voicePrefs = { ...DEFAULT_VOICE, ...load<Partial<VoicePrefs>>("voice", {}) };

export const getVoicePrefs = () => voicePrefs;
export function setVoicePrefs(p: Partial<VoicePrefs>) {
  voicePrefs = { ...voicePrefs, ...p };
  save("voice", voicePrefs);
}

const MALE = /henri|r[eé]my|paul|thomas|antoine|jean|g[eé]rard|guillaume|fabrice|alain|daniel|mathieu|nicolas|olivier|yves|jacques|julien|hugo|lucien|vincent|maxime|aur[eé]lien|male|homme/i;
const FEMALE = /julie|hortense|denise|eloise|élo[iï]se|vivienne|brigitte|celeste|c[eé]line|am[eé]lie|audrey|marie|virginie|sylvie|caroline|nathalie|female|femme|google fran/i;

export const isMaleVoice = (v: SpeechSynthesisVoice) => MALE.test(v.name) && !FEMALE.test(v.name);
export const isNaturalVoice = (v: SpeechSynthesisVoice) => /natural|neural|online|premium|enhanced/i.test(v.name);

function score(v: SpeechSynthesisVoice) {
  return (isMaleVoice(v) ? 10 : 0) + (isNaturalVoice(v) ? 5 : 0) + (v.lang === "fr-FR" ? 2 : 0) + (v.localService ? 1 : 0);
}

/** Voix françaises disponibles, la meilleure d'abord. */
export function frenchVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr")).sort((a, b) => score(b) - score(a));
}

function pickVoice(localOnly = false) {
  const list = frenchVoices().filter((v) => !localOnly || v.localService);
  return list.find((v) => v.voiceURI === voicePrefs.uri) ?? list[0];
}

/** Lecture à voix haute avec la voix choisie. */
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const s = window.speechSynthesis;
  s.cancel();
  const say = (localOnly: boolean) => {
    const u = new SpeechSynthesisUtterance(text.replace(/[«»]/g, "").replace(/…/g, "..."));
    u.lang = "fr-FR";
    u.rate = voicePrefs.rate;
    u.pitch = voicePrefs.pitch;
    const v = pickVoice(localOnly);
    if (v) u.voice = v;
    // Voix en ligne indisponible (pas de réseau) : on réessaie avec une voix du PC.
    if (v && !v.localService && !localOnly) u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") say(true); };
    s.speak(u);
  };
  say(!navigator.onLine);
}
