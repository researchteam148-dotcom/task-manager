'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { signOut } from '@/lib/auth';
import { Button } from '../ui/button';
import { NotificationCenter } from './notification-center';

export function Navbar() {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">Task Planner</h1>
                        <span className="ml-3 px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                            {user.role === 'admin' ? 'Admin' : 'Faculty'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <div className="h-6 w-px bg-gray-200"></div>
                        <div className="text-sm text-gray-600 text-right">
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.department}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
