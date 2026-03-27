import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminAuth } from '@/lib/firebase-admin';
import { getTaskAssignmentEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
    try {
        // Verify Authorization so arbitrary users can't spam emails
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(idToken); // Ensures the user is logged into Firebase

        const { 
            toEmail, 
            taskTitle, 
            taskDescription, 
            updateDetails, 
            assignedByName, 
            updatedByName, 
            type = 'assignment' 
        } = await request.json();

        if (!toEmail || !taskTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let subject, html;
        if (type === 'update') {
            subject = `Task Updated: ${taskTitle}`;
            html = getTaskUpdateEmailHtml(taskTitle, updateDetails || 'The task details have been modified.', updatedByName || 'An administrator');
        } else {
            subject = `New Task Assigned: ${taskTitle}`;
            html = getTaskAssignmentEmailHtml(taskTitle, taskDescription || '', assignedByName || 'An administrator');
        }

        // Send Email via Resend
        const { data, error } = await resend.emails.send({
            from: 'TaskFlow <noreply@promptify.fun>', // Using verified domain
            to: [toEmail],
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
