'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Smart redirect if already logged in
            if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/faculty');
            }
        }
    }, [user, loading, router]);

    // Show a clean loading state or nothing while checking auth
    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>;
    }

    // If logged in, we'll be redirecting, but render the shell briefly for smooth transition
    if (user) return null;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📝</span>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">Task Planner</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">Features</a>
                            <a href="#solutions" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">Solutions</a>
                            <Link href="/login">
                                <Button variant="primary" className="shadow-lg shadow-primary-200">Sign In</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="relative z-10 text-center lg:text-left">
                                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-primary-700 uppercase bg-primary-50 rounded-full">
                                    Revolutionizing Staff Management
                                </span>
                                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight mb-8">
                                    Efficiency in every <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Assignment.</span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                    The ultimate departmental staff management system designed for agility, clarity, and performance.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link href="/login" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full h-14 px-8 text-lg shadow-xl shadow-primary-200">
                                            Get Started Free
                                        </Button>
                                    </Link>
                                    <a href="#features" className="w-full sm:w-auto">
                                        <Button variant="outline" size="lg" className="w-full h-14 px-8 text-lg">
                                            View Features
                                        </Button>
                                    </a>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-primary-200 to-indigo-200 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                                    <Image
                                        src="/images/hero.png"
                                        alt="Task Management Dashboard"
                                        width={800}
                                        height={800}
                                        className="w-full h-auto object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Everything you need to <br />manage effectively.</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">Powerful tools built for departmental administrators and faculty members.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📋</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Allocation</h3>
                                <p className="text-gray-500 leading-relaxed">Automated task distribution based on department goals and faculty availability.</p>
                            </div>
                            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Auto Substitution</h3>
                                <p className="text-gray-500 leading-relaxed">Instant substitute suggestions when faculty report absence, ensuring uninterrupted learning.</p>
                            </div>
                            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📊</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
                                <p className="text-gray-500 leading-relaxed">Comprehensive dashboards for tracking workload, leave history, and performance metrics.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Solutions Section */}
                <section id="solutions" className="py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 text-lg">For Administrators</h4>
                                            <p className="text-gray-500">Monitor overall productivity, manage leave requests, and ensure curriculum delivery.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">✓</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 text-lg">For Faculty</h4>
                                            <p className="text-gray-500">View tasks, manage routines, and report absences with automated substitution workflows.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">Tailored solutions for every member.</h2>
                                <p className="text-lg text-gray-600 mb-8">We understand the complexities of departmental management. That's why we built a system that adapts to your unique workflow.</p>
                                <Link href="/login">
                                    <Button variant="outline" className="h-12 px-6">Explore the Portal</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="bg-primary-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary-200">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 relative z-10">Start optimizing your <br />department today.</h2>
                            <Link href="/login" className="relative z-10">
                                <Button size="lg" className="h-14 px-10 bg-white text-primary-600 hover:bg-gray-50 border-0 text-lg shadow-xl">
                                    Sign In to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                                <span className="text-2xl">📝</span>
                                <span className="text-xl font-black text-gray-900 tracking-tighter">Task Planner</span>
                            </div>
                            <p className="text-gray-500 max-w-sm mx-auto md:mx-0">Empowering educational departments with modern management tools.</p>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-900 mb-4">Product</h5>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-primary-600">Features</a></li>
                                <li><a href="#" className="hover:text-primary-600">Solutions</a></li>
                                <li><a href="#" className="hover:text-primary-600">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-900 mb-4">Company</h5>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-primary-600">About</a></li>
                                <li><a href="#" className="hover:text-primary-600">Contact</a></li>
                                <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Task Planner. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
