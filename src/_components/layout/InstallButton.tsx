"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { canPrompt, isStandalone, onInstallChange, promptInstall } from "@/lib/install";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

type Platform = "ios" | "safari-mac" | "firefox-windows" | "firefox-desktop" | "firefox-android" | "samsung" | "chromium";

function detect(): Platform {
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return "ios";
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Firefox|FxiOS/.test(ua)) {
    if (/Android/.test(ua)) return "firefox-android";
    return /Windows/.test(ua) ? "firefox-windows" : "firefox-desktop";
  }
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)) return "safari-mac";
  return "chromium";
}

const STEPS: Record<Platform, { title: string; steps: string[] }> = {
  ios: { title: "Sur iPhone / iPad", steps: ["Touche le bouton Partager (carré avec une flèche vers le haut).", "Choisis « Sur l'écran d'accueil ».", "Touche « Ajouter » : Cubo apparaît sur l'écran d'accueil !"] },
  "safari-mac": { title: "Sur Safari (Mac)", steps: ["Ouvre le menu « Fichier ».", "Choisis « Ajouter au Dock ».", "CuboCode s'ouvre ensuite comme une vraie application."] },
  "firefox-android": { title: "Sur Firefox (Android)", steps: ["Touche le menu ⋮ en haut à droite.", "Choisis « Installer » (ou « Ajouter à l'écran d'accueil »)."] },
  samsung: { title: "Sur Samsung Internet", steps: ["Touche le menu ≡ en bas.", "Choisis « Ajouter la page à » puis « Écran d'accueil »."] },
  chromium: { title: "Sur Edge / Chrome", steps: ["Clique sur l'icône d'installation à droite de la barre d'adresse.", "Ou ouvre le menu ⋯ › Applications › « Installer CuboCode »."] },
  "firefox-windows": { title: "Sur Firefox (Windows)", steps: ["Clique sur l'icône « applications web » qui apparaît dans la barre d'adresse.", "Choisis « Ajouter à la barre des tâches » : CuboCode s'ouvre comme une application et apparaît dans le menu Démarrer.", "Pas d'icône ? Mets Firefox à jour (version 143 ou plus). La version du Microsoft Store ne le permet pas : utilise alors le bouton Edge ci-dessous."] },
  "firefox-desktop": { title: "Sur Firefox (Mac / Linux)", steps: ["Firefox permet l'installation seulement sur Windows pour l'instant.", "Sur Mac, ouvre CuboCode avec Safari (Fichier › Ajouter au Dock) ou Chrome.", "Sur Linux, ouvre-le avec Chrome ou Edge puis clique sur « Installer l'appli »."] },
};

/** Bouton « Installer l'appli » : installation directe quand le navigateur le permet, sinon aide adaptée au navigateur. */
export default function InstallButton({ className = "", full = false }: { className?: string; full?: boolean }) {
  // Initialisation immédiate côté navigateur : le bouton s'affiche en même temps que le reste.
  const [standalone, setStandalone] = useState(() => typeof window !== "undefined" && isStandalone());
  const [platform, setPlatform] = useState<Platform>(() => (typeof window !== "undefined" ? detect() : "chromium"));
  const [, force] = useState(0);
  const [help, setHelp] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStandalone(isStandalone());
    setPlatform(detect());
    return onInstallChange(() => { setStandalone(isStandalone()); force((n) => n + 1); });
  }, []);

  useEffect(() => {
    if (!help) return;
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setHelp(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setHelp(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); };
  }, [help]);

  if (standalone) return null;

  const click = async () => {
    sfx("click");
    if (canPrompt()) await promptInstall();
    else setHelp((h) => !h);
  };
  const info = STEPS[platform];

  return (
    <div ref={box} className={`relative ${full ? "w-full" : ""}`}>
      <button
        onClick={click}
        aria-expanded={help}
        className={`btn flex items-center justify-center gap-2 whitespace-nowrap bg-mint px-4 py-2.5 ${full ? "w-full text-lg" : ""} ${className}`}
      >
        <Download size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /> Installer l&apos;appli
      </button>
      <AnimatePresence>
        {help && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
            role="dialog" aria-label="Comment installer l'application"
            className={`rounded-3xl border-[3px] border-ink bg-paper p-4 text-left shadow-pop-lg ${full ? "relative mt-3 w-full" : "absolute top-14 right-0 z-[95] w-[min(320px,calc(100vw-2rem))]"}`}
          >
            <button onClick={() => setHelp(false)} className="absolute top-2 right-2 grid size-8 place-items-center rounded-full hover:bg-cream" aria-label="Fermer">
              <X size={18} strokeWidth={3} aria-hidden="true" />
            </button>
            <p className="pr-6 font-display text-lg font-bold">{info.title}</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-bold">
              {info.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            {platform === "firefox-windows" && (
              <a
                href={`microsoft-edge:${typeof window !== "undefined" ? window.location.href : ""}`}
                className="btn mt-3 flex items-center justify-center gap-2 bg-sky py-2"
              >
                <ExternalLink size={18} strokeWidth={ICON_STROKE} aria-hidden="true" /> Sinon : ouvrir dans Edge
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
