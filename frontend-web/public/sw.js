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
  OFFLINE_PAGE
];

// Pré-cache de recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(staticAssets)),
      caches.open(DYNAMIC_CACHE)
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

// Função específica para lidar com requisições de imagem
async function handleImageRequest(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Retornar uma imagem placeholder se não houver cache
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#eee"/></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
              return caches.delete(key);
            }
          })
        );
      }),
      // Garantir que o service worker assuma o controle imediatamente
      self.clients.claim()
    ])
  );
}); 