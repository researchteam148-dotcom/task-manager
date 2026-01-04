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

        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
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
