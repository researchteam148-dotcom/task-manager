import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 1. Load environment variables FIRST
const envPath = resolve(__dirname, '../.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

// 2. Dynamic import after env vars are loaded
async function main() {
    const { adminAuth, adminDb } = await import('../src/lib/firebase-admin');
    const { Timestamp } = await import('firebase-admin/firestore');

    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Dean System Admin';

    if (!email || !password) {
        console.error('Usage: npx tsx scripts/create-dean.ts <email> <password> [name]');
        process.exit(1);
    }

    try {
        console.log(`Creating Dean account for ${email}...`);

        // Create in Firebase Auth
        let uid;
        try {
            const userRecord = await adminAuth.createUser({
                email,
                password,
                displayName: name,
            });
            uid = userRecord.uid;
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.log('User already exists in Auth, fetching UID...');
                const user = await adminAuth.getUserByEmail(email);
                uid = user.uid;
            } else {
                throw error;
            }
        }

        // Create/Update in Firestore
        await adminDb.collection('users').doc(uid).set({
            uid,
            name,
            email,
            role: 'dean',
            department: 'Administration',
            empId: 'DEAN-001',
            createdAt: Timestamp.now(),
            requiresPasswordChange: false,
        }, { merge: true });

        console.log('✅ Dean account created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Role: Dean`);
        process.exit(0);

    } catch (error) {
        console.error('Error creating Dean:', error);
        process.exit(1);
    }
}

main();
