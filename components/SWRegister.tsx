"use client";
import { useEffect } from "react";

/** Enregistre le service worker : tout le site est mis en cache pour fonctionner hors-ligne. */
export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
