"use client";
import { Cloud, CloudOff, LogOut, RefreshCw } from "lucide-react";
import { logoutAccount, syncNow, type Profile } from "@/lib/profiles";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { ago } from "./fields";
import type { ProfileMenuState } from "./useProfileMenu";

const SYNC_TEXT: Record<string, string> = {
  syncing: "Synchronisation…",
  offline: "Hors-ligne : ta progression sera envoyée plus tard.",
  error: "La synchronisation a échoué.",
};

const icon = { strokeWidth: ICON_STROKE, "aria-hidden": true } as const;

/** Encart « Sauvegarde en ligne » d'un joueur : compte relié, ou bouton pour en créer un. */
export function CloudSection({
  m,
  sel,
}: {
  m: ProfileMenuState;
  sel: Profile;
}) {
  const syncText =
    SYNC_TEXT[m.status] ?? `Synchronisé ${ago(m.active.cloud?.syncedAt)}.`;
  return (
    <section className="mt-4 rounded-3xl bg-cream p-4">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold">
        {sel.cloud ? (
          <Cloud size={20} {...icon} />
        ) : (
          <CloudOff size={20} {...icon} />
        )}
        Sauvegarde en ligne
      </h3>
      {sel.cloud ? (
        <>
          <p className="mt-1 text-sm font-bold">
            Compte : <strong>{sel.cloud.pseudo}</strong>.
            {m.isCurrent && <span className="text-ink-soft"> {syncText}</span>}
          </p>
          {m.isCurrent && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  sfx("click");
                  void syncNow();
                }}
                disabled={m.status === "syncing"}
                className="btn flex items-center gap-1.5 bg-sky px-3 py-1.5 text-sm"
              >
                <RefreshCw size={16} {...icon} /> Synchroniser
              </button>
              <button
                onClick={() => {
                  sfx("click");
                  void logoutAccount();
                }}
                className="btn flex items-center gap-1.5 bg-paper px-3 py-1.5 text-sm"
              >
                <LogOut size={16} {...icon} /> Se déconnecter
              </button>
            </div>
          )}
        </>
      ) : m.isCurrent ? (
        <>
          <p className="mt-1 text-sm font-bold text-ink-soft">
            Retrouve tes étoiles et ton Cubo sur tous les appareils, avec ton
            pseudo et un code secret.
          </p>
          <button
            onClick={() => {
              m.setName(sel.name);
              m.go("link");
            }}
            className="btn mt-2 flex w-full items-center justify-center gap-1.5 bg-sun py-2"
          >
            <Cloud size={18} {...icon} /> Sauvegarder en ligne
          </button>
        </>
      ) : (
        <p className="mt-1 text-sm font-bold text-ink-soft">
          Pas encore sauvegardé en ligne. Joue avec {sel.name} pour l'activer.
        </p>
      )}
    </section>
  );
}
