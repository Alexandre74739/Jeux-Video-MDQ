"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { X } from "lucide-react";
import { sfx } from "@/lib/sound";
import { useEscape } from "@/hooks/useEscape";
import LIBRARY from "@/lib/sprites.json";
import { ImageImportButton } from "./ImageImportButton";
import { SpriteGrid } from "./SpriteGrid";

export function SpriteLibrary({
  onClose,
  onPick,
  onError,
}: {
  onClose: () => void;
  onPick: (name: string, src: string) => void;
  onError: (m: string) => void;
}) {
  const cats = Array.from(new Set(LIBRARY.map((s) => s.category)));
  const [cat, setCat] = useState(cats[0]);
  useEscape(onClose);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-90 grid place-items-center bg-ink/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lib-title"
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 40 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-190 max-w-full flex-col overflow-hidden rounded-4xl border-[3px] border-ink bg-paper shadow-pop-xl"
      >
        <div className="flex items-center gap-3 border-b-[3px] border-ink bg-pink px-5 py-3">
          <Cubo size={40} mood="wow" />
          <h2 id="lib-title" className="text-2xl font-bold">
            Choisis un personnage
          </h2>
          <button
            onClick={onClose}
            className="btn ml-auto grid size-10 place-items-center bg-paper"
            aria-label="Fermer"
          >
            <X size={22} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-b-[3px] border-ink bg-cream px-5 py-3">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                sfx("click");
              }}
              aria-pressed={c === cat}
              className={`btn px-4 py-1.5 ${c === cat ? "bg-sun" : "bg-paper"}`}
            >
              {c}
            </button>
          ))}
          <ImageImportButton onPick={onPick} onError={onError} />
        </div>
        <SpriteGrid category={cat} onPick={onPick} />
      </motion.div>
    </motion.div>
  );
}
