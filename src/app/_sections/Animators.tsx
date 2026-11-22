import { Check } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import SectionTitle from "./SectionTitle";
import SessionTimeline from "./animators/SessionTimeline";
import SolutionsCard from "./animators/SolutionsCard";

const PROMISES = [
  "Aucune installation : un navigateur suffit, même sur des PC prêtés.",
  "Une fois la page ouverte, tout fonctionne même si le Wi-Fi coupe.",
  "La progression est gardée automatiquement sur chaque poste.",
  "Consignes lues à voix haute pour les plus jeunes lecteurs.",
  "Textes très contrastés et grands boutons, faciles à la souris.",
];

export default function Animators() {
  return (
    <section
      id="animateurs"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6"
    >
      <SectionTitle
        title="Une séance de 1h30 clé en main"
        intro="Pour les animateurs, enseignants et parents qui encadrent un atelier."
      />
      <SessionTimeline />
      <Reveal className="toon mt-14 grid gap-6 rounded-4xl bg-paper p-8 md:grid-cols-2">
        <ul className="space-y-3">
          {PROMISES.map((t) => (
            <li key={t} className="flex gap-3 font-bold">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-mint">
                <Check size={16} strokeWidth={3.5} aria-hidden="true" />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <SolutionsCard />
      </Reveal>
    </section>
  );
}
