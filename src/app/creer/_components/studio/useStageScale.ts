"use client";
import { useEffect, useState, type RefObject } from "react";
import { STAGE_W } from "@/lib/runtime";

/** Échelle de la scène : sa largeur à l'écran divisée par sa largeur dans le jeu. */
export function useStageScale(stageRef: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);
  return scale;
}
