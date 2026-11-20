"use client";
import Link from "next/link";
import { BlockView } from "@/components/BlockView";
import { Logo } from "@/components/ui";
import { StarIcon } from "@/components/Icon";
import { Map as MapIcon } from "lucide-react";
import { LEVELS } from "@/lib/levels";
import { BLOCKS } from "@/lib/blocks";

export default function Solutions() {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="flex items-center justify-between border-b-[3px] border-ink bg-paper px-6 py-3">
        <Logo small />
        <Link href="/jouer/" className="btn flex items-center gap-2 bg-sun px-4 py-2"><MapIcon size={19} strokeWidth={2.75} aria-hidden="true" /> Aventure</Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-4xl font-bold">Espace animateur : solutions</h1>
        <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-soft">
          Les solutions optimales (3 étoiles) des 10 niveaux. Toute autre solution qui atteint le coffre est acceptée
          et rapporte 1 ou 2 étoiles.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {LEVELS.map((l) => (
            <section key={l.id} className="toon rounded-3xl bg-paper p-5">
              <div className="flex items-baseline gap-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-grape font-display text-lg font-bold text-white">{l.id}</span>
                <h2 className="text-2xl font-bold">{l.title}</h2>
                <span className="ml-auto rounded-full bg-lilac px-2 py-0.5 text-sm font-bold">{l.concept}</span>
              </div>
              <p className="mt-2 font-semibold">{l.goal}</p>
              <p className="mt-1 text-sm font-bold text-ink-soft">
                Blocs disponibles : {l.blocks.map((b) => BLOCKS[b].label.replace(/\{\w+\}/g, "…")).join(", ")}
              </p>
              <div className="mt-3 flex flex-col gap-1.5 rounded-2xl bg-cream p-3">
                {l.solution.map((b) => <BlockView key={b.id} block={b} mode="static" />)}
              </div>
              <p className="mt-2 text-sm font-extrabold"><span className="inline-flex align-middle"><StarIcon size={16} /><StarIcon size={16} /><StarIcon size={16} /></span> en {l.optimal} blocs · Indice donné aux enfants : {l.tip}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
