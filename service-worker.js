const CACHE_NAME = 'jrs-cache-v1';
const urlsToCache = ['index.html','style.css','script.js','products.json','about.html','terms.html','privacy.html'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(urlsToCache); }));
});

self.addEventListener('fetch', function(e){
  e.respondWith(caches.match(e.request).then(function(response){
    return response || fetch(e.request).catch(()=>caches.match('index.html'));
  }));
});
