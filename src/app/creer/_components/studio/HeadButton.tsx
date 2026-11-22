"use client";
import type { LucideIcon } from "lucide-react";
import { ICON_STROKE } from "@/lib/site";

export const btn = "btn flex items-center gap-2 px-3 py-2 xl:px-4";

/** Bouton de l'en-tête : icône seule sur petit écran, avec son texte sur grand écran. */
export function HeadButton({
  icon: I,
  label,
  short,
  className,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  short: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`${btn} ${className}`}
    >
      <I size={19} strokeWidth={ICON_STROKE} aria-hidden="true" />
      <span className="hidden xl:inline">{short}</span>
    </button>
  );
}
