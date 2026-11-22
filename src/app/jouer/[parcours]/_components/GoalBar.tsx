import type { ReactNode } from "react";
import { Check } from "lucide-react";

/** Objectif à atteindre pour ouvrir le monde secret, avec sa barre de progression. */
export function GoalBar({
  icon,
  label,
  have,
  need,
}: {
  icon: ReactNode;
  label: string;
  have: number;
  need: number;
}) {
  const ok = have >= need;
  return (
    <div className="mt-4 text-left">
      <p className="flex items-center justify-between gap-2 font-display text-lg font-bold">
        <span className="flex items-center gap-2">
          {icon} {label}
        </span>
        <span className="flex items-center gap-1">
          {Math.min(have, need)} / {need}
          {ok && (
            <Check
              size={20}
              strokeWidth={3.5}
              className="text-[#22B377]"
              aria-label="fait"
            />
          )}
        </span>
      </p>
      <div
        className="mt-1.5 h-5 overflow-hidden rounded-full border-[3px] border-ink bg-cream"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={need}
        aria-valuenow={Math.min(have, need)}
        aria-label={`${label} : ${Math.min(have, need)} sur ${need}`}
      >
        <div
          className={`h-full ${ok ? "bg-mint" : "bg-sun"}`}
          style={{ width: `${Math.min(100, (have / need) * 100)}%` }}
        />
      </div>
    </div>
  );
}
