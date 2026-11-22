"use client";
import { useCallback, useMemo, useState } from "react";
import {
  starsOf,
  useProfiles,
  useSyncStatus,
  type Profile,
} from "@/lib/profiles";
import { CODE_LENGTH, DEFAULT_AVATAR, cleanPseudo } from "@/lib/cloud";
import { sfx } from "@/lib/sound";
import { useEscape } from "@/hooks/useEscape";
import { errorText } from "../errors";

export type View = "home" | "player" | "edit" | "link" | "new";

/** État de la fenêtre des joueurs : écran affiché, joueur choisi, formulaire en cours. */
export function useProfileMenu() {
  const { list, active } = useProfiles();
  const status = useSyncStatus();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [selId, setSelId] = useState<string | null>(null);
  const [tab, setTab] = useState<"new" | "login">("new");
  const [step, setStep] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [code, setCode] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étoiles de chaque joueur, relues à chaque ouverture de la fenêtre.
  const stars = useMemo<Record<string, number>>(
    () =>
      open ? Object.fromEntries(list.map((p) => [p.id, starsOf(p.id)])) : {},
    [open, list],
  );

  const close = useCallback(() => {
    setOpen(false);
    setView("home");
    setError(null);
    setConfirmDelete(false);
  }, []);
  useEscape(close, open);

  const sel = list.find((p) => p.id === selId) ?? null;

  const go = (v: View) => {
    setView(v);
    setError(null);
    setCode([]);
    setConfirmDelete(false);
    sfx("click");
  };
  const show = () => {
    setOpen(true);
    setView("home");
    sfx("click");
  };
  const openPlayer = (p: Profile) => {
    setSelId(p.id);
    go("player");
  };

  /** Lance une action en ligne : son de réussite puis écran suivant, ou message d'erreur. */
  const run = async (f: () => Promise<void>, after: View = "home") => {
    setBusy(true);
    setError(null);
    try {
      await f();
      sfx("badge");
      go(after);
    } catch (e) {
      setError(errorText(e));
      sfx("bump");
      setCode([]);
    } finally {
      setBusy(false);
    }
  };

  return {
    list,
    active,
    status,
    open,
    view,
    sel,
    isCurrent: !!sel && sel.id === active.id,
    tab,
    step,
    confirmDelete,
    name,
    avatar,
    code,
    busy,
    error,
    stars,
    pseudoOk: !!cleanPseudo(name),
    codeDone: code.length === CODE_LENGTH,
    setTab,
    setStep,
    setConfirmDelete,
    setName,
    setAvatar,
    setCode,
    setBusy,
    setError,
    go,
    show,
    close,
    openPlayer,
    run,
  };
}

export type ProfileMenuState = ReturnType<typeof useProfileMenu>;
