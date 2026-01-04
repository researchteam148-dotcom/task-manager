import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

const db = getFirestore();

async function fixAdmin() {
    const adminDetails = {
        uid: "b4I58cQPolPyjSfNpE2vrQF7pyA3",
        name: "syam Sundar Yadla",
        email: "shyamsundaryedla1@gmail.com",
        role: "admin",
        department: "Dean - Academics",
        empId: "ADM-999", // Adding a unique employee ID
        createdAt: Timestamp.now(),
    };

    console.log(`Fixing Firestore profile for admin: ${adminDetails.email}...`);

    try {
        await db.collection('users').doc(adminDetails.uid).set(adminDetails);
        console.log('✅ Success! Your Firestore profile has been created.');
        console.log('You can now log in to the application.');
    } catch (error) {
        console.error('❌ Failed to fix admin profile:', error);
    }
}

fixAdmin();
