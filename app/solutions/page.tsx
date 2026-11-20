"use client";
import Link from "next/link";
import { BlockView } from "@/components/BlockView";
import { Logo } from "@/components/ui";
import BackButton from "@/components/BackButton";
import { StarIcon } from "@/components/Icon";
import { LayoutGrid } from "lucide-react";
import { COURSES, DIFFICULTY } from "@/lib/levels";
import { BLOCKS } from "@/lib/blocks";

export default function Solutions() {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b-[3px] border-ink bg-paper px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <BackButton fallback="/" />
          <Logo small />
        </div>
        <Link href="/jouer/" className="btn flex items-center gap-2 bg-sun px-4 py-2"><LayoutGrid size={19} strokeWidth={2.75} aria-hidden="true" /> Défis</Link>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold">Espace animateur : solutions</h1>
        <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-soft">
          Les solutions optimales (3 étoiles) des {COURSES.reduce((n, c) => n + c.levels.length, 0)} niveaux. Toute autre
          solution qui atteint le coffre est acceptée et rapporte 1 ou 2 étoiles.
        </p>
        <nav className="mt-6 flex flex-wrap gap-3" aria-label="Parcours">
          {COURSES.map((c) => (
            <a key={c.slug} href={`#${c.slug}`} className="btn px-4 py-2" style={{ background: c.color }}>{c.title}</a>
          ))}
        </nav>

        {COURSES.map((c) => (
          <section key={c.slug} id={c.slug} className="mt-12 scroll-mt-24">
            <h2 className="flex flex-wrap items-baseline gap-3 text-3xl font-bold">
              {c.title}
              <span className="rounded-full border-2 border-ink px-3 py-0.5 text-base" style={{ background: c.color }}>{DIFFICULTY[c.difficulty]}</span>
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {c.levels.map((l) => (
                <article key={l.id} className="toon rounded-3xl bg-paper p-5">
                  <div className="flex items-baseline gap-2">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-grape font-display text-lg font-bold text-white">{l.id}</span>
                    <h3 className="text-2xl font-bold">{l.title}</h3>
                    <span className="ml-auto rounded-full bg-lilac px-2 py-0.5 text-sm font-bold">{l.concept}</span>
                  </div>
                  <p className="mt-2 font-semibold">{l.goal}</p>
                  <p className="mt-1 text-sm font-bold text-ink-soft">
                    Blocs disponibles : {l.blocks.map((b) => BLOCKS[b].label.replace(/\{\w+\}/g, "…")).join(", ")}
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5 overflow-x-auto rounded-2xl bg-cream p-3">
                    {l.solution.map((b) => <BlockView key={b.id} block={b} mode="static" />)}
                  </div>
                  <p className="mt-2 text-sm font-extrabold">
                    <span className="inline-flex align-middle"><StarIcon size={16} /><StarIcon size={16} /><StarIcon size={16} /></span> en {l.optimal} blocs · Indice : {l.tip}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
