"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Cloud, CloudOff, Delete, ImagePlus, LogIn, LogOut, Pencil, Play, Plus, RefreshCw, Trash2, UserPlus, X } from "lucide-react";
import { StarIcon } from "./Icon";
import {
  CloudError, createAccount, createPlayer, deleteProfile, loginAccount, logoutAccount, starsOf, switchProfile,
  syncNow, updateProfile, useProfiles, useSyncStatus, type Profile,
} from "@/lib/profiles";
import { CODE_LENGTH, DEFAULT_AVATAR, cleanPseudo } from "@/lib/cloud";
import LIBRARY from "@/lib/sprites.json";
import { sfx } from "@/lib/sound";

type View = "home" | "player" | "edit" | "link" | "new";
type Sprite = { id: string; name: string; category: string; src: string };
const SPRITES = (LIBRARY as Sprite[]).filter((s) => s.id !== "coffre");
const CATEGORIES = [...new Set(SPRITES.map((s) => s.category))];

/** Avatar : personnage de la bibliothèque (id) ou photo importée (data:…), toujours dans un rond. */
export function Avatar({ id, size = 40 }: { id: string; size?: number }) {
  const photo = id.startsWith("data:");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo ? id : `/sprites/${id}.svg`} alt="" width={size} height={size} draggable={false}
      className={`select-none ${photo ? "rounded-full border-2 border-ink object-cover" : ""}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Photo réduite en carré de 128 px (JPEG léger), centrée : elle reste uniquement sur l'appareil. */
async function photoAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.width, img.height);
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    c.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 128, 128);
    return c.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const ERRORS: Record<string, string> = {
  offline: "Pas de connexion internet. Réessaie quand tu es connecté.",
  unavailable: "La sauvegarde en ligne n'est pas disponible pour le moment.",
  taken: "Ce pseudo est déjà pris. Choisis-en un autre !",
  unknown: "Aucun compte avec ce pseudo. Vérifie l'orthographe.",
  badCode: "Ce n'est pas le bon code secret.",
  badPseudo: "Le pseudo doit faire de 3 à 16 lettres ou chiffres.",
  server: "Oups, un problème est survenu. Réessaie dans un instant.",
};
function errorText(e: unknown) {
  if (!(e instanceof CloudError)) return ERRORS.server;
  if (e.code === "locked") return `Trop d'essais ratés. Réessaie dans ${e.info.retryIn ?? 15} minutes.`;
  if (e.code === "badCode" && typeof e.info.left === "number") return `Ce n'est pas le bon code secret. Encore ${e.info.left} essai${e.info.left > 1 ? "s" : ""}.`;
  return ERRORS[e.code] ?? ERRORS.server;
}

/** Champ texte sans saisie automatique du navigateur (pas d'e-mail proposé à la place du pseudo). */
const noAutofill = { autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: false, "data-1p-ignore": true, "data-lpignore": "true", "data-form-type": "other" } as const;
const inputCls = "mt-1 w-full rounded-2xl border-[3px] border-ink bg-cream px-4 py-2.5 text-xl font-bold outline-none placeholder:font-semibold placeholder:text-ink/35 focus:bg-paper";

