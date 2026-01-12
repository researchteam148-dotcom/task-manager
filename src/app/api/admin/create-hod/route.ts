import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Authorization (Check if requester is a DEAN)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Check if requester has DEAN role
        const deanDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!deanDoc.exists || deanDoc.data()?.role !== 'dean') {
            return NextResponse.json({ error: 'Forbidden: Dean access required' }, { status: 403 });
        }

        // 2. Parse request body
        const { email, password, name, empId, department } = await request.json();

        if (!email || !password || !name || !empId || !department) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. CONSTRAINT CHECK: Enforce One-HoD-Per-Department
        const existingHoDQuery = await adminDb.collection('users')
            .where('role', '==', 'admin')
            .where('department', '==', department)
            .get();

        if (!existingHoDQuery.empty) {
            return NextResponse.json({
                error: `Department '${department}' already has an HoD assigned.`
            }, { status: 409 });
        }

        // 4. Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 5. Create Firestore document (Role: 'admin' = HoD)
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            email,
            empId,
            department,
            role: 'admin', // Admin = HoD
            requiresPasswordChange: true,
            createdAt: Timestamp.now(),
        });

        return NextResponse.json({
            success: true,
            uid: userRecord.uid,
            message: 'HoD account created successfully'
        });

    } catch (error: any) {
        console.error('Error creating HoD via Admin SDK:', error);

        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
