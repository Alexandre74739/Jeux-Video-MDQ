"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "@/lib/install"; // écoute l'événement d'installation dès le chargement
import { startAutoSync } from "@/lib/profiles";
import { useServiceWorker } from "@/hooks/useServiceWorker";

/**
 * Enregistre le service worker (site hors-ligne) et applique automatiquement les mises à jour :
 * chaque déploiement produit un nouveau sw.js ; dès qu'il prend le relais, la page se recharge.
 */
export default function SWRegister() {
  const updating = useServiceWorker();

  // Sauvegarde en ligne du joueur en cours (si son compte est relié)
  useEffect(() => {
    startAutoSync();
  }, []);

  return (
    <AnimatePresence>
      {updating && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          role="status"
          className="fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-full border-[3px] border-ink bg-ink px-5 py-3 font-display text-lg font-bold text-white shadow-pop"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RefreshCw size={20} strokeWidth={3} aria-hidden="true" />
          </motion.span>
          Nouvelle version de CuboCode, mise à jour…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
