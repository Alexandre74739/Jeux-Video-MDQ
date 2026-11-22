"use client";
import { MapPiece, PIECES } from "./MapPiece";
import { MapRoute } from "./MapRoute";

/** Carte au trésor en 4 morceaux (2 × 2). `got[i]` : morceau i trouvé ; `fresh` : morceau qui vient d'arriver. */
export function TreasureMap({
  got,
  fresh,
  size = 220,
}: {
  got: boolean[];
  fresh?: number;
  size?: number;
}) {
  const count = got.filter(Boolean).length;
  return (
    <svg
      viewBox="-6 -6 212 212"
      width={size}
      height={size}
      className="max-w-full"
      role="img"
      aria-label={`Carte au trésor : ${count} morceau${count > 1 ? "x" : ""} sur 4`}
    >
      {PIECES.map((_, i) => (
        <MapPiece key={i} i={i} got={!!got[i]} fresh={fresh === i} />
      ))}
      {count === 4 && <MapRoute />}
    </svg>
  );
}
