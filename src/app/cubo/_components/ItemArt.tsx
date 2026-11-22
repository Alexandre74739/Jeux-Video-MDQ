import { Cubo } from "@/_components/ui/Cubo";
import { TRAILS, type Item, type Outfit, type Slot } from "@/lib/rewards";

/** Vignette d'un objet de la garde-robe : Cubo qui le porte, ou les couleurs de la traînée. */
export function ItemArt({
  slot,
  item,
  outfit,
}: {
  slot: Slot;
  item: Item;
  outfit: Outfit;
}) {
  if (slot !== "trail")
    return <Cubo size={58} outfit={{ ...outfit, [slot]: item.id }} />;
  const t = TRAILS.find((x) => x.id === item.id)!;
  return (
    <span
      className="flex h-16 items-center justify-center gap-1"
      aria-hidden="true"
    >
      {t.colors.length === 0 ? (
        <span className="font-display text-2xl font-bold text-ink-soft">—</span>
      ) : (
        t.colors
          .slice(0, 5)
          .map((c, i) => (
            <span
              key={i}
              className="block rounded-full border-2 border-ink"
              style={{ background: c, width: 10 + i * 3, height: 10 + i * 3 }}
            />
          ))
      )}
    </span>
  );
}
