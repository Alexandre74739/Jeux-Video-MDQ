"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { Icon, StarIcon } from "@/_components/icons/Icon";
import { ArrowRight, BookOpen, Gift, Lightbulb, Trophy, RotateCcw } from "lucide-react";
import { BADGES, type Item } from "@/lib/rewards";
import { badgeLine, giftLine, winLine } from "@/lib/lines";
import { sfx, speak } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

export type WinInfo = { stars: number; used: number; best: boolean; badges: string[]; gifts: Item[]; outro: boolean };

/** Carte de victoire : étoiles, record, badges et cadeaux gagnés, puis niveau suivant. */
export function WinCard({ info, levelId, optimal, last, onReplay, onNext, onStory }: {
  info: WinInfo; levelId: number; optimal: number; last: boolean; onReplay: () => void; onNext: () => void; onStory: () => void;
}) {
  useEffect(() => {
    const ts = [0, 1, 2].filter((i) => i < info.stars).map((i) => setTimeout(() => sfx("star", i), 350 + i * 300));
    if (info.badges.length || info.gifts.length) ts.push(setTimeout(() => sfx("badge"), 1400));
    speak([winLine(info.stars), ...info.badges.map((k) => badgeLine(BADGES[k].name)), ...info.gifts.map((g) => giftLine(g.name))]);
    return () => ts.forEach(clearTimeout);
  }, [info]);

  return (
    <motion.div
      initial={{ scale: 0.4, rotate: -6, y: 60 }} animate={{ scale: 1, rotate: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      className="relative h-fit w-[440px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-center shadow-pop-xl sm:rounded-[36px] sm:p-7"
    >
      <motion.div className="absolute -top-16 left-1/2 -translate-x-1/2" animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        <Cubo size={100} mood="wow" />
      </motion.div>
      <h2 id="win-title" className="mt-8 text-3xl font-bold sm:text-4xl">Niveau {levelId} réussi !</h2>
      <div className="my-4 flex justify-center gap-3" aria-label={`${info.stars} étoiles sur 3`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: i < info.stars ? 1 : 0.8, rotate: 0 }}
            transition={{ delay: 0.35 + i * 0.3, type: "spring", stiffness: 400, damping: 10 }}
            aria-hidden="true"
          >
            <StarIcon size={68} filled={i < info.stars} className="size-14 sm:size-[68px]" />
          </motion.span>
        ))}
      </div>
      <p className="text-lg font-bold">
        Tu as utilisé <strong className="text-grape">{info.used}</strong> bloc{info.used > 1 ? "s" : ""}.
      </p>
      {info.stars < 3 && (
        <p className="mt-1 flex items-center gap-2 rounded-2xl bg-sun/40 px-3 py-2 text-left font-bold">
          <Lightbulb size={28} strokeWidth={2.5} className="shrink-0" aria-hidden="true" /> Défi : peux-tu réussir avec seulement {optimal} blocs ? Essaie la boucle « répéter » !
        </p>
      )}
      {info.badges.map((k) => (
        <motion.div
          key={k}
          initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 1.4, type: "spring" }}
          className="toon mt-3 flex items-center gap-3 rounded-2xl bg-lilac px-4 py-2 text-left"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-sun" aria-hidden="true"><Icon name={BADGES[k].icon} size={28} /></span>
          <span>
            <span className="block font-display text-lg font-bold">Nouveau badge : {BADGES[k].name}</span>
            <span className="font-bold">{BADGES[k].text}</span>
          </span>
        </motion.div>
      ))}
      {info.gifts.map((g) => (
        <motion.div
          key={g.id}
          initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 1.6, type: "spring" }}
          className="toon mt-3 flex items-center gap-3 rounded-2xl bg-sky/60 px-4 py-2 text-left"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-paper" aria-hidden="true"><Gift size={28} strokeWidth={ICON_STROKE} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold">Cadeau pour Cubo : {g.name} !</span>
            <Link href="/cubo/" className="font-extrabold text-grape underline">Essayer dans « Mon Cubo »</Link>
          </span>
        </motion.div>
      ))}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <button onClick={onReplay} className="btn flex items-center justify-center gap-1.5 bg-paper py-3 text-lg sm:flex-1"><RotateCcw size={18} strokeWidth={3} aria-hidden="true" /> Rejouer</button>
        {last && info.outro ? (
          <motion.button
            autoFocus
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
            onClick={onStory} className="btn flex items-center justify-center gap-2 bg-sun py-3 text-lg sm:flex-[2]"
          >
            <BookOpen size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /> La suite de l'histoire
          </motion.button>
        ) : last ? (
          <Link href="/jouer/" className="btn flex items-center justify-center gap-2 bg-pink py-3 text-lg sm:flex-[2]"><Trophy size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /> Autres défis</Link>
        ) : (
          <motion.button
            autoFocus
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
            onClick={onNext} className="btn flex items-center justify-center gap-2 bg-mint py-3 text-lg sm:flex-[2]"
          >
            Niveau suivant <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
