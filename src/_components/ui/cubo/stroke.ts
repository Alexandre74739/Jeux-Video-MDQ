/** Couleur d'encre des contours de Cubo. */
export const INK = "#16123A";

/** Contour encré aux angles arrondis, d'épaisseur `w`. */
export const outline = (w: number) => ({
  stroke: INK,
  strokeWidth: w,
  strokeLinejoin: "round" as const,
});

/** Trait encré aux bouts arrondis, d'épaisseur `w`, sans remplissage. */
export const line = (w: number) => ({
  fill: "none",
  stroke: INK,
  strokeWidth: w,
  strokeLinecap: "round" as const,
});
