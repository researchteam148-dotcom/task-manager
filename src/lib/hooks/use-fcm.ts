'use client';

import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../firebase-config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User } from '@/types';

export function useFCM(user: User | null) {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (!user || typeof window === 'undefined' || !messaging) return;

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                setPermission(permission);

                if (permission === 'granted') {
                    // Get FCM Token
                    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

                    // Only attempt if we have a real key (not the placeholder)
                    if (vapidKey && vapidKey !== 'BDi6...placeholder...' && vapidKey.length > 20) {
                        const currentToken = await getToken(messaging, { vapidKey });

                        if (currentToken) {
                            setToken(currentToken);
                            // Save token to Firestore
                            const userRef = doc(db, 'users', user.uid);
                            await updateDoc(userRef, {
                                fcmTokens: arrayUnion(currentToken),
                            });
                            console.log('FCM Token registered:', currentToken);
                        } else {
                            console.warn('No FCM registration token received. Check permissions.');
                        }
                    } else {
                        console.log('ℹ️ FCM setup: Skipping token registration (VAPID key not configured yet).');
                    }
                }
            } catch (error) {
                console.error('Error in FCM setup:', error);
            }
        };

        requestPermission();

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            if (payload.notification) {
                new Notification(payload.notification.title || 'Notification', {
                    body: payload.notification.body,
                    icon: '/icons/icon-192x192.png',
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    return { token, permission };
}
