"use client";
import { AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/useMounted";
import { Avatar } from "./Avatar";
import { ProfileDialog } from "./menu/ProfileDialog";
import { useProfileMenu } from "./menu/useProfileMenu";

/** Pastille sur l'avatar selon l'état de la sauvegarde en ligne (orange : problème). */
const DOT: Record<string, string | null> = {
  ok: "bg-mint",
  syncing: "bg-sun",
  off: null,
};

/** Bouton « joueur » (avatar) des en-têtes + fenêtre des joueurs : on touche une carte pour voir ses options. */
export default function ProfileMenu() {
  const m = useProfileMenu();
  const mounted = useMounted();
  const { active } = m;
  const dot = active.cloud
    ? m.status in DOT
      ? DOT[m.status]
      : "bg-orange"
    : null;

  return (
    <>
      <button
        onClick={m.show}
        className="btn relative grid size-11 shrink-0 place-items-center bg-paper p-0"
        aria-label={`Joueur : ${active.name}. Changer de joueur ou sauvegarder en ligne`}
        title={active.name}
      >
        <Avatar id={active.avatar} size={30} />
        {dot && (
          <span
            className={`absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-ink ${dot}`}
            aria-hidden="true"
          />
        )}
      </button>
      {/* Fenêtre rendue dans <body> : un en-tête avec flou (backdrop-filter) ne peut plus l'enfermer. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {m.open && <ProfileDialog m={m} />}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
