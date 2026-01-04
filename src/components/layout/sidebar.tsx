'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: '🏠' },
        { href: '/admin/tasks', label: 'All Tasks', icon: '📋' },
        { href: '/admin/faculty', label: 'Faculty Members', icon: '👥' },
        { href: '/admin/leaves', label: 'Leave Approvals', icon: '📅' },
        { href: '/admin/audit-logs', label: 'Audit Logs', icon: '📜' },
    ];

    const facultyLinks = [
        { href: '/faculty', label: 'Dashboard', icon: '🏠' },
        { href: '/faculty/tasks', label: 'My Tasks', icon: '📋' },
        { href: '/faculty/timetable', label: 'Timetable', icon: '🕒' },
        { href: '/faculty/leaves', label: 'Leave Requests', icon: '📅' },
    ];

    const links = user.role === 'admin' ? adminLinks : facultyLinks;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block">
            <div className="p-6">
                <nav className="space-y-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
