import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskPriority, TaskStatus } from '@/types';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a Firestore Timestamp to a readable date string
 */
export function formatDate(date: Date | { toDate: () => Date } | string): string {
    try {
        if (!date) return '';

        let dateObj: Date;

        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else if (typeof (date as any).toDate === 'function') {
            dateObj = (date as any).toDate();
        } else if ((date as any).seconds) {
            // Handle serialized Timestamp
            dateObj = new Date((date as any).seconds * 1000);
        } else {
            return '';
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(dateObj);
    } catch (e) {
        return 'Invalid Date';
    }
}

/**
 * Format a Firestore Timestamp to a readable datetime string
 */
export function formatDateTime(date: Date | { toDate: () => Date } | string): string {
    if (!date) return '';

    const dateObj = typeof date === 'string'
        ? new Date(date)
        : date instanceof Date
            ? date
            : date.toDate();

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj);
}

/**
 * Get color class for task status
 */
export function getStatusColor(status: TaskStatus): string {
    switch (status) {
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Completed':
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

/**
 * Get color class for task priority
 */
export function getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
        case 'High':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'Medium':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Low':
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if a date is in the past (overdue)
 */
export function isOverdue(deadline: Date | { toDate: () => Date } | string): boolean {
    try {
        if (!deadline) return false;

        let deadlineDate: Date;

        if (typeof deadline === 'string') {
            deadlineDate = new Date(deadline);
        } else if (deadline instanceof Date) {
            deadlineDate = deadline;
        } else if (typeof (deadline as any).toDate === 'function') {
            deadlineDate = (deadline as any).toDate();
        } else if ((deadline as any).seconds) {
            deadlineDate = new Date((deadline as any).seconds * 1000);
        } else {
            return false;
        }

        return deadlineDate < new Date();
    } catch (e) {
        return false;
    }
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
