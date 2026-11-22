// Informations générales du site (métadonnées, SEO, pages légales).

/** Adresse publique du site : à définir dans Vercel (NEXT_PUBLIC_SITE_URL) si un domaine est utilisé. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://jeux-video-mdq.vercel.app"
).replace(/\/$/, "");
export const SITE_NAME = "CuboCode";
export const SITE_TITLE = "CuboCode : crée ton jeu vidéo";
export const SITE_DESCRIPTION =
  "Apprends à coder en t'amusant : glisse des blocs, guide Cubo et crée ton propre jeu vidéo. Pour les 6 à 10 ans, sans compte ni publicité.";

/** Éditeur du site (mentions légales). */
export const PUBLISHER = {
  name: "Alexandre-Philippe Perez",
  contact:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "perezalexandre430@gmail.com",
};

/** Couleur de trait de la charte (identique au token CSS --color-ink), pour les SVG et styles en ligne. */
export const INK = "#16123A";
/** Épaisseur de trait des icônes Lucide, partout sur le site. */
export const ICON_STROKE = 2.75;
