# CuboCode

Site pour apprendre à coder par blocs (6–10 ans) : un tutoriel et 3 défis (40 niveaux en 3D), puis un mode « Création libre » pour inventer son jeu.

## Pages
- `/` : accueil
- `/jouer/` : choix des défis
- `/jouer/tutoriel/` : le tutoriel (10 niveaux)
- `/jouer/vallee-des-cles/`, `/jouer/volcan/`, `/jouer/labyrinthe/` : 3 défis de 10 niveaux, de plus en plus difficiles
- `/creer/` : création libre
- `/solutions/` : solutions pour les animateurs

## Développement
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # export statique dans out/ + service worker hors-ligne
npm start          # sert out/ en local
npm run verify     # vérifie que la solution de chacun des 40 niveaux gagne
npm run sprites    # (re)télécharge les images OpenMoji dans public/sprites
npm run voices     # (re)génère les fichiers audio de la voix de Cubo
```

## Déploiement sur Vercel
Importer le dossier dans Vercel (framework détecté : Next.js). Aucun réglage à changer :
la commande `npm run build` génère le site statique et le service worker.

## Hors-ligne
À la première visite, le service worker met tout le site en cache (pages, scripts, images, polices).
Ensuite, le site fonctionne même si la connexion coupe. Les sons sont synthétisés (aucun fichier audio),
la voix utilise la synthèse vocale du système.

## Application installable (PWA)
Le site est installable (icône de Cubo sur fond bleu) depuis la barre d'adresse du navigateur.

### Mises à jour automatiques
Chaque push sur `main` déclenche un déploiement Vercel. Le build génère un nouveau `sw.js`
(version calculée à partir du contenu des fichiers et du commit). Les postes ouverts ou l'appli
installée vérifient les mises à jour au chargement, toutes les 15 minutes et au retour sur l'onglet,
puis rechargent automatiquement la page avec la nouvelle version. `vercel.json` empêche la mise
en cache de `sw.js` et du manifeste.

## Voix
Cubo a une seule voix : Thierry (voix neuronale). Toutes ses phrases sont pré-enregistrées dans
`public/voice/thierry/` (une phrase = un fichier MP3, liste dans `lib/voice-manifest.json`).
Après avoir ajouté ou modifié un texte (niveaux, histoire, badges…), lancer `npm run voices` :
seules les phrases nouvelles sont générées et les fichiers inutilisés sont supprimés.
Les fichiers audio sont téléchargés en arrière-plan après la première visite pour fonctionner hors-ligne ;
si un fichier manque, la synthèse vocale du navigateur prend le relais. Le menu son permet de couper
la voix seule (les effets sonores restent actifs), de régler sa vitesse et la lecture automatique.

## Crédits
Conçu et développé par Alexandre-Philippe Perez, développeur chez [fablioo.com](https://fablioo.com).

Images des personnages : [OpenMoji](https://openmoji.org), licence CC BY-SA 4.0.
Icônes : [Lucide](https://lucide.dev), licence ISC.
