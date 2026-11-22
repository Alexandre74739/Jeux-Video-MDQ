"use client";
import { Trash2 } from "lucide-react";
import BlockEditor from "@/_components/game/BlockEditor";
import type { SpriteDef } from "@/lib/runtime";
import { ICON_STROKE } from "@/lib/site";
import { GROUPS } from "./blockGroups";
import type { StudioState } from "./useStudio";

/** Éditeur de blocs du personnage choisi, avec son nom modifiable et le bouton Supprimer. */
export function SpriteProgram({
  s,
  sprite,
  sprites,
  running,
}: {
  s: StudioState;
  sprite: SpriteDef;
  sprites: SpriteDef[];
  running: boolean;
}) {
  const others = sprites
    .filter((o) => o.id !== sprite.id)
    .map((o) => ({ id: o.id, name: o.name }));
  return (
    <BlockEditor
      key={sprite.id}
      program={sprite.scripts}
      onChange={(p) => s.updateSprite(sprite.id, { scripts: p })}
      groups={GROUPS}
      mode="hats"
      disabled={running}
      sprites={others}
      spriteDefault={others[0]?.id ?? ""}
      onNotice={s.notify}
      title={
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sprite.src} alt="" className="size-8 object-contain" />
          <span className="hidden 2xl:inline">Programme de</span>
          <input
            value={sprite.name}
            maxLength={16}
            aria-label="Nom du personnage"
            onChange={(e) =>
              s.updateSprite(sprite.id, { name: e.target.value })
            }
            className="w-28 min-w-0 rounded-full border-[3px] border-ink bg-paper px-2 font-display text-base font-bold"
          />
        </span>
      }
      toolbar={
        sprites.length > 1 && (
          <button
            onClick={() => s.removeSprite(sprite.id)}
            className="btn flex items-center gap-1 bg-paper px-3 py-0.5 text-sm"
          >
            <Trash2 size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
            Supprimer
          </button>
        )
      }
    />
  );
}
