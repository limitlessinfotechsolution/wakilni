// Wakilni Service Worker with Push Notification Support
const CACHE_NAME = 'wakilni-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline access
const PRECACHE_ASSETS = [
  '/',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });

      return cached || fetchPromise;
    })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'Wakilni',
    body: 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'wakilni-notification',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [100, 50, 100, 50, 100],
    data: data.data,
    actions: getNotificationActions(data.data?.type),
    requireInteraction: data.data?.type === 'booking_update',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  let url = '/';

  // Handle specific actions
  switch (action) {
    case 'view':
      if (data.bookingId) {
        url = `/bookings/${data.bookingId}`;
      } else if (data.url) {
        url = data.url;
      }
      break;
    case 'dismiss':
      return; // Just close the notification
    default:
      // Default click - go to relevant page
      if (data.bookingId) {
        url = `/bookings/${data.bookingId}`;
      } else if (data.type === 'kyc') {
        url = '/admin/kyc';
      } else {
        url = '/dashboard';
      }
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'booking_created':
    case 'booking_update':
      return [
        { action: 'view', title: 'View Booking', icon: '/pwa-192x192.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/pwa-192x192.png' },
      ];
    case 'kyc':
      return [
        { action: 'view', title: 'Review', icon: '/pwa-192x192.png' },
        { action: 'dismiss', title: 'Later', icon: '/pwa-192x192.png' },
      ];
    default:
      return [
        { action: 'view', title: 'View', icon: '/pwa-192x192.png' },
      ];
  }
}

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  // This would sync offline operations when back online
  console.log('[SW] Syncing pending operations...');
}
