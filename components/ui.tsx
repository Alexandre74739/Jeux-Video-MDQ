"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getVoicePrefs, isMuted, onVoicePrefs, setMuted, setVoicePrefs, sfx, speak, type VoicePrefs } from "@/lib/sound";
import { LINES } from "@/lib/lines";
import { useOutfit } from "@/lib/outfit";
import { colorOf, type Outfit } from "@/lib/rewards";

type Mood = "happy" | "wow" | "sad" | "think";

/** Chapeaux de Cubo en 2D, posés sur la face du dessus (centre ≈ 60,26). */
function Hat2D({ id }: { id: string }) {
  const S = { stroke: "#16123A", strokeWidth: 3.5, strokeLinejoin: "round" as const };
  switch (id) {
    case "aucun": return null;
    case "helice":
      return (
        <g>
          <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#FF6B57" {...S} />
          <path d="M60 24 L60 8" stroke="#16123A" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="49" cy="7" rx="11" ry="3.5" fill="#FFD23F" {...S} strokeWidth={3} />
          <ellipse cx="71" cy="7" rx="11" ry="3.5" fill="#4FC3F7" {...S} strokeWidth={3} />
          <circle cx="60" cy="7" r="3" fill="#16123A" />
        </g>
      );
    case "sorcier":
      return (
        <g>
          <ellipse cx="60" cy="29" rx="27" ry="9" fill="#7356E0" {...S} />
          <path d="M42 29 Q50 6 62 -8 Q66 10 78 29 Z" fill="#9B7BFF" {...S} />
          <path d="M57 14 l2 -5 l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 Z" fill="#FFD23F" stroke="#16123A" strokeWidth="1.5" />
        </g>
      );
    case "cowboy":
      return (
        <g>
          <ellipse cx="60" cy="30" rx="36" ry="11" fill="#B5672D" {...S} />
          <path d="M45 29 L47 12 Q60 6 73 12 L75 29 Q60 34 45 29 Z" fill="#D69A5B" {...S} />
          <path d="M46 24 Q60 29 74 24" fill="none" stroke="#6B4423" strokeWidth="4" />
        </g>
      );
    case "pirate":
      return (
        <g>
          <path d="M28 31 Q44 2 60 8 Q76 2 92 31 Q60 22 28 31 Z" fill="#16123A" {...S} />
          <circle cx="60" cy="18" r="4.5" fill="#fff" />
          <path d="M55 24 l10 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "couronne":
      return (
        <g>
          <path d="M42 32 L40 12 L50 21 L60 6 L70 21 L80 12 L78 32 Q60 38 42 32 Z" fill="#FFD23F" {...S} />
          <circle cx="60" cy="26" r="3" fill="#FF6B57" stroke="#16123A" strokeWidth="1.5" />
          <circle cx="49" cy="27" r="2.4" fill="#4FC3F7" stroke="#16123A" strokeWidth="1.5" />
          <circle cx="71" cy="27" r="2.4" fill="#3DDC97" stroke="#16123A" strokeWidth="1.5" />
        </g>
      );
    case "licorne":
      return (
        <g>
          <path d="M53 30 L63 -6 L69 30 Q61 34 53 30 Z" fill="#FFF1BF" {...S} />
          <path d="M55 22 L67 18 M57 13 L66 9 M59 4 L64 2" stroke="#FF8FC7" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    default:
      return <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#7BD88F" {...S} />;
  }
}

/** Cubo, la mascotte : un petit cube explorateur (SVG isométrique), avec la tenue choisie. */
export function Cubo({ size = 120, mood = "happy", className = "", outfit }: { size?: number; mood?: Mood; className?: string; outfit?: Outfit }) {
  const current = useOutfit();
  const o = outfit ?? current;
  const [top, left, right] = colorOf(o.color).faces;
  const eyeY = mood === "sad" ? 62 : 58;
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * 1.08} className={className} style={{ overflow: "visible" }} aria-hidden="true">
      <ellipse cx="60" cy="122" rx="38" ry="6" fill="#16123A" opacity="0.18" />
      {/* sac à dos */}
      <path d="M92 44 L106 52 L106 80 L92 72 Z" fill="#4FC3F7" stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      {/* faces du cube */}
      <path d="M60 14 L100 34 L60 54 L20 34 Z" fill={top} stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M20 34 L60 54 L60 108 L20 88 Z" fill={left} stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 34 L60 54 L60 108 L100 88 Z" fill={right} stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <Hat2D id={o.hat} />
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
  const [prefs, setPrefs] = useState<VoicePrefs>(getVoicePrefs());
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setM(isMuted());
    setPrefs(getVoicePrefs());
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
            <label className="flex items-center justify-between gap-3 font-display text-lg font-bold">
              Voix de Cubo
              <input
                type="checkbox" checked={prefs.on} className="size-6 accent-[#5B3DF5]"
                onChange={(e) => { update({ on: e.target.checked }); sfx("click"); }}
              />
            </label>
            <p className="text-xs font-bold text-ink-soft">Coupe seulement la voix : les effets sonores restent actifs.</p>
            <fieldset disabled={!prefs.on} className={`mt-1 ${prefs.on ? "" : "opacity-45"}`}>
            <label className="mt-2 block text-sm font-extrabold">
              Vitesse : {prefs.rate.toFixed(1)}
              <input type="range" min={0.8} max={1.4} step={0.1} value={prefs.rate} className="mt-1 w-full accent-[#5B3DF5]"
                onChange={(e) => update({ rate: Number(e.target.value) })} />
            </label>
            <label className="mt-2 flex items-center justify-between gap-3 text-sm font-extrabold">
              Lire les consignes automatiquement
              <input type="checkbox" checked={prefs.auto} className="size-5 accent-[#5B3DF5]" onChange={(e) => update({ auto: e.target.checked })} />
            </label>
            <button onClick={() => speak(LINES.hello)} className="btn mt-3 flex w-full items-center justify-center gap-2 bg-sky py-2">
              <Volume2 size={18} strokeWidth={2.75} aria-hidden="true" /> Écouter
            </button>
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Vrai quand la voix de Cubo est activée (mis à jour en direct). */
export function useVoiceOn() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(getVoicePrefs().on);
    return onVoicePrefs(() => setOn(getVoicePrefs().on));
  }, []);
  return on;
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
