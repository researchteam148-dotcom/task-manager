import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getMessaging, Messaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC89iI7elL3XpKz4MR0Cr8wzuL9npBRFus",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "task-manager-5899b.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "task-manager-5899b",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "task-manager-5899b.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "222182929844",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:222182929844:web:c79ce9a884b98c05be2ee1",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-EDVTMBQKC6",
};

// Initialize Firebase (client-side)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let messaging: Messaging;
let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
    // Only initialize on client-side
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    messaging = getMessaging(app);

    // Initialize Analytics
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { auth, db, messaging, analytics };
