import { Check } from "lucide-react";

/** Étapes numérotées d'un formulaire : faites (coche), en cours, à venir. */
export function StepDots({ steps, step }: { steps: string[]; step: number }) {
  return (
    <ol
      className="mt-4 flex items-center justify-center gap-2"
      aria-label={`Étape ${step + 1} sur ${steps.length} : ${steps[step]}`}
    >
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          {i > 0 && (
            <span
              className={`h-0.75 w-6 rounded-full ${i <= step ? "bg-ink" : "bg-ink/20"}`}
              aria-hidden="true"
            />
          )}
          <span
            className={`grid size-8 place-items-center rounded-full border-[3px] font-display text-sm font-bold ${i < step ? "border-ink bg-mint" : i === step ? "border-ink bg-sun" : "border-ink/25 text-ink/40"}`}
            title={s}
          >
            {i < step ? (
              <Check size={14} strokeWidth={3.5} aria-hidden="true" />
            ) : (
              i + 1
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
