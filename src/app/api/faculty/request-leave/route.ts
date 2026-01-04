import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { LeaveRequest } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { facultyUid, facultyName, startDate, endDate, reason } = await req.json();

        // 1. Create leave request
        const leaveData = {
            facultyUid,
            facultyName,
            startDate: Timestamp.fromDate(new Date(startDate)),
            endDate: Timestamp.fromDate(new Date(endDate)),
            reason,
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const leaveRef = await adminDb.collection('leaves').add(leaveData);

        // 2. Fetch admins for notification
        const adminsSnap = await adminDb.collection('users').where('role', '==', 'admin').get();

        // 3. Create notifications
        const notificationPromises = adminsSnap.docs.map(adminDoc =>
            adminDb.collection('notifications').add({
                userId: adminDoc.id,
                type: 'leave_request',
                title: 'New Leave Request',
                message: `${facultyName} has requested leave from ${startDate} to ${endDate}.`,
                relatedId: leaveRef.id,
                read: false,
                createdAt: Timestamp.now(),
            })
        );

        await Promise.all(notificationPromises);

        return NextResponse.json({ id: leaveRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error in request-leave API:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
