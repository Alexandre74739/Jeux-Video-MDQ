/** Navigateur et système de l'appareil, pour expliquer comment installer l'application. */
export type Platform =
  | "ios"
  | "safari-mac"
  | "firefox-windows"
  | "firefox-desktop"
  | "firefox-android"
  | "samsung"
  | "chromium";

export function detect(): Platform {
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return "ios";
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Firefox|FxiOS/.test(ua)) {
    if (/Android/.test(ua)) return "firefox-android";
    return /Windows/.test(ua) ? "firefox-windows" : "firefox-desktop";
  }
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua))
    return "safari-mac";
  return "chromium";
}

export const STEPS: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: "Sur iPhone / iPad",
    steps: [
      "Touche le bouton Partager (carré avec une flèche vers le haut).",
      "Choisis « Sur l'écran d'accueil ».",
      "Touche « Ajouter » : Cubo apparaît sur l'écran d'accueil !",
    ],
  },
  "safari-mac": {
    title: "Sur Safari (Mac)",
    steps: [
      "Ouvre le menu « Fichier ».",
      "Choisis « Ajouter au Dock ».",
      "CuboCode s'ouvre ensuite comme une vraie application.",
    ],
  },
  "firefox-android": {
    title: "Sur Firefox (Android)",
    steps: [
      "Touche le menu ⋮ en haut à droite.",
      "Choisis « Installer » (ou « Ajouter à l'écran d'accueil »).",
    ],
  },
  samsung: {
    title: "Sur Samsung Internet",
    steps: [
      "Touche le menu ≡ en bas.",
      "Choisis « Ajouter la page à » puis « Écran d'accueil ».",
    ],
  },
  chromium: {
    title: "Sur Edge / Chrome",
    steps: [
      "Clique sur l'icône d'installation à droite de la barre d'adresse.",
      "Ou ouvre le menu ⋯ › Applications › « Installer CuboCode ».",
    ],
  },
  "firefox-windows": {
    title: "Sur Firefox (Windows)",
    steps: [
      "Clique sur l'icône « applications web » qui apparaît dans la barre d'adresse.",
      "Choisis « Ajouter à la barre des tâches » : CuboCode s'ouvre comme une application et apparaît dans le menu Démarrer.",
      "Pas d'icône ? Mets Firefox à jour (version 143 ou plus). La version du Microsoft Store ne le permet pas : utilise alors le bouton Edge ci-dessous.",
    ],
  },
  "firefox-desktop": {
    title: "Sur Firefox (Mac / Linux)",
    steps: [
      "Firefox permet l'installation seulement sur Windows pour l'instant.",
      "Sur Mac, ouvre CuboCode avec Safari (Fichier › Ajouter au Dock) ou Chrome.",
      "Sur Linux, ouvre-le avec Chrome ou Edge puis clique sur « Installer l'appli ».",
    ],
  },
};
