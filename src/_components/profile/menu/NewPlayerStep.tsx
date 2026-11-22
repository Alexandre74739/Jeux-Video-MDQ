"use client";
import { Avatar } from "../Avatar";
import { AvatarPicker } from "../AvatarPicker";
import { CodePad } from "../CodePad";
import { inputCls, noAutofill } from "./fields";
import type { ProfileMenuState } from "./useProfileMenu";

/** Contenu de l'étape en cours : pseudo, avatar (nouveau joueur) ou code secret. */
export function NewPlayerStep({
  m,
  last,
}: {
  m: ProfileMenuState;
  last: boolean;
}) {
  const isNew = m.tab === "new";
  return (
    <>
      {m.step === 0 && (
        <>
          <label className="mt-4 block font-display text-lg font-bold">
            {isNew ? "Choisis ton pseudo" : "Ton pseudo"}
            <input
              name="cubo-pseudo"
              autoFocus
              value={m.name}
              maxLength={16}
              placeholder="Ex. : noob38"
              onChange={(e) => m.setName(e.target.value)}
              className={inputCls}
              {...noAutofill}
            />
          </label>
          {isNew && (
            <p className="mt-1 text-sm font-bold text-ink-soft">
              Invente un pseudo. N'écris pas ton vrai prénom, ton nom ni ton
              e-mail.{" "}
              <a href="/confidentialite/" className="underline">
                Ce qui est enregistré
              </a>
            </p>
          )}
        </>
      )}
      {isNew && m.step === 1 && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-cream">
              <Avatar id={m.avatar} size={48} />
            </span>
            <p className="font-display text-lg font-bold">
              Choisis ton avatar, {m.name.trim()} !
            </p>
          </div>
          <div className="mt-3">
            <AvatarPicker value={m.avatar} onChange={m.setAvatar} />
          </div>
        </>
      )}
      {last && (
        <>
          <p className="mt-4 font-display text-lg font-bold">
            {isNew ? "Un code secret ? (facultatif)" : "Ton code secret"}
          </p>
          {isNew && (
            <p className="mb-3 text-sm font-bold text-ink-soft">
              Avec un code de 4 chiffres, tu retrouves ta progression sur les
              autres appareils. Sans code, elle reste sur celui-ci.
            </p>
          )}
          <div className={isNew ? "" : "mt-3"}>
            <CodePad value={m.code} onChange={m.setCode} />
          </div>
        </>
      )}
    </>
  );
}
