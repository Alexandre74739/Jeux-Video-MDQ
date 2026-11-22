"use client";
import { motion } from "motion/react";
import LIBRARY from "@/lib/sprites.json";

/** Personnages d'une catégorie de la bibliothèque, qui apparaissent un par un. */
export function SpriteGrid({
  category,
  onPick,
}: {
  category: string;
  onPick: (name: string, src: string) => void;
}) {
  return (
    <div className="scroll-soft grid grid-cols-6 gap-3 overflow-y-auto p-5">
      {LIBRARY.filter((s) => s.category === category).map((s, i) => (
        <motion.button
          key={s.id}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: i * 0.02,
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
          whileHover={{ scale: 1.1, rotate: -4 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPick(s.name, s.src)}
          className="flex flex-col items-center rounded-2xl border-[3px] border-ink/20 bg-cream p-2 hover:border-ink"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" className="size-16" />
          <span className="text-sm font-extrabold">{s.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
