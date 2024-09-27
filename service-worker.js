const CACHE_NAME = 'cache-v1';
const RESOURCES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/Icon192x192.png',
  '/images/Icon512x512.png',
  '/images/logo.svg',
  '/images/logo1.png',
  '/images/logo2.png',
  '/images/logo3.png',
  '/images/logo4.png',
  '/image1.jpg',
  '/image2 (1).jpg',
  '/image3.jpg',
  '/image4.jpg',
  '/image5.jpg',
  '/image6.jpg'
];

// Instalación del Service Worker y almacenamiento en caché estático
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching resources during install...');
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

// Activación del Service Worker y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Respuesta a las solicitudes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Si hay una respuesta en caché, devolverla
        return response;
      }
      // Si no está en caché, buscar en la red
      return fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Almacenar el recurso recién obtenido en caché
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      }).catch(() => {
        // Si falla tanto la red como la caché, puedes devolver una respuesta de fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html'); // Puedes crear una página 'offline.html' para mostrar cuando no haya conexión
        }
      });
    })
  );
});