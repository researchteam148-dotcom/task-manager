import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'task-manager-5899b',
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('Error: Firebase Admin credentials missing in .env.local');
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

const PROTECTED_EMAIL = 'shyamsundaryedla1@gmail.com';

async function cleanupUsers() {
    console.log(`Starting cleanup... Protecting: ${PROTECTED_EMAIL}`);

    try {
        // 1. Cleanup Firebase Auth
        let nextPageToken;
        let authDeletedCount = 0;
        
        do {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);
            const usersToDelete = listUsersResult.users
                .filter(user => user.email !== PROTECTED_EMAIL)
                .map(user => user.uid);

            if (usersToDelete.length > 0) {
                const deleteResult = await auth.deleteUsers(usersToDelete);
                authDeletedCount += usersToDelete.length - deleteResult.errors.length;
                if (deleteResult.errors.length > 0) {
                    console.error(`Failed to delete ${deleteResult.errors.length} users from Auth.`);
                }
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        console.log(`✅ Deleted ${authDeletedCount} users from Firebase Auth.`);

        // 2. Cleanup Firestore 'users' collection
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();
        let firestoreDeletedCount = 0;

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email !== PROTECTED_EMAIL) {
                batch.delete(doc.ref);
                firestoreDeletedCount++;
            }
        });

        if (firestoreDeletedCount > 0) {
            await batch.commit();
        }

        console.log(`✅ Deleted ${firestoreDeletedCount} profiles from Firestore 'users' collection.`);
        console.log('--- Cleanup Complete ---');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

cleanupUsers();
