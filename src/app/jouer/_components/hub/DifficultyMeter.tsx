import { DIFFICULTY } from "@/lib/levels";

/** Difficulté d'un parcours : 4 barres de plus en plus hautes et son nom. */
export function DifficultyMeter({ level }: { level: number }) {
  return (
    <span
      className="flex items-center gap-2"
      aria-label={`Difficulté : ${DIFFICULTY[level]}, ${level} sur 4`}
    >
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-4 w-3 rounded-sm border-2 border-ink ${i <= level ? "bg-ink" : "bg-paper"}`}
            style={{ height: 8 + i * 3 }}
          />
        ))}
      </span>
      <span className="font-display text-base font-bold">
        {DIFFICULTY[level]}
      </span>
    </span>
  );
}
