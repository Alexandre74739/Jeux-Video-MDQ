"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BLOCKS, CATEGORIES, createBlock, insertBlock, removeBlock, updateParam,
  type Block, type Category,
} from "@/lib/blocks";
import { sfx } from "@/lib/sound";
import { AnimatedBlock, BlockView, type SpriteOpt } from "./BlockView";
import { Icon } from "./Icon";
import { ArrowLeft, Play, Trash2 } from "lucide-react";

type Group = { category: Category; types: string[] };
type Target = { listId: string; index: number; top: number; left: number; width: number };
type Pending = {
  id: number; block: Block; fromPalette: boolean;
  sx: number; sy: number; x: number; y: number; ox: number; oy: number;
  touch: boolean; armed: boolean; started: boolean; timer: number;
};

/** Au doigt : le bloc flotte au-dessus du doigt pour rester visible. */
const TOUCH_LIFT = 34;
/** Au doigt : appui immobile qui « attrape » le bloc (sinon un glissé vertical fait défiler). */
const HOLD_MS = 160;

type Props = {
  program: Block[];
  onChange: (p: Block[]) => void;
  groups: Group[];
  mode: "stack" | "hats";
  activeId?: string | null;
  disabled?: boolean;
  sprites?: SpriteOpt[];
  spriteDefault?: string;
  title: ReactNode;
  toolbar?: ReactNode;
  onNotice?: (msg: string) => void;
  onAdd?: () => void;
};

