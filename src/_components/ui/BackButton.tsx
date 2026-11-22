"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sfx } from "@/lib/sound";

/** Bouton « Retour » : page précédente si on vient du site, sinon page parente (fallback). */
export default function BackButton({
  fallback,
  label = "Retour",
}: {
  fallback: string;
  label?: string;
}) {
  const router = useRouter();
  const back = () => {
    sfx("click");
    let fromSite = false;
    try {
      fromSite =
        !!document.referrer &&
        new URL(document.referrer).origin === location.origin;
    } catch {
      /* ignoré */
    }
    if (fromSite && window.history.length > 1) router.back();
    else router.push(fallback);
  };
  return (
    <button
      onClick={back}
      className="btn flex shrink-0 items-center gap-1.5 bg-paper px-3 py-2 text-sm"
      aria-label={
        label === "Retour"
          ? "Revenir à la page précédente"
          : `Retour : ${label}`
      }
    >
      <ArrowLeft size={20} strokeWidth={3} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
