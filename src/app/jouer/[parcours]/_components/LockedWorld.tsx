"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Cubo } from "@/_components/ui/Cubo";
import { StarIcon } from "@/_components/icons/Icon";
import { LayoutGrid } from "lucide-react";
import { LINES } from "@/lib/lines";
import { getVoicePrefs, speak } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

/** Écran du monde secret tant que le phare n'est pas allumé. */
export function LockedWorld({ need, have }: { need: number; have: number }) {
  useEffect(() => { if (getVoicePrefs().auto) speak(LINES.locked); }, []);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="toon w-[460px] max-w-full rounded-[32px] bg-paper p-6 text-center">
        <div className="flex justify-center"><Cubo size={96} mood="think" /></div>
        <h1 className="mt-2 text-3xl font-bold">L'île secrète</h1>
        <p className="mt-2 text-lg font-bold">{LINES.locked}</p>
        <p className="mt-4 flex items-center justify-center gap-2 font-display text-2xl font-bold"><StarIcon size={28} /> {have} / {need}</p>
        <div className="mt-2 h-5 overflow-hidden rounded-full border-[3px] border-ink bg-cream" role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={have} aria-label={`Étoiles : ${have} sur ${need}`}>
          <div className="h-full bg-sun" style={{ width: `${Math.min(100, (have / need) * 100)}%` }} />
        </div>
        <p className="mt-3 text-sm font-bold text-ink-soft">Astuce : rejoue les niveaux où tu as moins de 3 étoiles !</p>
        <Link href="/jouer/" className="btn mt-5 inline-flex items-center gap-2 bg-mint px-6 py-3 text-lg"><LayoutGrid size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /> Retour aux défis</Link>
      </div>
    </div>
  );
}
