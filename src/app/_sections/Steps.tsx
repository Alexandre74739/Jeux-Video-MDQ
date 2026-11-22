import {
  Gamepad2,
  Map as MapIcon,
  Puzzle,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import { ICON_STROKE } from "@/lib/site";
import SectionTitle from "./SectionTitle";

const STEPS: { icon: LucideIcon; title: string; text: string; bg: string }[] = [
  {
    icon: MapIcon,
    title: "Apprends",
    text: "Un tutoriel, puis des défis de plus en plus durs dans un monde en cubes.",
    bg: "bg-sky",
  },
  {
    icon: Puzzle,
    title: "Assemble",
    text: "Glisse et emboîte des blocs, comme des briques de construction.",
    bg: "bg-mint",
  },
  {
    icon: Gamepad2,
    title: "Crée",
    text: "Choisis tes personnages et invente ton propre jeu vidéo.",
    bg: "bg-pink",
  },
];

/** Les 3 étapes de l'atelier. */
export default function Steps() {
  return (
    <section className="border-y-[3px] border-ink bg-grape px-4 py-20 sm:px-6">
      <SectionTitle
        title="Comment ça marche ?"
        intro="De la découverte à la création : trois étapes pour passer de joueur à créateur de jeu, chacun à son rythme."
        light
      />
      <ol className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Reveal
              delay={i * 0.1}
              className={`relative h-full rounded-[28px] border-[3px] border-ink p-6 shadow-pop-xl ${s.bg}`}
            >
              <span
                className="toon absolute -top-5 -left-3 grid size-12 place-items-center rounded-full bg-paper font-display text-2xl font-bold"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="toon grid size-16 place-items-center rounded-2xl bg-paper">
                <s.icon
                  size={34}
                  strokeWidth={ICON_STROKE}
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-4 text-3xl font-bold">{s.title}</h3>
              <p className="mt-1 text-lg font-bold">{s.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
