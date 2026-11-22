import { Icon } from "@/_components/icons/Icon";
import { BADGES } from "@/lib/rewards";

/** Tous les badges : gagnés, à débloquer, ou secrets (avec un indice). */
export function BadgeList({ owned }: { owned: string[] }) {
  return (
    <section className="toon mt-12 rounded-[30px] bg-paper p-6">
      <h2 className="text-2xl font-bold">
        Mes badges{" "}
        <span className="text-lg text-ink-soft">
          ({owned.length} / {Object.keys(BADGES).length})
        </span>
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(BADGES).map(([k, b]) => {
          const got = owned.includes(k);
          const hidden = b.secret && !got;
          return (
            <li
              key={k}
              className={`flex items-center gap-3 rounded-2xl border-[3px] p-3 ${got ? "border-ink bg-lilac" : "border-ink/20 bg-cream"}`}
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full border-[3px] ${got ? "border-ink bg-sun" : "border-ink/25 text-ink/35"}`}
              >
                {hidden ? (
                  <span className="font-display text-xl font-bold">?</span>
                ) : (
                  <Icon name={b.icon} size={24} />
                )}
              </span>
              <span>
                <span
                  className={`block font-display text-lg font-bold ${got ? "" : "text-ink-soft"}`}
                >
                  {hidden ? "Badge secret" : b.name}
                </span>
                <span className="text-sm font-bold text-ink-soft">
                  {got ? b.text : hidden ? b.hint : "À débloquer…"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
