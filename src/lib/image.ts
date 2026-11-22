// Réduction d'images importées par l'enfant : elles restent sur l'appareil, en petit format.

type Options = {
  /** Recadre au centre en carré (avatars). */
  square?: boolean;
  /** Format de sortie : PNG garde la transparence (personnages), JPEG est plus léger (photos). */
  type?: "image/png" | "image/jpeg";
};

/** Image réduite à `max` pixels de côté au plus, renvoyée en data URL. */
export async function resizeImage(
  file: File,
  max: number,
  { square = false, type = "image/png" }: Options = {},
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.width, img.height);
    const sw = square ? side : img.width;
    const sh = square ? side : img.height;
    const k = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(sw * k));
    c.height = Math.max(1, Math.round(sh * k));
    c.getContext("2d")!.drawImage(
      img,
      (img.width - sw) / 2,
      (img.height - sh) / 2,
      sw,
      sh,
      0,
      0,
      c.width,
      c.height,
    );
    return c.toDataURL(type, 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
