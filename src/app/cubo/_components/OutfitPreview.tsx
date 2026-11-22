"use client";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Cubo } from "@/_components/ui/Cubo";
import { StarIcon } from "@/_components/icons/Icon";
import { nextItem, type Outfit } from "@/lib/rewards";

const Preview3D = dynamic(() => import("@/_components/game/CuboPreview3D"), {
  ssr: false,
});

/** Cubo en 3D avec sa tenue, et la progression vers le prochain cadeau. */
export function OutfitPreview({
  outfit,
  stars,
}: {
  outfit: Outfit;
  stars: number;
}) {
  const gift = nextItem(stars);
  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="Aperçu">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[30px] border-[3px] border-ink shadow-pop sm:aspect-[4/3] lg:aspect-square"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)",
        }}
      >
        <div className="absolute inset-0">
          <Preview3D
            outfit={outfit}
            fallback={
              <div className="grid h-full place-items-center">
                <Cubo size={160} />
              </div>
            }
          />
        </div>
      </div>
      {gift ? (
        <div className="toon rounded-3xl bg-paper p-4">
          <p className="font-bold">
            Prochain cadeau : <strong>{gift.item.name}</strong>
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="h-4 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-cream"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={gift.item.stars}
              aria-valuenow={stars}
              aria-label="Étoiles pour le prochain cadeau"
            >
              <motion.div
                className="h-full bg-sun"
                initial={{ width: 0 }}
                animate={{ width: `${(stars / gift.item.stars) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="flex items-center gap-1 font-display font-bold whitespace-nowrap">
              <StarIcon size={18} /> {stars} / {gift.item.stars}
            </span>
          </div>
        </div>
      ) : (
        <p className="toon rounded-3xl bg-sun p-4 font-bold">
          Tu as tout débloqué. Bravo, super codeur !
        </p>
      )}
    </section>
  );
}
