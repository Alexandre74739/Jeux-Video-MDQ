"use client";
import Link from "next/link";
import { useRef } from "react";
import {
  Download,
  FolderOpen,
  Map as MapIcon,
  Palette,
  WandSparkles,
} from "lucide-react";
import BackButton from "@/_components/ui/BackButton";
import { Logo } from "@/_components/ui/Logo";
import { SoundToggle } from "@/_components/ui/SoundToggle";
import { ICON_STROKE } from "@/lib/site";
import { btn, HeadButton } from "./HeadButton";
import type { StudioState } from "./useStudio";

/** En-tête de la création libre : télécharger, ouvrir, nouveau jeu, défis et son. */
export function StudioHeader({ s }: { s: StudioState }) {
  const openRef = useRef<HTMLInputElement>(null);
  return (
    <header className="sticky top-0 z-40 flex min-h-[72px] shrink-0 flex-wrap items-center gap-2 border-b-[3px] border-ink bg-paper px-3 py-2 sm:gap-3 sm:px-4">
      <BackButton fallback="/" />
      <Logo small />
      <span className="toon ml-2 hidden items-center gap-2 rounded-full bg-pink md:flex px-3 py-1 font-display text-lg font-bold">
        <Palette size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
        Création libre
      </span>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <HeadButton
          icon={Download}
          label="Télécharger mon jeu"
          short="Télécharger mon jeu"
          className="bg-mint"
          onClick={s.download}
        />
        <HeadButton
          icon={FolderOpen}
          label="Ouvrir un jeu"
          short="Ouvrir"
          className="bg-sky"
          onClick={() => openRef.current?.click()}
        />
        <input
          ref={openRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) s.openFile(f);
            e.target.value = "";
          }}
        />
        <HeadButton
          icon={WandSparkles}
          label="Nouveau jeu"
          short="Nouveau"
          className="bg-paper"
          onClick={s.restart}
        />
        <Link
          href="/jouer/"
          title="Les défis"
          aria-label="Les défis"
          className={`${btn} bg-sun`}
        >
          <MapIcon size={19} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className="hidden xl:inline">Jouer</span>
        </Link>
        <SoundToggle />
      </div>
    </header>
  );
}
