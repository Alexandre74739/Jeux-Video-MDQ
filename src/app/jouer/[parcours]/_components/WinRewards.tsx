"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Gift } from "lucide-react";
import { Icon } from "@/_components/icons/Icon";
import { BADGES, type Item } from "@/lib/rewards";
import { ICON_STROKE } from "@/lib/site";

/** Badges et cadeaux gagnés en finissant le niveau. */
export function WinRewards({
  badges,
  gifts,
}: {
  badges: string[];
  gifts: Item[];
}) {
  return (
    <>
      {badges.map((k) => (
        <motion.div
          key={k}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 1.4, type: "spring" }}
          className="toon mt-3 flex items-center gap-3 rounded-2xl bg-lilac px-4 py-2 text-left"
        >
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-sun"
            aria-hidden="true"
          >
            <Icon name={BADGES[k].icon} size={28} />
          </span>
          <span>
            <span className="block font-display text-lg font-bold">
              Nouveau badge : {BADGES[k].name}
            </span>
            <span className="font-bold">{BADGES[k].text}</span>
          </span>
        </motion.div>
      ))}
      {gifts.map((g) => (
        <motion.div
          key={g.id}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 1.6, type: "spring" }}
          className="toon mt-3 flex items-center gap-3 rounded-2xl bg-sky/60 px-4 py-2 text-left"
        >
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-paper"
            aria-hidden="true"
          >
            <Gift size={28} strokeWidth={ICON_STROKE} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold">
              Cadeau pour Cubo : {g.name} !
            </span>
            <Link href="/cubo/" className="font-extrabold text-grape underline">
              Essayer dans « Mon Cubo »
            </Link>
          </span>
        </motion.div>
      ))}
    </>
  );
}
