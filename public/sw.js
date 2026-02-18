const CACHE_NAME = "tubefeed-v2"

const STATIC_ASSETS = [
  "/",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/tube-feed-supplies-500.jpg",
  "/manifest.json",
  "/offline",
]

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first for API/Supabase, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) return

  // Network-first for API routes and Supabase calls
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("openai") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("googletagmanager")
  ) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for static assets and app pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, but update in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse)
              })
            }
          })
          .catch(() => {})
        return cachedResponse
      }

      // Not in cache: fetch from network, cache it, serve it
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Offline and not cached: show offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline")
          }
        })
    })
  )
})
