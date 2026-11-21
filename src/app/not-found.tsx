import type { Metadata } from "next";
import { House, Map as MapIcon, Palette } from "lucide-react";
import { Cubo } from "@/_components/ui/Cubo";
import ButtonLink from "@/_components/ui/ButtonLink";
import PageHeader from "@/_components/layout/PageHeader";
import SiteFooter from "@/_components/layout/SiteFooter";
import { ICON_STROKE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

/** Page 404 : générée en out/404.html (servie par Vercel pour toute adresse inconnue). */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <PageHeader back={false} />

      <main id="contenu" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
        <div className="relative mx-auto aspect-square w-full max-w-70">
          <div className="absolute inset-[6%] rounded-full border-[3px] border-ink bg-lilac shadow-pop-xl" />
          <div className="absolute inset-0 grid place-items-center">
            <Cubo size={170} mood="think" className="h-auto w-[58%] motion-safe:animate-bounce motion-safe:[animation-duration:2.4s]" />
          </div>
          <span aria-hidden="true" className="toon absolute top-[4%] right-0 rotate-6 rounded-2xl bg-sun px-3 py-1 font-display text-2xl font-bold">?</span>
        </div>

        <p className="mt-8 font-display text-lg font-bold text-grape">Erreur 404</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Oups, Cubo s&apos;est perdu</h1>
        <p className="mt-4 max-w-xl text-lg font-semibold text-ink-soft">
          Cette page n&apos;existe pas (ou plus). Pas de panique : choisis un chemin pour reprendre l&apos;aventure.
        </p>

        <nav className="mt-8 flex flex-wrap justify-center gap-4" aria-label="Où aller ?">
          <ButtonLink href="/"><House size={24} strokeWidth={ICON_STROKE} aria-hidden="true" /> Accueil</ButtonLink>
          <ButtonLink href="/jouer/" variant="secondary"><MapIcon size={24} strokeWidth={ICON_STROKE} aria-hidden="true" /> Les défis</ButtonLink>
          <ButtonLink href="/creer/" variant="secondary"><Palette size={24} strokeWidth={ICON_STROKE} aria-hidden="true" /> Création libre</ButtonLink>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
