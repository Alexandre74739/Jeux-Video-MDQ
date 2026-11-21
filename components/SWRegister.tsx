"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import "@/lib/install"; // écoute l'événement d'installation dès le chargement
import { warmVoice } from "@/lib/sound";
import { startAutoSync } from "@/lib/profiles";

const CHECK_EVERY = 15 * 60 * 1000; // vérifie les mises à jour toutes les 15 minutes

/**
 * Enregistre le service worker (site hors-ligne) et applique automatiquement les mises à jour :
 * chaque déploiement produit un nouveau sw.js ; dès qu'il prend le relais, la page se recharge.
 */
export default function SWRegister() {
  const [updating, setUpdating] = useState(false);

  // Sauvegarde en ligne du joueur en cours (si son compte est relié)
  useEffect(() => { startAutoSync(); }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) { warmVoice(); return; }
    let reg: ServiceWorkerRegistration | undefined;
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;

    const check = () => { if (navigator.onLine) reg?.update().catch(() => {}); };

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((r) => { reg = r; check(); return navigator.serviceWorker.ready; })
      .then(() => warmVoice())
      .catch(() => {});

    // Nouvelle version active : on recharge (sauf à la toute première installation).
    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      if (document.visibilityState === "hidden") { window.location.reload(); return; }
      setUpdating(true);
      setTimeout(() => window.location.reload(), 2500);
    };
    const onVisible = () => { if (document.visibilityState === "visible") check(); };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", check);
    const timer = setInterval(check, CHECK_EVERY);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", check);
      clearInterval(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {updating && (
        <motion.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          role="status"
          className="fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-full border-[3px] border-ink bg-ink px-5 py-3 font-display text-lg font-bold text-white shadow-pop"
        >
          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <RefreshCw size={20} strokeWidth={3} aria-hidden="true" />
          </motion.span>
          Nouvelle version de CuboCode, mise à jour…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
