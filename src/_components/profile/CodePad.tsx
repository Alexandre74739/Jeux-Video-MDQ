"use client";
import { motion } from "motion/react";
import { Delete } from "lucide-react";
import { CODE_LENGTH } from "@/lib/cloud";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

/** Code secret : 4 chiffres tapés sur un pavé numérique géant. */
export function CodePad({
  value,
  onChange,
}: {
  value: string[];
  onChange: (c: string[]) => void;
}) {
  const add = (d: string) => {
    if (value.length < CODE_LENGTH) {
      onChange([...value, d]);
      sfx("pop");
    }
  };
  return (
    <div>
      <div
        className="flex items-center justify-center gap-2"
        aria-live="polite"
        aria-label={`Code : ${value.length} chiffre${value.length > 1 ? "s" : ""} sur ${CODE_LENGTH}`}
      >
        {Array.from({ length: CODE_LENGTH }, (_, i) => (
          <span
            key={i}
            className={`grid size-14 place-items-center rounded-2xl border-[3px] font-display text-3xl font-bold ${value[i] ? "border-ink bg-paper" : "border-dashed border-ink/30 bg-cream"}`}
          >
            {value[i] && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {value[i]}
              </motion.span>
            )}
          </span>
        ))}
      </div>
      <div className="mx-auto mt-3 grid max-w-[240px] grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <motion.button
            key={d}
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => add(d)}
            className="btn aspect-[4/3] bg-paper font-display text-2xl"
          >
            {d}
          </motion.button>
        ))}
        <span />
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={() => add("0")}
          className="btn aspect-[4/3] bg-paper font-display text-2xl"
        >
          0
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            onChange(value.slice(0, -1));
            sfx("click");
          }}
          disabled={!value.length}
          className="btn grid aspect-[4/3] place-items-center bg-cream disabled:opacity-40"
          aria-label="Effacer le dernier chiffre"
        >
          <Delete size={22} strokeWidth={ICON_STROKE} aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
}
