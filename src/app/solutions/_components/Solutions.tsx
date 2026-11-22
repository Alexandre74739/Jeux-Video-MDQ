"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BlockView } from "@/_components/game/BlockView";
import PageHeader from "@/_components/layout/PageHeader";
import SiteFooter from "@/_components/layout/SiteFooter";
import AdultGate from "./AdultGate";
import { StarIcon } from "@/_components/icons/Icon";
import { LayoutGrid } from "lucide-react";
import { COURSES, DIFFICULTY, TOTAL_LEVELS } from "@/lib/levels";
import { BLOCKS } from "@/lib/blocks";
import { ICON_STROKE } from "@/lib/site";

/** Parcours choisi, gardé dans l'adresse (#slug) pour pouvoir partager le lien. */
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash.slice(1);

export default function Solutions() {
  // Un seul parcours affiché à la fois (page plus légère).
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const slug = COURSES.some((c) => c.slug === hash) ? hash : COURSES[0].slug;
  const pick = (s: string) => {
    history.replaceState(null, "", `#${s}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <PageHeader
        action={
          <Link
            href="/jouer/"
            className="btn flex items-center gap-2 bg-sun px-4 py-2"
          >
            <LayoutGrid
              size={19}
              strokeWidth={ICON_STROKE}
              aria-hidden="true"
            />{" "}
            Défis
          </Link>
        }
      />
      <AdultGate>
        <main
          id="contenu"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
        >
          <h1 className="text-4xl font-bold">Espace animateur : solutions</h1>
          <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-soft">
            Les solutions optimales (3 étoiles) des {TOTAL_LEVELS} niveaux.
            Toute autre solution qui atteint le coffre est acceptée et rapporte
            1 ou 2 étoiles.
          </p>
          <nav className="mt-6 flex flex-wrap gap-3" aria-label="Parcours">
            {COURSES.map((c) => (
              <button
                key={c.slug}
                onClick={() => pick(c.slug)}
                aria-pressed={slug === c.slug}
                className={`btn px-4 py-2 ${slug === c.slug ? "outline-4 outline-offset-2 outline-grape" : ""}`}
                style={{ background: c.color }}
              >
                {c.title}
              </button>
            ))}
          </nav>

          {COURSES.filter((c) => c.slug === slug).map((c) => (
            <section key={c.slug} id={c.slug} className="mt-12 scroll-mt-24">
              <h2 className="flex flex-wrap items-baseline gap-3 text-3xl font-bold">
                {c.title}
                <span
                  className="rounded-full border-2 border-ink px-3 py-0.5 text-base"
                  style={{ background: c.color }}
                >
                  {DIFFICULTY[c.difficulty]}
                </span>
              </h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {c.levels.map((l) => (
                  <article key={l.id} className="toon rounded-3xl bg-paper p-5">
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
                ))}
              </div>
            </section>
          ))}
        </main>
      </AdultGate>
      <SiteFooter />
    </div>
  );
}
