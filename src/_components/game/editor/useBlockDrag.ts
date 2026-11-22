"use client";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { BLOCKS, insertBlock, removeBlock, type Block } from "@/lib/blocks";
import { sfx } from "@/lib/sound";
import { findDropTarget } from "./dropTarget";
import { useAutoScroll } from "./useAutoScroll";
import { startGesture } from "./dragStart";
import {
  TOUCH_LIFT,
  type DragState,
  type EditorProps,
  type Pending,
  type Target,
} from "./types";

type Options = Pick<
  EditorProps,
  "program" | "mode" | "disabled" | "onChange" | "onAdd" | "onNotice"
> & {
  /** Simple clic (sans glisser) sur un bloc de la palette ou du programme. */
  onTap: (p: Pending) => void;
};

/** Glisser-déposer des blocs, à la souris comme au doigt, avec la palette comme poubelle. */
export function useBlockDrag(o: Options) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [overTrash, setOverTrash] = useState(false);
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const pending = useRef<Pending | null>(null);
  const targetRef = useRef<Target | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { mode } = o;

  const computeTarget = useCallback(
    (x: number, y: number, block: Block) => {
      const hat = !!BLOCKS[block.type].hat;
      const accepts = (listId: string) =>
        mode === "stack" ? !hat : listId === "root" ? hat : !hat;
      const { trash, target: t } = findDropTarget(x, y, accepts);
      setOverTrash(trash);
      targetRef.current = t;
      setTarget(t);
    },
    [mode],
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

  const finish = useEffectEvent((p: Pending) => {
    window.clearTimeout(p.timer);
    pending.current = null;
    if (!p.started) return o.onTap(p);
    const t = targetRef.current;
    const base = p.fromPalette
      ? o.program
      : removeBlock(o.program, p.block.id)[0];
    if (t) {
      o.onChange(insertBlock(base, t.listId, t.index, p.block));
      sfx("snap");
      o.onAdd?.();
    } else if (!p.fromPalette) {
      o.onChange(base);
      sfx("trash");
    } else if (mode === "hats" && !BLOCKS[p.block.type].hat) {
      o.onNotice?.("Ce bloc doit aller DANS un bloc jaune « quand… »");
    }
    reset();
  });

  /** Geste interrompu (défilement, appel système…) : on remet tout comme avant, sans rien jeter. */
  const cancel = useEffectEvent((p: Pending) => {
    window.clearTimeout(p.timer);
    pending.current = null;
    reset();
  });

  const move = useEffectEvent((e: PointerEvent) => {
    const p = pending.current;
    if (!p || e.pointerId !== p.id) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (p.started) return update(p);
    const dx = p.x - p.sx;
    const dy = p.y - p.sy;
    const dist = Math.hypot(dx, dy);
    if (p.touch && !p.armed) {
      if (dist < 8) return;
      // Glissé horizontal : on attrape le bloc. Glissé vertical rapide : l'enfant fait défiler.
      if (Math.abs(dx) < Math.abs(dy)) return cancel(p);
      p.armed = true;
    }
    if (dist >= 6) begin(p);
  });

  useEffect(() => {
    const up = (e: PointerEvent) => {
      const p = pending.current;
      if (p && e.pointerId === p.id) finish(p);
    };
    const abort = (e: PointerEvent) => {
      const p = pending.current;
      if (p && e.pointerId === p.id) cancel(p);
    };
    // Une fois le bloc attrapé au doigt, la page ne doit plus défiler.
    const touchMove = (e: TouchEvent) => {
      if (pending.current?.armed && e.cancelable) e.preventDefault();
    };
    const menu = (e: Event) => {
      if (pending.current) e.preventDefault();
    };
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

  const rescan = useCallback(
    (p: Pending, y: number) => computeTarget(p.x, y, p.block),
    [computeTarget],
  );
  useAutoScroll(!!drag, pending, scrollRef, rescan);
  const startDrag = (
    e: React.PointerEvent,
    block: Block,
    fromPalette: boolean,
  ) => {
    if (!o.disabled) startGesture(e, block, fromPalette, pending, begin);
  };

  return { drag, target, overTrash, hiddenId, scrollRef, startDrag };
}
