// Phrases dites par Cubo. Chaque phrase a un fichier audio pré-enregistré (voir scripts/build-voices.ts).
// Fichier sans import : lisible par les scripts Node.

export const CHEERS = [
  "Bien joué !",
  "Génial !",
  "Trop fort !",
  "Tu es un vrai codeur !",
  "Incroyable !",
];

export const LINES = {
  hello: "Salut ! Moi, c'est Cubo. Prêt pour l'aventure ? C'est parti !",
  go: "C'est parti !",
  treasure: "Cubo a trouvé le trésor !",
  retry: "Essaie encore !",
  keepGoing:
    "Ne lâche rien ! Les vrais codeurs se trompent souvent, c'est comme ça qu'on apprend.",
  locked:
    "Le phare de l'île est encore éteint. Gagne des étoiles pour l'allumer !",
};

export const tipLine = (tip: string) => `Astuce : ${tip}`;
export const winLine = (stars: number) =>
  `Bravo ! Tu as gagné ${stars} étoile${stars > 1 ? "s" : ""} !`;
export const badgeLine = (name: string) => `Nouveau badge : ${name} !`;
export const giftLine = (name: string) => `Cadeau pour Cubo : ${name} !`;

/** Texte réellement prononcé (sans guillemets ni flèches). */
export function spoken(text: string) {
  return text
    .replace(/[«»"]/g, "")
    .replace(/\s*→\s*/g, ", ")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/** Identifiant court et stable d'une phrase (nom du fichier audio). */
export function lineId(text: string) {
  const s = spoken(text);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}
