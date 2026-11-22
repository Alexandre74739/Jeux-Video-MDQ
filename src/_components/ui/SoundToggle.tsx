"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { setMuted, setVoicePrefs, sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { useDismiss } from "@/hooks/useDismiss";
import { useSoundPrefs } from "@/hooks/useSoundPrefs";
import { VoiceSettings } from "./VoiceSettings";

/** Bouton son + menu de réglage de la voix (mascotte). */
export function SoundToggle() {
  const { muted: m, prefs } = useSoundPrefs();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useDismiss(open, box, () => setOpen(false));

  return (
    <div ref={box} className="relative">
      <button
        className="btn grid size-11 place-items-center bg-paper"
        aria-label="Réglages du son et de la voix"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          sfx("click");
        }}
      >
        {m ? (
          <VolumeX size={22} strokeWidth={ICON_STROKE} aria-hidden="true" />
        ) : (
          <Volume2 size={22} strokeWidth={ICON_STROKE} aria-hidden="true" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            className="absolute top-14 right-0 z-[95] w-[320px] origin-top-right rounded-3xl border-[3px] border-ink bg-paper p-4 shadow-pop-lg"
            role="dialog"
            aria-label="Son et voix"
          >
            <label className="flex items-center justify-between gap-3 font-display text-lg font-bold">
              Effets sonores
              <input
                type="checkbox"
                checked={!m}
                className="size-6 accent-grape"
                onChange={() => {
                  setMuted(!m);
                  if (m) sfx("click");
                }}
              />
            </label>
            <hr className="my-3 border-t-2 border-ink/15" />
            <VoiceSettings prefs={prefs} update={setVoicePrefs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
