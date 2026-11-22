"use client";
import { BLOCKS, CATEGORIES } from "@/lib/blocks";
import { BlockHeader } from "./block/BlockHeader";
import { InnerList } from "./block/InnerList";
import type { BlockProps } from "./block/types";

export type { SpriteOpt } from "./block/types";
export { AnimatedBlock } from "./block/AnimatedBlock";

/** Bloc de code : dans la palette, dans le programme (modifiable) ou figé (exemples, solutions). */
export function BlockView(props: BlockProps) {
  const { block, mode, activeId, onPointerDown } = props;
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
      // Au doigt : défilement vertical laissé au navigateur, glissé horizontal ou appui long = attraper le bloc
      style={
        mode !== "static"
          ? {
              touchAction: "pan-y",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
            }
          : undefined
      }
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
            <div
              className="h-4 w-24 rounded-lg border-[3px] border-ink/50"
              style={{ background: cat.soft }}
            />
          </div>
        )}
        {def.container && mode === "palette" && def.hasElse && (
          <>
            <div className="px-3 pb-1 text-[15px]">sinon</div>
            <div className="px-2 pb-2">
              <div
                className="h-4 w-24 rounded-lg border-[3px] border-ink/50"
                style={{ background: cat.soft }}
              />
            </div>
          </>
        )}
        {def.container && mode !== "palette" && (
          <>
            <div className="px-2 pb-2.5">
              <InnerList
                {...props}
                listId={block.id}
                items={block.children ?? []}
                soft={cat.soft}
              />
            </div>
            {def.hasElse && (
              <>
                <div className="-mt-1 px-3 pb-1">sinon</div>
                <div className="px-2 pb-2.5">
                  <InnerList
                    {...props}
                    listId={`${block.id}:alt`}
                    items={block.alt ?? []}
                    soft={cat.soft}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
