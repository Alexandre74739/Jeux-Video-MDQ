"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { TreasureMap } from "@/_components/game/StoryModal";
import { StarIcon } from "@/_components/icons/Icon";
import { nextItem } from "@/lib/rewards";
import { ISLAND_STARS, MAP_COURSES, STORY } from "@/lib/story";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

/** Carte au trésor, étoiles du phare, prochain cadeau et histoires à relire. */
export function TreasureSection({
  got,
  total,
  seen,
  onReplay,
}: {
  got: boolean[];
  total: number;
  seen: string[];
  onReplay: (slug: string) => void;
}) {
  const gift = nextItem(total);
  const lit = Math.min(total, ISLAND_STARS);
  return (
    <section className="toon mt-8 grid items-center gap-6 rounded-[30px] bg-paper p-5 sm:p-6 md:grid-cols-[auto_1fr]">
      <div className="flex justify-center">
        <TreasureMap got={got} size={190} />
      </div>
      <div>
        <h2 className="text-2xl font-bold sm:text-3xl">La carte au trésor</h2>
        <p className="mt-1 font-bold text-ink-soft">
          {got.every(Boolean)
            ? "La carte est complète ! Elle mène à l'île secrète."
            : `Chaque défi terminé te donne un morceau de la carte. Tu en as ${got.filter(Boolean).length} sur 4 : il faut les 4 pour trouver l'île secrète.`}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm font-extrabold">
          <span>Le phare de l'île</span>
          <span className="flex items-center gap-1">
            <StarIcon size={16} /> {lit} / {ISLAND_STARS}
          </span>
        </div>
        <div
          className="mt-1.5 h-4 overflow-hidden rounded-full border-[3px] border-ink bg-cream"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={ISLAND_STARS}
          aria-valuenow={lit}
          aria-label="Étoiles pour allumer le phare"
        >
          <motion.div
            className="h-full bg-sun"
            initial={{ width: 0 }}
            animate={{ width: `${(lit / ISLAND_STARS) * 100}%` }}
            transition={{ duration: 0.9 }}
          />
        </div>
        {gift && (
          <p className="mt-3 text-sm font-bold">
            Prochain cadeau pour Cubo à{" "}
            <strong>{gift.item.stars} étoiles</strong> : {gift.item.name}.{" "}
            <Link href="/cubo/" className="font-extrabold text-grape underline">
              Voir Mon Cubo
            </Link>
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {[...MAP_COURSES, "ile-secrete"]
            .filter((c) => seen.includes(`${c}:outro`))
            .map((c) => (
              <button
                key={c}
                onClick={() => {
                  sfx("click");
                  onReplay(c);
                }}
                className="btn flex items-center gap-1.5 bg-cream px-3 py-1 text-sm"
              >
                <BookOpen
                  size={15}
                  strokeWidth={ICON_STROKE}
                  aria-hidden="true"
                />{" "}
                {STORY[c].outro.title}
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
