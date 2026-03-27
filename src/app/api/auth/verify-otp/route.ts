import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { uid } = decodedToken;

        const { otp } = await request.json();

        if (!otp) {
            return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
        }

        const otpDocRef = adminDb.collection('otps').doc(uid);
        const otpDoc = await otpDocRef.get();

        if (!otpDoc.exists) {
            return NextResponse.json({ error: 'Code expired or generated incorrectly' }, { status: 400 });
        }

        const data = otpDoc.data()!;
        
        if (new Date(data.expiresAt.toDate()) < new Date()) {
            await otpDocRef.delete();
            return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
        }

        if (data.attempts >= 3) {
            await otpDocRef.delete();
            return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 400 });
        }

        if (data.otp !== otp) {
            await otpDocRef.update({ attempts: data.attempts + 1 });
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        // Successfully verified
        await otpDocRef.delete(); // Delete after successful verification

        return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
