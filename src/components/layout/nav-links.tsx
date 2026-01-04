'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface NavLinksProps {
    onItemClick?: () => void;
    className?: string;
}

export function NavLinks({ onItemClick, className }: NavLinksProps) {
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
        <nav className={cn("space-y-1", className)}>
            {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/admin' && link.href !== '/faculty' && pathname.startsWith(link.href));

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onItemClick}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                            isActive
                                ? "bg-primary-50 text-primary-700 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <span className={cn(
                            "text-xl transition-transform duration-200 group-hover:scale-110",
                            isActive ? "scale-110" : ""
                        )}>
                            {link.icon}
                        </span>
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
