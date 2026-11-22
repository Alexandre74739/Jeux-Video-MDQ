/* Service worker CuboCode : site hors-ligne.
 * - installation : seulement les fichiers légers (pages, styles, polices, petits scripts) ;
 * - message « warm » (envoyé quand l'enfant entre dans le jeu) : tout le reste (3D, images).
 * Ainsi, 15 postes qui ouvrent l'accueil en même temps ne saturent pas la connexion de l'école. */
const CACHE = "cubocode-__VERSION__";
const URLS = __URLS__;
const CORE = __CORE__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Ajout un par un : un fichier en échec ne bloque pas les autres.
      await Promise.all(CORE.map((u) => cache.add(u).catch(() => null)));
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Ajout un par un, en sautant ce qui est déjà en cache.
async function warm() {
  const cache = await caches.open(CACHE);
  for (const u of URLS) {
    if (!(await cache.match(u))) await cache.add(u).catch(() => null);
  }
}

self.addEventListener("message", (event) => {
  if (event.data === "warm") event.waitUntil(warm());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Pages : réseau d'abord (rapide si connecté), sinon cache.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // On ne met en cache que les vraies pages (pas la 404 ni une erreur serveur).
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const path = url.pathname.endsWith("/")
            ? url.pathname
            : url.pathname + "/";
          return (
            (await caches.match(path)) ||
            (await caches.match(req, { ignoreSearch: true })) ||
            (await caches.match("/"))
          );
        }),
    );
    return;
  }

  // Fichiers : cache d'abord (instantané), sinon réseau puis mise en cache.
  event.respondWith(
    caches
      .match(req, { ignoreSearch: url.pathname.startsWith("/_next/") })
      .then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
  );
});
