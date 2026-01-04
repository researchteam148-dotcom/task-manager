'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loading } from '@/components/ui/loading';

export function ForcedPasswordWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading, requiresPasswordChange } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && user && requiresPasswordChange && pathname !== '/change-password') {
            router.push('/change-password');
        }
    }, [user, loading, requiresPasswordChange, pathname, router]);

    // If loading or redirecting, show nothing or a loader
    if (!loading && user && requiresPasswordChange && pathname !== '/change-password') {
        return <Loading fullPage />;
    }

    return <>{children}</>;
}
