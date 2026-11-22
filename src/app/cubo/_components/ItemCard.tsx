"use client";
import { motion } from "motion/react";
import { Check, Lock } from "lucide-react";
import { StarIcon } from "@/_components/icons/Icon";
import { BADGES, type Item, type Outfit, type Slot } from "@/lib/rewards";
import { ItemArt } from "./ItemArt";

/** Nom du badge qui débloque l'objet (« secret » tant qu'il n'est pas gagné). */
const badgeName = (item: Item) =>
  BADGES[item.badge!]?.secret ? "secret" : BADGES[item.badge!]?.name;

/** Objet de la garde-robe : choisi, disponible ou verrouillé (étoiles ou badge à gagner). */
export function ItemCard({
  slot,
  item,
  outfit,
  open,
  onChoose,
}: {
  slot: Slot;
  item: Item;
  outfit: Outfit;
  open: boolean;
  onChoose: () => void;
}) {
  const on = outfit[slot] === item.id;
  const lock = item.badge
    ? `badge ${badgeName(item)}`
    : `${item.stars} étoiles`;
  return (
    <motion.button
      whileHover={open ? { y: -4 } : undefined}
      whileTap={open ? { scale: 0.94 } : undefined}
      onClick={onChoose}
      aria-pressed={on}
      aria-label={`${item.name}${open ? "" : `, verrouillé : ${lock}`}`}
      className={`relative flex w-full flex-col items-center gap-1 rounded-3xl border-[3px] p-3 text-center ${
        on
          ? "border-ink bg-mint shadow-pop"
          : open
            ? "border-ink bg-paper shadow-pop"
            : "border-ink/25 bg-[#EEEAF5]"
      }`}
    >
      <span className={open ? "" : "opacity-35 grayscale"}>
        <ItemArt slot={slot} item={item} outfit={outfit} />
      </span>
      <span
        className={`font-display text-base leading-tight font-bold ${open ? "" : "text-ink-soft"}`}
      >
        {item.name}
      </span>
      {!open && (
        <span className="flex items-center gap-1 rounded-full border-2 border-ink/30 bg-paper px-2 text-sm font-extrabold">
          <Lock size={13} strokeWidth={3} aria-hidden="true" />
          {item.badge ? (
            <span className="text-xs">
              Badge{" "}
              {BADGES[item.badge]?.secret ? "secret" : `« ${badgeName(item)} »`}
            </span>
          ) : (
            <>
              <StarIcon size={14} /> {item.stars}
            </>
          )}
        </span>
      )}
      {on && (
        <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full border-2 border-ink bg-paper">
          <Check size={16} strokeWidth={3.5} aria-hidden="true" />
        </span>
      )}
    </motion.button>
  );
}
