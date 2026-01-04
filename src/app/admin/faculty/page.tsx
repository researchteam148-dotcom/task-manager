'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllFaculty } from '@/lib/db/users';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';

export default function FacultyManagementPage() {
    const { firebaseUser } = useAuth();
    const [faculty, setFaculty] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        empId: '',
        department: '',
        tempPassword: '',
    });

    const loadFaculty = async () => {
        setIsLoading(true);
        try {
            const data = await getAllFaculty();
            setFaculty(data);
        } catch (err) {
            console.error('Error loading faculty:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFaculty();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) return;

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const idToken = await firebaseUser.getIdToken();

            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    empId: formData.empId,
                    department: formData.department,
                    password: formData.tempPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create faculty account');
            }

            setSuccess(`Faculty account for ${formData.name} created successfully!`);
            setFormData({
                name: '',
                email: '',
                empId: '',
                department: '',
                tempPassword: '',
            });
            loadFaculty(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && faculty.length === 0) {
        return <Loading />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
                <p className="text-gray-600 mt-1">Add and manage faculty user accounts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Faculty Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <span>👤</span> Add New Faculty
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
                                placeholder="e.g. Dr. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Employee ID"
                                placeholder="e.g. EMP123"
                                value={formData.empId}
                                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john.doe@college.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Department"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            />
                            <Input
                                label="Temporary Password"
                                type="text"
                                placeholder="Minimum 6 characters"
                                value={formData.tempPassword}
                                onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                                required
                            />

                            <p className="text-[10px] text-gray-500 italic">
                                * The faculty member will be required to change this password on their first login.
                            </p>

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isSubmitting}
                                variant="primary"
                            >
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Faculty List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Existing Faculty Members</CardTitle>
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
                                    {faculty.map((user) => (
                                        <tr key={user.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600 font-mono">
                                                {user.empId}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600">
                                                {user.department}
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                {user.requiresPasswordChange ? (
                                                    <Badge variant="Pending" className="text-[10px]">Pending PW Change</Badge>
                                                ) : (
                                                    <Badge variant="success" className="text-[10px]">Active</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {faculty.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                No faculty members found.
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
