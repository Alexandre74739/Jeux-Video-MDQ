"use client";
import { BLOCKS } from "@/lib/blocks";
import { Icon } from "@/_components/icons/Icon";
import { ParamField } from "./ParamField";
import type { BlockProps } from "./types";

/** Ligne de titre d'un bloc : icône, texte et paramètres. */
export function BlockHeader({ block, mode, sprites, onParam }: BlockProps) {
  const def = BLOCKS[block.type];
  const parts = def.label.split(/(\{\w+\})/).filter(Boolean);
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {def.icon && (
        <span
          className="grid size-7 shrink-0 place-items-center rounded-lg bg-paper/70"
          aria-hidden="true"
        >
          <Icon name={def.icon} size={17} />
        </span>
      )}
      {parts.map((part, i) => {
        const m = part.match(/^\{(\w+)\}$/);
        if (!m) return <span key={i}>{part.trim()}</span>;
        const p = def.params!.find((x) => x.key === m[1])!;
        return (
          <ParamField
            key={i}
            p={p}
            block={block}
            mode={mode}
            sprites={sprites}
            onParam={onParam}
          />
        );
      })}
    </span>
  );
}