export default function BlockEditor(props: Props) {
  const { program, onChange, groups, mode, activeId, disabled, sprites, spriteDefault = "", title, toolbar, onNotice, onAdd } = props;
  const [tab, setTab] = useState<Category>(groups[0].category);
  const [drag, setDrag] = useState<{ block: Block; x: number; y: number; ox: number; oy: number; lift: number } | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [overTrash, setOverTrash] = useState(false);
  const pending = useRef<Pending | null>(null);
  const programRef = useRef(program);
  programRef.current = program;
  const targetRef = useRef<Target | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  const canDrop = useCallback(
    (block: Block, listId: string) => {
      const hat = !!BLOCKS[block.type].hat;
      if (mode === "stack") return !hat;
      return listId === "root" ? hat : !hat;
    },
    [mode]
  );

  const computeTarget = useCallback(
    (x: number, y: number, block: Block) => {
      const els = document.elementsFromPoint(x, y) as HTMLElement[];
      const trash = els.some((el) => el.dataset?.trash);
      setOverTrash(trash);
      const listEl = trash ? undefined : els.find((el) => el.dataset?.list);
      let t: Target | null = null;
      if (listEl) {
        const listId = listEl.dataset.list!;
        if (canDrop(block, listId)) {
          const lr = listEl.getBoundingClientRect();
          const kids = Array.from(listEl.querySelectorAll<HTMLElement>(":scope > [data-wrap]")).filter((k) => k.getClientRects().length > 0);
          let index = kids.length;
          for (let i = 0; i < kids.length; i++) {
            const r = kids[i].getBoundingClientRect();
            if (y < r.top + Math.min(r.height / 2, 22)) { index = i; break; }
          }
          let top = lr.top + 8;
          if (kids.length) {
            top = index < kids.length
              ? kids[index].getBoundingClientRect().top - 4
              : kids[kids.length - 1].getBoundingClientRect().bottom + 3;
          }
          t = { listId, index, top, left: lr.left + 6, width: Math.min(lr.width - 12, 240) };
        }
      }
      targetRef.current = t;
      setTarget(t);
    },
    [canDrop]
  );

  const quickAdd = useCallback(
    (block: Block) => {
      const prog = programRef.current;
      if (mode === "stack" || BLOCKS[block.type].hat) {
        onChange([...prog, block]);
      } else {
        const last = prog[prog.length - 1];
        if (!last) {
          onNotice?.("Commence par un bloc jaune « quand… » !");
          sfx("bump");
          return;
        }
        onChange(insertBlock(prog, last.id, last.children?.length ?? 0, block));
      }
      sfx("snap");
      onAdd?.();
    },
    [mode, onChange, onNotice, onAdd]
  );

  const reset = () => {
    setHiddenId(null);
    targetRef.current = null;
    setTarget(null);
    setDrag(null);
    setOverTrash(false);
  };

  const update = (p: Pending) => {
    const lift = p.touch ? TOUCH_LIFT : 0;
    setDrag({ block: p.block, x: p.x, y: p.y, ox: p.ox, oy: p.oy, lift });
    computeTarget(p.x, p.y - lift, p.block);
  };

  const begin = (p: Pending) => {
    p.started = true;
    sfx("pick");
    if (p.touch) navigator.vibrate?.(12);
    // Le bloc d'origine reste dans le DOM (caché) jusqu'au lâcher : les événements tactiles restent valides.
    if (!p.fromPalette) setHiddenId(p.block.id);
    update(p);
  };

  const finish = (p: Pending) => {
    window.clearTimeout(p.timer);
    pending.current = null;
    if (!p.started) {
      if (p.fromPalette) quickAdd(p.block);
      return;
    }
    const t = targetRef.current;
    const base = p.fromPalette ? programRef.current : removeBlock(programRef.current, p.block.id)[0];
    if (t) {
      onChange(insertBlock(base, t.listId, t.index, p.block));
      sfx("snap");
      onAdd?.();
    } else if (!p.fromPalette) {
      onChange(base);
      sfx("trash");
    } else if (mode === "hats" && !BLOCKS[p.block.type].hat) {
      onNotice?.("Ce bloc doit aller DANS un bloc jaune « quand… »");
    }
    reset();
  };

  /** Geste interrompu (défilement, appel système…) : on remet tout comme avant, sans rien jeter. */
  const cancel = (p: Pending) => {
    window.clearTimeout(p.timer);
    pending.current = null;
    reset();
  };

  const onMove = (e: PointerEvent) => {
    const p = pending.current;
    if (!p || e.pointerId !== p.id) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (!p.started) {
      const dx = p.x - p.sx, dy = p.y - p.sy;
      const dist = Math.hypot(dx, dy);
      if (p.touch && !p.armed) {
        if (dist < 8) return;
        // Glissé horizontal : on attrape le bloc. Glissé vertical rapide : l'enfant fait défiler.
        if (Math.abs(dx) < Math.abs(dy)) { cancel(p); return; }
        p.armed = true;
      }
      if (dist < 6) return;
      begin(p);
      return;
    }
    update(p);
  };

  // Les écouteurs globaux appellent toujours la dernière version des fonctions.
  const handlers = useRef({ onMove, finish, cancel });
  handlers.current = { onMove, finish, cancel };

  useEffect(() => {
    const move = (e: PointerEvent) => handlers.current.onMove(e);
    const up = (e: PointerEvent) => { const p = pending.current; if (p && e.pointerId === p.id) handlers.current.finish(p); };
    const abort = (e: PointerEvent) => { const p = pending.current; if (p && e.pointerId === p.id) handlers.current.cancel(p); };
    // Une fois le bloc attrapé au doigt, la page ne doit plus défiler.
    const touchMove = (e: TouchEvent) => { if (pending.current?.armed && e.cancelable) e.preventDefault(); };
    const menu = (e: Event) => { if (pending.current) e.preventDefault(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", abort);
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("contextmenu", menu);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", abort);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("contextmenu", menu);
    };
  }, []);

  // Défilement automatique quand on approche le bord de l'écran ou de la zone de programme.
  const dragging = !!drag;
  useEffect(() => {
    if (!dragging) return;
    let raf = 0;
    const EDGE = 64, SPEED = 16;
    // Vitesse selon la distance au bord (d < 0 : déjà au-delà du bord → vitesse max)
    const push = (d: number) => (d < EDGE ? Math.ceil(((EDGE - Math.max(0, d)) / EDGE) * SPEED) : 0);
    const tick = () => {
      const p = pending.current;
      if (p?.started) {
        let moved = false;
        const y = p.y - (p.touch ? TOUCH_LIFT : 0);
        const win = -push(p.y) || push(window.innerHeight - p.y);
        if (win) { const b = window.scrollY; window.scrollBy(0, win); moved = window.scrollY !== b; }
        const sc = scrollRef.current;
        if (sc && sc.scrollHeight > sc.clientHeight) {
          const r = sc.getBoundingClientRect();
          if (p.x >= r.left && p.x <= r.right && y >= r.top - EDGE && y <= r.bottom + EDGE) {
            const v = -push(y - r.top) || push(r.bottom - y);
            if (v) { const b = sc.scrollTop; sc.scrollTop += v; moved ||= sc.scrollTop !== b; }
          }
        }
        if (moved) computeTarget(p.x, y, p.block);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, computeTarget]);

  const startDrag = (e: React.PointerEvent, block: Block, fromPalette: boolean) => {
    if (disabled || e.button !== 0 || pending.current) return;
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "SELECT", "OPTION", "BUTTON"].includes(tag) && !fromPalette) return;
    e.stopPropagation();
    if (e.pointerType !== "touch") e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const touch = e.pointerType === "touch";
    const p: Pending = {
      id: e.pointerId, block, fromPalette, 
      sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top,
      touch, armed: !touch, started: false, timer: 0,
    };
    // Sans capture, les mouvements du doigt sont envoyés à ce qui se trouve sous lui.
    try { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
    if (touch) {
      p.timer = window.setTimeout(() => {
        if (pending.current !== p || p.started) return;
        p.armed = true;
        begin(p);
      }, HOLD_MS);
    }
    pending.current = p;
  };

  const onParam = (id: string, key: string, value: string | number) => onChange(updateParam(programRef.current, id, key, value));

  const renderEdit = (b: Block): ReactNode => (
    <AnimatedBlock key={b.id} id={b.id} hidden={b.id === hiddenId}>
      <BlockView
        block={b} mode="edit" activeId={activeId} sprites={sprites} onParam={onParam}
        onPointerDown={(e, bl) => startDrag(e, bl, false)}
        renderChild={renderEdit}
      />
    </AnimatedBlock>
  );

  const showTabs = groups.length > 1;
  const visible = showTabs ? groups.filter((g) => g.category === tab) : groups;
  const empty = program.length === 0;

  return (
    <div className="flex min-h-[640px] flex-1 flex-col gap-3 md:min-h-[520px] md:flex-row lg:min-h-0">
      {/* Palette */}
      <section
        data-trash={drag ? "1" : undefined}
        aria-label="Blocs disponibles"
        className={`relative flex w-full max-h-[280px] md:max-h-none ${showTabs ? "md:w-[320px]" : "md:w-[250px]"} shrink-0 flex-col overflow-hidden rounded-3xl border-[3px] border-ink shadow-pop transition-colors ${overTrash ? "bg-coral/30" : "bg-paper"}`}
      >
        <h2 className="border-b-[3px] border-ink bg-sky px-4 py-2 text-lg font-bold">Blocs</h2>
        <div className="flex min-h-0 flex-1">
          {showTabs && (
            <nav className="scroll-soft flex min-h-0 w-[86px] shrink-0 flex-col gap-1.5 overflow-y-auto overscroll-contain border-r-[3px] border-ink bg-cream p-1.5" aria-label="Familles de blocs">
              {groups.map((g) => {
                const c = CATEGORIES[g.category];
                const on = g.category === tab;
                return (
                  <button
                    key={g.category}
                    onClick={() => { setTab(g.category); sfx("click"); }}
                    aria-pressed={on}
                    className={`flex w-full shrink-0 flex-col items-center rounded-xl border-[3px] px-0.5 py-1 text-center text-[11px] font-extrabold leading-tight break-words transition ${on ? "border-ink shadow-pop" : "border-transparent hover:border-ink/40"}`}
                    style={{ background: on ? c.color : "transparent" }}
                  >
                    <Icon name={c.icon} size={22} />
                    {c.label}
                  </button>
                );
              })}
            </nav>
          )}
          <div className="scroll-soft flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3">
            {visible.flatMap((g) => g.types).map((type) => {
              const sample = createBlock(type, spriteDefault);
              return (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.04, rotate: -1.5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-fit"
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={`Ajouter le bloc ${BLOCKS[type].label.replace(/\{\w+\}/g, "…")}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); quickAdd(createBlock(type, spriteDefault)); } }}
                >
                  <BlockView block={sample} mode="palette" sprites={sprites} onPointerDown={(e) => startDrag(e, createBlock(type, spriteDefault), true)} />
                </motion.div>
              );
            })}
          </div>
        </div>
        <AnimatePresence>
          {overTrash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
              className="pointer-events-none absolute inset-0 grid place-items-center text-center font-display text-xl font-bold"
            >
              <span className="flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink bg-coral px-4 py-3 shadow-pop">
                <Trash2 size={30} strokeWidth={2.75} aria-hidden="true" />Lâche pour<br />jeter
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Programme */}
      <section aria-label="Mon programme" className={`flex min-h-[340px] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-paper shadow-pop md:min-h-0 ${disabled ? "pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2 border-b-[3px] border-ink bg-sun px-4 py-1.5">
          <h2 className="text-lg font-bold whitespace-nowrap">{title}</h2>
          <div className="ml-auto flex items-center gap-2">{toolbar}</div>
        </div>
        <div ref={scrollRef} className="dots scroll-soft relative flex min-h-0 flex-1 flex-col overflow-auto p-4">
          {mode === "stack" && (
            <div className="w-fit rounded-t-[26px] rounded-b-2xl border-[3px] border-ink bg-sun px-4 pt-3 pb-2 font-display text-[17px] font-semibold shadow-pop">
              <span className="flex items-center gap-1.5">
                <span className="grid size-7 place-items-center rounded-lg bg-paper/70" aria-hidden="true"><Play size={16} strokeWidth={3} fill="#16123A" /></span>
                quand je lance le programme
              </span>
            </div>
          )}
          <div
            data-list="root"
            className={`relative flex flex-1 flex-col gap-1.5 ${mode === "stack" ? "ml-5 mt-1.5 border-l-4 border-dashed border-ink/25 pl-3 pb-24" : "gap-4 pb-24"}`}
          >
            {program.map(renderEdit)}
            {empty && !drag && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="pointer-events-none mt-3 flex items-center gap-3 font-display text-xl font-semibold text-ink-soft"
              >
                <motion.span animate={{ x: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} aria-hidden="true" className="grid size-11 place-items-center rounded-full border-[3px] border-ink bg-sun">
                  <ArrowLeft size={24} strokeWidth={3} />
                </motion.span>
                {mode === "stack" ? "Glisse un bloc ici, ou clique dessus !" : "Commence par un bloc jaune « quand… »"}
              </motion.div>
            )}
          </div>
          {disabled && <div className="absolute inset-0 bg-paper/20" />}
        </div>
      </section>

      {/* Fantôme du bloc déplacé + indicateur d'insertion */}
      {drag && (
        <div className="pointer-events-none fixed z-50" style={{ left: drag.x - drag.ox, top: drag.y - drag.oy - drag.lift }}>
          <div style={{ transform: "rotate(-3deg) scale(1.05)", filter: "drop-shadow(6px 8px 0 rgba(22,18,58,.35))", opacity: overTrash ? 0.5 : 1 }}>
            <BlockView block={drag.block} mode="static" sprites={sprites} />
          </div>
        </div>
      )}
      {drag && target && (
        <motion.div
          layout
          className="pointer-events-none fixed z-40 h-2 rounded-full bg-grape"
          style={{ top: target.top - 4, left: target.left, width: target.width, boxShadow: "0 0 0 3px #fff" }}
        />
      )}
    </div>
  );
}
