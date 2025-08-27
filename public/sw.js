const CACHE = "flipflop-v1";
const ASSETS = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
    self.skipWaiting();
});
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
            )
    );
    self.clients.claim();
});
self.addEventListener("fetch", (e) => {
    const { request } = e;
    if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
    e.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request)
                    .then((res) => {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(request, copy));
                        return res;
                    })
                    .catch(() => caches.match("/"))
        )
    );
});
