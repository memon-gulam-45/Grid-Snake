const CACHE_NAME = "grid-snake-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/public/manifest.json",
  "/public/icons/icon-48x48.png",
  "/public/icons/icon-72x72.png",
  "/public/icons/icon-96x96.png",
  "/public/icons/icon-128x128.png",
  "/public/icons/icon-144x144.png",
  "/public/icons/icon-152x152.png",
  "/public/icons/icon-192x192.png",
  "/public/icons/icon-256x256.png",
  "/public/icons/icon-384x384.png",
  "/public/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
      )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
