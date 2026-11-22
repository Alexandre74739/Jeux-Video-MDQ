import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import BackButton from "@/_components/ui/BackButton";
import ProfileMenu from "@/_components/profile/ProfileMenu";
import { Logo } from "@/_components/ui/Logo";
import { SoundToggle } from "@/_components/ui/SoundToggle";
import { StarIcon } from "@/_components/icons/Icon";
import { ICON_STROKE } from "@/lib/site";

/** En-tête de la garde-robe : retour, joueur, étoiles gagnées et son. */
export function WardrobeHeader({ stars }: { stars: number }) {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <div className="flex items-center gap-2">
          <BackButton fallback="/jouer/" />
          <span className="hidden sm:block">
            <Logo small />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProfileMenu />
          <span
            className="toon flex items-center gap-1.5 rounded-full bg-sun px-3 py-1.5 font-display text-lg font-bold"
            title="Étoiles gagnées"
          >
            <StarIcon size={22} /> {stars}
            <span className="sr-only">étoiles</span>
          </span>
          <Link
            href="/jouer/"
            className="btn hidden items-center gap-2 bg-mint px-4 py-2 sm:flex"
          >
            <LayoutGrid
              size={20}
              strokeWidth={ICON_STROKE}
              aria-hidden="true"
            />{" "}
            <span className="hidden sm:inline">Défis</span>
          </Link>
          <SoundToggle />
        </div>
      </div>
    </header>
  );
}
