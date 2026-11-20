"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BLOCKS, CATEGORIES, type Block, type ParamDef } from "@/lib/blocks";
import { Icon } from "./Icon";

export type SpriteOpt = { id: string; name: string };

type Props = {
  block: Block;
  mode: "palette" | "edit" | "static";
  activeId?: string | null;
  sprites?: SpriteOpt[];
  onParam?: (id: string, key: string, value: string | number) => void;
  onPointerDown?: (e: React.PointerEvent, block: Block) => void;
  renderChild?: (b: Block) => ReactNode;
};

const chip = "rounded-full border-2 border-ink bg-paper px-2 py-0.5 font-bold text-ink leading-tight";

function ParamField({ p, block, mode, sprites, onParam }: { p: ParamDef; block: Block; mode: Props["mode"]; sprites?: SpriteOpt[]; onParam?: Props["onParam"] }) {
  const value = block.params[p.key];
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  if (mode !== "edit") {
    let label = String(value ?? "");
    if (p.kind === "select") label = p.options.find((o) => o.value === value)?.label ?? label;
    if (p.kind === "sprite") label = sprites?.find((s) => s.id === value)?.name ?? "…";
    return <span className={chip}>{label}</span>;
  }
  if (p.kind === "number") {
    return (
      <input
        type="number" inputMode="numeric" min={p.min} max={p.max} value={value}
        aria-label="nombre"
        onPointerDown={stop}
        onChange={(e) => {
          const n = Math.max(p.min, Math.min(p.max, Math.round(Number(e.target.value) || 0)));
          onParam?.(block.id, p.key, n);
        }}
        className={`${chip} w-14 text-center`}
      />
    );
  }
  if (p.kind === "text") {
    return (
      <input
        type="text" value={String(value)} maxLength={30} aria-label="texte"
        onPointerDown={stop}
        onChange={(e) => onParam?.(block.id, p.key, e.target.value)}
        className={`${chip} w-36`}
      />
    );
  }
  const options = p.kind === "select" ? p.options : (sprites ?? []).map((s) => ({ value: s.id, label: s.name }));
  return (
    <select
      value={String(value)} aria-label="choix"
      onPointerDown={stop}
      onChange={(e) => onParam?.(block.id, p.key, e.target.value)}
      className={`${chip} cursor-pointer`}
    >
      {p.kind === "sprite" && !options.some((o) => o.value === value) && <option value="">…</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function BlockHeader({ block, mode, sprites, onParam }: Props) {
  const def = BLOCKS[block.type];
  const parts = def.label.split(/(\{\w+\})/).filter(Boolean);
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {def.icon && (
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-paper/70" aria-hidden="true">
          <Icon name={def.icon} size={17} />
        </span>
      )}
      {parts.map((part, i) => {
        const m = part.match(/^\{(\w+)\}$/);
        if (!m) return <span key={i}>{part.trim()}</span>;
        const p = def.params!.find((x) => x.key === m[1])!;
        return <ParamField key={i} p={p} block={block} mode={mode} sprites={sprites} onParam={onParam} />;
      })}
    </span>
  );
}

export function BlockView(props: Props) {
  const { block, mode, activeId, onPointerDown, renderChild } = props;
  const def = BLOCKS[block.type];
  if (!def) return null;
  const cat = CATEGORIES[def.category];
  const active = activeId === block.id;
  const radius = def.hat ? "rounded-t-[26px] rounded-b-2xl" : "rounded-2xl";

  return (
    <div
      data-block-id={mode === "edit" ? block.id : undefined}
      onPointerDown={onPointerDown ? (e) => onPointerDown(e, block) : undefined}
      className={`relative w-fit max-w-full select-none font-display text-[17px] font-semibold text-ink ${mode !== "static" ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div
        className={`border-[3px] border-ink ${radius} ${active ? "running-glow" : ""}`}
        style={{ background: cat.color, boxShadow: "0 4px 0 0 #16123A" }}
      >
        <div className={`px-3 ${def.hat ? "pt-3 pb-2" : "py-1.5"}`}>
          <BlockHeader {...props} />
        </div>
        {def.container && mode === "palette" && (
          <div className="px-2 pb-2">
            <div className="h-4 w-24 rounded-lg border-[3px] border-ink/50" style={{ background: cat.soft }} />
          </div>
        )}
        {def.container && mode !== "palette" && (
          <div className="px-2 pb-2.5">
            <div
              data-list={mode === "edit" ? block.id : undefined}
              className="flex min-h-12 min-w-40 flex-col gap-1.5 rounded-xl border-[3px] border-ink/70 p-1.5"
              style={{ background: cat.soft }}
            >
              {(block.children ?? []).map((c) =>
                renderChild ? renderChild(c) : <BlockView key={c.id} {...props} block={c} />
              )}
              {mode === "edit" && (block.children ?? []).length === 0 && (
                <span className="pointer-events-none px-2 py-1.5 text-sm font-bold text-ink-soft">dépose des blocs ici</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Version animée pour la zone de programme. */
export function AnimatedBlock({ children, id }: { children: ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      data-wrap
      layout="position"
      initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      className="w-fit max-w-full"
    >
      {children}
    </motion.div>
  );
}
