export function getTaskAssignmentEmailHtml(taskTitle: string, taskDescription: string, assignedBy: string) {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4F46E5;">TaskFlow</h2>
            </div>
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="margin-top: 0; color: #111827;">New Task Assigned</h3>
                <p>Hello,</p>
                <p>You have been assigned a new task by <strong>${assignedBy}</strong>.</p>
                
                <div style="background-color: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #374151;">Task Details:</h4>
                    <p style="margin: 0;"><strong>Title:</strong> ${taskTitle}</p>
                    <p style="margin: 8px 0 0 0;"><strong>Description:</strong></p>
                    <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; font-size: 14px; margin-top: 4px; white-space: pre-wrap;">${taskDescription}</p>
                </div>
                
                <p>Please log in to the TaskFlow dashboard to view more details and update the status.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280;">
                <p>&copy; ${new Date().getFullYear()} Aditya University. All rights reserved.</p>
            </div>
        </div>
    `;
}

export function getTaskUpdateEmailHtml(taskTitle: string, updateDetails: string, updatedBy: string) {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4F46E5;">TaskFlow</h2>
            </div>
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="margin-top: 0; color: #111827;">Task Updated</h3>
                <p>Hello,</p>
                <p>A task assigned to you has been updated by <strong>${updatedBy}</strong>.</p>
                
                <div style="background-color: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Task:</strong> ${taskTitle}</p>
                    <p style="margin: 8px 0 0 0;"><strong>Changes:</strong></p>
                    <p style="background-color: #fef9c3; padding: 12px; border-radius: 4px; font-size: 14px; margin-top: 4px; color: #854d0e;">${updateDetails}</p>
                </div>
                
                <p>Please check the TaskFlow dashboard for the latest information.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 10px;">View Task Details</a>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280;">
                <p>&copy; ${new Date().getFullYear()} Aditya University. All rights reserved.</p>
            </div>
        </div>
    `;
}

export function getOtpEmailHtml(otp: string) {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4F46E5;">TaskFlow</h2>
            </div>
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
                <h3 style="margin-top: 0; color: #111827;">Your Login Verification Code</h3>
                <p>Use the following 6-digit code to complete your login. This code will expire in 10 minutes.</p>
                
                <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px dashed #4F46E5; margin: 20px auto; max-width: 200px;">
                    <h1 style="margin: 0; color: #4F46E5; letter-spacing: 4px;">${otp}</h1>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">If you did not attempt to log in, please secure your account immediately or ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280;">
                <p>&copy; ${new Date().getFullYear()} Aditya University. All rights reserved.</p>
            </div>
        </div>
    `;
}
