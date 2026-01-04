'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Notification } from '@/types';
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/db/notifications';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils';
import { Button } from '../ui/button';

export function NotificationCenter() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToNotifications(user.uid, (data) => {
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllNotificationsRead(user.uid, notifications);
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.read) {
            await markNotificationRead(notif.id);
        }
        setIsOpen(false);
        // Add navigation logic if needed (e.g. to task detail)
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                aria-label="Notifications"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="text-3xl grayscale mb-2 block">📭</span>
                                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-primary-50/30' : ''
                                            }`}
                                    >
                                        {!notif.read && (
                                            <span className="absolute left-2 top-5 w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
                                                    {notif.type.replace('_', ' ')}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {formatDate(notif.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 5 && (
                        <div className="p-3 border-t border-gray-100 text-center bg-gray-50/30">
                            <button className="text-xs text-gray-500 font-medium hover:text-gray-700">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
