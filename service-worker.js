const CACHE_VERSION = "hollowdevs-v3";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./loginPage.html",
  "./style.css",
  "./navbar.css",
  "./navbar.html",
  "./navbar-loader.js",
  "./firebase-config.js",
  "./firebase-client.js",
  "./app.webmanifest",
  "./images/Forgotten_Crossroads.png",
  "./images/navbackground1.png",
  "./images/navbackground2.png",
  "./images/navbarbackground.png",
  "./images/bodybackground.jpg",
  "./images/maskable_icon.png",
  "./images/maskable_icon_x192.png",
  "./images/maskable_icon_x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Network-first for live boss API data.
  if (requestUrl.hostname === "raw.githubusercontent.com") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache Bootstrap CDN assets after first successful request.
  if (requestUrl.hostname === "cdn.jsdelivr.net") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache-first for same-origin app shell assets.
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(fetch(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(DYNAMIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
