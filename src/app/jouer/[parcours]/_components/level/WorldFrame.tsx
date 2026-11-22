"use client";
import { Gem, KeyRound } from "lucide-react";
import { BumpNumber } from "@/_components/animations/BumpNumber";
import ViewToggle from "@/_components/game/ViewToggle";
import World2D from "@/_components/game/World2D";
import World3DLazy from "@/_components/game/World3DLazy";
import { useView3d } from "@/hooks/useView3d";
import { ICON_STROKE } from "@/lib/site";
import type { LevelGameState } from "./useLevelGame";

const counter =
  "toon flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 font-display font-bold";

/** Cadre du monde (3D ou 2D), avec les clés et gemmes ramassées. Il tremble quand le programme échoue. */
export function WorldFrame({ g }: { g: LevelGameState }) {
  const { world, initial, shake } = g;
  const [view3d, setView3d] = useView3d();
  const fallback2D = <World2D world={world} />;
  return (
    <div
      key={shake}
      className={`relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-3xl border-[3px] border-ink shadow-pop sm:aspect-16/10 lg:aspect-auto lg:min-h-0 lg:flex-1 ${shake ? "shake" : ""}`}
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)",
      }}
    >
      {/* La vue remplit exactement le cadre (taille définie aussi sur mobile/tablette) */}
      <div className="absolute inset-0">
        {g.ready &&
          view3d !== null &&
          (view3d ? (
            <World3DLazy world={world} event={g.event} fallback={fallback2D} />
          ) : (
            fallback2D
          ))}
      </div>
      <div className="absolute top-2 left-2 flex flex-wrap gap-2">
        {initial.keys.length > 0 && (
          <span className={counter} title="Clés dans le sac">
            <KeyRound
              size={18}
              strokeWidth={ICON_STROKE}
              color="#7A5A00"
              aria-hidden="true"
            />{" "}
            <BumpNumber value={world.keysHeld} />
            <span className="sr-only">clés</span>
          </span>
        )}
        {initial.totalGems > 0 && (
          <span className={counter}>
            <Gem
              size={18}
              strokeWidth={ICON_STROKE}
              color="#0A6F86"
              aria-hidden="true"
            />{" "}
            <BumpNumber value={initial.totalGems - world.gems.length} /> /{" "}
            {initial.totalGems}
          </span>
        )}
      </div>
      <ViewToggle
        view3d={view3d ?? true}
        onChange={setView3d}
        className="absolute top-2 right-2"
      />
    </div>
  );
}
