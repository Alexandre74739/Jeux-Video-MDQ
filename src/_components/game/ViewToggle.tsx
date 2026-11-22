"use client";
import { sfx } from "@/lib/sound";

/** Bouton qui passe le monde de la 3D à la vue de dessus (2D), et inversement. */
export default function ViewToggle({
  view3d,
  onChange,
  className = "",
}: {
  view3d: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => {
        onChange(!view3d);
        sfx("click");
      }}
      className={`btn bg-paper px-3 py-1 text-sm ${className}`}
      aria-label={view3d ? "Passer en vue 2D" : "Passer en vue 3D"}
    >
      {view3d ? "Vue 2D" : "Vue 3D"}
    </button>
  );
}