/** Choix d'un avatar : tous les personnages de la création libre, par catégorie, ou une photo. */
function AvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [cat, setCat] = useState(CATEGORIES[0]);
  const file = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Catégories d'avatars">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => { setCat(c); sfx("click"); }}
            className={`rounded-full border-2 border-ink px-3 py-0.5 text-sm font-extrabold ${cat === c ? "bg-grape text-white" : "bg-paper"}`}>
            {c}
          </button>
        ))}
        <button type="button" onClick={() => file.current?.click()} className="flex items-center gap-1 rounded-full border-2 border-ink bg-sun px-3 py-0.5 text-sm font-extrabold">
          <ImagePlus size={15} strokeWidth={2.75} aria-hidden="true" /> Ma photo
        </button>
        <input
          ref={file} type="file" accept="image/*" className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try { onChange(await photoAvatar(f)); setPhotoError(false); sfx("pop"); } catch { setPhotoError(true); }
          }}
        />
      </div>
      {photoError && <p className="mt-2 text-sm font-bold text-[#D9473A]">Cette image n'a pas pu être ouverte.</p>}
      {value.startsWith("data:") && (
        <p className="mt-2 flex items-center gap-2 text-sm font-bold text-ink-soft">
          <Avatar id={value} size={36} /> Ta photo reste sur cet appareil : elle n'est jamais envoyée en ligne.
        </p>
      )}
      <div className="mt-2 grid max-h-52 grid-cols-6 gap-1.5 overflow-y-auto rounded-2xl bg-cream p-2 sm:grid-cols-7" role="radiogroup" aria-label={`Avatars : ${cat}`}>
        {SPRITES.filter((s) => s.category === cat).map((s) => (
          <button
            key={s.id} type="button" role="radio" aria-checked={value === s.id} aria-label={s.name} title={s.name}
            onClick={() => { onChange(s.id); sfx("pop"); }}
            className={`grid aspect-square place-items-center rounded-2xl border-[3px] p-1 ${value === s.id ? "border-ink bg-sun" : "border-transparent bg-paper hover:border-ink/30"}`}
          >
            <Avatar id={s.id} size={34} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Code secret : 4 chiffres tapés sur un pavé numérique géant. */
function CodePad({ value, onChange }: { value: string[]; onChange: (c: string[]) => void }) {
  const add = (d: string) => { if (value.length < CODE_LENGTH) { onChange([...value, d]); sfx("pop"); } };
  return (
    <div>
      <div className="flex items-center justify-center gap-2" aria-live="polite" aria-label={`Code : ${value.length} chiffre${value.length > 1 ? "s" : ""} sur ${CODE_LENGTH}`}>
        {Array.from({ length: CODE_LENGTH }, (_, i) => (
          <span key={i} className={`grid size-14 place-items-center rounded-2xl border-[3px] font-display text-3xl font-bold ${value[i] ? "border-ink bg-paper" : "border-dashed border-ink/30 bg-cream"}`}>
            {value[i] && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>{value[i]}</motion.span>}
          </span>
        ))}
      </div>
      <div className="mx-auto mt-3 grid max-w-[240px] grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <motion.button key={d} type="button" whileTap={{ scale: 0.88 }} onClick={() => add(d)}
            className="btn aspect-[4/3] bg-paper font-display text-2xl">{d}</motion.button>
        ))}
        <span />
        <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => add("0")} className="btn aspect-[4/3] bg-paper font-display text-2xl">0</motion.button>
        <motion.button
          type="button" whileTap={{ scale: 0.88 }} onClick={() => { onChange(value.slice(0, -1)); sfx("click"); }} disabled={!value.length}
          className="btn grid aspect-[4/3] place-items-center bg-cream disabled:opacity-40" aria-label="Effacer le dernier chiffre"
        >
          <Delete size={22} strokeWidth={2.75} aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
}

function ago(t?: number) {
  if (!t) return "";
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "à l'instant" : m < 60 ? `il y a ${m} min` : `il y a ${Math.round(m / 60)} h`;
}

/** Bouton « joueur » (avatar) des en-têtes + fenêtre des joueurs : on touche une carte pour voir ses options. */
export default function ProfileMenu() {
  const { list, active } = useProfiles();
  const status = useSyncStatus();
  const [mounted, setMounted] = useState(false);
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
  const [stars, setStars] = useState<Record<string, number>>({});

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setStars(Object.fromEntries(list.map((p) => [p.id, starsOf(p.id)])));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, list]);

  const sel = list.find((p) => p.id === selId) ?? null;
  const isCurrent = !!sel && sel.id === active.id;

  const go = (v: View) => { setView(v); setError(null); setCode([]); setConfirmDelete(false); sfx("click"); };
  const close = () => { setOpen(false); setView("home"); setError(null); setConfirmDelete(false); };
  const openPlayer = (p: Profile) => { setSelId(p.id); go("player"); };

  const run = async (f: () => Promise<void>, after: View = "home") => {
    setBusy(true);
    setError(null);
    try { await f(); sfx("badge"); go(after); } catch (e) { setError(errorText(e)); sfx("bump"); setCode([]); } finally { setBusy(false); }
  };

  const dot = !active.cloud ? null : status === "ok" ? "bg-mint" : status === "syncing" ? "bg-sun" : status === "off" ? null : "bg-orange";
  const syncText = status === "syncing" ? "Synchronisation…" : status === "offline" ? "Hors-ligne : ta progression sera envoyée plus tard." : status === "error" ? "La synchronisation a échoué." : `Synchronisé ${ago(active.cloud?.syncedAt)}.`;

  const pseudoOk = !!cleanPseudo(name);
  const codeDone = code.length === CODE_LENGTH;

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex justify-center overflow-y-auto bg-ink/50 px-4 py-6 sm:items-center"
          onPointerDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            role="dialog" aria-modal="true" aria-labelledby="profile-title"
            className="relative h-fit w-[500px] max-w-full rounded-[32px] border-[3px] border-ink bg-paper p-5 text-left text-ink shadow-pop-xl sm:p-6"
          >
            <button onClick={close} className="absolute top-3 right-3 grid size-10 place-items-center rounded-full hover:bg-cream" aria-label="Fermer">
              <X size={22} strokeWidth={3} aria-hidden="true" />
            </button>
            {view !== "home" && (
              <button onClick={() => { if (view === "new" && step > 0) { setStep(step - 1); setError(null); sfx("click"); } else go(view === "edit" || view === "link" ? "player" : "home"); }} className="absolute top-3 left-3 grid size-10 place-items-center rounded-full hover:bg-cream" aria-label="Retour">
                <ArrowLeft size={22} strokeWidth={3} aria-hidden="true" />
              </button>
            )}

            {/* ---------------------------------------------------------- Liste des joueurs */}
            {view === "home" && (
              <>
                <h2 id="profile-title" className="text-center text-3xl font-bold">Qui joue ?</h2>
                <p className="mt-1 text-center text-sm font-bold text-ink-soft">Touche un joueur pour voir ses options.</p>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {list.map((p) => {
                    const cur = p.id === active.id;
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => openPlayer(p)}
                          aria-label={`${p.name}${cur ? " (joueur en cours)" : ""} : voir les options`}
                          className={`relative flex w-full flex-col items-center gap-1 rounded-3xl border-[3px] border-ink p-3 shadow-pop hover:-translate-y-0.5 ${cur ? "bg-mint" : "bg-paper"}`}
                        >
                          <Avatar id={p.avatar} size={52} />
                          <span className="w-full truncate font-display text-lg font-bold">{p.name}</span>
                          <span className="flex items-center gap-1 text-sm font-extrabold"><StarIcon size={14} /> {stars[p.id] ?? 0}</span>
                          {p.cloud && <Cloud size={18} strokeWidth={2.75} className="absolute top-2 right-2" aria-label="Sauvegardé en ligne" />}
                          {cur && <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-paper"><Check size={14} strokeWidth={3.5} aria-hidden="true" /></span>}
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      onClick={() => { setName(""); setAvatar(SPRITES[(list.length * 7) % SPRITES.length].id); setTab("new"); setStep(0); go("new"); }}
                      className="flex h-full min-h-[132px] w-full flex-col items-center justify-center gap-1 rounded-3xl border-[3px] border-dashed border-ink/40 bg-cream p-3 font-display font-bold hover:border-ink"
                    >
                      <Plus size={30} strokeWidth={3} aria-hidden="true" /> Nouveau joueur
                    </button>
                  </li>
                </ul>
              </>
            )}

            {/* ---------------------------------------------------------- Options d'un joueur */}
            {view === "player" && sel && (
              <>
                <div className="flex flex-col items-center text-center">
                  <span className="grid size-24 place-items-center rounded-full border-[3px] border-ink bg-cream"><Avatar id={sel.avatar} size={72} /></span>
                  <h2 id="profile-title" className="mt-2 text-3xl font-bold">{sel.name}</h2>
                  <p className="flex items-center gap-1 font-extrabold"><StarIcon size={16} /> {stars[sel.id] ?? 0} étoiles{isCurrent ? " · en train de jouer" : ""}</p>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  {!isCurrent && (
                    <button onClick={() => { sfx("click"); switchProfile(sel.id); }} className="btn flex items-center justify-center gap-2 bg-mint py-3 text-xl">
                      <Play size={22} strokeWidth={2.75} fill="#16123A" aria-hidden="true" /> Jouer avec {sel.name}
                    </button>
                  )}
                  <button onClick={() => { setName(sel.name); setAvatar(sel.avatar); go("edit"); }} className="btn flex items-center justify-center gap-2 bg-paper py-2.5">
                    <Pencil size={18} strokeWidth={2.75} aria-hidden="true" /> Changer le nom ou l'avatar
                  </button>
                </div>

                <section className="mt-4 rounded-3xl bg-cream p-4">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                    {sel.cloud ? <Cloud size={20} strokeWidth={2.75} aria-hidden="true" /> : <CloudOff size={20} strokeWidth={2.75} aria-hidden="true" />}
                    Sauvegarde en ligne
                  </h3>
                  {sel.cloud ? (
                    <>
                      <p className="mt-1 text-sm font-bold">Compte : <strong>{sel.cloud.pseudo}</strong>.{isCurrent && <span className="text-ink-soft"> {syncText}</span>}</p>
                      {isCurrent && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button onClick={() => { sfx("click"); void syncNow(); }} disabled={status === "syncing"} className="btn flex items-center gap-1.5 bg-sky px-3 py-1.5 text-sm">
                            <RefreshCw size={16} strokeWidth={2.75} aria-hidden="true" /> Synchroniser
                          </button>
                          <button onClick={() => { sfx("click"); void logoutAccount(); }} className="btn flex items-center gap-1.5 bg-paper px-3 py-1.5 text-sm">
                            <LogOut size={16} strokeWidth={2.75} aria-hidden="true" /> Se déconnecter
                          </button>
                        </div>
                      )}
                    </>
                  ) : isCurrent ? (
                    <>
                      <p className="mt-1 text-sm font-bold text-ink-soft">Retrouve tes étoiles et ton Cubo sur tous les appareils, avec ton pseudo et un code secret.</p>
                      <button onClick={() => { setName(sel.name); go("link"); }} className="btn mt-2 flex w-full items-center justify-center gap-1.5 bg-sun py-2">
                        <Cloud size={18} strokeWidth={2.75} aria-hidden="true" /> Sauvegarder en ligne
                      </button>
                    </>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-ink-soft">Pas encore sauvegardé en ligne. Joue avec {sel.name} pour l'activer.</p>
                  )}
                </section>

                {confirmDelete ? (
                  <div className="mt-4 rounded-3xl border-[3px] border-ink bg-orange/30 p-4" role="alertdialog" aria-labelledby="del-title">
                    <p id="del-title" className="font-display text-lg font-bold">Supprimer {sel.name} de cet appareil ?</p>
                    <p className="mt-1 text-sm font-bold">
                      Ses étoiles, badges et programmes seront effacés de cet appareil.
                      {sel.cloud ? " Il sera aussi déconnecté : sa sauvegarde en ligne reste disponible avec son pseudo et son code." : " Rien n'est sauvegardé en ligne : ce sera définitif."}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { setConfirmDelete(false); sfx("click"); }} className="btn flex-1 bg-paper py-2">Annuler</button>
                      <button
                        disabled={busy}
                        onClick={async () => { setBusy(true); sfx("trash"); await deleteProfile(sel.id); setBusy(false); go("home"); }}
                        className="btn flex flex-1 items-center justify-center gap-1.5 bg-orange py-2"
                      >
                        <Trash2 size={16} strokeWidth={2.75} aria-hidden="true" /> Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setConfirmDelete(true); sfx("click"); }} className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-extrabold text-ink-soft underline hover:text-ink">
                    <Trash2 size={15} strokeWidth={2.75} aria-hidden="true" /> {sel.cloud ? "Déconnecter et supprimer de cet appareil" : "Supprimer de cet appareil"}
                  </button>
                )}
              </>
            )}

            {/* ---------------------------------------------------------- Modifier */}
            {view === "edit" && sel && (
              <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; updateProfile(sel.id, { name: name.trim().slice(0, 16), avatar }); sfx("pop"); go("player"); }}>
                <h2 id="profile-title" className="text-center text-3xl font-bold">Modifier</h2>
                <div className="mt-4 flex items-end gap-3">
                  <span className="grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-cream"><Avatar id={avatar} size={48} /></span>
                  <label className="block flex-1 font-display text-lg font-bold">
                    Ton nom
                    <input name="cubo-joueur" autoFocus value={name} maxLength={16} placeholder="Ex. : noob38" onChange={(e) => setName(e.target.value)} className={inputCls} {...noAutofill} />
                  </label>
                </div>
                {sel.cloud && <p className="mt-1 text-sm font-bold text-ink-soft">Ton pseudo en ligne reste « {sel.cloud.pseudo} ».</p>}
                <p className="mt-4 mb-2 font-display text-lg font-bold">Ton avatar</p>
                <AvatarPicker value={avatar} onChange={setAvatar} />
                <button type="submit" disabled={!name.trim()} className="btn mt-5 w-full bg-mint py-3 text-xl disabled:opacity-50">Enregistrer</button>
              </form>
            )}

            {/* ---------------------------------------------------------- Sauvegarder en ligne un joueur existant */}
            {view === "link" && sel && (
              <form onSubmit={(e) => { e.preventDefault(); const p = cleanPseudo(name); if (!p) { setError(ERRORS.badPseudo); return; } if (codeDone) void run(() => createAccount(p, code), "player"); }} autoComplete="off">
                <h2 id="profile-title" className="text-center text-3xl font-bold">Sauvegarder en ligne</h2>
                <label className="mt-4 block font-display text-lg font-bold">
                  Pseudo
                  <input name="cubo-pseudo" value={name} maxLength={16} placeholder="Ex. : noob38" onChange={(e) => setName(e.target.value)} className={inputCls} {...noAutofill} />
                </label>
                <p className="mt-4 mb-2 font-display text-lg font-bold">Choisis ton code secret : 4 chiffres</p>
                <CodePad value={code} onChange={setCode} />
                {codeDone && <p className="mt-3 rounded-2xl bg-sun/40 px-3 py-2 text-center text-sm font-bold">Retiens bien ton pseudo et ton code : ils te serviront sur les autres appareils.</p>}
                {error && <p className="mt-3 rounded-2xl bg-orange/40 px-3 py-2 text-center font-bold" role="alert">{error}</p>}
                <button type="submit" disabled={busy || !codeDone || !pseudoOk} className="btn mt-5 flex w-full items-center justify-center gap-2 bg-mint py-3 text-xl disabled:opacity-50">
                  {busy ? <RefreshCw size={22} strokeWidth={2.75} className="animate-spin" aria-hidden="true" /> : <Check size={22} strokeWidth={3} aria-hidden="true" />} Sauvegarder
                </button>
              </form>
            )}

            {/* ---------------------------------------------------------- Nouveau joueur, étape par étape (compte en ligne facultatif) */}
            {view === "new" && (() => {
              const steps = tab === "new" ? ["Pseudo", "Avatar", "Code secret"] : ["Pseudo", "Code secret"];
              const last = step === steps.length - 1;
              const next = () => {
                setError(null);
                if (step === 0) {
                  if (!name.trim()) return;
                  if (tab === "login" && !pseudoOk) { setError(ERRORS.badPseudo); return; }
                }
                sfx("click");
                setStep(step + 1);
              };
              const finish = (withCode: boolean) => {
                if (tab === "new") {
                  if (withCode && !pseudoOk) { setError(ERRORS.badPseudo); return; }
                  void run(() => createPlayer(cleanPseudo(name) ?? name.trim(), avatar, withCode ? code : undefined));
                } else void run(() => loginAccount(cleanPseudo(name)!, code));
              };
              return (
                <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); if (!last) next(); else if (codeDone) finish(true); }}>
                  <h2 id="profile-title" className="text-center text-3xl font-bold">{tab === "new" ? "Nouveau joueur" : "Me connecter"}</h2>

                  {/* Choix nouveau / déjà un compte : seulement au début */}
                  {step === 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2" role="tablist">
                      <button type="button" role="tab" aria-selected={tab === "new"} onClick={() => { setTab("new"); setError(null); setCode([]); sfx("click"); }} className={`btn py-2 text-sm sm:text-base ${tab === "new" ? "bg-grape text-white" : "bg-paper"}`}>
                        <UserPlus size={17} strokeWidth={2.75} className="mr-1 inline" aria-hidden="true" /> Je suis nouveau
                      </button>
                      <button type="button" role="tab" aria-selected={tab === "login"} onClick={() => { setTab("login"); setError(null); setCode([]); sfx("click"); }} className={`btn py-2 text-sm sm:text-base ${tab === "login" ? "bg-grape text-white" : "bg-paper"}`}>
                        <LogIn size={17} strokeWidth={2.75} className="mr-1 inline" aria-hidden="true" /> J'ai déjà un compte
                      </button>
                    </div>
                  )}

                  {/* Progression */}
                  <ol className="mt-4 flex items-center justify-center gap-2" aria-label={`Étape ${step + 1} sur ${steps.length} : ${steps[step]}`}>
                    {steps.map((s, i) => (
                      <li key={s} className="flex items-center gap-2">
                        {i > 0 && <span className={`h-[3px] w-6 rounded-full ${i <= step ? "bg-ink" : "bg-ink/20"}`} aria-hidden="true" />}
                        <span className={`grid size-8 place-items-center rounded-full border-[3px] font-display text-sm font-bold ${i < step ? "border-ink bg-mint" : i === step ? "border-ink bg-sun" : "border-ink/25 text-ink/40"}`} title={s}>
                          {i < step ? <Check size={14} strokeWidth={3.5} aria-hidden="true" /> : i + 1}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <AnimatePresence mode="wait">
                    <motion.div key={`${tab}-${step}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
                      {step === 0 && (
                        <>
                          <label className="mt-4 block font-display text-lg font-bold">
                            {tab === "new" ? "Choisis ton pseudo" : "Ton pseudo"}
                            <input name="cubo-pseudo" autoFocus value={name} maxLength={16} placeholder="Ex. : noob38" onChange={(e) => setName(e.target.value)} className={inputCls} {...noAutofill} />
                          </label>
                          {tab === "new" && <p className="mt-1 text-sm font-bold text-ink-soft">Invente un pseudo. N'écris pas ton nom de famille ni ton e-mail !</p>}
                        </>
                      )}

                      {tab === "new" && step === 1 && (
                        <>
                          <div className="mt-4 flex items-center gap-3">
                            <span className="grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-cream"><Avatar id={avatar} size={48} /></span>
                            <p className="font-display text-lg font-bold">Choisis ton avatar, {name.trim()} !</p>
                          </div>
                          <div className="mt-3"><AvatarPicker value={avatar} onChange={setAvatar} /></div>
                        </>
                      )}

                      {last && (
                        <>
                          <p className="mt-4 font-display text-lg font-bold">{tab === "new" ? "Un code secret ? (facultatif)" : "Ton code secret"}</p>
                          {tab === "new" && <p className="mb-3 text-sm font-bold text-ink-soft">Avec un code de 4 chiffres, tu retrouves ta progression sur les autres appareils. Sans code, elle reste sur celui-ci.</p>}
                          <div className={tab === "login" ? "mt-3" : ""}><CodePad value={code} onChange={setCode} /></div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {error && <p className="mt-3 rounded-2xl bg-orange/40 px-3 py-2 text-center font-bold" role="alert">{error}</p>}

                  {!last ? (
                    <button type="submit" disabled={!name.trim()} className="btn mt-5 flex w-full items-center justify-center gap-2 bg-mint py-3 text-xl disabled:opacity-50">
                      Suivant <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="mt-5 flex flex-col gap-2">
                      <button type="submit" disabled={busy || !codeDone} className="btn flex w-full items-center justify-center gap-2 bg-mint py-3 text-xl disabled:opacity-50">
                        {busy ? <RefreshCw size={22} strokeWidth={2.75} className="animate-spin" aria-hidden="true" /> : <Check size={22} strokeWidth={3} aria-hidden="true" />}
                        {tab === "login" ? "Me connecter" : "Créer avec ce code"}
                      </button>
                      {tab === "new" && (
                        <button type="button" disabled={busy} onClick={() => finish(false)} className="btn w-full bg-paper py-2.5">
                          Passer : jouer sans code
                        </button>
                      )}
                    </div>
                  )}
                </form>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => { setOpen(true); setView("home"); sfx("click"); }}
        className="btn relative grid size-11 shrink-0 place-items-center bg-paper p-0"
        aria-label={`Joueur : ${active.name}. Changer de joueur ou sauvegarder en ligne`}
        title={active.name}
      >
        <Avatar id={active.avatar} size={30} />
        {dot && <span className={`absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-ink ${dot}`} aria-hidden="true" />}
      </button>
      {/* Fenêtre rendue dans <body> : un en-tête avec flou (backdrop-filter) ne peut plus l'enfermer. */}
      {mounted && createPortal(dialog, document.body)}
    </>
  );
}
