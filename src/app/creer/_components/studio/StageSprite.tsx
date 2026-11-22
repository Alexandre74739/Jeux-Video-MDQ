"use client";
import { motion } from "motion/react";
import { BASE, type Runtime, type SpriteDef } from "@/lib/runtime";

/** Un personnage sur la scène : à sa place de départ, ou là où le jeu l'a emmené (avec sa bulle). */
export function StageSprite({
  sprite: s,
  rt,
  scale,
  selected,
  onPointerDown,
}: {
  sprite: SpriteDef;
  rt: Runtime | null;
  scale: number;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const st = rt?.sprites[s.id];
  const x = st?.x ?? s.x;
  const y = st?.y ?? s.y;
  const size = ((st?.size ?? s.size) / 100) * BASE * scale;
  const visible = st ? st.visible : true;
  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute ${rt ? "cursor-pointer" : "cursor-grab"} ${!rt && selected ? "rounded-xl outline-dashed outline-[3px] outline-grape" : ""}`}
      style={{
        left: x * scale - size / 2,
        top: y * scale - size / 2,
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: `translateY(${(st?.jy ?? 0) * scale}px) rotate(${st?.spin ?? 0}deg)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.src}
        alt={s.name}
        draggable={false}
        className="size-full select-none object-contain"
        style={{ transform: st?.dir === 3 ? "scaleX(-1)" : undefined }}
      />
      {st?.say && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-full left-1/2 mb-1 w-max max-w-[180px] -translate-x-1/4 rounded-2xl border-[3px] border-ink bg-paper px-3 py-1 font-display text-sm font-bold"
        >
          {st.say}
        </motion.span>
      )}
    </div>
  );
}
