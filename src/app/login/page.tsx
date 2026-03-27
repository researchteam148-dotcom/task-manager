'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, firebaseUser, isOtpVerified, setOtpVerified, loading: authLoading } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const otpSentRef = useRef(false);

    // If already verified and logged in, redirect away from login
    useEffect(() => {
        if (!authLoading && user && isOtpVerified) {
            if (user.role === 'admin' || user.role === 'dean') {
                router.push('/admin');
            } else {
                router.push('/faculty');
            }
        }
    }, [user, isOtpVerified, authLoading, router]);

    // If user is logged in but NOT verified, show OTP screen
    useEffect(() => {
        if (!authLoading && user && !isOtpVerified) {
            setShowOtp(true);
            // Automatically send OTP if we haven't yet
            if (!isSendingOtp && !error && !otpSentRef.current) {
                otpSentRef.current = true;
                handleSendOtp();
            }
        } else if (!user) {
            // Reset the ref if user logs out
            otpSentRef.current = false;
        }
    }, [user, isOtpVerified, authLoading, error, isSendingOtp]);

    const handleSendOtp = async () => {
        if (!firebaseUser) return;
        
        setIsSendingOtp(true);
        setError('');
        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to send OTP');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) return;

        setError('');
        setIsLoading(true);

        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otp })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Invalid OTP');
            }

            // OTP verified successfully
            setOtpVerified(true);
            // Redirect will be handled by the useEffect
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { user: loggedInUser, error: signInError } = await signIn(email, password);

            if (signInError) {
                setError(signInError);
                setIsLoading(false);
                return;
            }

            // Successfully authenticated with Firebase
            // But we don't redirect yet; the useEffect will trigger handleSendOtp
            setIsLoading(false);
        } catch (err) {
            setError('An unexpected error occurred');
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/images/aditya-logo.webp"
                            alt="Aditya University"
                            width={150}
                            height={150}
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Task Planner
                    </h1>
                    <p className="text-gray-600">
                        Departmental Staff Management System
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle>
                            {showOtp ? 'Two-Step Verification' : 'Sign In to Your Account'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {authLoading ? (
                            <div className="py-8 flex justify-center">
                                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : showOtp ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600">
                                        We've sent a 6-digit verification code to
                                    </p>
                                    <p className="font-bold text-gray-900">{user?.email}</p>
                                </div>

                                <Input
                                    label="Verification Code"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    disabled={isLoading}
                                    className="text-center text-2xl tracking-[1em] font-mono"
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
                                    disabled={otp.length !== 6}
                                >
                                    Verify & Continue
                                </Button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp || isLoading}
                                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
                                    >
                                        {isSendingOtp ? 'Sending...' : "Didn't receive code? Resend"}
                                    </button>
                                </div>
                            </form>
                        ) : (
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
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
