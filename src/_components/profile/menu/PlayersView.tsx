"use client";
import { Check, Cloud, Plus } from "lucide-react";
import { StarIcon } from "@/_components/icons/Icon";
import { ICON_STROKE } from "@/lib/site";
import { Avatar, SPRITES } from "../Avatar";
import { MenuTitle } from "./fields";
import type { ProfileMenuState } from "./useProfileMenu";

/** Écran « Qui joue ? » : un bouton par joueur, et l'ajout d'un nouveau joueur. */
export function PlayersView({ m }: { m: ProfileMenuState }) {
  const newPlayer = () => {
    m.setName("");
    m.setAvatar(SPRITES[(m.list.length * 7) % SPRITES.length].id);
    m.setTab("new");
    m.setStep(0);
    m.go("new");
  };
  return (
    <>
      <MenuTitle>Qui joue ?</MenuTitle>
      <p className="mt-1 text-center text-sm font-bold text-ink-soft">
        Touche un joueur pour voir ses options.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {m.list.map((p) => {
          const cur = p.id === m.active.id;
          return (
            <li key={p.id}>
              <button
                onClick={() => m.openPlayer(p)}
                aria-label={`${p.name}${cur ? " (joueur en cours)" : ""} : voir les options`}
                className={`relative flex w-full flex-col items-center gap-1 rounded-3xl border-[3px] border-ink p-3 shadow-pop hover:-translate-y-0.5 ${cur ? "bg-mint" : "bg-paper"}`}
              >
                <Avatar id={p.avatar} size={52} />
                <span className="w-full truncate font-display text-lg font-bold">
                  {p.name}
                </span>
                <span className="flex items-center gap-1 text-sm font-extrabold">
                  <StarIcon size={14} /> {m.stars[p.id] ?? 0}
                </span>
                {p.cloud && (
                  <Cloud
                    size={18}
                    strokeWidth={ICON_STROKE}
                    className="absolute top-2 right-2"
                    aria-label="Sauvegardé en ligne"
                  />
                )}
                {cur && (
                  <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-paper">
                    <Check size={14} strokeWidth={3.5} aria-hidden="true" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
        <li>
          <button
            onClick={newPlayer}
            className="flex h-full min-h-33 w-full flex-col items-center justify-center gap-1 rounded-3xl border-[3px] border-dashed border-ink/40 bg-cream p-3 font-display font-bold hover:border-ink"
          >
            <Plus size={30} strokeWidth={3} aria-hidden="true" /> Nouveau joueur
          </button>
        </li>
      </ul>
    </>
  );
}
