import Link from "next/link";
import { Palette, Shirt } from "lucide-react";
import ProfileMenu from "@/_components/profile/ProfileMenu";
import BackButton from "@/_components/ui/BackButton";
import { Logo } from "@/_components/ui/Logo";
import { SoundToggle } from "@/_components/ui/SoundToggle";
import { ICON_STROKE } from "@/lib/site";

/** En-tête de la page des défis : retour, joueur, Mon Cubo, création libre et son. */
export function HubHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <BackButton fallback="/" />
          <span className="hidden sm:block">
            <Logo small />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProfileMenu />
          <Link
            href="/cubo/"
            aria-label="Mon Cubo"
            title="Mon Cubo"
            className="btn flex items-center gap-2 whitespace-nowrap bg-sky px-4 py-2"
          >
            <Shirt size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
            <span className="hidden lg:inline">Mon Cubo</span>
          </Link>
          <Link
            href="/creer/"
            aria-label="Création libre"
            title="Création libre"
            className="btn flex items-center gap-2 whitespace-nowrap bg-pink px-4 py-2"
          >
            <Palette size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
            <span className="hidden lg:inline">Création libre</span>
          </Link>
          <SoundToggle />
        </div>
      </div>
    </header>
  );
}
