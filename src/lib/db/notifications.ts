import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Notification, NotificationType } from '@/types';

/**
 * Create a new notification for a specific user
 * Now triggers a device-level push notification as well
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string
): Promise<string | null> {
    try {
        const notificationData: Omit<Notification, 'id'> = {
            userId,
            type,
            title,
            message,
            read: false,
            relatedId,
            createdAt: Timestamp.now(),
        };

        // 1. Create Firestore record
        const docRef = await addDoc(collection(db, 'notifications'), notificationData);

        // 2. Trigger Push Notification (via server or API)
        const triggerPush = async () => {
            console.log(`🔔 FCM: Attempting to trigger push for ${userId}...`);
            try {
                // If on client, call API
                if (typeof window !== 'undefined') {
                    const { auth } = await import('../firebase-config');
                    const currentUser = auth.currentUser;

                    if (currentUser) {
                        console.log('🔔 FCM: Calling Push API from client.');
                        const idToken = await currentUser.getIdToken();
                        const response = await fetch('/api/notifications/push', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${idToken}`,
                            },
                            body: JSON.stringify({ userId, title, message }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error('❌ FCM: Push API failed:', errorData);
                        } else {
                            console.log('✅ FCM: Push API call successful.');
                        }
                    } else {
                        console.warn('⚠️ FCM: Skipping push trigger (No current user for Auth token).');
                    }
                } else {
                    // If on server, call server utility directly
                    console.log('🔔 FCM: Calling Server Utility directly.');
                    const { sendPushNotification } = await import('../fcm-server');
                    await sendPushNotification(userId, title, message);
                }
            } catch (err) {
                console.error('❌ FCM: Failed to trigger push notification:', err);
            }
        };

        triggerPush();

        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Subscribe to notifications for a specific user
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
): Unsubscribe {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const notifications = snapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id } as Notification)
            );
            callback(notifications);
        },
        (error) => {
            console.error('Error in subscribeToNotifications:', error);
            if (error.message.includes('requires an index')) {
                const indexUrl = 'https://console.firebase.google.com/v1/r/project/task-manager-5899b/firestore/indexes?create_composite=Clhwcm9qZWN0cy90YXNrLW1hbmFnZXItNTg5OWIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGlmaWNhdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg';
                console.error('🔥 FIRESTORE INDEX MISSING: Notification sorting requires a composite index.');
                console.error(`Please click here to create it: ${indexUrl}`);
            }
        }
    );
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
    try {
        const docRef = doc(db, 'notifications', notificationId);
        await updateDoc(docRef, { read: true });
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsRead(userId: string, notifications: Notification[]): Promise<void> {
    try {
        const unreadTasks = notifications.filter(n => !n.read).map(n =>
            updateDoc(doc(db, 'notifications', n.id), { read: true })
        );
        await Promise.all(unreadTasks);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}
