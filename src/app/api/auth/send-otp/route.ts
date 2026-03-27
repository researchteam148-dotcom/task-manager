import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Resend } from 'resend';
import { getOtpEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { email, uid } = decodedToken;

        if (!email) {
            return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in Firestore
        await adminDb.collection('otps').doc(uid).set({
            otp,
            expiresAt,
            attempts: 0,
            verified: false
        });

        // Send Email via Resend
        const { error } = await resend.emails.send({
            from: 'TaskFlow Security <noreply@promptify.fun>', // Using verified domain
            to: [email],
            subject: 'Your Login Verification Code',
            html: getOtpEmailHtml(otp),
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent' });
    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
