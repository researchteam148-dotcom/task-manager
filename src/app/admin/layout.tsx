'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}
