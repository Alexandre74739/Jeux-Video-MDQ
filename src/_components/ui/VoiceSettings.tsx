"use client";
import { Volume2 } from "lucide-react";
import { sfx, speak, type VoicePrefs } from "@/lib/sound";
import { LINES } from "@/lib/lines";
import { ICON_STROKE } from "@/lib/site";

/** Réglages de la voix de Cubo : activée, vitesse, lecture automatique. */
export function VoiceSettings({
  prefs,
  update,
}: {
  prefs: VoicePrefs;
  update: (p: Partial<VoicePrefs>) => void;
}) {
  return (
    <>
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
          <Volume2 size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Écouter
        </button>
      </fieldset>
    </>
  );
}
