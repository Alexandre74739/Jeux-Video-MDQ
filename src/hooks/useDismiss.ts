"use client";
import { useEffect, useEffectEvent, type RefObject } from "react";

/** Ferme un menu ouvert quand on clique en dehors de `box` ou qu'on appuie sur Échap. */
export function useDismiss(
  open: boolean,
  box: RefObject<HTMLElement | null>,
  close: () => void,
) {
  const onClose = useEffectEvent(close);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", esc);
    };
  }, [open, box]);
}
