"use client";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { ImagePlus, X } from "lucide-react";
import { resizeImage } from "@/lib/image";
import { sfx } from "@/lib/sound";
import LIBRARY from "@/lib/sprites.json";
import { ICON_STROKE } from "@/lib/site";

export function SpriteLibrary({ onClose, onPick, onError }: { onClose: () => void; onPick: (name: string, src: string) => void; onError: (m: string) => void }) {
  const cats = Array.from(new Set(LIBRARY.map((s) => s.category)));
  const [cat, setCat] = useState(cats[0]);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] grid place-items-center bg-ink/50 p-4"
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="lib-title"
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 40 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-[760px] max-w-full flex-col overflow-hidden rounded-[32px] border-[3px] border-ink bg-paper shadow-pop-xl"
      >
        <div className="flex items-center gap-3 border-b-[3px] border-ink bg-pink px-5 py-3">
          <Cubo size={40} mood="wow" />
          <h2 id="lib-title" className="text-2xl font-bold">Choisis un personnage</h2>
          <button onClick={onClose} className="btn ml-auto grid size-10 place-items-center bg-paper" aria-label="Fermer"><X size={22} strokeWidth={3} aria-hidden="true" /></button>
        </div>
        <div className="flex flex-wrap gap-2 border-b-[3px] border-ink bg-cream px-5 py-3">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); sfx("click"); }}
              aria-pressed={c === cat}
              className={`btn px-4 py-1.5 ${c === cat ? "bg-sun" : "bg-paper"}`}
            >
              {c}
            </button>
          ))}
          <button onClick={() => fileRef.current?.click()} className="btn ml-auto flex items-center gap-2 bg-sky px-4 py-1.5"><ImagePlus size={19} strokeWidth={ICON_STROKE} aria-hidden="true" /> Importer une image</button>
          <input
            ref={fileRef} type="file" accept="image/*" hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                const src = await resizeImage(f, 160);
                onPick(f.name.replace(/\.[^.]+$/, "").slice(0, 14) || "Image", src);
              } catch {
                onError("Oups, cette image ne marche pas.");
              }
            }}
          />
        </div>
        <div className="scroll-soft grid grid-cols-6 gap-3 overflow-y-auto p-5">
          {LIBRARY.filter((s) => s.category === cat).map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.02, type: "spring", stiffness: 400, damping: 15 }}
              whileHover={{ scale: 1.1, rotate: -4 }} whileTap={{ scale: 0.9 }}
              onClick={() => onPick(s.name, s.src)}
              className="flex flex-col items-center rounded-2xl border-[3px] border-ink/20 bg-cream p-2 hover:border-ink"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" className="size-16" />
              <span className="text-sm font-extrabold">{s.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
