"use client";
import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** Vrai une fois la page chargée dans le navigateur (faux pendant le rendu statique). */
export function useMounted() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}
