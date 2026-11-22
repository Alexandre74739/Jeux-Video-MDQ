import Link from "next/link";
import Reveal from "@/_components/animations/Reveal";
import { DIFFICULTY, PUBLIC_COURSES } from "@/lib/levels";

/** Barres de difficulté (1 à 4), comme sur la carte des défis. */
function Difficulty({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-extrabold">
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-2.5 rounded-sm border-2 border-ink ${i <= level ? "bg-ink" : "bg-paper"}`}
            style={{ height: 6 + i * 3 }}
          />
        ))}
      </span>
      {DIFFICULTY[level]}
    </span>
  );
}

/**
 * Le chemin des parcours (dans « Ce que l'enfant apprend »). Tout vient des données du jeu (PUBLIC_COURSES) : un nouveau parcours
 * ou de nouveaux niveaux apparaissent ici sans rien changer, et aucun nombre n'est écrit en dur.
 */
export default function CoursePath() {
  const [first, ...others] = PUBLIC_COURSES;
  return (
    <div className="mt-10">
      <Reveal className="mx-auto max-w-4xl">
        <Link
          href={`/jouer/${first.slug}/`}
          className="toon flex flex-col gap-3 rounded-3xl p-4 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center"
          style={{ background: first.color }}
        >
          <span className="sm:w-60">
            <span className="block font-display text-xl font-bold">
              {first.title}
            </span>
            <Difficulty level={first.difficulty} />
          </span>
          <ol
            className="flex flex-1 flex-wrap items-center gap-1.5"
            aria-label={`Les ${first.levels.length} niveaux du parcours ${first.title}`}
          >
            {first.levels.map((l) => (
              <li
                key={l.id}
                title={l.title}
                className="grid size-9 place-items-center rounded-full border-[3px] border-ink bg-paper font-display font-bold"
              >
                {l.id}
              </li>
            ))}
          </ol>
        </Link>
      </Reveal>

      {others.length > 0 && (
        <nav
          aria-label="Les autres parcours"
          className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2"
        >
          <span className="font-bold text-ink-soft">Puis :</span>
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/jouer/${c.slug}/`}
              title={c.subtitle}
              className="rounded-full border-2 border-ink px-3 py-1 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
              style={{ background: c.color }}
            >
              {c.title}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
