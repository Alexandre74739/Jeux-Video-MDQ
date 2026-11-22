"use client";
import { AnimatePresence } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import {
  canPrompt,
  isStandalone,
  onInstallChange,
  promptInstall,
} from "@/lib/install";
import { sfx } from "@/lib/sound";
import { detect, type Platform } from "@/lib/platform";
import { ICON_STROKE } from "@/lib/site";
import { useDismiss } from "@/hooks/useDismiss";
import { InstallHelp } from "./InstallHelp";

const noSubscribe = () => () => {};

/** Bouton « Installer l'appli » : installation directe quand le navigateur le permet, sinon aide adaptée au navigateur. */
export default function InstallButton({
  className = "",
  full = false,
}: {
  className?: string;
  full?: boolean;
}) {
  const standalone = useSyncExternalStore(
    onInstallChange,
    isStandalone,
    () => false,
  );
  const platform = useSyncExternalStore<Platform>(
    noSubscribe,
    detect,
    () => "chromium",
  );
  const [help, setHelp] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useDismiss(help, box, () => setHelp(false));

  if (standalone) return null;

  const click = async () => {
    sfx("click");
    if (canPrompt()) await promptInstall();
    else setHelp((h) => !h);
  };

  return (
    <div ref={box} className={`relative ${full ? "w-full" : ""}`}>
      <button
        onClick={click}
        aria-expanded={help}
        className={`btn flex items-center justify-center gap-2 whitespace-nowrap bg-mint px-4 py-2.5 ${full ? "w-full text-lg" : ""} ${className}`}
      >
        <Download size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
        Installer l&apos;appli
      </button>
      <AnimatePresence>
        {help && (
          <InstallHelp
            platform={platform}
            full={full}
            onClose={() => setHelp(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
