// Service Worker for LODUCHAT with Firebase Cloud Messaging support
const CACHE_NAME = 'loduchat-v1'

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyAkWfYFDm84s3bz_aUAUAfUDmxxjg7DNnw",
  authDomain: "lodugram.firebaseapp.com",
  projectId: "lodugram",
  storageBucket: "lodugram.firebasestorage.app",
  messagingSenderId: "506675227207",
  appId: "1:506675227207:web:162dee371450d6cdccdf62"
}

// Initialize Firebase in service worker
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const notificationTitle = payload.notification?.title || 'New Message'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'background-message',
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    data: payload.data || {}
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  // Focus the app window if it exists
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Cache management
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
}) 