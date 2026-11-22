"use client";
import { useEffect } from "react";

/** Appelle `onEscape` quand on appuie sur Échap (tant que `active` est vrai). */
export function useEscape(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onEscape, active]);
}
