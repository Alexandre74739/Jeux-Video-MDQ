# CuboCode

Site pour apprendre à coder par blocs (6–10 ans) : un tutoriel et 7 défis (8 parcours de 10 niveaux, 80 niveaux en 3D), puis un mode « Création libre » pour inventer son jeu.

## Pages
- `/` : accueil
- `/jouer/` : choix des défis
- `/jouer/tutoriel/` : le tutoriel (10 niveaux)
- `/jouer/<parcours>/` : vallée des clés, rivière des castors, volcan, village des monstres, labyrinthe, château du dragon, île secrète (10 niveaux chacun)
- `/creer/` : création libre
- `/solutions/` : solutions pour les animateurs

## Développement
```bash
npm install
npm run dev        # http://localhost:3000 (site + sauvegarde en ligne)
npm run build      # export statique dans out/ + service worker hors-ligne
npm start          # sert out/ en local
npm run verify     # vérifie que la solution de chacun des 80 niveaux gagne
npm run sprites    # (re)télécharge les images OpenMoji dans public/sprites
npm run voices     # (re)génère les fichiers audio de la voix de Cubo
```

## Déploiement sur Vercel
Importer le dossier dans Vercel (framework détecté : Next.js). Aucun réglage à changer :
la commande `npm run build` génère le site statique et le service worker.

## Joueurs et sauvegarde en ligne
- Plusieurs joueurs par appareil (bouton avatar dans l'en-tête) : chacun a ses étoiles, badges, tenue et programmes.
- Sauvegarde en ligne facultative : pseudo + code secret de 4 images (aucun e-mail, aucune donnée personnelle).
  La progression reste d'abord sur l'appareil ; la synchronisation fusionne en gardant le meilleur (aucune perte possible).
- Serveur : fonctions Vercel dans `api/` (`cloud.ts` pour les comptes, `keepalive.ts` appelée chaque jour par un cron
  pour éviter la mise en pause de MongoDB Atlas gratuit après 30 jours sans connexion).
- Configuration : variable d'environnement `MONGODB_URI` dans Vercel (et dans `.env` en local, jamais commité).
- En local, `npm run dev` lance le site (port 3000) et les fonctions de `api/` (port 3001, lues depuis `.env`).
  `npm run dev:web` lance le site seul (la sauvegarde en ligne affiche alors « pas disponible »).

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
