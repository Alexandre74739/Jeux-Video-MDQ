"use client";
import type { Block } from "@/lib/blocks";
import { DragGhost } from "./editor/DragGhost";
import { Palette } from "./editor/Palette";
import { ProgramArea } from "./editor/ProgramArea";
import type { EditorProps } from "./editor/types";
import { useBlockDrag } from "./editor/useBlockDrag";
import { useProgramEdit } from "./editor/useProgramEdit";

/** Éditeur de blocs : palette à gauche, programme à droite, glisser-déposer ou clic/clavier. */
export default function BlockEditor(props: EditorProps) {
  const { program, groups, mode, disabled, sprites } = props;
  const edit = useProgramEdit(props);
  const dnd = useBlockDrag({
    ...props,
    // Simple clic : un bloc de la palette est ajouté, un bloc du programme est sélectionné.
    onTap: (p) =>
      p.fromPalette ? edit.quickAdd(p.block) : edit.select(p.block.id),
  });
  const grab = (fromPalette: boolean) => (e: React.PointerEvent, b: Block) =>
    dnd.startDrag(e, b, fromPalette);

  return (
    <div className="flex min-h-[640px] flex-1 flex-col gap-3 md:min-h-[520px] md:flex-row lg:min-h-0">
      <Palette
        groups={groups}
        dragging={!!dnd.drag}
        overTrash={dnd.overTrash}
        disabled={disabled}
        sprites={sprites}
        spriteDefault={props.spriteDefault ?? ""}
        onAdd={edit.quickAdd}
        onGrab={grab(true)}
      />
      <ProgramArea
        program={program}
        mode={mode}
        title={props.title}
        toolbar={props.toolbar}
        scrollRef={dnd.scrollRef}
        edit={edit}
        activeId={props.activeId}
        hiddenId={dnd.hiddenId}
        disabled={disabled}
        dragging={!!dnd.drag}
        sprites={sprites}
        onGrab={grab(false)}
      />
      {dnd.drag && (
        <DragGhost
          drag={dnd.drag}
          target={dnd.target}
          overTrash={dnd.overTrash}
          sprites={sprites}
        />
      )}
    </div>
  );
}
