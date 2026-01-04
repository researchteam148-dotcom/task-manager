import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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
const auth = getAuth();

const sampleUsers = [
    {
        uid: 'admin_demo_id',
        name: 'Department Admin',
        email: 'admin@example.com',
        role: 'admin',
        department: 'Administration',
        empId: 'ADM001',
        password: 'admin123',
    },
    {
        uid: 'faculty_1_id',
        name: 'Dr. John Smith',
        email: 'john.smith@example.com',
        role: 'faculty',
        department: 'Computer Science',
        empId: 'CS001',
        password: 'faculty123',
    },
    {
        uid: 'faculty_2_id',
        name: 'Prof. Sarah Jane',
        email: 'sarah.jane@example.com',
        role: 'faculty',
        department: 'Mathematics',
        empId: 'MATH001',
        password: 'faculty123',
    },
];

const sampleTasks = [
    {
        title: 'Prepare Mid-term Exams',
        description: 'Create question papers for the upcoming CS101 mid-term examination.',
        priority: 'High',
        status: 'Pending',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTo: 'faculty_1_id',
        createdBy: 'admin_demo_id',
    },
    {
        title: 'Review Research Proposals',
        description: 'Evaluate the research proposals submitted by the final year students.',
        priority: 'Medium',
        status: 'In Progress',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        assignedTo: 'faculty_2_id',
        createdBy: 'admin_demo_id',
    },
    {
        title: 'Departmental Meeting Minutes',
        description: 'Document the minutes of the last departmental committee meeting.',
        priority: 'Low',
        status: 'Completed',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        assignedTo: 'faculty_1_id',
        createdBy: 'admin_demo_id',
    },
];

async function seed() {
    console.log('Starting data seeding...');

    try {
        for (const userData of sampleUsers) {
            const { password, ...firestoreData } = userData;

            // Create user in Auth
            try {
                await auth.createUser({
                    uid: userData.uid,
                    email: userData.email,
                    password: userData.password,
                    displayName: userData.name,
                });
                console.log(`Created Auth user: ${userData.email}`);
            } catch (authError: any) {
                if (authError.code === 'auth/uid-already-exists' || authError.code === 'auth/email-already-exists') {
                    console.log(`Auth user already exists: ${userData.email}`);
                } else {
                    throw authError;
                }
            }

            // Create user in Firestore
            await db.collection('users').doc(userData.uid).set({
                ...firestoreData,
                createdAt: Timestamp.now(),
            });
            console.log(`Created Firestore user: ${userData.email}`);
        }

        for (const taskData of sampleTasks) {
            const taskRef = db.collection('tasks').doc();
            const createdAt = Timestamp.now();

            await taskRef.set({
                ...taskData,
                deadline: Timestamp.fromDate(taskData.deadline),
                createdAt,
                updatedAt: createdAt,
                comments: [],
            });

            // Create initial audit log
            await db.collection('auditLogs').add({
                taskId: taskRef.id,
                action: 'Created',
                performedBy: 'admin_demo_id',
                timestamp: createdAt,
                details: `Task created: ${taskData.title}`,
            });

            console.log(`Created task: ${taskData.title}`);
        }

        // Create sample schedules for faculty
        const schedules = [
            {
                facultyUid: 'faculty_1_id',
                slots: [
                    { id: 's1', day: 'Monday', startTime: '09:00', endTime: '10:00', type: 'class', subject: 'Intro to CS' },
                    { id: 's2', day: 'Monday', startTime: '10:00', endTime: '11:00', type: 'leisure' },
                    { id: 's3', day: 'Monday', startTime: '11:15', endTime: '12:15', type: 'class', subject: 'Data Structures' },
                ]
            },
            {
                facultyUid: 'faculty_2_id',
                slots: [
                    { id: 's4', day: 'Monday', startTime: '09:00', endTime: '10:00', type: 'leisure' },
                    { id: 's5', day: 'Monday', startTime: '10:00', endTime: '11:00', type: 'class', subject: 'Calculus I' },
                ]
            }
        ];

        for (const schedule of schedules) {
            await db.collection('schedules').doc(schedule.facultyUid).set({
                ...schedule,
                updatedAt: Timestamp.now(),
            });
            console.log(`Created schedule for faculty: ${schedule.facultyUid}`);
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seed();
