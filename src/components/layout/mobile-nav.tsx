'use client';

import React, { useEffect } from 'react';
import { NavLinks } from './nav-links';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface MobileNavProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export function MobileNav({ isOpen, onCloseAction }: MobileNavProps) {
    const { user } = useAuth();

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!user) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onCloseAction}
            />

            {/* Drawer */}
            <aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Task Planner</h2>
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">
                            {user.role} Portal
                        </p>
                    </div>
                    <button
                        onClick={onCloseAction}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <span className="text-2xl">✕</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <NavLinks onItemClick={onCloseAction} />
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.department}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
