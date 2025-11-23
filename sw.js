/**
 * Service Worker for Aethelgard
 * Enables offline play and caching
 */

const CACHE_NAME = 'aethelgard-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/css/style.css',
    '/src/js/game.js',
    '/src/js/config.js',
    '/src/js/audio.js',
    '/src/js/graphics.js',
    '/src/js/renderer3d.js',
    '/src/js/classes.js',
    '/src/js/input.js',
    '/src/js/map.js',
    '/src/js/quest.js',
    '/src/js/simplex-noise.js',
    '/src/js/entities/entity.js',
    '/src/js/entities/player.js',
    '/src/js/entities/enemy.js',
    '/src/js/entities/wraith.js',
    '/src/js/entities/golem.js',
    '/src/js/entities/loot.js',
    '/src/js/particles/particles.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return cached response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            }).catch(() => {
                // Return offline page if available
                return caches.match('/index.html');
            })
    );
});
