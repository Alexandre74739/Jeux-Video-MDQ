"use client";
import { updateProfile, type Profile } from "@/lib/profiles";
import { sfx } from "@/lib/sound";
import { Avatar } from "../Avatar";
import { AvatarPicker } from "../AvatarPicker";
import { MenuTitle, inputCls, noAutofill } from "./fields";
import type { ProfileMenuState } from "./useProfileMenu";

/** Changer le nom ou l'avatar d'un joueur. */
export function EditView({ m, sel }: { m: ProfileMenuState; sel: Profile }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!m.name.trim()) return;
        updateProfile(sel.id, {
          name: m.name.trim().slice(0, 16),
          avatar: m.avatar,
        });
        sfx("pop");
        m.go("player");
      }}
    >
      <MenuTitle>Modifier</MenuTitle>
      <div className="mt-4 flex items-end gap-3">
        <span className="grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-cream">
          <Avatar id={m.avatar} size={48} />
        </span>
        <label className="block flex-1 font-display text-lg font-bold">
          Ton nom
          <input
            name="cubo-joueur"
            autoFocus
            value={m.name}
            maxLength={16}
            placeholder="Ex. : noob38"
            onChange={(e) => m.setName(e.target.value)}
            className={inputCls}
            {...noAutofill}
          />
        </label>
      </div>
      {sel.cloud && (
        <p className="mt-1 text-sm font-bold text-ink-soft">
          Ton pseudo en ligne reste « {sel.cloud.pseudo} ».
        </p>
      )}
      <p className="mt-4 mb-2 font-display text-lg font-bold">Ton avatar</p>
      <AvatarPicker value={m.avatar} onChange={m.setAvatar} />
      <button
        type="submit"
        disabled={!m.name.trim()}
        className="btn mt-5 w-full bg-mint py-3 text-xl disabled:opacity-50"
      >
        Enregistrer
      </button>
    </form>
  );
}
