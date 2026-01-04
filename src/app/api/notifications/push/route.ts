import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { sendPushNotification } from '@/lib/fcm-server';

export async function POST(req: NextRequest) {
    try {
        // 1. Basic Auth Check (Internal only or Bearer verified)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(idToken); // Ensure requester is a valid user

        const { userId, title, message } = await req.json();
        console.log('📡 Push API: Received request for user:', userId);

        if (!userId || !title || !message) {
            console.warn('⚠️ Push API: Missing required fields.');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Trigger the server-side FCM logic
        await sendPushNotification(userId, title, message);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('❌ Push API ERROR:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
