"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Cubo } from "@/_components/ui/Cubo";
import { speak, stopSpeaking, sfx } from "@/lib/sound";
import type { Scene } from "@/lib/story";

const INK = "#16123A";

/**
 * Dessin de chaque morceau, dans l'ordre de MAP_COURSES. Comme dans l'histoire, chaque morceau montre le lieu suivant :
 * la vallée aux portes fermées, la montagne qui fume, les couloirs qui tournent, puis l'île au phare.
 */
const DRAWINGS = [
  // 1. Vallée des clés : une porte et sa clé
  <g key="cles">
    <image href="/sprites/1f6aa.svg" x="12" y="14" width="54" height="54" />
    <image href="/sprites/1f511.svg" x="52" y="48" width="34" height="34" />
  </g>,
  // 2. Le volcan qui fume
  <image
    key="volcan"
    href="/sprites/1f30b.svg"
    x="113"
    y="12"
    width="74"
    height="74"
  />,
  // 3. Le labyrinthe : des couloirs qui tournent jusqu'au centre
  <g key="laby">
    <path
      d="M34 120 H82 V182 H18 V120 M34 136 H66 V166 H34 V150 H50"
      fill="none"
      stroke="#8A5A2B"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="42"
      cy="158"
      r="5"
      fill="#FFD23F"
      stroke={INK}
      strokeWidth="2"
    />
  </g>,
  // 4. L'île secrète et son phare
  <g key="ile">
    <path
      d="M110 182 q6 -5 12 0 t12 0 M164 182 q6 -5 12 0 t12 0 M118 192 q6 -5 12 0 t12 0 t12 0 t12 0 t12 0"
      fill="none"
      stroke="#4FB6E8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <ellipse
      cx="150"
      cy="172"
      rx="34"
      ry="10"
      fill="#F2C46D"
      stroke={INK}
      strokeWidth="2.5"
    />
    <path d="M142 168 L145 128 H155 L158 168 Z" fill="#fff" />
    <path
      d="M142.75 158 L143.35 150 H156.65 L157.25 158 Z M143.95 142 L144.55 134 H155.45 L156.05 142 Z"
      fill="#FF5A4E"
    />
    <path
      d="M142 168 L145 128 H155 L158 168 Z"
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect
      x="144"
      y="117"
      width="12"
      height="11"
      fill="#FFD23F"
      stroke={INK}
      strokeWidth="2.5"
    />
    <path
      d="M140 118 L150 107 L160 118 Z"
      fill="#FF5A4E"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </g>,
];

/** Carte au trésor en 4 morceaux (2 × 2). `got[i]` : morceau i trouvé ; `fresh` : morceau qui vient d'arriver. */
export function TreasureMap({
  got,
  fresh,
  size = 220,
}: {
  got: boolean[];
  fresh?: number;
  size?: number;
}) {
  const pieces = [
    {
      x: 0,
      y: 0,
      d: "M0 0 H100 V48 Q92 56 100 64 V100 H64 Q56 92 48 100 H0 Z",
    },
    {
      x: 100,
      y: 0,
      d: "M100 0 H200 V100 H152 Q144 108 136 100 H100 V64 Q108 56 100 48 Z",
    },
    {
      x: 0,
      y: 100,
      d: "M0 100 H48 Q56 92 64 100 H100 V136 Q92 144 100 152 V200 H0 Z",
    },
    {
      x: 100,
      y: 100,
      d: "M100 100 H136 Q144 108 152 100 H200 V200 H100 V152 Q108 144 100 136 Z",
    },
  ];
  const count = got.filter(Boolean).length;
  return (
    <svg
      viewBox="-6 -6 212 212"
      width={size}
      height={size}
      className="max-w-full"
      role="img"
      aria-label={`Carte au trésor : ${count} morceau${count > 1 ? "x" : ""} sur 4`}
    >
      {pieces.map((p, i) => (
        <g key={i}>
          {got[i] ? (
            <motion.g
              initial={
                fresh === i ? { scale: 0, rotate: -30, opacity: 0 } : false
              }
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 12,
              }}
              style={{ transformOrigin: `${p.x + 50}px ${p.y + 50}px` }}
            >
              <path
                d={p.d}
                fill="#F4E2AE"
                stroke={INK}
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <g pointerEvents="none">{DRAWINGS[i]}</g>
            </motion.g>
          ) : (
            <>
              <path
                d={p.d}
                fill={INK}
                fillOpacity="0.06"
                stroke={INK}
                strokeOpacity="0.3"
                strokeWidth="3"
                strokeDasharray="7 6"
              />
              <text
                x={p.x + 50}
                y={p.y + 62}
                textAnchor="middle"
                fontSize="34"
                fontWeight="800"
                fill={INK}
                opacity="0.3"
              >
                ?
              </text>
            </>
          )}
        </g>
      ))}
      {/* Carte complète : un chemin relie les lieux et le coffre apparaît au centre, sur la croix */}
      {count === 4 && (
        <g pointerEvents="none">
          <path
            d="M66 46 Q100 24 118 40 M150 88 Q150 112 84 118 M74 150 Q100 136 128 150"
            fill="none"
            stroke="#C0392B"
            strokeWidth="3"
            strokeDasharray="2 7"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M88 88 L112 112 M112 88 L88 112"
            stroke="#C0392B"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <image
            href="/sprites/coffre.svg"
            x="83"
            y="82"
            width="34"
            height="34"
          />
        </g>
      )}
    </svg>
  );
}

/** Scène d'histoire : quelques pages lues par Cubo, avec « Suivant ». */
export default function StoryModal({
  scene,
  onClose,
  map,
  cta = "C'est parti !",
}: {
  scene: Scene;
  onClose: () => void;
  map?: { got: boolean[]; fresh?: number };
  cta?: string;
}) {
  const [page, setPage] = useState(0);
  const p = scene.pages[page];
  const last = page === scene.pages.length - 1;

  useEffect(() => {
    speak(p.text);
  }, [p.text]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/60 px-4 pt-20 pb-6 sm:items-center sm:py-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-title"
    >
      <motion.div
        initial={{ scale: 0.6, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative h-fit w-[480px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:p-7"
      >
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <Cubo size={96} mood={p.mood} />
        </motion.div>
        <p className="mt-8 text-sm font-extrabold tracking-wide text-grape uppercase">
          L'histoire de Cubo
        </p>
        <h2 id="story-title" className="text-3xl font-bold sm:text-4xl">
          {scene.title}
        </h2>
        {map && (
          <div className="mt-3 flex justify-center">
            <TreasureMap got={map.got} fresh={map.fresh} size={180} />
          </div>
        )}
        <div className="mt-3 min-h-[96px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-lg leading-snug font-bold"
              aria-live="polite"
            >
              {p.text}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {scene.pages.map((_, i) => (
            <span
              key={i}
              className={`size-3 rounded-full border-2 border-ink ${i === page ? "bg-grape" : i < page ? "bg-ink/40" : "bg-paper"}`}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
          {!last && (
            <button
              onClick={() => {
                sfx("click");
                onClose();
              }}
              className="btn bg-paper px-5 py-3 text-lg sm:flex-1"
            >
              Passer
            </button>
          )}
          <motion.button
            autoFocus
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            onClick={() => {
              sfx("click");
              if (last) onClose();
              else setPage(page + 1);
            }}
            className="btn flex items-center justify-center gap-2 bg-mint py-3 text-lg sm:flex-[2]"
          >
            {last ? (
              <>
                <Check size={20} strokeWidth={3} aria-hidden="true" /> {cta}
              </>
            ) : (
              <>
                Suivant{" "}
                <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
