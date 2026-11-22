import { sfx } from "@/lib/sound";
import { Avatar, SPRITES } from "./Avatar";

/** Grille des personnages d'une catégorie, utilisable comme un groupe de boutons radio. */
export function AvatarGrid({
  category,
  value,
  onChange,
}: {
  category: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="mt-2 grid max-h-52 grid-cols-6 gap-1.5 overflow-y-auto rounded-2xl bg-cream p-2 sm:grid-cols-7"
      role="radiogroup"
      aria-label={`Avatars : ${category}`}
    >
      {SPRITES.filter((s) => s.category === category).map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={value === s.id}
          aria-label={s.name}
          title={s.name}
          onClick={() => {
            onChange(s.id);
            sfx("pop");
          }}
          className={`grid aspect-square place-items-center rounded-2xl border-[3px] p-1 ${value === s.id ? "border-ink bg-sun" : "border-transparent bg-paper hover:border-ink/30"}`}
        >
          <Avatar id={s.id} size={34} />
        </button>
      ))}
    </div>
  );
}
