"use client";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Play, RotateCcw, Trash2 } from "lucide-react";
import type { Block } from "@/lib/levels";
import { ICON_STROKE } from "@/lib/site";
import { MAX_BLOCKS, type DemoState } from "./useDemo";

/** Programme de la démo : blocs « avancer » ajoutés, et boutons Ajouter / Lancer / Effacer. */
export function DemoProgram({
  prog,
  activeId,
  state,
  onAdd,
  onRun,
  onClear,
}: {
  prog: Block[];
  activeId: string | null;
  state: DemoState;
  onAdd: () => void;
  onRun: () => void;
  onClear: () => void;
}) {
  const failed = state === "short" || state === "far";
  return (
    <div className="toon flex flex-col rounded-[28px] bg-paper">
      <div className="flex items-center justify-between rounded-t-[25px] border-b-[3px] border-ink bg-sun px-5 py-3">
        <h3 className="text-xl font-bold">Mon programme</h3>
        <button
          onClick={onClear}
          className="btn flex items-center gap-1.5 bg-paper px-3 py-1 text-sm"
        >
          <Trash2 size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Effacer
        </button>
      </div>
      <div className="dots flex min-h-57.5 flex-1 flex-col gap-1.5 p-5">
        <div className="flex w-fit items-center gap-2 rounded-t-[22px] rounded-b-2xl border-[3px] border-ink bg-sun px-4 pt-2.5 pb-1.5 font-display font-semibold shadow-pop">
          <Play size={16} strokeWidth={3} fill="#16123A" aria-hidden="true" />{" "}
          quand je lance
        </div>
        <div className="ml-5 flex flex-col gap-1.5 border-l-4 border-dashed border-ink/25 pl-3">
          <AnimatePresence>
            {prog.map((b) => (
              <motion.div
                key={b.id}
                initial={{ scale: 0.5, opacity: 0, x: -20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className={`flex w-fit items-center gap-2 rounded-2xl border-[3px] border-ink bg-sky px-3 py-1.5 font-display font-semibold shadow-pop ${activeId === b.id ? "running-glow" : ""}`}
              >
                <span className="grid size-6 place-items-center rounded-md bg-paper/70">
                  <ArrowUp size={15} strokeWidth={3} aria-hidden="true" />
                </span>
                avancer
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 border-t-[3px] border-ink p-4">
        <motion.button
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={onAdd}
          disabled={prog.length >= MAX_BLOCKS}
          className="btn flex items-center gap-2 bg-sky px-4 py-2.5 text-lg disabled:opacity-50"
        >
          <ArrowUp size={20} strokeWidth={3} aria-hidden="true" /> + avancer
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onRun}
          disabled={state === "run"}
          className="btn flex flex-1 items-center justify-center gap-2 bg-mint px-4 py-2.5 text-lg"
        >
          {failed ? (
            <RotateCcw size={20} strokeWidth={3} aria-hidden="true" />
          ) : (
            <Play size={20} strokeWidth={3} fill="#16123A" aria-hidden="true" />
          )}
          Lancer
        </motion.button>
      </div>
    </div>
  );
}
