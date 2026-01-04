'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { LeaveRequest } from '@/types';
import { requestLeave, subscribeToFacultyLeaves } from '@/lib/db/leaves';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function FacultyLeavesPage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToFacultyLeaves(user.uid, (data) => {
            setLeaves(data);
        });
        return () => unsubscribe();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            await requestLeave(
                user.uid,
                user.name,
                formData.startDate,
                formData.endDate,
                formData.reason
            );
            setFormData({ startDate: '', endDate: '', reason: '' });
        } catch (error) {
            console.error('Error submitting leave:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Submit and track your leave requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submit Request Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📝</span> New Leave Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                            />
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Reason</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-h-[100px]"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                    placeholder="Explain the reason for your leave..."
                                />
                            </div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Leave History */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>My Leave History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaves.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">No leave requests found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaves.map((leave) => (
                                    <div key={leave.id} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                                            </div>
                                            <Badge variant={leave.status === 'pending' ? 'Pending' : leave.status === 'approved' ? 'Completed' : 'High'}>
                                                {leave.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        {leave.adminComment && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                                <p className="text-xs font-bold text-gray-600 uppercase">Admin Feedback</p>
                                                <p className="text-sm text-gray-700 mt-1 italic">{leave.adminComment}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
