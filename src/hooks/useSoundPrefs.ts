"use client";
import { useSyncExternalStore } from "react";
import {
  DEFAULT_VOICE,
  getVoicePrefs,
  isMuted,
  onVoicePrefs,
} from "@/lib/sound";

/** Effets sonores coupés ou non, et réglages de la voix (mis à jour en direct). */
export function useSoundPrefs() {
  const muted = useSyncExternalStore(onVoicePrefs, isMuted, () => false);
  const prefs = useSyncExternalStore(
    onVoicePrefs,
    getVoicePrefs,
    () => DEFAULT_VOICE,
  );
  return { muted, prefs };
}
