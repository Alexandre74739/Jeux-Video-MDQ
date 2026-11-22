import type { ReactNode } from "react";
import type { Block, Category } from "@/lib/blocks";
import type { SpriteOpt } from "../block/types";

export type Group = { category: Category; types: string[] };

/** Endroit où le bloc déplacé sera inséré (et position du trait violet). */
export type Target = {
  listId: string;
  index: number;
  top: number;
  left: number;
  width: number;
};

/** Geste en cours sur un bloc (souris ou doigt), avant et pendant le glisser. */
export type Pending = {
  id: number;
  block: Block;
  fromPalette: boolean;
  sx: number;
  sy: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  touch: boolean;
  armed: boolean;
  started: boolean;
  timer: number;
};

/** Bloc affiché sous le pointeur pendant le glisser. */
export type DragState = {
  block: Block;
  x: number;
  y: number;
  ox: number;
  oy: number;
  lift: number;
};

export type EditorProps = {
  program: Block[];
  onChange: (p: Block[]) => void;
  groups: Group[];
  mode: "stack" | "hats";
  activeId?: string | null;
  disabled?: boolean;
  sprites?: SpriteOpt[];
  spriteDefault?: string;
  title: ReactNode;
  toolbar?: ReactNode;
  onNotice?: (msg: string) => void;
  onAdd?: () => void;
};

/** Au doigt : le bloc flotte au-dessus du doigt pour rester visible. */
export const TOUCH_LIFT = 34;
/** Au doigt : appui immobile qui « attrape » le bloc (sinon un glissé vertical fait défiler). */
export const HOLD_MS = 160;

/** Bloc d'id donné, cherché dans tout l'arbre. */
export function findBlock(list: Block[], id: string): Block | null {
  for (const bl of list) {
    if (bl.id === id) return bl;
    const inner =
      findBlock(bl.children ?? [], id) ?? findBlock(bl.alt ?? [], id);
    if (inner) return inner;
  }
  return null;
}
