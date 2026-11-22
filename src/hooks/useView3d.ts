"use client";
import { useSyncExternalStore } from "react";
import { load, save } from "@/lib/storage";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/**
 * Vue du monde choisie par le joueur (3D par défaut), gardée sur l'appareil.
 * Vaut `null` tant que la page n'est pas chargée dans le navigateur.
 */
export function useView3d() {
  const view3d = useSyncExternalStore(
    subscribe,
    () => load("view3d", true),
    () => null,
  );
  const setView3d = (v: boolean) => {
    save("view3d", v);
    listeners.forEach((l) => l());
  };
  return [view3d, setView3d] as const;
}
