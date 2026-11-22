"use client";
import { useEffect, useState } from "react";
import { confettiBurst } from "./confettiBurst";

/** Explosion de confettis (canvas plein écran, se nettoie seul). */
export function Confetti({ fire }: { fire: number }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!fire || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return confettiBurst(canvas);
  }, [fire, canvas]);
  return (
    <canvas
      ref={setCanvas}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden="true"
    />
  );
}
