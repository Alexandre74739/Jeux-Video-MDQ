import type { ReactNode } from "react";
import type { Block } from "@/lib/blocks";

export type SpriteOpt = { id: string; name: string };

export type BlockProps = {
  block: Block;
  mode: "palette" | "edit" | "static";
  activeId?: string | null;
  sprites?: SpriteOpt[];
  onParam?: (id: string, key: string, value: string | number) => void;
  onPointerDown?: (e: React.PointerEvent, block: Block) => void;
  renderChild?: (b: Block) => ReactNode;
};
