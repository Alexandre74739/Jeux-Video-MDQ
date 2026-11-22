// Sons synthétisés avec Web Audio : aucun fichier à télécharger, fonctionne hors-ligne.
import { load, loadSession, save, saveSession } from "./storage";
import { lineId } from "./lines";
import manifest from "./voice-manifest.json";

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
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  opts: {
    type?: OscillatorType;
    vol?: number;
    slide?: number;
    delay?: number;
  } = {},
) {
  const c = ac();
  const t = c.currentTime + (opts.delay ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t);
  if (opts.slide)
    o.frequency.exponentialRampToValueAtTime(
      Math.max(30, freq * opts.slide),
      t + dur,
    );
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
  for (let i = 0; i < d.length; i++)
    d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
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
  snap: () => {
    tone(880, 0.06, { type: "square", vol: 0.06 });
    tone(1320, 0.08, { type: "triangle", vol: 0.1, delay: 0.04 });
  },
  trash: () => noise(0.25, 0.15, 0, 2500),
  step: () =>
    tone(300 + Math.random() * 60, 0.07, {
      type: "triangle",
      vol: 0.12,
      slide: 0.7,
    }),
  turn: () => tone(440, 0.07, { type: "sine", vol: 0.1, slide: 1.3 }),
  gem: () =>
    [988, 1319, 1568, 1976].forEach((f, i) =>
      tone(f, 0.14, { type: "triangle", vol: 0.12, delay: i * 0.06 }),
    ),
  crack: () => {
    noise(0.2, 0.35, 0, 900);
    tone(140, 0.15, { type: "square", vol: 0.08, slide: 0.5 });
  },
  plank: () => {
    tone(220, 0.1, { type: "square", vol: 0.08 });
    tone(330, 0.12, { type: "triangle", vol: 0.1, delay: 0.08 });
  },
  bump: () => tone(160, 0.25, { type: "square", vol: 0.1, slide: 0.5 }),
  splash: () => {
    noise(0.5, 0.3, 0, 1800);
    tone(600, 0.4, { type: "sine", vol: 0.1, slide: 0.3 });
  },
  fail: () =>
    [392, 330, 262].forEach((f, i) =>
      tone(f, 0.22, { type: "triangle", vol: 0.12, delay: i * 0.16 }),
    ),
  win: () =>
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      tone(f, i === 5 ? 0.5 : 0.14, {
        type: "square",
        vol: 0.07,
        delay: i * 0.1,
      }),
    ),
  star: (i = 0) =>
    tone(880 * Math.pow(1.26, i), 0.25, {
      type: "triangle",
      vol: 0.15,
      slide: 1.5,
    }),
  click: () => tone(660, 0.05, { type: "triangle", vol: 0.08 }),
  badge: () =>
    [659, 784, 988, 1319].forEach((f, i) =>
      tone(f, 0.2, { type: "triangle", vol: 0.12, delay: i * 0.08 }),
    ),
  // sons pour les jeux des enfants
  pop: () => tone(400, 0.1, { type: "sine", vol: 0.2, slide: 2.2 }),
  coin: () => {
    tone(988, 0.08, { type: "square", vol: 0.07 });
    tone(1319, 0.25, { type: "square", vol: 0.07, delay: 0.08 });
  },
  jump: () => tone(300, 0.25, { type: "square", vol: 0.07, slide: 2.5 }),
  boing: () => tone(180, 0.4, { type: "sine", vol: 0.2, slide: 2 }),
  magic: () =>
    [784, 988, 1175, 1568, 1976].forEach((f, i) =>
      tone(f, 0.12, { type: "sine", vol: 0.1, delay: i * 0.05 }),
    ),
  laser: () => tone(1600, 0.25, { type: "sawtooth", vol: 0.06, slide: 0.2 }),
};

export type SfxName = keyof typeof SFX;

export function sfx(name: SfxName, arg?: number) {
  if (muted || typeof window === "undefined") return;
  try {
    (SFX[name] as (a?: number) => void)(arg);
  } catch {
    /* audio indisponible */
  }
}

// ---------------------------------------------------------------- VOIX
// Cubo a une seule voix : Thierry (voix neuronale), pré-enregistrée dans public/voice/thierry/<id>.mp3
// par `npm run voices`. Si un fichier manque (hors-ligne, pas encore en cache), la synthèse vocale
// du navigateur prend le relais pour cette phrase.

const VOICE = "thierry";

