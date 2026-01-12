importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC89iI7elL3XpKz4MR0Cr8wzuL9npBRFus",
    authDomain: "task-manager-5899b.firebaseapp.com",
    projectId: "task-manager-5899b",
    storageBucket: "task-manager-5899b.firebasestorage.app",
    messagingSenderId: "222182929844",
    appId: "1:222182929844:web:c79ce9a884b98c05be2ee1",
});

const messaging = firebase.messaging();

// Force the service worker to activate immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'New TaskFlow Alert';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.message || 'Check your dashboard for updates.',
        tag: 'taskflow-notification',
        badge: '/favicon.ico',
        requireInteraction: true, // Keep it visible until the user acts
        data: {
            url: self.location.origin
        }
    };

    console.log('🔔 [SW] Showing notification:', notificationTitle);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked:', event.notification.tag);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
