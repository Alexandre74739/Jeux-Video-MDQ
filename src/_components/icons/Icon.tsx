"use client";
import { Star } from "lucide-react";
import { ICON_STROKE } from "@/lib/site";
import { ICONS } from "./catalog";

/** Icône du catalogue (par nom), trait épais façon dessin animé. */
export function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const C = ICONS[name];
  if (!C) return null;
  return (
    <C
      size={size}
      strokeWidth={ICON_STROKE}
      className={className}
      aria-hidden="true"
    />
  );
}

/** Étoile pleine jaune cerclée d'encre (ou vide). */
export function StarIcon({
  size = 20,
  filled = true,
  className = "",
}: {
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  return (
    <Star
      size={size}
      strokeWidth={2.5}
      className={className}
      fill={filled ? "#FFD23F" : "#E8E4F0"}
      color={filled ? "#16123A" : "#9A95B5"}
      aria-hidden="true"
    />
  );
}
