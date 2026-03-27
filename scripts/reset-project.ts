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
const COLLECTIONS_TO_WIPE = [
    'tasks',
    'notifications',
    'audit_logs',
    'leaves',
    'absences',
    'schedules',
    'otps'
];

async function deleteCollection(collectionPath: string, batchSize: number = 500) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: any, resolve: any) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

async function resetProject() {
    console.log(`🚀 Starting Full Project Reset... Protecting: ${PROTECTED_EMAIL}`);

    try {
        // 1. Cleanup Firebase Auth
        console.log('--- Cleaning Auth Users ---');
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
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        console.log(`✅ Deleted ${authDeletedCount} users from Firebase Auth.`);

        // 2. Cleanup Firestore Collections
        console.log('--- Cleaning Collections ---');
        for (const collection of COLLECTIONS_TO_WIPE) {
            console.log(`Cleaning ${collection}...`);
            await deleteCollection(collection);
            console.log(`✅ ${collection} wiped.`);
        }

        // 3. Cleanup Users collection (preserving admin)
        console.log('Cleaning users collection...');
        const usersSnapshot = await db.collection('users').get();
        const userBatch = db.batch();
        let userProfileDeletedCount = 0;
        usersSnapshot.forEach(doc => {
            if (doc.data().email !== PROTECTED_EMAIL) {
                userBatch.delete(doc.ref);
                userProfileDeletedCount++;
            }
        });
        if (userProfileDeletedCount > 0) await userBatch.commit();
        console.log(`✅ Deleted ${userProfileDeletedCount} profiles from 'users' collection.`);

        console.log('\n✨ RESET COMPLETE. The project is now clean for handover.');
    } catch (error) {
        console.error('❌ Reset failed:', error);
    }
}

resetProject();
