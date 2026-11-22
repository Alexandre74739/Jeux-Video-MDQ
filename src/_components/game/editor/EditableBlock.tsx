"use client";
import { blockLabel, type Block } from "@/lib/blocks";
import { AnimatedBlock, BlockView } from "../BlockView";
import type { SpriteOpt } from "../block/types";
import { BlockTools } from "./BlockTools";
import type { ProgramEdit } from "./useProgramEdit";

export type EditableProps = {
  edit: ProgramEdit;
  activeId?: string | null;
  hiddenId: string | null;
  disabled?: boolean;
  dragging: boolean;
  sprites?: SpriteOpt[];
  onGrab: (e: React.PointerEvent, b: Block) => void;
};

/** Bloc du programme : sélectionnable au clavier, déplaçable, avec ses blocs enfants. */
export function EditableBlock({
  block: b,
  ...p
}: EditableProps & { block: Block }) {
  const { edit } = p;
  const selected = edit.selectedId === b.id;
  return (
    <AnimatedBlock id={b.id} hidden={b.id === p.hiddenId}>
      <div
        data-block-id={b.id}
        tabIndex={p.disabled ? -1 : 0}
        role="group"
        aria-label={`Bloc « ${blockLabel(b)} ». Suppr pour l'enlever, Alt + flèches pour le déplacer.`}
        onFocus={(e) => {
          if (e.target === e.currentTarget) edit.setSelectedId(b.id);
        }}
        onKeyDown={(e) => edit.onBlockKey(e, b.id)}
        className={`relative rounded-xl outline-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape ${selected ? "outline-4 outline-offset-2 outline-grape/60" : ""}`}
      >
        <BlockView
          block={b}
          mode="edit"
          activeId={p.activeId}
          sprites={p.sprites}
          onParam={edit.onParam}
          onPointerDown={p.onGrab}
          renderChild={(c) => <EditableBlock key={c.id} {...p} block={c} />}
        />
        {selected && !p.disabled && !p.dragging && (
          <BlockTools
            onMove={(d) => edit.move(b.id, d)}
            onRemove={() => edit.remove(b.id)}
          />
        )}
      </div>
    </AnimatedBlock>
  );
}
