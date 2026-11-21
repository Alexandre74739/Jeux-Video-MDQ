"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Palette, Play } from "lucide-react";
import ButtonLink from "@/_components/ui/ButtonLink";
import { Cubo } from "@/_components/ui/Cubo";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

const appear = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 110, damping: 18, delay },
});

/** Haut de l'accueil : le texte à gauche, Cubo devant un vrai niveau du jeu à droite. */
export default function Hero() {
  return (
    <section className="flex min-h-[min(calc(100svh-4.75rem),60rem)] items-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <motion.h1 {...appear(0)} className="text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl xl:text-7xl">
            Programme Cubo, puis invente ton jeu vidéo.
          </motion.h1>
          <motion.p {...appear(0.1)} className="mt-6 max-w-lg text-xl leading-relaxed font-semibold text-ink-soft">
            On empile des blocs, on appuie sur Lancer, et Cubo exécute le programme dans son monde en cubes.
            Si ça rate, on corrige et on recommence.
          </motion.p>
          <motion.div {...appear(0.2)} className="mt-9 flex flex-wrap gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
              <Link
                href="/jouer/" onClick={() => sfx("click")}
                className="btn inline-flex items-center gap-3 bg-mint px-7 py-4 font-display text-2xl shadow-pop-lg"
              >
                <Play size={24} strokeWidth={ICON_STROKE} fill="currentColor" aria-hidden="true" /> Lancer l&apos;aventure
              </Link>
            </motion.div>
            <ButtonLink href="/creer/" size="lg" variant="secondary">
              <Palette size={26} strokeWidth={ICON_STROKE} aria-hidden="true" /> Création libre
            </ButtonLink>
          </motion.div>
        </div>

        {/* Mockup de tablette : l'appli telle qu'elle s'affiche sur une tablette en portrait */}
        <motion.div {...appear(0.15)} className="relative mx-auto w-full max-w-[25rem]">
          <div className="rounded-[2.5rem] border-[3px] border-ink bg-ink p-3 shadow-pop-xl">
            <div className="mx-auto mb-2 size-2 rounded-full bg-paper/40" aria-hidden="true" />
            <div className="overflow-hidden rounded-[1.6rem] bg-cream">
              <Image
                src="/screens/tablette-niveau.webp" width={1152} height={1536} priority
                sizes="(min-width: 1024px) 380px, 85vw"
                alt="CuboCode sur une tablette : la consigne du niveau « Le pont », le monde en 3D avec la rivière et le coffre, le bouton Lancer, les blocs et le programme."
                className="h-auto w-full"
              />
            </div>
          </div>
          <div className="absolute -bottom-6 -left-10 w-24 sm:-left-20 sm:w-32">
            <Cubo size={140} mood="happy" className="h-auto w-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
