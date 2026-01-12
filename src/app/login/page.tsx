'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { user, error: signInError } = await signIn(email, password);

            if (signInError) {
                setError(signInError);
                setIsLoading(false);
                return;
            }

            if (user) {
                // Redirect based on role
                if (user.role === 'admin' || user.role === 'dean') {
                    router.push('/admin');
                } else {
                    router.push('/faculty');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Task Planner
                    </h1>
                    <p className="text-gray-600">
                        Departmental Staff Management System
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle>Sign In to Your Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Sign In with Email
                            </Button>
                        </form>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
