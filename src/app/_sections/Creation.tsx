import { Palette } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import ButtonLink from "@/_components/ui/ButtonLink";
import { ICON_STROKE } from "@/lib/site";
import CreationFeatures from "./creation/CreationFeatures";
import CreationPreview from "./creation/CreationPreview";

export default function Creation() {
  return (
    <section
      id="creer"
      className="scroll-mt-24 border-y-[3px] border-ink bg-pink/40 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-4xl font-bold sm:text-5xl">
            Invente ton propre jeu
          </h2>
          <p className="mt-3 text-lg font-semibold text-ink-soft">
            Fais bouger tes personnages avec les flèches du clavier, attrape des
            étoiles, compte les points… Tu décides des règles.
          </p>
          <CreationFeatures />
          <div className="mt-8">
            <ButtonLink href="/creer/">
              <Palette size={24} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
              Créer mon jeu
            </ButtonLink>
          </div>
        </Reveal>
        <CreationPreview />
      </div>
    </section>
  );
}
