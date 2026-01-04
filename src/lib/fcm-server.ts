import { adminMessaging, adminDb } from './firebase-admin';

export async function sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
) {
    try {
        // 1. Get user's FCM tokens from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            console.warn(`⚠️ FCM: User ${userId} not found in Firestore.`);
            return;
        }

        const userData = userDoc.data();
        const tokens = userData?.fcmTokens || [];

        console.log(`📡 FCM: Preparing to send push to User ${userId}. Tokens: ${tokens.length}`);

        if (tokens.length === 0) {
            console.log(`No FCM tokens found for user ${userId}`);
            return;
        }

        // 2. Construct the message
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            tokens: tokens, // Multiple tokens if user is logged in on multiple devices
        };

        // 3. Send multicast message
        const response = await adminMessaging.sendEachForMulticast(message);

        console.log(`FCM Response: ${response.successCount} messages sent successfully; ${response.failureCount} messages failed.`);

        // 4. Cleanup failed tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                const remainingTokens = tokens.filter((t: string) => !failedTokens.includes(t));
                await adminDb.collection('users').doc(userId).update({
                    fcmTokens: remainingTokens
                });
                console.log(`Cleaned up ${failedTokens.length} stale FCM tokens for user ${userId}`);
            }
        }

        return response;
    } catch (error: any) {
        console.error('❌ FCM CRITICAL ERROR in sendPushNotification:', error);
        console.error('Error Details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
    }
}
