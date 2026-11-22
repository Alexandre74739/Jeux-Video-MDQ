import LIBRARY from "@/lib/sprites.json";

export type Sprite = {
  id: string;
  name: string;
  category: string;
  src: string;
};

export const SPRITES = (LIBRARY as Sprite[]).filter((s) => s.id !== "coffre");

export const CATEGORIES = [...new Set(SPRITES.map((s) => s.category))];

/** Avatar : personnage de la bibliothèque (id) ou photo importée (data:…), toujours dans un rond. */
export function Avatar({ id, size = 40 }: { id: string; size?: number }) {
  const photo = id.startsWith("data:");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo ? id : `/sprites/${id}.svg`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`select-none ${photo ? "rounded-full border-2 border-ink object-cover" : ""}`}
      style={{ width: size, height: size }}
    />
  );
}
