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
                            className="p-2 hover:bg-gray-100 rounded-xl lg:hidden transition-all active:scale-95"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-200">
                                <span className="text-white text-lg font-bold">T</span>
                            </div>
                            <h1 className="text-lg font-black text-gray-900 tracking-tighter hidden xs:block">TaskFlow</h1>
                            <Badge variant={user.role === 'admin' ? 'default' : 'purple'} className="hidden xs:inline-flex text-[10px] px-2 py-0">
                                {user.role.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-4">
                        <NotificationCenter />

                        <div className="h-4 w-px bg-gray-200 mx-1 hidden xs:block"></div>

                        <Link
                            href="/profile"
                            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-all group"
                        >
                            <div className="hidden md:flex flex-col items-end">
                                <p className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-primary-600 transition-colors">{user.name}</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user.department}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200 bg-slate-100 flex items-center justify-center shadow-sm group-hover:border-primary-200 transition-all">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-black text-slate-400">{user.name.charAt(0)}</span>
                                )}
                            </div>
                        </Link>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 sm:px-4 rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline font-semibold">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
