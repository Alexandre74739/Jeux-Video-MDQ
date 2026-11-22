"use client";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { createPlayer, loginAccount } from "@/lib/profiles";
import { cleanPseudo } from "@/lib/cloud";
import { sfx } from "@/lib/sound";
import { ERRORS } from "../errors";
import { AccountTabs } from "./AccountTabs";
import { BusyIcon, FormError, MenuTitle } from "./fields";
import { NewPlayerStep } from "./NewPlayerStep";
import { StepDots } from "./StepDots";
import type { ProfileMenuState } from "./useProfileMenu";

/** Nouveau joueur, étape par étape (compte en ligne facultatif), ou connexion à un compte. */
export function NewPlayerView({ m }: { m: ProfileMenuState }) {
  const isNew = m.tab === "new";
  const steps = isNew
    ? ["Pseudo", "Avatar", "Code secret"]
    : ["Pseudo", "Code secret"];
  const last = m.step === steps.length - 1;

  const next = () => {
    m.setError(null);
    if (m.step === 0) {
      if (!m.name.trim()) return;
      if (!isNew && !m.pseudoOk) return m.setError(ERRORS.badPseudo);
    }
    sfx("click");
    m.setStep(m.step + 1);
  };
  const finish = (withCode: boolean) => {
    if (!isNew)
      return void m.run(() => loginAccount(cleanPseudo(m.name)!, m.code));
    if (withCode && !m.pseudoOk) return m.setError(ERRORS.badPseudo);
    const pseudo = cleanPseudo(m.name) ?? m.name.trim();
    void m.run(() =>
      createPlayer(pseudo, m.avatar, withCode ? m.code : undefined),
    );
  };

  return (
    <form
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        if (!last) next();
        else if (m.codeDone) finish(true);
      }}
    >
      <MenuTitle>{isNew ? "Nouveau joueur" : "Me connecter"}</MenuTitle>
      {m.step === 0 && <AccountTabs m={m} />}
      <StepDots steps={steps} step={m.step} />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${m.tab}-${m.step}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
        >
          <NewPlayerStep m={m} last={last} />
        </motion.div>
      </AnimatePresence>
      <FormError error={m.error} />
      {!last ? (
        <button
          type="submit"
          disabled={!m.name.trim()}
          className="btn mt-5 flex w-full items-center justify-center gap-2 bg-mint py-3 text-xl disabled:opacity-50"
        >
          Suivant <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
        </button>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="submit"
            disabled={m.busy || !m.codeDone}
            className="btn flex w-full items-center justify-center gap-2 bg-mint py-3 text-xl disabled:opacity-50"
          >
            <BusyIcon busy={m.busy} />
            {isNew ? "Créer avec ce code" : "Me connecter"}
          </button>
          {isNew && (
            <button
              type="button"
              disabled={m.busy}
              onClick={() => finish(false)}
              className="btn w-full bg-paper py-2.5"
            >
              Passer : jouer sans code
            </button>
          )}
        </div>
      )}
    </form>
  );
}
