"use client";
import Link from "next/link";
import { Palette, Shirt } from "lucide-react";
import BackButton from "@/_components/ui/BackButton";
import { Logo } from "@/_components/ui/Logo";
import { SoundToggle } from "@/_components/ui/SoundToggle";
import ProfileMenu from "@/_components/profile/ProfileMenu";
import { ICON_STROKE } from "@/lib/site";
import { LevelNav } from "./LevelNav";
import { ScoreChips } from "./ScoreChips";
import type { LevelGameState } from "./useLevelGame";

/** Barre du haut d'un parcours : retour, niveaux, scores, joueur, Mon Cubo, Créer et son. */
export function LevelHeader({ g }: { g: LevelGameState }) {
  const stars = g.levels.reduce(
    (a, l) => a + (g.progress.stars[g.sk(l.id)] ?? 0),
    0,
  );
  return (
    <header className="sticky top-0 z-40 flex min-h-[72px] shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-[3px] border-ink bg-paper px-3 py-2 sm:px-4 lg:flex-nowrap">
      <BackButton fallback="/jouer/" label="Défis" />
      <Logo small />
      <LevelNav g={g} />
      <div className="ml-auto flex items-center gap-2">
        <ScoreChips stars={stars} streak={g.streak} progress={g.progress} />
        <ProfileMenu />
        <Link
          href="/cubo/"
          aria-label="Mon Cubo"
          className="btn flex items-center gap-2 whitespace-nowrap bg-sky px-3 py-2 text-base"
          title="Change le look de Cubo"
        >
          <Shirt size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          <span className="hidden 2xl:inline">Mon Cubo</span>
        </Link>
        <Link
          href="/creer/"
          aria-label="Créer"
          title="Création libre"
          className="btn flex items-center gap-2 whitespace-nowrap bg-pink px-3 py-2 text-base"
        >
          <Palette size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          <span className="hidden 2xl:inline">Créer</span>
        </Link>
        <SoundToggle />
      </div>
    </header>
  );
}
