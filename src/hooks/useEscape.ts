"use client";
import { useEffect, useEffectEvent } from "react";

/** Appelle `onEscape` quand on appuie sur Échap (tant que `active` est vrai). */
export function useEscape(onEscape: () => void, active = true) {
  const handler = useEffectEvent(onEscape);
  useEffect(() => {
    if (!active) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && handler();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [active]);
}
