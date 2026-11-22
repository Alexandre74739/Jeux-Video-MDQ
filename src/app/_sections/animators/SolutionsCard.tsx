import { ArrowRight, Blocks, Volume2 } from "lucide-react";
import ButtonLink from "@/_components/ui/ButtonLink";
import { ICON_STROKE } from "@/lib/site";

/** Encart qui renvoie les animateurs vers la page des solutions. */
export default function SolutionsCard() {
  return (
    <div className="flex flex-col justify-center gap-4 rounded-3xl bg-cream p-6">
      <div className="flex items-center gap-3">
        <span className="toon grid size-12 place-items-center rounded-2xl bg-lilac">
          <Blocks size={24} strokeWidth={ICON_STROKE} aria-hidden="true" />
        </span>
        <h3 className="text-2xl font-bold">Toutes les solutions</h3>
      </div>
      <p className="font-semibold text-ink-soft">
        Un binôme bloqué ? Retrouvez la solution 3 étoiles de chaque niveau,
        avec l&apos;indice donné aux enfants.
      </p>
      <ButtonLink href="/solutions/" size="sm" variant="secondary">
        Voir les solutions{" "}
        <ArrowRight size={18} strokeWidth={3} aria-hidden="true" />
      </ButtonLink>
      <p className="flex items-center gap-2 text-sm font-bold text-ink-soft">
        <Volume2 size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
        Pensez à brancher des haut-parleurs ou des casques.
      </p>
    </div>
  );
}
