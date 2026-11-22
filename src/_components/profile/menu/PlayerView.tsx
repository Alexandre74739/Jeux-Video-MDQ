"use client";
import { Pencil, Play } from "lucide-react";
import { StarIcon } from "@/_components/icons/Icon";
import { switchProfile, type Profile } from "@/lib/profiles";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { Avatar } from "../Avatar";
import { CloudSection } from "./CloudSection";
import { DeletePlayer } from "./DeletePlayer";
import type { ProfileMenuState } from "./useProfileMenu";

/** Options d'un joueur : jouer avec lui, le modifier, sa sauvegarde en ligne, le supprimer. */
export function PlayerView({ m, sel }: { m: ProfileMenuState; sel: Profile }) {
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <span className="grid size-24 place-items-center rounded-full border-[3px] border-ink bg-cream">
          <Avatar id={sel.avatar} size={72} />
        </span>
        <h2 id="profile-title" className="mt-2 text-3xl font-bold">
          {sel.name}
        </h2>
        <p className="flex items-center gap-1 font-extrabold">
          <StarIcon size={16} /> {m.stars[sel.id] ?? 0} étoiles
          {m.isCurrent ? " · en train de jouer" : ""}
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {!m.isCurrent && (
          <button
            onClick={() => {
              sfx("click");
              switchProfile(sel.id);
            }}
            className="btn flex items-center justify-center gap-2 bg-mint py-3 text-xl"
          >
            <Play
              size={22}
              strokeWidth={ICON_STROKE}
              fill="#16123A"
              aria-hidden="true"
            />{" "}
            Jouer avec {sel.name}
          </button>
        )}
        <button
          onClick={() => {
            m.setName(sel.name);
            m.setAvatar(sel.avatar);
            m.go("edit");
          }}
          className="btn flex items-center justify-center gap-2 bg-paper py-2.5"
        >
          <Pencil size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Changer le nom ou l'avatar
        </button>
      </div>
      <CloudSection m={m} sel={sel} />
      <DeletePlayer m={m} sel={sel} />
    </>
  );
}
