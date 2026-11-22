"use client";
import { motion } from "motion/react";
import { ExternalLink, X } from "lucide-react";
import { STEPS, type Platform } from "@/lib/platform";
import { ICON_STROKE } from "@/lib/site";

/** Aide à l'installation, adaptée au navigateur, quand l'installation directe est impossible. */
export function InstallHelp({
  platform,
  full,
  onClose,
}: {
  platform: Platform;
  full: boolean;
  onClose: () => void;
}) {
  const info = STEPS[platform];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      role="dialog"
      aria-label="Comment installer l'application"
      className={`rounded-3xl border-[3px] border-ink bg-paper p-4 text-left shadow-pop-lg ${full ? "relative mt-3 w-full" : "absolute top-14 right-0 z-[95] w-[min(320px,calc(100vw-2rem))]"}`}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full hover:bg-cream"
        aria-label="Fermer"
      >
        <X size={18} strokeWidth={3} aria-hidden="true" />
      </button>
      <p className="pr-6 font-display text-lg font-bold">{info.title}</p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-bold">
        {info.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {platform === "firefox-windows" && (
        <a
          href={`microsoft-edge:${typeof window !== "undefined" ? window.location.href : ""}`}
          className="btn mt-3 flex items-center justify-center gap-2 bg-sky py-2"
        >
          <ExternalLink
            size={18}
            strokeWidth={ICON_STROKE}
            aria-hidden="true"
          />{" "}
          Sinon : ouvrir dans Edge
        </a>
      )}
    </motion.div>
  );
}
