"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { frenchVoices, getVoicePrefs, isMaleVoice, isMuted, isNaturalVoice, setMuted, setVoicePrefs, sfx, speak, type VoicePrefs } from "@/lib/sound";

type Mood = "happy" | "wow" | "sad" | "think";

/** Cubo, la mascotte : un petit cube explorateur (SVG isométrique). */
export function Cubo({ size = 120, mood = "happy", className = "" }: { size?: number; mood?: Mood; className?: string }) {
  const eyeY = mood === "sad" ? 62 : 58;
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * 1.08} className={className} aria-hidden="true">
      <ellipse cx="60" cy="122" rx="38" ry="6" fill="#16123A" opacity="0.18" />
      {/* sac à dos */}
      <path d="M92 44 L106 52 L106 80 L92 72 Z" fill="#4FC3F7" stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      {/* faces du cube */}
      <path d="M60 14 L100 34 L60 54 L20 34 Z" fill="#FFB27A" stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M20 34 L60 54 L60 108 L20 88 Z" fill="#FF8A3D" stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 34 L60 54 L60 108 L100 88 Z" fill="#E66A1F" stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      {/* casquette d'explorateur */}
      <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#7BD88F" stroke="#16123A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* yeux */}
      {mood === "wow" ? (
        <>
          <path d="M28 58 l6 -6 l6 6" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 66 l6 -6 l6 6" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="34" cy={eyeY} rx="5.5" ry="7" fill="#fff" stroke="#16123A" strokeWidth="3" />
          <ellipse cx="50" cy={eyeY + 8} rx="5.5" ry="7" fill="#fff" stroke="#16123A" strokeWidth="3" />
          <circle cx={mood === "think" ? 33 : 35} cy={eyeY + (mood === "think" ? -2 : 1)} r="2.6" fill="#16123A" />
          <circle cx={mood === "think" ? 49 : 51} cy={eyeY + (mood === "think" ? 6 : 9)} r="2.6" fill="#16123A" />
        </>
      )}
      {/* bouche */}
      {mood === "sad" ? (
        <path d="M34 84 q8 -6 14 4" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
      ) : mood === "think" ? (
        <path d="M34 80 l14 6" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M32 76 q8 14 18 10" fill="#16123A" stroke="#16123A" strokeWidth="3.5" strokeLinejoin="round" />
      )}
      <ellipse cx="28" cy="72" rx="4" ry="3" fill="#FF6B57" opacity="0.7" />
    </svg>
  );
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 select-none" aria-label="CuboCode, accueil">
      <span className={`grid place-items-center rounded-xl bg-sun toon ${small ? "size-10" : "size-12"}`}>
        <Cubo size={small ? 30 : 36} />
      </span>
      <span className={`font-display font-bold tracking-tight ${small ? "text-2xl" : "text-3xl"}`}>
        Cubo<span className="text-grape">Code</span>
      </span>
    </Link>
  );
}

