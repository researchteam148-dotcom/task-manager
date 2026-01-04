import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (server-side only)
let adminApp: App;

if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 'task-manager-5899b';
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    console.log('--- Firebase Admin Debug ---');
    console.log('FIREBASE_ADMIN_PROJECT_ID:', !!process.env.FIREBASE_ADMIN_PROJECT_ID);
    console.log('FIREBASE_ADMIN_CLIENT_EMAIL:', !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
    console.log('FIREBASE_ADMIN_PRIVATE_KEY:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);
    console.log('----------------------------');

    if (clientEmail && privateKey) {
        adminApp = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        console.warn('Firebase Admin credentials missing. Admin features (like user creation) will fail.');
        // Initialize with default or empty, but it's better to avoid calling cert() with empty strings
        adminApp = initializeApp({
            projectId
        });
    }
} else {
    adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
