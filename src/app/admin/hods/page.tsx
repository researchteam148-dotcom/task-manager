'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllHoDs } from '@/lib/db/users';
import { DEPARTMENTS } from '@/lib/constants';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { Select } from '@/components/ui/select';

export default function ManageHoDsPage() {
    const { user, firebaseUser } = useAuth();
    const [hods, setHoDs] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        empId: '',
        department: '',
        password: '',
    });

    const loadHoDs = async () => {
        setIsLoading(true);
        try {
            const data = await getAllHoDs();
            setHoDs(data);
        } catch (err) {
            console.error('Error loading HoDs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHoDs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) return;

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const idToken = await firebaseUser.getIdToken();

            const response = await fetch('/api/admin/create-hod', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    ...formData,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create HoD account');
            }

            setSuccess(`HoD for ${formData.department} created successfully!`);
            setFormData({
                name: '',
                email: '',
                empId: '',
                department: '',
                password: '',
            });
            loadHoDs(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && hods.length === 0) {
        return <Loading />;
    }

    if (user?.role !== 'dean') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
                <p className="text-gray-600 mt-2">Only Deans can access this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage HoDs</h1>
                <p className="text-gray-600 mt-1">Appoint Heads of Departments and manage assignments</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add HoD Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <span>👔</span> Appoint New HoD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg">
                                    {success}
                                </div>
                            )}

                            <Input
                                label="Full Name"
                                placeholder="e.g. Dr. Alice Wand"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Employee ID"
                                placeholder="e.g. HOD-CS-01"
                                value={formData.empId}
                                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="alice.wand@college.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <Select
                                label="Department"
                                placeholder="Select Department"
                                options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            />
                            <p className="text-[10px] text-gray-500 italic -mt-2 mb-2">
                                * Only one HoD per department allowed.
                            </p>

                            <Input
                                label="Temporary Password"
                                type="text"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isSubmitting}
                                variant="primary"
                            >
                                Appoint HoD
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* HoD List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Current Heads of Departments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 italic">
                                        <th className="py-3 px-2 text-xs font-bold text-gray-400 uppercase">Name</th>
                                        <th className="py-3 px-2 text-xs font-bold text-gray-400 uppercase">Emp ID</th>
                                        <th className="py-3 px-2 text-xs font-bold text-gray-400 uppercase">Dept</th>
                                        <th className="py-3 px-2 text-xs font-bold text-gray-400 uppercase text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hods.map((user) => (
                                        <tr key={user.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600 font-mono">
                                                {user.empId}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600">
                                                <Badge variant="High" className="rounded-md">{user.department}</Badge>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <Badge variant="success" className="text-[10px]">Active</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {hods.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                No HoDs appointed yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
