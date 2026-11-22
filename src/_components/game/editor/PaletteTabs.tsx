"use client";
import { CATEGORIES, type Category } from "@/lib/blocks";
import { sfx } from "@/lib/sound";
import { Icon } from "@/_components/icons/Icon";
import type { Group } from "./types";

/** Familles de blocs (mouvement, événements…) sur le côté de la palette. */
export function PaletteTabs({
  groups,
  tab,
  onTab,
}: {
  groups: Group[];
  tab: Category;
  onTab: (c: Category) => void;
}) {
  return (
    <nav
      className="scroll-soft flex min-h-0 w-21.5 shrink-0 flex-col gap-1.5 overflow-y-auto overscroll-contain border-r-[3px] border-ink bg-cream p-1.5"
      aria-label="Familles de blocs"
    >
      {groups.map((g) => {
        const c = CATEGORIES[g.category];
        const on = g.category === tab;
        return (
          <button
            key={g.category}
            onClick={() => {
              onTab(g.category);
              sfx("click");
            }}
            aria-pressed={on}
            className={`flex w-full shrink-0 flex-col items-center rounded-xl border-[3px] px-0.5 py-1 text-center text-[11px] font-extrabold leading-tight wrap-break-word transition ${on ? "border-ink shadow-pop" : "border-transparent hover:border-ink/40"}`}
            style={{ background: on ? c.color : "transparent" }}
          >
            <Icon name={c.icon} size={22} />
            {c.label}
          </button>
        );
      })}
    </nav>
  );
}
