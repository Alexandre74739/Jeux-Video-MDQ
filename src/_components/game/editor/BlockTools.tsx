"use client";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

const tool =
  "grid size-8 place-items-center rounded-lg border-2 border-ink bg-paper shadow-pop hover:bg-cream";

/** Boutons du bloc sélectionné : monter, descendre, supprimer (sans glisser-déposer). */
export function BlockTools({
  onMove,
  onRemove,
}: {
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="absolute -top-4 right-1 z-20 flex gap-1"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={tool}
        onClick={() => onMove(-1)}
        aria-label="Monter le bloc"
      >
        <ArrowUp size={16} strokeWidth={3} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={tool}
        onClick={() => onMove(1)}
        aria-label="Descendre le bloc"
      >
        <ArrowDown size={16} strokeWidth={3} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={tool}
        onClick={onRemove}
        aria-label="Supprimer le bloc"
      >
        <Trash2 size={16} strokeWidth={3} aria-hidden="true" />
      </button>
    </div>
  );
}
