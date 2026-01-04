'use client';

import React, { useState } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar onMenuClickAction={() => setIsMobileMenuOpen(true)} />

            <div className="flex flex-1 relative">
                <Sidebar />
                <MobileNav
                    isOpen={isMobileMenuOpen}
                    onCloseAction={() => setIsMobileMenuOpen(false)}
                />

                <main className="flex-1 w-full lg:max-w-[calc(100vw-288px)] min-h-[calc(100vh-64px)] overflow-x-hidden">
                    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
