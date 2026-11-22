"use client";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { resizeImage } from "@/lib/image";
import LIBRARY from "@/lib/sprites.json";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

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

/** Choix d'un avatar : tous les personnages de la création libre, par catégorie, ou une photo. */
export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [cat, setCat] = useState(CATEGORIES[0]);
  const file = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState(false);
  return (
    <div>
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Catégories d'avatars"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            onClick={() => {
              setCat(c);
              sfx("click");
            }}
            className={`rounded-full border-2 border-ink px-3 py-0.5 text-sm font-extrabold ${cat === c ? "bg-grape text-white" : "bg-paper"}`}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={() => file.current?.click()}
          className="flex items-center gap-1 rounded-full border-2 border-ink bg-sun px-3 py-0.5 text-sm font-extrabold"
        >
          <ImagePlus size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
          Ma photo
        </button>
        <input
          ref={file}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              onChange(
                await resizeImage(f, 128, { square: true, type: "image/jpeg" }),
              );
              setPhotoError(false);
              sfx("pop");
            } catch {
              setPhotoError(true);
            }
          }}
        />
      </div>
      {photoError && (
        <p className="mt-2 text-sm font-bold text-[#D9473A]">
          Cette image n'a pas pu être ouverte.
        </p>
      )}
      {value.startsWith("data:") && (
        <p className="mt-2 flex items-center gap-2 text-sm font-bold text-ink-soft">
          <Avatar id={value} size={36} /> Ta photo reste sur cet appareil : elle
          n'est jamais envoyée en ligne.
        </p>
      )}
      <div
        className="mt-2 grid max-h-52 grid-cols-6 gap-1.5 overflow-y-auto rounded-2xl bg-cream p-2 sm:grid-cols-7"
        role="radiogroup"
        aria-label={`Avatars : ${cat}`}
      >
        {SPRITES.filter((s) => s.category === cat).map((s) => (
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
    </div>
  );
}
