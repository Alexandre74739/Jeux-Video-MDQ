# CuboCode

Site pour apprendre à coder par blocs (6–10 ans) : une aventure de 10 niveaux en 3D, puis un mode « Création libre » pour inventer son jeu.

## Pages
- `/` : accueil
- `/jouer/` : l'aventure (10 niveaux)
- `/creer/` : création libre
- `/solutions/` : solutions pour les animateurs

## Développement
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # export statique dans out/ + service worker hors-ligne
npm start          # sert out/ en local
npm run verify     # vérifie que la solution de chaque niveau gagne
npm run sprites    # (re)télécharge les images OpenMoji dans public/sprites
```

## Déploiement sur Vercel
Importer le dossier dans Vercel (framework détecté : Next.js). Aucun réglage à changer :
la commande `npm run build` génère le site statique et le service worker.

## Hors-ligne
À la première visite, le service worker met tout le site en cache (pages, scripts, images, polices).
Ensuite, le site fonctionne même si la connexion coupe. Les sons sont synthétisés (aucun fichier audio),
la voix utilise la synthèse vocale du système.

## Crédits
Images des personnages : [OpenMoji](https://openmoji.org), licence CC BY-SA 4.0.
Icônes : [Lucide](https://lucide.dev), licence ISC.
