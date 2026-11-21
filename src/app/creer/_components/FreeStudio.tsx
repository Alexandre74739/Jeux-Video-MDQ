"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BlockEditor from "@/_components/game/BlockEditor";
import { BumpNumber } from "@/_components/animations/BumpNumber";
import { Confetti } from "@/_components/animations/Confetti";

import { Logo } from "@/_components/ui/Logo";
import { SoundToggle } from "@/_components/ui/SoundToggle";
import { StarIcon } from "@/_components/icons/Icon";
import BackButton from "@/_components/ui/BackButton";
import { Download, FolderOpen, Map as MapIcon, Palette, PartyPopper, Play, Plus, RotateCcw, Square, Trash2, WandSparkles } from "lucide-react";
import { BLOCKS, newId, type Category } from "@/lib/blocks";
import { sanitizeProject } from "@/lib/project";

import { BACKGROUNDS, BASE, Runtime, STAGE_H, STAGE_W, type Project, type SpriteDef } from "@/lib/runtime";
import { load, save } from "@/lib/storage";
import { sfx } from "@/lib/sound";

import { SpriteLibrary } from "./SpriteLibrary";
import { starter } from "./starter";
import { ICON_STROKE } from "@/lib/site";

const GROUPS: { category: Category; types: string[] }[] = [
  { category: "event", types: ["ev_start", "ev_key", "ev_click", "ev_touch"] },
  { category: "motion", types: ["avancer", "gauche", "droite", "demitour", "sauter", "move", "random", "goto_center"] },
  { category: "action", types: ["ramasser", "casser", "ouvrir", "pont", "frapper"] },
  { category: "looks", types: ["say", "grow", "shrink", "spin", "hide", "show"] },
  { category: "sound", types: ["sound"] },
  { category: "control", types: ["wait", "attendre", "repeat", "forever", "jusqua", "if_touch", "si", "sisinon"] },
  { category: "score", types: ["score_add", "score_reset", "win", "lose"] },
];

