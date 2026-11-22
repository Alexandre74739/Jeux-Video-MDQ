"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { warmVoice } from "@/lib/sound";

const CHECK_EVERY = 15 * 60 * 1000; // vérifie les mises à jour toutes les 15 minutes
/** Pages du jeu : en y entrant, tout le site (3D, images) est mis en cache pour le hors-ligne. */
const GAME_PAGES = /^\/(jouer|creer|cubo)(\/|$)/;

const swAvailable = () =>
  process.env.NODE_ENV === "production" && "serviceWorker" in navigator;

/** Demande au service worker de tout mettre en cache dès qu'on entre dans le jeu. */
function useWarmGamePages() {
  const pathname = usePathname();
  useEffect(() => {
    if (!swAvailable() || !GAME_PAGES.test(pathname)) return;
    navigator.serviceWorker.ready
      .then((r) => r.active?.postMessage("warm"))
      .catch(() => {});
  }, [pathname]);
}

/**
 * Enregistre le service worker et surveille les mises à jour.
 * Renvoie `true` pendant les quelques secondes qui précèdent le rechargement.
 */
export function useServiceWorker() {
  const [updating, setUpdating] = useState(false);
  useWarmGamePages();

  useEffect(() => {
    if (!swAvailable()) {
      warmVoice();
      return;
    }
    const sw = navigator.serviceWorker;
    let reg: ServiceWorkerRegistration | undefined;
    const hadController = !!sw.controller;
    let reloading = false;

    const check = () => {
      if (navigator.onLine) reg?.update().catch(() => {});
    };

    sw.register("/sw.js", { updateViaCache: "none" })
      .then((r) => {
        reg = r;
        check();
        return sw.ready;
      })
      .then(() => warmVoice())
      .catch(() => {});

    // Nouvelle version active : on recharge (sauf à la toute première installation).
    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      if (document.visibilityState === "hidden") {
        window.location.reload();
        return;
      }
      setUpdating(true);
      setTimeout(() => window.location.reload(), 2500);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    sw.addEventListener("controllerchange", onControllerChange);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", check);
    const timer = setInterval(check, CHECK_EVERY);
    return () => {
      sw.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", check);
      clearInterval(timer);
    };
  }, []);

  return updating;
}
