import type { Metadata } from "next";
import Link from "next/link";
import { House, Map as MapIcon, Palette } from "lucide-react";
import { Cubo, Logo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page introuvable · CuboCode",
  robots: { index: false },
};

const sw = 2.75;

/** Page 404 : générée en out/404.html (servie par Vercel pour toute adresse inconnue). */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="border-b-[3px] border-ink bg-paper px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-6xl"><Logo small /></div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
        <div className="relative mx-auto aspect-square w-full max-w-[280px]">
          <div className="absolute inset-[6%] rounded-full border-[3px] border-ink bg-lilac" style={{ boxShadow: "8px 10px 0 0 #16123A" }} />
          <div className="absolute inset-0 grid place-items-center">
            <Cubo size={170} mood="think" className="h-auto w-[58%] motion-safe:animate-bounce motion-safe:[animation-duration:2.4s]" />
          </div>
          <span aria-hidden="true" className="toon absolute top-[4%] right-0 rounded-2xl bg-sun px-3 py-1 font-display text-2xl font-bold rotate-6">?</span>
        </div>

        <span className="toon mt-8 inline-block rounded-full bg-paper px-4 py-1 font-display text-sm font-bold uppercase tracking-wider">Erreur 404</span>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Oups, Cubo s&apos;est perdu !</h1>
        <p className="mt-4 max-w-xl text-lg font-semibold text-ink-soft">
          Cette page n&apos;existe pas (ou plus). Pas de panique : choisis un chemin pour reprendre l&apos;aventure.
        </p>

        <nav className="mt-8 flex flex-wrap justify-center gap-4" aria-label="Où aller ?">
          <Link href="/" className="btn inline-flex items-center gap-2.5 bg-sun px-6 py-3 text-xl shadow-pop-lg">
            <House size={24} strokeWidth={sw} aria-hidden="true" /> Accueil
          </Link>
          <Link href="/jouer/" className="btn inline-flex items-center gap-2.5 bg-sky px-6 py-3 text-xl shadow-pop-lg">
            <MapIcon size={24} strokeWidth={sw} aria-hidden="true" /> Les défis
          </Link>
          <Link href="/creer/" className="btn inline-flex items-center gap-2.5 bg-paper px-6 py-3 text-xl shadow-pop-lg">
            <Palette size={24} strokeWidth={sw} aria-hidden="true" /> Création libre
          </Link>
        </nav>
      </main>
    </div>
  );
}
