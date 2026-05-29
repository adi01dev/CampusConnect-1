const CACHE_NAME = "campusconnect-static-v1";
const API_CACHE_NAME = "campusconnect-api-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/index.css",
  "/manifest.json"
];

// Install Event - pre-cache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up obsolete caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. API GET requests caching (Network-First, fallback to Cache)
  if (event.request.method === "GET" && requestUrl.pathname.includes("/api/")) {
    // Skip auth refreshes and chatbot requests to maintain real-time security
    if (requestUrl.pathname.includes("/auth/refresh") || requestUrl.pathname.includes("/chatbot/")) {
      event.respondWith(fetch(event.request));
      return;
    }

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseCopy = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseCopy);
            });
          }
          return response;
        })
        .catch(() => {
          console.log("[Service Worker] API Fetch failed (offline), serving from Cache:", requestUrl.pathname);
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({
                error: "Offline",
                message: "You are currently offline. This record is not cached yet.",
                offline: true
              }),
              {
                headers: { "Content-Type": "application/json" },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // 2. Custom dynamic PWA SVG logo helper for fallback icons
  if (requestUrl.pathname.includes("/icons/icon-")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6" stroke="none" />
              <stop offset="100%" stop-color="#1d4ed8" stroke="none" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="128" fill="url(#g)" stroke="none" />
          <path d="M256 120 L130 330 L210 330 L210 430 L302 430 L302 330 L382 330 Z" fill="#ffffff" stroke="none" />
          <circle cx="256" cy="220" r="36" fill="#f59e0b" stroke="none" />
        </svg>`;
        return new Response(svgLogo, {
          headers: { "Content-Type": "image/svg+xml" }
        });
      })
    );
    return;
  }

  // 3. Static Assets caching (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Keep background failures silent
          });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        const responseCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseCopy);
        });
        return networkResponse;
      });
    })
  );
});

// Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-updates") {
    console.log("[Service Worker] Sync tag caught; notifying clients");
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "SYNC_OFFLINE_DATA" });
      });
    });
  }
});
