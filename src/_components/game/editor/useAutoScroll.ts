"use client";
import { useEffect, type RefObject } from "react";
import { TOUCH_LIFT, type Pending } from "./types";

const EDGE = 64;
const SPEED = 16;
/** Vitesse selon la distance au bord (d < 0 : déjà au-delà du bord → vitesse max). */
const push = (d: number) =>
  d < EDGE ? Math.ceil(((EDGE - Math.max(0, d)) / EDGE) * SPEED) : 0;

/** Fait défiler la page, ou la zone de programme, quand on glisse un bloc près de leur bord. */
export function useAutoScroll(
  dragging: boolean,
  pending: RefObject<Pending | null>,
  scrollRef: RefObject<HTMLDivElement | null>,
  onScrolled: (p: Pending, y: number) => void,
) {
  useEffect(() => {
    if (!dragging) return;
    let raf = 0;
    const tick = () => {
      const p = pending.current;
      if (p?.started) {
        let moved = false;
        const y = p.y - (p.touch ? TOUCH_LIFT : 0);
        const win = -push(p.y) || push(window.innerHeight - p.y);
        if (win) {
          const b = window.scrollY;
          window.scrollBy(0, win);
          moved = window.scrollY !== b;
        }
        const sc = scrollRef.current;
        if (sc && sc.scrollHeight > sc.clientHeight) {
          const r = sc.getBoundingClientRect();
          const inside =
            p.x >= r.left &&
            p.x <= r.right &&
            y >= r.top - EDGE &&
            y <= r.bottom + EDGE;
          const v = inside ? -push(y - r.top) || push(r.bottom - y) : 0;
          if (v) {
            const b = sc.scrollTop;
            sc.scrollTop += v;
            moved ||= sc.scrollTop !== b;
          }
        }
        if (moved) onScrolled(p, y);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, pending, scrollRef, onScrolled]);
}
