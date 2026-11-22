import { Check, RefreshCw } from "lucide-react";
import { ICON_STROKE } from "@/lib/site";

/** Champ texte sans saisie automatique du navigateur (pas d'e-mail proposé à la place du pseudo). */
export const noAutofill = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  "data-1p-ignore": true,
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;

export const inputCls =
  "mt-1 w-full rounded-2xl border-[3px] border-ink bg-cream px-4 py-2.5 text-xl font-bold outline-none placeholder:font-semibold placeholder:text-ink/35 focus:bg-paper";

/** Temps écoulé depuis `t`, en mots (« à l'instant », « il y a 5 min »…). */
export function ago(t?: number) {
  if (!t) return "";
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "à l'instant";
  return m < 60 ? `il y a ${m} min` : `il y a ${Math.round(m / 60)} h`;
}

/** Message d'erreur d'un formulaire. */
export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p
      className="mt-3 rounded-2xl bg-orange/40 px-3 py-2 text-center font-bold"
      role="alert"
    >
      {error}
    </p>
  );
}

/** Icône du bouton d'envoi : roue qui tourne pendant l'envoi, sinon une coche. */
export function BusyIcon({ busy }: { busy: boolean }) {
  return busy ? (
    <RefreshCw
      size={22}
      strokeWidth={ICON_STROKE}
      className="animate-spin"
      aria-hidden="true"
    />
  ) : (
    <Check size={22} strokeWidth={3} aria-hidden="true" />
  );
}

/** Titre de l'écran affiché dans la fenêtre des joueurs. */
export function MenuTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 id="profile-title" className="text-center text-3xl font-bold">
      {children}
    </h2>
  );
}