export type VoicePrefs = { on: boolean; rate: number; auto: boolean };
const DEFAULT_VOICE: VoicePrefs = { on: true, rate: 1, auto: false };
let voicePrefs: VoicePrefs = DEFAULT_VOICE;
if (typeof window !== "undefined") {
  const saved = load<Partial<VoicePrefs>>("voice", {});
  voicePrefs = {
    on: saved.on ?? true,
    rate: saved.rate ?? 1,
    auto: saved.auto ?? false,
  };
}

const CLIPS = new Set((manifest as Record<string, string[]>)[VOICE] ?? []);
const clipUrl = (text: string) =>
  CLIPS.has(lineId(text)) ? `/voice/${VOICE}/${lineId(text)}.mp3` : null;

export const getVoicePrefs = () => voicePrefs;
export function setVoicePrefs(p: Partial<VoicePrefs>) {
  voicePrefs = { ...voicePrefs, ...p };
  save("voice", voicePrefs);
  if (p.on === false) stopSpeaking();
  listeners.forEach((f) => f());
}

const listeners = new Set<() => void>();
/** Prévient quand les réglages de voix changent ; renvoie la fonction de désinscription. */
export function onVoicePrefs(f: () => void) {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

/** Secours : meilleure voix française du navigateur (masculine et naturelle de préférence). */
function fallbackVoice(localOnly: boolean) {
  const MALE =
    /thierry|henri|r[eé]my|paul|thomas|antoine|jean|g[eé]rard|guillaume|fabrice|daniel|nicolas|male|homme/i;
  const score = (v: SpeechSynthesisVoice) =>
    (MALE.test(v.name) ? 10 : 0) +
    (/natural|neural|online|premium|enhanced/i.test(v.name) ? 5 : 0) +
    (v.localService ? 1 : 0);
  return window.speechSynthesis
    .getVoices()
    .filter(
      (v) =>
        v.lang.toLowerCase().startsWith("fr") && (!localOnly || v.localService),
    )
    .sort((a, b) => score(b) - score(a))[0];
}

function systemSpeak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const s = window.speechSynthesis;
  s.cancel();
  const say = (localOnly: boolean) => {
    const u = new SpeechSynthesisUtterance(
      text
        .replace(/[«»]/g, "")
        .replace(/…/g, "...")
        .replace(/\s*→\s*/g, ", "),
    );
    u.lang = "fr-FR";
    u.rate = voicePrefs.rate * 1.1;
    const v = fallbackVoice(localOnly);
    if (v) u.voice = v;
    if (v && !v.localService && !localOnly)
      u.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") say(true);
      };
    s.speak(u);
  };
  say(!navigator.onLine);
}

let audio: HTMLAudioElement | null = null;
let token = 0;

/** Arrête la phrase en cours. */
export function stopSpeaking() {
  token++;
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window)
    window.speechSynthesis.cancel();
}

/**
 * Cubo dit une ou plusieurs phrases (une phrase = un fichier audio).
 * Ne fait rien si la voix est coupée dans le menu son (les effets sonores restent actifs).
 */
export function speak(text: string | string[]) {
  if (typeof window === "undefined" || !voicePrefs.on) return;
  const parts = (Array.isArray(text) ? text : [text]).filter(Boolean);
  stopSpeaking();
  if (!parts.length) return;
  const urls = parts.map(clipUrl);
  if (urls.some((u) => !u)) {
    systemSpeak(parts.join(" "));
    return;
  }

  const my = token;
  audio ??= new Audio();
  const a = audio;
  let i = 0;
  const next = () => {
    if (my !== token || i >= urls.length) return;
    a.src = urls[i++]!;
    a.playbackRate = voicePrefs.rate;
    a.onended = () => setTimeout(next, 180);
    a.onerror = () => {
      if (my === token) systemSpeak(parts.slice(i - 1).join(" "));
    };
    a.play().catch(() => {
      /* lecture bloquée par le navigateur avant un premier clic */
    });
  };
  next();
}

/**
 * Télécharge en arrière-plan les fichiers de la voix, pour qu'elle marche ensuite hors-ligne
 * (le service worker les met en cache). Une fois par session.
 */
export function warmVoice() {
  if (typeof window === "undefined" || !navigator.onLine || !CLIPS.size) return;
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (conn?.saveData) return;
  const flag = `voiceWarm:${VOICE}`;
  if (loadSession(flag, false)) return;
  saveSession(flag, true);
  const queue = [...CLIPS].map((id) => `/voice/${VOICE}/${id}.mp3`);
  const worker = async () => {
    while (queue.length) {
      try {
        await fetch(queue.shift()!);
      } catch {
        return;
      }
    }
  };
  const start = () => {
    for (let k = 0; k < 2; k++) worker();
  };
  if ("requestIdleCallback" in window)
    window.requestIdleCallback(start, { timeout: 8000 });
  else setTimeout(start, 4000);
}
