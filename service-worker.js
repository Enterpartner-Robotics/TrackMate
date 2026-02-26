const CACHE_NAME = "pwa-cache-v1"; // Verziókezeléshez
const urlsToCache = [      // Fő CSS fájl
    "/output.css",     // jQuery
    "/js/cookie.js",  
    "/js/websocket.js",  
    "/js/tabulator.min.js",  
    "/js/jquery-ui.min.js",  
    "/js/jquery-3.7.1.min.js",  
    "/js/index.global.min.js",  
    
    "favicon.ico",
    "/offline.html"          // Egyedi offline oldal
];

// 📌 Telepítés (install) – előre betöltjük a fontos fájlokat
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// 📌 Aktiválás (activate) – Régi cache-ek törlése, ha új verzió van
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Régi cache törlése:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// 📌 Fetch esemény – Először hálózatról próbál, ha nincs net, cache-ből tölt
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        let responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request) || caches.match("/offline.html"))
  );
});
