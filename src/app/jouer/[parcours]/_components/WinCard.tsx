"use client";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { Lightbulb } from "lucide-react";
import { BADGES, type Item } from "@/lib/rewards";
import { badgeLine, giftLine, winLine } from "@/lib/lines";
import { sfx, speak } from "@/lib/sound";
import { WinActions } from "./WinActions";
import { WinRewards } from "./WinRewards";
import { WinStars } from "./WinStars";

export type WinInfo = {
  stars: number;
  used: number;
  best: boolean;
  badges: string[];
  gifts: Item[];
  outro: boolean;
};

/** Carte de victoire : étoiles, record, badges et cadeaux gagnés, puis niveau suivant. */
export function WinCard({
  info,
  levelId,
  optimal,
  last,
  onReplay,
  onNext,
  onStory,
}: {
  info: WinInfo;
  levelId: number;
  optimal: number;
  last: boolean;
  onReplay: () => void;
  onNext: () => void;
  onStory: () => void;
}) {
  useEffect(() => {
    const ts = [0, 1, 2]
      .filter((i) => i < info.stars)
      .map((i) => setTimeout(() => sfx("star", i), 350 + i * 300));
    if (info.badges.length || info.gifts.length)
      ts.push(setTimeout(() => sfx("badge"), 1400));
    speak([
      winLine(info.stars),
      ...info.badges.map((k) => badgeLine(BADGES[k].name)),
      ...info.gifts.map((g) => giftLine(g.name)),
    ]);
    return () => ts.forEach(clearTimeout);
  }, [info]);

  return (
    <motion.div
      initial={{ scale: 0.4, rotate: -6, y: 60 }}
      animate={{ scale: 1, rotate: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      className="relative h-fit w-110 max-w-full rounded-4xl border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:rounded-[36px] sm:p-7"
    >
      <motion.div
        className="absolute -top-16 left-1/2 -translate-x-1/2"
        animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <Cubo size={100} mood="wow" />
      </motion.div>
      <h2 id="win-title" className="mt-8 text-3xl font-bold sm:text-4xl">
        Niveau {levelId} réussi !
      </h2>
      <WinStars stars={info.stars} />
      <p className="text-lg font-bold">
        Tu as utilisé <strong className="text-grape">{info.used}</strong> bloc
        {info.used > 1 ? "s" : ""}.
      </p>
      {info.stars < 3 && (
        <p className="mt-1 flex items-center gap-2 rounded-2xl bg-sun/40 px-3 py-2 text-left font-bold">
          <Lightbulb
            size={28}
            strokeWidth={2.5}
            className="shrink-0"
            aria-hidden="true"
          />{" "}
          Défi : peux-tu réussir avec seulement {optimal} blocs ? Essaie la
          boucle « répéter » !
        </p>
      )}
      <WinRewards badges={info.badges} gifts={info.gifts} />
      <WinActions
        last={last}
        outro={info.outro}
        onReplay={onReplay}
        onNext={onNext}
        onStory={onStory}
      />
    </motion.div>
  );
}
