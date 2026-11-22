import Image from "next/image";
import Link from "next/link";

/**
 * Logo de la marque : l'icône de l'application (fixe, jamais habillée avec la tenue du joueur)
 * suivie du nom. Une seule marque partout : en-têtes, icône d'onglet et appli installée.
 */
export function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 40 : 48;
  return (
    <Link
      href="/"
      className="flex items-center gap-2 select-none"
      aria-label="CuboCode, accueil"
    >
      <Image
        src="/icon.svg"
        alt=""
        width={size}
        height={size}
        priority
        draggable={false}
      />
      <span
        className={`font-display font-bold tracking-tight ${small ? "text-2xl" : "text-3xl"}`}
      >
        Cubo<span className="text-grape">Code</span>
      </span>
    </Link>
  );
}
