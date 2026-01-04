'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
    className?: string;
    fullPage?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function Loading({ className, fullPage, size = 'md' }: LoadingProps) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const loader = (
        <div className={cn(
            'animate-spin rounded-full border-primary-500 border-t-transparent',
            sizeClasses[size],
            className
        )} />
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
                {loader}
                <p className="text-sm font-medium text-gray-500 animate-pulse">
                    Loading account details...
                </p>
            </div>
        );
    }

    return loader;
}

export function LoadingSpinner({ className }: { className?: string }) {
    return <Loading className={className} />;
}

export function LoadingPage() {
    return <Loading fullPage />;
}
