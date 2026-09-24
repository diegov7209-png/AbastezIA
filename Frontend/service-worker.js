/**
 * service-worker.js
 * V1: cache "app shell" para que la app abra aunque no haya internet.
 * Los DATOS (fetch al backend) siempre van a la red — el modo offline
 * completo con cola de sincronización es Fase 5 (ver docs/ARQUITECTURA.md).
 */

const CACHE_NAME = 'distribuidora-ai-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/mobile.css',
  './css/desktop.css',
  './js/config.js',
  './js/api.js',
  './js/auth.js',
  './js/router.js',
  './js/app.js',
  './js/pages/login.js',
  './js/pages/dashboard.js',
  './js/pages/proveedores.js',
  './js/pages/productos.js',
  './js/pages/clientes.js',
  './js/pages/chat.js',
  './js/pages/ia-dev.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Nunca cachear llamadas al backend (Apps Script) — siempre datos frescos.
  if (url.hostname.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
