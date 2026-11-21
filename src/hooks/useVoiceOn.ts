"use client";
import { useSyncExternalStore } from "react";
import { getVoicePrefs, onVoicePrefs } from "@/lib/sound";

/** Vrai quand la voix de Cubo est activée (mis à jour en direct). */
export function useVoiceOn() {
  return useSyncExternalStore(onVoicePrefs, () => getVoicePrefs().on, () => true);
}
