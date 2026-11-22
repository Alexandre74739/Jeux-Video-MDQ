# CuboCode

Site pour apprendre à coder par blocs (6–10 ans) : un tutoriel et des défis en 3D (8 parcours de 10 niveaux),
puis un mode « Création libre » pour inventer son jeu. Next.js 16 (App Router, export statique) + fonctions Vercel + MongoDB Atlas.

## Pages

- `/` : accueil
- `/jouer/` : choix des défis ; `/jouer/<parcours>/` : un parcours
- `/creer/` : création libre
- `/cubo/` : la garde-robe de Cubo
- `/solutions/` : solutions pour les animateurs (accès protégé par une question pour adultes, page non indexée)
- `/mentions-legales/`, `/confidentialite/` : pages légales

## Développement

```bash
npm install
cp .env.example .env   # puis renseigner MONGODB_URI
npm run dev            # http://localhost:3000 (site + sauvegarde en ligne sur le port 3001)
npm run dev:web        # le site seul (le menu des joueurs indique que la sauvegarde en ligne n'est pas disponible)
npm run lint           # ESLint (configuration Next.js, règles react-hooks strictes)
npm run format         # formate tout le projet avec Prettier
npm run format:check   # vérifie le formatage sans rien modifier
npm test               # tests unitaires (exécuteur natif de Node, dossier tests/)
npm run verify         # vérifie que la solution de chaque niveau gagne
npm run build          # export statique dans out/ + service worker hors-ligne
npm start              # sert out/ en local
npm run sprites        # (re)télécharge les images OpenMoji dans public/sprites
npm run voices         # (re)génère les fichiers audio de la voix de Cubo
```

## Structure

```
api/                     fonctions serveur Vercel (_mongo.ts, _ratelimit.ts : non exposés)
src/app/                 routes ; chaque route garde ses composants propres dans _components/ ou _sections/
  _sections/             sections de l'accueil, et leurs morceaux par section (adventure/, demo/…)
  jouer/_components/     page des défis (hub/) et page d'un parcours ([parcours]/_components/level/)
  creer/_components/     création libre (studio/ : projet, partie en cours, scène, personnages)
  cubo/_components/      garde-robe de Cubo
src/_components/         composants partagés
  ui/                    ButtonLink, Logo, Cubo (dessin dans cubo/), BackButton, SoundToggle…
  layout/                SiteHeader, MobileMenu, SiteFooter, PageHeader, SWRegister, InstallButton
  game/                  éditeur de blocs (block/, editor/), mondes 2D (world2d/) et 3D (world3d/), histoire (story/)
  profile/               menu des joueurs (menu/ : un fichier par écran) et sauvegarde en ligne
  animations/ icons/ legal/ seo/
src/hooks/               hooks partagés (useEscape, useDismiss, useMounted, useView3d…)
src/lib/                 logique sans interface (niveaux, blocs, moteur, stockage, validation)
tests/                   tests unitaires
scripts/                 build du service worker, voix, sprites, serveur d'API local
```

Conventions :

- Un composant par fichier, nommé en PascalCase ; les hooks commencent par `use` ; les fichiers `.tsx` font
  au plus 100 lignes environ : au-delà, on les découpe en sous-composants rangés dans un sous-dossier du même nom.
- Alias `@/*` → `src/*`. Imports relatifs (`./`, `../`) seulement à l'intérieur d'une même route, d'un même dossier
  de composants (et de ses sous-dossiers) ou de `lib/`.
- Code formaté avec Prettier (réglages par défaut) : lancer `npm run format` avant de commiter.

## Variables d'environnement

Voir [.env.example](.env.example) : `MONGODB_URI`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`.
À définir dans Vercel (Settings → Environment Variables) et dans `.env` en local (jamais commité).

## Déploiement sur Vercel

`vercel.json` fixe la commande (`npm run build`), le dossier `out/`, la tâche planifiée et les en-têtes de sécurité
(CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy). Chaque push sur `main` déclenche un déploiement.

## Joueurs et sauvegarde en ligne

- Plusieurs joueurs par appareil (bouton avatar dans l'en-tête) : chacun a ses étoiles, ses badges, sa tenue et ses programmes.
- Sauvegarde en ligne facultative : pseudo + code secret de 4 chiffres (aucune adresse e-mail).
  La progression reste d'abord sur l'appareil ; la synchronisation fusionne en gardant le meilleur (aucune perte possible).
- Sécurité (`api/cloud.ts`) : code haché (scrypt + sel), essais réservés de façon atomique (5 essais, puis verrouillage
  de 15 min, doublé à chaque fois jusqu'à 24 h), limite d'appels par adresse IP (`api/_ratelimit.ts`), connexions qui
  expirent après 6 mois sans usage, refus des appels venant d'un autre site.
- RGPD : suppression du compte en ligne depuis le menu du joueur (action `delete`), comptes inactifs supprimés
  automatiquement après 12 mois (index TTL MongoDB), compteurs d'adresses IP effacés au bout d'une heure au plus.
- La fonction `api/keepalive.ts`, appelée chaque jour par la tâche planifiée de Vercel (protégée par `CRON_SECRET`),
  évite que la base MongoDB Atlas (offre gratuite) soit mise en pause après 30 jours sans connexion.

## Hors-ligne

Le service worker met en cache les fichiers légers dès la première visite (pages, styles, polices, petits scripts),
puis le reste (3D, images) quand l'enfant entre dans le jeu (`/jouer`, `/creer`, `/cubo`). Ensuite, le site
fonctionne même si la connexion coupe. Les effets sonores sont synthétisés ; la voix de Cubo est en MP3 (voir « Voix »).

### Mises à jour automatiques

Le build génère un nouveau `sw.js` (version calculée à partir du contenu des fichiers et du commit). Les postes ouverts
et l'application installée vérifient les mises à jour au chargement, toutes les 15 minutes et au retour sur l'onglet,
puis rechargent automatiquement la page. `vercel.json` empêche la mise en cache de `sw.js` et du manifeste.

## Application installable (PWA)

Le site s'installe depuis la barre d'adresse du navigateur (icône de Cubo sur fond bleu, la même que le logo).

## Accessibilité

- Les animations respectent le réglage système « réduire les animations » (`MotionProvider`).
- L'éditeur de blocs s'utilise sans glisser-déposer : Entrée (ou Espace) sur un bloc de la palette l'ajoute (dans la
  boucle sélectionnée s'il y en a une) ; sur un bloc du programme, Suppr l'enlève et Alt + ↑/↓ le déplace. Les mêmes
  actions sont proposées par les boutons qui apparaissent quand le bloc est sélectionné.
- Lien « Aller au contenu », contours de focus visibles, consignes lues à voix haute.

## Voix

Cubo n'a qu'une voix : Thierry (voix neuronale). Toutes ses phrases sont pré-enregistrées dans
`public/voice/thierry/` (une phrase = un fichier MP3, liste dans `src/lib/voice-manifest.json`).
Après avoir ajouté ou modifié un texte (niveaux, histoire, badges…), lancer `npm run voices` :
seules les phrases nouvelles sont générées, et les fichiers inutilisés sont supprimés.
Si un fichier manque, la synthèse vocale du navigateur prend le relais.
