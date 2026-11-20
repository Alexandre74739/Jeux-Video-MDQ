// Télécharge une sélection d'images OpenMoji (CC BY-SA 4.0) adaptées aux enfants
// depuis l'API CDN jsDelivr, et les enregistre dans /public/sprites.
// Les images sont livrées avec le site : il fonctionne ensuite sans connexion.
// Usage : npm run sprites
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const VERSION = "15.1.0";
const BASE = `https://cdn.jsdelivr.net/npm/openmoji@${VERSION}/color/svg/`;

const LIST = {
  Animaux: [
    ["1F408", "Chat"], ["1F415", "Chien"], ["1F407", "Lapin"], ["1F438", "Grenouille"],
    ["1F981", "Lion"], ["1F43C", "Panda"], ["1F427", "Pingouin"], ["1F984", "Licorne"],
    ["1F996", "Dino"], ["1F995", "Diplo"], ["1F41D", "Abeille"], ["1F98B", "Papillon"],
    ["1F420", "Poisson"], ["1F419", "Pieuvre"], ["1F422", "Tortue"], ["1F40C", "Escargot"],
    ["1F989", "Hibou"], ["1F98A", "Renard"], ["1F988", "Requin"], ["1F433", "Baleine"],
  ],
  Héros: [
    ["1F916", "Robot"], ["1F47E", "Monstre"], ["1F47B", "Fantôme"], ["1F9D9", "Magicien"],
    ["1F9DA", "Fée"], ["1F977", "Ninja"], ["1F9B8", "Super-héros"], ["1F478", "Princesse"],
    ["1F934", "Prince"], ["1F9DC", "Sirène"], ["1F9D1-200D-1F680", "Astronaute"], ["1F409", "Dragon"],
    ["1F47D", "Alien"], ["1F9DB", "Vampire"], ["1F383", "Citrouille"], ["1F9DE", "Génie"],
  ],
  Objets: [
    ["2B50", "Étoile"], ["1F48E", "Diamant"], ["1FA99", "Pièce"], ["1F381", "Cadeau"],
    ["1F3C6", "Trophée"], ["1F511", "Clé"], ["2764", "Cœur"], ["1F388", "Ballon"],
    ["26BD", "Foot"], ["1F3C0", "Basket"], ["1F4A3", "Bombe"], ["1F6A9", "Drapeau"],
    ["1F451", "Couronne"], ["1F344", "Champignon"], ["1F4E6", "Caisse"], ["1F9F2", "Aimant"],
  ],
  Miam: [
    ["1F34E", "Pomme"], ["1F34C", "Banane"], ["1F353", "Fraise"], ["1F355", "Pizza"],
    ["1F369", "Donut"], ["1F36A", "Cookie"], ["1F366", "Glace"], ["1F955", "Carotte"],
    ["1F349", "Pastèque"], ["1F9C1", "Cupcake"], ["1F36D", "Sucette"], ["1F354", "Burger"],
  ],
  Véhicules: [
    ["1F680", "Fusée"], ["1F6F8", "Soucoupe"], ["1F697", "Voiture"], ["1F682", "Train"],
    ["1F681", "Hélico"], ["2708", "Avion"], ["26F5", "Bateau"], ["1F6B2", "Vélo"],
    ["1F3CE", "Bolide"], ["1F69C", "Tracteur"], ["1F6F6", "Canoë"], ["1F6FC", "Patin"],
  ],
  Nature: [
    ["1F333", "Arbre"], ["1F335", "Cactus"], ["1F33B", "Tournesol"], ["1F308", "Arc-en-ciel"],
    ["26A1", "Éclair"], ["2744", "Flocon"], ["1F525", "Feu"], ["1FAA8", "Rocher"],
    ["1F30B", "Volcan"], ["1F340", "Trèfle"], ["2600", "Soleil"], ["2601", "Nuage"],
    ["1FA90", "Planète"], ["1F319", "Lune"], ["2604", "Comète"], ["1F30D", "Terre"],
  ],
};

async function get(code) {
  for (const c of [code, `${code}-FE0F`]) {
    const res = await fetch(BASE + c + ".svg");
    if (res.ok) return await res.text();
  }
  return null;
}

await mkdir("public/sprites", { recursive: true });
const manifest = [];
for (const [category, items] of Object.entries(LIST)) {
  for (const [code, name] of items) {
    const file = `${code.toLowerCase()}.svg`;
    const dest = `public/sprites/${file}`;
    if (!existsSync(dest)) {
      const svg = await get(code);
      if (!svg) { console.warn("✗ introuvable", code, name); continue; }
      await writeFile(dest, svg);
      console.log("✓", name);
    }
    manifest.push({ id: code.toLowerCase(), name, category, src: `/sprites/${file}` });
  }
}
await writeFile("lib/sprites.json", JSON.stringify(manifest, null, 2));
console.log(`${manifest.length} images prêtes.`);
