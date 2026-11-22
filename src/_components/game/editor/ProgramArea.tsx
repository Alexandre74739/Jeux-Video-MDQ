"use client";
import { motion } from "motion/react";
import type { ReactNode, RefObject } from "react";
import { ArrowLeft, Play } from "lucide-react";
import type { Block } from "@/lib/blocks";
import { EditableBlock, type EditableProps } from "./EditableBlock";

/** Zone du programme : titre, barre d'outils et liste des blocs posés. */
export function ProgramArea({
  program,
  mode,
  title,
  toolbar,
  scrollRef,
  ...block
}: EditableProps & {
  program: Block[];
  mode: "stack" | "hats";
  title: ReactNode;
  toolbar?: ReactNode;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const stack = mode === "stack";
  return (
    <section
      aria-label="Mon programme"
      className={`flex min-h-[340px] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-paper shadow-pop md:min-h-0 ${block.disabled ? "pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-2 border-b-[3px] border-ink bg-sun px-4 py-1.5">
        <h2 className="text-lg font-bold whitespace-nowrap">{title}</h2>
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>
      <div
        ref={scrollRef}
        className="dots scroll-soft relative flex min-h-0 flex-1 flex-col overflow-auto p-4"
      >
        {stack && (
          <div className="w-fit rounded-t-[26px] rounded-b-2xl border-[3px] border-ink bg-sun px-4 pt-3 pb-2 font-display text-[17px] font-semibold shadow-pop">
            <span className="flex items-center gap-1.5">
              <span
                className="grid size-7 place-items-center rounded-lg bg-paper/70"
                aria-hidden="true"
              >
                <Play size={16} strokeWidth={3} fill="#16123A" />
              </span>
              quand je lance le programme
            </span>
          </div>
        )}
        <div
          data-list="root"
          className={`relative flex flex-1 flex-col gap-1.5 ${stack ? "ml-5 mt-1.5 border-l-4 border-dashed border-ink/25 pl-3 pb-24" : "gap-4 pb-24"}`}
        >
          {program.map((b) => (
            <EditableBlock key={b.id} {...block} block={b} />
          ))}
          {program.length === 0 && !block.dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none mt-3 flex items-center gap-3 font-display text-xl font-semibold text-ink-soft"
            >
              <motion.span
                animate={{ x: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-full border-[3px] border-ink bg-sun"
              >
                <ArrowLeft size={24} strokeWidth={3} />
              </motion.span>
              {stack
                ? "Glisse un bloc ici, ou clique dessus !"
                : "Commence par un bloc jaune « quand… »"}
            </motion.div>
          )}
        </div>
        {block.disabled && <div className="absolute inset-0 bg-paper/20" />}
      </div>
    </section>
  );
}
