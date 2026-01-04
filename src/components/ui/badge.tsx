import React from 'react';
import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority } from '@/types';
import { getStatusColor, getPriorityColor } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: TaskStatus | TaskPriority | 'default' | 'outline' | 'success' | 'purple';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';

    if (variant === 'outline') {
        colorClass = 'bg-transparent text-gray-600 border-gray-300';
    } else if (variant === 'success') {
        colorClass = 'bg-green-100 text-green-800 border-green-200';
    } else if (variant === 'purple') {
        colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
    } else if (variant !== 'default') {
        // Check if it's a status or priority
        if (['Pending', 'In Progress', 'Completed'].includes(variant)) {
            colorClass = getStatusColor(variant as TaskStatus);
        } else if (['Low', 'Medium', 'High'].includes(variant)) {
            colorClass = getPriorityColor(variant as TaskPriority);
        }
    }

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                colorClass,
                className
            )}
        >
            {children}
        </span>
    );
}
