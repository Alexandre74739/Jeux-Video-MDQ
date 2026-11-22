"use client";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { resizeImage } from "@/lib/image";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import { Avatar, CATEGORIES } from "./Avatar";
import { AvatarGrid } from "./AvatarGrid";

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

  const importPhoto = async (f: File) => {
    try {
      onChange(await resizeImage(f, 128, { square: true, type: "image/jpeg" }));
      setPhotoError(false);
      sfx("pop");
    } catch {
      setPhotoError(true);
    }
  };

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
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) importPhoto(f);
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
      <AvatarGrid category={cat} value={value} onChange={onChange} />
    </div>
  );
}
