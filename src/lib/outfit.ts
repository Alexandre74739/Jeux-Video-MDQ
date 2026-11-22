// Tenue de Cubo choisie par l'enfant (couleur, chapeau, traînée), partagée par toutes les pages.
"use client";
import { useEffect, useState } from "react";
import { load, save } from "./storage";
import { DEFAULT_OUTFIT, type Outfit } from "./rewards";

const EVENT = "cubocode:outfit";

export function getOutfit(): Outfit {
  if (typeof window === "undefined") return DEFAULT_OUTFIT;
  return { ...DEFAULT_OUTFIT, ...load<Partial<Outfit>>("outfit", {}) };
}

export function setOutfit(o: Partial<Outfit>) {
  const next = { ...getOutfit(), ...o };
  save("outfit", next, { silent: true });
  save("outfitAt", Date.now()); // la tenue la plus récente gagne lors de la synchronisation
  window.dispatchEvent(new Event(EVENT));
  return next;
}

/** Tenue courante (tenue par défaut au premier rendu, pour éviter les écarts serveur / client). */
export function useOutfit(): Outfit {
  const [o, setO] = useState<Outfit>(DEFAULT_OUTFIT);
  useEffect(() => {
    const upd = () => setO(getOutfit());
    upd();
    window.addEventListener(EVENT, upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener(EVENT, upd);
      window.removeEventListener("storage", upd);
    };
  }, []);
  return o;
}
