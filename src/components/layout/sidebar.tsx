'use client';

import { NavLinks } from './nav-links';
import { useAuth } from '@/contexts/auth-context';

export function Sidebar() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <aside className="w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] hidden lg:block sticky top-16">
            <div className="p-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
                    Main Navigation
                </p>
                <NavLinks />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                        {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate capitalize">{user.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