export default function FreeStudio() {
  const [project, setProject] = useState<Project | null>(null);
  const [sel, setSel] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [, setFrame] = useState(0);
  const [ended, setEnded] = useState<"win" | "lose" | null>(null);
  const [libOpen, setLibOpen] = useState(false);
  const [notice, setNotice] = useState<{ text: string; key: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [scale, setScale] = useState(1);
  const rt = useRef<Runtime | null>(null);
  const raf = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = load<Project | null>("project", null) ?? starter();
    setProject(p);
    setSel(p.sprites[0]?.id ?? "");
  }, []);

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => save("project", project), 400);
    return () => clearTimeout(t);
  }, [project]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, [project === null]);

  const notify = useCallback((text: string) => setNotice({ text, key: Date.now() }), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const stopGame = useCallback(() => {
    cancelAnimationFrame(raf.current);
    rt.current = null;
    setRunning(false);
    setEnded(null);
  }, []);

  const play = () => {
    if (!project) return;
    cancelAnimationFrame(raf.current);
    setEnded(null);
    const r = new Runtime(project, (res) => {
      setEnded(res);
      if (res === "win") { sfx("win"); setConfetti((c) => c + 1); } else sfx("fail");
    });
    rt.current = r;
    setRunning(true);
    r.green();
    const loop = (t: number) => {
      r.tick(t);
      setFrame((f) => f + 1);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    stageRef.current?.focus();
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
        rt.current?.key(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  const sprite = project?.sprites.find((s) => s.id === sel);
  const updateSprite = useCallback((id: string, patch: Partial<SpriteDef>) => {
    setProject((p) => p && { ...p, sprites: p.sprites.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }, []);

  const others = useMemo(
    () => (project?.sprites ?? []).filter((s) => s.id !== sel).map((s) => ({ id: s.id, name: s.name })),
    [project, sel]
  );

  const addSprite = (name: string, src: string) => {
    if (!project) return;
    let n = name;
    let k = 2;
    while (project.sprites.some((s) => s.name === n)) n = `${name} ${k++}`;
    const s: SpriteDef = {
      id: newId(), name: n, src, size: 100, scripts: [],
      x: 60 + Math.random() * (STAGE_W - 120), y: 60 + Math.random() * (STAGE_H - 120),
    };
    setProject({ ...project, sprites: [...project.sprites, s] });
    setSel(s.id);
    setLibOpen(false);
    sfx("magic");
  };

  const removeSprite = (id: string) => {
    if (!project || project.sprites.length <= 1) return;
    const sp = project.sprites.find((s) => s.id === id);
    if (!window.confirm(`Supprimer « ${sp?.name} » et ses blocs ?`)) return;
    const rest = project.sprites.filter((s) => s.id !== id);
    setProject({ ...project, sprites: rest });
    setSel(rest[0].id);
    sfx("trash");
  };

  const download = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mon-jeu.cubocode.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    sfx("coin");
    notify("Ton jeu est téléchargé !");
  };

  const openFile = async (f: File) => {
    try {
      const p = sanitizeProject(JSON.parse(await f.text()), (t) => t in BLOCKS, (id) => BACKGROUNDS.some((b) => b.id === id));
      if (!p) throw new Error();
      stopGame();
      setProject(p);
      setSel(p.sprites[0].id);
      sfx("magic");
      notify("Jeu ouvert !");
    } catch {
      sfx("bump");
      notify("Oups, ce fichier n'est pas un jeu CuboCode.");
    }
  };

  // Glisser les personnages sur la scène (quand le jeu est arrêté)
  const dragSprite = (e: React.PointerEvent, s: SpriteDef) => {
    if (running) { rt.current?.click(s.id); return; }
    e.preventDefault();
    setSel(s.id);
    sfx("pick");
    const stage = stageRef.current!.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const x = Math.max(0, Math.min(STAGE_W, (ev.clientX - stage.left) / scale));
      const y = Math.max(0, Math.min(STAGE_H, (ev.clientY - stage.top) / scale));
      updateSprite(s.id, { x: Math.round(x), y: Math.round(y) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      sfx("snap");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!project) return <div className="grid h-dvh place-items-center bg-cream font-display text-2xl">Chargement…</div>;
  const bg = BACKGROUNDS.find((b) => b.id === project.bg) ?? BACKGROUNDS[0];
  const r = rt.current;

  return (
    <div className="flex min-h-dvh flex-col bg-cream lg:h-dvh lg:min-h-[620px] lg:overflow-hidden">
      <Confetti fire={confetti} />
      <header className="sticky top-0 z-40 flex min-h-[72px] shrink-0 flex-wrap items-center gap-2 border-b-[3px] border-ink bg-paper px-3 py-2 sm:gap-3 sm:px-4">
        <BackButton fallback="/" />
        <Logo small />
        <span className="toon ml-2 hidden items-center gap-2 rounded-full bg-pink md:flex px-3 py-1 font-display text-lg font-bold"><Palette size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /> Création libre</span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <button onClick={download} title="Télécharger mon jeu" aria-label="Télécharger mon jeu" className="btn flex items-center gap-2 bg-mint px-3 py-2 xl:px-4"><Download size={19} strokeWidth={ICON_STROKE} aria-hidden="true" /><span className="hidden xl:inline">Télécharger mon jeu</span></button>
          <button onClick={() => openRef.current?.click()} title="Ouvrir un jeu" aria-label="Ouvrir un jeu" className="btn flex items-center gap-2 bg-sky px-3 py-2 xl:px-4"><FolderOpen size={19} strokeWidth={ICON_STROKE} aria-hidden="true" /><span className="hidden xl:inline">Ouvrir</span></button>
          <input ref={openRef} type="file" accept=".json,application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) openFile(f); e.target.value = ""; }} />
          <button
            onClick={() => { if (window.confirm("Effacer ton jeu et recommencer avec l'exemple ?")) { stopGame(); const p = starter(); setProject(p); setSel(p.sprites[0].id); sfx("trash"); } }}
            title="Nouveau jeu" aria-label="Nouveau jeu"
            className="btn flex items-center gap-2 bg-paper px-3 py-2 xl:px-4"
          >
            <WandSparkles size={19} strokeWidth={ICON_STROKE} aria-hidden="true" /><span className="hidden xl:inline">Nouveau</span>
          </button>
          <Link href="/jouer/" title="Les défis" aria-label="Les défis" className="btn flex items-center gap-2 bg-sun px-3 py-2 xl:px-4"><MapIcon size={19} strokeWidth={ICON_STROKE} aria-hidden="true" /><span className="hidden xl:inline">Jouer</span></Link>
          <SoundToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-3 md:mx-auto md:max-w-[560px] lg:mx-0 lg:w-[min(38vw,500px)] lg:max-w-none">
          {/* Scène */}
          <div
            ref={stageRef}
            tabIndex={0}
            aria-label="Scène du jeu. Utilise les flèches du clavier pendant le jeu."
            className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-3xl border-[3px] border-ink shadow-pop outline-none"
            style={{ background: bg.css }}
          >
            {r?.planks.map((pl, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute rounded-md border-[3px] border-ink"
                style={{
                  left: (pl.x - (pl.horizontal ? 24 : 14)) * scale, top: (pl.y - (pl.horizontal ? 14 : 24)) * scale,
                  width: (pl.horizontal ? 48 : 28) * scale, height: (pl.horizontal ? 28 : 48) * scale,
                  background: `repeating-linear-gradient(${pl.horizontal ? 90 : 0}deg, #D69A5B 0 10px, #8A5A2E 10px 12px)`,
                }}
                aria-hidden="true"
              />
            ))}
            {project.sprites.map((s) => {
              const st = r?.sprites[s.id];
              const x = st?.x ?? s.x;
              const y = st?.y ?? s.y;
              const size = ((st?.size ?? s.size) / 100) * BASE * scale;
              const visible = st ? st.visible : true;
              return (
                <div
                  key={s.id}
                  onPointerDown={(e) => dragSprite(e, s)}
                  className={`absolute ${running ? "cursor-pointer" : "cursor-grab"} ${!running && s.id === sel ? "rounded-xl outline-dashed outline-[3px] outline-grape" : ""}`}
                  style={{
                    left: x * scale - size / 2, top: y * scale - size / 2, width: size, height: size,
                    opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none",
                    transform: `translateY(${(st?.jy ?? 0) * scale}px) rotate(${st?.spin ?? 0}deg)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.name} draggable={false} className="size-full select-none object-contain" style={{ transform: st?.dir === 3 ? "scaleX(-1)" : undefined }} />
                  {st?.say && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute bottom-full left-1/2 mb-1 w-max max-w-[180px] -translate-x-1/4 rounded-2xl border-[3px] border-ink bg-paper px-3 py-1 font-display text-sm font-bold"
                    >
                      {st.say}
                    </motion.span>
                  )}
                </div>
              );
            })}
            {running && r && (
              <div className="toon absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 font-display text-lg font-bold">
                <StarIcon size={20} /> Score : <BumpNumber key={r.scoreBump} value={r.score} />
              </div>
            )}
            <AnimatePresence>
              {ended && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 grid place-items-center bg-ink/45"
                >
                  <motion.div
                    initial={{ scale: 0.3, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className={`rounded-3xl border-[3px] border-ink px-6 py-4 text-center shadow-pop-lg ${ended === "win" ? "bg-sun" : "bg-coral"}`}
                  >
                    {ended === "win" && <PartyPopper size={44} strokeWidth={2.5} className="mx-auto" aria-hidden="true" />}
                    <p className="font-display text-4xl font-bold">{ended === "win" ? "BRAVO !" : "Perdu !"}</p>
                    <p className="font-bold">Score : {r?.score ?? 0}</p>
                    <button onClick={play} className="btn mt-2 inline-flex items-center gap-1.5 bg-paper px-4 py-1.5"><RotateCcw size={17} strokeWidth={3} aria-hidden="true" /> Rejouer</button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={play} className="btn flex flex-1 items-center justify-center gap-2 bg-mint py-2.5 text-2xl">
              <Play size={24} strokeWidth={ICON_STROKE} fill="#16123A" aria-hidden="true" /> Jouer
            </motion.button>
            <button onClick={() => { stopGame(); sfx("click"); }} disabled={!running} className="btn bg-coral px-6 py-2.5" aria-label="Arrêter">
              <Square size={24} strokeWidth={ICON_STROKE} fill="#16123A" aria-hidden="true" />
            </button>
          </div>

          {/* Personnages + décor */}
          <div className="toon flex min-h-0 flex-1 flex-col gap-2 rounded-3xl bg-paper p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Personnages</h2>
              <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Décor">
                <span className="mr-1 text-sm font-extrabold whitespace-nowrap">Décor :</span>
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    role="radio"
                    aria-checked={b.id === project.bg}
                    aria-label={b.name}
                    title={b.name}
                    onClick={() => { setProject({ ...project, bg: b.id }); sfx("click"); }}
                    className={`size-7 rounded-lg border-[3px] ${b.id === project.bg ? "border-ink shadow-pop" : "border-ink/30"}`}
                    style={{ background: b.css }}
                  />
                ))}
              </div>
            </div>
            <div className="scroll-soft flex min-h-0 flex-wrap content-start gap-2 overflow-y-auto">
              {project.sprites.map((s) => (
                <motion.button
                  key={s.id}
                  layout
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  whileHover={{ y: -3 }}
                  onClick={() => { setSel(s.id); sfx("click"); }}
                  aria-pressed={s.id === sel}
                  className={`flex w-[78px] flex-col items-center rounded-2xl border-[3px] p-1 ${s.id === sel ? "border-ink bg-lilac shadow-pop" : "border-ink/25 bg-cream"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt="" className="size-11 object-contain" />
                  <span className="w-full truncate text-center text-xs font-extrabold">{s.name}</span>
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setLibOpen(true); sfx("click"); }}
                className="flex w-[78px] flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-ink bg-sun/50 p-1 font-display font-bold"
              >
                <Plus size={30} strokeWidth={3} aria-hidden="true" />
                <span className="text-xs">Ajouter</span>
              </motion.button>
            </div>
          </div>
        </div>

        {sprite && (
          <BlockEditor
            key={sprite.id}
            program={sprite.scripts}
            onChange={(p) => updateSprite(sprite.id, { scripts: p })}
            groups={GROUPS}
            mode="hats"
            disabled={running}
            sprites={others}
            spriteDefault={others[0]?.id ?? ""}
            onNotice={notify}
            title={
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sprite.src} alt="" className="size-8 object-contain" />
                <span className="hidden 2xl:inline">Programme de</span>
                <input
                  value={sprite.name}
                  maxLength={16}
                  aria-label="Nom du personnage"
                  onChange={(e) => updateSprite(sprite.id, { name: e.target.value })}
                  className="w-28 min-w-0 rounded-full border-[3px] border-ink bg-paper px-2 font-display text-base font-bold"
                />
              </span>
            }
            toolbar={
              project.sprites.length > 1 && (
                <button onClick={() => removeSprite(sprite.id)} className="btn flex items-center gap-1 bg-paper px-3 py-0.5 text-sm"><Trash2 size={15} strokeWidth={ICON_STROKE} aria-hidden="true" /> Supprimer</button>
              )
            }
          />
        )}
      </main>

      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.key}
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="toon fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 font-display text-lg font-bold text-white"
            role="status"
          >
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {libOpen && <SpriteLibrary onClose={() => setLibOpen(false)} onPick={addSprite} onError={notify} />}
      </AnimatePresence>
    </div>
  );
}

