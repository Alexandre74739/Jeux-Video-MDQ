"use client";
import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { resizeImage } from "@/lib/image";
import { ICON_STROKE } from "@/lib/site";

/** Bouton pour importer un dessin ou une photo comme personnage (réduit à 160 px). */
export function ImageImportButton({
  onPick,
  onError,
}: {
  onPick: (name: string, src: string) => void;
  onError: (m: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const importFile = async (f: File) => {
    try {
      const src = await resizeImage(f, 160);
      onPick(f.name.replace(/\.[^.]+$/, "").slice(0, 14) || "Image", src);
    } catch {
      onError("Oups, cette image ne marche pas.");
    }
  };

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        className="btn ml-auto flex items-center gap-2 bg-sky px-4 py-1.5"
      >
        <ImagePlus size={19} strokeWidth={ICON_STROKE} aria-hidden="true" />{" "}
        Importer une image
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) importFile(f);
        }}
      />
    </>
  );
}
