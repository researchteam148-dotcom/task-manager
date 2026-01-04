'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { signOut } from '@/lib/auth';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { NotificationCenter } from './notification-center';
import { cn } from '@/lib/utils';

interface NavbarProps {
    onMenuClickAction?: () => void;
}

export function Navbar({ onMenuClickAction }: NavbarProps) {
    const { user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClickAction}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
                            aria-label="Toggle menu"
                        >
                            <span className="text-2xl leading-none">☰</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <span className="text-2xl hidden sm:block">📝</span>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden xs:block">Task Planner</h1>
                            <Badge variant={user.role === 'admin' ? 'default' : 'purple'} className="hidden sm:inline-flex">
                                {user.role.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationCenter />
                        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user.department}</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-4"
                        >
                            <span className="sm:hidden">Logout</span>
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
