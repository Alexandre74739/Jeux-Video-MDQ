"use client";
import { Blocks, Trash2 } from "lucide-react";
import { BumpNumber } from "@/_components/animations/BumpNumber";
import { StarIcon } from "@/_components/icons/Icon";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import type { LevelGameState } from "./useLevelGame";

/** Barre du programme : blocs utilisés (objectif 3 étoiles) et bouton Effacer. */
export function ProgramToolbar({ g }: { g: LevelGameState }) {
  const { level, used } = g;
  return (
    <>
      <span
        className="toon flex items-center gap-1 rounded-full bg-paper px-3 py-0.5 text-sm font-extrabold whitespace-nowrap"
        title={`Blocs utilisés. 3 étoiles avec ${level.optimal} blocs ou moins.`}
      >
        <Blocks size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
        <BumpNumber value={used} /> / {level.optimal} <StarIcon size={16} />
      </span>
      <button
        onClick={() => {
          if (g.program.length) {
            g.changeProgram([]);
            sfx("trash");
          }
        }}
        className="btn flex items-center gap-1 bg-paper px-3 py-0.5 text-sm whitespace-nowrap"
      >
        <Trash2 size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
        Effacer
      </button>
    </>
  );
}
