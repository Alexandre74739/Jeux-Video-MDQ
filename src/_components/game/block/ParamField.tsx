"use client";
import type { Block, ParamDef } from "@/lib/blocks";
import type { BlockProps, SpriteOpt } from "./types";

const chip =
  "rounded-full border-2 border-ink bg-paper px-2 py-0.5 font-bold text-ink leading-tight";

/** Paramètre d'un bloc : pastille en lecture, champ ou liste en édition. */
export function ParamField({
  p,
  block,
  mode,
  sprites,
  onParam,
}: {
  p: ParamDef;
  block: Block;
  mode: BlockProps["mode"];
  sprites?: SpriteOpt[];
  onParam?: BlockProps["onParam"];
}) {
  const value = block.params[p.key];
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  if (mode !== "edit") {
    let label = String(value ?? "");
    if (p.kind === "select")
      label = p.options.find((o) => o.value === value)?.label ?? label;
    if (p.kind === "sprite")
      label = sprites?.find((s) => s.id === value)?.name ?? "…";
    return <span className={chip}>{label}</span>;
  }
  if (p.kind === "number") {
    return (
      <input
        type="number"
        inputMode="numeric"
        min={p.min}
        max={p.max}
        value={value}
        aria-label="nombre"
        onPointerDown={stop}
        onChange={(e) => {
          const n = Math.max(
            p.min,
            Math.min(p.max, Math.round(Number(e.target.value) || 0)),
          );
          onParam?.(block.id, p.key, n);
        }}
        className={`${chip} w-14 text-center`}
      />
    );
  }
  if (p.kind === "text") {
    return (
      <input
        type="text"
        value={String(value)}
        maxLength={30}
        aria-label="texte"
        onPointerDown={stop}
        onChange={(e) => onParam?.(block.id, p.key, e.target.value)}
        className={`${chip} w-36`}
      />
    );
  }
  const options =
    p.kind === "select"
      ? p.options
      : (sprites ?? []).map((s) => ({ value: s.id, label: s.name }));
  return (
    <select
      value={String(value)}
      aria-label="choix"
      onPointerDown={stop}
      onChange={(e) => onParam?.(block.id, p.key, e.target.value)}
      className={`${chip} cursor-pointer`}
    >
      {p.kind === "sprite" && !options.some((o) => o.value === value) && (
        <option value="">…</option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
