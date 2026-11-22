import { BlockView } from "@/_components/game/BlockView";
import { StarIcon } from "@/_components/icons/Icon";
import { BLOCKS } from "@/lib/blocks";
import type { LevelDef } from "@/lib/levels";

/** Solution 3 étoiles d'un niveau, avec ses blocs et l'indice donné aux enfants. */
export default function SolutionCard({ level: l }: { level: LevelDef }) {
  return (
    <article className="toon rounded-3xl bg-paper p-5">
      <div className="flex items-baseline gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-grape font-display text-lg font-bold text-white">
          {l.id}
        </span>
        <h3 className="text-2xl font-bold">{l.title}</h3>
        <span className="ml-auto rounded-full bg-lilac px-2 py-0.5 text-sm font-bold">
          {l.concept}
        </span>
      </div>
      <p className="mt-2 font-semibold">{l.goal}</p>
      <p className="mt-1 text-sm font-bold text-ink-soft">
        Blocs disponibles :{" "}
        {l.blocks
          .map((b) => BLOCKS[b].label.replace(/\{\w+\}/g, "…"))
          .join(", ")}
      </p>
      <div className="mt-3 flex flex-col gap-1.5 overflow-x-auto rounded-2xl bg-cream p-3">
        {l.solution.map((b) => (
          <BlockView key={b.id} block={b} mode="static" />
        ))}
      </div>
      <p className="mt-2 text-sm font-extrabold">
        <span className="inline-flex align-middle">
          <StarIcon size={16} />
          <StarIcon size={16} />
          <StarIcon size={16} />
        </span>{" "}
        en {l.optimal} blocs · Indice : {l.tip}
      </p>
    </article>
  );
}
