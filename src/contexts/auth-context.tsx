'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';
import { getCurrentUser, onAuthChange } from '@/lib/auth';
import { subscribeToUser } from '@/lib/db/users';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    isAdmin: boolean;
    isFaculty: boolean;
    isDean: boolean;
    isHoD: boolean;
    requiresPasswordChange: boolean;
    isOtpVerified: boolean;
    setOtpVerified: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    isAdmin: false,
    isFaculty: false,
    isDean: false,
    isHoD: false,
    requiresPasswordChange: false,
    isOtpVerified: false,
    setOtpVerified: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOtpVerified, setIsOtpVerified] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('otpVerified') === 'true';
        }
        return false;
    });

    const setOtpVerified = (status: boolean) => {
        setIsOtpVerified(status);
        if (typeof window !== 'undefined') {
            if (status) {
                localStorage.setItem('otpVerified', 'true');
            } else {
                localStorage.removeItem('otpVerified');
            }
        }
    };

    useEffect(() => {
        let unsubscribeUser: (() => void) | null = null;

        const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setFirebaseUser(firebaseUser);

                // Set up real-time listener for user profile
                if (unsubscribeUser) unsubscribeUser();

                unsubscribeUser = subscribeToUser(firebaseUser.uid, (userData) => {
                    setUser(userData);
                    setLoading(false);
                });
            } else {
                if (unsubscribeUser) unsubscribeUser();
                unsubscribeUser = null;
                setUser(null);
                setFirebaseUser(null);
                setOtpVerified(false); // Reset OTP on sign out
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
        };
    }, []);

    const value: AuthContextType = {
        user,
        firebaseUser,
        loading,
        isAdmin: user?.role === 'admin' || user?.role === 'dean', // Both can access admin routes
        isFaculty: user?.role === 'faculty',
        isDean: user?.role === 'dean',
        isHoD: user?.role === 'admin', // Only original admins are HoDs
        requiresPasswordChange: !!user?.requiresPasswordChange,
        isOtpVerified,
        setOtpVerified,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
