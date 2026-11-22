"use client";
import type { RefObject } from "react";
import type { Block } from "@/lib/blocks";
import { HOLD_MS, type Pending } from "./types";

/**
 * Début d'un geste sur un bloc : on note où il a été saisi.
 * Au doigt, un appui immobile de HOLD_MS « attrape » le bloc.
 */
export function startGesture(
  e: React.PointerEvent,
  block: Block,
  fromPalette: boolean,
  pending: RefObject<Pending | null>,
  begin: (p: Pending) => void,
) {
  if (e.button !== 0 || pending.current) return;
  const tag = (e.target as HTMLElement).tagName;
  if (["INPUT", "SELECT", "OPTION", "BUTTON"].includes(tag) && !fromPalette)
    return;
  e.stopPropagation();
  if (e.pointerType !== "touch") e.preventDefault();
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const touch = e.pointerType === "touch";
  const p: Pending = {
    id: e.pointerId,
    block,
    fromPalette,
    sx: e.clientX,
    sy: e.clientY,
    x: e.clientX,
    y: e.clientY,
    ox: e.clientX - r.left,
    oy: e.clientY - r.top,
    touch,
    armed: !touch,
    started: false,
    timer: 0,
  };
  // Sans capture, les mouvements du doigt sont envoyés à ce qui se trouve sous lui.
  try {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  } catch {}
  if (touch) {
    p.timer = window.setTimeout(() => {
      if (pending.current !== p || p.started) return;
      p.armed = true;
      begin(p);
    }, HOLD_MS);
  }
  pending.current = p;
}
