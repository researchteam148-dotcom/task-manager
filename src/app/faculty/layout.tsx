'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['faculty']}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}
