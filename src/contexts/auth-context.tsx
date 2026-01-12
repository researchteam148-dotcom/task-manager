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
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

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
