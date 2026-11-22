"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { StarIcon } from "@/_components/icons/Icon";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { LINES } from "@/lib/lines";
import type { WorldLock } from "@/lib/levels";
import { getVoicePrefs, speak } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { GoalBar } from "./GoalBar";

/** Écran du monde secret tant que la carte au trésor n'est pas complète ou que le phare n'est pas allumé. */
export function LockedWorld({ lock }: { lock: WorldLock }) {
  // La phrase enregistrée ne parle que des étoiles : on ne la dit que lorsque la carte est déjà complète.
  useEffect(() => {
    if (getVoicePrefs().auto && lock.pieces >= 4) speak(LINES.locked);
  }, [lock.pieces]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="toon w-[460px] max-w-full rounded-[32px] bg-paper p-6 text-center">
        <div className="flex justify-center">
          <Cubo size={96} mood="think" />
        </div>
        <h1 className="mt-2 text-3xl font-bold">L'île secrète</h1>
        <p className="mt-2 text-lg font-bold">
          Pour trouver l'île, il faut la carte au trésor complète et le phare
          allumé !
        </p>
        <GoalBar
          icon={
            <MapIcon size={24} strokeWidth={ICON_STROKE} aria-hidden="true" />
          }
          label="Morceaux de la carte"
          have={lock.pieces}
          need={4}
        />
        {lock.need > 0 && (
          <GoalBar
            icon={<StarIcon size={24} />}
            label="Étoiles du phare"
            have={lock.have}
            need={lock.need}
          />
        )}
        <p className="mt-4 text-sm font-bold text-ink-soft">
          {lock.pieces < 4
            ? "Astuce : termine le tutoriel, la vallée des clés, le volcan et le labyrinthe pour retrouver les 4 morceaux."
            : "Astuce : rejoue les niveaux où tu as moins de 3 étoiles !"}
        </p>
        <Link
          href="/jouer/"
          className="btn mt-5 inline-flex items-center gap-2 bg-mint px-6 py-3 text-lg"
        >
          <LayoutGrid size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Retour aux défis
        </Link>
      </div>
    </div>
  );
}
