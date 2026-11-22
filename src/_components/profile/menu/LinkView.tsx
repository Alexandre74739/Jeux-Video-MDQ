"use client";
import { createAccount } from "@/lib/profiles";
import { cleanPseudo } from "@/lib/cloud";
import { ERRORS } from "../errors";
import { CodePad } from "../CodePad";
import { BusyIcon, FormError, MenuTitle, inputCls, noAutofill } from "./fields";
import type { ProfileMenuState } from "./useProfileMenu";

/** Sauvegarder en ligne un joueur existant : pseudo + code secret. */
export function LinkView({ m }: { m: ProfileMenuState }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const p = cleanPseudo(m.name);
        if (!p) {
          m.setError(ERRORS.badPseudo);
          return;
        }
        if (m.codeDone) void m.run(() => createAccount(p, m.code), "player");
      }}
      autoComplete="off"
    >
      <MenuTitle>Sauvegarder en ligne</MenuTitle>
      <label className="mt-4 block font-display text-lg font-bold">
        Pseudo
        <input
          name="cubo-pseudo"
          value={m.name}
          maxLength={16}
          placeholder="Ex. : noob38"
          onChange={(e) => m.setName(e.target.value)}
          className={inputCls}
          {...noAutofill}
        />
      </label>
      <p className="mt-4 mb-2 font-display text-lg font-bold">
        Choisis ton code secret : 4 chiffres
      </p>
      <CodePad value={m.code} onChange={m.setCode} />
      {m.codeDone && (
        <p className="mt-3 rounded-2xl bg-sun/40 px-3 py-2 text-center text-sm font-bold">
          Retiens bien ton pseudo et ton code : ils te serviront sur les autres
          appareils.
        </p>
      )}
      <FormError error={m.error} />
      <button
        type="submit"
        disabled={m.busy || !m.codeDone || !m.pseudoOk}
        className="btn mt-5 flex w-full items-center justify-center gap-2 bg-mint py-3 text-xl disabled:opacity-50"
      >
        <BusyIcon busy={m.busy} /> Sauvegarder
      </button>
    </form>
  );
}
