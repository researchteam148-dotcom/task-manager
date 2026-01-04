import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    ref={ref}
                    className={cn(
                        'block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300',
                        props.disabled && 'bg-gray-50 cursor-not-allowed',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
