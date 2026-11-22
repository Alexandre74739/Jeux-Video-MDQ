import { ArrowRight, Blocks, Check, Volume2 } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import ButtonLink from "@/_components/ui/ButtonLink";
import { ICON_STROKE } from "@/lib/site";
import SectionTitle from "./SectionTitle";

const TIMELINE = [
  {
    t: "0 – 10 min",
    title: "Découverte",
    text: "On présente Cubo et on fait la démo de l'accueil ensemble.",
    bg: "bg-sun",
  },
  {
    t: "10 – 50 min",
    title: "Les défis",
    text: "Le tutoriel, puis les défis de plus en plus durs, chacun à son rythme.",
    bg: "bg-sky",
  },
  {
    t: "50 – 80 min",
    title: "Création libre",
    text: "Chaque binôme invente son jeu avec ses personnages préférés.",
    bg: "bg-pink",
  },
  {
    t: "80 – 90 min",
    title: "On partage",
    text: "Chacun montre son jeu aux autres et télécharge sa création.",
    bg: "bg-mint",
  },
];

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
      <ol className="relative mt-12 grid gap-6 md:grid-cols-4">
        <span
          className="absolute top-8 right-[12%] left-[12%] hidden h-1.5 bg-ink md:block"
          aria-hidden="true"
        />
        {TIMELINE.map((s, i) => (
          <li
            key={s.title}
            className="relative flex flex-col items-center text-center"
          >
            <span
              className={`toon relative z-10 grid size-16 place-items-center rounded-full font-display text-2xl font-bold ${s.bg}`}
            >
              {i + 1}
            </span>
            <span className="mt-3 rounded-full bg-ink px-3 py-0.5 text-sm font-bold text-white">
              {s.t}
            </span>
            <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
            <p className="mt-1 font-semibold text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>

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
      </Reveal>
    </section>
  );
}
