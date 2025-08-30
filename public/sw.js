const CACHE = "flipflop-v1";
const PRECACHE = ["/manifest.webmanifest"];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
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
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== location.origin) return;

    const isHTML =
        request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");

    if (isHTML) {
        e.respondWith(
            fetch(request)
                .then((res) => {
                    caches.open(CACHE).then((c) => c.put(request, res.clone()));
                    return res;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    e.respondWith(
        caches.match(request).then((cached) => {
            const fetching = fetch(request)
                .then((res) => {
                    caches.open(CACHE).then((c) => c.put(request, res.clone()));
                    return res;
                })
                .catch(() => cached);
            return cached || fetching;
        })
    );
});
