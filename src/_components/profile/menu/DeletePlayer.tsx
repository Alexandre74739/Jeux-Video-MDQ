"use client";
import { Trash2 } from "lucide-react";
import { deleteProfile, type Profile } from "@/lib/profiles";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { errorText } from "../errors";
import type { ProfileMenuState } from "./useProfileMenu";

const icon = { strokeWidth: ICON_STROKE, "aria-hidden": true } as const;

/** Suppression d'un joueur de l'appareil (et, s'il le veut, de son compte en ligne), après confirmation. */
export function DeletePlayer({
  m,
  sel,
}: {
  m: ProfileMenuState;
  sel: Profile;
}) {
  if (!m.confirmDelete)
    return (
      <button
        onClick={() => {
          m.setConfirmDelete(true);
          sfx("click");
        }}
        className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-extrabold text-ink-soft underline hover:text-ink"
      >
        <Trash2 size={15} {...icon} />{" "}
        {sel.cloud
          ? "Déconnecter et supprimer de cet appareil"
          : "Supprimer de cet appareil"}
      </button>
    );

  const remove = async (everywhere: boolean) => {
    m.setBusy(true);
    m.setError(null);
    sfx("trash");
    try {
      await deleteProfile(sel.id, { everywhere });
      m.go("home");
    } catch (e) {
      m.setError(errorText(e));
    }
    m.setBusy(false);
  };

  return (
    <div
      className="mt-4 rounded-3xl border-[3px] border-ink bg-orange/30 p-4"
      role="alertdialog"
      aria-labelledby="del-title"
    >
      <p id="del-title" className="font-display text-lg font-bold">
        Supprimer {sel.name} de cet appareil ?
      </p>
      <p className="mt-1 text-sm font-bold">
        Ses étoiles, badges et programmes seront effacés de cet appareil.
        {sel.cloud
          ? " Il sera aussi déconnecté : sa sauvegarde en ligne reste disponible avec son pseudo et son code."
          : " Rien n'est sauvegardé en ligne : ce sera définitif."}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            m.setConfirmDelete(false);
            sfx("click");
          }}
          className="btn flex-1 bg-paper py-2"
        >
          Annuler
        </button>
        <button
          disabled={m.busy}
          onClick={() => remove(false)}
          className="btn flex flex-1 items-center justify-center gap-1.5 bg-orange py-2"
        >
          <Trash2 size={16} {...icon} /> Supprimer
        </button>
      </div>
      {sel.cloud && (
        <>
          <button
            disabled={m.busy}
            onClick={() => remove(true)}
            className="btn mt-2 flex w-full items-center justify-center gap-1.5 bg-coral py-2 text-sm"
          >
            <Trash2 size={16} {...icon} /> Supprimer aussi le compte en ligne
            (définitif)
          </button>
          {m.error && (
            <p className="mt-2 text-sm font-bold" role="alert">
              {m.error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
