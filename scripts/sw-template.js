/* Service worker CuboCode : tout le site est mis en cache à la première visite. */
const CACHE = "cubocode-__VERSION__";
const URLS = __URLS__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Ajout un par un : un fichier en échec ne bloque pas les autres.
      await Promise.all(URLS.map((u) => cache.add(u).catch(() => null)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
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
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const path = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
          return (
            (await caches.match(path)) ||
            (await caches.match(req, { ignoreSearch: true })) ||
            (await caches.match("/"))
          );
        })
    );
    return;
  }

  // Fichiers : cache d'abord (instantané), sinon réseau puis mise en cache.
  event.respondWith(
    caches.match(req, { ignoreSearch: url.pathname.startsWith("/_next/") }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
