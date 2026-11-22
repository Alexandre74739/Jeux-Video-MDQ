"use client";
import { useState } from "react";
import {
  BLOCKS,
  insertBlock,
  moveBlock,
  removeBlock,
  updateParam,
  type Block,
} from "@/lib/blocks";
import { sfx } from "@/lib/sound";
import { findBlock, type EditorProps } from "./types";

type Options = Pick<
  EditorProps,
  "program" | "mode" | "disabled" | "onChange" | "onAdd" | "onNotice"
>;

/** Modifications du programme sans glisser-déposer : ajout au clic, sélection, clavier (WCAG 2.1.1 et 2.5.7). */
export function useProgramEdit(o: Options) {
  const { program, onChange } = o;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const quickAdd = (block: Block) => {
    const hat = !!BLOCKS[block.type].hat;
    // Bloc conteneur sélectionné (répéter, si…) : le nouveau bloc va dedans, à la fin.
    const into = selectedId && !hat ? findBlock(program, selectedId) : null;
    if (into?.children) {
      onChange(insertBlock(program, into.id, into.children.length, block));
    } else if (o.mode === "stack" || hat) {
      onChange([...program, block]);
    } else {
      const last = program[program.length - 1];
      if (!last) {
        o.onNotice?.("Commence par un bloc jaune « quand… » !");
        sfx("bump");
        return;
      }
      onChange(
        insertBlock(program, last.id, last.children?.length ?? 0, block),
      );
    }
    sfx("snap");
    o.onAdd?.();
  };

  const select = (id: string) => {
    setSelectedId(id);
    document.querySelector<HTMLElement>(`[data-block-id="${id}"]`)?.focus();
  };
  const move = (id: string, delta: -1 | 1) => {
    onChange(moveBlock(program, id, delta));
    sfx("snap");
    requestAnimationFrame(() => select(id));
  };
  const remove = (id: string) => {
    onChange(removeBlock(program, id)[0]);
    setSelectedId(null);
    sfx("trash");
  };
  const onParam = (id: string, key: string, value: string | number) =>
    onChange(updateParam(program, id, key, value));

  const onBlockKey = (e: React.KeyboardEvent, id: string) => {
    if (o.disabled || e.target !== e.currentTarget) return;
    const act =
      e.key === "Delete" || e.key === "Backspace"
        ? () => remove(id)
        : e.altKey && e.key === "ArrowUp"
          ? () => move(id, -1)
          : e.altKey && e.key === "ArrowDown"
            ? () => move(id, 1)
            : null;
    if (act) {
      e.preventDefault();
      act();
    } else if (e.key === "Escape") setSelectedId(null);
  };

  return {
    selectedId,
    setSelectedId,
    quickAdd,
    select,
    move,
    remove,
    onParam,
    onBlockKey,
  };
}

export type ProgramEdit = ReturnType<typeof useProgramEdit>;
