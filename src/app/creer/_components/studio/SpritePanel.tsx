"use client";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { BACKGROUNDS, type Project } from "@/lib/runtime";
import { sfx } from "@/lib/sound";
import type { StudioState } from "./useStudio";

/** Personnages du jeu (choisir, ajouter) et choix du décor. */
export function SpritePanel({
  s,
  project,
}: {
  s: StudioState;
  project: Project;
}) {
  return (
    <div className="toon flex min-h-0 flex-1 flex-col gap-2 rounded-3xl bg-paper p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Personnages</h2>
        <div
          className="flex flex-wrap items-center gap-1"
          role="radiogroup"
          aria-label="Décor"
        >
          <span className="mr-1 text-sm font-extrabold whitespace-nowrap">
            Décor :
          </span>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              role="radio"
              aria-checked={b.id === project.bg}
              aria-label={b.name}
              title={b.name}
              onClick={() => {
                s.setProject({ ...project, bg: b.id });
                sfx("click");
              }}
              className={`size-7 rounded-lg border-[3px] ${b.id === project.bg ? "border-ink shadow-pop" : "border-ink/30"}`}
              style={{ background: b.css }}
            />
          ))}
        </div>
      </div>
      <div className="scroll-soft flex min-h-0 flex-wrap content-start gap-2 overflow-y-auto">
        {project.sprites.map((sp) => (
          <motion.button
            key={sp.id}
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ y: -3 }}
            onClick={() => {
              s.setSel(sp.id);
              sfx("click");
            }}
            aria-pressed={sp.id === s.sel}
            className={`flex w-[78px] flex-col items-center rounded-2xl border-[3px] p-1 ${sp.id === s.sel ? "border-ink bg-lilac shadow-pop" : "border-ink/25 bg-cream"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sp.src} alt="" className="size-11 object-contain" />
            <span className="w-full truncate text-center text-xs font-extrabold">
              {sp.name}
            </span>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            s.setLibOpen(true);
            sfx("click");
          }}
          className="flex w-[78px] flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-ink bg-sun/50 p-1 font-display font-bold"
        >
          <Plus size={30} strokeWidth={3} aria-hidden="true" />
          <span className="text-xs">Ajouter</span>
        </motion.button>
      </div>
    </div>
  );
}
