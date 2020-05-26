const cacheContents = 'cachedPages'
const asset = [
    '/',
    '/index.html',
    '/manifest.json',
    '/sw.js',
    '/mario.jpeg',
]

self.addEventListener('install', event=>{
    console.log("worker installed");
    event.waitUntil(
        caches.open(cacheContents).then(cache =>{
            console.log("caching assets");
            cache.addAll(asset);
        })
    );

});

self.addEventListener('activate', event => {
    console.log('activating a new service worker');

    const cacheWhiteList = [cacheContents];

    event.waitUntil(
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhiteList.indexOf(cacheName) == -1) {
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )
})

self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                console.log('Found', event.request.url, ' in cache');
                return response;
            }
            console.log('network request for ', event.request.url);
            return fetch(event.request)
                .then(response => {
                    if (response.status === 404) {
                        return caches.match('404.html');
                    }
                    return caches.open(cacheContents)
                    .then(cache => {
                        cache.put(event.request.url, response.clone());
                        return response;
                    })
                })
        })
        .catch(err => {
            console.error(err);
            return caches.match('offline.html');
        })
    )
})

