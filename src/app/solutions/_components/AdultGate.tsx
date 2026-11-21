"use client";
import { useState, useSyncExternalStore } from "react";
import { LockKeyhole } from "lucide-react";
import { loadSession, saveSession } from "@/lib/storage";
import { ICON_STROKE } from "@/lib/site";

// Accès réservé aux animateurs : le code leur est communiqué à part, aucun indice n'est affiché.
// Seule son empreinte SHA-256 est dans le code du site. C'est un frein pour éviter que les enfants
// trichent, pas une protection forte : le site étant statique, les solutions restent dans ses fichiers.
const CODE_SHA256 = "0e19c61454418dc6f08ae922e19676ef589725334c0ba8a373e7476bc1207c46";
const KEY = "adult-ok";
const EVENT = "cubocode:adult";

const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb); };

async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdultGate({ children }: { children: React.ReactNode }) {
  const unlocked = useSyncExternalStore(subscribe, () => loadSession(KEY, false), () => false);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((await sha256(value.trim())) !== CODE_SHA256) { setWrong(true); return; }
    saveSession(KEY, true);
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <main id="contenu" className="mx-auto grid w-full max-w-md flex-1 place-items-center px-4 py-16">
      <form onSubmit={submit} className="toon w-full rounded-3xl bg-paper p-6 text-center">
        <span className="toon mx-auto grid size-14 place-items-center rounded-2xl bg-lilac"><LockKeyhole size={28} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>
        <h1 className="mt-4 text-3xl font-bold">Espace animateur</h1>
        <p className="mt-2 font-semibold text-ink-soft">Cette page contient toutes les solutions. Elle est réservée aux animateurs.</p>
        <label className="mt-5 block font-bold">
          Code d&apos;accès
          <input
            type="password" autoComplete="off" value={value}
            onChange={(e) => { setValue(e.target.value); setWrong(false); }}
            aria-invalid={wrong} aria-describedby={wrong ? "gate-error" : undefined}
            className="mt-2 w-full rounded-2xl border-[3px] border-ink bg-cream px-4 py-3 text-center font-display text-xl font-bold"
          />
        </label>
        {wrong && <p id="gate-error" role="alert" className="mt-2 font-bold text-coral">Ce n&apos;est pas le bon code.</p>}
        <button type="submit" className="btn mt-4 w-full bg-sun py-3 text-xl">Continuer</button>
      </form>
    </main>
  );
}
