'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { updateUser } from '@/lib/db/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChangePasswordPage() {
    const { user, firebaseUser } = useAuth();
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser || !user) return;

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Update password in Firebase Auth
            await firebaseUpdatePassword(firebaseUser, newPassword);

            // 2. Update flag in Firestore
            await updateUser(user.uid, {
                requiresPasswordChange: false,
            });

            // 3. Redirect to dashboard
            const dashboardPath = user.role === 'admin' ? '/admin' : '/faculty';
            console.log('Password changed successfully, redirecting to:', dashboardPath);
            router.push(dashboardPath);
            router.refresh();
        } catch (err: any) {
            console.error('Error changing password:', err);
            setError(err.message || 'Failed to update password. You may need to login again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md animate-fade-in shadow-xl border-none">
                <CardHeader className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-3xl text-primary-600">🔐</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Change Your Password</CardTitle>
                    <p className="text-sm text-gray-500">
                        For security reasons, you must change your temporary password to continue.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <Input
                            label="New Password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="Type it again"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full"
                                variant="primary"
                                isLoading={isLoading}
                            >
                                Update Password & Continue
                            </Button>
                        </div>

                        <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                            Security Requirement
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
