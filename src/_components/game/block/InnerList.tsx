"use client";
import type { Block } from "@/lib/blocks";
import { BlockView } from "../BlockView";
import type { BlockProps } from "./types";

/** Blocs rangés à l'intérieur d'une boucle ou d'une condition. */
export function InnerList({
  listId,
  items,
  soft,
  ...props
}: BlockProps & { listId: string; items: Block[]; soft: string }) {
  const { mode, renderChild } = props;
  return (
    <div
      data-list={mode === "edit" ? listId : undefined}
      className="flex min-h-12 min-w-40 flex-col gap-1.5 rounded-xl border-[3px] border-ink/70 p-1.5"
      style={{ background: soft }}
    >
      {items.map((c) =>
        renderChild ? (
          renderChild(c)
        ) : (
          <BlockView key={c.id} {...props} block={c} />
        ),
      )}
      {mode === "edit" && items.length === 0 && (
        <span className="pointer-events-none px-2 py-1.5 text-sm font-bold text-ink-soft">
          dépose des blocs ici
        </span>
      )}
    </div>
  );
}
