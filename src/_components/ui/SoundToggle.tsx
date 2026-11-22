"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  getVoicePrefs,
  isMuted,
  setMuted,
  setVoicePrefs,
  sfx,
  speak,
  type VoicePrefs,
} from "@/lib/sound";
import { LINES } from "@/lib/lines";
import { ICON_STROKE } from "@/lib/site";

/** Bouton son + menu de réglage de la voix (mascotte). */
export function SoundToggle() {
  const [m, setM] = useState(false);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<VoicePrefs>(getVoicePrefs());
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setM(isMuted());
    setPrefs(getVoicePrefs());
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const update = (p: Partial<VoicePrefs>) => {
    setVoicePrefs(p);
    setPrefs(getVoicePrefs());
  };

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
                  setM(!m);
                  if (m) sfx("click");
                }}
              />
            </label>
            <hr className="my-3 border-t-2 border-ink/15" />
            <label className="flex items-center justify-between gap-3 font-display text-lg font-bold">
              Voix de Cubo
              <input
                type="checkbox"
                checked={prefs.on}
                className="size-6 accent-grape"
                onChange={(e) => {
                  update({ on: e.target.checked });
                  sfx("click");
                }}
              />
            </label>
            <p className="text-xs font-bold text-ink-soft">
              Coupe seulement la voix : les effets sonores restent actifs.
            </p>
            <fieldset
              disabled={!prefs.on}
              className={`mt-1 ${prefs.on ? "" : "opacity-45"}`}
            >
              <label className="mt-2 block text-sm font-extrabold">
                Vitesse : {prefs.rate.toFixed(1)}
                <input
                  type="range"
                  min={0.8}
                  max={1.4}
                  step={0.1}
                  value={prefs.rate}
                  className="mt-1 w-full accent-grape"
                  onChange={(e) => update({ rate: Number(e.target.value) })}
                />
              </label>
              <label className="mt-2 flex items-center justify-between gap-3 text-sm font-extrabold">
                Lire les consignes automatiquement
                <input
                  type="checkbox"
                  checked={prefs.auto}
                  className="size-5 accent-grape"
                  onChange={(e) => update({ auto: e.target.checked })}
                />
              </label>
              <button
                onClick={() => speak(LINES.hello)}
                className="btn mt-3 flex w-full items-center justify-center gap-2 bg-sky py-2"
              >
                <Volume2
                  size={18}
                  strokeWidth={ICON_STROKE}
                  aria-hidden="true"
                />{" "}
                Écouter
              </button>
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
