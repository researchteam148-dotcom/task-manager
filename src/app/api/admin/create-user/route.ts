import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Authorization (Check if requester is an admin)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Check role in Firestore
        const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // 2. Parse request body
        const { email, password, name, empId, department } = await request.json();

        if (!email || !password || !name || !empId || !department) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 4. Create Firestore document
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            email,
            empId,
            department,
            role: 'faculty',
            requiresPasswordChange: true,
            createdAt: Timestamp.now(),
        });

        return NextResponse.json({
            success: true,
            uid: userRecord.uid,
            message: 'Faculty account created successfully'
        });

    } catch (error: any) {
        console.error('Error creating user via Admin SDK:', error);

        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
