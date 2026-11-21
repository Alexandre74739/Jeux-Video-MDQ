import Link from "next/link";
import { Logo } from "@/_components/ui/Logo";
import { PUBLISHER } from "@/lib/site";

const LINKS = [
  { href: "/mentions-legales/", label: "Mentions légales" },
  { href: "/confidentialite/", label: "Confidentialité" },
  { href: "/solutions/", label: "Espace animateur" },
];

const link = "underline decoration-2 underline-offset-2 hover:text-grape";

/** Pied de page commun aux pages de contenu (accueil, pages légales, solutions, 404). */
export default function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-ink bg-paper px-4 py-6 text-sm font-semibold sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Logo small />
        <p>
          Conçu et développé par <strong>{PUBLISHER.name}</strong>, développeur chez{" "}
          <a href="https://fablioo.com" target="_blank" rel="noopener noreferrer" className={link}>fablioo.com</a>
        </p>
        <nav aria-label="Liens utiles">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {LINKS.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
