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

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Extract title and body from either 'notification' or 'data'
    const notificationTitle = payload.notification?.title || payload.data?.title || 'New TaskFlow Alert';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.message || 'Check your dashboard for updates.',
        tag: 'taskflow-notification', // Group notifications
        badge: '/favicon.ico',
        // Removed broken icon path to prevent silent failures
    };

    console.log('🔔 [SW] Showing notification:', notificationTitle);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
