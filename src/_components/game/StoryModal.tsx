"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Cubo } from "@/_components/ui/Cubo";
import { speak, stopSpeaking, sfx } from "@/lib/sound";
import type { Scene } from "@/lib/story";

/** Carte au trésor en 4 morceaux (2 × 2). `got[i]` : morceau i trouvé ; `fresh` : morceau qui vient d'arriver. */
export function TreasureMap({ got, fresh, size = 220 }: { got: boolean[]; fresh?: number; size?: number }) {
  const pieces = [
    { x: 0, y: 0, d: "M0 0 H100 V48 Q92 56 100 64 V100 H64 Q56 92 48 100 H0 Z" },
    { x: 100, y: 0, d: "M100 0 H200 V100 H152 Q144 108 136 100 H100 V64 Q108 56 100 48 Z" },
    { x: 0, y: 100, d: "M0 100 H48 Q56 92 64 100 H100 V136 Q92 144 100 152 V200 H0 Z" },
    { x: 100, y: 100, d: "M100 100 H136 Q144 108 152 100 H200 V200 H100 V152 Q108 144 100 136 Z" },
  ];
  return (
    <svg viewBox="-6 -6 212 212" width={size} height={size} className="max-w-full" role="img"
      aria-label={`Carte au trésor : ${got.filter(Boolean).length} morceau${got.filter(Boolean).length > 1 ? "x" : ""} sur 4`}>
      <defs>
        <clipPath id="map-clip"><rect x="0" y="0" width="200" height="200" rx="10" /></clipPath>
      </defs>
      {pieces.map((p, i) => (
        <g key={i}>
          {got[i] ? (
            <motion.g
              initial={fresh === i ? { scale: 0, rotate: -30, opacity: 0 } : false}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
              style={{ transformOrigin: `${p.x + 50}px ${p.y + 50}px` }}
            >
              <path d={p.d} fill="#F4E2AE" stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
            </motion.g>
          ) : (
            <path d={p.d} fill="#16123A" fillOpacity="0.06" stroke="#16123A" strokeOpacity="0.3" strokeWidth="3" strokeDasharray="7 6" />
          )}
          {!got[i] && <text x={p.x + 50} y={p.y + 62} textAnchor="middle" fontSize="34" fontWeight="800" fill="#16123A" opacity="0.3">?</text>}
        </g>
      ))}
      {/* Dessins de la carte, visibles seulement sur les morceaux trouvés */}
      <g clipPath="url(#map-clip)" pointerEvents="none">
        {got[0] && <g><circle cx="38" cy="40" r="12" fill="#7BD88F" stroke="#16123A" strokeWidth="3" /><path d="M30 70 l8 -14 l8 14 Z" fill="#3FAE4A" stroke="#16123A" strokeWidth="2.5" /></g>}
        {got[1] && <g><rect x="140" y="30" width="22" height="30" rx="4" fill="#A0612E" stroke="#16123A" strokeWidth="3" /><circle cx="156" cy="46" r="2.5" fill="#FFD23F" /></g>}
        {got[2] && <g><path d="M22 180 L48 128 L74 180 Z" fill="#5A4A5E" stroke="#16123A" strokeWidth="3" strokeLinejoin="round" /><path d="M40 136 Q48 124 56 136" fill="#FF6A1F" stroke="#16123A" strokeWidth="2.5" /></g>}
        {got[3] && <g><path d="M130 130 h40 v20 h-24 v20 h30" fill="none" stroke="#9B7BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><path d="M166 172 l12 12 M178 172 l-12 12" stroke="#FF6B57" strokeWidth="6" strokeLinecap="round" /></g>}
        <path d="M40 50 Q90 70 150 50 Q170 110 60 150 Q120 160 170 178" fill="none" stroke="#16123A" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round"
          opacity={got.every(Boolean) ? 0.7 : 0} />
      </g>
    </svg>
  );
}

/** Scène d'histoire : quelques pages lues par Cubo, avec « Suivant ». */
export default function StoryModal({ scene, onClose, map, cta = "C'est parti !" }: {
  scene: Scene; onClose: () => void; map?: { got: boolean[]; fresh?: number }; cta?: string;
}) {
  const [page, setPage] = useState(0);
  const p = scene.pages[page];
  const last = page === scene.pages.length - 1;

  useEffect(() => { speak(p.text); }, [p.text]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/60 px-4 pt-20 pb-6 sm:items-center sm:py-16"
      role="dialog" aria-modal="true" aria-labelledby="story-title"
    >
      <motion.div
        initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative h-fit w-[480px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:p-7"
      >
        <motion.div className="absolute -top-16 left-1/2 -translate-x-1/2" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <Cubo size={96} mood={p.mood} />
        </motion.div>
        <p className="mt-8 text-sm font-extrabold tracking-wide text-grape uppercase">L'histoire de Cubo</p>
        <h2 id="story-title" className="text-3xl font-bold sm:text-4xl">{scene.title}</h2>
        {map && <div className="mt-3 flex justify-center"><TreasureMap got={map.got} fresh={map.fresh} size={180} /></div>}
        <div className="mt-3 min-h-[96px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={page}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="text-lg leading-snug font-bold"
              aria-live="polite"
            >
              {p.text}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {scene.pages.map((_, i) => <span key={i} className={`size-3 rounded-full border-2 border-ink ${i === page ? "bg-grape" : i < page ? "bg-ink/40" : "bg-paper"}`} />)}
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
          {!last && <button onClick={() => { sfx("click"); onClose(); }} className="btn bg-paper px-5 py-3 text-lg sm:flex-1">Passer</button>}
          <motion.button
            autoFocus
            animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
            onClick={() => { sfx("click"); if (last) onClose(); else setPage(page + 1); }}
            className="btn flex items-center justify-center gap-2 bg-mint py-3 text-lg sm:flex-[2]"
          >
            {last ? <><Check size={20} strokeWidth={3} aria-hidden="true" /> {cta}</> : <>Suivant <ArrowRight size={20} strokeWidth={3} aria-hidden="true" /></>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
