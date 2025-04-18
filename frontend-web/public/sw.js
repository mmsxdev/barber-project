const CACHE_NAME = 'barbearia-style-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const OFFLINE_PAGE = '/offline.html';

const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/assets/logo.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Pré-cache de recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(staticAssets)),
      caches.open(CACHE_NAME),
    ])
  );
});

// Estratégia de cache: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar requisições não GET
  if (request.method !== 'GET') return;

  // Estratégia específica para imagens
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Estratégia para outros recursos
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match(OFFLINE_PAGE);
      })
  );
});

// Função específica para lidar com requisições de imagens
async function handleImageRequest(request) {
  // Tentar cache primeiro para imagens
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Retornar uma imagem placeholder se falhar
    return new Response(
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eee"/></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }
    );
  }
}

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== CACHE_NAME
              );
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Garantir que o service worker assuma o controle imediatamente
      self.clients.claim(),
    ])
  );
}); 