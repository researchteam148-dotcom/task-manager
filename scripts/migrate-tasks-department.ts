import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * asdc from 'dotenv';
import * as path from 'path';

// Load environment variables
const dotenv = require('dotenv');
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

async function migrate() {
    console.log('Starting task department migration...');

    try {
        // 1. Get all admins to map ID -> Department
        const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').get();
        const adminDepartments: Record<string, string> = {};

        adminsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.department) {
                adminDepartments[doc.id] = data.department;
            }
        });

        console.log(`Found ${Object.keys(adminDepartments).length} admins with departments.`);

        // 2. Get all tasks
        const tasksSnapshot = await db.collection('tasks').get();
        let updatedCount = 0;
        let skippedCount = 0;

        const batchSize = 500;
        let batch = db.batch();
        let operationCount = 0;

        for (const doc of tasksSnapshot.docs) {
            const task = doc.data();

            // Skip if already has department
            if (task.department) {
                skippedCount++;
                continue;
            }

            const creatorId = task.createdBy;
            let department = 'General';

            if (creatorId && adminDepartments[creatorId]) {
                department = adminDepartments[creatorId];
            }

            batch.update(doc.ref, { department });
            updatedCount++;
            operationCount++;

            if (operationCount >= batchSize) {
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
                process.stdout.write('.');
            }
        }

        if (operationCount > 0) {
            await batch.commit();
        }

        console.log('\nMigration completed!');
        console.log(`Updated: ${updatedCount} tasks`);
        console.log(`Skipped: ${skippedCount} tasks (already had department)`);

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
