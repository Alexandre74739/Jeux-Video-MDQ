"use client";
import { useState } from "react";
import {
  SLOTS,
  isUnlocked,
  type Item,
  type Outfit,
  type Progress,
  type Slot,
} from "@/lib/rewards";
import { sfx } from "@/lib/sound";
import { ItemCard } from "./ItemCard";

/** Onglets des catégories (chapeaux, lunettes…) et objets de la catégorie choisie. */
export function WardrobeItems({
  outfit,
  progress,
  onChoose,
}: {
  outfit: Outfit;
  progress: Progress;
  onChoose: (slot: Slot, item: Item) => void;
}) {
  const [tab, setTab] = useState<Slot>("hat");
  return (
    <section className="min-w-0" aria-label="Garde-robe">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Catégories"
      >
        {(Object.keys(SLOTS) as Slot[]).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k);
              sfx("click");
            }}
            className={`btn min-w-[30%] flex-1 px-2 py-2 text-sm sm:min-w-0 sm:px-3 sm:text-lg ${tab === k ? "bg-grape text-white" : "bg-paper"}`}
          >
            {SLOTS[k].label}
          </button>
        ))}
      </div>
      <ul
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
        role="tabpanel"
      >
        {SLOTS[tab].items
          .filter((item) => !item.hidden || isUnlocked(item, progress))
          .map((item) => (
            <li key={item.id}>
              <ItemCard
                slot={tab}
                item={item}
                outfit={outfit}
                open={isUnlocked(item, progress)}
                onChoose={() => onChoose(tab, item)}
              />
            </li>
          ))}
      </ul>
    </section>
  );
}