/** Bouton son + menu de réglage de la voix (mascotte). */
export function SoundToggle() {
  const [m, setM] = useState(false);
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [prefs, setPrefs] = useState<VoicePrefs>(getVoicePrefs());
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setM(isMuted());
    setPrefs(getVoicePrefs());
    if (!("speechSynthesis" in window)) return;
    const upd = () => setVoices(frenchVoices());
    upd();
    window.speechSynthesis.addEventListener("voiceschanged", upd);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", upd);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); };
  }, [open]);

  const update = (p: Partial<VoicePrefs>) => { setVoicePrefs(p); setPrefs(getVoicePrefs()); };
  const current = voices.find((v) => v.voiceURI === prefs.uri) ?? voices[0];

  return (
    <div ref={box} className="relative">
      <button
        className="btn grid size-11 place-items-center bg-paper"
        aria-label="Réglages du son et de la voix"
        aria-expanded={open}
        onClick={() => { setOpen(!open); sfx("click"); }}
      >
        {m ? <VolumeX size={22} strokeWidth={2.75} aria-hidden="true" /> : <Volume2 size={22} strokeWidth={2.75} aria-hidden="true" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -8 }}
            className="absolute top-14 right-0 z-[95] w-[320px] origin-top-right rounded-3xl border-[3px] border-ink bg-paper p-4 shadow-pop-lg"
            role="dialog" aria-label="Son et voix"
          >
            <label className="flex items-center justify-between gap-3 font-display text-lg font-bold">
              Effets sonores
              <input
                type="checkbox" checked={!m} className="size-6 accent-[#5B3DF5]"
                onChange={() => { setMuted(!m); setM(!m); if (m) sfx("click"); }}
              />
            </label>
            <hr className="my-3 border-t-2 border-ink/15" />
            <p className="font-display text-lg font-bold">Voix de Cubo</p>
            {voices.length === 0 ? (
              <p className="mt-1 text-sm font-bold text-ink-soft">Aucune voix française trouvée sur cet ordinateur.</p>
            ) : (
              <select
                className="mt-1 w-full rounded-xl border-[3px] border-ink bg-cream px-2 py-1.5 font-bold"
                value={current?.voiceURI ?? ""}
                aria-label="Choisir la voix"
                onChange={(e) => update({ uri: e.target.value })}
              >
                {voices.map((v, i) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {i === 0 ? "★ " : ""}{v.name.replace(/^Microsoft /, "").replace(/ - .*/, "")}
                    {isMaleVoice(v) ? " · homme" : ""}{isNaturalVoice(v) ? " · naturelle" : ""}{v.localService ? "" : " (en ligne)"}
                  </option>
                ))}
              </select>
            )}
            <label className="mt-3 block text-sm font-extrabold">
              Vitesse : {prefs.rate.toFixed(1)}
              <input type="range" min={0.8} max={1.4} step={0.1} value={prefs.rate} className="mt-1 w-full accent-[#5B3DF5]"
                onChange={(e) => update({ rate: Number(e.target.value) })} />
            </label>
            <label className="mt-2 flex items-center justify-between gap-3 text-sm font-extrabold">
              Lire les consignes automatiquement
              <input type="checkbox" checked={prefs.auto} className="size-5 accent-[#5B3DF5]" onChange={(e) => update({ auto: e.target.checked })} />
            </label>
            <button onClick={() => speak("Salut ! Moi, c'est Cubo. Prêt pour l'aventure ? C'est parti !")} className="btn mt-3 flex w-full items-center justify-center gap-2 bg-sky py-2">
              <Volume2 size={18} strokeWidth={2.75} aria-hidden="true" /> Écouter
            </button>
            <p className="mt-2 text-xs font-bold text-ink-soft">
              Astuce : dans Microsoft Edge, choisis « Henri » ou « Rémy » (naturelle) pour la meilleure voix. Hors-ligne, une voix du PC prend le relais.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Explosion de confettis (canvas plein écran, se nettoie seul). */
export function Confetti({ fire }: { fire: number }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!fire || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d")!;
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const colors = ["#FFD23F", "#3DDC97", "#4FC3F7", "#FF6B57", "#FF8FC7", "#5B3DF5", "#FFA94D"];
    const parts = Array.from({ length: 160 }, (_, i) => {
      const left = i % 2 === 0;
      return {
        x: left ? 0 : W, y: H * 0.7,
        vx: (left ? 1 : -1) * (6 + Math.random() * 10), vy: -(12 + Math.random() * 12),
        s: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: colors[i % colors.length], shape: i % 3,
      };
    });
    let raf = 0;
    let t = 0;
    const loop = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.strokeStyle = "#16123A"; ctx.lineWidth = 2;
        ctx.beginPath();
        if (p.shape === 0) ctx.rect(-p.s / 2, -p.s / 3, p.s, p.s / 1.5);
        else if (p.shape === 1) ctx.arc(0, 0, p.s / 2.2, 0, Math.PI * 2);
        else { ctx.moveTo(0, -p.s / 1.6); ctx.lineTo(p.s / 1.8, p.s / 2.5); ctx.lineTo(-p.s / 1.8, p.s / 2.5); ctx.closePath(); }
        ctx.fill(); ctx.stroke(); ctx.restore();
      }
      if (t < 200) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, W, H);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [fire, canvas]);
  return <canvas ref={setCanvas} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true" />;
}

/** Petit nombre qui rebondit quand il change. */
export function BumpNumber({ value, className = "" }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.8, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 12 }}
      className={`inline-block ${className}`}
    >
      {value}
    </motion.span>
  );
}
